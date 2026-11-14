import { redirect } from "next/navigation";

import { PindaiForm } from "@/components/PindaiForm";

import {
  muatAturanAktif,
  muatDaftarBahan,
  muatProfilSaya,
} from "@/lib/data/referensi";

export default async function HalamanPindai() {
  const profil = await muatProfilSaya();

  if (!profil) {
    redirect("/keluarga");
  }

  const [bahan, aturan] = await Promise.all([
    muatDaftarBahan(),
    muatAturanAktif(),
  ]);

  return (
    <main className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
        {bahan.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <span className="text-2xl">🌱</span>
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Data pangan belum tersedia
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Katalog pangan belum tersedia. Silakan hubungi administrator untuk
              melengkapi data.
            </p>
          </section>
        ) : (
          <PindaiForm
            bahan={bahan}
            hariDefault={aturan.hari_cadangan_default}
          />
        )}
      </div>
    </main>
  );
}
