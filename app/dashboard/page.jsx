import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  History,
  Leaf,
  MessageCircle,
  ScanLine,
  Sprout,
  Users,
  Wallet,
} from "lucide-react";

import { AvatarProfil } from "@/components/AvatarProfil";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { createClient } from "@/lib/supabase/server";
import { muatProfilSaya } from "@/lib/data/referensi";
import { jumlahOrangProfil } from "@/lib/panganita/profil";
import { LABEL_KEPUTUSAN } from "@/lib/panganita/label";
import { rupiah, tanggal } from "@/lib/format";

/*
  Palette Panganita yang dipakai di halaman ini:
  #0F2D1A  hijau tertua   -> judul, latar hero
  #1B4D2B  hijau hutan    -> teks aksen, ikon
  #3E8E1F  hijau daun     -> aksen sekunder
  #90C226  lime           -> garis hias, sorotan di latar gelap
  #E6B91E  emas           -> ikon penjualan
  #FFD23F  kuning cerah   -> tombol utama di latar gelap
  Warna lembut (sama dengan navbar): latar #F4F7F2 dan #EAF1E8,
  garis tepi #D5E2D2, pemisah #E3EBE1, teks pendukung #53665a.
*/

const EYEBROW =
  "inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1B4D2B] before:h-1 before:w-6 before:rounded-full before:bg-[#90C226] before:content-['']";

const KARTU =
  "rounded-2xl border border-[#D5E2D2] bg-white shadow-[0_5px_25px_rgba(30,77,48,0.07)]";

