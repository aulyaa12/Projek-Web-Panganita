
import base64
from collections import defaultdict
from threading import Lock
from typing import Any

import cv2
import numpy as np
from ultralytics import YOLO

from .config import (
    MODEL_PATH,
    CONFIDENCE_THRESHOLD,
    IMAGE_SIZE,
    DOMINANT_CLASS_THRESHOLD,
)

_model = None
_model_lock = Lock()
_predict_lock = Lock()


def get_model():
    """Memuat model segmentation satu kali."""

    global _model

    if _model is None:
        with _model_lock:
            if _model is None:

                if not MODEL_PATH.is_file():
                    raise FileNotFoundError(
                        f"Model YOLO tidak ditemukan: {MODEL_PATH}"
                    )

                loaded_model = YOLO(str(MODEL_PATH))

                if loaded_model.task != "segment":
                    raise RuntimeError(
                        "Checkpoint bukan model segmentation. "
                        f"Task ditemukan: {loaded_model.task}"
                    )

                _model = loaded_model

    return _model


def get_class_name(model, class_id: int) -> str:
    """Mendukung nama kelas dalam format dict maupun list."""

    names = model.names

    if isinstance(names, dict):
        return str(names.get(class_id, class_id))

    if isinstance(names, list) and class_id < len(names):
        return str(names[class_id])

    return str(class_id)


def get_class_color(class_id: int):
    """Menghasilkan warna visual berdasarkan class ID."""

    return (
        int((class_id * 67 + 80) % 256),
        int((class_id * 113 + 150) % 256),
        int((class_id * 173 + 100) % 256),
    )


def encode_annotated_image(image: np.ndarray) -> str:
    """Mengubah gambar hasil anotasi menjadi Base64 JPEG."""

    ok, encoded = cv2.imencode(
        ".jpg",
        image,
        [int(cv2.IMWRITE_JPEG_QUALITY), 88],
    )

    if not ok:
        raise RuntimeError(
            "Gagal membuat gambar hasil deteksi."
        )

    return (
        "data:image/jpeg;base64,"
        + base64.b64encode(encoded.tobytes()).decode("ascii")
    )


