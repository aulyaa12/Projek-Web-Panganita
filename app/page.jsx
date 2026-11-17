"use client";

import Image from "next/image";
import {
  Camera,
  History,
  Users,
  ArrowRight,
  ArrowUpRight,
  Sprout,
  CheckCircle2,
} from "lucide-react";

import { MulaiButton } from "@/components/MulaiButton";

const FITUR = [
  {
    nomor: "01",
    icon: Users,
    judul: "Profil Keluarga",
    deskripsi:
      "Informasi anggota keluarga menjadi dasar untuk mempertimbangkan kebutuhan pangan dan gizi keluarga.",
    label: "Kebutuhan keluarga",
  },
  {
    nomor: "02",
    icon: Camera,
    judul: "Pindai Panen",
    deskripsi:
      "Kenali hasil panen melalui foto, masukkan beratnya, dan lihat tiga alternatif pembagian.",
    label: "Identifikasi pangan",
  },
  {
    nomor: "03",
    icon: History,
    judul: "Riwayat Keputusan",
    deskripsi:
      "Dokumentasikan keputusan pembagian hasil panen agar mudah ditinjau kembali.",
    label: "Dokumentasi panen",
  },
];

const LANGKAH = [
  {
    nomor: "01",
    judul: "Kenali kebutuhan keluarga",
    deskripsi:
      "Lengkapi profil keluarga sebagai dasar pertimbangan kebutuhan pangan.",
  },
  {
    nomor: "02",
    judul: "Identifikasi hasil panen",
    deskripsi:
      "Ambil foto atau unggah pangan untuk dikenali sistem. Pemilihan manual juga tersedia.",
  },
  {
    nomor: "03",
    judul: "Tentukan pembagian",
    deskripsi:
      "Bandingkan tiga alternatif pembagian dan pilih sesuai kondisi keluarga.",
  },
];

