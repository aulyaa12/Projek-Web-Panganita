import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

// Ukuran ikon. Pilih lewat prop "ukuran": "kecil" | "sedang" | "besar".
const UKURAN = {
  kecil: { ikon: "h-8 w-8", teks: "text-sm" },
  sedang: { ikon: "h-16 w-16", teks: "text-base" },
  besar: { ikon: "h-24 w-24", teks: "text-lg" },
};

// Tampilan memuat yang bisa dipakai ulang di banyak halaman.
// Memakai ikon LoaderCircle yang berputar
// - pesan: teks yang terlihat oleh pengguna
// - ukuran: ukuran ikon
// - layarPenuh: true = mengisi tinggi layar, false = hanya sebesar isinya
export function LoadingState({
  pesan = "Sebentar ya, Bu…",
  ukuran = "sedang",
  layarPenuh = true,
  className,
}) {
  const gaya = UKURAN[ukuran] ?? UKURAN.sedang;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 px-4",
        layarPenuh ? "min-h-[60dvh]" : "py-8",
        className,
      )}
    >
      <LoaderCircle
        aria-hidden="true"
        strokeWidth={2.5}
        className={cn("animate-spin text-[#3E8E1F]", gaya.ikon)}
      />

      <p className={cn("text-center font-semibold text-[#1B4D2B]", gaya.teks)}>
        {pesan}
      </p>
    </div>
  );
}

export default LoadingState;
