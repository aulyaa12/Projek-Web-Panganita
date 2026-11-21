# Panduan Inisialisasi Database PANGANITA (Supabase PostgreSQL)

Dokumentasi ini menjelaskan langkah-langkah menyiapkan struktur database, keamanan Row Level Security (RLS), dan seed data awal platform **PANGANITA** dari nol.

---

## 1. File Database Tersedia

| File | Deskripsi |
|---|---|
| [`schema.sql`](./schema.sql) | DDL seluruh tabel (`profil_keluarga`, `kebutuhan_gizi`, `bahan_pangan`, `pengaturan_rumus`, `panen`, `riwayat_keputusan`, `otp_codes`, `percakapan`, `pesan_chat`), Index, kebijakan RLS, dan Storage Bucket `hasil-panen`. |
| [`seed.sql`](./seed.sql) | Data awal standar AKG Permenkes No. 28/2019, master bahan pangan pekarangan (Lele, Nila, Telur, Bayam, Kangkung, Ubi, dll), dan parameter rumus kalkulasi panen. |

---

## 2. Langkah Eksekusi di Supabase

1. Buka dashboard proyek **Supabase** Anda.
2. Masuk ke menu **SQL Editor** pada navigasi sisi kiri.
3. Klik tombol **New Query**.
4. Salin seluruh isi file [`database/schema.sql`](./schema.sql), tempelkan di SQL Editor, lalu klik **Run**. Pastikan status query menampilkan `Success`.
5. Buka tab query baru, salin seluruh isi file [`database/seed.sql`](./seed.sql), tempelkan di SQL Editor, lalu klik **Run**.

---

## 3. Cakupan Tabel & Relasi Utama

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFIL_KELUARGA : "user_id"
  PROFIL_KELUARGA ||--o{ PANEN : "profil_id"
  BAHAN_PANGAN ||--o{ PANEN : "bahan_id"
  PROFIL_KELUARGA ||--o{ RIWAYAT_KEPUTUSAN : "profil_id"
  PANEN |o--o{ RIWAYAT_KEPUTUSAN : "panen_id"
  PENGATURAN_RUMUS ||--o{ RIWAYAT_KEPUTUSAN : "versi_rumus"
  PROFIL_KELUARGA ||--o{ PERCAKAPAN : "profil_id"
  PERCAKAPAN ||--o{ PESAN_CHAT : "percakapan_id"

  AUTH_USERS {
    uuid id PK
  }
  PROFIL_KELUARGA {
    int id PK
    uuid user_id FK
    text nama_ibu
    text provinsi
    text kabupaten_kota
    bool ibu_hamil
    smallint trimester_hamil
    bool ibu_menyusui
    smallint periode_menyusui
    smallint jumlah_bayi_6_11
    smallint jumlah_anak_1_3
    smallint jumlah_anak_4_6
    smallint jumlah_anak_7_9
    smallint jumlah_anak_l_10_12
    smallint jumlah_anak_p_10_12
    timestamptz dibuat_pada
    timestamptz diperbarui_pada
  }
  BAHAN_PANGAN {
    int id PK
    text nama UK
    text nama_kelas_cv UK
    text kategori
    text kode_tkpi
    numeric bdd
    numeric energi_kkal_per_100g_bdd
    numeric protein_g_per_100g_bdd
    numeric lemak_g_per_100g_bdd
    numeric serat_g_per_100g_bdd
    numeric kalsium_mg_per_100g_bdd
    numeric vitamin_c_mg_per_100g_bdd
    numeric harga_umum_per_kg
    timestamptz harga_diperbarui_pada
  }
  PANEN {
    int id PK
    int profil_id FK
    int bahan_id FK
    text path_foto UK
    text tipe_mime
    int ukuran_byte
    text model_versi
    text label_mentah
    numeric skor_keyakinan
    numeric berat_kg
    numeric harga_jual_per_kg
    timestamptz dibuat_pada
  }
  PENGATURAN_RUMUS {
    text versi PK
    text status_pengesahan
    text disahkan_oleh
    date berlaku_mulai
    smallint hari_cadangan_default
    numeric pembulatan_kg
    numeric porsi_protein_lauk
    numeric porsi_energi_pokok
    numeric porsi_pokok_dari_panen
    numeric porsi_sayur_buah_g_per_orang
    numeric porsi_sayur_buah_dari_panen
    numeric batas_jual_seimbang
    numeric persen_surplus_gizi
    timestamptz dibuat_pada
  }
  RIWAYAT_KEPUTUSAN {
    int id PK
    int profil_id FK
    int panen_id FK
    text versi_rumus FK
    text nama_bahan
    smallint jumlah_orang
    numeric berat_panen_kg
    numeric harga_jual_per_kg
    smallint hari_disediakan
    numeric akg_energi_kkal
    numeric akg_protein_g
    numeric kebutuhan_cadangan_kg
    numeric kekurangan_kg
    text keputusan
    numeric berat_simpan_kg
    numeric berat_jual_kg
    numeric pendapatan_rp
    numeric kontribusi_energi_persen
    numeric kontribusi_protein_persen
    numeric sisa_energi_kkal
    numeric sisa_protein_g
    timestamptz dibuat_pada
  }
  PERCAKAPAN {
    uuid id PK
    int profil_id FK
    text judul
    bool diarsipkan
    timestamptz dibuat_pada
    timestamptz diperbarui_pada
  }
  PESAN_CHAT {
    bigint id PK
    uuid percakapan_id FK
    text peran
    text isi
    jsonb sumber_rujukan
    text model_versi
    timestamptz dibuat_pada
  }
  KEBUTUHAN_GIZI {
    text kode PK
    text nama
    text jenis
    bool untuk_perhitungan
    numeric energi_kkal
    numeric protein_g
    text sumber
  }
  OTP_CODES {
    bigint id PK
    varchar phone
    char code_hash
    smallint attempts
    timestamptz expires_at
    timestamptz consumed_at
    timestamptz created_at
  }
```

---

## 4. Keamanan & Row Level Security (RLS)

- **Semua tabel dilindungi RLS aktif**: Data pribadi (`profil_keluarga`), catatan panen, riwayat keputusan, dan percakapan chat Bu Nita AI terisolasi per `auth.uid()`.
- **Tabel Publik Read-Only**: `kebutuhan_gizi` dan `bahan_pangan` dapat dibaca secara publik oleh aplikasi tanpa risiko penulisan ilegal.
- **Tabel Autentikasi `otp_codes`**: Dilindungi RLS tanpa eksposur ke klien Supabase publik; interaksi dilakukan eksklusif via direct PostgreSQL connection di Route Handler.
- **Supabase Storage Bucket `hasil-panen`**: File foto hanya dapat diunggah, dibaca, dan dihapus oleh pemiliknya masing-masing pada path `/{user_id}/{nama_file}`.

