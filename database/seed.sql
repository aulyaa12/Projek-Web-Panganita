-- ============================================================================
-- PANGANITA DATABASE SEED DATA
-- Master Bahan Pangan, Angka Kecukupan Gizi (AKG), dan Parameter Rumus
-- ============================================================================
-- Jalankan setelah schema.sql berhasil dieksekusi di Supabase SQL Editor.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. SEED KEBUTUHAN GIZI (Permenkes No. 28 Tahun 2019)
-- ----------------------------------------------------------------------------
INSERT INTO public.kebutuhan_gizi (kode, nama, jenis, untuk_perhitungan, energi_kkal, protein_g, sumber)
VALUES
    ('bayi_0_5',           'Bayi 0–5 bulan (ASI eksklusif, info saja)', 'dasar',             FALSE,  550,   9, 'Permenkes No. 28 Tahun 2019'),
    ('bayi_6_11',          'Bayi 6–11 bulan',                           'dasar',             TRUE,   800,  15, 'Permenkes No. 28 Tahun 2019'),
    ('anak_1_3',           'Anak 1–3 tahun',                            'dasar',             TRUE,  1350,  20, 'Permenkes No. 28 Tahun 2019'),
    ('anak_4_6',           'Anak 4–6 tahun',                            'dasar',             TRUE,  1400,  25, 'Permenkes No. 28 Tahun 2019'),
    ('anak_7_9',           'Anak 7–9 tahun',                            'dasar',             TRUE,  1650,  40, 'Permenkes No. 28 Tahun 2019'),
    ('anak_l_10_12',       'Anak laki-laki 10–12 tahun',                'dasar',             TRUE,  2000,  50, 'Permenkes No. 28 Tahun 2019'),
    ('anak_p_10_12',       'Anak perempuan 10–12 tahun',                'dasar',             TRUE,  1900,  55, 'Permenkes No. 28 Tahun 2019'),
    ('ibu_dasar',          'Ibu dewasa (basis perempuan 19–29 tahun)',  'dasar',             TRUE,  2250,  60, 'Permenkes No. 28 Tahun 2019'),
    ('hamil_tm1',          'Tambahan hamil trimester 1',                'tambahan_hamil',    TRUE,   180,   1, 'Permenkes No. 28 Tahun 2019'),
    ('hamil_tm2',          'Tambahan hamil trimester 2',                'tambahan_hamil',    TRUE,   300,  10, 'Permenkes No. 28 Tahun 2019'),
    ('hamil_tm3',          'Tambahan hamil trimester 3',                'tambahan_hamil',    TRUE,   300,  30, 'Permenkes No. 28 Tahun 2019'),
    ('menyusui_6_pertama', 'Tambahan menyusui 6 bulan pertama',        'tambahan_menyusui', TRUE,   330,  20, 'Permenkes No. 28 Tahun 2019'),
    ('menyusui_6_kedua',   'Tambahan menyusui 6 bulan kedua',          'tambahan_menyusui', TRUE,   400,  15, 'Permenkes No. 28 Tahun 2019')
ON CONFLICT (kode) DO UPDATE SET
    nama = EXCLUDED.nama,
    jenis = EXCLUDED.jenis,
    untuk_perhitungan = EXCLUDED.untuk_perhitungan,
    energi_kkal = EXCLUDED.energi_kkal,
    protein_g = EXCLUDED.protein_g,
    sumber = EXCLUDED.sumber;

-- ----------------------------------------------------------------------------
-- 2. SEED PENGATURAN RUMUS KALKULASI PANEN
-- ----------------------------------------------------------------------------
INSERT INTO public.pengaturan_rumus (
    versi, status_pengesahan, disahkan_oleh, berlaku_mulai,
    hari_cadangan_default, pembulatan_kg,
    porsi_protein_lauk,
    porsi_energi_pokok, porsi_pokok_dari_panen,
    porsi_sayur_buah_g_per_orang, porsi_sayur_buah_dari_panen,
    batas_jual_seimbang, persen_surplus_gizi
)
VALUES (
    'v1-draft', 'draft', NULL, DATE '2026-11-09',
    3, 0.100,
    0.300,             -- 30% kebutuhan protein keluarga ditargetkan dari panen lauk
    0.500, 0.500,      -- 50% energi pokok, 50% dari hasil panen
    400.00, 1.000,     -- 400g sayur/buah per orang/hari (WHO / Kemenkes)
    0.500, 0.500
)
ON CONFLICT (versi) DO UPDATE SET
    hari_cadangan_default = EXCLUDED.hari_cadangan_default,
    pembulatan_kg = EXCLUDED.pembulatan_kg,
    porsi_protein_lauk = EXCLUDED.porsi_protein_lauk,
    porsi_energi_pokok = EXCLUDED.porsi_energi_pokok,
    porsi_pokok_dari_panen = EXCLUDED.porsi_pokok_dari_panen,
    porsi_sayur_buah_g_per_orang = EXCLUDED.porsi_sayur_buah_g_per_orang,
    porsi_sayur_buah_dari_panen = EXCLUDED.porsi_sayur_buah_dari_panen,
    batas_jual_seimbang = EXCLUDED.batas_jual_seimbang,
    persen_surplus_gizi = EXCLUDED.persen_surplus_gizi;

