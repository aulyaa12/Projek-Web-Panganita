"use client";

import { usePathname } from "next/navigation";

import { AppNav } from "@/components/AppNav";
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

        {/* Footer tidak tampil di halaman login */}
        {!pathname.startsWith("/masuk") && !tanpaFooter(pathname) && <Footer />}
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
    </>
  );
}