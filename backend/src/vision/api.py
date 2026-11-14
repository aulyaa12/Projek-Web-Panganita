from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .config import MODEL_PATH, MAX_UPLOAD_BYTES
from .detector import get_model, predict_image

app = FastAPI(
    title="PANGANITA Vision API",
    version="1.0.0",
    description="API deteksi bahan pangan menggunakan YOLO26 Detect V1.",
)

# Request dari browser Next.js lokal. Produksi perlu menambahkan domain resmi.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "PANGANITA Vision API",
        "model_exists": MODEL_PATH.is_file(),
        "model_path": str(MODEL_PATH),
    }


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail="Format foto harus JPG, PNG, atau WebP.",
        )

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if not content:
        raise HTTPException(status_code=400, detail="File foto kosong.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran foto maksimal 8 MB.")

    try:
        return predict_image(content)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        # Detail teknis dicatat di terminal backend, tidak dikirim ke pengguna.
        print(f"Kesalahan prediksi YOLO: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Terjadi kesalahan saat memproses foto.",
        )


@app.on_event("startup")
def verify_model_path():
    if not MODEL_PATH.is_file():
        print(f"PERINGATAN: model belum ditemukan di {MODEL_PATH}")
    else:
        print(f"Model YOLO tersedia: {MODEL_PATH}")
