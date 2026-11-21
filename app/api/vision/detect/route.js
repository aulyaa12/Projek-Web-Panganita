export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
  try {
    // =================================================
    // FASTAPI URL
    // =================================================

    const apiBase = process.env.PANGANITA_VISION_API_URL;

    if (!apiBase) {
      return Response.json(
        {
          success: false,
          error: "Konfigurasi Vision API belum tersedia.",
        },
        { status: 500 },
      );
    }

    // =================================================
    // READ FORM DATA
    // =================================================

    const incoming = await request.formData();

    const file = incoming.get("file");

    if (!file || typeof file === "string") {
      return Response.json(
        {
          success: false,
          error: "Foto belum dipilih.",
        },
        { status: 400 },
      );
    }

    // =================================================
    // VALIDATE FILE
    // =================================================

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return Response.json(
        {
          success: false,
          error: "Gunakan foto JPG, PNG, atau WebP.",
        },
        { status: 415 },
      );
    }

    if (file.size === 0) {
      return Response.json(
        {
          success: false,
          error: "File foto kosong.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        {
          success: false,
          error: "Ukuran foto maksimal 8 MB.",
        },
        { status: 413 },
      );
    }

    // =================================================
    // FORWARD TO FASTAPI
    // =================================================

    const outgoing = new FormData();

    outgoing.append("file", file, file.name);

    const upstream = await fetch(`${apiBase.replace(/\/+$/, "")}/detect`, {
      method: "POST",
      body: outgoing,
      cache: "no-store",
    });

    // =================================================
    // READ FASTAPI RESPONSE
    // =================================================

    const raw = await upstream.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        success: false,
        error: "Respons Vision API tidak valid.",
      };
    }

    // =================================================
    // HANDLE API ERROR
    // =================================================

    if (!upstream.ok) {
      return Response.json(
        {
          success: false,
          error: data.detail || data.error || "Deteksi pangan gagal.",
        },
        {
          status: upstream.status,
        },
      );
    }

    // =================================================
    // RETURN YOLO26n-seg RESULT
    // =================================================

    return Response.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("[PANGANITA VISION DETECT]", error);

    return Response.json(
      {
        success: false,
        error:
          "Layanan deteksi pangan tidak dapat dihubungi. Periksa backend YOLO26n-seg.",
      },
      {
        status: 502,
      },
    );
  }
}
