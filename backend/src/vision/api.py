
import os
import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .config import MODEL_PATH, MAX_UPLOAD_BYTES
from .detector import predict_image


# =====================================================
# LOGGING
# =====================================================

logger = logging.getLogger("panganita.vision")


# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="PANGANITA Vision API",
    version="2.0.0",
    description=(
        "API deteksi dan segmentasi bahan pangan "
        "menggunakan YOLO26n-seg PANGANITA V1."
    ),
)


# =====================================================
# CORS CONFIGURATION
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
        "version": "2.0.0",
        "model": "YOLO26n-seg PANGANITA V1",
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
        "model": "YOLO26n-seg PANGANITA V1",
        "model_exists": MODEL_PATH.is_file(),
        "model_path": str(MODEL_PATH),
    }


# =====================================================
# YOLO26n-seg DETECTION
# =====================================================

@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    try:
        # Validasi format foto
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=415,
                detail="Format foto harus JPG, PNG, atau WebP.",
            )

        # Baca maksimal 8 MB + 1 byte untuk mendeteksi
        # file yang melebihi batas.
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

        # Jalankan YOLO26n-seg
        result = predict_image(content)

        return result

    except HTTPException:
        raise

    except FileNotFoundError:
        logger.exception("Model YOLO26n-seg tidak ditemukan.")

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
        logger.exception(
            "Kesalahan saat menjalankan YOLO26n-seg."
        )

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
            "Model YOLO26n-seg tidak ditemukan: %s",
            MODEL_PATH,
        )
    else:
        logger.info(
            "Model YOLO26n-seg tersedia: %s",
            MODEL_PATH,
        )

    logger.info(
        "PANGANITA Vision API YOLO26n-seg siap dijalankan."
    )
