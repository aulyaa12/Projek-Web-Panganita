"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stepper } from "@/components/Stepper";
import { simpanProfil } from "@/actions/profil";
import { jumlahOrangProfil } from "@/lib/panganita/profil";
import { DAFTAR_PROVINSI, DAFTAR_KABUPATEN_KOTA } from "@/lib/data/wilayah";

const KELOMPOK_ANAK = [
  { kunci: "jumlah_bayi_6_11", label: "Bayi 6–11 bulan", keterangan: "Butuh ASI dan MPASI padat protein hewani" },
  { kunci: "jumlah_anak_1_3", label: "Anak 1–3 tahun", keterangan: "Fokus sumber tenaga dan lauk protein hewani" },
  { kunci: "jumlah_anak_4_6", label: "Anak 4–6 tahun", keterangan: "Mulai porsi seimbang lauk, sayur, dan buah" },
  { kunci: "jumlah_anak_7_9", label: "Anak 7–9 tahun", keterangan: "Butuh gizi seimbang untuk aktivitas sekolah" },
  { kunci: "jumlah_anak_l_10_12", label: "Anak laki-laki 10–12 tahun", keterangan: "Porsi makan besar untuk tenaga dan massa otot" },
  { kunci: "jumlah_anak_p_10_12", label: "Anak perempuan 10–12 tahun", keterangan: "Butuh lauk kaya zat besi dan sayuran hijau" },
];

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

function opsiCocok(semua, teks) {
  if (!teks) return [];
  const q = teks.toLowerCase();
  return semua.filter((o) => o.toLowerCase().includes(q)).slice(0, 8);
}

