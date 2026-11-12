import type { RujukanRag } from "./types";

// Pencarian konteks untuk RAG.
// Tahap ini belum aktif: tabel dokumen dan embedding (pgvector) belum dibuat.
// Saat tabel sudah siap, isi fungsi ini dengan pencarian kemiripan vektor
// (misalnya memanggil fungsi SQL match_dokumen dengan embedding pertanyaan).
export async function cariKonteks(_pertanyaan: string): Promise<RujukanRag[]> {
  return [];
}