export default async function Beranda() {
  // ==========================================
  // DATA PROFIL
  // ==========================================

  const profil = await muatProfilSaya();

  if (!profil) redirect("/keluarga");

  // ==========================================
  // DATA RIWAYAT SUPABASE
  // ==========================================

  const supabase = await createClient();

  const { data } = await supabase
    .from("riwayat_keputusan")
    .select("id, nama_bahan, keputusan, pendapatan_rp, dibuat_pada")
    .order("dibuat_pada", { ascending: false })
    .limit(3);

  const { count } = await supabase
    .from("riwayat_keputusan")
    .select("id", { count: "exact", head: true });

  const terakhir = (data ?? []);

  const totalAnggota = jumlahOrangProfil(profil);
  const totalKeputusan = count ?? 0;

  const aktivitasTerakhir = terakhir[0]
    ? tanggal(terakhir[0].dibuat_pada)
    : "Belum ada";

  return (
    <div className="w-full space-y-7 sm:space-y-9">
      {/* ======================================
          KEPALA HALAMAN
      ====================================== */}

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          {/* Avatar Ibu: sentuh untuk membuka profil keluarga */}
          <Link
            href="/keluarga"
            aria-label="Buka profil keluarga"
            className="block shrink-0 rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] focus-visible:ring-offset-2 active:scale-95"
          >
            <AvatarProfil
              bisaUbah={false}
              ukuran="h-16 w-16 sm:h-20 sm:w-20"
            />
          </Link>

          <div className="min-w-0 space-y-1">
            <p className={EYEBROW}>Sahabat gizi dan panen Ibu</p>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F2D1A] sm:text-4xl">
              Beranda
            </h1>

            <p className="text-base text-[#53665a] sm:text-lg">
              Selamat datang kembali, Ibu {profil.nama_ibu}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SecondaryButton href="/riwayat" ikon={History} className="min-h-14">
            Riwayat
          </SecondaryButton>

          <PrimaryButton href="/pindai" ikon={Camera}>
            Pindai Panen
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
          </PrimaryButton>
        </div>
      </header>

      {/* ======================================
          SAMBUTAN UTAMA
      ====================================== */}

      <section className="relative overflow-hidden rounded-[28px] bg-[#0F2D1A] p-6 text-white shadow-[0_12px_35px_rgba(15,45,26,0.22)] sm:p-8 lg:p-10">
        {/* Hiasan: garis gradien tipis di tepi atas dan cahaya hijau lembut */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1B4D2B] via-[#90C226] to-[#E6B91E]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#3E8E1F]/30 blur-3xl"
        />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          {/* ISI KIRI */}
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-[#FFD23F]">
              <Sprout aria-hidden="true" className="h-4 w-4" />
              PANGANITA · PANGAN DAN GIZI KELUARGA
            </div>

            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                Kelola hasil panen.
                <span className="block text-[#90C226]">
                  Prioritaskan gizi keluarga.
                </span>
              </h2>

              <p className="max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                PANGANITA membantu Ibu mengenali hasil panen, mempertimbangkan
                kebutuhan pangan keluarga, dan merencanakan hasil yang dapat
                dijual.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <PrimaryButton
                href="/pindai"
                ikon={ScanLine}
                className="w-full bg-[#FFD23F] font-bold text-[#0F2D1A] hover:bg-[#E6B91E] sm:w-auto"
              >
                Mulai pindai panen
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
              </PrimaryButton>

              <SecondaryButton
                href="/keluarga"
                ikon={Users}
                className="min-h-14 w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Data keluarga
              </SecondaryButton>
            </div>
          </div>

          {/* PANEL ALUR KANAN */}
          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#90C226]">
                  Alur penggunaan
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  Dari panen ke keputusan
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Leaf aria-hidden="true" className="h-6 w-6 text-[#90C226]" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <LangkahAlur
                nomor="01"
                judul="Pindai hasil panen"
                keterangan="Kenali bahan pangan melalui kamera."
                ikon={<Camera aria-hidden="true" className="h-5 w-5" />}
              />

              <LangkahAlur
                nomor="02"
                judul="Hitung pembagian"
                keterangan="Pertimbangkan kebutuhan keluarga."
                ikon={<ClipboardList aria-hidden="true" className="h-5 w-5" />}
              />

              <LangkahAlur
                nomor="03"
                judul="Simpan keputusan"
                keterangan="Catat hasil perencanaan panen."
                ikon={<CheckCircle2 aria-hidden="true" className="h-5 w-5" />}
                terakhir
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          SEKILAS PANDANG
      ====================================== */}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={EYEBROW}>Sekilas pandang</p>

            <h2 className="mt-1 text-xl font-extrabold text-[#0F2D1A] sm:text-2xl">
              Ringkasan aktivitas
            </h2>
          </div>

          <span className="hidden rounded-full border border-[#D5E2D2] bg-white px-3 py-1.5 text-xs font-semibold text-[#53665a] sm:inline-flex">
            Data akun Ibu
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KartuAngka
            judul="Anggota keluarga"
            nilai={String(totalAnggota)}
            satuan="orang"
            keterangan="Data keluarga terdaftar"
            ikon={<Users aria-hidden="true" className="h-5 w-5" />}
            href="/keluarga"
            aksi="Kelola keluarga"
          />

          <KartuAngka
            judul="Keputusan tersimpan"
            nilai={String(totalKeputusan)}
            satuan="keputusan"
            keterangan="Total keputusan yang tercatat"
            ikon={<ClipboardList aria-hidden="true" className="h-5 w-5" />}
            href="/riwayat"
            aksi="Lihat riwayat"
          />

          <KartuAngka
            judul="Terakhir dicatat"
            nilai={aktivitasTerakhir}
            satuan={
              terakhir.length > 0 ? "Keputusan terbaru" : "Belum ada pencatatan"
            }
            keterangan="Waktu pencatatan terakhir"
            ikon={<CalendarDays aria-hidden="true" className="h-5 w-5" />}
            href="/riwayat"
            aksi="Lihat catatan"
            ringkas
          />
        </div>
      </section>

      {/* ======================================
          BAGIAN UTAMA
      ====================================== */}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* CATATAN PANEN */}
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={EYEBROW}>Catatan terbaru</p>

              <h2 className="mt-1 text-xl font-extrabold text-[#0F2D1A] sm:text-2xl">
                Keputusan panen terbaru
              </h2>

              <p className="mt-1 text-sm text-[#53665a] sm:text-base">
                Lihat pilihan terakhir Ibu untuk hasil panen.
              </p>
            </div>

            <SecondaryButton href="/riwayat" ukuran="default">
              Lihat semua
              <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" />
            </SecondaryButton>
          </div>

          {terakhir.length === 0 ? (
            <div className={`${KARTU} overflow-hidden`}>
              <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr]">
                {/* BELUM ADA CATATAN */}
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E8] text-[#1B4D2B]">
                    <ClipboardList aria-hidden="true" className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-[#0F2D1A]">
                      Mulai perjalanan panen Ibu
                    </h3>

                    <p className="max-w-md text-base leading-relaxed text-[#53665a]">
                      Belum ada keputusan yang tersimpan. Mulai dengan memindai
                      hasil panen untuk merencanakan kebutuhan pangan keluarga.
                    </p>
                  </div>

                  <PrimaryButton
                    href="/pindai"
                    ikon={Camera}
                    className="w-full sm:w-auto"
                  >
                    Pindai panen pertama
                    <ArrowRight
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0"
                    />
                  </PrimaryButton>
                </div>

                {/* PENDUKUNG VISUAL */}
                <div className="rounded-2xl bg-[#F4F7F2] p-5 sm:p-6">
                  <p className={EYEBROW}>Perencanaan pangan</p>

                  <h3 className="mt-2 text-lg font-bold text-[#0F2D1A]">
                    Setiap hasil panen punya peran.
                  </h3>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-[#D5E2D2] bg-white p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1E8] text-[#1B4D2B]">
                        <Leaf aria-hidden="true" className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0F2D1A]">
                          Kebutuhan keluarga
                        </p>
                        <p className="text-xs text-[#53665a]">
                          Pertimbangkan pangan yang perlu disisihkan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-[#D5E2D2] bg-white p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF8DB] text-[#8A6D05]">
                        <Wallet aria-hidden="true" className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0F2D1A]">
                          Potensi penjualan
                        </p>
                        <p className="text-xs text-[#53665a]">
                          Rencanakan hasil yang dapat dijual.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${KARTU} overflow-hidden`}>
              {/* TABEL (LAYAR LEBAR) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[620px] text-left">
                  <thead>
                    <tr className="border-b border-[#E3EBE1] bg-[#F4F7F2]">
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#53665a]">
                        Bahan pangan
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#53665a]">
                        Keputusan
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#53665a]">
                        Tanggal
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#53665a]">
                        Pendapatan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {terakhir.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-[#E3EBE1] last:border-0 hover:bg-[#F4F7F2]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1E8] text-[#1B4D2B]">
                              <Leaf aria-hidden="true" className="h-5 w-5" />
                            </div>

                            <span className="font-bold text-[#0F2D1A]">
                              {r.nama_bahan}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-lg bg-[#EAF1E8] px-3 py-1.5 text-xs font-bold text-[#1B4D2B]">
                            {LABEL_KEPUTUSAN[r.keputusan].judul}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-[#53665a]">
                          {tanggal(r.dibuat_pada)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-right font-bold text-[#0F2D1A]">
                          {rupiah(r.pendapatan_rp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DAFTAR (HP) */}
              <div className="divide-y divide-[#E3EBE1] md:hidden">
                {terakhir.map((r) => (
                  <div key={r.id} className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1E8] text-[#1B4D2B]">
                          <Leaf aria-hidden="true" className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#0F2D1A]">
                            {r.nama_bahan}
                          </p>

                          <p className="mt-1 text-xs text-[#53665a]">
                            {tanggal(r.dibuat_pada)}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-[#1B4D2B]">
                        {rupiah(r.pendapatan_rp)}
                      </p>
                    </div>

                    <span className="inline-flex rounded-lg bg-[#EAF1E8] px-3 py-1.5 text-xs font-bold text-[#1B4D2B]">
                      {LABEL_KEPUTUSAN[r.keputusan].judul}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* KOLOM KANAN */}
        <aside className="space-y-5">
          {/* JALAN PINTAS */}
          <section className={`${KARTU} p-5 sm:p-6`}>
            <div>
              <p className={EYEBROW}>Jalan pintas</p>

              <h2 className="mt-1 text-lg font-extrabold text-[#0F2D1A]">
                Pilihan untuk Ibu
              </h2>

              <p className="mt-1 text-sm text-[#53665a]">
                Ketuk salah satu untuk langsung membuka.
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <TautanMenu
                href="/keluarga"
                ikon={<Users aria-hidden="true" className="h-5 w-5" />}
                judul="Profil keluarga"
                keterangan="Kelola data anggota"
              />

              <TautanMenu
                href="/riwayat"
                ikon={<History aria-hidden="true" className="h-5 w-5" />}
                judul="Riwayat panen"
                keterangan="Lihat keputusan tersimpan"
              />

              <TautanMenu
                href="/bu-nita"
                ikon={<MessageCircle aria-hidden="true" className="h-5 w-5" />}
                judul="Tanya Bu Nita"
                keterangan="Konsultasi informasi pangan"
              />
            </div>
          </section>

          {/* MISI PANGANITA */}
          <section className="relative overflow-hidden rounded-2xl border border-[#D5E2D2] bg-[#F4F7F2] p-5 sm:p-6">
            <div className="relative z-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B4D2B] text-[#FFD23F]">
                <Sprout aria-hidden="true" className="h-6 w-6" />
              </div>

              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-[#1B4D2B]">
                MISI PANGANITA
              </p>

              <h2 className="mt-2 text-xl font-extrabold leading-snug text-[#0F2D1A]">
                Panen yang dikelola dengan bijak, keluarga yang lebih terjaga.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#53665a]">
                Pertimbangkan kebutuhan pangan keluarga sebelum menentukan hasil
                panen yang akan dijual.
              </p>

              <SecondaryButton
                href="/pindai"
                ikon={ScanLine}
                lebarPenuh
                className="mt-5"
              >
                Pindai hasil panen
              </SecondaryButton>
            </div>

            <div
              aria-hidden="true"
              className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full border-[24px] border-[#90C226]/25"
            />
          </section>
        </aside>
      </div>

      {/* ======================================
          PENGINGAT DI BAWAH
      ====================================== */}

      <section
        className={`${KARTU} flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF1E8] text-[#1B4D2B]">
            <Users aria-hidden="true" className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-bold text-[#0F2D1A]">
              Pastikan informasi keluarga selalu diperbarui
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#53665a]">
              Perubahan jumlah anggota, kondisi kehamilan, dan menyusui dapat
              memengaruhi perhitungan kebutuhan gizi keluarga.
            </p>
          </div>
        </div>

        <SecondaryButton
          href="/keluarga"
          className="w-full shrink-0 sm:w-auto"
        >
          Perbarui profil
          <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
        </SecondaryButton>
      </section>
    </div>
  );
}

/* ==========================================
   KOMPONEN KECIL
========================================== */

function KartuAngka({
  judul,
  nilai,
  satuan,
  keterangan,
  ikon,
  href,
  aksi,
  ringkas = false,
}) {
  return (
    <div className={`${KARTU} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#53665a]">{judul}</p>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF1E8] text-[#1B4D2B]">
          {ikon}
        </div>
      </div>

      <div className="mt-4">
        <p
          className={`font-extrabold tracking-tight text-[#0F2D1A] ${
            ringkas ? "text-xl sm:text-2xl" : "text-4xl"
          }`}
        >
          {nilai}
        </p>

        <p className="mt-1 text-sm text-[#53665a]">{satuan}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#E3EBE1] pt-4">
        <span className="text-xs text-[#53665a]">{keterangan}</span>

        <Link
          href={href}
          className="inline-flex min-h-12 shrink-0 items-center gap-1 rounded-xl px-2 text-sm font-bold text-[#1B4D2B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F]"
        >
          {aksi}
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function LangkahAlur({
  nomor,
  judul,
  keterangan,
  ikon,
  terakhir = false,
}) {
  return (
    <div className="relative flex gap-3">
      {!terakhir && (
        <div
          aria-hidden="true"
          className="absolute left-[19px] top-11 h-8 w-px bg-white/25"
        />
      )}

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#90C226]">
        {ikon}
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wider text-[#FFD23F]">
            {nomor}
          </span>

          <p className="text-sm font-bold text-white">{judul}</p>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-white/80">
          {keterangan}
        </p>
      </div>
    </div>
  );
}

function TautanMenu({
  href,
  ikon,
  judul,
  keterangan,
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-14 items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F4F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1E8] text-[#1B4D2B]">
        {ikon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#0F2D1A]">{judul}</p>

        <p className="mt-0.5 text-xs text-[#53665a]">{keterangan}</p>
      </div>

      <ChevronRight
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-[#53665a] transition-transform group-hover:translate-x-1 group-hover:text-[#1B4D2B]"
      />
    </Link>
  );
}
