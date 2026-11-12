"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/components/useAuthStatus";

// Tombol utama di hero: "Mulai sekarang" untuk tamu, "Ke Dashboard" jika sudah masuk.
export function MulaiButton() {
  const { status } = useAuthStatus();
  const authed = status === "authed";

  return (
    <Button asChild size="lg" className="w-full sm:w-auto">
      <Link href={authed ? "/dashboard" : "/masuk"}>
        {authed ? "Ke Dashboard" : "Mulai sekarang"}
      </Link>
    </Button>
  );
}