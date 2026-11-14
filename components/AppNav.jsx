"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Camera,
  History,
  Home,
  LogOut,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/pindai", label: "Pindai", icon: Camera, isScan: true },
  { href: "/bu-nita", label: "Bu Nita", icon: MessageCircle },
  { href: "/keluarga", label: "Profil", icon: UserRound },
];

function isMenuActive(pathname, href) {
  return Boolean(
    pathname && (pathname === href || pathname.startsWith(`${href}/`)),
  );
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sedangKeluar, startLogout] = useTransition();

  function keluar() {
    startLogout(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Gagal keluar dari akun.");
        return;
      }

      router.push("/masuk");
      router.refresh();
    });
  }

  return (
    <>
      {/* Navbar atas: tampil pada desktop dan mobile */}
      <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-3 rounded-full border border-[#e3ebe1] bg-white/95 px-4 shadow-[0_5px_25px_rgba(30,77,48,0.07)] backdrop-blur-xl sm:min-h-[92px] sm:px-7">
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
              className="h-11 w-auto object-contain sm:h-16 lg:h-16 xl:h-[4.5rem]"
            />
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-1 rounded-full bg-[#f4f7f2] p-2 lg:flex xl:gap-2 xl:p-2.5"
          >
            {MENU.map((menu) => {
              const Icon = menu.icon;
              const aktif = isMenuActive(pathname, menu.href);

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  aria-current={aktif ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 xl:min-h-12 xl:gap-2.5 xl:px-5 xl:py-2.5 xl:text-base",
                    menu.isScan
                      ? aktif
                        ? "bg-[#3E8E1F] text-white shadow-md shadow-[#3E8E1F]/25"
                        : "bg-[#E6B91E] text-white shadow-md shadow-[#E6B91E]/25 hover:brightness-105"
                      : aktif
                        ? "bg-[#1B4D2B] text-white shadow-md shadow-[#1B4D2B]/20"
                        : "text-[#53665a] hover:bg-[#e5eee3] hover:text-[#1B4D2B] active:scale-95",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      aktif ? "stroke-[2.5]" : "stroke-[1.8]",
                    )}
                  />
                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={keluar}
            disabled={sedangKeluar}
            title="Keluar dari akun"
            aria-label="Keluar dari akun"
            aria-busy={sedangKeluar}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#e1eae0] bg-white px-3.5 text-sm font-bold text-[#41634a] transition-all duration-200 hover:border-[#1B4D2B] hover:bg-[#1B4D2B] hover:text-white hover:shadow-md hover:shadow-[#1B4D2B]/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12 sm:px-4 sm:text-base xl:min-h-14 xl:px-5"
          >
            {sedangKeluar ? (
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            ) : (
              <LogOut aria-hidden="true" className="h-5 w-5" />
            )}
            <span>{sedangKeluar ? "Keluar…" : "Keluar"}</span>
          </button>
        </div>
      </header>

      {/* Navbar bawah mobile */}
      <nav
        aria-label="Navigasi mobile"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-x border-t border-[#e0e9de] bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_35px_rgba(30,77,48,0.16)] backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-5 items-end gap-1.5">
          {MENU.map((menu) => {
            const Icon = menu.icon;
            const aktif = isMenuActive(pathname, menu.href);

            if (menu.isScan) {
              return (
                <li key={menu.href} className="min-w-0">
                  <Link
                    href={menu.href}
                    aria-current={aktif ? "page" : undefined}
                    className="group flex min-h-[76px] flex-col items-center justify-end gap-1 rounded-2xl px-1 py-1.5 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] focus-visible:ring-offset-2"
                  >
                    <span
                      className={cn(
                        "-mt-7 flex h-14 w-14 items-center justify-center rounded-[20px] border-4 border-white text-white transition-all duration-300",
                        aktif
                          ? "bg-[#3E8E1F] shadow-[0_10px_22px_rgba(62,142,31,0.42)]"
                          : "bg-[#E6B91E] shadow-[0_10px_22px_rgba(230,185,30,0.42)] group-hover:brightness-105",
                      )}
                    >
                      <Icon aria-hidden="true" className="h-7 w-7 stroke-[2.1]" />
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-bold leading-tight",
                        aktif ? "text-[#3E8E1F]" : "text-[#8A6D05]",
                      )}
                    >
                      {menu.label}
                    </span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={menu.href} className="min-w-0">
                <Link
                  href={menu.href}
                  aria-current={aktif ? "page" : undefined}
                  className={cn(
                    "flex min-h-[64px] min-w-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D2B] focus-visible:ring-offset-2",
                    aktif
                      ? "bg-[#1B4D2B] text-white shadow-md shadow-[#1B4D2B]/20"
                      : "text-[#718075] hover:bg-[#edf4eb] hover:text-[#1B4D2B]",
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span className="w-full truncate text-center text-[11px] font-semibold leading-tight sm:text-xs">
                    {menu.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export default AppNav;