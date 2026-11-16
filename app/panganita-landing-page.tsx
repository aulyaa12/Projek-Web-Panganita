import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Heart,
  Leaf,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const LANGKAH = [
  {
    nomor: "01",
    ikon: Camera,
    judul: "Pilih hasil panen",
    isi: "Masukkan jenis pangan dan berat panen yang Ibu miliki.",
  },
  {
    nomor: "02",
    ikon: Heart,
    judul: "Lihat kebutuhan keluarga",
    isi: "Panganita membantu memperkirakan bagian yang dapat disimpan untuk lauk keluarga.",
  },
  {
    nomor: "03",
    ikon: Wallet,
    judul: "Pertimbangkan pilihan",
    isi: "Lihat gambaran hasil yang bisa dijual dan sesuaikan dengan kebutuhan rumah.",
  },
];

const FITUR = [
  {
    ikon: Leaf,
    judul: "Pangan yang dekat dengan Ibu",
    isi: "Kenali pilihan pangan lokal seperti ikan, sayur pekarangan, dan bahan yang tersedia di sekitar.",
  },
  {
    ikon: BookOpen,
    judul: "Panduan sederhana",
    isi: "Informasi disajikan dengan bahasa yang mudah diikuti, selangkah demi selangkah.",
  },
  {
    ikon: MessageCircle,
    judul: "Teman bertanya",
    isi: "Dapatkan dukungan informasi seputar panen dan gizi keluarga melalui fitur yang tersedia.",
  },
];

