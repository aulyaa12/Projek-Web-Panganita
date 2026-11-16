# PANGANITA (Pangan dan Gizi untuk Keluarga)
> **Solusi Cerdas Ketahanan Pangan & Pemenuhan Gizi Keluarga 1.000 HPK Berbasis AI & Pekarangan**  
> *Final Project — Bootcamp Perempuan Inovasi GENerasi AI 2026 (Track: AI Full-Stack Web Development)*

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-emerald?logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20AI-Gemini%203.5%20Flash-blue?logo=google)](https://ai.google.dev/)
[![Deployment](https://img.shields.io/badge/Vercel-Production%20Live-black?logo=vercel)](https://panganita.vercel.app/)

---

## 🌾 Tentang PANGANITA
**PANGANITA** adalah aplikasi web full-stack yang dirancang untuk memberdayakan perempuan Indonesia (khususnya ibu rumah tangga dengan anak usia 1.000 Hari Pertama Kehidupan) dalam mengelola hasil panen pekarangan secara seimbang antara **kebutuhan gizi keluarga** dan **penjualan ekonomi rumah tangga**.

Platform ini menggabungkan:
1. **Asesmen Gizi Keluarga 1.000 HPK**: Perhitungan otomatis Angka Kecukupan Gizi (AKG) berbasis standar Permenkes No. 28/2019.
2. **Kalkulator Keputusan Panen (3 Alternatif)**: Simulasi alokasi hasil panen (Prioritas Uang, Seimbang, dan Prioritas Gizi).
3. **Bu Nita AI (RAG & Voice Note)**: Asisten gizi interaktif ramah dialek daerah (Jawa, Sunda, Betawi, Melayu) dengan dukungan masukan suara dan rujukan buku panduan resmi.
4. **Login Berbasis WhatsApp OTP**: Autentikasi mudah dan ramah pengguna tanpa kerumitan kata sandi panjang.

---

## 📑 Dokumentasi & Deliverable Final Project

| Deliverable | Tautan / Lokasi File | Deskripsi |
|---|---|---|
| **API Documentation** | [`/api-docs`](https://panganita.vercel.app/api-docs) / [`app/api/openapi.json/route.js`](./app/api/openapi.json/route.js) | Swagger UI interaktif & spesifikasi OpenAPI 3.0.3 lengkap. |
| **Dokumentasi Fitur AI** | [`docs/DOKUMENTASI_FITUR_AI.md`](./docs/DOKUMENTASI_FITUR_AI.md) | Penjelasan arsitektur RAG, multi-tier fallback LLM, evaluasi test cases, dan prinsip Responsible AI. |
| **Script SQL & Seed Data** | [`database/schema.sql`](./database/schema.sql) & [`database/seed.sql`](./database/seed.sql) | DDL seluruh tabel, kebijakan Row Level Security (RLS), dan seed master bahan pangan. |
| **Panduan Setup Database** | [`database/README.md`](./database/README.md) | Panduan langkah inisialisasi database Supabase dari nol. |

---

## 🛠️ Tech Stack & Arsitektur

- **Front-End**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Sonner.
- **Back-End**: Next.js Server Actions & Route Handlers (`/api/chat`, `/api/auth/whatsapp/*`, `/api/openapi.json`).
- **Database & Storage**: Supabase PostgreSQL (dengan Row Level Security aktif) & Supabase Storage Bucket `hasil-panen`.
- **AI & Machine Learning**:
  - **Conversational RAG**: Google Gemini 3.5 Flash dengan sistem multi-tier failover (`gemini-3.5-flash`, `gemini-3.1-flash-lite-preview`, `gemini-3-flash-preview`, `gemini-flash-latest`, `gemini-flash-lite-latest`).
  - **Dialect Normalization & Timezone Sync**: Deteksi dan penerjemahan kosa kata daerah serta sinkronisasi waktu wilayah (WIB/WITA/WIT).
  - **Speech-to-Text**: Pengenalan suara Voice Note audio base64.
- **SMS / WhatsApp Gateway**: Fonnte API untuk pengiriman OTP WhatsApp.
- **Testing**: Vitest (Unit Test kalkulasi alternatif gizi & AKG).

---

## 🚀 Cara Menjalankan Aplikasi di Lokal (Local Development)

### 1. Prasyarat
- Node.js versi 18+ (disarankan Node.js v20 atau v22)
- Akun Supabase (project PostgreSQL aktif)
- Google Gemini API Key

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
```

### 4. Setup Database
1. Buka Supabase SQL Editor pada dashboard proyek Anda.
2. Jalankan isi file [`database/schema.sql`](./database/schema.sql) untuk membuat tabel, indeks, dan RLS.
3. Jalankan isi file [`database/seed.sql`](./database/seed.sql) untuk mengisi data master pangan & standar AKG.

### 5. Jalankan Pengujian (Testing)
```bash
npm test
```

### 6. Jalankan Server Development
```bash
npm run dev
```
Aplikasi dapat diakses di browser pada `http://localhost:3000`.  
Dokumentasi Swagger API dapat diakses di `http://localhost:3000/api-docs`.

---

## 👥 Tim Pengembang (Kelompok PANGANITA)
- **Aulya Rakhmawati**: Database Architecture, AI Computer Vision Integration, Initial Assessment API & Backend Management.
- **Prawita Mepilianti**: AI RAG Chatbot Integration, Speech & Dialect Normalization, Swagger API Documentation, SQL Scripts & Seed Data, AI Technical Documentation.
- **Dita Surya Kartika**: Supabase Storage Integration, WhatsApp OTP Authentication, Presentation Deck & Video Showcase.
- **Deasy**: Product Requirement Document (PRD/BRD), User Story, User Flow, UI/UX Prototype, Registration Flow.

