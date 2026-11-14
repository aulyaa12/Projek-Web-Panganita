# Integrasi YOLO26 Detect V1 — PANGANITA

## Lokasi model yang diharapkan

`backend/models/yolo26n_detect_v1/best.pt`

Jangan letakkan model segmentation di lokasi ini.

## Instalasi (PowerShell, dari folder utama proyek)

```powershell
py -3.12 -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

Jika aktivasi PowerShell ditolak, jalankan pada terminal yang sama:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\backend\.venv\Scripts\Activate.ps1
```

## Jalankan backend

Dari folder utama `panganita-frontend`:

```powershell
python -m uvicorn backend.src.vision.api:app --host 127.0.0.1 --port 8000 --reload
```

Cek status di browser: `http://127.0.0.1:8000/health`

Dokumentasi API: `http://127.0.0.1:8000/docs`

## Next.js

Tambahkan ke `.env.local`:

```env
PANGANITA_VISION_API_URL=http://127.0.0.1:8000
```

Restart `npm run dev` setelah mengubah environment variable.

## Catatan

- API menerima satu foto pada field `file` (JPG, PNG, WebP; maksimal 8 MB).
- API mengembalikan `detections`, `counts`, `total_objects`, dan `annotated_image`.
- Model dijalankan pada CPU (`device="cpu"`).
- Tahap ini belum menyimpan foto atau hasil deteksi ke Supabase.
- Deteksi hanya usulan awal. Pengguna tetap perlu mengonfirmasi kelas dan jumlah objek.
