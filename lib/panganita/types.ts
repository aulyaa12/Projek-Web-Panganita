// Tipe data yang mengikuti skema V9 di Supabase.

export type Kategori = "lauk_hewani" | "sayur_buah" | "makanan_pokok";
export type Keputusan = "prioritas_uang" | "seimbang" | "prioritas_gizi";

export interface ProfilKeluarga {
  id: number;
  user_id: string;
  nama_ibu: string;
  provinsi: string | null;
  kabupaten_kota: string | null;
  ibu_hamil: boolean;
  trimester_hamil: number | null;
  ibu_menyusui: boolean;
  periode_menyusui: number | null;
  jumlah_bayi_6_11: number;
  jumlah_anak_1_3: number;
  jumlah_anak_4_6: number;
  jumlah_anak_7_9: number;
  jumlah_anak_l_10_12: number;
  jumlah_anak_p_10_12: number;
}

export interface KebutuhanGizi {
  kode: string;
  nama: string;
  jenis: "dasar" | "tambahan_hamil" | "tambahan_menyusui";
  untuk_perhitungan: boolean;
  energi_kkal: number;
  protein_g: number;
}

export interface BahanPangan {
  id: number;
  nama: string;
  nama_kelas_cv: string;
  kategori: Kategori;
  bdd: number | null;

  // Komposisi zat gizi per 100 gram BDD
  energi_kkal_per_100g_bdd: number | null;
  protein_g_per_100g_bdd: number | null;
  lemak_g_per_100g_bdd: number | null;
  serat_g_per_100g_bdd: number | null;
  kalsium_mg_per_100g_bdd: number | null;
  vitamin_c_mg_per_100g_bdd: number | null;

  harga_umum_per_kg: number | null;
}


export interface PengaturanRumus {
  versi: string;
  status_pengesahan: "draft" | "disahkan";
  hari_cadangan_default: number;
  pembulatan_kg: number;
  porsi_protein_lauk: number;
  porsi_energi_pokok: number;
  porsi_pokok_dari_panen: number;
  porsi_sayur_buah_g_per_orang: number;
  porsi_sayur_buah_dari_panen: number;
  batas_jual_seimbang: number;
  persen_surplus_gizi: number;
}

// Bagian data yang dibutuhkan fungsi hitung.
export type ProfilHitung = Pick<
  ProfilKeluarga,
  | "ibu_hamil" | "trimester_hamil" | "ibu_menyusui" | "periode_menyusui"
  | "jumlah_bayi_6_11" | "jumlah_anak_1_3" | "jumlah_anak_4_6" | "jumlah_anak_7_9"
  | "jumlah_anak_l_10_12" | "jumlah_anak_p_10_12"
>;

export type BahanHitung = Pick<
  BahanPangan,
  "kategori" | "bdd" | "energi_kkal_per_100g_bdd" | "protein_g_per_100g_bdd"
>;

export type AturanHitung = Pick<
  PengaturanRumus,
  | "hari_cadangan_default" | "pembulatan_kg"
  | "porsi_protein_lauk" | "porsi_energi_pokok" | "porsi_pokok_dari_panen"
  | "porsi_sayur_buah_g_per_orang" | "porsi_sayur_buah_dari_panen"
  | "batas_jual_seimbang" | "persen_surplus_gizi"
>;

export interface AlternatifKeputusan {
  keputusan: Keputusan;
  label: string;
  beratJualKg: number;
  beratSimpanKg: number;
  pendapatanRp: number;
  hariTercukupi: number;
  kontribusiEnergiPersen: number;
  kontribusiProteinPersen: number;
  sisaEnergiKkal: number;
  sisaProteinG: number;
}

export interface HasilHitung {
  jumlahOrang: number;
  akgEnergiKkal: number;
  akgProteinG: number;
  kebutuhanHarianGramUtuh: number;
  kebutuhanCadanganKg: number;
  kekuranganKg: number;
  alternatif: AlternatifKeputusan[];
}
