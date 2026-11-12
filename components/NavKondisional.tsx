"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/AppNav";

const HALAMAN_PUBLIK = ["/", "/masuk"];

export function NavKondisional({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (HALAMAN_PUBLIK.includes(pathname)) {
    return <>{children}</>;
  }

  const isDashboard = pathname === "/dashboard";

  return (
    <>
      <AppNav />

      <main
        className={
          isDashboard
            ? "mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8 md:pb-10"
            : "mx-auto w-full max-w-4xl px-4 pb-28 pt-6 md:pb-10"
        }
      >
        {children}
      </main>
    </>
  );
}
