
from pathlib import Path
import os


# =====================================================
# DIREKTORI BACKEND
# =====================================================

# config.py berada di backend/src/vision/
BACKEND_DIR = Path(__file__).resolve().parents[2]


# =====================================================
# YOLO26n-seg PANGANITA V1
# =====================================================

MODEL_PATH = Path(
    os.getenv(
        "PANGANITA_YOLO_MODEL",
        str(
            BACKEND_DIR
            / "models"
            / "yolo26n_seg_v1"
            / "best.pt"
        ),
    )
).resolve()


# =====================================================
# KONFIGURASI INFERENCE
# =====================================================

CONFIDENCE_THRESHOLD = float(
    os.getenv("YOLO_CONFIDENCE", "0.25")
)

IMAGE_SIZE = int(
    os.getenv("YOLO_IMAGE_SIZE", "512")
)

# Ambang dominasi awal 60%
DOMINANT_CLASS_THRESHOLD = float(
    os.getenv("YOLO_DOMINANT_THRESHOLD", "0.60")
)


# =====================================================
# BATAS UPLOAD
# =====================================================

MAX_UPLOAD_BYTES = (
    int(os.getenv("MAX_UPLOAD_MB", "8")) * 1024 * 1024
)


# =====================================================
# VALIDASI KONFIGURASI
# =====================================================

if not 0 < CONFIDENCE_THRESHOLD <= 1:
    raise ValueError(
        "YOLO_CONFIDENCE harus lebih dari 0 dan maksimal 1."
    )

if IMAGE_SIZE <= 0:
    raise ValueError(
        "YOLO_IMAGE_SIZE harus lebih besar dari 0."
    )

if not 0 < DOMINANT_CLASS_THRESHOLD <= 1:
    raise ValueError(
        "YOLO_DOMINANT_THRESHOLD harus lebih dari 0 dan maksimal 1."
    )

if MAX_UPLOAD_BYTES <= 0:
    raise ValueError(
        "MAX_UPLOAD_MB harus lebih besar dari 0."
    )
