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

import { createClient } from "@/lib/supabase/server";
import { muatProfilSaya } from "@/lib/data/referensi";
import { jumlahOrangProfil } from "@/lib/panganita/profil";
import { LABEL_KEPUTUSAN } from "@/lib/panganita/label";
import { rupiah, tanggal } from "@/lib/format";
import type { Keputusan } from "@/lib/panganita/types";

type RiwayatSingkat = {
  id: number;
  nama_bahan: string;
  keputusan: Keputusan;
  pendapatan_rp: number;
  dibuat_pada: string;
};

export default async function Dashboard() {
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

  const terakhir = (data ?? []) as RiwayatSingkat[];

  const totalAnggota = jumlahOrangProfil(profil);
  const totalKeputusan = count ?? 0;

  const aktivitasTerakhir = terakhir[0]
    ? tanggal(terakhir[0].dibuat_pada)
    : "Belum ada";

  return (
    <div className="w-full space-y-7 sm:space-y-9">
      {/* ======================================
          HEADER
      ====================================== */}

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <p className="panganita-eyebrow">PANGANITA / WORKSPACE</p>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#203D32] sm:text-4xl">
            Dashboard
          </h1>

          <p className="text-base text-[#718075] sm:text-lg">
            Selamat datang kembali, {profil.nama_ibu}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/riwayat"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DCEAE0] bg-white px-4 text-sm font-semibold text-[#365849] transition-colors hover:bg-[#F8FBF8]"
          >
            <History className="h-4 w-4" />
            Riwayat
          </Link>

          <Link
            href="/pindai"
            className="panganita-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#075B45] px-5 text-sm font-bold text-white shadow-[0_5px_15px_rgba(7,91,69,0.18)] hover:bg-[#064735]"
          >
            <Camera className="h-5 w-5" />
            Pindai Panen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* ======================================
          HERO / PRODUCT INTRODUCTION
      ====================================== */}

      <section className="panganita-hero rounded-[26px] p-6 text-white shadow-[0_12px_35px_rgba(7,91,69,0.12)] sm:p-8 lg:p-10">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          {/* LEFT CONTENT */}
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-[#D5EBDD]">
              <Sprout className="h-4 w-4" />
              PANGANITA · PANGAN DAN GIZI KELUARGA
            </div>

            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                Kelola hasil panen.
                <span className="block text-[#C6E8D1]">
                  Prioritaskan gizi keluarga.
                </span>
              </h2>

              <p className="max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                PANGANITA membantu Mama mengenali hasil panen, mempertimbangkan
                kebutuhan pangan keluarga, dan merencanakan hasil yang dapat
                dijual.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/pindai"
                className="panganita-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#075B45] shadow-sm hover:bg-[#EAF5EE]"
              >
                <ScanLine className="h-5 w-5" />
                Mulai pindai panen
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/keluarga"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Users className="h-4 w-4" />
                Data keluarga
              </Link>
            </div>
          </div>

          {/* RIGHT WORKFLOW PANEL */}
          <div className="relative rounded-2xl border border-white/15 bg-white/[0.09] p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C6E8D1]">
                  Alur penggunaan
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  Dari panen ke keputusan
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Leaf className="h-6 w-6 text-[#D5EBDD]" />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <WorkflowStep
                number="01"
                title="Pindai hasil panen"
                description="Kenali bahan pangan melalui kamera."
                icon={<Camera className="h-5 w-5" />}
              />

              <WorkflowStep
                number="02"
                title="Simulasikan pembagian"
                description="Pertimbangkan kebutuhan keluarga."
                icon={<ClipboardList className="h-5 w-5" />}
              />

              <WorkflowStep
                number="03"
                title="Simpan keputusan"
                description="Catat hasil perencanaan panen."
                icon={<CheckCircle2 className="h-5 w-5" />}
                last
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          OVERVIEW / METRICS
      ====================================== */}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="panganita-eyebrow">OVERVIEW</p>

            <h2 className="mt-1 text-xl font-extrabold text-[#203D32] sm:text-2xl">
              Ringkasan aktivitas
            </h2>
          </div>

          <span className="hidden rounded-full border border-[#DCEAE0] bg-white px-3 py-1.5 text-xs font-semibold text-[#718075] sm:inline-flex">
            Data akun Mama
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Anggota keluarga"
            value={String(totalAnggota)}
            suffix="orang"
            description="Data keluarga terdaftar"
            icon={<Users className="h-5 w-5" />}
            href="/keluarga"
            action="Kelola keluarga"
          />

          <MetricCard
            title="Keputusan tersimpan"
            value={String(totalKeputusan)}
            suffix="keputusan"
            description="Total keputusan yang tercatat"
            icon={<ClipboardList className="h-5 w-5" />}
            href="/riwayat"
            action="Lihat riwayat"
          />

          <MetricCard
            title="Aktivitas terakhir"
            value={aktivitasTerakhir}
            suffix={
              terakhir.length > 0 ? "Keputusan terbaru" : "Belum ada pencatatan"
            }
            description="Waktu pencatatan terakhir"
            icon={<CalendarDays className="h-5 w-5" />}
            href="/riwayat"
            action="Periksa aktivitas"
            compact
          />
        </div>
      </section>

      {/* ======================================
          MAIN WORKSPACE
      ====================================== */}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* PANEN ACTIVITY */}
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="panganita-eyebrow">RECENT ACTIVITIES</p>

              <h2 className="mt-1 text-xl font-extrabold text-[#203D32] sm:text-2xl">
                Aktivitas panen
              </h2>

              <p className="mt-1 text-sm text-[#718075] sm:text-base">
                Pantau keputusan pengelolaan hasil panen Mama.
              </p>
            </div>

            <Link
              href="/riwayat"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#075B45] hover:underline"
            >
              Lihat semua
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {terakhir.length === 0 ? (
            <div className="panganita-surface overflow-hidden">
              <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr]">
                {/* EMPTY STATE */}
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F3EA] text-[#075B45]">
                    <ClipboardList className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-[#203D32]">
                      Mulai perjalanan panen Mama
                    </h3>

                    <p className="max-w-md text-base leading-relaxed text-[#718075]">
                      Belum ada keputusan yang tersimpan. Mulai dengan memindai
                      hasil panen untuk merencanakan kebutuhan pangan keluarga.
                    </p>
                  </div>

                  <Link
                    href="/pindai"
                    className="panganita-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#075B45] px-5 py-3 text-sm font-bold text-white hover:bg-[#064735]"
                  >
                    <Camera className="h-5 w-5" />
                    Pindai panen pertama
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* VISUAL SUPPORT */}
                <div className="rounded-2xl bg-[#F1F9F4] p-5 sm:p-6">
                  <p className="panganita-eyebrow">PERENCANAAN PANGAN</p>

                  <h3 className="mt-2 text-lg font-bold text-[#203D32]">
                    Setiap hasil panen punya peran.
                  </h3>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-[#DCEAE0] bg-white p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E5F3EA] text-[#075B45]">
                        <Leaf className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#203D32]">
                          Kebutuhan keluarga
                        </p>
                        <p className="text-xs text-[#718075]">
                          Pertimbangkan pangan yang perlu disisihkan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-[#DCEAE0] bg-white p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F9F1DD] text-[#98732B]">
                        <Wallet className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#203D32]">
                          Potensi penjualan
                        </p>
                        <p className="text-xs text-[#718075]">
                          Rencanakan hasil yang dapat dijual.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="panganita-surface overflow-hidden">
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[620px] text-left">
                  <thead>
                    <tr className="border-b border-[#EAF1EB] bg-[#F8FBF8]">
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#718075]">
                        Bahan pangan
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#718075]">
                        Keputusan
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#718075]">
                        Tanggal
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#718075]">
                        Pendapatan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {terakhir.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-[#EDF2EE] last:border-0 hover:bg-[#FAFCFA]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5F3EA] text-[#075B45]">
                              <Leaf className="h-5 w-5" />
                            </div>

                            <span className="font-bold text-[#203D32]">
                              {r.nama_bahan}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-lg bg-[#E5F3EA] px-3 py-1.5 text-xs font-bold text-[#075B45]">
                            {LABEL_KEPUTUSAN[r.keputusan].judul}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-[#718075]">
                          {tanggal(r.dibuat_pada)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-right font-bold text-[#203D32]">
                          {rupiah(r.pendapatan_rp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE LIST */}
              <div className="divide-y divide-[#EDF2EE] md:hidden">
                {terakhir.map((r) => (
                  <div key={r.id} className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5F3EA] text-[#075B45]">
                          <Leaf className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#203D32]">
                            {r.nama_bahan}
                          </p>

                          <p className="mt-1 text-xs text-[#718075]">
                            {tanggal(r.dibuat_pada)}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-[#075B45]">
                        {rupiah(r.pendapatan_rp)}
                      </p>
                    </div>

                    <span className="inline-flex rounded-lg bg-[#E5F3EA] px-3 py-1.5 text-xs font-bold text-[#075B45]">
                      {LABEL_KEPUTUSAN[r.keputusan].judul}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-5">
          {/* QUICK ACTIONS */}
          <section className="panganita-surface p-5 sm:p-6">
            <div>
              <p className="panganita-eyebrow">SHORTCUTS</p>

              <h2 className="mt-1 text-lg font-extrabold text-[#203D32]">
                Akses cepat
              </h2>

              <p className="mt-1 text-sm text-[#718075]">
                Menu penting untuk pengelolaan keluarga.
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <QuickAction
                href="/keluarga"
                icon={<Users className="h-5 w-5" />}
                title="Profil keluarga"
                description="Kelola data anggota"
              />

              <QuickAction
                href="/riwayat"
                icon={<History className="h-5 w-5" />}
                title="Riwayat panen"
                description="Lihat keputusan tersimpan"
              />

              <QuickAction
                href="/bu-nita"
                icon={<MessageCircle className="h-5 w-5" />}
                title="Tanya Bu Nita"
                description="Konsultasi informasi pangan"
              />
            </div>
          </section>

          {/* BRAND INSIGHT */}
          <section className="relative overflow-hidden rounded-2xl border border-[#CFE4D4] bg-[#E5F3EA] p-5 sm:p-6">
            <div className="relative z-10">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#075B45]">
                <Sprout className="h-6 w-6" />
              </div>

              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-[#075B45]">
                MISI PANGANITA
              </p>

              <h2 className="mt-2 text-xl font-extrabold leading-snug text-[#203D32]">
                Panen yang dikelola dengan bijak, keluarga yang lebih terjaga.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#587263]">
                Pertimbangkan kebutuhan pangan keluarga sebelum menentukan hasil
                panen yang akan dijual.
              </p>

              <Link
                href="/pindai"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#075B45] hover:underline"
              >
                Kelola hasil panen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              aria-hidden="true"
              className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full border-[24px] border-white/35"
            />
          </section>
        </aside>
      </div>

      {/* ======================================
          BOTTOM INFORMATION
      ====================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DCEAE0] bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5F3EA] text-[#075B45]">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-bold text-[#203D32]">
              Pastikan informasi keluarga selalu diperbarui
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#718075]">
              Perubahan jumlah anggota, kondisi kehamilan, dan menyusui dapat
              memengaruhi perhitungan kebutuhan gizi keluarga.
            </p>
          </div>
        </div>

        <Link
          href="/keluarga"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DCEAE0] px-4 text-sm font-bold text-[#075B45] transition-colors hover:bg-[#F1F9F4]"
        >
          Perbarui profil
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

/* ==========================================
   REUSABLE COMPONENTS
========================================== */

function MetricCard({
  title,
  value,
  suffix,
  description,
  icon,
  href,
  action,
  compact = false,
}: {
  title: string;
  value: string;
  suffix: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  action: string;
  compact?: boolean;
}) {
  return (
    <div className="panganita-kpi rounded-2xl border border-[#DCEAE0] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#718075]">{title}</p>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5F3EA] text-[#075B45]">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <p
          className={`font-extrabold tracking-tight text-[#203D32] ${
            compact ? "text-xl sm:text-2xl" : "text-4xl"
          }`}
        >
          {value}
        </p>

        <p className="mt-1 text-sm text-[#718075]">{suffix}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#EDF2EE] pt-4">
        <span className="text-xs text-[#718075]">{description}</span>

        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#075B45] hover:underline"
        >
          {action}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  icon,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {!last && (
        <div className="absolute left-[19px] top-11 h-8 w-px bg-white/20" />
      )}

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#D5EBDD]">
        {icon}
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider text-[#A8D6B7]">
            {number}
          </span>

          <p className="text-sm font-bold text-white">{title}</p>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-white/65">
          {description}
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F1F9F4]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5F3EA] text-[#075B45]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#203D32]">{title}</p>

        <p className="mt-0.5 text-xs text-[#718075]">{description}</p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-[#9AAA9F] transition-transform group-hover:translate-x-1 group-hover:text-[#075B45]" />
    </Link>
  );
}
