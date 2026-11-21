# Integrasi YOLO26n-seg V1 — PANGANITA

## 1. Informasi Model

Sistem PANGANITA menggunakan model:

- Model: YOLO26n-seg
- Versi: PANGANITA V1
- Task: Instance Segmentation
- Jumlah kelas: 15
- Format checkpoint: best.pt
- Device inference: CPU

Model digunakan untuk mendeteksi dan melakukan segmentasi objek pangan.

Fitur inference:

- Deteksi kelas pangan
- Bounding box
- Confidence score
- Polygon segmentation
- Penghitungan jumlah objek
- Identifikasi kelas dominan (Dominant Class)

## 2. Lokasi Model

Checkpoint model harus tersedia di:

backend/models/yolo26n_seg_v1/best.pt

Jangan menggunakan checkpoint YOLO Detect V1.

Pastikan file best.pt tersedia sebelum menjalankan backend.

## 3. Struktur Folder

backend/
├── models/
│   └── yolo26n_seg_v1/
│       └── best.pt
├── src/
│   └── vision/
│       ├── __init__.py
│       ├── api.py
│       ├── config.py
│       └── detector.py
├── requirements.txt
└── README-INTEGRASI.md

## 4. Instalasi Lokal (Windows)

Dari folder utama proyek:

```powershell
py -3.12 -m venv backend\.venv

.\backend\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip

pip install -r backend\requirements.txt
```

Jika aktivasi PowerShell ditolak:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

.\backend\.venv\Scripts\Activate.ps1
```

## 5. Menjalankan Backend Lokal

Dari folder utama proyek:

```powershell
python -m uvicorn backend.src.vision.api:app --host 127.0.0.1 --port 8000 --reload
```

Jika menjalankan dari folder backend:

```powershell
python -m uvicorn src.vision.api:app --host 127.0.0.1 --port 8000 --reload
```

## 6. Pemeriksaan API

Health check:

http://127.0.0.1:8000/health

Dokumentasi Swagger:

http://127.0.0.1:8000/docs

Root endpoint:

http://127.0.0.1:8000/

## 7. Konfigurasi Next.js

Tambahkan ke file .env.local:

```env
PANGANITA_VISION_API_URL=http://127.0.0.1:8000
```

Restart Next.js setelah mengubah environment variable.

## 8. Endpoint Deteksi

POST /detect

Parameter:

- file: satu gambar JPG, PNG, atau WebP
- Maksimal ukuran file: 8 MB

Respons API mencakup:

- success
- model
- image_width
- image_height
- total_objects
- counts
- identification
- detections
- annotated_image

Setiap objek yang terdeteksi memiliki:

- class_id
- class_name
- confidence
- bbox
- polygon

## 9. Logika Dominant Class

Sistem mengelompokkan hasil deteksi berdasarkan kelas pangan.

Ambang dominasi awal: 60%.

Jika kelas dominan memenuhi ambang:

- status: identified
- dominant_class diisi dengan kelas terpilih.

Jika tidak memenuhi ambang:

- status: ambiguous
- pengguna diarahkan untuk memilih kategori pangan secara manual.

Jika tidak ada objek:

- status: not_detected
- pengguna dapat memilih pangan secara manual.

## 10. Deployment Railway

Backend dijalankan menggunakan FastAPI dan Uvicorn.

Start command jika Root Directory Railway adalah backend:

```bash
uvicorn src.vision.api:app --host 0.0.0.0 --port $PORT
```

Pastikan:

- requirements.txt tersedia di Root Directory.
- Folder models tersedia.
- Checkpoint best.pt tersedia.
- Environment variable PANGANITA_YOLO_MODEL mengarah ke checkpoint yang benar jika menggunakan lokasi khusus.

## 11. Environment Variable Backend

PANGANITA_YOLO_MODEL (opsional)

YOLO_CONFIDENCE=0.25

YOLO_IMAGE_SIZE=512

YOLO_DOMINANT_THRESHOLD=0.60

MAX_UPLOAD_MB=8

CORS_ORIGINS

## 12. Catatan

- Model berjalan menggunakan CPU.
- Model dimuat satu kali ketika pertama kali diperlukan.
- Inference menggunakan instance segmentation.
- Polygon berasal dari result.masks.xy.
- Dominant Class digunakan untuk menentukan kategori pangan utama.
- Pengguna tetap dapat melakukan pemilihan pangan manual.
- Database dan logika perhitungan gizi PANGANITA tidak diubah.
