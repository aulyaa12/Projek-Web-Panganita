
import os
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .config import MODEL_PATH, MAX_UPLOAD_BYTES
from .detector import predict_image


logger = logging.getLogger("panganita.vision")

app = FastAPI(
    title="PANGANITA Vision API",
    version="1.0.0",
    description="API deteksi bahan pangan menggunakan YOLO26 Detect V1.",
)

# =====================================================
# CORS CONFIGURATION
# Lokal: localhost:3000
# Produksi: domain Vercel melalui environment variable
# =====================================================

cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)

cors_origins = [
    origin.strip().rstrip("/")
    for origin in cors_origins_env.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# =====================================================
# ROOT ENDPOINT
# =====================================================

@app.get("/")
def root():
    return {
        "success": True,
        "service": "PANGANITA Vision API",
        "version": "1.0.0",
        "status": "running",
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "service": "PANGANITA Vision API",
        "model_exists": MODEL_PATH.is_file(),
        "model_path": str(MODEL_PATH),
    }


# =====================================================
# YOLO DETECTION
# =====================================================

@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    try:
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=415,
                detail="Format foto harus JPG, PNG, atau WebP.",
            )

        content = await file.read(MAX_UPLOAD_BYTES + 1)

        if not content:
            raise HTTPException(
                status_code=400,
                detail="File foto kosong.",
            )

        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Ukuran foto maksimal 8 MB.",
            )

        try:
            result = predict_image(content)
            return result

        except FileNotFoundError:
            logger.exception("Model YOLO tidak ditemukan.")

            raise HTTPException(
                status_code=503,
                detail="Model AI belum tersedia.",
            )

        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            )

        except Exception:
            logger.exception("Kesalahan saat menjalankan YOLO.")

            raise HTTPException(
                status_code=500,
                detail="Terjadi kesalahan saat memproses foto.",
            )

    finally:
        await file.close()


# =====================================================
# STARTUP CHECK
# =====================================================

@app.on_event("startup")
def verify_model_path():

    if not MODEL_PATH.is_file():
        logger.error(
            "Model YOLO tidak ditemukan: %s",
            MODEL_PATH,
        )
    else:
        logger.info(
            "Model YOLO tersedia: %s",
            MODEL_PATH,
        )

    logger.info("PANGANITA Vision API siap dijalankan.")
