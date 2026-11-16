import Link from "next/link";

import { HalamanInfo, DaftarPoin, KotakPenting } from "@/components/HalamanInfo";

export const metadata = {
  title: "Syarat dan Ketentuan | Panganita",
  description:
    "Aturan memakai Panganita, termasuk batas rekomendasi AI dan cara input manual.",
};

const BAGIAN = [
  {
    id: "penggunaan-layanan",
    judul: "Penggunaan layanan",
    isi: (
      <>
        <p>
          Panganita membantu keluarga memantau pangan dan gizi lewat tiga
          fitur: Pindai Panen, Chatbot AI Bu Nita (teks dan voice note), dan
          simulasi perhitungan gizi Tumbuh1000. Dengan memakai Panganita, Ibu setuju
          dengan syarat di halaman ini.
        </p>
        <DaftarPoin>
          <li>Pakai Panganita untuk keperluan pribadi dan keluarga.</li>
          <li>
            Unggah hanya foto panen milik Ibu sendiri. Jangan unggah gambar yang
            tidak berkaitan dengan panen atau yang melanggar hak orang lain.
          </li>
          <li>
            Jangan mencoba merusak aplikasi, mengakses akun orang lain, atau
            memakai Bu Nita untuk hal yang merugikan orang lain.
          </li>
          <li>
            Isi harga pangan sesuai harga yang Ibu temui. Data yang sengaja
            dipalsukan mengganggu perhitungan untuk pengguna lain.
          </li>
        </DaftarPoin>
      </>
    ),
  },
  {
    id: "akun",
    judul: "Akun",
    isi: (
      <DaftarPoin>
        <li>
          Beberapa fitur membutuhkan akun. Isi data dengan benar. Nama ibu
          boleh berupa nama panggilan atau alias.
        </li>
        <li>
          Jaga kerahasiaan akun. Ibu bertanggung jawab atas kegiatan yang
          terjadi lewat akun Ibu.
        </li>
        <li>
          Ibu bisa meminta penghapusan akun kapan saja lewat{" "}
          <Link
            href="/kebijakan-privasi#kontak"
            className="font-bold text-[#1B4D2B] underline underline-offset-4"
          >
            kontak di Kebijakan Privasi
          </Link>
          .
        </li>
        <li>
          Kami dapat menonaktifkan akun yang dipakai untuk menyalahgunakan
          layanan.
        </li>
      </DaftarPoin>
    ),
  },
  {
    id: "batas-ai",
    judul: "Batas rekomendasi AI",
    isi: (
      <>
        <KotakPenting judul="Penafian medis">
          <p>
            Bu Nita AI adalah asisten edukasi gizi dan bukan pengganti
            diagnosis dokter. Tindakan medis harus selalu dikonfirmasikan
            dengan tenaga kesehatan di fasilitas kesehatan setempat.
          </p>
        </KotakPenting>
        <p>
          Jawaban Bu Nita dibuat oleh AI dan bisa keliru. Setiap jawaban diberi
          penanda bahwa berasal dari AI. Jika anak Ibu sakit, tampak kurang gizi,
          atau Ibu ragu, periksakan ke posyandu, puskesmas, atau dokter.
        </p>
        <p>
          Hasil simulasi gizi adalah perkiraan berdasarkan data yang Ibu
          masukkan dan harga setempat. Hasilnya bukan resep atau anjuran medis.
        </p>
      </>
    ),
  },
  {
    id: "pindai-panen",
    judul: "Penafian fitur Pindai Panen",
    isi: (
      <>
        <p>
          Hasil pindai bisa keliru, terutama jika foto buram, gelap, terlalu
          jauh, atau berisi beberapa jenis panen sekaligus. Periksa hasilnya
          sebelum Ibu melanjutkan penggunaan aplikasi.
        </p>
        <p>
          Jika hasil salah atau pindai tidak berhasil, Ibu bisa mengisi data
          panen secara manual. Pilihan input manual selalu tersedia di
          halaman Pindai.
        </p>
      </>
    ),
  },
  {
    id: "data-dan-privasi",
    judul: "Data dan privasi",
    isi: (
      <p>
        Cara kami mengumpulkan, memakai, dan menyimpan gambar, suara, dan data
        keluarga Ibu dijelaskan di{" "}
        <Link
          href="/kebijakan-privasi"
          className="font-bold text-[#1B4D2B] underline underline-offset-4"
        >
          Kebijakan Privasi
        </Link>
        . Syarat ini dan kebijakan tersebut berlaku bersama.
      </p>
    ),
  },
  {
    id: "perubahan-syarat",
    judul: "Perubahan syarat",
    isi: (
      <>
        <p>
          Kami dapat memperbarui syarat ini jika fitur atau aturan berubah.
          Tanggal pembaruan terakhir ada di bagian atas halaman. Jika ada
          perubahan penting, kami akan memberi tahu lewat aplikasi.
        </p>
        <p>
          Jika Ibu terus memakai Panganita setelah perubahan berlaku, kami
          anggap Ibu menyetujui syarat yang baru. Ada pertanyaan? Kirim email ke{" "}
          <a
            href="mailto:bunita@panganita.id"
            className="font-bold text-[#1B4D2B] underline underline-offset-4"
          >
            bunita@panganita.id
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function HalamanSyaratDanKetentuan() {
  return (
    <HalamanInfo
      judul="Syarat dan Ketentuan"
      pengantar="Aturan sederhana agar Panganita aman dan bermanfaat untuk keluarga Ibu."
      diperbarui="15 November 2026"
      bagian={BAGIAN}
    />
  );
}
