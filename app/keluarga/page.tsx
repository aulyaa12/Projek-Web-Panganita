import { muatProfilSaya } from "@/lib/data/referensi";
import { ProfilForm } from "@/components/ProfilForm";

export default async function HalamanKeluarga() {
  const profil = await muatProfilSaya();

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm text-stone-600">Profil keluarga</p>
        <h1 className="text-2xl font-bold text-emerald-950">
          {profil ? "Keluarga Ibu" : "Kenali keluarga Ibu"}
        </h1>
        <p className="mt-2 text-stone-600">
          Informasi ini membantu PANGANITA menghitung kebutuhan pangan keluarga. Nama anak tidak perlu diisi.
        </p>
      </header>
      <ProfilForm awal={profil} />
    </main>
  );
}
