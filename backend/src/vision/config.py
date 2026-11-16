from pathlib import Path
import os

# api.py berada di backend/src/vision/, sehingga parents[2] adalah folder backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = Path(
    os.getenv(
        "PANGANITA_YOLO_MODEL",
        str(BACKEND_DIR / "models" / "yolo26n_detect_v1" / "best.pt"),
    )
).resolve()

CONFIDENCE_THRESHOLD = float(os.getenv("YOLO_CONFIDENCE", "0.25"))
IMAGE_SIZE = int(os.getenv("YOLO_IMAGE_SIZE", "640"))
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "8")) * 1024 * 1024
