"use client";

import { usePathname } from "next/navigation";

import { AppNav } from "@/components/AppNav";
import { cn } from "@/lib/utils";

const HALAMAN_PUBLIK = ["/", "/masuk"];

function isHalamanPublik(pathname) {
  if (!pathname) return false;

  return (
    HALAMAN_PUBLIK.includes(pathname) ||
    pathname.startsWith("/masuk/")
  );
}

export function NavKondisional({ children }) {
  const pathname = usePathname();

  if (isHalamanPublik(pathname)) {
    return <>{children}</>;
  }

  const isDashboard = pathname === "/dashboard";

  return (
    <>
      <AppNav />

      <main
        className={cn(
          "mx-auto w-full px-4 pb-28 pt-6 lg:pb-0",
          isDashboard
            ? "max-w-7xl pt-8 sm:px-6 lg:px-8"
            : "max-w-4xl",
        )}
      >
        {children}
      </main>
    </>
  );
}