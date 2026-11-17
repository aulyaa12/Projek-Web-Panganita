"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

// Gambar yang tetap tampil rapi walau file-nya belum ada atau gagal dimuat.
// Props:
// - src, alt, width, height : sama seperti next/image
// - priority                : true untuk gambar paling atas halaman
// - className               : class untuk gambar
// - kelasCadangan           : class untuk kotak pengganti
// - ikonCadangan            : elemen ikon (bukan komponen), contoh: ikonCadangan={<Sprout aria-hidden="true" className="h-16 w-16" />}
//                             Harus berupa elemen karena dikirim dari Server Component.
export function GambarCadangan({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  kelasCadangan,
  ikonCadangan,
}) {
  const [gagal, setGagal] = useState(false);

  if (gagal) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-[#EAF1E8] text-[#1B4D2B]",
          kelasCadangan,
        )}
      >
        {ikonCadangan ?? (
          <ImageOff aria-hidden="true" className="h-16 w-16 opacity-70" />
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      onError={() => setGagal(true)}
      className={className}
    />
  );
}

export default GambarCadangan;
