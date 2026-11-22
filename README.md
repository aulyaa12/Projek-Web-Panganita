# PANGANITA (Pangan dan Gizi untuk Keluarga)

> **Solusi pendukung pengelolaan hasil panen, ketahanan pangan, dan pemenuhan gizi keluarga 1.000 HPK berbasis AI.**
>
> Final Project — Bootcamp Perempuan Inovasi GENerasi AI 2026 (Track: AI Full-Stack Web Development)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Supabase](<https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-emerald?logo=supabase>)](https://supabase.com/)
[![Vision AI](<https://img.shields.io/badge/Vision%20AI-YOLO26n--seg-purple>)](https://docs.ultralytics.com/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](<https://img.shields.io/badge/Google%20AI-Gemini%203.5%20Flash-blue?logo=google>)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)

**Website:** https://panganita.vercel.app/
**Repository:** https://github.com/aulyaa12/Projek-Web-Panganita

---

## 🌾 Tentang PANGANITA

**PANGANITA** adalah aplikasi web full-stack yang dirancang untuk memberdayakan perempuan Indonesia (khususnya ibu rumah tangga dengan anak usia 1.000 Hari Pertama Kehidupan) dalam mengelola hasil panen pekarangan secara seimbang antara **kebutuhan gizi keluarga** dan  **penjualan ekonomi rumah tangga** .

Fitur utama:

1. **Pindai Panen (Computer Vision).** Pengguna mengunggah atau memotret pangan. **YOLO26n-seg PANGANITA V1** mengenali kategori pangan, menghasilkan segmentasi objek, dan memilih kelas dominan apabila memenuhi aturan sistem. Nama pangan dapat dikoreksi secara manual. Informasi gizi berasal dari katalog pangan di Supabase, bukan dihitung langsung oleh YOLO.
2. **Kalkulator Keputusan Panen (Tumbuh1000).** Menampilkan tiga alternatif pembagian hasil panen: **Prioritas Gizi, Seimbang, dan Prioritas Uang**, berdasarkan parameter kebutuhan pangan keluarga, data gizi, jumlah panen, dan harga. Hasilnya merupakan estimasi pendukung keputusan, bukan kepastian terpenuhinya seluruh kebutuhan gizi. Pilihan Ibu tersimpan sebagai riwayat.
3. **Bu Nita AI (RAG & Voice Note).** Asisten percakapan terkait pangan dan gizi yang menggunakan materi rujukan/RAG. Asisten gizi interaktif yang ramah dialek daerah (Jawa, Sunda, Betawi, Melayu), mendukung masukan suara, dan menampilkan rujukan buku panduan resmi.
4. **Autentikasi WhatsApp OTP.** Login melalui verifikasi kode OTP, tanpa kata sandi panjang.
5. **Profil dan Riwayat.** Menyimpan informasi keluarga dan riwayat keputusan panen sesuai hak akses pengguna.

> **Batasan:** Model Vision AI mengidentifikasi jenis pangan, **bukan** mengukur berat panen dari gambar. Berat tetap dimasukkan atau dikonfirmasi oleh pengguna. Rekomendasi aplikasi tidak menggantikan nasihat tenaga kesehatan atau ahli gizi.

---

## 📑 Dokumentasi Proyek

| Dokumen                  | Lokasi                                                                                                                                                                               | Keterangan                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Dokumentasi API aplikasi | [`/api-docs`](https://panganita.vercel.app/api-docs) / [`app/api/openapi.json/route.js`](https://github.com/aulyaa12/Projek-Web-Panganita/blob/main/app/api/openapi.json/route.js) | Swagger/OpenAPI untuk endpoint aplikasi Next.js                                                |
| Swagger Vision AI        | [Railway `/docs`](https://projek-web-panganita-production.up.railway.app/docs)                                                                                                      | Pengujian langsung `POST /detect` dan `GET /health`                                        |
| Dokumentasi fitur AI     | [`docs/DOKUMENTASI_FITUR_AI.md`](./docs/DOKUMENTASI_FITUR_AI.md)                                                                                                                    | Penjelasan pipeline Vision AI, chatbot, dan evaluasi                                            |
| Panduan Vision API       | [`backend/README-INTEGRASI.md`](./backend/README-INTEGRASI.md)                                                                                                                      | Konfigurasi dan cara menjalankan FastAPI                                                       |
| Referensi gizi RAG       | [`docs/buku_panduan_gizi_dan_olahan_panganita.pdf`](./docs/buku_panduan_gizi_dan_olahan_panganita.pdf)                                                                              | Dokumen rujukan basis pengetahuan (knowledge base) Bu Nita AI.                                 |
| Dokumentasi database     | [`database/README.md`](./database/README.md)                                                                                                                                        | Panduan inisialisasi database, ERD (Mermaid), dan penjelasan RLS.                              |
| SQL database             | [`database/schema.sql`](./database/schema.sql), [`database/seed.sql`](./database/seed.sql)                                                                                         | DDL 9 tabel, kebijakan RLS, bucket Storage, serta seed AKG, bahan pangan, dan parameter rumus. |

---

## 🛠️ Teknologi dan Arsitektur

- **Frontend:** Next.js  15 (App Router), React, Tailwind CSS, shadcn/ui, Lucide Icons, Sonner.
- **Backend aplikasi:** Next.js Server Actions dan Route Handlers.
- **Vision API:** Python, FastAPI, Ultralytics **YOLO26n-seg PANGANITA V1**, OpenCV, NumPy, PyTorch; inferensi CPU.
- **Database dan Storage:** Supabase PostgreSQL, Authentication, dan Storage (`hasil-panen`).
- **Chatbot:** Integrasi model bahasa Google Gemini 3.5 Flash dengan failover berlapis (`gemini-3.5-flash`, `gemini-3.1-flash-lite-preview`, `gemini-3-flash-preview`, `gemini-flash-latest`, `gemini-flash-lite-latest`) dan basis pengetahuan/RAG sesuai konfigurasi implementasi chatbot.

* **Dialect Normalization & Timezone Sync** : Penerjemahan kosakata daerah dan penyesuaian zona waktu (WIB/WITA/WIT).
* **Speech-to-Text** : Masukan suara (voice note) dikirim sebagai audio base64 dan ditranskripsi menjadi teks.

- **WhatsApp OTP:** Fonnte API.
- **Hosting:** Next.js di Vercel; Vision API di Railway; database di Supabase.

### Alur sistem

```mermaid
flowchart LR
    U[Pengguna] --> W[Website Next.js / Vercel]
    W --> S[(Supabase: Profil, Gizi, Riwayat, Storage)]
    W --> A[Next.js API /api/vision/detect]
    A --> V[FastAPI /detect di Railway]
    V --> M[YOLO26n-seg V1]
    W --> C[Bu Nita / RAG dan Gemini]
    W --> O[Autentikasi / WhatsApp OTP]
```

## 🚀 Cara Menjalankan Aplikasi di Lokal (Local Development)

### 1. Prasyarat

- Node.js versi 18+ (disarankan v20 atau v22)
- Python 3.12 (untuk menjalankan Vision AI lokal)
- Akses Supabase, API key Gemini dan Fonnte untuk fitur terkait
- Model YOLO26n-seg `best.pt` (untuk menjalankan Vision AI lokal)

### 2. Clone Repository & Instalasi Dependensi

Buka terminal **PowerShell di VS Code**, lalu jalankan:

```powershell
git clone https://github.com/aulyaa12/Projek-Web-Panganita.git
cd Projek-Web-Panganita
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di folder utama proyek (sejajar dengan `package.json`). Isi sesuai kredensial lingkungan pengembangan:

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
PANGANITA_VISION_API_URL=https://projek-web-panganita-production.up.railway.app
```

> File `.env.local`, dataset, dan file model berukuran besar **tidak** di-commit ke repository.

### 4. Setup Database

1. Buka Supabase SQL Editor pada dashboard proyek Anda.
2. Jalankan isi [`database/schema.sql`](https://github.com/aulyaa12/Projek-Web-Panganita/blob/main/database/schema.sql) untuk membuat tabel, indeks, RLS, dan bucket Storage.
3. Jalankan isi [`database/seed.sql`](https://github.com/aulyaa12/Projek-Web-Panganita/blob/main/database/seed.sql) untuk mengisi data AKG, master bahan pangan, dan parameter rumus.

Panduan lengkap beserta ERD ada di [`database/README.md`](https://github.com/aulyaa12/Projek-Web-Panganita/blob/main/database/README.md).

### 5. Menjalankan Computer Vision (YOLO26n-seg) Secara Lokal — Opsional

Pastikan model berada di:

```text
backend/models/yolo26n_seg_v1/best.pt
```

Dari **root proyek**, instal dependensi Python:

```powershell
py -3.12 -m venv backend\.venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\backend\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

**Terminal 1 — FastAPI** (masuk ke folder `backend`):

```powershell
cd backend
python -m uvicorn src.vision.api:app --host 127.0.0.1 --port 8000 --reload
```

Untuk menggunakan backend lokal, ubah `.env.local` menjadi:

```env
PANGANITA_VISION_API_URL=http://127.0.0.1:8000
```

- Health Check: http://127.0.0.1:8000/health
- Swagger Vision API: http://127.0.0.1:8000/docs

### 6. Jalankan Website di VS Code

Buka **Terminal 2** di folder utama proyek:

```powershell
npm run dev
```

- Website: http://localhost:3000
- Dokumentasi API Next.js: http://localhost:3000/api-docs

Jika memakai FastAPI lokal, biarkan **Terminal 1 dan Terminal 2** tetap berjalan. Jika memakai Railway, cukup jalankan Next.js. Restart `npm run dev` setiap kali `.env.local` diubah.

### 7. Pengujian

```powershell
npm run
```

Jika tersedia script `test` di `package.json`, jalankan `npm test`. Untuk menguji Vision AI, unggah foto pada menu **Pindai** atau melalui Swagger `POST /detect`.

---

## ☁️ Deployment

| Komponen                 | Platform | Keterangan                                                                                                      |
| ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| Next.js (Frontend & API) | Vercel   | Website dan API Route. Terhubung ke repository GitHub. Seluruh environment variable diatur di Vercel.          |
| Database, Auth & Storage | Supabase | Data keluarga, pangan, dan riwayat. Jalankan `schema.sql` dan `seed.sql` pada project Supabase production. |
| FastAPI + YOLO26n-seg    | Railway  | Deteksi dan segmentasi pangan                                                                                   |

**Vision API Production:** https://projek-web-panganita-production.up.railway.app

Model **YOLO26n-seg PANGANITA V1** mengenali 15 kelas pangan, menghasilkan confidence, bounding box, polygon segmentation, dan ringkasan deteksi. Sistem juga memilih kelas dominan; pengguna dapat mengoreksi hasilnya secara manual.

---

## 🔒 Keamanan & Responsible AI

- `.env`, API key, token, password, dan dataset tidak boleh di-commit ke GitHub. Model besar mengikuti aturan penyimpanan eksternal dari pembimbing.
- Supabase menerapkan Row Level Security (RLS) untuk membatasi akses data pengguna.
- Upload foto menerima JPG, PNG, atau WebP, maksimal 8 MB.
- Hasil deteksi AI dapat dikoreksi secara manual; berat panen diisi pengguna, bukan diestimasi oleh YOLO.
- Hasil AI diberi penanda jelas, memuat rujukan sumber (Bu Nita), dan bukan pengganti nasihat tenaga kesehatan. Hasil deteksi pangan hanya usulan awal: Ibu dapat mengoreksi jenis pangan dan mengisi berat sebenarnya
- Informasi gizi dan simulasi pembagian panen merupakan estimasi, bukan diagnosis atau pengganti tenaga kesehatan.
- Nomor telepon dan identitas pribadi tidak dikirim ke prompt LLM.
- Dokumentasi lebih lanjut: [`docs/DOKUMENTASI_FITUR_AI.md`](./docs/DOKUMENTASI_FITUR_AI.md).

---

## 👥 Tim Pengembang (Kelompok 10 Malahayati)

- **Aulya Rakhmawati:** Database Architecture, AI Computer Vision Integration, Initial Assessment API & Backend Management.
- **Prawita Mepilianti:** AI RAG Chatbot Integration, Speech & Dialect Normalization, Swagger API Documentation, SQL Scripts & Seed Data, AI Technical Documentation.
- **Dita Surya Kartika:** Supabase Storage Integration, WhatsApp OTP Authentication, Presentation Deck & Video Showcase.
- **Dessy Christina Elseba Matakupan:** Product Requirement Document (PRD/BRD), User Story, User Flow, UI/UX Prototype, Registration Flow.

---

## 🎨 Kredit Aset Visual

- **Foto landing page:** [&#34;Woman sorting fish on a sandy coast&#34;](https://pixabay.com/photos/fishing-village-people-one-outside-3248682/) oleh [pasja1000](https://pixabay.com/users/pasja1000-6355831/) dari Pixabay, sesuai ketentuan [Pixabay Content License](https://pixabay.com/service/license-summary/).
- **Maskot Bu Nita & avatar Ibu:** dibuat dengan bantuan AI generatif menggunakan [ChatGPT](https://chatgpt.com/) (OpenAI), kemudian disesuaikan oleh tim PANGANITA.
