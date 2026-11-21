"use client";

import { useEffect, useState } from "react";
import { MoveUp } from "lucide-react";

import { cn } from "@/lib/utils";

// Tombol kembali ke atas. Muncul setelah halaman digulir ke bawah.
// Props:
// - className : atur posisi, misalnya "bottom-6" atau "bottom-48 lg:bottom-28"
// - ambang    : jarak gulir (px) sebelum tombol muncul (bawaan 300)
export function BackToTop({ className, ambang = 300 }) {
  const [terlihat, setTerlihat] = useState(false);

  useEffect(() => {
    function cekGulir() {
      setTerlihat(window.scrollY > ambang);
    }

    cekGulir();
    window.addEventListener("scroll", cekGulir, { passive: true });
    return () => window.removeEventListener("scroll", cekGulir);
  }, [ambang]);

  function keAtas() {
    const kurangiGerakan = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({ top: 0, behavior: kurangiGerakan ? "auto" : "smooth" });
  }

  if (!terlihat) return null;

  return (
    <button
      type="button"
      onClick={keAtas}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className={cn(
        "fixed right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-[#1B4D2B] text-white shadow-lg shadow-[#1B4D2B]/30 transition-all duration-200 hover:bg-[#3E8E1F] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD23F] focus-visible:ring-offset-2 sm:right-6",
        className,
      )}
    >
      <MoveUp aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
}

export default BackToTop;