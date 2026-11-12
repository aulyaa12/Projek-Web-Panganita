import { ZodError } from "zod";
import { KesalahanHitung } from "@/lib/panganita/hitung";

export type HasilAksi<T> = { ok: true; data: T } | { ok: false; pesan: string };

export function ok<T>(data: T): HasilAksi<T> {
  return { ok: true, data };
}

export function gagal(pesan: string): { ok: false; pesan: string } {
  return { ok: false, pesan };
}

// Mengubah galat menjadi pesan yang aman ditampilkan. Detail teknis hanya masuk log server.
export function pesanGalat(e: unknown): string {
  if (e instanceof KesalahanHitung) return e.message;
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Input tidak valid.";
  console.error(e);
  return "Terjadi kesalahan. Silakan coba lagi.";
}
