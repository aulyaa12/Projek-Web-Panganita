import Image from "next/image";
import { cn } from "@/lib/utils";

// Logo lengkap untuk layar lebar, ikon untuk layar kecil.
// Mengikuti identitas visual PANGANITA: emblem padi dan ikan, teks hijau tua.
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/images/logo-lengkap.png"
        alt="PANGANITA, pangan dan gizi untuk keluarga"
        width={2070}
        height={651}
        priority={priority}
        className="hidden h-10 w-auto sm:block"
      />
      <Image
        src="/images/ikon-panganita.png"
        alt="PANGANITA"
        width={512}
        height={512}
        priority={priority}
        className="block h-10 w-10 sm:hidden"
      />
    </span>
  );
}

// Versi ikon saja, untuk tempat yang sempit.
export function IkonPanganita({ className }: { className?: string }) {
  return (
    <Image
      src="/images/ikon-panganita.png"
      alt="PANGANITA"
      width={512}
      height={512}
      className={cn("h-10 w-10", className)}
    />
  );
}
