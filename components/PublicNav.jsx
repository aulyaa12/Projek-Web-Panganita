"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";

import { useAuthStatus } from "@/components/useAuthStatus";

// Navbar halaman publik ("/" dan "/masuk"). Tombol berubah sesuai status login.
// Ukuran besar baru dipakai mulai breakpoint lg supaya tidak meluber saat zoom in.
export function PublicNav() {
  const router = useRouter();
  const { status, supabase } = useAuthStatus();

  async function keluar() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const tombolUtama =
    "inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#2e7045] px-3 text-sm font-bold text-white shadow-md shadow-[#2e7045]/20 transition-all duration-200 hover:bg-[#245a37] active:scale-95 sm:gap-2 sm:px-5 sm:text-base lg:min-h-14 lg:px-8 lg:text-lg";

  const tombolKeluar =
    "inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#e1eae0] bg-white px-3 text-sm font-bold text-[#41634a] transition-all duration-200 hover:border-[#1B4D2B] hover:bg-[#FFD23F] hover:text-[#1B4D2B] hover:shadow-md hover:shadow-[#1B4D2B]/20 active:scale-95 sm:gap-2 sm:px-4 sm:text-base lg:min-h-14 lg:px-5";

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex min-h-[72px] w-full max-w-6xl items-center justify-between gap-2 rounded-full border border-[#e3ebe1] bg-white/95 px-3 shadow-[0_5px_25px_rgba(30,77,48,0.07)] backdrop-blur-xl sm:min-h-[88px] sm:gap-3 sm:px-6 lg:min-h-[96px] lg:px-7">
        <Link
          href="/"
          aria-label="Beranda PANGANITA"
          className="flex min-w-0 shrink items-center rounded-full p-1 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Image
            src="/images/logo-lengkap.png"
            alt="PANGANITA - Pangan dan Gizi untuk Keluarga"
            width={2070}
            height={651}
            priority
            className="h-9 w-auto max-w-full object-contain sm:h-12 lg:h-16"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Placeholder selama status login dicek. Ukurannya dibuat mirip tombol asli. */}
          {status === "loading" && (
            <span
              aria-hidden="true"
              className="block h-12 w-28 animate-pulse rounded-full bg-[#eaf1e8] sm:w-40 lg:h-14 lg:w-56"
            />
          )}

          {status === "guest" && (
            <Link href="/masuk" className={tombolUtama}>
              <LogIn aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>Masuk</span>
            </Link>
          )}

          {status === "authed" && (
            <>
              <Link href="/dashboard" className={tombolUtama}>
                <LayoutDashboard aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="sm:hidden">Beranda</span>
                <span className="hidden sm:inline">Ke Beranda</span>
              </Link>

              <button
                type="button"
                onClick={keluar}
                aria-label="Keluar dari akun"
                title="Keluar dari akun"
                className={tombolKeluar}
              >
                <LogOut aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="sr-only min-[420px]:not-sr-only">Keluar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicNav;