import { describe, expect, it } from "vitest";
import { hitungAlternatif } from "./hitung";
import type { AturanHitung, BahanHitung, KebutuhanGizi, ProfilHitung } from "./types";

const kebutuhan: KebutuhanGizi[] = [
  { kode: "ibu_dasar", nama: "Ibu dasar", jenis: "dasar", untuk_perhitungan: true, energi_kkal: 2250, protein_g: 60 },
  { kode: "hamil_tm3", nama: "Hamil TM3", jenis: "tambahan_hamil", untuk_perhitungan: true, energi_kkal: 300, protein_g: 30 },
  { kode: "anak_1_3", nama: "Anak 1-3", jenis: "dasar", untuk_perhitungan: true, energi_kkal: 1350, protein_g: 20 },
];

const profil: ProfilHitung = {
  ibu_hamil: true,
  trimester_hamil: 3,
  ibu_menyusui: false,
  periode_menyusui: null,
  jumlah_bayi_6_11: 0,
  jumlah_anak_1_3: 2,
  jumlah_anak_4_6: 0,
  jumlah_anak_7_9: 0,
  jumlah_anak_l_10_12: 0,
  jumlah_anak_p_10_12: 0,
};

const aturan: AturanHitung = {
  hari_cadangan_default: 3,
  pembulatan_kg: 0.1,
  porsi_protein_lauk: 0.3,
  porsi_energi_pokok: 0.5,
  porsi_pokok_dari_panen: 0.5,
  porsi_sayur_buah_g_per_orang: 400,
  porsi_sayur_buah_dari_panen: 1,
  batas_jual_seimbang: 0.5,
  persen_surplus_gizi: 0.5,
};

const lele: BahanHitung = {
  kategori: "lauk_hewani",
  bdd: 1,
  energi_kkal_per_100g_bdd: 92,
  protein_g_per_100g_bdd: 16.2,
};

const bayam: BahanHitung = {
  kategori: "sayur_buah",
  bdd: 1,
  energi_kkal_per_100g_bdd: 16,
  protein_g_per_100g_bdd: 0.9,
};

const dasarInput = {
  profil,
  kebutuhan,
  aturan,
  hargaJualPerKg: 8000,
  hariDisediakan: 3,
};

describe("hitungAlternatif", () => {
  it("menghitung AKG keluarga dan kebutuhan cadangan lele 2 kg", () => {
    const hasil = hitungAlternatif({ ...dasarInput, bahan: lele, beratPanenKg: 2 });
    expect(hasil.jumlahOrang).toBe(3);
    expect(hasil.akgEnergiKkal).toBe(5250);
    expect(hasil.akgProteinG).toBe(130);
    expect(hasil.kebutuhanCadanganKg).toBe(0.8);
    expect(hasil.kekuranganKg).toBe(0);
  });

  it("menghasilkan tiga alternatif dengan berat jual yang benar", () => {
    const { alternatif } = hitungAlternatif({ ...dasarInput, bahan: lele, beratPanenKg: 2 });
    expect(alternatif).toHaveLength(3);
    expect(alternatif[0].beratJualKg).toBe(1.2);
    expect(alternatif[1].beratJualKg).toBe(1.0);
    expect(alternatif[2].beratJualKg).toBe(0.6);
  });

  it("menghitung pendapatan dan hari tercukupi", () => {
    const { alternatif } = hitungAlternatif({ ...dasarInput, bahan: lele, beratPanenKg: 2 });
    expect(alternatif[0].pendapatanRp).toBe(9600);
    expect(alternatif[1].pendapatanRp).toBe(8000);
    expect(alternatif[2].pendapatanRp).toBe(4800);
    expect(alternatif[0].hariTercukupi).toBe(3.3);
    expect(alternatif[2].hariTercukupi).toBe(5.8);
  });

  it("hanya menampilkan satu alternatif saat panen kurang dari cadangan", () => {
    const hasil = hitungAlternatif({ ...dasarInput, bahan: bayam, beratPanenKg: 1 });
    expect(hasil.kebutuhanCadanganKg).toBe(3.6);
    expect(hasil.kekuranganKg).toBe(2.6);
    expect(hasil.alternatif).toHaveLength(1);
    expect(hasil.alternatif[0].beratJualKg).toBe(0);
    expect(hasil.alternatif[0].beratSimpanKg).toBe(1);
  });

  it("menolak bahan yang BDD-nya belum diisi", () => {
    expect(() =>
      hitungAlternatif({ ...dasarInput, bahan: { ...lele, bdd: null }, beratPanenKg: 2 }),
    ).toThrow("BDD bahan belum diisi");
  });
});
