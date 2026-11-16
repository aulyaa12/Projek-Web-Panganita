from pathlib import Path
from threading import Lock
from typing import Any

import cv2
import numpy as np
from ultralytics import YOLO

from .config import MODEL_PATH, CONFIDENCE_THRESHOLD, IMAGE_SIZE

_model = None
_model_lock = Lock()


def get_model():
    """Muat model satu kali saat pertama diperlukan."""
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                if not MODEL_PATH.is_file():
                    raise FileNotFoundError(
                        f"Model YOLO tidak ditemukan: {MODEL_PATH}"
                    )
                _model = YOLO(str(MODEL_PATH))
    return _model


def predict_image(image_bytes: bytes) -> dict[str, Any]:
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("File tidak dapat dibaca sebagai gambar.")

    model = get_model()
    results = model.predict(
        source=image,
        conf=CONFIDENCE_THRESHOLD,
        imgsz=IMAGE_SIZE,
        device="cpu",
        verbose=False,
    )

    result = results[0]
    detections = []

    if result.boxes is not None:
        for box in result.boxes:
            class_id = int(box.cls.item())
            confidence = float(box.conf.item())
            xyxy = [round(float(v), 2) for v in box.xyxy[0].tolist()]
            class_name = model.names.get(class_id, str(class_id))

            detections.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "bbox": xyxy,
            })

    # result.plot() menghasilkan gambar BGR yang sudah diberi bounding box.
    annotated = result.plot()
    ok, encoded = cv2.imencode(
        ".jpg", annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 88]
    )
    if not ok:
        raise RuntimeError("Gagal membuat gambar hasil deteksi.")

    counts: dict[str, int] = {}
    for item in detections:
        name = item["class_name"]
        counts[name] = counts.get(name, 0) + 1

    return {
        "success": True,
        "model": "YOLO26 Detect V1",
        "image_width": int(image.shape[1]),
        "image_height": int(image.shape[0]),
        "total_objects": len(detections),
        "counts": counts,
        "detections": detections,
        "annotated_image": "data:image/jpeg;base64,"
            + __import__("base64").b64encode(encoded.tobytes()).decode("ascii"),
    }
