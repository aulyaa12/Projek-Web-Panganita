import { NextResponse } from "next/server";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  searchKnowledgeBase,
  getFallbackResponse,
  getSourceMetadata,
} from "@/lib/ragKnowledge";

import { normalizeDialectText } from "@/lib/dialectNormalizer";

import {
  formatRegionTime,
  extractLocationFromText,
} from "@/lib/regionTimezone";

// ==================================================
// KONFIGURASI
// ==================================================

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const STANDARD_MEDICAL_DISCLAIMER =
  "⚠️ Penafian Medis: Bu Nita AI adalah asisten edukasi gizi dan bukan pengganti diagnosis dokter. Tindakan medis harus selalu dikonfirmasikan dengan tenaga kesehatan di fasilitas kesehatan setempat.";

function normalizeStoredSources(rawSources) {
  if (!Array.isArray(rawSources)) return [];

  return rawSources.map((src) => {
    if (typeof src === "string") return src;

    const page = Number(src?.page);
    if (Number.isFinite(page)) {
      const meta = getSourceMetadata(page);
      return {
        ...meta,
        ...src,
        title:
          src?.title && !/^Halaman\s+\d+$/i.test(src.title.trim())
            ? src.title
            : meta.title,
        source: src?.source || meta.source,
      };
    }

    return src;
  });
}

const MAX_MESSAGE_LENGTH = 8000;
const MAX_AUDIO_LENGTH = 14 * 1024 * 1024;

class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

// ==================================================
// SUPABASE ADMIN CLIENT
// Hanya digunakan di server.
// ==================================================

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new ApiError("Konfigurasi Supabase Server belum lengkap.", 500);
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// ==================================================
// AUTENTIKASI DAN PROFIL PENGGUNA
// ==================================================


async function getUserContext() {
  // 1. Buat client berdasarkan sesi login pengguna.
  const sessionClient = await createSessionClient();

  // 2. Verifikasi identitas pengguna.
  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser();

  if (authError || !user) {
    throw new ApiError(
      "Sesi login tidak ditemukan. Silakan login kembali.",
      401,
    );
  }

  // 3. Ambil profil menggunakan Session Client.
  // RLS profil_keluarga mengizinkan pengguna
  // membaca profil miliknya sendiri.
  const { data: profil, error: profilError } = await sessionClient
    .from("profil_keluarga")
    .select("id, user_id, nama_ibu, provinsi, kabupaten_kota")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profilError) {
    console.error("DETAIL ERROR PROFIL:", {
      code: profilError.code,
      message: profilError.message,
      details: profilError.details,
      hint: profilError.hint,
    });

    throw new ApiError("Gagal membaca data profil keluarga.", 500);
  }

  if (!profil) {
    throw new ApiError(
      "Profil keluarga belum ditemukan. Silakan lengkapi profil.",
      403,
    );
  }

  // 4. Buat Admin Client setelah identitas dan
  // kepemilikan profil berhasil diverifikasi.
  const supabase = createAdminClient();

  return {
    supabase,
    sessionClient,
    user,
    profil,
  };
}

// ==================================================
// GEMINI API
// ==================================================

const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite-preview",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

