import type { Keputusan } from "./types";

export const LABEL_KEPUTUSAN: Record<Keputusan, { judul: string; penjelasan: string }> = {
  prioritas_uang: {
    judul: "Prioritas Uang",
    penjelasan: "Sebagian besar sisa panen dijual. Cadangan keluarga tetap disisihkan.",
  },
  seimbang: {
    judul: "Seimbang",
    penjelasan: "Jumlah yang disimpan dan dijual kurang lebih sama.",
  },
  prioritas_gizi: {
    judul: "Prioritas Gizi",
    penjelasan: "Lebih banyak disimpan untuk makan keluarga di rumah.",
  },
};
