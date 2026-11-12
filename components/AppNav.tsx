"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  History,
  Home,
  LogOut,
  MessageCircle,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/pindai", label: "Pindai", icon: Camera },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/bu-nita", label: "Bu Nita", icon: MessageCircle },
  {
    href: "/keluarga",
    label: "Profil Ibu",
    mobileLabel: "Keluarga",
    icon: Users,
  },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Menentukan menu aktif berdasarkan URL
  const aktif = (href: string): boolean => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Logout
  async function keluar(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/masuk");
    router.refresh();
  }

  return (
    <>
      {/* =================================
          DESKTOP NAVBAR
      ================================== */}

      <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-3 rounded-full border border-[#e3ebe1] bg-white/95 px-3 shadow-[0_5px_25px_rgba(30,77,48,0.07)] backdrop-blur-xl sm:px-5">
          {/* LOGO */}
          <Link
            href="/dashboard"
            aria-label="Beranda PANGANITA"
            className="flex shrink-0 items-center rounded-full p-1 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Image
              src="/images/logo-lengkap.png"
              alt="PANGANITA - Pangan dan Gizi untuk Keluarga"
              width={2070}
              height={651}
              priority
              className="h-9 w-auto object-contain sm:h-10"
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-4 rounded-full bg-[#f4f7f2] p-2.5 lg:flex"
          >
            {MENU.map((menu) => {
              const Icon = menu.icon;
              const on = aktif(menu.href);

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-5 py-2.5 text-[16px] font-semibold whitespace-nowrap transition-all duration-200",
                    on
                      ? "bg-[#2e7045] text-white shadow-md shadow-[#2e7045]/15"
                      : "text-[#53665a] hover:bg-[#e5eee3] hover:text-[#1e4d30] active:scale-95",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      on ? "stroke-[2.5]" : "stroke-[1.8]",
                    )}
                  />

                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={keluar}
            title="Keluar dari akun"
            aria-label="Keluar dari akun"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#e1eae0] bg-white px-3.5 text-sm font-bold text-[#41634a] transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 sm:px-4 sm:text-[15px]"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* =================================
          MOBILE BOTTOM NAVBAR
      ================================== */}

      <nav
        aria-label="Navigasi mobile"
        className="fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-[#e0e9de] bg-white/95 p-2 shadow-[0_8px_35px_rgba(30,77,48,0.16)] backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-5 gap-1.5">
          {MENU.map((menu) => {
            const Icon = menu.icon;
            const on = aktif(menu.href);

            return (
              <li key={menu.href} className="min-w-0">
                <Link
                  href={menu.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200 active:scale-95",
                    on
                      ? "bg-[#2e7045] text-white shadow-md shadow-[#2e7045]/20"
                      : "text-[#718075] hover:bg-[#edf4eb] hover:text-[#2e7045]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      on ? "stroke-[2.5]" : "stroke-[1.9]",
                    )}
                  />

                  <span className="w-full truncate text-center text-[12px] font-semibold leading-tight sm:text-[13px]">
                    {menu.mobileLabel || menu.label}
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
