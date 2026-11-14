"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import { hitungAlternatif, KesalahanHitung } from "@/lib/panganita/hitung";

import {
  muatAturanAktif,
  muatBahan,
  muatKebutuhanGizi,
  muatProfilSaya,
} from "@/lib/data/referensi";

import { gagal, ok, pesanGalat } from "@/lib/aksi";

// ============================================================
// KONFIGURASI FOTO
// ============================================================

const BUCKET_FOTO = "hasil-panen";

const MAKS_FOTO_BYTE = 10 * 1024 * 1024;

const TIPE_FOTO = ["image/jpeg", "image/png", "image/webp"];

const EKSTENSI_FOTO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ============================================================
// VALIDASI INPUT
// ============================================================

const fotoSchema = z
  .object({
    path: z.string().min(1).max(500),
    tipeMime: z.enum(TIPE_FOTO),
    ukuranByte: z.number().int().positive().max(MAKS_FOTO_BYTE),
  })
  .nullable()
  .optional();

const inputSchema = z.object({
  bahanId: z.number().int().positive(),
  beratPanenKg: z.number().positive().max(100000),
  hargaJualPerKg: z.number().nonnegative().max(10000000),
  hariDisediakan: z.number().int().min(1).max(30),
});

const simpanSchema = inputSchema.extend({
  keputusan: z.enum(["prioritas_uang", "seimbang", "prioritas_gizi"]),
  foto: fotoSchema,
});

// ============================================================
// VALIDASI PATH FOTO
// ============================================================

function validasiPathFoto(path, userId, tipeMime) {
  const bagian = path.split("/");

  if (bagian.length !== 2 || bagian[0] !== userId) {
    throw new KesalahanHitung("Lokasi foto tidak sesuai dengan akun pengguna.");
  }

  const namaFile = bagian[1];
  const ekstensi = EKSTENSI_FOTO[tipeMime];

  const polaNama =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

  if (
    !polaNama.test(namaFile) ||
    !namaFile.toLowerCase().endsWith(`.${ekstensi}`)
  ) {
    throw new KesalahanHitung("Nama file foto tidak valid.");
  }
}

// ============================================================
// HAPUS FOTO STORAGE
// ============================================================

async function hapusFotoStorage(supabase, path) {
  const { error } = await supabase.storage.from(BUCKET_FOTO).remove([path]);

  if (error) {
    console.error("Gagal menghapus foto dari Storage:", error);
    return false;
  }

  return true;
}

// ============================================================
// VERIFIKASI FOTO STORAGE
// ============================================================

async function verifikasiFotoStorage(supabase, path, userId) {
  const { data: daftarFile, error } = await supabase.storage
    .from(BUCKET_FOTO)
    .list(userId, {
      limit: 100,
    });

  if (error) {
    console.error("Gagal memeriksa foto Storage:", error);

    throw new KesalahanHitung("Foto gagal diverifikasi. Silakan coba kembali.");
  }

  const namaFile = path.split("/")[1];

  const ditemukan = daftarFile?.some((file) => file.name === namaFile);

  if (!ditemukan) {
    throw new KesalahanHitung(
      "Foto tidak ditemukan di penyimpanan. Silakan unggah ulang.",
    );
  }
}

// ============================================================
// PERHITUNGAN SERVER
// ============================================================

async function jalankanHitung(input) {
  const profil = await muatProfilSaya();

  if (!profil) {
    throw new KesalahanHitung("Lengkapi profil keluarga terlebih dahulu.");
  }

  const [kebutuhan, aturan, bahan] = await Promise.all([
    muatKebutuhanGizi(),
    muatAturanAktif(),
    muatBahan(input.bahanId),
  ]);

  if (!bahan) {
    throw new KesalahanHitung("Pangan yang dipilih tidak ditemukan.");
  }

  const hasil = hitungAlternatif({
    profil,
    kebutuhan,
    bahan,
    aturan,
    beratPanenKg: input.beratPanenKg,
    hargaJualPerKg: input.hargaJualPerKg,
    hariDisediakan: input.hariDisediakan,
  });

  return {
    profil,
    aturan,
    bahan,
    hasil,
  };
}

// ============================================================
// AMBIL ALTERNATIF PEMBAGIAN PANEN
// ============================================================

export async function ambilAlternatif(raw) {
  try {
    const input = inputSchema.parse(raw);

    const { hasil } = await jalankanHitung(input);

    return ok(hasil);
  } catch (e) {
    console.error("Kesalahan perhitungan:", e);

    return gagal(pesanGalat(e));
  }
}

// ============================================================
// SIMPAN PANEN, FOTO, DAN KEPUTUSAN
// ============================================================

