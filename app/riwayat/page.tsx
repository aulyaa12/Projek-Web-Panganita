import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { Card, CardContent } from "@/components/ui/card";
import { TombolHapusRiwayat } from "@/components/riwayat/TombolHapusRiwayat";

import { createClient } from "@/lib/supabase/server";
import { muatProfilSaya } from "@/lib/data/referensi";
import { LABEL_KEPUTUSAN } from "@/lib/panganita/label";
import { kg, rupiah } from "@/lib/format";
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

// Format tanggal dan waktu sesuai zona WITA.
function tanggalWaktu(nilai: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
    hourCycle: "h23",
  }).format(new Date(nilai));
}

export default async function HalamanRiwayat() {
  const profil = await muatProfilSaya();

  if (!profil) {
    redirect("/keluarga");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("riwayat_keputusan")
    .select(
      "id, nama_bahan, keputusan, berat_panen_kg, berat_simpan_kg, berat_jual_kg, pendapatan_rp, hari_disediakan, dibuat_pada",
    )
    .order("dibuat_pada", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("Riwayat gagal dimuat.");
  }

  const daftar = (data ?? []) as Baris[];

  // SERVER ACTION: Hapus seluruh riwayat milik profil aktif.
  async function hapusSemuaRiwayat() {
    "use server";

    const profilAktif = await muatProfilSaya();

    if (!profilAktif) {
      return {
        ok: false,
        pesan: "Profil tidak ditemukan. Silakan masuk kembali.",
      };
    }

    const supabaseAksi = await createClient();

    const { count, error } = await supabaseAksi
      .from("riwayat_keputusan")
      .delete({ count: "exact" })
      .eq("profil_id", profilAktif.id);

    if (error) {
      console.error("[HAPUS RIWAYAT]", error);

      return {
        ok: false,
        pesan: "Riwayat gagal dihapus. Silakan coba kembali.",
      };
    }

    revalidatePath("/riwayat");

    return {
      ok: true,
      jumlahTerhapus: count ?? 0,
    };
  }

  return (
    <main className="space-y-6">
      {/* HEADER */}
      <header className="space-y-4">
        <h1 className="text-center text-3xl font-bold tracking-tight text-[#0F2D1A]">
          Riwayat Keputusan Panen Ibu
        </h1>

        <div className="flex justify-end">
          <TombolHapusRiwayat
            action={hapusSemuaRiwayat}
            tampilkanTombol={daftar.length > 0}
          />
        </div>
      </header>

      {/* KONDISI KOSONG */}
      {daftar.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#B8D9B2] bg-white p-8 text-center">
          <p className="text-base font-bold text-[#0F2D1A]">
            Belum Ada Riwayat Keputusan
          </p>

          <p className="mt-2 text-sm text-[#1B4D2B]">
            Riwayat keputusan panen Ibu akan muncul di sini setelah menyimpan
            pilihan pembagian panen.
          </p>
        </div>
      )}

      {/* DAFTAR RIWAYAT */}
      {daftar.map((r) => (
        <Card key={r.id} className="border-[#DCE9D8] bg-white">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-[#0F2D1A]">
                  {r.nama_bahan}
                </p>

                <p className="mt-1 text-sm font-medium text-[#1B4D2B]">
                  {tanggalWaktu(r.dibuat_pada)}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#1B4D2B]">
                {LABEL_KEPUTUSAN[r.keputusan].judul}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-[#F1F7ED] p-3">
                <p className="text-xs font-semibold text-[#1B4D2B]">Panen</p>
                <p className="mt-1 font-bold text-[#0F2D1A]">
                  {kg(r.berat_panen_kg)}
                </p>
              </div>

              <div className="rounded-lg bg-[#F1F7ED] p-3">
                <p className="text-xs font-semibold text-[#1B4D2B]">
                  Hari Disediakan
                </p>
                <p className="mt-1 font-bold text-[#0F2D1A]">
                  {r.hari_disediakan} hari
                </p>
              </div>

              <div className="rounded-lg bg-[#F1F7ED] p-3">
                <p className="text-xs font-semibold text-[#1B4D2B]">Disimpan</p>
                <p className="mt-1 font-bold text-[#0F2D1A]">
                  {kg(r.berat_simpan_kg)}
                </p>
              </div>

              <div className="rounded-lg bg-[#F1F7ED] p-3">
                <p className="text-xs font-semibold text-[#1B4D2B]">Dijual</p>
                <p className="mt-1 font-bold text-[#0F2D1A]">
                  {kg(r.berat_jual_kg)}
                </p>
              </div>
            </div>

            <div className="border-t border-[#DCE9D8] pt-3 text-right">
              <p className="text-xs font-semibold text-[#1B4D2B]">
                Perkiraan Pendapatan
              </p>

              <p className="mt-1 text-lg font-bold text-[#0F2D1A]">
                {rupiah(r.pendapatan_rp)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
