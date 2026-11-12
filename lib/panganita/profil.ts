import type { ProfilKeluarga } from "./types";

// Ibu selalu dihitung satu orang, ditambah seluruh anggota anak dan bayi.
export function jumlahOrangProfil(
  p: Pick<
    ProfilKeluarga,
    | "jumlah_bayi_6_11" | "jumlah_anak_1_3" | "jumlah_anak_4_6" | "jumlah_anak_7_9"
    | "jumlah_anak_l_10_12" | "jumlah_anak_p_10_12"
  >,
): number {
  return (
    1 +
    p.jumlah_bayi_6_11 +
    p.jumlah_anak_1_3 +
    p.jumlah_anak_4_6 +
    p.jumlah_anak_7_9 +
    p.jumlah_anak_l_10_12 +
    p.jumlah_anak_p_10_12
  );
}
