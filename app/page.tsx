import Image from "next/image";
import { Camera, History, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { MulaiButton } from "@/components/MulaiButton";

const FITUR = [
  {
    icon: Users,
    judul: "Profil keluarga",
    isi: "Catat jumlah anggota keluarga. Nama anak tidak perlu diisi.",
  },
  {
    icon: Camera,
    judul: "Pindai panen",
    isi: "Pilih hasil panen, isi beratnya, lalu lihat tiga pembagiannya.",
  },
  {
    icon: History,
    judul: "Riwayat keputusan",
    isi: "Semua pilihan tersimpan, sehingga mudah diingat kembali.",
  },
];

export default function Beranda() {
  return (
    <div className="min-h-dvh">
      <PublicNav />

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 md:pt-14">
        <section className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              Pangan dan gizi untuk keluarga
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Rencanakan hasil panen untuk makan keluarga, Ibu.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Ketahui berapa yang perlu disimpan untuk gizi keluarga dan berapa yang bisa dijual, lalu pilih yang paling sesuai.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <MulaiButton />
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <a href="#fitur">Lihat fitur</a>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm md:max-w-none">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary-soft/70 blur-2xl" aria-hidden="true" />
            <div className="flex justify-center">
              <Image
                src="/images/maskot-bu-nita.png"
                alt="Bu Nita, asisten gizi PANGANITA"
                width={420}
                height={420}
                priority
                className="h-72 w-72 object-contain drop-shadow-xl sm:h-80 sm:w-80"
              />
            </div>
            <div className="mt-2 rounded-3xl border border-border/70 bg-card p-6 shadow-lift sm:p-7">
              <p className="text-sm font-semibold text-muted-foreground">Contoh hasil pembagian</p>
              <p className="mt-1 text-lg font-bold text-foreground">Ikan lele 2 kg</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-primary-soft p-4">
                  <span className="text-sm font-semibold text-accent-foreground">Disimpan untuk keluarga</span>
                  <span className="text-lg font-extrabold text-primary">1,4 kg</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
                  <span className="text-sm font-semibold text-foreground">Dijual</span>
                  <span className="text-lg font-extrabold text-foreground">0,6 kg</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="mt-20 grid gap-5 md:grid-cols-3">
          {FITUR.map((f) => {
            const Ikon = f.icon;
            return (
              <div key={f.judul} className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Ikon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-lg font-bold text-foreground">{f.judul}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.isi}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}