"use client";

import { usePathname } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { BackToTop } from "@/components/BackToTop";
import { Footer } from "@/components/Footer";
import { PublicNav } from "@/components/PublicNav";
import { cn } from "@/lib/utils";

const HALAMAN_PUBLIK = [
  "/",
  "/masuk",
  "/tentang-kami",
  "/kebijakan-privasi",
  "/syarat-dan-ketentuan",
];

// Halaman yang tidak menampilkan footer sama sekali (desktop pun tidak)
const HALAMAN_TANPA_FOOTER = ["/bu-nita"];

function isHalamanPublik(pathname) {
  if (!pathname) return false;

  return (
    HALAMAN_PUBLIK.includes(pathname) ||
    pathname.startsWith("/masuk/")
  );
}

function tanpaFooter(pathname) {
  if (!pathname) return false;

  return HALAMAN_TANPA_FOOTER.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function NavKondisional({ children }) {
  const pathname = usePathname();

  // Cabang 1: halaman publik (PublicNav, tanpa bottom navbar)
  if (isHalamanPublik(pathname)) {
    return (
      <>
        <PublicNav />

        {children}

        {/* Footer tidak tampil di halaman login.
            Di landing page ("/") footer juga tampil di mobile,
            supaya pengguna mobile bisa membuka Tentang Kami dst. */}
        {!pathname.startsWith("/masuk") && !tanpaFooter(pathname) && (
          <Footer tampilDiMobile={pathname === "/"} />
        )}

        {/* Tombol kembali ke atas: hanya di landing page */}
        {pathname === "/" && <BackToTop className="bottom-6" />}
      </>
    );
  }

  // Cabang 2: halaman aplikasi (AppNav, ada bottom navbar sampai lg)
  const isDashboard = pathname === "/dashboard";

  return (
    <>
      <AppNav />

      <main
        className={cn(
          "mx-auto w-full px-4 pb-28 pt-6 lg:pb-12",
          isDashboard
            ? "max-w-7xl pt-8 sm:px-6 lg:px-8"
            : "max-w-4xl",
        )}
      >
        {children}
      </main>

      {/* Footer disembunyikan di halaman tertentu, misalnya chatbot */}
      {!tanpaFooter(pathname) && <Footer ruangNavBawah />}

      {/* Tombol kembali ke atas: hanya di halaman chat Bu Nita.
          Posisinya dinaikkan agar tidak menutupi kolom ketik dan navigasi bawah. */}
      {pathname === "/bu-nita" && (
        <BackToTop className="bottom-48 lg:bottom-28" />
      )}
    </>
  );
}