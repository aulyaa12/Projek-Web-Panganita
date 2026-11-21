import type { ProfilKeluarga } from "./types";

export function jumlahOrangProfil(
  p: Pick<
    ProfilKeluarga,
    | "ibu_hamil"
    | "ibu_menyusui"
    | "jumlah_bayi_6_11"
    | "jumlah_anak_1_3"
    | "jumlah_anak_4_6"
    | "jumlah_anak_7_9"
    | "jumlah_anak_l_10_12"
    | "jumlah_anak_p_10_12"
  >,
): number {
  const jumlahIbu = (p.ibu_hamil ? 1 : 0) + (p.ibu_menyusui ? 1 : 0);

  const jumlahAnak =
    p.jumlah_bayi_6_11 +
    p.jumlah_anak_1_3 +
    p.jumlah_anak_4_6 +
    p.jumlah_anak_7_9 +
    p.jumlah_anak_l_10_12 +
    p.jumlah_anak_p_10_12;

  return jumlahIbu + jumlahAnak;
}