function idLabel(label) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

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
    return () => document.removeEventListener("mousedown", klikDiLuar);
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
      if (cocok[sorot]) pilih(cocok[sorot]);
    } else if (e.key === "Escape") {
      setTerbuka(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={idLabel(label)} className="block text-sm font-semibold text-[#0F2D1A]">
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
          className="h-12 text-base border-2 border-[#1B4D2B] bg-white focus:ring-2 ring-[#3E8E1F] focus:border-[#3E8E1F] rounded-md px-3"
          placeholder={placeholder}
        />
        {terbuka && cocok.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border-2 border-[#1B4D2B] bg-white rounded-md shadow-xl"
          >
            {cocok.map((o, i) => (
              <li
                key={o}
                onClick={() => pilih(o)}
                className={`px-3 py-3 text-base cursor-pointer select-none ${i === sorot ? "bg-[#90C226]/30 text-[#0F2D1A] font-semibold" : "text-[#0F2D1A]"} hover:bg-[#90C226]/15`}
              >
                {o}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-[#1B4D2B]/70">{placeholder}</p>
    </div>
  );
}

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
      if (opsi[sorot]) pilih(opsi[sorot]);
    } else if (e.key === "Escape") {
      setTerbuka(false);
    }
  }

  return (
    <div className="relative space-y-1">
      <input
        readOnly
        onFocus={() => setTerbuka(true)}
        onClick={() => setTerbuka(true)}
        onBlur={() => setTimeout(() => setTerbuka(false), 150)}
        onKeyDown={tekan}
        ref={inputRef}
        value={value ?? ""}
        className="h-12 w-full text-base border-2 border-[#1B4D2B] bg-white rounded-md px-3 focus:ring-2 ring-[#3E8E1F] focus:border-[#3E8E1F] cursor-pointer"
      />
      {terbuka && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-48 overflow-auto border-2 border-[#1B4D2B] bg-white rounded-md shadow-xl"
        >
          {opsi.map((o, i) => (
            <li
              key={o}
              onClick={() => pilih(o)}
              className={`px-3 py-3 text-base cursor-pointer select-none ${i === sorot ? "bg-[#90C226]/30 text-[#0F2D1A] font-semibold" : "text-[#0F2D1A]"} hover:bg-[#90C226]/15`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProfilForm({ awal }) {
  const router = useRouter();
  const [form, setForm] = useState(() => awalDari(awal));
  const [sedangSimpan, startTransition] = useTransition();

  const ubah = (kunci, nilai) => setForm((f) => ({ ...f, [kunci]: nilai }));

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

  const TRIMESTER_OPSI = ["Trimester 1", "Trimester 2", "Trimester 3"];
  const PERIODE_OPSI = ["Bayi termuda 0–6 bulan", "Bayi termuda 7–12 bulan"];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#1B4D2B] rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#0F2D1A]">Data ibu</CardTitle>
          <CardDescription className="text-sm text-[#1B4D2B]/80">
            Nama ini digunakan untuk profil keluarga.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama" className="block text-sm font-semibold text-[#0F2D1A]">
              Nama ibu
            </Label>
            <Input
              id="nama"
              value={form.nama_ibu}
              onChange={(e) => ubah("nama_ibu", e.target.value)}
              className="h-12 text-base border-2 border-[#1B4D2B] bg-white focus:ring-2 ring-[#3E8E1F] focus:border-[#3E8E1F] rounded-md px-3"
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
              label="Kabupaten atau kota"
              value={form.kabupaten_kota}
              onChange={(v) => ubah("kabupaten_kota", v)}
              placeholder="Ketik nama kabupaten atau kota, misalnya Teluk Bintuni"
              opsi={DAFTAR_KABUPATEN_KOTA}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#1B4D2B] rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#0F2D1A]">Kondisi ibu</CardTitle>
          <CardDescription className="text-sm text-[#1B4D2B]/80">
            Pilih jika sesuai dengan kondisi saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 rounded-xl border-2 border-[#1B4D2B] p-4">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#3E8E1F]"
              checked={form.ibu_hamil}
              onChange={(e) => {
                const on = e.target.checked;
                ubah("ibu_hamil", on);
                ubah("trimester_hamil", on ? form.trimester_hamil ?? 1 : null);
              }}
            />
            <span>
              <span className="block font-medium text-[#0F2D1A]">Ibu hamil</span>
              <span className="text-sm text-[#1B4D2B]/80">Pilih trimester kehamilan</span>
            </span>
          </label>
          {form.ibu_hamil && (
            <div className="space-y-2">
              <Label htmlFor="trimester" className="block text-sm font-semibold text-[#0F2D1A]">
                Trimester kehamilan
              </Label>
              <PilihanTunggal
                value={form.trimester_hamil ? TRIMESTER_OPSI[form.trimester_hamil - 1] : ""}
                onChange={(v) => ubah("trimester_hamil", TRIMESTER_OPSI.indexOf(v) + 1)}
                opsi={TRIMESTER_OPSI}
              />
            </div>
          )}

          <label className="flex items-start gap-3 rounded-xl border-2 border-[#1B4D2B] p-4">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#3E8E1F]"
              checked={form.ibu_menyusui}
              onChange={(e) => {
                const on = e.target.checked;
                ubah("ibu_menyusui", on);
                ubah("periode_menyusui", on ? form.periode_menyusui ?? 1 : null);
              }}
            />
            <span>
              <span className="block font-medium text-[#0F2D1A]">Ibu menyusui</span>
              <span className="text-sm text-[#1B4D2B]/80">Pilih usia bayi termuda</span>
            </span>
          </label>
          {form.ibu_menyusui && (
            <div className="space-y-2">
              <Label htmlFor="periode" className="block text-sm font-semibold text-[#0F2D1A]">
                Usia bayi termuda
              </Label>
              <PilihanTunggal
                value={form.periode_menyusui ? PERIODE_OPSI[form.periode_menyusui - 1] : ""}
                onChange={(v) => ubah("periode_menyusui", PERIODE_OPSI.indexOf(v) + 1)}
                opsi={PERIODE_OPSI}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-[#1B4D2B] rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#0F2D1A]">Anak dalam keluarga</CardTitle>
          <CardDescription className="text-sm text-[#1B4D2B]/80">
            Gunakan tombol tambah atau kurang sesuai jumlah anak pada setiap kelompok usia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {KELOMPOK_ANAK.map((k) => (
            <div key={k.kunci} className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#1B4D2B] p-4">
              <div>
                <p className="font-medium text-[#0F2D1A]">{k.label}</p>
                <p className="text-xs text-[#1B4D2B]/80">{k.keterangan}</p>
              </div>
              <Stepper nilai={form[k.kunci]} onChange={(n) => ubah(k.kunci, n)} label={k.label} />
            </div>
          ))}

          <p className="text-xs text-right text-[#1B4D2B]/70">
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

      <div className="flex items-center justify-between rounded-xl border-2 border-[#90C226]/60 bg-[#90C226]/15 p-4">
        <div>
          <p className="font-medium text-[#1B4D2B]">Total anggota keluarga</p>
          <p className="text-sm text-[#1B4D2B]/80">Ibu dan seluruh anak yang dipilih</p>
        </div>
        <p className="text-2xl font-bold text-[#1B4D2B]">{totalOrang} orang</p>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={simpan}
        disabled={sedangSimpan}>
        {sedangSimpan ? "Menyimpan…" : "Simpan profil keluarga"}
      </Button>
    </div>
  );
}