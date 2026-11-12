# Cara menjalankan PANGANITA

## 1. Pasang dependensi
    npm install

## 2. Isi koneksi Supabase
1. Salin `.env.example` menjadi `.env.local`.
2. Buka Supabase -> Project Settings -> API.
3. Salin "Project URL" ke `NEXT_PUBLIC_SUPABASE_URL`.
4. Salin "anon public" key ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Koneksi dibaca di `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), dan `lib/supabase/middleware.ts` (penyegaran sesi).
Jangan pernah memasukkan service role key ke proyek ini.

## 3. Siapkan database di Supabase
Database dibuat langsung di Supabase, bukan dari folder proyek.
Buka SQL Editor di Supabase, lalu jalankan berurutan:
1. Skrip V9 (skema utama dan data awal).
2. Skrip 001 WhatsApp OTP.
3. Skrip 002 OTP hardening.
4. Skrip 003 chatbot Bu Nita (lihat pesan pendamping).

## 4. Buat akun uji
Supabase -> Authentication -> Users -> Add user. Akun ini dipakai di halaman Masuk.

## 5. Jalankan
    npm run dev
Buka http://localhost:3000.

## 6. Uji rumus
    npm test

## Opsional: aktifkan jawaban Bu Nita
Isi `LLM_API_KEY` di `.env.local`, lalu jalankan ulang `npm run dev`.

## Catatan
- Pencarian dokumen (RAG) belum aktif. `lib/chat/rag.ts` masih mengembalikan daftar kosong.
- Pindai panen memakai input manual. Integrasi YOLO menyusul.
- Login OTP WhatsApp akan disambungkan oleh tim.