export async function simpanKeputusan(raw) {
  let pathFoto = null;
  let supabase = null;

  let pertahankanFoto = false;
  let keputusanTersimpan = false;
  let riwayatIdTersimpan = null;

  try {
    // 1. VALIDASI INPUT

    const input = simpanSchema.parse(raw);

    supabase = await createClient();

    // 2. VERIFIKASI PENGGUNA

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new KesalahanHitung(
        "Sesi login tidak valid. Silakan masuk kembali.",
      );
    }

    // 3. VALIDASI FOTO

    const foto = input.foto ?? null;

    if (foto) {
      validasiPathFoto(foto.path, user.id, foto.tipeMime);

      pathFoto = foto.path;
    }

    // 4. HITUNG ULANG KEBUTUHAN GIZI

    const { profil, aturan, bahan, hasil } = await jalankanHitung(input);

    if (profil.user_id !== user.id) {
      throw new KesalahanHitung("Profil keluarga tidak sesuai dengan akun.");
    }

    // 5. CARI ALTERNATIF YANG DIPILIH

    const pilihan = hasil.alternatif.find(
      (a) => a.keputusan === input.keputusan,
    );

    if (!pilihan) {
      throw new KesalahanHitung("Pilihan tidak tersedia untuk panen ini.");
    }

    // 6. VERIFIKASI FOTO DI STORAGE

    if (foto) {
      await verifikasiFotoStorage(supabase, foto.path, user.id);
    }

    // 7. SIMPAN DATA PANEN

    const { data: panen, error: errPanen } = await supabase
      .from("panen")
      .insert({
        profil_id: profil.id,
        bahan_id: bahan.id,
        path_foto: foto?.path ?? null,
        tipe_mime: foto?.tipeMime ?? null,
        ukuran_byte: foto?.ukuranByte ?? null,
        berat_kg: input.beratPanenKg,
        harga_jual_per_kg: input.hargaJualPerKg,
      })
      .select("id")
      .single();

    if (errPanen || !panen) {
      console.error("Gagal menyimpan data panen:", errPanen);

      throw new KesalahanHitung("Data panen gagal disimpan.");
    }

    // 8. SIMPAN SNAPSHOT KEPUTUSAN

    const { data: riwayat, error: errRiwayat } = await supabase
      .from("riwayat_keputusan")
      .insert({
        profil_id: profil.id,
        panen_id: panen.id,
        versi_rumus: aturan.versi,
        nama_bahan: bahan.nama,
        jumlah_orang: hasil.jumlahOrang,
        berat_panen_kg: input.beratPanenKg,
        harga_jual_per_kg: input.hargaJualPerKg,
        hari_disediakan: input.hariDisediakan,
        akg_energi_kkal: hasil.akgEnergiKkal,
        akg_protein_g: hasil.akgProteinG,
        kebutuhan_cadangan_kg: hasil.kebutuhanCadanganKg,
        kekurangan_kg: hasil.kekuranganKg,
        keputusan: pilihan.keputusan,
        berat_simpan_kg: pilihan.beratSimpanKg,
        berat_jual_kg: pilihan.beratJualKg,
        pendapatan_rp: pilihan.pendapatanRp,
        kontribusi_energi_persen: pilihan.kontribusiEnergiPersen,
        kontribusi_protein_persen: pilihan.kontribusiProteinPersen,
        sisa_energi_kkal: pilihan.sisaEnergiKkal,
        sisa_protein_g: pilihan.sisaProteinG,
      })
      .select("id")
      .single();

    // 9. PENANGANAN JIKA RIWAYAT GAGAL

    if (errRiwayat || !riwayat) {
      console.error("Gagal menyimpan riwayat:", errRiwayat);

      const { error: errHapusPanen } = await supabase
        .from("panen")
        .delete()
        .eq("id", panen.id);

      if (errHapusPanen) {
        console.error("Gagal menghapus data panen:", errHapusPanen);

        pertahankanFoto = true;
      } else if (pathFoto) {
        const fotoTerhapus = await hapusFotoStorage(supabase, pathFoto);

        if (fotoTerhapus) {
          pathFoto = null;
        }
      }

      throw new KesalahanHitung("Riwayat keputusan gagal disimpan.");
    }

    // 10. TANDAI PENYIMPANAN BERHASIL

    keputusanTersimpan = true;
    riwayatIdTersimpan = riwayat.id;

    // 11. PERBARUI HALAMAN

    try {
      revalidatePath("/riwayat");
      revalidatePath("/dashboard");
      revalidatePath("/pindai");
    } catch (error) {
      console.error("Gagal memperbarui cache halaman:", error);
    }

    // 12. KEMBALIKAN HASIL

    return ok({
      riwayatId: riwayat.id,
    });
  } catch (e) {
    // 13. PEMBERSIHAN FOTO JIKA PROSES GAGAL

    if (!keputusanTersimpan && supabase && pathFoto && !pertahankanFoto) {
      await hapusFotoStorage(supabase, pathFoto);
    }

    if (keputusanTersimpan && riwayatIdTersimpan !== null) {
      return ok({
        riwayatId: riwayatIdTersimpan,
      });
    }

    console.error("Kesalahan simpan keputusan:", e);

    return gagal(pesanGalat(e));
  }
}