def draw_detections(
    image: np.ndarray,
    detections: list[dict[str, Any]],
) -> np.ndarray:
    """Menggambar bounding box dan polygon hasil segmentation."""

    annotated = image.copy()
    overlay = image.copy()

    # Gambar seluruh polygon pada overlay.
    for detection in detections:

        polygon = detection["polygon"]

        if not polygon:
            continue

        points = np.array(
            polygon,
            dtype=np.int32,
        ).reshape((-1, 1, 2))

        color = get_class_color(detection["class_id"])

        cv2.fillPoly(
            overlay,
            [points],
            color,
        )

    annotated = cv2.addWeighted(
        overlay,
        0.35,
        annotated,
        0.65,
        0,
    )

    # Gambar bounding box dan label.
    for detection in detections:

        x1, y1, x2, y2 = map(
            int,
            detection["bbox"],
        )

        color = get_class_color(detection["class_id"])

        cv2.rectangle(
            annotated,
            (x1, y1),
            (x2, y2),
            color,
            2,
        )

        label = (
            f'{detection["class_name"]} '
            f'{detection["confidence"]:.2f}'
        )

        text_y = max(20, y1 - 7)

        cv2.putText(
            annotated,
            label,
            (x1, text_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            color,
            2,
            cv2.LINE_AA,
        )

    return annotated


def select_dominant_class(
    detections: list[dict[str, Any]],
) -> dict[str, Any]:
    """Memilih kelas dominan berdasarkan jumlah objek."""

    if not detections:
        return {
            "success": False,
            "status": "not_detected",
            "dominant_class": None,
            "dominant_percentage": 0.0,
            "reason": "no_detection",
            "class_summary": [],
        }

    grouped = defaultdict(list)

    for detection in detections:
        grouped[detection["class_name"]].append(detection)

    total_objects = len(detections)

    class_stats = []

    for class_name, items in grouped.items():

        count = len(items)

        confidence_sum = sum(
            item["confidence"] for item in items
        )

        percentage = count / total_objects * 100

        class_stats.append({
            "class_name": class_name,
            "count": count,
            "confidence_sum": round(confidence_sum, 4),
            "percentage": round(percentage, 2),
        })

    # Prioritas pertama: jumlah objek.
    # Prioritas kedua: akumulasi confidence.
    class_stats.sort(
        key=lambda item: (
            item["count"],
            item["confidence_sum"],
        ),
        reverse=True,
    )

    dominant = class_stats[0]

    dominant_share = (
        dominant["count"] / total_objects
    )

    dominant_percentage = dominant_share * 100

    # Ambang dominasi awal 60%.
    if dominant_share < DOMINANT_CLASS_THRESHOLD:

        return {
            "success": False,
            "status": "ambiguous",
            "dominant_class": None,
            "dominant_percentage": round(
                dominant_percentage, 2
            ),
            "reason": "ambiguous_dominant_class",
            "class_summary": class_stats,
        }

    return {
        "success": True,
        "status": "identified",
        "dominant_class": dominant["class_name"],
        "dominant_count": dominant["count"],
        "dominant_percentage": round(
            dominant_percentage, 2
        ),
        "reason": "dominant_class",
        "class_summary": class_stats,
    }


def predict_image(image_bytes: bytes) -> dict[str, Any]:
    """Deteksi dan segmentasi pangan menggunakan YOLO26n-seg."""

    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8,
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise ValueError(
            "File tidak dapat dibaca sebagai gambar."
        )

    model = get_model()

    # Lock inference untuk menghindari akses model
    # secara bersamaan dari beberapa request.
    with _predict_lock:

        results = model.predict(
            source=image,
            conf=CONFIDENCE_THRESHOLD,
            imgsz=IMAGE_SIZE,
            device="cpu",
            verbose=False,
        )

    if not results:
        raise RuntimeError(
            "Model tidak menghasilkan respons prediksi."
        )

    result = results[0]

    detections = []

    boxes = result.boxes
    masks = result.masks

    if boxes is not None:

        for index, box in enumerate(boxes):

            class_id = int(box.cls.item())
            confidence = float(box.conf.item())

            if confidence < CONFIDENCE_THRESHOLD:
                continue

            bbox = [
                round(float(value), 2)
                for value in box.xyxy[0].tolist()
            ]

            class_name = get_class_name(
                model,
                class_id,
            )

            polygon = []

            # Ekstraksi polygon segmentation.
            if masks is not None and index < len(masks.xy):

                polygon_array = masks.xy[index]

                if polygon_array is not None and len(polygon_array) >= 3:

                    polygon = [
                        [
                            round(float(point[0]), 2),
                            round(float(point[1]), 2),
                        ]
                        for point in polygon_array
                    ]

            detections.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "bbox": bbox,
                "polygon": polygon,
            })

    # Hitung kelas dominan.
    identification = select_dominant_class(
        detections
    )

    counts = {}

    for item in detections:

        name = item["class_name"]

        counts[name] = counts.get(name, 0) + 1

    # Jika identifikasi berhasil, visualisasikan hanya
    # objek dari kelas dominan.
    if identification["success"]:

        dominant_class = identification["dominant_class"]

        visual_detections = [
            item
            for item in detections
            if item["class_name"] == dominant_class
        ]

    else:
        # Jika ambigu, tampilkan seluruh deteksi yang lolos
        # filter agar hasil pemeriksaan tetap terlihat.
        visual_detections = detections

    annotated = draw_detections(
        image,
        visual_detections,
    )

    annotated_base64 = encode_annotated_image(
        annotated
    )

    return {
        "success": True,
        "model": "YOLO26n-seg PANGANITA V1",

        "image_width": int(image.shape[1]),
        "image_height": int(image.shape[0]),

        "total_objects": len(detections),

        "counts": counts,

        "identification": identification,

        "detections": detections,

        "annotated_image": annotated_base64,
    }
