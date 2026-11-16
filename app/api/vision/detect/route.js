export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
  try {
    const apiBase = process.env.PANGANITA_VISION_API_URL;

    if (!apiBase) {
      return Response.json(
        { error: "Konfigurasi Vision API belum tersedia." },
        { status: 500 },
      );
    }

    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "Foto belum dipilih." }, { status: 400 });
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Gunakan foto JPG, PNG, atau WebP." },
        { status: 415 },
      );
    }

    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: "Ukuran foto maksimal 8 MB." },
        { status: 413 },
      );
    }

    const outgoing = new FormData();

    // Sesuai parameter UploadFile(file) pada FastAPI.
    outgoing.append("file", file, file.name);

    const upstream = await fetch(`${apiBase.replace(/\/+$/, "")}/detect`, {
      method: "POST",
      body: outgoing,
      cache: "no-store",
    });

    const raw = await upstream.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        error: raw || "Respons Vision API tidak valid.",
      };
    }

    if (!upstream.ok) {
      return Response.json(
        {
          error: data.detail || data.error || "Deteksi pangan gagal.",
        },
        { status: upstream.status },
      );
    }

    return Response.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("[VISION DETECT]", error);

    return Response.json(
      {
        error:
          "Layanan deteksi pangan tidak dapat dihubungi. Periksa backend YOLO26.",
      },
      { status: 502 },
    );
  }
}
