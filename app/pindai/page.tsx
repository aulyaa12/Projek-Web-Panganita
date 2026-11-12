import { redirect } from "next/navigation";

import { PindaiForm } from "@/components/PindaiForm";

import {
  muatAturanAktif,
  muatDaftarBahan,
  muatProfilSaya,
} from "@/lib/data/referensi";

export default async function HalamanPindai() {
  // Pastikan profil keluarga sudah tersedia.
  const profil = await muatProfilSaya();

  if (!profil) {
    redirect("/keluarga");
  }

  // Ambil data pangan dan aturan perhitungan.
  const [bahan, aturan] = await Promise.all([
    muatDaftarBahan(),
    muatAturanAktif(),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header halaman */}
      <header className="space-y-2">
        <div className="text-sm font-semibold tracking-wide text-emerald-700">
          PANGANITA / PEMINDAIAN
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Pemindaian Hasil Panen
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Dokumentasikan hasil panen, masukkan jumlah pangan, dan dapatkan
          rekomendasi pembagian untuk kebutuhan gizi keluarga.
        </p>
      </header>

      {/* Form pemindaian */}
      {bahan.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-semibold text-slate-900">
            Data pangan belum tersedia
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Silakan hubungi administrator untuk melengkapi daftar bahan pangan.
          </p>
        </div>
      ) : (
        <PindaiForm bahan={bahan} hariDefault={aturan.hari_cadangan_default} />
      )}
    </main>
  );
}
