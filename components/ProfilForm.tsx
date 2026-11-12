"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/Stepper";
import { simpanProfil } from "@/actions/profil";
import { jumlahOrangProfil } from "@/lib/panganita/profil";
import type { ProfilKeluarga } from "@/lib/panganita/types";

const KELOMPOK_ANAK = [
  { kunci: "jumlah_bayi_6_11", label: "Bayi 6–11 bulan", keterangan: "Usia 6 sampai 11 bulan" },
  { kunci: "jumlah_anak_1_3", label: "Anak 1–3 tahun", keterangan: "Usia 1 sampai 3 tahun" },
  { kunci: "jumlah_anak_4_6", label: "Anak 4–6 tahun", keterangan: "Usia 4 sampai 6 tahun" },
  { kunci: "jumlah_anak_7_9", label: "Anak 7–9 tahun", keterangan: "Usia 7 sampai 9 tahun" },
  { kunci: "jumlah_anak_l_10_12", label: "Anak laki-laki 10–12 tahun", keterangan: "Usia 10 sampai 12 tahun" },
  { kunci: "jumlah_anak_p_10_12", label: "Anak perempuan 10–12 tahun", keterangan: "Usia 10 sampai 12 tahun" },
] as const;

type JumlahKey = (typeof KELOMPOK_ANAK)[number]["kunci"];

type FormState = {
  nama_ibu: string;
  provinsi: string;
  kabupaten_kota: string;
  ibu_hamil: boolean;
  trimester_hamil: 1 | 2 | 3 | null;
  ibu_menyusui: boolean;
  periode_menyusui: 1 | 2 | null;
} & Record<JumlahKey, number>;

function awalDari(p: ProfilKeluarga | null): FormState {
  return {
    nama_ibu: p?.nama_ibu ?? "",
    provinsi: p?.provinsi ?? "",
    kabupaten_kota: p?.kabupaten_kota ?? "",
    ibu_hamil: p?.ibu_hamil ?? false,
    trimester_hamil: (p?.trimester_hamil ?? null) as 1 | 2 | 3 | null,
    ibu_menyusui: p?.ibu_menyusui ?? false,
    periode_menyusui: (p?.periode_menyusui ?? null) as 1 | 2 | null,
    jumlah_bayi_6_11: p?.jumlah_bayi_6_11 ?? 0,
    jumlah_anak_1_3: p?.jumlah_anak_1_3 ?? 0,
    jumlah_anak_4_6: p?.jumlah_anak_4_6 ?? 0,
    jumlah_anak_7_9: p?.jumlah_anak_7_9 ?? 0,
    jumlah_anak_l_10_12: p?.jumlah_anak_l_10_12 ?? 0,
    jumlah_anak_p_10_12: p?.jumlah_anak_p_10_12 ?? 0,
  };
}

export function ProfilForm({ awal }: { awal: ProfilKeluarga | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => awalDari(awal));
  const [sedangSimpan, startTransition] = useTransition();

  const ubah = <K extends keyof FormState>(kunci: K, nilai: FormState[K]) =>
    setForm((f) => ({ ...f, [kunci]: nilai }) as FormState);

  const totalOrang = jumlahOrangProfil(form);

  function simpan() {
    if (!form.nama_ibu.trim()) {
      toast.error("Nama ibu wajib diisi.");
      return;
    }
    startTransition(async () => {
      const hasil = await simpanProfil(form);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      toast.success("Profil keluarga tersimpan.");
      router.push("/pindai");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data ibu</CardTitle>
          <CardDescription>Nama ini digunakan untuk profil keluarga.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama ibu</Label>
            <Input id="nama" value={form.nama_ibu} onChange={(e) => ubah("nama_ibu", e.target.value)} className="h-12 text-base" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provinsi">Provinsi</Label>
              <Input id="provinsi" value={form.provinsi} onChange={(e) => ubah("provinsi", e.target.value)} className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kabupaten">Kabupaten atau kota</Label>
              <Input id="kabupaten" value={form.kabupaten_kota} onChange={(e) => ubah("kabupaten_kota", e.target.value)} className="h-12 text-base" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kondisi ibu</CardTitle>
          <CardDescription>Pilih jika sesuai dengan kondisi saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-emerald-700"
              checked={form.ibu_hamil}
              onChange={(e) => {
                const on = e.target.checked;
                ubah("ibu_hamil", on);
                ubah("trimester_hamil", on ? form.trimester_hamil ?? 1 : null);
              }}
            />
            <span>
              <span className="block font-medium">Ibu hamil</span>
              <span className="text-sm text-stone-600">Pilih trimester kehamilan</span>
            </span>
          </label>
          {form.ibu_hamil && (
            <select
              aria-label="Trimester kehamilan"
              className="h-12 w-full rounded-md border bg-white px-3 text-base"
              value={form.trimester_hamil ?? 1}
              onChange={(e) => ubah("trimester_hamil", Number(e.target.value) as 1 | 2 | 3)}
            >
              <option value={1}>Trimester 1</option>
              <option value={2}>Trimester 2</option>
              <option value={3}>Trimester 3</option>
            </select>
          )}

          <label className="flex items-start gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-emerald-700"
              checked={form.ibu_menyusui}
              onChange={(e) => {
                const on = e.target.checked;
                ubah("ibu_menyusui", on);
                ubah("periode_menyusui", on ? form.periode_menyusui ?? 1 : null);
              }}
            />
            <span>
              <span className="block font-medium">Ibu menyusui</span>
              <span className="text-sm text-stone-600">Pilih usia bayi termuda</span>
            </span>
          </label>
          {form.ibu_menyusui && (
            <select
              aria-label="Usia bayi menyusui"
              className="h-12 w-full rounded-md border bg-white px-3 text-base"
              value={form.periode_menyusui ?? 1}
              onChange={(e) => ubah("periode_menyusui", Number(e.target.value) as 1 | 2)}
            >
              <option value={1}>Bayi termuda 0–6 bulan</option>
              <option value={2}>Bayi termuda 7–12 bulan</option>
            </select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anak dalam keluarga</CardTitle>
          <CardDescription>Gunakan tombol tambah atau kurang sesuai jumlah anak pada setiap kelompok usia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {KELOMPOK_ANAK.map((k) => (
            <div key={k.kunci} className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <div>
                <p className="font-medium">{k.label}</p>
                <p className="text-sm text-stone-600">{k.keterangan}</p>
              </div>
              <Stepper nilai={form[k.kunci]} onChange={(n) => ubah(k.kunci, n)} label={k.label} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
        <div>
          <p className="font-medium text-emerald-900">Total anggota keluarga</p>
          <p className="text-sm text-stone-600">Ibu dan seluruh anak yang dipilih</p>
        </div>
        <p className="text-2xl font-bold text-emerald-900">{totalOrang} orang</p>
      </div>

      <Button className="h-12 w-full text-base" onClick={simpan} disabled={sedangSimpan}>
        Simpan profil keluarga
      </Button>
    </div>
  );
}
