# PANGANITA (Pangan dan Gizi untuk Keluarga)
> **Solusi Cerdas Ketahanan Pangan & Pemenuhan Gizi Keluarga 1.000 HPK Berbasis AI & Pekarangan**  
> *Final Project — Bootcamp Perempuan Inovasi GENerasi AI 2026 (Track: AI Full-Stack Web Development)*

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-emerald?logo=supabase)](https://supabase.com/)
[![YOLO](https://img.shields.io/badge/Computer%20Vision-YOLO%20%2B%20FastAPI-purple?logo=python)](https://docs.ultralytics.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20AI-Gemini%203.5%20Flash-blue?logo=google)](https://ai.google.dev/)
[![Deployment](https://img.shields.io/badge/Vercel-Production%20Live-black?logo=vercel)](https://panganita.vercel.app/)

**Website:** https://panganita.vercel.app/

---

## 🌾 Tentang PANGANITA
**PANGANITA** adalah aplikasi web full-stack yang dirancang untuk memberdayakan perempuan Indonesia (khususnya ibu rumah tangga dengan anak usia 1.000 Hari Pertama Kehidupan) dalam mengelola hasil panen pekarangan secara seimbang antara **kebutuhan gizi keluarga** dan **penjualan ekonomi rumah tangga**.

Fitur utama:
1. **Pindai Panen (Computer Vision)**: Ibu memotret atau mengunggah foto hasil panen. Model YOLO mengenali jenis pangan, lalu nilai gizinya (TKPI) diambil dari database. Ibu tetap dapat memeriksa dan mengoreksi hasilnya.
2. **Kalkulator Keputusan Panen / Tumbuh1000 (3 Alternatif)**: Simulasi pembagian hasil panen (Prioritas Gizi, Seimbang, Prioritas Uang) berdasarkan Angka Kecukupan Gizi (AKG) Permenkes No. 28/2019. Pilihan Ibu tersimpan sebagai riwayat.
3. **Bu Nita AI (RAG & Voice Note)**: Asisten gizi interaktif yang ramah dialek daerah (Jawa, Sunda, Betawi, Melayu), mendukung masukan suara, dan menampilkan rujukan buku panduan resmi.
4. **Login Berbasis WhatsApp OTP**: Autentikasi mudah tanpa kata sandi panjang.

---

## 📑 Dokumentasi & Deliverable Final Project

| Deliverable | Tautan / Lokasi File | Deskripsi |
|---|---|---|
| **API Documentation** | [`/api-docs`](https://panganita.vercel.app/api-docs) / [`app/api/openapi.json/route.js`](./app/api/openapi.json/route.js) | Swagger UI interaktif dan spesifikasi OpenAPI 3.0.3. |
| **Dokumentasi Fitur AI** | [`docs/DOKUMENTASI_FITUR_AI.md`](./docs/DOKUMENTASI_FITUR_AI.md) | Arsitektur RAG Bu Nita dan Computer Vision YOLO, model dan alasan pemilihannya, evaluasi test case, serta Responsible AI. |
| **Panduan Backend Computer Vision** | [`backend/README-INTEGRASI.md`](./backend/README-INTEGRASI.md) | Instalasi dan cara menjalankan layanan FastAPI + YOLO. |
| **Buku Panduan Gizi RAG** | [`docs/buku_panduan_gizi_dan_olahan_panganita.pdf`](./docs/buku_panduan_gizi_dan_olahan_panganita.pdf) | Dokumen rujukan basis pengetahuan (knowledge base) Bu Nita AI. |
| **Skema dan ERD Database** | [`database/README.md`](./database/README.md) | Panduan inisialisasi database, ERD (Mermaid), dan penjelasan RLS. |
| **Script SQL dan Seed Data** | [`database/schema.sql`](./database/schema.sql) dan [`database/seed.sql`](./database/seed.sql) | DDL 9 tabel, kebijakan RLS, bucket Storage, serta seed AKG, bahan pangan, dan parameter rumus. |

---

## 🛠️ Tech Stack & Arsitektur

- **Front-End**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui, Lucide Icons, Sonner.
- **Back-End**: Next.js Server Actions dan Route Handlers (`/api/chat`, `/api/vision/detect`, `/api/auth/whatsapp/*`, `/api/openapi.json`).
- **Database & Storage**: Supabase PostgreSQL (RLS aktif pada semua tabel) dan Supabase Storage bucket `hasil-panen`.
- **AI & Machine Learning**:
  - **Computer Vision**: Model YOLO (Ultralytics, `yolo26n_detect_v1` / `best.pt`) dijalankan pada layanan **FastAPI** (Python 3.12, CPU). Next.js bertindak sebagai gateway di `/api/vision/detect` sehingga alamat layanan internal tidak terlihat di sisi client.
  - **Conversational RAG**: Google Gemini 3.5 Flash dengan failover berlapis (`gemini-3.5-flash`, `gemini-3.1-flash-lite-preview`, `gemini-3-flash-preview`, `gemini-flash-latest`, `gemini-flash-lite-latest`).
  - **Dialect Normalization & Timezone Sync**: Penerjemahan kosakata daerah dan penyesuaian zona waktu (WIB/WITA/WIT).
  - **Speech-to-Text**: Masukan suara (voice note) dikirim sebagai audio base64 dan ditranskripsi menjadi teks.
- **WhatsApp Gateway**: Fonnte API untuk pengiriman OTP.
- **Testing**: Vitest (unit test kalkulasi alternatif gizi dan AKG).
- **Deployment**: Aplikasi Next.js di Vercel, database di Supabase, layanan FastAPI (YOLO) di Railway.

```mermaid
flowchart LR
  Ibu([Ibu]) --> Web[Next.js di Vercel]
  Web -->|Server Actions / Route Handlers| DB[(Supabase PostgreSQL + Storage)]
  Web -->|/api/vision/detect| CV[FastAPI + YOLO di Railway]
  Web -->|/api/chat| LLM[Gemini + RAG]
  Web -->|OTP| WA[Fonnte WhatsApp]
```

---

## 🚀 Cara Menjalankan Aplikasi di Lokal (Local Development)

### 1. Prasyarat
- Node.js versi 18+ (disarankan v20 atau v22)
- Python 3.12 (untuk layanan Computer Vision)
- Akun Supabase (project PostgreSQL aktif)
- Google Gemini API Key
- File model `best.pt` (lihat langkah 5)

### 2. Kloning Repository & Instalasi Dependensi
```bash
git clone https://github.com/aulyaa12/Projek-Web-Panganita.git
cd Projek-Web-Panganita
npm install
```

### 3. Konfigurasi Environment Variables
Salin file template `.env.example` (atau buat file `.env.local`):
```bash
cp .env.example .env.local
```
Lengkapi variabel berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# WhatsApp Gateway (Fonnte)
FONNTE_TOKEN=your-fonnte-token

# Layanan Computer Vision (FastAPI)
# Lokal: http://127.0.0.1:8000 | Production: alamat layanan di Railway
PANGANITA_VISION_API_URL=http://127.0.0.1:8000
```
> File `.env.local`, dataset, dan file model berukuran besar **tidak** di-commit ke repository.

### 4. Setup Database
1. Buka Supabase SQL Editor pada dashboard proyek Anda.
2. Jalankan isi [`database/schema.sql`](./database/schema.sql) untuk membuat tabel, indeks, RLS, dan bucket Storage.
3. Jalankan isi [`database/seed.sql`](./database/seed.sql) untuk mengisi data AKG, master bahan pangan, dan parameter rumus.

Panduan lengkap beserta ERD ada di [`database/README.md`](./database/README.md).

### 5. Siapkan Layanan Computer Vision (YOLO)
Letakkan model hasil fine-tuning di:

```
backend/models/yolo26n_detect_v1/best.pt
```

> **Cara memperoleh model:** [ISI TAUTAN UNDUH best.pt, misalnya Google Drive atau Hugging Face]. Jangan letakkan model segmentation di lokasi ini.

Instalasi dan menjalankan backend (PowerShell, dari folder utama proyek):

```powershell
py -3.12 -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

python -m uvicorn backend.src.vision.api:app --host 127.0.0.1 --port 8000 --reload
```

- Cek status: `http://127.0.0.1:8000/health`
- Dokumentasi API layanan: `http://127.0.0.1:8000/docs`
- Jika aktivasi PowerShell ditolak, jalankan `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` pada terminal yang sama.

Detail dan catatan lain: [`backend/README.md`](./backend/README.md).

### 6. Jalankan Pengujian (Testing)
```bash
npm test
```

### 7. Jalankan Server Development
```bash
npm run dev
```
Aplikasi dapat diakses di `http://localhost:3000`. Dokumentasi Swagger API ada di `http://localhost:3000/api-docs`.
Restart `npm run dev` setiap kali environment variable diubah.

---

## ☁️ Deployment

| Komponen | Platform | Catatan |
|---|---|---|
| Next.js (Front-End + Back-End) | Vercel | Terhubung ke repository GitHub. Seluruh environment variable diatur di Vercel. |
| Database dan Storage | Supabase (cloud) | Jalankan `schema.sql` dan `seed.sql` pada project Supabase production. |
| FastAPI + YOLO | Railway | Atur `PANGANITA_YOLO_MODEL` dan `YOLO_CONFIDENCE` bila perlu. Isi `PANGANITA_VISION_API_URL` di Vercel dengan alamat layanan ini. |

---

## 🔒 Keamanan & Responsible AI

- Row Level Security (RLS) aktif pada semua tabel. Data profil, panen, riwayat keputusan, dan percakapan hanya dapat diakses pemiliknya (`auth.uid()`). Foto di bucket `hasil-panen` tersimpan pada path `/{user_id}/{nama_file}`.
- API key dan secret hanya disimpan di environment variable, tidak di kode. Layanan Computer Vision diakses lewat gateway Next.js, bukan langsung dari browser.
- Validasi unggahan foto: JPG, PNG, atau WebP, maksimal 8 MB.
- Hasil AI diberi penanda jelas, memuat rujukan sumber (Bu Nita), dan bukan pengganti nasihat tenaga kesehatan. Hasil deteksi pangan hanya usulan awal: Ibu dapat mengoreksi jenis pangan dan mengisi berat sebenarnya.
- Nomor telepon dan identitas pribadi tidak dikirim ke prompt LLM.
- Uraian lengkap, hasil evaluasi, dan risiko ada di [`docs/DOKUMENTASI_FITUR_AI.md`](./docs/DOKUMENTASI_FITUR_AI.md).

---

## 👥 Tim Pengembang (Kelompok 10 Malahayati)
- **Aulya Rakhmawati**: Database Architecture, AI Computer Vision Integration, Initial Assessment API & Backend Management.
- **Prawita Mepilianti**: AI RAG Chatbot Integration, Speech & Dialect Normalization, Swagger API Documentation, SQL Scripts & Seed Data, AI Technical Documentation.
- **Dita Surya Kartika**: Supabase Storage Integration, WhatsApp OTP Authentication, Presentation Deck & Video Showcase.
- **Dessy Christina Elseba Matakupan**: Product Requirement Document (PRD/BRD), User Story, User Flow, UI/UX Prototype, Registration Flow.

---

## 🎨 Kredit Aset Visual
- **Foto landing page**: ["Woman sorting fish on a sandy coast"](https://pixabay.com/photos/fishing-village-people-one-outside-3248682/) oleh [pasja1000](https://pixabay.com/users/pasja1000-6355831/) dari [Pixabay](https://pixabay.com/), digunakan di bawah [Pixabay Content License](https://pixabay.com/service/license-summary/).
- **Maskot Bu Nita & avatar Ibu**: dibuat dengan bantuan AI generatif menggunakan [ChatGPT](https://chatgpt.com/) (OpenAI), kemudian disesuaikan oleh tim PANGANITA.