export default function Beranda() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#F8F8F3] text-[#0F2D1A]">
      {/* =====================================================
          HERO — PREMIUM EDITORIAL
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 sm:px-8 lg:px-16 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          {/* LEFT: EDITORIAL COPY */}

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <span className="h-[2px] w-9 bg-[#3E8E1F]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#3E8E1F]">
                Pangan dan Gizi Keluarga
              </span>
            </div>

            <h1 className="max-w-[760px] text-[clamp(3.1rem,6.5vw,6.1rem)] font-extrabold leading-[0.99] tracking-[-0.065em] text-[#0F2D1A]">
              Hasil panen
              <br />
              untuk masa depan
              <br />
              <span className="font-serif font-medium italic tracking-[-0.045em] text-[#3E8E1F]">
                keluarga.
              </span>
            </h1>

            <p className="mt-8 max-w-[490px] text-base font-medium leading-[1.9] text-[#435247] sm:text-lg">
              PANGANITA membantu perempuan produsen pangan mengenali hasil
              panen, mempertimbangkan kebutuhan gizi keluarga, dan menentukan
              pembagian hasil panen secara lebih bijak.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MulaiButton />

              <a
                href="#fitur"
                className="group inline-flex min-h-12 items-center justify-center gap-2 px-4 text-sm font-bold text-[#1B4D2B] transition-colors hover:text-[#3E8E1F]"
              >
                Kenali PANGANITA
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#DCE5D9] pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#3E8E1F]" />
                <span className="text-xs font-semibold text-[#34463A]">
                  Berorientasi keluarga
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#3E8E1F]" />
                <span className="text-xs font-semibold text-[#34463A]">
                  Rekomendasi pembagian panen
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: VISUAL PRODUCT COMPOSITION */}

          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#DCE6D9] bg-[#EAF1E5]">
              {/* Decorative background */}

              <div className="absolute -right-20 -top-16 h-80 w-80 rounded-full border border-[#90C226]/30" />

              <div className="absolute -right-10 -top-6 h-60 w-60 rounded-full border border-[#90C226]/30" />

              <div className="absolute bottom-0 left-0 h-64 w-full bg-gradient-to-t from-[#DCE9D5] to-transparent" />

              {/* Image label */}

              <div className="absolute left-7 top-7 z-20">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1B4D2B]">
                  Asisten Digital PANGANITA
                </span>
              </div>

              {/* Original avatar */}

              <div className="relative z-10 flex min-h-[480px] items-start justify-center px-4 pb-44 pt-14 sm:min-h-[540px]">
                <Image
                  src="/images/maskot-bu-nita.png"
                  alt="Bu Nita, asisten gizi PANGANITA"
                  width={440}
                  height={440}
                  priority
                  sizes="(max-width: 768px) 80vw, 440px"
                  className="h-[340px] w-[340px] object-contain drop-shadow-xl sm:h-[410px] sm:w-[410px]"
                />
              </div>

              {/* Floating harvest information */}

              <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_15px_45px_-20px_rgba(15,45,26,0.25)] backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#3E8E1F]">
                      Contoh simulasi pembagian
                    </p>

                    <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#0F2D1A]">
                      Ikan lele
                      <span className="ml-2 text-sm font-semibold text-[#435247]">
                        2 kg
                      </span>
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4DF] text-[#1B4D2B]">
                    <Sprout size={21} />
                  </div>
                </div>

                <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-[#E7ECE5]">
                  <div className="w-[70%] bg-[#3E8E1F]" />
                  <div className="w-[30%] bg-[#90C226]" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="border-l-[3px] border-[#3E8E1F] pl-3">
                    <p className="text-xs font-semibold text-[#435247]">
                      Disimpan untuk keluarga
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F2D1A]">
                      1,4 kg
                    </p>
                  </div>

                  <div className="border-l-[3px] border-[#90C226] pl-3">
                    <p className="text-xs font-semibold text-[#435247]">
                      Dijual
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F2D1A]">
                      0,6 kg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT FEATURES — EDITORIAL LIST
      ===================================================== */}

      <section
        id="fitur"
        className="scroll-mt-10 border-y border-[#E3E8DF] bg-white"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            {/* Section introduction */}

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#3E8E1F]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3E8E1F]">
                  01 — Fitur Utama
                </span>
              </div>

              <h2 className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-[-0.05em] text-[#0F2D1A] sm:text-5xl">
                Satu alur.
                <br />
                Tiga kebutuhan
                <br />
                <span className="font-serif font-medium italic text-[#3E8E1F]">
                  penting.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-base font-medium leading-8 text-[#435247]">
                Setiap fitur dirancang untuk saling mendukung, mulai dari
                memahami kebutuhan keluarga hingga menentukan pembagian hasil
                panen.
              </p>
            </div>

            {/* Feature rows */}

            <div className="border-t border-[#DCE5D9]">
              {FITUR.map((fitur) => {
                const Icon = fitur.icon;

                return (
                  <article
                    key={fitur.nomor}
                    className="group border-b border-[#DCE5D9] py-8 transition-colors duration-200 hover:bg-[#FAFCF8] sm:py-10"
                  >
                    <div className="grid gap-5 sm:grid-cols-[65px_1fr_auto] sm:items-start">
                      <span className="text-sm font-extrabold tracking-widest text-[#3E8E1F]">
                        {fitur.nomor}
                      </span>

                      <div>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#69816C]">
                          {fitur.label}
                        </p>

                        <h3 className="text-2xl font-extrabold tracking-tight text-[#0F2D1A] sm:text-3xl">
                          {fitur.judul}
                        </h3>

                        <p className="mt-3 max-w-lg text-base font-medium leading-7 text-[#435247]">
                          {fitur.deskripsi}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#DCE5D9] text-[#1B4D2B] transition-all group-hover:border-[#90C226] group-hover:bg-[#EAF4DF]">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS — DARK EDITORIAL
      ===================================================== */}

      <section
        id="cara-kerja"
        className="relative overflow-hidden bg-[#0F2D1A]"
      >
        <div className="absolute -right-32 -top-40 h-[450px] w-[450px] rounded-full border border-white/[0.06]" />

        <div className="absolute -right-20 -top-28 h-[320px] w-[320px] rounded-full border border-white/[0.06]" />

        <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#90C226]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#90C226]">
                02 — Cara Kerja
              </span>
            </div>

            <h2 className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              Dari hasil panen
              <br />
              menjadi keputusan
              <span className="font-serif font-medium italic text-[#90C226]">
                {" "}
                bijak.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#DCE8DD]">
              Ikuti tiga tahapan sederhana untuk membantu Ibu mempertimbangkan
              pembagian hasil panen berdasarkan kebutuhan keluarga.
            </p>
          </div>

          {/* Timeline */}

          <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            {LANGKAH.map((langkah, index) => (
              <article
                key={langkah.nomor}
                className="relative border-t border-white/20 pt-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold tracking-tight text-[#90C226]">
                    {langkah.nomor}
                  </span>

                  {index === 0 && <Users size={23} className="text-white/70" />}
                  {index === 1 && (
                    <Camera size={23} className="text-white/70" />
                  )}
                  {index === 2 && (
                    <CheckCircle2 size={23} className="text-white/70" />
                  )}
                </div>

                <h3 className="mt-7 text-xl font-bold text-white">
                  {langkah.judul}
                </h3>

                <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-[#DCE8DD]">
                  {langkah.deskripsi}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          BRAND PHILOSOPHY
      ===================================================== */}

      <section className="bg-[#F8F8F3]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-24">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#3E8E1F]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3E8E1F]">
                  03 — Filosofi PANGANITA
                </span>
              </div>

              <h2 className="mt-8 text-4xl font-extrabold leading-[1.12] tracking-[-0.055em] text-[#0F2D1A] sm:text-5xl lg:text-[58px]">
                Panen bukan hanya
                <br />
                tentang
                <span className="font-serif font-medium italic text-[#3E8E1F]">
                  {" "}
                  pendapatan.
                </span>
              </h2>
            </div>

            <div className="border-l-[3px] border-[#90C226] py-2 pl-6 sm:pl-9">
              <p className="text-lg font-semibold leading-9 text-[#1B4D2B]">
                Sebagian hasil panen dapat dipertimbangkan untuk memenuhi
                kebutuhan pangan keluarga.
              </p>

              <p className="mt-5 text-base font-medium leading-8 text-[#435247]">
                PANGANITA memberikan informasi dan alternatif pembagian sebagai
                alat bantu keputusan. Namun, keputusan akhir tetap berada di
                tangan Ibu, sesuai kondisi dan kebutuhan keluarga.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-[#F8F8F3] px-5 pb-20 sm:px-8 lg:px-16 lg:pb-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#1B4D2B] px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="absolute -right-16 -top-32 h-80 w-80 rounded-full border border-white/10" />

            <div className="absolute -right-4 -top-20 h-60 w-60 rounded-full border border-white/10" />

            <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C1E48B]">
                  Mulai Bersama PANGANITA
                </p>

                <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Langkah bijak dimulai dari hasil panen Ibu.
                </h2>

                <p className="mt-5 max-w-xl text-base font-medium leading-8 text-[#E2EDE3]">
                  Kenali hasil panen, pertimbangkan kebutuhan keluarga, dan
                  tentukan pembagian yang sesuai.
                </p>
              </div>

              <div className="relative shrink-0">
                <MulaiButton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
