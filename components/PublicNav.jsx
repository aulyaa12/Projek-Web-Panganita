"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogIn, LogOut, Menu, X } from "lucide-react";

import { useAuthStatus } from "@/components/useAuthStatus";
import { cn } from "@/lib/utils";

const MENU_HOMEPAGE = [
  { id: "judul-hero", label: "Beranda" },
  { id: "judul-masalah", label: "Fakta" },
  { id: "judul-fitur", label: "Fitur" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "judul-tanya", label: "FAQ" },
];

export function PublicNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, supabase } = useAuthStatus();

  const isHomepage = pathname === "/";

  const [activeSection, setActiveSection] = useState("judul-hero");
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  // Kunci penanda aktif selama smooth scroll akibat klik menu.
  const kunciScrollRef = useRef(false);
  const kunciTimerRef = useRef(null);
  const kunciLepasRef = useRef(null);

  // Memantau section homepage yang sedang dibaca.
  useEffect(() => {
    if (!isHomepage) return;

    let frame = null;

    function updateActiveSection() {
      if (frame !== null) return;
      if (kunciScrollRef.current) return;

      frame = window.requestAnimationFrame(() => {
        frame = null;

        const header = document.querySelector("[data-public-nav-bar]");
        const offset = (header?.getBoundingClientRect().height ?? 88) + 16;

        let current = MENU_HOMEPAGE[0].id;

        for (const item of MENU_HOMEPAGE) {
          const target = document.getElementById(item.id);

          if (!target) continue;

          if (target.getBoundingClientRect().top <= offset + 2) {
            current = item.id;
          } else {
            break;
          }
        }

        setActiveSection(current);
      });
    }

    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveSection);

    updateActiveSection();

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      if (kunciLepasRef.current) {
        kunciLepasRef.current();
      }
    };
  }, [isHomepage]);

  // Menutup hamburger ketika tombol Escape ditekan.
  useEffect(() => {
    if (!menuTerbuka) return;

    function tutupDenganEscape(event) {
      if (event.key === "Escape") {
        setMenuTerbuka(false);
      }
    }

    window.addEventListener("keydown", tutupDenganEscape);

    return () => {
      window.removeEventListener("keydown", tutupDenganEscape);
    };
  }, [menuTerbuka]);

  // Menutup menu ketika halaman berubah.
  useEffect(() => {
    setMenuTerbuka(false);
  }, [pathname]);

  // Navigasi ke bagian homepage.
  function menujuBagian(event, id) {
    const target = document.getElementById(id);

    if (!target) return;

    event.preventDefault();

    setActiveSection(id);
    setMenuTerbuka(false);

    const header = document.querySelector("[data-public-nav-bar]");
    const offset = (header?.getBoundingClientRect().height ?? 88) + 16;

    const posisi = target.getBoundingClientRect().top + window.scrollY - offset;

    // Bersihkan kunci sebelumnya bila klik dilakukan berulang cepat.
    if (kunciLepasRef.current) {
      kunciLepasRef.current();
    }

    // Kunci penanda selama smooth scroll; lepas setelah scroll berhenti.
    kunciScrollRef.current = true;

    function lepasKunci() {
      kunciScrollRef.current = false;
      window.removeEventListener("scroll", jadwalLepas);

      if (kunciTimerRef.current) {
        clearTimeout(kunciTimerRef.current);
        kunciTimerRef.current = null;
      }

      kunciLepasRef.current = null;
    }

    function jadwalLepas() {
      if (kunciTimerRef.current) clearTimeout(kunciTimerRef.current);
      kunciTimerRef.current = setTimeout(lepasKunci, 120);
    }

    kunciLepasRef.current = lepasKunci;

    window.addEventListener("scroll", jadwalLepas, { passive: true });
    jadwalLepas(); // jaga-jaga bila tidak ada scroll sama sekali

    window.scrollTo({
      top: Math.max(0, posisi),
      behavior: "smooth",
    });
  }

  async function keluar() {
    await supabase.auth.signOut();
    router.refresh();
  }

  // Halaman masuk tidak memerlukan navbar.
  if (pathname === "/masuk" || pathname.startsWith("/masuk/")) {
    return null;
  }

  const tombolUtama =
    "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#2e7045] px-3 text-sm font-bold text-white shadow-md shadow-[#2e7045]/20 transition-all duration-200 hover:bg-[#245a37] active:scale-95 sm:min-h-12 sm:gap-2 sm:px-5 sm:text-base";

  const tombolKeluar =
    "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#e1eae0] bg-white px-3 text-sm font-bold text-[#41634a] transition-all duration-200 hover:border-[#1B4D2B] hover:bg-[#FFD23F] hover:text-[#1B4D2B] active:scale-95 sm:min-h-12 sm:px-4";

  // Menu navigasi.
  function renderMenu(mobile = false) {
    return (
      <nav
        aria-label="Navigasi homepage PANGANITA"
        className={
          mobile
            ? "flex flex-col items-start gap-1"
            : "hidden min-w-0 flex-1 items-center justify-center gap-6 xl:flex 2xl:gap-9"
        }
      >
        {MENU_HOMEPAGE.map((item) => {
          const aktif = activeSection === item.id;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => menujuBagian(event, item.id)}
              aria-current={aktif ? "location" : undefined}
              className={cn(
                "relative inline-flex w-fit shrink-0 items-center px-1 py-3 text-lg font-bold leading-none whitespace-nowrap transition-colors duration-200",
                "after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:origin-center after:rounded-full after:bg-[#1B4D2B] after:content-[''] after:transition-transform after:duration-200",
                aktif
                  ? "text-[#0F2D1A] after:scale-x-100"
                  : "text-[#315C3D] after:scale-x-0 hover:text-[#0F2D1A]",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <header data-public-nav className="sticky top-0 z-50 w-full px-3 sm:px-6">
      <div
        className={cn(
          "relative mx-auto w-full max-w-6xl rounded-full border border-[#e3ebe1] bg-white/95 px-3 shadow-[0_5px_25px_rgba(30,77,48,0.07)] backdrop-blur-xl sm:px-6 xl:px-7",
        )}
      >
        {/* BARIS UTAMA */}
        <div
          data-public-nav-bar
          className="flex min-h-[68px] items-center justify-between gap-2 sm:min-h-[80px] xl:min-h-[88px]"
        >
          {/* LOGO */}
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
              className="h-8 w-auto max-w-full object-contain sm:h-10 xl:h-11"
            />
          </Link>

          {/* MENU DESKTOP */}
          {isHomepage && renderMenu(false)}

          {/* TOMBOL AKSI */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {status === "loading" && (
              <span
                aria-hidden="true"
                className="block h-11 w-24 animate-pulse rounded-full bg-[#eaf1e8] sm:h-12 sm:w-32"
              />
            )}

            {status === "guest" && (
              <Link href="/masuk" className={tombolUtama}>
                <LogIn
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                />
                <span>Masuk</span>
                <span className="hidden sm:inline"> </span>
              </Link>
            )}

            {status === "authed" && (
              <>
                <Link href="/dashboard" className={tombolUtama}>
                  <LayoutDashboard
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0"
                  />
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
                  <span className="sr-only min-[420px]:not-sr-only">
                    Keluar
                  </span>
                </button>
              </>
            )}

            {/* HAMBURGER HP DAN IPAD */}
            {isHomepage && (
              <button
                type="button"
                onClick={() => setMenuTerbuka((sebelumnya) => !sebelumnya)}
                aria-label={
                  menuTerbuka ? "Tutup menu navigasi" : "Buka menu navigasi"
                }
                aria-expanded={menuTerbuka}
                aria-controls="menu-homepage-mobile"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#DCE9D8] bg-[#EAF4EC]/75 text-[#1B4D2B] backdrop-blur-md transition-all hover:bg-[#DDEFE0] active:scale-95 xl:hidden"
              >
                {menuTerbuka ? (
                  <X aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Menu aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* DROPDOWN HAMBURGER MENGAMBANG */}
        {isHomepage && menuTerbuka && (
          <div
            id="menu-homepage-mobile"
            className="absolute right-0 top-full z-[60] mt-3 w-[min(230px,calc(100vw-2rem))] rounded-2xl border border-[#DCE9D8] bg-white/95 p-4 shadow-[0_12px_35px_rgba(30,77,48,0.14)] backdrop-blur-xl xl:hidden"
          >
            {renderMenu(true)}
          </div>
        )}
      </div>
    </header>
  );
}

export default PublicNav;