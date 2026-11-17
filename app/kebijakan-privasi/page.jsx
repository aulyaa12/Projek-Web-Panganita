import { HalamanInfo, DaftarPoin, KotakPenting } from "@/components/HalamanInfo";

export const metadata = {
  title: "Kebijakan Privasi | Panganita",
  description:
    "Data apa yang Panganita kumpulkan, untuk apa dipakai, dan bagaimana Ibu mengendalikannya.",
};

const EMAIL_KONTAK = "bunita@panganita.id";

const BAGIAN = [
  {
    id: "data-dikumpulkan",
    judul: "Data yang kami kumpulkan",
    isi: (
      <>
        <p>
          Kami hanya meminta data yang dibutuhkan agar Panganita bisa
          menyediakan informasi pangan dan gizi yang sesuai untuk Ibu dan
          keluarga. Kami tidak meminta nama anak.
        </p>

        <p className="font-bold text-[#0F2D1A]">Saat Ibu masuk ke akun</p>
        <DaftarPoin>
          <li>
            <strong>Nomor WhatsApp:</strong> dipakai untuk mengirim kode masuk
            (OTP) dan sebagai penanda akun Ibu.
          </li>
          <li>
            <strong>Kode OTP:</strong> kami hanya menyimpan bentuk terenkripsi
            (hash) dari kode tersebut, bukan kode aslinya. Kode tidak bisa
            dipakai lagi setelah 5 menit, dan terkunci jika salah dimasukkan.
          </li>
        </DaftarPoin>

        <p className="font-bold text-[#0F2D1A]">
          Saat Ibu mengisi profil keluarga
        </p>
        <DaftarPoin>
          <li>Nama ibu. Ibu boleh memakai nama panggilan atau alias.</li>
          <li>Provinsi dan kota atau kabupaten tempat tinggal Ibu.</li>
          <li>Status hamil (beserta trimester) dan status menyusui.</li>
          <li>
            Jumlah anak per kelompok usia: bayi 6–11 bulan, anak 1–3 tahun,
            4–6 tahun, 7–9 tahun, dan 10–12 tahun.
          </li>
          <li>
            Untuk anak usia 10–12 tahun, kami mencatat jumlah anak laki-laki
            dan perempuan karena kebutuhan gizi mereka berbeda.
          </li>
        </DaftarPoin>

        <p className="font-bold text-[#0F2D1A]">Saat Ibu memakai fitur</p>
        <DaftarPoin>
          <li>
            <strong>Pindai Panen:</strong> foto panen yang Ibu unggah
            (JPEG, PNG, atau WEBP, maksimal 10 MB), jenis bahan pangan yang
            terdeteksi, dan tingkat keyakinan hasil deteksinya.
          </li>
          <li>
            <strong>Keputusan panen:</strong> berat panen yang Ibu isi, hasil
            hitungan bagian untuk keluarga dan bagian untuk dijual, serta foto
            panen yang tersimpan.
          </li>
          <li>
            <strong>Bu Nita:</strong> pesan teks, rekaman suara (voice note),
            hasil transkripsi suara menjadi teks, dan jawaban dari Bu Nita.
          </li>
          <li>
            <strong>Lokasi untuk Bu Nita:</strong> provinsi dan kota Ibu, agar
            jawaban sesuai daerah dan jam percakapan sesuai zona waktu
            setempat (WIB, WITA, atau WIT).
          </li>
          <li>
            <strong>Tumbuh1000:</strong> harga pangan yang Ibu isi sendiri.
            Jika Ibu tidak mengisinya, aplikasi memakai harga bawaan.
          </li>
          <li>
            <strong>Riwayat:</strong> daftar hasil pindai dan keputusan panen
            Ibu sebelumnya.
          </li>
        </DaftarPoin>
      </>
    ),
  },
  {
    id: "persetujuan",
    judul: "Persetujuan",
    isi: (
      <>
        <p>
          Sebelum menyimpan data tertentu, Panganita meminta persetujuan Ibu
          secara terpisah untuk empat hal berikut:
        </p>
        <DaftarPoin>
          <li>
            Menyimpan status hamil dan status menyusui Ibu. Data ini termasuk
            data kesehatan, dan hanya dipakai untuk menyesuaikan saran gizi
            untuk Ibu.
          </li>
          <li>Menyimpan gambar panen yang Ibu pindai.</li>
          <li>Menyimpan rekaman suara yang Ibu kirim ke Bu Nita.</li>
          <li>
            Menyimpan informasi harga pangan di daerah Ibu dan memakainya
            sebagai data gabungan.
          </li>
        </DaftarPoin>
        <p>
          Data anak, yaitu jumlah anak per kelompok usia dan jenis kelamin
          anak usia 10–12 tahun, kami terima hanya dari Ibu ketika mengisi
          profil. Dengan mengisinya, Ibu menyatakan berhak memberikan data
          itu.
        </p>
      </>
    ),
  },
  {
    id: "tujuan",
    judul: "Pemakaian data",
    isi: (
      <DaftarPoin>
        <li>
          Mengirim kode masuk lewat WhatsApp dan memastikan akun hanya bisa
          dibuka oleh Ibu.
        </li>
        <li>
          Menganalisis foto panen dan menampilkan hasilnya kepada Ibu di
          Pindai Panen.
        </li>
        <li>
          Menghitung berapa bagian panen yang sebaiknya untuk gizi keluarga
          dan berapa yang bisa dijual.
        </li>
        <li>
          Memahami pertanyaan dan voice note Ibu, lalu menjawabnya lewat Bu
          Nita.
        </li>
        <li>
          Menyesuaikan saran gizi dengan status hamil atau menyusui, jumlah
          dan kelompok usia anak, serta daerah tempat tinggal Ibu.
        </li>
        <li>
          Menghitung simulasi gizi di Tumbuh1000 memakai harga pangan bawaan
          atau harga yang Ibu isi sendiri.
        </li>
        <li>
          Menyimpan riwayat pindai dan percakapan supaya Ibu bisa membukanya
          lagi.
        </li>
        <li>
          Mengolah harga pangan dari banyak pengguna menjadi data gabungan per
          wilayah, untuk meningkatkan kalkulator gizi ke depannya. Data
          gabungan tidak memuat nama Ibu dan anak.
        </li>
      </DaftarPoin>
    ),
  },
  {
    id: "pihak-ketiga",
    judul: "Pihak ketiga",
    isi: (
      <>
        <p>
          Panganita memakai layanan pihak lain agar dapat dijalankan dengan
          optimal. Data hanya dikirim ke mereka sebatas yang dibutuhkan fitur.
        </p>
        <DaftarPoin>
          <li>
            <strong>Hosting aplikasi:</strong> Vercel, untuk menjalankan
            aplikasi agar bisa dibuka lewat internet.
          </li>
          <li>
            <strong>Basis data dan penyimpanan:</strong> Supabase, untuk
            menyimpan akun, profil, riwayat, serta file gambar dan suara.
            Akses data diatur dengan Row Level Security agar data Ibu tidak
            bisa dibuka pengguna lain.
          </li>
          <li>
            <strong>Penyedia AI:</strong> layanan model AI yang memproses foto
            panen, rekaman suara, dan pesan untuk Bu Nita. Model yang kami
            pakai antara lain YOLO untuk mengenali foto panen, serta Gemini
            dan HuggingFace untuk memahami pesan dan suara. Foto, suara, atau
            pesan dikirim ke penyedia ini hanya saat Ibu memakai fitur
            terkait. Jawaban Bu Nita disusun dari Buku Panduan Gizi Panganita
            yang bersumber dari TKPI Kemenkes RI dan modul WHO.
          </li>
          <li>
            <strong>WhatsApp (Fonnte):</strong> nomor WhatsApp Ibu dan kode
            OTP dikirim lewat Fonnte, hanya untuk keperluan masuk ke akun.
            Fonnte mengelola riwayat pengiriman pesannya sesuai kebijakan
            mereka sendiri.
          </li>
        </DaftarPoin>
        <p>Kami tidak menjual data Ibu kepada siapa pun.</p>
      </>
    ),
  },
  {
    id: "penyimpanan-data",
    judul: "Penyimpanan data",
    isi: (
      <DaftarPoin>
        <li>Data profil dan riwayat disimpan selama akun Ibu aktif.</li>
        <li>
          Kode OTP hanya berlaku 5 menit. Jika tidak dipakai dalam waktu itu,
          kode tidak bisa dipakai lagi dan Ibu perlu meminta kode baru.
        </li>
        <li>
          Jika Ibu meminta penghapusan data atau akun, kami menghapus data
          pribadi Ibu, termasuk gambar dan rekaman suara, paling lambat 30
          hari.
        </li>
        <li>
          Saat ini akun belum bisa dihapus sendiri lewat aplikasi. Ibu bisa
          meminta penghapusan akun langsung kepada admin lewat kontak di
          bawah.
        </li>
        <li>
          Data harga pangan yang sudah digabung menjadi angka wilayah tidak
          bisa lagi dikaitkan dengan Ibu, sehingga bisa tetap disimpan.
        </li>
      </DaftarPoin>
    ),
  },
  {
    id: "keamanan",
    judul: "Keamanan data",
    isi: (
      <DaftarPoin>
        <li>
          Profil, riwayat, dan percakapan Ibu hanya bisa dibuka setelah Ibu
          masuk ke akun.
        </li>
        <li>
          Permintaan kode masuk dibatasi, yaitu maksimal 5 kali per jam dan
          dengan jeda 60 detik, untuk mencegah penyalahgunaan nomor.
        </li>
        <li>
          Kode OTP disimpan dalam bentuk terenkripsi dan tidak bisa dipakai
          lagi setelah 5 menit.
        </li>
        <li>
          Foto panen disimpan di Supabase Storage dengan akses yang diatur
          agar hanya Ibu yang bisa membukanya.
        </li>
        <li>
          Hasil pindai dan jawaban Bu Nita dibuat oleh AI, bisa keliru, dan
          bukan pengganti saran dokter, bidan, atau ahli gizi.
        </li>
      </DaftarPoin>
    ),
  },
  {
    id: "hak-pengguna",
    judul: "Hak pengguna",
    isi: (
      <>
        <DaftarPoin>
          <li>Melihat data yang kami simpan.</li>
          <li>Memperbaiki data yang salah.</li>
          <li>Menghapus data atau akun.</li>
          <li>Menarik persetujuan yang pernah diberikan.</li>
        </DaftarPoin>
        <p>
          Hak-hak ini sejalan dengan Undang-Undang Pelindungan Data Pribadi
          (UU Nomor 27 Tahun 2022). Untuk memakainya, kirim permintaan ke
          alamat di bagian kontak. Termasuk jika Ibu ingin menghapus akun,
          karena saat ini penghapusan akun dilakukan oleh admin atas
          permintaan Ibu.
        </p>
      </>
    ),
  },
  {
    id: "kontak",
    judul: "Hubungi kami",
    isi: (
      <KotakPenting judul="Ada pertanyaan soal data Ibu?">
        <p>
          Kirim email ke{" "}
          <a
            href={`mailto:${EMAIL_KONTAK}`}
            className="font-bold underline underline-offset-4 hover:text-[#1B4D2B]"
          >
            {EMAIL_KONTAK}
          </a>
          . Tulis nomor WhatsApp akun dan permintaan Ibu, misalnya hapus
          akun, hapus data, atau perbaiki data.
        </p>
      </KotakPenting>
    ),
  },
];

export default function HalamanKebijakanPrivasi() {
  return (
    <HalamanInfo
      judul="Kebijakan Privasi"
      pengantar="Penjelasan singkat tentang data yang kami minta, untuk apa dipakai, dan bagaimana Ibu mengendalikannya."
      diperbarui="16 November 2026"
      bagian={BAGIAN}
    />
  );
}
