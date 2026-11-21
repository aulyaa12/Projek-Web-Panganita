"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Stepper } from "@/components/Stepper";
import { simpanProfil } from "@/actions/profil";
import { jumlahOrangProfil } from "@/lib/panganita/profil";
import { DAFTAR_PROVINSI, DAFTAR_KABUPATEN_KOTA } from "@/lib/data/wilayah";
import { AvatarProfil } from "@/components/AvatarProfil";

// Gaya kartu.
const KARTU =
  "rounded-2xl border border-[#D5E2D2] bg-white shadow-[0_5px_25px_rgba(30,77,48,0.07)]";

// Kelompok usia anak.
const KELOMPOK_ANAK = [
  {
    kunci: "jumlah_bayi_6_11",
    label: "Bayi 6–11 Bulan",
    keterangan: "Butuh ASI dan MPASI padat protein hewani",
  },
  {
    kunci: "jumlah_anak_1_3",
    label: "Anak 1–3 Tahun",
    keterangan: "Fokus sumber tenaga dan lauk protein hewani",
  },
  {
    kunci: "jumlah_anak_4_6",
    label: "Anak 4–6 Tahun",
    keterangan: "Mulai porsi seimbang lauk, sayur, dan buah",
  },
  {
    kunci: "jumlah_anak_7_9",
    label: "Anak 7–9 Tahun",
    keterangan: "Butuh gizi seimbang untuk aktivitas sekolah",
  },
  {
    kunci: "jumlah_anak_l_10_12",
    label: "Anak Laki-laki 10–12 Tahun",
    keterangan: "Porsi makan besar untuk tenaga dan massa otot",
  },
  {
    kunci: "jumlah_anak_p_10_12",
    label: "Anak Perempuan 10–12 Tahun",
    keterangan: "Butuh lauk kaya zat besi dan sayuran hijau",
  },
];

// Data awal dari database.
function awalDari(p) {
  return {
    nama_ibu: p?.nama_ibu ?? "",
    provinsi: p?.provinsi ?? "",
    kabupaten_kota: p?.kabupaten_kota ?? "",

    ibu_hamil: p?.ibu_hamil ?? false,
    trimester_hamil: p?.trimester_hamil ?? null,

    ibu_menyusui: p?.ibu_menyusui ?? false,
    periode_menyusui: p?.periode_menyusui ?? null,

    jumlah_bayi_6_11: p?.jumlah_bayi_6_11 ?? 0,
    jumlah_anak_1_3: p?.jumlah_anak_1_3 ?? 0,
    jumlah_anak_4_6: p?.jumlah_anak_4_6 ?? 0,
    jumlah_anak_7_9: p?.jumlah_anak_7_9 ?? 0,
    jumlah_anak_l_10_12: p?.jumlah_anak_l_10_12 ?? 0,
    jumlah_anak_p_10_12: p?.jumlah_anak_p_10_12 ?? 0,
  };
}

// Filter autocomplete wilayah.
function opsiCocok(semua, teks) {
  if (!teks) return [];

  const q = teks.toLowerCase();

  return semua.filter((o) => o.toLowerCase().includes(q)).slice(0, 8);
}

function idLabel(label) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