export default function Beranda() {
  return (
    <div className="min-h-dvh overflow-hidden">
      <header className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Beranda PANGANITA">
          <Logo priority />
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
          <a className="transition hover:text-primary" href="#tentang">Tentang</a>
          <a className="transition hover:text-primary" href="#cara-kerja">Cara kerja</a>
          <a className="transition hover:text-primary" href="#fitur">Fitur</a>
        </nav>
        <Button asChild variant="outline" size="sm" className="rounded-full px-5">
          <Link href="/masuk">Masuk</Link>
        </Button>
      </header>

      <main>
        <section id="tentang" className="relative isolate">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(ellipse_at_76%_35%,rgba(163,210,165,0.24),transparent_42%),linear-gradient(180deg,#f1f9f4_0%,#f7faf6_78%,transparent_100%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 sm:pb-20 md:min-h-[550px] md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:pt-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3.5 py-2 text-xs font-bold text-primary shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Sahabat panen dan gizi keluarga
              </span>
              <h1 className="mt-6 text-[2.65rem] font-extrabold leading-[1.08] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[4.15rem]">
                Panen terbagi,<br />
                <span className="text-primary">keluarga lebih terjaga.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                PANGANITA mendampingi Ibu melihat pilihan pembagian hasil panen: disimpan untuk lauk keluarga atau dijual untuk membantu kebutuhan rumah.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full px-6 shadow-lg shadow-primary/15">
                  <Link href="/masuk">Mulai sekarang <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-primary/15 bg-white/70 px-6">
                  <a href="#cara-kerja">Lihat cara kerja <ArrowDown className="ml-2 h-4 w-4" /></a>
                </Button>
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Check className="h-4 w-4 text-primary" /> Langkah sederhana · Berangkat dari pangan lokal
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[470px] pb-5 pt-4 md:pb-0">
              <div className="absolute inset-x-8 top-8 -z-10 aspect-square rounded-full bg-primary-soft/80 blur-2xl" aria-hidden="true" />
              <div className="relative mx-auto flex h-[300px] items-center justify-center sm:h-[360px]">
                <div className="absolute inset-x-7 bottom-4 top-7 rounded-[48%_48%_38%_38%] bg-gradient-to-br from-[#e5f1dd] via-[#eff2d9] to-[#d8e9d8]" aria-hidden="true" />
                <span className="absolute left-10 top-14 text-4xl" aria-hidden="true">🌿</span>
                <span className="absolute right-12 top-9 text-4xl" aria-hidden="true">🌱</span>
                <Image
                  src="/images/maskot-bu-nita.png"
                  alt="Bu Nita, sahabat PANGANITA"
                  width={420}
                  height={420}
                  priority
                  className="relative z-10 h-[260px] w-[260px] object-contain drop-shadow-xl sm:h-[320px] sm:w-[320px]"
                />
                <div className="absolute left-0 top-6 rounded-2xl border border-border/60 bg-white/95 p-3.5 shadow-lift sm:left-1 sm:top-10 sm:p-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">Pilihan pangan</p>
                  <p className="mt-1 text-sm font-extrabold text-foreground">🐟 Hasil panen Ibu</p>
                </div>
                <div className="absolute bottom-0 right-0 rounded-2xl border border-border/60 bg-white/95 p-3.5 shadow-lift sm:bottom-5 sm:right-0 sm:p-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">Pertimbangkan bersama</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-extrabold text-primary"><Heart className="h-4 w-4" /> Gizi & kebutuhan rumah</p>
                </div>
              </div>
              <div className="mx-auto mt-2 flex max-w-sm items-center justify-center gap-2 text-center text-xs font-semibold text-muted-foreground">
                <span aria-hidden="true">🌾</span> Setiap keluarga punya kebutuhan yang berbeda
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-white/65">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-5 text-xs font-semibold text-muted-foreground sm:px-8 sm:py-6 sm:text-sm">
            <span className="text-foreground">Dibuat untuk membantu Ibu:</span>
            <span className="flex items-center gap-2"><span className="text-lg">🧺</span> Mengelola hasil panen</span>
            <span className="flex items-center gap-2"><span className="text-lg">🥗</span> Memikirkan lauk keluarga</span>
            <span className="flex items-center gap-2"><span className="text-lg">🏡</span> Mempertimbangkan kebutuhan rumah</span>
          </div>
        </section>

        <section id="cara-kerja" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="panganita-eyebrow">Cara kerja</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Tiga langkah yang mudah diikuti</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">Mulai dari hasil panen yang Ibu miliki. PANGANITA membantu menyusun informasi supaya pilihan terasa lebih jelas.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
            {LANGKAH.map((langkah) => {
              const Ikon = langkah.ikon;
              return (
                <article key={langkah.nomor} className="panganita-surface panganita-surface-hover relative p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Ikon className="h-5 w-5" /></span>
                    <span className="text-sm font-extrabold tracking-widest text-primary/35">{langkah.nomor}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-foreground">{langkah.judul}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{langkah.isi}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl border border-[#e5e9d2] bg-[#fbf9ee] p-5 sm:flex sm:items-start sm:gap-4 sm:p-6">
            <span className="text-2xl" aria-hidden="true">💡</span>
            <div>
              <h3 className="font-bold text-foreground">Mengapa hasil panen perlu dibagi?</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Sebagian hasil panen bisa dipertimbangkan untuk lauk keluarga, sementara sebagian lain dapat dijual untuk membantu kebutuhan rumah. Saran PANGANITA menjadi bahan pertimbangan, bukan aturan yang harus diikuti.</p>
            </div>
          </div>
        </section>

        <section id="fitur" className="bg-white/60">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div>
                <p className="panganita-eyebrow">Teman sehari-hari</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Pangan lokal, informasi yang dekat.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:justify-self-end sm:text-base">Kenali berbagai cara PANGANITA mendukung keputusan keluarga—dengan tetap menyesuaikan pilihan pada kondisi dan ketersediaan pangan setempat.</p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {FITUR.map((fitur) => {
                const Ikon = fitur.ikon;
                return (
                  <article key={fitur.judul} className="rounded-2xl border border-border/70 bg-white p-6 shadow-soft">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Ikon className="h-5 w-5" /></span>
                    <h3 className="mt-4 font-bold text-foreground">{fitur.judul}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{fitur.isi}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="relative overflow-hidden rounded-[28px] bg-primary px-6 py-9 text-primary-foreground shadow-lift sm:px-10 sm:py-11 md:flex md:items-center md:justify-between md:gap-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border border-white/10" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">PANGANITA</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Mari mulai dari panen yang Ibu punya.</h2>
              <p className="mt-2 text-sm leading-6 text-white/75">Masuk untuk melihat fitur dan panduan yang tersedia.</p>
            </div>
            <Button asChild size="lg" className="relative mt-6 h-12 rounded-full bg-white px-6 font-bold text-primary hover:bg-white/90 md:mt-0">
              <Link href="/masuk">Masuk ke PANGANITA <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-white/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-xs text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" aria-label="PANGANITA, kembali ke beranda"><Logo /></Link>
          <p>PANGANITA · Pendamping informasi panen dan gizi keluarga</p>
          <Link className="font-semibold text-primary hover:underline" href="/masuk">Masuk / Daftar <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
      </footer>
    </div>
  );
}
