import {
  Baby,
  Camera,
  ChevronDown,
  Eye,
  Fish,
  Hand,
  Leaf,
  MessageCircle,
  Mic,
  ShieldCheck,
  Smartphone,
  Sprout,
  UserRound,
  WifiOff,
} from "lucide-react";

import { GambarCadangan } from "@/components/GambarCadangan";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";

/*
  Landing Page PANGANITA ("/").
  Navbar dan footer dipasang oleh NavKondisional, jadi file ini hanya isi halaman.

  GAMBAR (taruh di folder public):
  - MASKOT      : maskot Bu Nita (PNG transparan). SESUAIKAN nama file dengan milik Ibu.
  - FOTO_PANEN  : foto stok gratis (Unsplash/Pexels), misalnya perempuan nelayan atau petani
                  Indonesia membawa hasil panen. Simpan sebagai JPG dan cantumkan fotografernya di README.
  Bila file belum ada, halaman tetap tampil rapi dengan kotak pengganti.
*/
const MASKOT = "/images/maskot-bu-nita.png";
const FOTO_PANEN = "/images/landing/panen-ibu.jpg";

const FAKTA_MASALAH = [
  {
    angka: "29,4%",
    teks: "balita keluarga nelayan di Kota Bengkulu mengalami stunting.",
    sumber: "Yuliantini dkk., 2022. Contoh dari dua kelurahan, 74 balita.",
  },
  {
    angka: "4,1×",
    teks: "lebih besar risiko stunting bila asupan protein balita rendah.",
    sumber: "Yuliantini dkk., 2022, Kota Bengkulu.",
  },
  {
    angka: "2,5×",
    teks: "lebih besar risiko stunting pada anak dari keluarga termiskin.",
    sumber: "SSGI 2024, Kementerian Kesehatan RI.",
  },
];

const FITUR = [
  {
    nama: "Pindai Panen",
    ikon: Camera,
    kalimat: "Cukup foto hasil panen, biarkan AI bekerja.",
    isi: "Panganita mengenali 15 jenis pangan lokal: ikan dan udang, sayur, buah, pangan pokok, dan telur. Lalu Ibu mengisi berat dan harga, dan Panganita menghitung berapa yang disimpan untuk keluarga dan berapa yang dijual.",
    contoh: "Contoh: 2 kg ikan lele, simpan 0,5 kg untuk balita, jual 1,5 kg.",
    utama: true,
  },
  {
    nama: "Tumbuh1000",
    ikon: Sprout,
    kalimat: "Bandingkan tiga pilihan pembagian panen.",
    isi: "Prioritas Gizi, Seimbang, atau Prioritas Uang. Setiap pilihan dihitung dari jumlah anggota keluarga dan Angka Kecukupan Gizi, lengkap dengan alasannya. Ibu yang menentukan, dan pilihan Ibu tersimpan di riwayat.",
    contoh: "Cocok untuk keluarga dengan ibu hamil, ibu menyusui, atau balita.",
    utama: false,
  },
  {
        nama: "Bu Nita",
    ikon: MessageCircle,
    kalimat: "Teman bertanya soal gizi dan resep.",
    isi: (
      <>
        Tanyakan ide olahan pangan lokal atau gizi anak lewat suara maupun tulisan. Jawaban Bu Nita berdasarkan{" "}
        <a
          href="https://panganita.vercel.app/docs/buku_panduan_gizi_dan_olahan_panganita.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800 font-medium"
        >
          rujukan
        </a>{" "}
        yang telah dihimpun oleh Tim Panganita.
      </>
    ),
    contoh: "Contoh: “Panen tomat 5 kg untuk 3 hari, saran jual berapa kg?”",
    utama: false,

  },
];

