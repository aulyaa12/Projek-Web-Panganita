"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";

import { useAuthStatus } from "@/components/useAuthStatus";

// Navbar halaman publik ("/" dan "/masuk"). Tombol berubah sesuai status login.
export function PublicNav() {
  const router = useRouter();
  const { status, supabase } = useAuthStatus();

  async function keluar() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const tombolUtama =
    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#2e7045] px-4 text-sm font-bold text-white shadow-md shadow-[#2e7045]/20 transition-all duration-200 hover:bg-[#245a37] active:scale-95 sm:min-h-14 sm:px-8 sm:text-lg";

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between gap-2 rounded-full border border-[#e3ebe1] bg-white/95 px-3.5 shadow-[0_5px_25px_rgba(30,77,48,0.07)] backdrop-blur-xl sm:min-h-[96px] sm:gap-3 sm:px-7">
        <Link
          href="/"
          aria-label="Beranda PANGANITA"
          className="flex shrink-0 items-center rounded-full p-1 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Image
            src="/images/logo-lengkap.png"
            alt="PANGANITA - Pangan dan Gizi untuk Keluarga"
            width={2070}
            height={651}
            priority
            className="h-10 w-auto object-contain sm:h-14 lg:h-16"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === "loading" && (
            <span
              aria-hidden
              className="block h-11 w-24 rounded-full bg-[#f4f7f2] sm:h-14 sm:w-36"
            />
          )}

          {status === "guest" && (
            <Link href="/masuk" className={tombolUtama}>
              <LogIn className="h-5 w-5" />
              <span>Masuk</span>
            </Link>
          )}

          {status === "authed" && (
            <>
              <Link href="/dashboard" className={tombolUtama}>
                <LayoutDashboard className="h-5 w-5" />
                <span>Ke Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={keluar}
                aria-label="Keluar dari akun"
                title="Keluar dari akun"
                className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#e1eae0] bg-white px-3.5 text-sm font-bold text-[#41634a] transition-all duration-200 hover:border-[#1B4D2B] hover:bg-[#1B4D2B] hover:text-white hover:shadow-md hover:shadow-[#1B4D2B]/20 active:scale-95 sm:min-h-14 sm:px-5"
              >
                <LogOut className="h-5 w-5" />
                <span>Keluar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicNav;