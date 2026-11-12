import type { PeranPesan, RujukanRag } from "./types";

const SYSTEM_PROMPT = `Kamu adalah Bu Nita, asisten gizi PANGANITA untuk ibu hamil, ibu menyusui, dan keluarga di Indonesia.
Jawab dalam bahasa Indonesia yang hangat, sederhana, dan mudah dipahami.
Berikan informasi gizi dan pangan yang umum serta praktis dengan memanfaatkan pangan lokal yang terjangkau.
Jika pengguna menyebut keluhan kesehatan, gejala, atau obat, sarankan berkonsultasi dengan tenaga kesehatan.
Jangan memberikan diagnosis atau dosis obat.
Jika ada konteks dokumen, utamakan konteks itu dan sebutkan sumbernya.
Jika tidak yakin, katakan dengan jujur.`;

const PESAN_BELUM_TERHUBUNG =
  "Bu Nita belum terhubung ke model bahasa. Administrator perlu mengisi LLM_API_KEY di pengaturan server.";

const PESAN_GALAT =
  "Maaf, Bu Nita sedang tidak bisa menjawab. Silakan coba lagi sebentar lagi.";

export interface ProfilRingkas {
  hamil: boolean;
  trimester: number | null;
  menyusui: boolean;
  jumlahOrang: number;
}

export interface RiwayatChat {
  peran: PeranPesan;
  isi: string;
}

export interface JawabanBuNita {
  teks: string;
  sumber: RujukanRag[];
  model: string;
}

// Memanggil model bahasa yang kompatibel dengan API chat/completions (OpenAI-compatible).
// Hanya dikirim kondisi umum keluarga, tanpa nama dan tanpa tanggal lahir.
export async function jawabBuNita(input: {
  riwayat: RiwayatChat[];
  pertanyaan: string;
  konteks: RujukanRag[];
  profil: ProfilRingkas;
}): Promise<JawabanBuNita> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return { teks: PESAN_BELUM_TERHUBUNG, sumber: [], model: "belum-terhubung" };
  }

  const p = input.profil;
  const kondisi = [
    p.hamil ? `hamil trimester ${p.trimester}` : null,
    p.menyusui ? "menyusui" : null,
  ].filter(Boolean).join(", ") || "tidak hamil atau menyusui";

  const konteksTeks = input.konteks.length
    ? input.konteks.map((k, i) => `[${i + 1}] ${k.judul}: ${k.kutipan}`).join("\n")
    : "Tidak ada konteks dokumen khusus untuk pertanyaan ini.";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Profil keluarga: ${p.jumlahOrang} orang, kondisi ibu: ${kondisi}.\nKonteks dokumen:\n${konteksTeks}`,
    },
    ...input.riwayat
      .filter((m) => m.peran !== "sistem")
      .map((m) => ({
        role: (m.peran === "asisten" ? "assistant" : "user") as "assistant" | "user",
        content: m.isi,
      })),
    { role: "user", content: input.pertanyaan },
  ];

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.3 }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) throw new Error(`Model menjawab status ${res.status}`);

    const json = await res.json();
    const teks = String(json.choices?.[0]?.message?.content ?? "").trim();
    if (!teks) throw new Error("Jawaban model kosong");

    return { teks, sumber: input.konteks, model };
  } catch (e) {
    console.error("Bu Nita gagal menjawab:", e);
    return { teks: PESAN_GALAT, sumber: [], model: "galat" };
  }
}