const LANGKAH = [
  {
    judul: "Masuk lewat WhatsApp",
    isi: "Tanpa kata sandi baru. Ibu cukup memasukkan kode yang dikirim ke WhatsApp.",
    ikon: Smartphone,
  },
  {
    judul: "Isi data keluarga",
    isi: "Sekali saja: nama Ibu, kondisi Ibu, dan jumlah anak menurut usia.",
    ikon: UserRound,
  },
  {
    judul: "Foto hasil panen",
    isi: "Ambil foto langsung atau pilih foto dari galeri HP.",
    ikon: Camera,
  },
  {
    judul: "Pilih pembagian",
    isi: "Lihat tiga pilihan, pilih yang cocok, dan simpan di riwayat.",
    ikon: Leaf,
  },
];

const KEMUDAHAN = [
  {
    judul: "Tombol besar dan jelas",
    isi: "Mudah disentuh, juga saat tangan basah atau kotor.",
    ikon: Hand,
  },
  {
    judul: "Tulisan terbaca di bawah matahari",
    isi: "Warna kontras tinggi dan huruf cukup besar.",
    ikon: Eye,
  },
  {
    judul: "Bisa tanya lewat suara",
    isi: "Ibu tidak harus mengetik untuk bertanya kepada Bu Nita.",
    ikon: Mic,
  },
  {
    judul: "Sinyal sedang susah?",
    isi: "Foto bisa diunggah nanti, saat Ibu berada di tempat yang sinyalnya baik.",
    ikon: WifiOff,
  },
];

const PERTANYAAN = [
  {
    tanya: "Apakah Panganita pengganti bidan atau dokter?",
    jawab:
      "Bukan. Hasil hitungan dan jawaban Bu Nita adalah alat bantu dan bisa saja keliru. Untuk kesehatan Ibu dan anak, tetap tanyakan kepada bidan, kader posyandu, atau dokter.",
  },
  {
    tanya: "Pangan apa saja yang bisa dikenali dari foto?",
    jawab:
      "Ada 15 jenis: 5 ikan dan udang, 3 sayur, 3 buah, 3 pangan pokok, dan telur. Bila hasilnya kurang tepat, Ibu bisa mengoreksi nama pangan lewat kolom pencarian.",
  },
  {
    tanya: "Foto dan data keluarga saya dipakai untuk apa?",
    jawab:
      "Hanya untuk menghitung pembagian panen dan menampilkan riwayat Ibu. Foto disimpan hanya bila Ibu memilih salah satu pembagian, dan tidak diperlihatkan kepada pengguna lain.",
  },
  {
    tanya: "Mengapa masuk lewat WhatsApp?",
    jawab:
      "Karena banyak ibu sudah akrab dengan WhatsApp. Ibu tidak perlu mengingat kata sandi baru.",
  },
  {
    tanya: "Bagaimana kalau sinyal di tempat saya susah?",
    jawab:
      "Ibu perlu sinyal untuk memproses foto. Karena itu Ibu bisa memotret dulu, lalu mengunggah foto dari galeri saat sudah berada di tempat dengan sinyal yang baik, misalnya Balai Desa.",
  },
];

