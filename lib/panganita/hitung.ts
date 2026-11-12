import type {
  AlternatifKeputusan,
  AturanHitung,
  BahanHitung,
  HasilHitung,
  KebutuhanGizi,
  Keputusan,
  ProfilHitung,
} from "./types";

// Kesalahan yang aman ditampilkan ke pengguna.
export class KesalahanHitung extends Error {}

const PETA_ANAK = [
  { kolom: "jumlah_bayi_6_11", kode: "bayi_6_11" },
  { kolom: "jumlah_anak_1_3", kode: "anak_1_3" },
  { kolom: "jumlah_anak_4_6", kode: "anak_4_6" },
  { kolom: "jumlah_anak_7_9", kode: "anak_7_9" },
  { kolom: "jumlah_anak_l_10_12", kode: "anak_l_10_12" },
  { kolom: "jumlah_anak_p_10_12", kode: "anak_p_10_12" },
] as const;

const bulat = (nilai: number, digit: number): number => {
  const faktor = 10 ** digit;
  return Math.round(nilai * faktor) / faktor;
};

// Pembulatan ke atas ke kelipatan langkah. Pengurangan 1e-9 mencegah galat desimal.
const kelipatanKeAtas = (nilai: number, langkah: number): number =>
  bulat(Math.ceil(nilai / langkah - 1e-9) * langkah, 3);

const persen = (bagian: number, total: number): number =>
  total > 0 ? (bagian / total) * 100 : 0;

const ambilKebutuhan = (peta: Map<string, KebutuhanGizi>, kode: string): KebutuhanGizi => {
  const baris = peta.get(kode);
  if (!baris) throw new KesalahanHitung(`Data kebutuhan gizi "${kode}" belum tersedia.`);
  return baris;
};

interface BahanSiap {
  kategori: BahanHitung["kategori"];
  bdd: number;
  energi: number;
  protein: number;
}

function siapkanBahan(bahan: BahanHitung): BahanSiap {
  if (bahan.bdd === null || bahan.bdd <= 0 || bahan.bdd > 1) {
    throw new KesalahanHitung("BDD bahan belum diisi atau tidak valid.");
  }
  if (bahan.energi_kkal_per_100g_bdd === null || bahan.protein_g_per_100g_bdd === null) {
    throw new KesalahanHitung("Nilai energi atau protein bahan belum diisi.");
  }
  if (bahan.energi_kkal_per_100g_bdd <= 0 || bahan.protein_g_per_100g_bdd <= 0) {
    throw new KesalahanHitung("Nilai energi atau protein bahan harus lebih dari 0.");
  }
  return {
    kategori: bahan.kategori,
    bdd: bahan.bdd,
    energi: bahan.energi_kkal_per_100g_bdd,
    protein: bahan.protein_g_per_100g_bdd,
  };
}

// Kebutuhan ibu = kebutuhan dasar ibu + tambahan hamil atau menyusui.
// Jika hamil dan menyusui bersamaan, dipakai nilai terbesar per komponen (usulan, perlu disahkan).
function hitungAkgIbu(
  profil: ProfilHitung,
  peta: Map<string, KebutuhanGizi>,
): { energi: number; protein: number } {
  const dasar = ambilKebutuhan(peta, "ibu_dasar");
  const tambahan: KebutuhanGizi[] = [];

  if (profil.ibu_hamil) {
    if (profil.trimester_hamil === null) {
      throw new KesalahanHitung("Trimester kehamilan belum dipilih.");
    }
    tambahan.push(ambilKebutuhan(peta, `hamil_tm${profil.trimester_hamil}`));
  }

  if (profil.ibu_menyusui) {
    const kode = profil.periode_menyusui === 1 ? "menyusui_6_pertama" : "menyusui_6_kedua";
    tambahan.push(ambilKebutuhan(peta, kode));
  }

  const energiTambahan = Math.max(0, ...tambahan.map((t) => t.energi_kkal));
  const proteinTambahan = Math.max(0, ...tambahan.map((t) => t.protein_g));

  return {
    energi: dasar.energi_kkal + energiTambahan,
    protein: dasar.protein_g + proteinTambahan,
  };
}

function hitungGramBersihPerHari(
  bahan: BahanSiap,
  aturan: AturanHitung,
  akgEnergi: number,
  akgProtein: number,
  jumlahOrang: number,
): number {
  switch (bahan.kategori) {
    case "lauk_hewani":
      return (akgProtein * aturan.porsi_protein_lauk * 100) / bahan.protein;
    case "makanan_pokok":
      return (
        (akgEnergi * aturan.porsi_energi_pokok * aturan.porsi_pokok_dari_panen * 100) /
        bahan.energi
      );
    case "sayur_buah":
      return jumlahOrang * aturan.porsi_sayur_buah_g_per_orang * aturan.porsi_sayur_buah_dari_panen;
  }
}

interface KonteksAlternatif {
  beratPanenKg: number;
  hargaJualPerKg: number;
  hariDisediakan: number;
  bdd: number;
  energiPer100g: number;
  proteinPer100g: number;
  gramUtuhPerHari: number;
  akgEnergi: number;
  akgProtein: number;
}

