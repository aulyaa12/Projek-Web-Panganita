import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tombol aksi utama (CTA).
// Props:
// - children    : teks tombol
// - ikon        : komponen ikon lucide-react (opsional), contoh: ikon={Camera}
// - href        : jika diisi, tombol menjadi tautan ke halaman lain (next/link)
// - sedangMemuat: true = tampil spinner dan tombol dinonaktifkan
// - lebarPenuh  : true = tombol selebar induknya
// - ukuran      : "default" | "sm" | "lg" | "icon" (bawaan "lg")
// - className   : class tambahan
export function PrimaryButton({
  children,
  ikon: Ikon,
  href,
  sedangMemuat = false,
  lebarPenuh = false,
  ukuran = "lg",
  className,
  disabled,
  ...props
}) {
  const kelas = cn("min-h-14 text-base", lebarPenuh && "w-full", className);

  const isi = (
    <>
      {sedangMemuat ? (
        <LoaderCircle
          aria-hidden="true"
          strokeWidth={2.5}
          className="h-5 w-5 shrink-0 animate-spin"
        />
      ) : (
        Ikon && <Ikon aria-hidden="true" className="h-5 w-5 shrink-0" />
      )}
      {children}
    </>
  );

  // Mode tautan: satu elemen <a>, bukan tombol di dalam tautan.
  if (href && !disabled && !sedangMemuat) {
    return (
      <Button
        asChild
        variant="default"
        size={ukuran}
        className={kelas}
        {...props}
      >
        <Link href={href}>{isi}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="default"
      size={ukuran}
      disabled={disabled || sedangMemuat}
      aria-busy={sedangMemuat}
      className={kelas}
      {...props}
    >
      {isi}
    </Button>
  );
}

export default PrimaryButton;