// Judul bagian: satu pola untuk semua bagian halaman.
function JudulBagian({ id, judul, pengantar, terang = false, tengah = false }) {
  return (
    <div className={tengah ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2
        id={id}
        className={`text-3xl font-extrabold leading-tight sm:text-4xl ${
          terang ? "text-white" : "text-[#0F2D1A]"
        }`}
      >
        {judul}
      </h2>
      {pengantar && (
        <p
          className={`mt-3 text-lg leading-relaxed ${
            terang ? "text-white/85" : "text-[#3d5044]"
          }`}
        >
          {pengantar}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main id="isi-utama" className="overflow-x-clip">
      {/* 1. HERO */}
      <section
        aria-labelledby="judul-hero"
        className="mx-auto mt-4 w-full max-w-6xl px-3 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-[32px] bg-[#1B4D2B] px-5 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#3E8E1F] via-[#90C226] to-[#E6B91E]"
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1
                id="judul-hero"
                className="text-4xl font-extrabold leading-[1.15] sm:text-5xl"
              >
                Panen hari ini, gizi anak tetap terjaga.
              </h1>
              <p className="mt-5 max-w-xl text-xl leading-relaxed text-white/90">
                Panganita membantu Ibu memutuskan berapa yang dijual dan berapa
                yang disisihkan untuk keluarga, mulai dari satu foto hasil
                panen.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton
                  href="/masuk"
                  ikon={MessageCircle}
                  className="bg-[#FFD23F] font-bold text-[#0F2D1A] hover:bg-[#ffdc66]"
                >
                  Masuk lewat WhatsApp
                </PrimaryButton>
                <SecondaryButton
                  href="#cara-kerja"
                  className="min-h-14 border-2 border-white font-bold text-[#0F2D1A] hover:border-[#FFD23F] hover:bg-[#90C226] hover:text-[#0F2D1A] focus-visible:ring-[#FFD23F]"
                >
                  Lihat cara kerjanya
                </SecondaryButton>
              </div>

              <p className="mt-6 flex items-start gap-2 text-base text-white/80">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#90C226]"
                />
                Masuk langsung tanpa kata sandi. Untuk ibu yang terutama
                bekerja di bidang pangan, seperti petani dan nelayan, dengan anak usia
                1.000 Hari Pertama Kehidupan (HPK).
              </p>
            </div>

            {/* Maskot Bu Nita dengan latar */}
            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(90%_70%_at_50%_32%,#FFF0B3_0%,#E2EE82_30%,#90C226_58%,#3E8E1F_100%)] pt-8">
                {/* Bayangan lembut di bagian bawah agar maskot terasa berpijak */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1B4D2B]/45 to-transparent"
                />
                <GambarCadangan
                  src={MASKOT}
                  alt="Bu Nita, penyuluh gizi digital Panganita, tersenyum ramah"
                  width={600}
                  height={600}
                  priority
                  ikonCadangan={
                    <Sprout aria-hidden="true" className="h-24 w-24" />
                  }
                  kelasCadangan="relative mx-auto h-72 w-72 rounded-full bg-transparent text-[#1B4D2B]"
                  className="relative mx-auto h-auto w-64 object-contain sm:w-80"
                />
              </div>
              <p className="relative z-10 -mt-6 mx-4 rounded-2xl bg-white p-4 text-[#0F2D1A] shadow-lg">
                <span className="block text-lg font-bold">Bu Nita</span>
                <span className="text-base text-[#3d5044]">
                  Asisten gizi yang siap menemani Ibu bertanya.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MASALAH */}
      <section
        aria-labelledby="judul-masalah"
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <JudulBagian
          id="judul-masalah"
          judul="Panen berlimpah, tetapi gizi anak sering tersisih."
          pengantar="Di banyak desa pesisir, ikan dan udang terbaik dijual semua. 
          Uangnya dipakai membeli pangan praktis seperti mi instan, sehingga protein untuk anak berkurang."
        />

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-72 overflow-hidden rounded-[28px]">
          <GambarCadangan
            src={FOTO_PANEN}
            alt="Seorang ibu membawa hasil panen untuk keluarganya"
            width={1200}
            height={1000}
            ikonCadangan={<Fish aria-hidden="true" className="h-16 w-16" />}
            kelasCadangan="absolute inset-0"
            className="absolute inset-0 h-full w-full object-cover"
          />
          </div>

          <ul className="grid gap-4">
            {FAKTA_MASALAH.map((fakta) => (
              <li
                key={fakta.angka}
                className="flex items-center gap-5 rounded-2xl border border-[#D5E2D2] bg-white p-5 shadow-[0_5px_25px_rgba(30,77,48,0.07)]"
              >
                <p className="min-w-[6.5rem] shrink-0 text-4xl font-extrabold text-[#1B4D2B] xl:min-w-[8rem] xl:text-5xl">
                  {fakta.angka}
                </p>
                <div className="min-w-0">
                  <p className="text-lg font-medium leading-snug text-[#0F2D1A]">
                    {fakta.teks}
                  </p>
                  <p className="mt-1 text-sm text-[#53665a]">{fakta.sumber}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 max-w-3xl text-xl font-semibold leading-relaxed text-[#1B4D2B]">
          Panganita mengajak Ibu menyisihkan sebelum menjual: sebagian untuk
          memenuhi gizi keluarga, sebagian tetap dijual untuk kebutuhan sehari-hari.
        </p>
      </section>

      {/* 3. TIGA FITUR */}
      <section
        aria-labelledby="judul-fitur"
        className="bg-[#EAF1E8] py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <JudulBagian
            id="judul-fitur"
            tengah
            judul="Tiga teman Ibu di Panganita"
            pengantar="Mulai dari Pindai Panen. Dua teman lainnya melengkapi keputusan Ibu."
          />

          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {FITUR.map((fitur) => {
              const Ikon = fitur.ikon;
              return (
                <li
                  key={fitur.nama}
                  className={`flex flex-col rounded-3xl p-6 sm:p-7 ${
                    fitur.utama
                      ? "bg-[#1B4D2B] text-white"
                      : "border border-[#D5E2D2] bg-white text-[#0F2D1A]"
                  }`}
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      fitur.utama
                        ? "bg-[#FFD23F] text-[#0F2D1A]"
                        : "bg-[#EAF1E8] text-[#1B4D2B]"
                    }`}
                  >
                    <Ikon aria-hidden="true" className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-2xl font-extrabold">{fitur.nama}</h3>
                  <p
                    className={`mt-1 text-lg font-semibold ${
                      fitur.utama ? "text-[#FFD23F]" : "text-[#2e7045]"
                    }`}
                  >
                    {fitur.kalimat}
                  </p>
                  <p
                    className={`mb-6 mt-4 text-lg leading-relaxed ${
                      fitur.utama ? "text-white/90" : "text-[#26352b]"
                    }`}
                  >
                    {fitur.isi}
                  </p>
                  <p
                    className={`mt-auto rounded-xl p-3 text-base ${
                      fitur.utama
                        ? "bg-white/10 text-white"
                        : "bg-[#F4F7F2] text-[#3d5044]"
                    }`}
                  >
                    {fitur.contoh}
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="mx-auto mt-8 max-w-3xl text-center text-base text-[#3d5044]">
            Pengenalan pangan dari foto dan jawaban Bu Nita dibantu kecerdasan
            buatan (AI), dan akan diberi tanda di layar. Hasilnya bisa keliru,
            jadi Ibu tetap yang memutuskan.
          </p>
        </div>
      </section>

      {/* 4. CARA KERJA */}
      <section
        id="cara-kerja"
        aria-labelledby="judul-cara"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20"
      >
        <JudulBagian
          id="judul-cara"
          judul="Empat langkah, satu arah."
          pengantar="Tidak ada menu berlapis. Ibu tinggal mengikuti urutannya."
        />

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANGKAH.map((langkah, i) => {
            const Ikon = langkah.ikon;
            return (
              <li
                key={langkah.judul}
                className="rounded-3xl border border-[#D5E2D2] bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1B4D2B] text-xl font-extrabold text-white">
                    {i + 1}
                  </span>
                  <Ikon aria-hidden="true" className="h-7 w-7 text-[#3E8E1F]" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#0F2D1A]">
                  {langkah.judul}
                </h3>
                <p className="mt-2 text-lg leading-relaxed text-[#3d5044]">
                  {langkah.isi}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 text-lg text-[#3d5044]">
          Ada pertanyaan di tengah jalan? Ibu bisa bertanya kepada Bu Nita kapan
          saja.
        </p>
      </section>

      {/* 5. KUTIPAN + KEMUDAHAN */}
      <section
        aria-labelledby="judul-mudah"
        className="bg-[#0F2D1A] py-16 text-white sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <figure className="relative mx-auto max-w-3xl px-8 py-16 text-center sm:px-16 sm:py-20">
            {/* Garis atas, dengan tanda kutip buka */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-3 top-0 h-12 border-r-[3px] border-t-[3px] border-[#FFD23F]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-24 right-0 top-3 h-16 border-r-[3px] border-t-[3px] border-white"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-3 w-4 border-t-[3px] border-white"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-[-2px] font-serif text-6xl font-extrabold leading-none text-white"
            >
              “
            </span>

            <blockquote className="text-3xl font-extrabold leading-snug text-[#FFD23F] sm:text-4xl">
              Sisihkan sebelum dijual.
            </blockquote>
            <figcaption className="mt-3 text-lg text-white/80">
              Pesan pendampingan gizi di Teluk Bintuni, Papua Barat, yang
              menjadi dasar pengembangan Panganita.
            </figcaption>

            {/* Garis bawah, dengan tanda kutip tutup */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-3 right-0 h-12 border-b-[3px] border-l-[3px] border-[#FFD23F]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-0 right-24 h-16 border-b-[3px] border-l-[3px] border-white"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 right-0 w-4 border-b-[3px] border-white"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[-6px] right-6 font-serif text-6xl font-extrabold leading-none text-white"
            >
              ”
            </span>
          </figure>

          <div className="mt-14">
            <JudulBagian
              id="judul-mudah"
              terang
              judul="Dibuat untuk Ibu yang bekerja di ladang dan laut."
              pengantar="Tangan basah, matahari terik, sinyal terbatas. Semua itu kami pikirkan."
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {KEMUDAHAN.map((item) => {
                const Ikon = item.ikon;
                return (
                  <li
                    key={item.judul}
                    className="flex gap-4 rounded-2xl bg-white/10 p-5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#90C226] text-[#0F2D1A]">
                      <Ikon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold">{item.judul}</h3>
                      <p className="mt-1 text-lg text-white/85">{item.isi}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. PERTANYAAN */}
      <section
        aria-labelledby="judul-tanya"
        className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <JudulBagian
            id="judul-tanya"
            judul="Pertanyaan yang sering Ibu tanyakan"
            pengantar="Jawaban singkat tentang cara kerja, keamanan data, dan batas Panganita."
          />

          <div className="space-y-3">
            {PERTANYAAN.map((item) => (
              <details
                key={item.tanya}
                className="group rounded-2xl border border-[#D5E2D2] bg-white"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 text-lg font-bold text-[#0F2D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] [&::-webkit-details-marker]:hidden">
                  {item.tanya}
                  <ChevronDown
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 text-[#3E8E1F] transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 text-lg leading-relaxed text-[#26352b]">
                  {item.jawab}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. AJAKAN PENUTUP */}
      <section
        aria-labelledby="judul-ajakan"
        className="mx-auto w-full max-w-6xl px-3 pb-16 sm:px-6 sm:pb-20"
      >
        <div className="relative overflow-hidden rounded-[32px] bg-[#1B4D2B] px-6 py-12 text-center text-white sm:px-12">
          <Baby
            aria-hidden="true"
            className="absolute -left-4 -top-4 h-28 w-28 text-white/10"
          />
          <Leaf
            aria-hidden="true"
            className="absolute -bottom-6 -right-4 h-32 w-32 rotate-12 text-white/10"
          />
          <h2
            id="judul-ajakan"
            className="relative text-3xl font-extrabold sm:text-4xl"
          >
            Mulai dari panen Ibu hari ini.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-xl text-white/90">
            Bersama Panganita, kita putus rantai stunting dari sumber pangan
            keluarga sendiri.
          </p>
          <div className="relative mt-8 flex justify-center">
            <PrimaryButton
              href="/masuk"
              ikon={MessageCircle}
              className="bg-[#FFD23F] font-bold text-[#0F2D1A] hover:bg-[#ffdc66]"
            >
              Masuk lewat WhatsApp
            </PrimaryButton>
          </div>
        </div>
      </section>
    </main>
  );
}
