
"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Camera,
  UploadCloud,
  ImagePlus,
  X,
  Leaf,
  Info,
  ScanSearch,
  Loader2,
  Wheat,
} from "lucide-react";

import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Stepper } from "@/components/Stepper";
import { PilihanKartu } from "@/components/PilihanKartu";

import {
  ambilAlternatif,
  simpanKeputusan,
} from "@/actions/keputusan";

import { kg } from "@/lib/format";

import type {
  BahanPangan,
  HasilHitung,
  Keputusan,
} from "@/lib/panganita/types";

type Props = {
  bahan: BahanPangan[];
  hariDefault: number;
};

const BUCKET_FOTO = "hasil-panen";
const MAKS_FOTO_BYTE = 10 * 1024 * 1024;

const TIPE_FOTO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const NAMA_KATEGORI: Record<string, string> = {
  lauk_hewani: "Lauk hewani",
  sayur_buah: "Sayur dan buah",
  makanan_pokok: "Makanan pokok",
};

export function PindaiForm({ bahan, hariDefault }: Props) {
  const router = useRouter();
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [bahanId, setBahanId] = useState<number>(
    bahan[0]?.id ?? 0
  );

  const [berat, setBerat] = useState("");
  const [harga, setHarga] = useState(
    String(bahan[0]?.harga_umum_per_kg ?? "")
  );

  const [hari, setHari] = useState(hariDefault);

  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [hasil, setHasil] = useState<HasilHitung | null>(null);

  const [sibuk, startTransition] = useTransition();

  const terpilih = useMemo(
    () => bahan.find((b) => b.id === bahanId),
    [bahan, bahanId]
  );

  // Membersihkan URL preview ketika foto berubah atau komponen ditutup.
  useEffect(() => {
    if (!previewFoto) return;

    return () => URL.revokeObjectURL(previewFoto);
  }, [previewFoto]);

  function pilihBahan(id: number) {
    setBahanId(id);
    setHasil(null);

    const item = bahan.find((b) => b.id === id);

    if (item?.harga_umum_per_kg != null) {
      setHarga(String(item.harga_umum_per_kg));
    } else {
      setHarga("");
    }
  }

  // Memilih foto dan membuat preview lokal.
  function pilihFoto(file?: File) {
    if (!file) return;

    if (!Object.keys(TIPE_FOTO).includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAKS_FOTO_BYTE) {
      toast.error("Ukuran foto maksimal 10 MB.");
      return;
    }

    setFileFoto(file);
    setPreviewFoto(URL.createObjectURL(file));
  }

  function hapusFoto() {
    setFileFoto(null);
    setPreviewFoto(null);

    if (inputFotoRef.current) {
      inputFotoRef.current.value = "";
    }
  }

  // Validasi input panen.
  function validasi(): {
    beratPanenKg: number;
    hargaJualPerKg: number;
  } | null {
    if (!bahanId || !terpilih) {
      toast.error("Pilih jenis pangan terlebih dahulu.");
      return null;
    }

    const beratPanenKg = Number(berat.replace(",", "."));

    if (!Number.isFinite(beratPanenKg) || beratPanenKg <= 0) {
      toast.error("Berat panen harus lebih dari 0 kg.");
      return null;
    }

    if (harga.trim() === "") {
      toast.error("Harga jual wajib diisi.");
      return null;
    }

    const hargaJualPerKg = Number(
      harga.replace(/[^0-9]/g, "")
    );

    if (!Number.isFinite(hargaJualPerKg)) {
      toast.error("Harga jual tidak valid.");
      return null;
    }

    return {
      beratPanenKg,
      hargaJualPerKg,
    };
  }

  // Menghitung tiga alternatif pembagian panen.
  function hitung() {
    const v = validasi();

    if (!v) return;

    startTransition(async () => {
      const r = await ambilAlternatif({
        bahanId,
        beratPanenKg: v.beratPanenKg,
        hargaJualPerKg: v.hargaJualPerKg,
        hariDisediakan: hari,
      });

      if (!r.ok) {
        toast.error(r.pesan);
        setHasil(null);
        return;
      }

      setHasil(r.data);
    });
  }

  // Upload foto dilakukan ketika keputusan disimpan.
  // Dengan demikian, simulasi tidak menghasilkan file yatim.
  async function unggahFoto(): Promise<{
    path: string;
    tipeMime: "image/jpeg" | "image/png" | "image/webp";
    ukuranByte: number;
  } | null> {
    if (!fileFoto) return null;

    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Sesi login tidak valid. Silakan masuk kembali.");
    }

    const ekstensi = TIPE_FOTO[
      fileFoto.type as keyof typeof TIPE_FOTO
    ];

    const path = `${user.id}/${crypto.randomUUID()}.${ekstensi}`;

    const { error } = await supabase.storage
      .from(BUCKET_FOTO)
      .upload(path, fileFoto, {
        cacheControl: "3600",
        contentType: fileFoto.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload foto gagal:", error);
      throw new Error("Foto gagal diunggah. Silakan coba kembali.");
    }

    return {
      path,
      tipeMime: fileFoto.type as
        | "image/jpeg"
        | "image/png"
        | "image/webp",
      ukuranByte: fileFoto.size,
    };
  }

  // Menghapus upload jika penyimpanan keputusan gagal.
  async function bersihkanUpload(path: string) {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.storage
      .from(BUCKET_FOTO)
      .remove([path]);

    if (error) {
      console.error("Gagal membersihkan foto:", error);
    }
  }

  // Menyimpan pilihan pengguna.
  function pilih(keputusan: Keputusan) {
    const v = validasi();

    if (!v) return;

    startTransition(async () => {
      let pathUpload: string | null = null;

      try {
        const foto = await unggahFoto();

        pathUpload = foto?.path ?? null;

        const r = await simpanKeputusan({
          bahanId,
          beratPanenKg: v.beratPanenKg,
          hargaJualPerKg: v.hargaJualPerKg,
          hariDisediakan: hari,
          keputusan,
          foto,
        });

        if (!r.ok) {
          if (pathUpload) {
            await bersihkanUpload(pathUpload);
          }

          toast.error(r.pesan);
          return;
        }

        toast.success("Keputusan panen berhasil disimpan.");

        router.push("/riwayat");
        router.refresh();
      } catch (error) {
        if (pathUpload) {
          await bersihkanUpload(pathUpload);
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan keputusan."
        );
      }
    });
  }

  return (
    <div className="space-y-8">

      {/* FORM UTAMA */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">

        {/* KOLOM KIRI: FOTO PANEN */}
        <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-white pb-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Foto hasil panen
                </CardTitle>

                <CardDescription className="mt-1">
                  Dokumentasikan hasil panen yang diperoleh.
                </CardDescription>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Camera className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5">

            <input
              ref={inputFotoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                pilihFoto(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />

            {previewFoto ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={previewFoto}
                  alt="Preview hasil panen"
                  className="h-[320px] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={hapusFoto}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition hover:bg-red-50"
                  aria-label="Hapus foto"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow">
                  {fileFoto?.name}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputFotoRef.current?.click()}
                className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <ImagePlus className="h-8 w-8" />
                </div>

                <p className="font-semibold text-slate-900">
                  Unggah foto hasil panen
                </p>

                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  Ambil foto secara langsung atau pilih gambar
                  dari galeri perangkat.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900">
                  <UploadCloud className="h-4 w-4" />
                  Pilih foto
                </span>

                <span className="mt-4 text-xs text-slate-400">
                  JPG, PNG, WebP · Maksimal 10 MB
                </span>
              </button>
            )}

            {previewFoto && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => inputFotoRef.current?.click()}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Ganti foto
              </Button>
            )}

            <div className="flex gap-3 rounded-xl bg-emerald-50 p-4">
              <ScanSearch className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Analisis visual hasil panen
                </p>

                <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                  Foto ini akan menjadi dokumentasi panen dan
                  dapat digunakan untuk integrasi deteksi pangan
                  menggunakan YOLO pada tahap berikutnya.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KOLOM KANAN: DATA PANEN */}
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Informasi hasil panen
                </CardTitle>

                <CardDescription className="mt-1">
                  Lengkapi informasi pangan yang diperoleh.
                </CardDescription>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Wheat className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5">

            {/* JENIS PANGAN */}
            <div className="space-y-2">
              <Label htmlFor="bahan">
                Jenis pangan
              </Label>

              <select
                id="bahan"
                value={bahanId}
                onChange={(e) => pilihBahan(Number(e.target.value))}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {bahan.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama}
                  </option>
                ))}
              </select>

              {terpilih && (
                <div className="flex items-center gap-2 pt-1">
                  <Leaf className="h-3.5 w-3.5 text-emerald-700" />
                  <p className="text-xs text-slate-500">
                    Kategori:{" "}
                    <span className="font-medium text-emerald-800">
                      {NAMA_KATEGORI[terpilih.kategori]}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* BERAT DAN HARGA */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="berat">
                  Berat panen
                </Label>

                <div className="relative">
                  <Input
                    id="berat"
                    inputMode="decimal"
                    placeholder="Contoh: 2"
                    value={berat}
                    onChange={(e) => {
                      setBerat(e.target.value);
                      setHasil(null);
                    }}
                    className="h-12 pr-12"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harga">
                  Harga jual per kg
                </Label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    Rp
                  </span>

                  <Input
                    id="harga"
                    inputMode="numeric"
                    placeholder="8000"
                    value={harga}
                    onChange={(e) => {
                      setHarga(e.target.value);
                      setHasil(null);
                    }}
                    className="h-12 pl-10"
                  />
                </div>
              </div>
            </div>

            {/* LAMA CADANGAN */}
            <div className="space-y-2">
              <Label>
                Lama cadangan pangan
              </Label>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {hari} hari
                  </p>

                  <p className="text-xs text-slate-500">
                    Periode penyediaan pangan keluarga
                  </p>
                </div>

                <Stepper
                  nilai={hari}
                  maks={30}
                  label="hari"
                  onChange={(n) => {
                    setHari(Math.max(1, n));
                    setHasil(null);
                  }}
                />
              </div>
            </div>

            {/* INFORMASI */}
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

              <p className="text-xs leading-relaxed text-amber-900">
                Data berat dan harga digunakan untuk menghitung
                kebutuhan cadangan pangan serta perkiraan
                pendapatan dari hasil panen.
              </p>
            </div>

            {/* TOMBOL HITUNG */}
            <Button
              className="h-12 w-full rounded-xl bg-emerald-800 text-base font-semibold hover:bg-emerald-900"
              onClick={hitung}
              disabled={sibuk}
            >
              {sibuk ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghitung...
                </>
              ) : (
                <>
                  Hitung pembagian panen
                  <ScanSearch className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400">
              Perhitungan menggunakan profil keluarga dan
              pengaturan rumus PANGANITA.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* EDUKASI PANGAN */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
            <Leaf className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-emerald-950">
              Prioritaskan kebutuhan keluarga
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-emerald-800">
              Sebagian hasil panen perlu dipertimbangkan untuk
              memenuhi kebutuhan pangan dan gizi keluarga.
            </p>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Info className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Keputusan tetap di tangan Ibu
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              PANGANITA memberikan alternatif pembagian panen.
              Ibu dapat memilih keputusan yang paling sesuai
              dengan kondisi keluarga.
            </p>
          </div>
        </div>
      </div>

      {/* HASIL SIMULASI */}
      {hasil && (
        <section className="space-y-5" id="hasil-simulasi">

          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Hasil analisis
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Rekomendasi pembagian panen
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Berikut alternatif berdasarkan kebutuhan gizi
              keluarga dan hasil panen yang dimasukkan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs text-slate-500">
                  Anggota keluarga dihitung
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {hasil.jumlahOrang} orang
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs text-slate-500">
                  Kebutuhan cadangan
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {kg(hasil.kebutuhanCadanganKg)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs text-slate-500">
                  Kekurangan pangan
                </p>

                <p className={`mt-2 text-2xl font-bold ${
                  hasil.kekuranganKg > 0
                    ? "text-red-600"
                    : "text-emerald-700"
                }`}>
                  {kg(hasil.kekuranganKg)}
                </p>
              </CardContent>
            </Card>
          </div>

          {hasil.kekuranganKg > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              Panen belum mencukupi kebutuhan cadangan selama{" "}
              {hari} hari. Kekurangan sebanyak{" "}
              <strong>{kg(hasil.kekuranganKg)}</strong>.
              Pertimbangkan untuk menyediakan tambahan pangan
              dari sumber lain.
            </div>
          )}

          <PilihanKartu
            alternatif={hasil.alternatif}
            onPilih={pilih}
            sibuk={sibuk}
          />

          {fileFoto && (
            <p className="text-center text-xs text-slate-500">
              Foto akan diunggah ke penyimpanan PANGANITA
              ketika Ibu menyimpan keputusan.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
