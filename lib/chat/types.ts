export type PeranPesan = "pengguna" | "asisten" | "sistem";

// Potongan dokumen yang dipakai untuk menjawab (hasil RAG).
export interface RujukanRag {
  id: string;
  judul: string;
  kutipan: string;
}

export interface Pesan {
  id: number | string;
  peran: PeranPesan;
  isi: string;
  sumber_rujukan: RujukanRag[] | null;
  dibuat_pada: string;
}

export interface PercakapanRingkas {
  id: string;
  judul: string | null;
  diperbarui_pada: string;
}

export interface RiwayatChatItem {
  peran: PeranPesan;
  isi: string;
}
