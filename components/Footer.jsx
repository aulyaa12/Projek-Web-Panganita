import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const TAUTAN_FOOTER = [
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Syarat dan Ketentuan", href: "/syarat-dan-ketentuan" },
];

/*
  ============================================================
  UBAH BENTUK PINGGIRAN FOOTER DI SINI (atau lewat prop)
  - "rounded" -> sudut atas melengkung (sama dengan navbar mobile)
  - "square"  -> sudut siku biasa
  ============================================================
*/
const BENTUK_TEPI = {
  rounded: "rounded-t-[28px]",
  square: "rounded-none",
};

export function Footer({
  bentukTepi = "rounded", // ganti default ke "square" jika ingin siku
  tampilDiMobile = false, // true = footer juga tampil di mobile
  ruangNavBawah = false, // true jika bottom navbar tampil (AppNav)
  tautan = TAUTAN_FOOTER,
  className,
}) {
  return (
    <footer
      className={cn(
        "relative overflow-hidden bg-[#0F2D1A] text-white",
        // default: hanya tablet & desktop. Dengan tampilDiMobile: semua ukuran
        tampilDiMobile ? "block" : "hidden md:block",
        // ruang aman agar tidak tertutup bottom navbar (AppNav) sampai lg
        ruangNavBawah &&
          (tampilDiMobile ? "pb-20 lg:pb-0" : "md:pb-20 lg:pb-0"),
        BENTUK_TEPI[bentukTepi] ?? BENTUK_TEPI.rounded,
        className,
      )}
    >
      {/* Dekorasi: garis gradien tipis di tepi atas */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1B4D2B] via-[#90C226] to-[#E6B91E]"
      />
      {/* Dekorasi: cahaya hijau lembut */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#3E8E1F]/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* Baris 1: logo + navigasi (mobile: bertumpuk dan rata tengah) */}
        <div className="flex flex-col items-center gap-x-8 gap-y-2 pb-3 pt-6 md:flex-row md:flex-wrap md:justify-between">
          <Link
            href="/"
            aria-label="Panganita, kembali ke beranda"
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD23F]"
          >
            <Image
              src="/images/logo-panganita-putih.png"
              alt="PANGANITA - Pangan dan Gizi untuk Keluarga"
              width={2070}
              height={651}
              className="h-12 w-auto shrink-0 object-contain md:h-14 lg:h-16"
            />
          </Link>

          <nav aria-label="Tautan footer">
            <ul className="flex flex-wrap items-center justify-center gap-1">
              {tautan.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-white/85 transition-colors hover:text-[#FFD23F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD23F]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Baris 2: garis pembatas + hak cipta di tengah */}
        <div className="border-t border-white/15">
          <p className="pt-4 text-center text-xs text-white/60">
            Didukung oleh Perempuan Inovasi GENerasi AI × IBM SkillsBuild
          </p>
          <p className="pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-center text-sm text-white/70">
            © 2026 Panganita oleh Kelompok Malahayati. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;