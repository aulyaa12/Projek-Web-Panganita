import { HalamanInfo, DaftarPoin } from "@/components/HalamanInfo";
import Image from "next/image";

const SPONSOR = [
  {
    nama: "Perempuan Inovasi GENerasi AI x IBM SkillsBuild",
    src: "/images/Logo Perempuan Inovasi x IBM SkillsBuild.png",
  },
  {
    nama: "Yayasan Dian Sastrowardoyo",
    src: "/images/Logo Yayasan Dian Sastrowardoyo.png",
  },
  {
    nama: "Magnifique",
    src: "/images/Logo Magnifique.png",
  },
  {
    nama: "Markoding",
    src: "/images/Logo Markoding.png",
  },
];
export const metadata = {
  title: "Tentang Kami | Panganita",
  description:
    "Panganita, Pangan dan Gizi untuk Keluarga. Dibuat oleh Kelompok Malahayati.",
};

const BAGIAN = [
  {
    id: "apa-itu-panganita",
    judul: "Apa itu Panganita",
    isi: (
      <>
        <p>
          Panganita merupakan aplikasi yang membantu Ibu mengenali hasil panen, bertanya soal gizi, dan
          menghitung kebutuhan gizi keluarga dengan harga pangan di domisili Ibu.
        </p>
        <p>
          Panganita dibuat untuk ibu yang bekerja di ladang, tambak, atau laut,
          dan memiliki anak dalam masa 1.000 hari pertama kehidupan. Aplikasi
          dirancang untuk dipakai dari ponsel, dengan tombol besar, warna kontras, dan bahasa
          sehari-hari.
        </p>
      </>
    ),
  },
  {
    id: "fitur",
    judul: "Tiga fitur utama",
    isi: (
      <DaftarPoin>
        <li>
          <strong>Pindai Panen.</strong> Foto atau unggah foto hasil panen Ibu agar Panganita
          dapat menganalisis dan memberikan tiga alternatif pilihan terbaik (Prioritas Gizi, Seimbang, 
          Prioritas Uang) yang bisa Ibu manfaatkan untuk memenuhi gizi keluarga. 
        </li>
        <li>
          <strong>Bu Nita.</strong> Asisten gizi berbasis AI yang bisa ditanya
          lewat teks maupun voice note. Bu Nita dapat mengenali bahasa maupun dialek
          berbagai daerah di Indonesia.
        </li>
        <li>
          <strong>Tumbuh1000.</strong> Menghitung kebutuhan gizi
          keluarga khususnya anak usia 1.000 Hari Pertama Kehidupan (HPK) dengan memakai harga pangan di kota atau kabupaten Ibu.
        </li>
      </DaftarPoin>
    ),
  },
  {
    id: "tim",
    judul: "Siapa yang membuat",
    isi: (
      <p>
        Panganita dibuat oleh Kelompok Malahayati dalam Bootcamp Perempuan
        Inovasi 2026, program Perempuan Inovasi GENerasi AI yang
        diselenggarakan Markoding bersama IBM SkillsBuild. Tema kami adalah
        ketahanan pangan, gizi perempuan, dan keluarga.
      </p>
    ),
  },
  {
    id: "didukung-oleh",
    judul: "Didukung oleh",
    isi: (
      <>
        <p>Kelompok Malahayati mengucapkan terima kasih kepada pihak-pihak yang mendukung program ini:</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SPONSOR.map((s) => (
            <li
              key={s.nama}
              className="relative flex h-24 items-center justify-center rounded-2xl border border-[#d5e2d2] bg-white p-1"
            >
              <Image
                src={s.src}
                alt={s.nama}
                fill
                sizes="(min-width: 640px) 160px, 45vw"
                className="object-contain p-1"
              />
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "hubungi-kami",
    judul: "Hubungi kami",
    isi: (
      <p>
        Ada pertanyaan atau masukan? Kirim email ke{" "}
        <a
          href="mailto:bunita@panganita.id"
          className="font-bold text-[#1B4D2B] underline underline-offset-4"
        >
          bunita@panganita.id
        </a>
      <br />
        Untuk pengembang: lihat{" "}
        <a
          href="/api-docs"
          className="font-bold underline underline-offset-4 hover:text-[#1B4D2B]"
        >
          dokumentasi API Panganita
        </a>
        .
      </p>
    ),
  },
];

export default function HalamanTentangKami() {
  return (
    <HalamanInfo
      judul="Tentang Kami"
      pengantar="Pangan dan gizi untuk keluarga, dimulai dari hasil panen ibu."
      bagian={BAGIAN}
    />
  );
}