-- ----------------------------------------------------------------------------
-- 3. SEED MASTER BAHAN PANGAN PEKARANGAN & NILAI GIZI TKPI
-- ----------------------------------------------------------------------------
INSERT INTO public.bahan_pangan (
    nama, nama_kelas_cv, kategori, kode_tkpi,
    bdd, energi_kkal_per_100g_bdd, protein_g_per_100g_bdd, lemak_g_per_100g_bdd,
    serat_g_per_100g_bdd, kalsium_mg_per_100g_bdd, vitamin_c_mg_per_100g_bdd,
    harga_umum_per_kg, harga_diperbarui_pada
)
VALUES
    -- LAUK HEWANI PEKARANGAN / KOLAM
    ('Ikan Lele', 'ikan_lele', 'lauk_hewani', 'IK001',
     0.800,  92.00, 16.20, 2.50, 0.00,  20.00,  0.00, 26000.00, now()),

    ('Ikan Nila', 'ikan_nila', 'lauk_hewani', 'IK002',
     0.800,  96.00, 20.08, 1.70, 0.00,  10.00,  0.00, 32000.00, now()),

    ('Telur Ayam Kampung', 'telur_ayam', 'lauk_hewani', 'TL001',
     0.890, 143.00, 12.60, 9.50, 0.00,  56.00,  0.00, 30000.00, now()),

    -- SAYUR & BUAH PEKARANGAN
    ('Bayam Hijau', 'bayam_hijau', 'sayur_buah', 'SY001',
     0.710,  16.00,  0.90, 0.40, 0.70, 166.00, 41.00,  8000.00, now()),

    ('Kangkung', 'kangkung', 'sayur_buah', 'SY002',
     0.670,  19.00,  2.60, 0.30, 2.10,  67.00, 17.00,  7000.00, now()),

    ('Tomat Merah', 'tomat_merah', 'sayur_buah', 'SY003',
     0.950,  20.00,  1.00, 0.30, 1.50,   8.00, 27.00, 14000.00, now()),

    ('Cabai Rawit', 'cabai_rawit', 'sayur_buah', 'SY004',
     0.850, 103.00,  4.70, 2.40, 4.30,  45.00, 70.00, 45000.00, now()),

    ('Terung Ungu', 'terung_ungu', 'sayur_buah', 'SY005',
     0.870,  24.00,  1.10, 0.20, 1.40,  15.00,  5.00, 10000.00, now()),

    ('Kacang Panjang', 'kacang_panjang', 'sayur_buah', 'SY006',
     0.920,  39.00,  3.00, 0.30, 1.70,  49.00, 19.00, 12000.00, now()),

    -- PANGAN POKOK PEKARANGAN
    ('Ubi Jalar Ungu / Kuning', 'ubi_jalar', 'makanan_pokok', 'PK001',
     0.860, 119.00,  1.80, 0.70, 1.40,  30.00, 21.00,  9000.00, now()),

    ('Singkong (Ubi Kayu)', 'singkong', 'makanan_pokok', 'PK002',
     0.850, 154.00,  1.00, 0.30, 0.90,  33.00, 30.00,  6000.00, now()),

    ('Jagung Manis', 'jagung_manis', 'makanan_pokok', 'PK003',
     0.900,  96.00,  3.40, 1.20, 2.20,   3.00,  7.00, 11000.00, now())
ON CONFLICT (nama) DO UPDATE SET
    nama_kelas_cv = EXCLUDED.nama_kelas_cv,
    kategori = EXCLUDED.kategori,
    kode_tkpi = EXCLUDED.kode_tkpi,
    bdd = EXCLUDED.bdd,
    energi_kkal_per_100g_bdd = EXCLUDED.energi_kkal_per_100g_bdd,
    protein_g_per_100g_bdd = EXCLUDED.protein_g_per_100g_bdd,
    lemak_g_per_100g_bdd = EXCLUDED.lemak_g_per_100g_bdd,
    serat_g_per_100g_bdd = EXCLUDED.serat_g_per_100g_bdd,
    kalsium_mg_per_100g_bdd = EXCLUDED.kalsium_mg_per_100g_bdd,
    vitamin_c_mg_per_100g_bdd = EXCLUDED.vitamin_c_mg_per_100g_bdd,
    harga_umum_per_kg = EXCLUDED.harga_umum_per_kg,
    harga_diperbarui_pada = EXCLUDED.harga_diperbarui_pada;

COMMIT;

