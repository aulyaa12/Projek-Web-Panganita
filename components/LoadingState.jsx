import { cn } from "@/lib/utils";

// Ukuran spinner. Pilih lewat prop "ukuran": "kecil" | "sedang" | "besar".
const UKURAN = {
  kecil: {
    spinner: "h-8 w-8",
    garis: "border-4",
    teks: "text-sm",
  },
  sedang: {
    spinner: "h-16 w-16",
    garis: "border-[6px]",
    teks: "text-base",
  },
  besar: {
    spinner: "h-24 w-24",
    garis: "border-8",
    teks: "text-lg",
  },
};

// Tampilan memuat yang bisa dipakai ulang di banyak halaman.
// - pesan: teks yang terlihat oleh pengguna
// - ukuran: ukuran spinner
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
        "flex w-full flex-col items-center justify-center gap-5 px-4",
        layarPenuh ? "min-h-[60dvh]" : "py-8",
        className,
      )}
    >
      <div className={cn("relative", gaya.spinner)}>
        {/* Jalur (track) supaya putarannya terlihat jelas di latar terang */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full border-[#1B4D2B]/15",
            gaya.garis,
          )}
        />
        {/* Bagian yang berputar */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 animate-spin rounded-full border-transparent border-r-[#E6B91E] border-t-[#3E8E1F] motion-reduce:animate-none",
            gaya.garis,
          )}
        />
      </div>

      <p className={cn("text-center font-semibold text-[#1B4D2B]", gaya.teks)}>
        {pesan}
      </p>
    </div>
  );
}

export default LoadingState;