function buatAlternatif(
  keputusan: Keputusan,
  label: string,
  jualAwal: number,
  k: KonteksAlternatif,
): AlternatifKeputusan {
  const beratJual = bulat(Math.min(Math.max(jualAwal, 0), k.beratPanenKg), 3);
  const beratSimpan = bulat(k.beratPanenKg - beratJual, 3);

  // Gizi dihitung dari berat bersih, yaitu berat simpan dikali BDD.
  const simpanBersihPerHariG = (beratSimpan * 1000 * k.bdd) / k.hariDisediakan;
  const energiSimpan = (simpanBersihPerHariG * k.energiPer100g) / 100;
  const proteinSimpan = (simpanBersihPerHariG * k.proteinPer100g) / 100;

  return {
    keputusan,
    label,
    beratJualKg: beratJual,
    beratSimpanKg: beratSimpan,
    pendapatanRp: bulat(beratJual * k.hargaJualPerKg, 0),
    hariTercukupi:
      k.gramUtuhPerHari > 0 ? bulat((beratSimpan * 1000) / k.gramUtuhPerHari, 1) : 0,
    kontribusiEnergiPersen: bulat(persen(energiSimpan, k.akgEnergi), 2),
    kontribusiProteinPersen: bulat(persen(proteinSimpan, k.akgProtein), 2),
    sisaEnergiKkal: bulat(Math.max(0, k.akgEnergi - energiSimpan), 2),
    sisaProteinG: bulat(Math.max(0, k.akgProtein - proteinSimpan), 2),
  };
}

export interface InputHitung {
  profil: ProfilHitung;
  kebutuhan: KebutuhanGizi[];
  bahan: BahanHitung;
  aturan: AturanHitung;
  beratPanenKg: number;
  hargaJualPerKg: number;
  hariDisediakan: number;
}

export function hitungAlternatif(input: InputHitung): HasilHitung {
  const { profil, kebutuhan, bahan, aturan, beratPanenKg: P, hargaJualPerKg, hariDisediakan } = input;

  if (!(P > 0)) throw new KesalahanHitung("Berat panen harus lebih dari 0 kg.");
  if (!(hariDisediakan > 0)) throw new KesalahanHitung("Jumlah hari harus lebih dari 0.");
  if (hargaJualPerKg < 0) throw new KesalahanHitung("Harga tidak boleh negatif.");

  const bahanSiap = siapkanBahan(bahan);
  const peta = new Map(kebutuhan.map((k) => [k.kode, k] as const));

  const akgIbu = hitungAkgIbu(profil, peta);
  let jumlahOrang = 1;
  let akgEnergi = akgIbu.energi;
  let akgProtein = akgIbu.protein;

  for (const { kolom, kode } of PETA_ANAK) {
    const jumlah = profil[kolom];
    if (jumlah <= 0) continue;
    const baris = ambilKebutuhan(peta, kode);
    jumlahOrang += jumlah;
    akgEnergi += baris.energi_kkal * jumlah;
    akgProtein += baris.protein_g * jumlah;
  }

  const gramBersih = hitungGramBersihPerHari(bahanSiap, aturan, akgEnergi, akgProtein, jumlahOrang);
  const gramUtuhPerHari = gramBersih / bahanSiap.bdd;

  const kebutuhanCadanganKg = kelipatanKeAtas(
    (gramUtuhPerHari * hariDisediakan) / 1000,
    aturan.pembulatan_kg,
  );
  const kekuranganKg = bulat(Math.max(0, kebutuhanCadanganKg - P), 3);

  const konteks: KonteksAlternatif = {
    beratPanenKg: P,
    hargaJualPerKg,
    hariDisediakan,
    bdd: bahanSiap.bdd,
    energiPer100g: bahanSiap.energi,
    proteinPer100g: bahanSiap.protein,
    gramUtuhPerHari,
    akgEnergi,
    akgProtein,
  };

  const ringkasan = {
    jumlahOrang,
    akgEnergiKkal: bulat(akgEnergi, 2),
    akgProteinG: bulat(akgProtein, 2),
    kebutuhanHarianGramUtuh: bulat(gramUtuhPerHari, 1),
    kebutuhanCadanganKg,
    kekuranganKg,
  };

  // Panen belum cukup untuk cadangan: hanya satu pilihan, yaitu semua disimpan.
  if (P < kebutuhanCadanganKg) {
    return {
      ...ringkasan,
      alternatif: [
        buatAlternatif(
          "prioritas_gizi",
          "Semua disimpan karena panen belum cukup untuk cadangan",
          0,
          konteks,
        ),
      ],
    };
  }

  const surplus = P - kebutuhanCadanganKg;

  return {
    ...ringkasan,
    alternatif: [
      buatAlternatif("prioritas_uang", "Prioritas uang", surplus, konteks),
      buatAlternatif(
        "seimbang",
        "Seimbang",
        Math.min(surplus, aturan.batas_jual_seimbang * P),
        konteks,
      ),
      buatAlternatif("prioritas_gizi", "Prioritas gizi", surplus * aturan.persen_surplus_gizi, konteks),
    ],
  };
}
