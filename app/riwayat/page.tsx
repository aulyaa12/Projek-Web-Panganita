import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { muatProfilSaya } from "@/lib/data/referensi";
import { LABEL_KEPUTUSAN } from "@/lib/panganita/label";
import { kg, rupiah, tanggal } from "@/lib/format";
import type { Keputusan } from "@/lib/panganita/types";

type Baris = {
  id: number;
  nama_bahan: string;
  keputusan: Keputusan;
  berat_panen_kg: number;
  berat_simpan_kg: number;
  berat_jual_kg: number;
  pendapatan_rp: number;
  hari_disediakan: number;
  dibuat_pada: string;
};

export default async function HalamanRiwayat() {
  const profil = await muatProfilSaya();
  if (!profil) redirect("/keluarga");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("riwayat_keputusan")
    .select(
      "id, nama_bahan, keputusan, berat_panen_kg, berat_simpan_kg, berat_jual_kg, pendapatan_rp, hari_disediakan, dibuat_pada",
    )
    .order("dibuat_pada", { ascending: false })
    .limit(50);

  if (error) throw new Error("Riwayat gagal dimuat.");
  const daftar = (data ?? []) as Baris[];

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm text-stone-600">Riwayat</p>
        <h1 className="text-2xl font-bold text-emerald-950">Keputusan panen Ibu</h1>
      </header>

      {daftar.length === 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-stone-600">
          Belum ada riwayat keputusan.
        </p>
      )}

      {daftar.map((r) => (
        <Card key={r.id}>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.nama_bahan}</p>
                <p className="text-sm text-stone-600">{tanggal(r.dibuat_pada)}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900">
                {LABEL_KEPUTUSAN[r.keputusan].judul}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-stone-100 p-3">
                <p className="text-xs text-stone-600">Panen</p>
                <p className="font-medium">{kg(r.berat_panen_kg)}</p>
              </div>
              <div className="rounded-lg bg-stone-100 p-3">
                <p className="text-xs text-stone-600">Hari disediakan</p>
                <p className="font-medium">{r.hari_disediakan} hari</p>
              </div>
              <div className="rounded-lg bg-stone-100 p-3">
                <p className="text-xs text-stone-600">Disimpan</p>
                <p className="font-medium">{kg(r.berat_simpan_kg)}</p>
              </div>
              <div className="rounded-lg bg-stone-100 p-3">
                <p className="text-xs text-stone-600">Dijual</p>
                <p className="font-medium">{kg(r.berat_jual_kg)}</p>
              </div>
            </div>
            <p className="text-right font-semibold text-emerald-900">{rupiah(r.pendapatan_rp)}</p>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
