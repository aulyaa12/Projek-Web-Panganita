import { NextResponse } from "next/server";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { searchKnowledgeBase, getFallbackResponse } from "@/lib/ragKnowledge";

import { normalizeDialectText } from "@/lib/dialectNormalizer";

import {
  formatRegionTime,
  extractLocationFromText,
} from "@/lib/regionTimezone";

// ==================================================
// KONFIGURASI
// ==================================================

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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

async function generateGemini(parts, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    options.timeout || 25000,
  );

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],

        generationConfig: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxOutputTokens || 1400,
        },
      }),

      signal: controller.signal,
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "Gemini API Error:",
        response.status,
        result?.error?.message || "Unknown error",
      );

      return null;
    }

    return (
      result?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n")
        .trim() || null
    );
  } catch (error) {
    console.error("Gemini gagal:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
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

  const allowedAudioTypes = [
    "audio/webm",
    "audio/mp4",
    "audio/wav",
    "audio/mpeg",
    "audio/ogg",
  ];

  if (!allowedAudioTypes.includes(mimeType)) {
    throw new ApiError("Format rekaman suara tidak didukung.", 415);
  }

  const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");

  const transcript = await generateGemini(
    [
      {
        text:
          "Dengarkan rekaman suara berikut dan transkripsikan " +
          "ucapan pengguna secara akurat. Pertahankan kata-kata " +
          "dan dialek aslinya. Keluarkan hanya hasil transkripsi " +
          "tanpa penjelasan tambahan.",
      },
      {
        inlineData: {
          mimeType,
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

    const lokasi = [profil.kabupaten_kota, profil.provinsi]
      .filter(Boolean)
      .join(", ");

    const messages = (pesan || [])
      .filter((item) => item.peran !== "sistem")
      .map((item) => ({
        id: String(item.id),

        role: item.peran === "pengguna" ? "user" : "assistant",

        content: item.isi,

        sources: item.sumber_rujukan || [],

        time: formatRegionTime(new Date(item.dibuat_pada), lokasi),
      }));

    return NextResponse.json({
      success: true,
      data: {
        conversationId: percakapan.id,
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
    // 2. RETRIEVAL KNOWLEDGE BASE
    // ----------------------------------------------

    const retrievedChunks = searchKnowledgeBase(searchTarget, 3) || [];

    const contextText = retrievedChunks
      .map(
        (chunk, index) =>
          `[Kutipan Dokumen ${index + 1} - Halaman ${chunk.page}]:\n${chunk.text}`,
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
DETEKSI DIALEK DAERAH PENGGUNA:
- Wilayah/Dialek Terdeteksi: ${dialectInfo.detectedDialects.join(", ")}
- Kata Kunci Gizi Hasil Normalisasi: "${dialectInfo.normalizedText}"
- Komoditas Disebut: ${dialectInfo.localCommodities.join(", ") || "Pangan pekarangan umum"}
`
      : "";

    // ----------------------------------------------
    // 4. SYSTEM PROMPT BU NITA
    // Mempertahankan instruksi sistem lama.
    // ----------------------------------------------

    const systemPrompt = `Anda adalah Bu Nita AI, sahabat gizi keluarga terpercaya dari platform Panganita untuk lokus pencegahan stunting di Teluk Bintuni, Papua Barat, dan dapat mendampingi ibu-ibu di seluruh pelosok Indonesia.

LANDASAN PENGETAHUAN RESMI (RAG KNOWLEDGE BASE):
${contextText}
${dialectNotes}

PEDOMAN PEMAHAMAN DIALEK & BAHASA DAERAH NUSANTARA:

1. PEMAHAMAN MULTIDIALEK:
Ibu-ibu pengguna Panganita berasal dari berbagai penjuru desa di Indonesia. Mereka mungkin berbicara dengan dialek Papua (Teluk Bintuni/Sorong), Sunda (Banten/Jabar), Jawa (Jateng/Jatim/Banyumas), Minang, Bugis/Makassar, Banjar, Batak, Bali, atau NTT.

2. PENERJEMAHAN ISTILAH LOKAL KE KONTEKS GIZI:
- Jika ibu mengeluh anak 'tra mau makan / embung tuang / mboten purun nedha / indak namuah / teai manre / kada hakun', pahami ini sebagai Gerakan Tutup Mulut (GTM) atau anak sedang kehilangan nafsu makan.
- Jika ibu menyebut 'panas tiris / awake anget / dingin manggigia / mamburisi / panas awak', pahami ini sebagai kondisi anak demam/meriang yang membutuhkan asupan cairan, sup hangat, dan elektrolit.
- Jika ibu menyebut pangan lokal pekarangan (lele, kembung, tongkol, kasbi/singkong, petatas/ubi, sagu/papeda, sayur lompong, daun kelor/marungga), sambut dengan penuh apresiasi dan jelaskan nilai gizinya.

3. GAYA BAHASA JAWABAN:
- Gunakan Bahasa Indonesia yang sangat hangat, santun, ramah, dan menenangkan (tanpa menghakimi / no victim-blaming).
- Awali dengan SATU kalimat sapaan hangat dan afirmasi positif singkat menggunakan emoji ramah.

4. FORMAT STRUKTUR WAJIB:
- Pisahkan setiap paragraf dengan dua kali enter.
- Setiap poin bahan atau langkah resep diawali emoticon.
- Jangan menggunakan tanda bintang atau tanda pagar.
- Cantumkan rujukan resmi dengan tulisan 'Halaman' lengkap.
- Akhiri dengan penafian medis:
'⚠️ Penafian Medis: Bu Nita AI adalah asisten edukasi gizi dan bukan pengganti diagnosis dokter. Tindakan medis harus selalu dikonfirmasikan dengan tenaga kesehatan di fasilitas kesehatan setempat.'

5. BATASAN RUANG LINGKUP:
Jika pertanyaan di luar konteks gizi, kesehatan balita, pencegahan stunting 1.000 HPK, MPASI, atau ketahanan pangan pekarangan, tolak dengan santun dan arahkan kembali ke topik gizi keluarga PANGANITA.

6. PERTANYAAN DI LUAR 15 KOMODITAS PANGAN LOKAL:
Apresiasi pertanyaannya, jelaskan fakta gizi secara objektif, lalu hubungkan kembali dengan pangan lokal PANGANITA yang terjangkau dan padat gizi.`;

    // ----------------------------------------------
    // 5. GENERASI JAWABAN GEMINI
    // ----------------------------------------------

    let reply = "";
    let modelVersion = "rag-fallback";

    const generatedReply = await generateGemini(
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
        maxOutputTokens: 1400,
      },
    );

    if (generatedReply) {
      reply = generatedReply;
      modelVersion = MODEL_NAME;
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
    // 7. PEMBERSIHAN FORMAT
    // ----------------------------------------------

    reply = String(reply)
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/Hlm\./gi, "Halaman")
      .replace(/\bHlm\b/gi, "Halaman")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const currentTime = formatRegionTime(new Date(), clientLocation);

    // ----------------------------------------------
    // 8. SUMBER RUJUKAN
    // ----------------------------------------------

    const sumberRujukan = sourcePages.map((page) => ({
      title: `Halaman ${page}`,
      page,
    }));

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