// Input autocomplete.
function AutoCompleteInput({ value, onChange, label, placeholder, opsi }) {
  const [terbuka, setTerbuka] = useState(false);
  const [sorot, setSorot] = useState(-1);
  const [cocok, setCocok] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setCocok(opsiCocok(opsi, value));
  }, [value, opsi]);

  useEffect(() => {
    function klikDiLuar(e) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        setTerbuka(false);
      }
    }

    document.addEventListener("mousedown", klikDiLuar);

    return () => {
      document.removeEventListener("mousedown", klikDiLuar);
    };
  }, []);

  function pilih(o) {
    onChange(o);
    setTerbuka(false);
    setSorot(-1);
  }

  function tekan(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSorot((s) => (s >= cocok.length - 1 ? 0 : s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSorot((s) => (s <= 0 ? cocok.length - 1 : s - 1));
    } else if (e.key === "Enter") {
      if (cocok[sorot]) {
        pilih(cocok[sorot]);
      }
    } else if (e.key === "Escape") {
      setTerbuka(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label
        htmlFor={idLabel(label)}
        className="block text-sm font-semibold text-[#0F2D1A]"
      >
        {label}
      </Label>

      <div className="relative">
        <Input
          id={idLabel(label)}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setTerbuka(true);
          }}
          onFocus={() => setTerbuka(true)}
          onBlur={() => setTimeout(() => setTerbuka(false), 150)}
          onKeyDown={tekan}
          ref={inputRef}
          className="h-12 rounded-xl border-2 border-[#1B4D2B] bg-white px-3 text-base focus:border-[#3E8E1F] focus:ring-2 focus:ring-[#3E8E1F]"
          placeholder={placeholder}
        />

        {terbuka && cocok.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border-2 border-[#1B4D2B] bg-white shadow-xl"
          >
            {cocok.map((o, i) => (
              <li
                key={o}
                onClick={() => pilih(o)}
                className={`cursor-pointer select-none px-3 py-3 text-base ${
                  i === sorot
                    ? "bg-[#90C226]/30 font-semibold text-[#0F2D1A]"
                    : "text-[#0F2D1A]"
                } hover:bg-[#90C226]/15`}
              >
                {o}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-[#53665a]">{placeholder}</p>
    </div>
  );
}

// Pilihan dropdown sederhana.
function PilihanTunggal({ value, onChange, opsi }) {
  const [terbuka, setTerbuka] = useState(false);
  const [sorot, setSorot] = useState(-1);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  function pilih(o) {
    onChange(o);
    setTerbuka(false);
    setSorot(-1);
  }

  function tekan(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSorot((s) => (s >= opsi.length - 1 ? 0 : s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSorot((s) => (s <= 0 ? opsi.length - 1 : s - 1));
    } else if (e.key === "Enter") {
      if (opsi[sorot]) {
        pilih(opsi[sorot]);
      }
    } else if (e.key === "Escape") {
      setTerbuka(false);
    }
  }

  return (
    <div className="relative space-y-1">
      <input
        readOnly
        aria-label="Pilih salah satu"
        onFocus={() => setTerbuka(true)}
        onClick={() => setTerbuka(true)}
        onBlur={() => setTimeout(() => setTerbuka(false), 150)}
        onKeyDown={tekan}
        ref={inputRef}
        value={value ?? ""}
        className="h-12 w-full cursor-pointer rounded-xl border-2 border-[#1B4D2B] bg-white px-3 text-base focus:border-[#3E8E1F] focus:ring-2 focus:ring-[#3E8E1F]"
      />

      {terbuka && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border-2 border-[#1B4D2B] bg-white shadow-xl"
        >
          {opsi.map((o, i) => (
            <li
              key={o}
              onClick={() => pilih(o)}
              className={`cursor-pointer select-none px-3 py-3 text-base ${
                i === sorot
                  ? "bg-[#90C226]/30 font-semibold text-[#0F2D1A]"
                  : "text-[#0F2D1A]"
              } hover:bg-[#90C226]/15`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// FORM PROFIL KELUARGA.
export function ProfilForm({ awal }) {
  const router = useRouter();

  const [form, setForm] = useState(() => awalDari(awal));
  const [sedangSimpan, startTransition] = useTransition();

  // Mengubah data form.
  const ubah = (kunci, nilai) => {
    setForm((f) => ({
      ...f,
      [kunci]: nilai,
    }));
  };

  // Total dihitung dari checkbox ibu dan jumlah anak.
  // Perhitungan menggunakan helper yang sama dengan dashboard.
  const totalOrang = jumlahOrangProfil(form);

  // Menyimpan profil ke Supabase.
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

  const TRIMESTER_OPSI = ["Trimester 1", "Trimester 2", "Trimester 3"];

  const PERIODE_OPSI = ["Bayi termuda 0–6 bulan", "Bayi termuda 7–12 bulan"];

  return (
    <div className="space-y-6">
      {/* DATA IBU */}
      <Card className={KARTU}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-xl font-extrabold text-[#0F2D1A]">
              Data Ibu
            </CardTitle>

            <CardDescription className="text-sm text-[#53665a]">
              Nama ini digunakan untuk profil keluarga.
            </CardDescription>
          </div>

          <AvatarProfil />
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="nama"
              className="block text-sm font-semibold text-[#0F2D1A]"
            >
              Nama Ibu
            </Label>

            <Input
              id="nama"
              value={form.nama_ibu}
              onChange={(e) => ubah("nama_ibu", e.target.value)}
              className="h-12 rounded-xl border-2 border-[#1B4D2B] bg-white px-3 text-base focus:border-[#3E8E1F] focus:ring-2 focus:ring-[#3E8E1F]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AutoCompleteInput
              label="Provinsi"
              value={form.provinsi}
              onChange={(v) => ubah("provinsi", v)}
              placeholder="Ketik nama provinsi, misalnya Papua Barat"
              opsi={DAFTAR_PROVINSI}
            />

            <AutoCompleteInput
              label="Kabupaten atau Kota"
              value={form.kabupaten_kota}
              onChange={(v) => ubah("kabupaten_kota", v)}
              placeholder="Ketik nama kabupaten atau kota, misalnya Teluk Bintuni"
              opsi={DAFTAR_KABUPATEN_KOTA}
            />
          </div>
        </CardContent>
      </Card>

      {/* KONDISI IBU */}
      <Card className={KARTU}>
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-[#0F2D1A]">
            Kondisi Ibu
          </CardTitle>

          <CardDescription className="text-sm text-[#53665a]">
            Pilih sesuai dengan kondisi saat ini.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* IBU HAMIL */}
          <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 border-[#D5E2D2] p-4 transition-colors has-[:checked]:border-[#3E8E1F] has-[:checked]:bg-[#EAF1E8]">
            <input
              type="checkbox"
              className="mt-0.5 h-6 w-6 shrink-0 accent-[#3E8E1F]"
              checked={form.ibu_hamil}
              onChange={(e) => {
                const on = e.target.checked;

                setForm((f) => ({
                  ...f,
                  ibu_hamil: on,
                  trimester_hamil: on ? (f.trimester_hamil ?? 1) : null,
                }));
              }}
            />

            <span>
              <span className="block font-medium text-[#0F2D1A]">
                Ibu Hamil
              </span>

              <span className="text-sm text-[#53665a]">
                Pilih trimester kehamilan
              </span>
            </span>
          </label>

          {form.ibu_hamil && (
            <div className="space-y-2">
              <Label
                htmlFor="trimester"
                className="block text-sm font-semibold text-[#0F2D1A]"
              >
                Trimester Kehamilan
              </Label>

              <PilihanTunggal
                value={
                  form.trimester_hamil
                    ? TRIMESTER_OPSI[form.trimester_hamil - 1]
                    : ""
                }
                onChange={(v) =>
                  ubah("trimester_hamil", TRIMESTER_OPSI.indexOf(v) + 1)
                }
                opsi={TRIMESTER_OPSI}
              />
            </div>
          )}

          {/* IBU MENYUSUI */}
          <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 border-[#D5E2D2] p-4 transition-colors has-[:checked]:border-[#3E8E1F] has-[:checked]:bg-[#EAF1E8]">
            <input
              type="checkbox"
              className="mt-0.5 h-6 w-6 shrink-0 accent-[#3E8E1F]"
              checked={form.ibu_menyusui}
              onChange={(e) => {
                const on = e.target.checked;

                setForm((f) => ({
                  ...f,
                  ibu_menyusui: on,
                  periode_menyusui: on ? (f.periode_menyusui ?? 1) : null,
                }));
              }}
            />

            <span>
              <span className="block font-medium text-[#0F2D1A]">
                Ibu Menyusui
              </span>

              <span className="text-sm text-[#53665a]">
                Pilih usia bayi termuda
              </span>
            </span>
          </label>

          {form.ibu_menyusui && (
            <div className="space-y-2">
              <Label
                htmlFor="periode"
                className="block text-sm font-semibold text-[#0F2D1A]"
              >
                Usia bayi termuda
              </Label>

              <PilihanTunggal
                value={
                  form.periode_menyusui
                    ? PERIODE_OPSI[form.periode_menyusui - 1]
                    : ""
                }
                onChange={(v) =>
                  ubah("periode_menyusui", PERIODE_OPSI.indexOf(v) + 1)
                }
                opsi={PERIODE_OPSI}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ANAK DALAM KELUARGA */}
      <Card className={KARTU}>
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-[#0F2D1A]">
            Anak dalam Keluarga
          </CardTitle>

          <CardDescription className="text-sm text-[#53665a]">
            Gunakan tombol tambah atau kurang sesuai jumlah anak pada setiap
            kelompok usia.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {KELOMPOK_ANAK.map((k) => (
            <div
              key={k.kunci}
              className="flex flex-col gap-3 rounded-xl border border-[#D5E2D2] bg-[#F4F7F2] p-4 md:flex-row md:items-center md:justify-between md:gap-4"
            >
              {/* KETERANGAN KELOMPOK USIA */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#0F2D1A]">{k.label}</p>

                <p className="text-sm leading-relaxed text-[#53665a]">
                  {k.keterangan}
                </p>
              </div>

              {/* STEPPER */}
              <div className="flex shrink-0 justify-start md:justify-end">
                <Stepper
                  nilai={form[k.kunci]}
                  onChange={(n) => ubah(k.kunci, n)}
                  label={k.label}
                />
              </div>
            </div>
          ))}

          <p className="text-right text-sm text-[#53665a]">
            *berdasarkan{" "}
            <a
              href="https://ditsd.kemendikdasmen.go.id/artikel/detail/isi-piringku-dengan-menu-gizi-seimbang"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#3E8E1F] underline underline-offset-2 hover:text-[#1B4D2B]"
            >
              Isi Piringku
            </a>
          </p>
        </CardContent>
      </Card>

      {/* TOTAL ANGGOTA KELUARGA */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#90C226] bg-[#90C226]/15 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-bold text-[#1B4D2B]">Total Anggota Keluarga</p>

          <p className="text-sm leading-relaxed text-[#53665a]">
            Ibu dan seluruh anak yang dipilih
          </p>
        </div>

        <div className="flex items-baseline gap-2 sm:shrink-0 sm:justify-end">
          <span className="text-3xl font-extrabold tabular-nums text-[#1B4D2B]">
            {totalOrang}
          </span>

          <span className="text-2xl font-bold text-[#1B4D2B] sm:text-3xl">
            Orang
          </span>
        </div>
      </div>

      {/* SIMPAN PROFIL */}
      <PrimaryButton lebarPenuh onClick={simpan} sedangMemuat={sedangSimpan}>
        {sedangSimpan ? "Menyimpan…" : "Simpan Profil Keluarga"}
      </PrimaryButton>
    </div>
  );
}

export default ProfilForm;