async function invokeGeminiModel(model, parts, options, apiKey, withThinkingConfig) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeout || 25000,
  );

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const generationConfig = {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxOutputTokens || 1400,
      ...(withThinkingConfig
        ? { thinkingConfig: { thinkingBudget: 0 } }
        : {}),
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: result?.error?.message || "Unknown error",
      };
    }

    const text =
      result?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n")
        .trim() || null;

    return { ok: Boolean(text), status: response.status, text };
  } catch (error) {
    return { ok: false, status: 0, message: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function generateGeminiDetailed(parts, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  if (!apiKey) {
    return null;
  }

  const candidates = [...new Set([MODEL_NAME, ...GEMINI_FALLBACK_MODELS])];

  for (const model of candidates) {
    let attempt = await invokeGeminiModel(model, parts, options, apiKey, true);

    if (!attempt.ok && attempt.status === 400) {
      // Sebagian model alias (seperti gemini-flash-lite-latest) tidak menerima thinkingConfig
      attempt = await invokeGeminiModel(model, parts, options, apiKey, false);
    }

    if (attempt.ok && attempt.text) {
      return { text: attempt.text, model };
    }

    console.warn(
      `Gemini model ${model} gagal (${attempt.status}):`,
      attempt.message || "Empty response",
    );
  }

  return null;
}

async function generateGemini(parts, options = {}) {
  const result = await generateGeminiDetailed(parts, options);
  return result?.text || null;
}

// ==================================================
// TRANSKRIPSI SUARA
// Audio tidak disimpan. Hanya transkrip teks.
// ==================================================

async function transcribeAudio(audioBase64, mimeType) {
  if (!audioBase64) {
    return null;
  }

  if (audioBase64.length > MAX_AUDIO_LENGTH) {
    throw new ApiError("Ukuran rekaman suara terlalu besar.", 413);
  }

  let normalizedMime = String(mimeType || "audio/webm")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (normalizedMime === "audio/x-m4a") {
    normalizedMime = "audio/mp4";
  } else if (normalizedMime === "video/webm") {
    normalizedMime = "audio/webm";
  }

  const allowedAudioTypes = [
    "audio/webm",
    "audio/mp4",
    "audio/wav",
    "audio/mpeg",
    "audio/ogg",
  ];

  if (!allowedAudioTypes.includes(normalizedMime)) {
    throw new ApiError("Format rekaman suara tidak didukung.", 415);
  }

  const cleanBase64 = String(audioBase64)
    .replace(/^data:.*?;base64,/i, "")
    .replace(/\s+/g, "");

  if (!cleanBase64) {
    throw new ApiError("Data rekaman suara kosong. Silakan coba lagi.", 400);
  }

  const transcript = await generateGemini(
    [
      {
        text:
          "Dengarkan rekaman suara ibu rumah tangga di Indonesia (bisa berbahasa " +
          "Indonesia atau dialek daerah seperti Sunda, Jawa, Papua, Minang, " +
          "Makassar, Banjar, Batak, Bali, atau NTT). Transkripsikan ucapan " +
          "pengguna secara akurat dengan mempertahankan kata-kata dan dialek " +
          "aslinya. Keluarkan HANYA hasil transkripsi tanpa tanda kutip dan " +
          "tanpa penjelasan tambahan.",
      },
      {
        inlineData: {
          mimeType: normalizedMime,
          data: cleanBase64,
        },
      },
    ],
    {
      temperature: 0,
      maxOutputTokens: 800,
      timeout: 30000,
    },
  );

  if (!transcript) {
    throw new ApiError(
      "Rekaman suara gagal ditranskripsikan. Silakan coba lagi.",
      502,
    );
  }

  return transcript;
}

// ==================================================
// GET: MEMUAT RIWAYAT CHAT
// ==================================================

export async function GET() {
  try {
    const { supabase, profil } = await getUserContext();

    const lokasi = [profil.kabupaten_kota, profil.provinsi]
      .filter(Boolean)
      .join(", ");

    const { data: percakapan, error: errPercakapan } = await supabase
      .from("percakapan")
      .select("id, judul, dibuat_pada, diperbarui_pada")
      .eq("profil_id", profil.id)
      .eq("diarsipkan", false)
      .order("diperbarui_pada", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (errPercakapan) {
      throw new ApiError("Riwayat percakapan gagal dimuat.");
    }

    if (!percakapan) {
      return NextResponse.json({
        success: true,
        data: {
          conversationId: null,
          location: lokasi,
          messages: [],
        },
      });
    }

    const { data: pesan, error: errPesan } = await supabase
      .from("pesan_chat")
      .select("id, peran, isi, sumber_rujukan, dibuat_pada")
      .eq("percakapan_id", percakapan.id)
      .order("dibuat_pada", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (errPesan) {
      console.error("Gagal mengambil pesan:", errPesan);

      throw new ApiError("Pesan percakapan gagal dimuat.");
    }

    const messages = (pesan || [])
      .filter((item) => item.peran !== "sistem")
      .map((item) => ({
        id: String(item.id),

        role: item.peran === "pengguna" ? "user" : "assistant",

        content: item.isi,

        sources: normalizeStoredSources(item.sumber_rujukan),

        time: formatRegionTime(new Date(item.dibuat_pada), lokasi),
      }));

    return NextResponse.json({
      success: true,
      data: {
        conversationId: percakapan.id,
        location: lokasi,
        messages,
      },
    });
  } catch (error) {
    console.error("GET Chat Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memuat percakapan.",
      },
      {
        status: error.status || 500,
      },
    );
  }
}

// ==================================================
// POST: MEMBUAT PERCAKAPAN / MENGIRIM PESAN
// ==================================================

export async function POST(request) {
  let supabase = null;
  let profil = null;

  let conversationCreatedHere = false;
  let createdConversationId = null;

  try {
    const body = await request.json().catch(() => ({}));

    const context = await getUserContext();

    supabase = context.supabase;
    profil = context.profil;

    // ----------------------------------------------
    // MEMBUAT PERCAKAPAN BARU
    // ----------------------------------------------

    if (body.action === "new") {
      const { data, error } = await supabase
        .from("percakapan")
        .insert({
          profil_id: profil.id,
          judul: null,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("Gagal membuat percakapan:", error);

        throw new ApiError("Percakapan baru gagal dibuat.");
      }

      return NextResponse.json({
        success: true,
        data: {
          conversationId: data.id,
        },
      });
    }

    // ----------------------------------------------
    // VALIDASI PESAN DAN AUDIO
    // ----------------------------------------------

    let rawMessage =
      typeof body.message === "string" ? body.message.trim() : "";

    // Jika teks kosong tetapi ada rekaman,
    // lakukan transkripsi terlebih dahulu.
    if (!rawMessage && body.audioBase64) {
      rawMessage = await transcribeAudio(
        body.audioBase64,
        body.mimeType || "audio/webm",
      );
    }

    if (!rawMessage) {
      throw new ApiError("Pesan atau rekaman suara tidak boleh kosong.", 400);
    }

    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      throw new ApiError("Pesan maksimal 8.000 karakter.", 400);
    }

    // ----------------------------------------------
    // VERIFIKASI PERCAKAPAN
    // ----------------------------------------------

    let percakapan = null;

    if (body.conversationId) {
      const { data, error } = await supabase
        .from("percakapan")
        .select("id, judul")
        .eq("id", body.conversationId)
        .eq("profil_id", profil.id)
        .eq("diarsipkan", false)
        .maybeSingle();

      if (error || !data) {
        throw new ApiError("Percakapan tidak ditemukan.", 404);
      }

      percakapan = data;
    }

    // ----------------------------------------------
    // BUAT PERCAKAPAN JIKA BELUM ADA
    // ----------------------------------------------

    if (!percakapan) {
      const judul = rawMessage.replace(/\s+/g, " ").slice(0, 120);

      const { data, error } = await supabase
        .from("percakapan")
        .insert({
          profil_id: profil.id,
          judul,
        })
        .select("id, judul")
        .single();

      if (error || !data) {
        console.error("Gagal membuat percakapan:", error);

        throw new ApiError("Percakapan gagal dibuat.");
      }

      percakapan = data;

      conversationCreatedHere = true;
      createdConversationId = data.id;
    }

    // ----------------------------------------------
    // DATA PENGGUNA DAN LOKASI
    // ----------------------------------------------

    const motherName = profil.nama_ibu ? `Ibu ${profil.nama_ibu}` : "Ibu";

    const lokasiProfil = [profil.kabupaten_kota, profil.provinsi]
      .filter(Boolean)
      .join(", ");

    const extractedLocation = extractLocationFromText(rawMessage);

    const clientLocation = extractedLocation || lokasiProfil || "Indonesia";

    // ----------------------------------------------
    // 1. NORMALISASI DIALEK
    // ----------------------------------------------

    const dialectInfo = normalizeDialectText(rawMessage);

    const searchTarget = dialectInfo.normalizedText || rawMessage;

    // ----------------------------------------------
    // 2. RETRIEVAL KNOWLEDGE BASE & RIWAYAT SINGKAT
    // ----------------------------------------------

    let historyContext = "";

    if (!conversationCreatedHere && percakapan?.id) {
      const { data: recentRows } = await supabase
        .from("pesan_chat")
        .select("peran, isi")
        .eq("percakapan_id", percakapan.id)
        .in("peran", ["pengguna", "asisten"])
        .order("dibuat_pada", { ascending: false })
        .limit(6);

      if (recentRows?.length > 0) {
        const formattedHistory = recentRows
          .slice()
          .reverse()
          .map((item) => {
            const label = item.peran === "pengguna" ? motherName : "Bu Nita AI";
            const snippet = String(item.isi || "")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 350);
            return `${label}: ${snippet}`;
          })
          .join("\n");

        historyContext = `\nRIWAYAT PERCAKAPAN SEBELUMNYA (untuk menjaga konteks lanjutan):\n${formattedHistory}\n`;
      }
    }

    const retrievedChunks = searchKnowledgeBase(searchTarget, 3) || [];

    const contextText = retrievedChunks
      .map(
        (chunk) =>
          `[Referensi Buku Panduan Panganita - Halaman ${chunk.page}${chunk.title ? ` (${chunk.title})` : ""}]:\n${chunk.text}`,
      )
      .join("\n\n");

    const sourcePages = [
      ...new Set(
        retrievedChunks
          .map((chunk) => Number(chunk.page))
          .filter(Number.isFinite),
      ),
    ].sort((a, b) => a - b);

    // ----------------------------------------------
    // 3. CATATAN DIALEK
    // ----------------------------------------------

    const dialectNotes = dialectInfo.isDialectDetected
      ? `
DETEKSI DIALEK DAERAH PENGGUNA (DARI PESAN TERBARU):
- Wilayah/Dialek Terdeteksi: ${dialectInfo.detectedDialects.join(", ")}
- Sapaan Daerah yang Cocok: ${dialectInfo.greetings}
- Kata Kunci Gizi Hasil Normalisasi: "${dialectInfo.normalizedText}"
- Komoditas Disebut: ${dialectInfo.localCommodities.join(", ") || "Pangan pekarangan umum"}
- Lokasi Domisili Profil Ibu: ${lokasiProfil || "Indonesia"}
- INSTRUKSI KHUSUS: Balas menggunakan bahasa/dialek ${dialectInfo.detectedDialects[0]} yang santun dan natural (meskipun lokasi domisili profil berbeda daerah), sambil tetap menjaga istilah takaran gizi & rujukan yang jelas.
`
      : `
KONTEKS PROFIL & BAHASA:
- Lokasi Domisili Profil Ibu: ${lokasiProfil || "Indonesia"}
- Jika pertanyaan terbaru menggunakan bahasa/dialek daerah tertentu (Sunda, Papua, Jawa, Minang, Bugis/Makassar, Banjar, Batak, Bali, NTT), jawablah mengikuti bahasa/dialek pesan terbaru tersebut. Jika Bahasa Indonesia, jawab dalam Bahasa Indonesia yang hangat.
`;

    // ----------------------------------------------
    // 4. SYSTEM PROMPT BU NITA (SELARAS PRAW-PANGANITA + ADAPTIF DIALEK)
    // ----------------------------------------------

    const systemPrompt = `Anda adalah Bu Nita AI, sahabat gizi keluarga terpercaya dari platform Panganita untuk lokus pencegahan stunting di Teluk Bintuni, Papua Barat, dan mendampingi ibu-ibu di seluruh pelosok Indonesia.

LANDASAN PENGETAHUAN RESMI (RAG KNOWLEDGE BASE):
${contextText}
${dialectNotes}${historyContext}

PEDOMAN PEMAHAMAN & BALASAN MULTIDIALEK NUSANTARA:

1. PEMAHAMAN MULTIDIALEK:
Ibu-ibu pengguna Panganita berasal dari berbagai penjuru desa di Indonesia dan bisa sedang merantau. Mereka mungkin berbicara dengan dialek Papua (Teluk Bintuni/Sorong/Manokwari), Sunda (Banten/Jabar), Jawa (Jateng/Jatim/Banyumas), Minang, Bugis/Makassar, Banjar, Batak, Bali, atau NTT.

2. PENERJEMAHAN ISTILAH LOKAL KE KONTEKS GIZI:
- Jika ibu mengeluh anak 'tra mau makan / embung tuang / mboten purun nedha / indak namuah / teai manre / kada hakun', pahami ini sebagai Gerakan Tutup Mulut (GTM) atau anak sedang kehilangan nafsu makan.
- Jika ibu menyebut 'panas tiris / awake anget / dingin manggigia / mamburisi / panas awak', pahami ini sebagai kondisi anak demam/meriang yang membutuhkan asupan cairan, sup hangat, dan elektrolit.
- Jika ibu menyebut pangan lokal pekarangan (lele, kembung, tongkol, kasbi/singkong, petatas/ubi, sagu/papeda, sayur lompong, daun kelor/marungga, buah naga, bayam, kangkung, udang, telur, pisang, tomat, wortel, jagung), sambut dengan penuh apresiasi dan jelaskan nilai gizinya sesuai usia anak yang ditanyakan Ibu.

3. GAYA BAHASA & PENYESUAIAN BAHASA DAERAH JAWABAN:
- ADAPTASI BAHASA OTOMATIS: Jawablah mengikuti bahasa/dialek yang digunakan Ibu pada pertanyaan TERBARU (bukan dari lokasi profilnya maupun bahasa percakapan sebelumnya yang berbeda).
  * Jika pesan terbaru berbahasa Sunda: balas menggunakan Bahasa Sunda lemes yang santun, hangat, dan mudah dipahami (contoh sapaan: "Sampurasun Ibu..., mangga ku Bu Nita dijelaskeun...").
  * Jika pesan terbaru berdialek Papua: balas menggunakan dialek Papua/Teluk Bintuni yang hangat, ramah, dan akrab (contoh sapaan: "Halo Mama..., senang sekali bisa bantu Mama jaga tong pu anak...").
  * Jika pesan terbaru berbahasa Jawa/Minang/Bugis/Makassar/Banjar/Batak/Bali/NTT: sesuaikan sapaan dan gaya bertutur bahasa daerah tersebut secara santun dan natural.
  * Jika pesan terbaru berbahasa Indonesia: balas menggunakan Bahasa Indonesia yang sangat hangat, santun, ramah, dan menenangkan (no victim-blaming).
- Jika lokasi domisili profil ibu berada di wilayah tertentu (seperti ${lokasiProfil || "Indonesia"}), contoh pangan lokal yang disarankan dapat menyertakan bahan yang mudah ditemui di wilayah domisili tersebut dengan tetap bertutur memakai bahasa pesan ibu.
- Jawab TEPAT dan SPESIFIK sesuai pertanyaan pengguna (jangan memberi jawaban template yang melenceng). Jika ibu bertanya tentang anak usia tertentu (misal 2 atau 3 tahun) atau bahan tertentu (misal buah naga, daun jambu, atau ikan hiu), jawab spesifik bahan & usia tersebut terlebih dahulu!
- Awali dengan SATU kalimat sapaan hangat dan afirmasi positif singkat menggunakan emoji ramah.
- Jaga ketepatan istilah takaran gizi ('kkal', 'gram', 'mg', '1.000 HPK'), nama bahan pangan, dan rujukan agar tetap akurat dan tidak rancu.

4. FORMAT STRUKTUR WAJIB:
- Pisahkan setiap paragraf dengan dua kali enter agar rapi dan mudah dibaca di HP.
- Setiap poin bahan atau langkah resep diawali emoticon yang sesuai (misalnya 🐟, 🥬, 🥣, 💧, ✨).
- DILARANG menggunakan tanda bintang (* atau **) atau tanda pagar (#) dalam bentuk apa pun.
- DILARANG menyebut label internal seperti 'Dokumen 1', 'Dokumen 2', atau 'Kutipan'. Selalu sebut 'Buku Panduan Panganita Halaman ...'.
- Wajib tutup isi penjelasan dengan satu baris rujukan resmi persis berformat:
📚 Rujukan: Buku Panduan Panganita Halaman ${sourcePages.length > 0 ? sourcePages.join(", ") : "1"} & Standar AKG Kemenkes RI
- Akhiri SELALU setiap jawaban tanpa terpotong dengan baris penafian medis berikut:
${STANDARD_MEDICAL_DISCLAIMER}

5. BATASAN RUANG LINGKUP:
Jika pertanyaan di luar konteks gizi, kesehatan balita, pencegahan stunting 1.000 HPK, MPASI, atau ketahanan pangan pekarangan, tolak dengan santun dan arahkan kembali ke topik gizi keluarga PANGANITA.

6. PERTANYAAN DI LUAR 15 KOMODITAS PANGAN LOKAL:
Jika ibu menanyakan bahan yang tidak aman untuk balita (misalnya ikan hiu bermerkuri tinggi, makanan instan, minuman manis) atau bahan di luar 15 komoditas lokal, jelaskan keamanannya dan fakta gizinya secara objektif dengan lembut, lalu berikan alternatif konkret dan resep praktis dari pangan lokal pekarangan PANGANITA (seperti ikan tongkol, kembung, lele, daun kelor, bayam, singkong, ubi jalar, sagu, buah naga).`;

    // ----------------------------------------------
    // 5. GENERASI JAWABAN GEMINI
    // ----------------------------------------------

    let reply = "";
    let modelVersion = "rag-fallback";

    const generatedResult = await generateGeminiDetailed(
      [
        {
          text: systemPrompt,
        },
        {
          text:
            `Pertanyaan dari ${motherName}: "${rawMessage}"\n\n` +
            "Jawaban Bu Nita AI:",
        },
      ],
      {
        temperature: 0.3,
        maxOutputTokens: 1600,
      },
    );

    if (generatedResult?.text) {
      reply = generatedResult.text;
      modelVersion = generatedResult.model;
    }

    // ----------------------------------------------
    // 6. FALLBACK
    // ----------------------------------------------

    if (!reply) {
      reply = getFallbackResponse(rawMessage, motherName);

      if (!reply) {
        reply =
          "Maaf Ibu, layanan Bu Nita sedang mengalami gangguan. Silakan coba kembali beberapa saat lagi.";
      }
    }

    // ----------------------------------------------
    // 7. PEMBERSIHAN FORMAT & GUARDRAIL RUJUKAN/PENAFIAN
    // ----------------------------------------------

    reply = String(reply)
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/Hlm\./gi, "Halaman")
      .replace(/\bHlm\b/gi, "Halaman")
      .replace(/\b(?:Kutipan\s+)?Dokumen\s+\d+\s*(?:-|dan)?\s*/gi, "")
      .replace(/(?:^|\n)\s*Rujukan:/gi, "\n📚 Rujukan:")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!/📚\s*Rujukan:/i.test(reply)) {
      const pageLabel =
        sourcePages.length > 0 ? `Halaman ${sourcePages.join(", ")} ` : "";
      reply = `${reply}\n\n📚 Rujukan: Buku Panduan Panganita ${pageLabel}& Standar AKG Kemenkes RI`;
    }

    if (!/Penafian Medis:/i.test(reply)) {
      reply = `${reply}\n\n${STANDARD_MEDICAL_DISCLAIMER}`;
    }

    const currentTime = formatRegionTime(new Date(), clientLocation);

    // ----------------------------------------------
    // 8. SUMBER RUJUKAN
    // ----------------------------------------------

    const sumberRujukan = sourcePages.map((page) => getSourceMetadata(page));

    // ----------------------------------------------
    // 9. SIMPAN PESAN KE SUPABASE
    // Hanya transkrip teks yang disimpan.
    // ----------------------------------------------

    const { data: savedMessages, error: saveError } = await supabase
      .from("pesan_chat")
      .insert([
        {
          percakapan_id: percakapan.id,
          peran: "pengguna",
          isi: rawMessage,
        },
        {
          percakapan_id: percakapan.id,
          peran: "asisten",
          isi: reply,
          sumber_rujukan: sumberRujukan,
          model_versi: modelVersion,
        },
      ])
      .select("id, peran");

    if (saveError || !savedMessages || savedMessages.length !== 2) {
      console.error("DETAIL ERROR SUPABASE CHAT:", saveError);

      throw new ApiError("Pesan gagal disimpan ke riwayat.");
    }

    // ----------------------------------------------
    // 10. PERBARUI PERCAKAPAN
    // ----------------------------------------------

    const updateData = {
      diperbarui_pada: new Date().toISOString(),
    };

    if (!percakapan.judul) {
      updateData.judul = rawMessage.replace(/\s+/g, " ").slice(0, 120);
    }

    const { error: updateError } = await supabase
      .from("percakapan")
      .update(updateData)
      .eq("id", percakapan.id)
      .eq("profil_id", profil.id);

    if (updateError) {
      console.error("Gagal memperbarui percakapan:", updateError);
    }

    // ----------------------------------------------
    // 11. KIRIM HASIL KE FRONTEND
    // ----------------------------------------------

    const userRow = savedMessages.find((item) => item.peran === "pengguna");

    const assistantRow = savedMessages.find((item) => item.peran === "asisten");

    return NextResponse.json({
      success: true,

      data: {
        conversationId: percakapan.id,

        userMessageId: userRow?.id,

        assistantMessageId: assistantRow?.id,

        reply,

        sender: "Bu Nita AI",

        time: currentTime,

        location: clientLocation,

        sources: sumberRujukan,

        retrievedCount: retrievedChunks.length,

        model: modelVersion,

        transcript: rawMessage,

        dialect: {
          detected: dialectInfo.detectedDialects,
          isDialect: dialectInfo.isDialectDetected,
          normalizedQuery: dialectInfo.normalizedText,
          commodities: dialectInfo.localCommodities,
        },
      },
    });
  } catch (error) {
    console.error("Chat API Critical Error:", error);

    // Hapus percakapan baru jika penyimpanan pesan gagal.
    if (
      supabase &&
      profil &&
      conversationCreatedHere &&
      createdConversationId
    ) {
      const { error: deleteError } = await supabase
        .from("percakapan")
        .delete()
        .eq("id", createdConversationId)
        .eq("profil_id", profil.id);

      if (deleteError) {
        console.error("Gagal membersihkan percakapan:", deleteError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memproses pesan Bu Nita.",
      },
      {
        status: error.status || 500,
      },
    );
  }
}
