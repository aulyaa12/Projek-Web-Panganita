import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tombol aksi sekunder: Batal, Kembali, Lihat semua.
// Props:
// - children    : teks tombol
// - ikon        : komponen ikon lucide-react (opsional), contoh: ikon={ArrowLeft}
// - sedangMemuat: true = tampil spinner dan tombol dinonaktifkan
// - lebarPenuh  : true = tombol selebar induknya
// - ukuran      : "default" | "sm" | "lg" | "icon" (bawaan "lg" = 48 px)
// - className   : class tambahan
export function SecondaryButton({
  children,
  ikon: Ikon,
  sedangMemuat = false,
  lebarPenuh = false,
  ukuran = "lg",
  className,
  disabled,
  ...props
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size={ukuran}
      disabled={disabled || sedangMemuat}
      aria-busy={sedangMemuat}
      className={cn(
        "min-h-12 bg-white text-base",
        lebarPenuh && "w-full",
        className,
      )}
      {...props}
    >
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
    </Button>
  );
}

export default SecondaryButton;