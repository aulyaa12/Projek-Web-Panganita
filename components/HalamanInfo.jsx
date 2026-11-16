import Link from "next/link";

import { cn } from "@/lib/utils";

/*
  Layout bersama untuk halaman informasi:
  Tentang Kami, Kebijakan Privasi, Syarat dan Ketentuan.

  Props:
  - judul        : judul halaman
  - pengantar    : kalimat pembuka singkat
  - diperbarui   : teks tanggal pembaruan (opsional, contoh "15 November 2026")
  - bagian       : array { id, judul, isi } ; isi berupa JSX
  - className    : class tambahan untuk <main>
*/
export function HalamanInfo({
  judul,
  pengantar,
  diperbarui,
  bagian = [],
  className,
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10",
        className,
      )}
    >
      {/* Kepala halaman */}
      <header className="relative overflow-hidden rounded-[28px] bg-[#0F2D1A] px-6 py-8 text-white sm:px-10 sm:py-10">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1B4D2B] via-[#90C226] to-[#E6B91E]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#3E8E1F]/30 blur-3xl"
        />
        <div className="relative">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            {judul}
          </h1>
          {pengantar && (
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/85">
              {pengantar}
            </p>
          )}
          {diperbarui && (
            <p className="mt-4 text-base text-[#FFD23F]">
              Terakhir diperbarui: {diperbarui}
            </p>
          )}
        </div>
      </header>

      {/* Daftar isi: tombol besar agar mudah disentuh */}
      {bagian.length > 1 && (
        <nav aria-label="Isi halaman" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {bagian.map((b) => (
              <li key={b.id}>
                <a
                  href={`#${b.id}`}
                  className="inline-flex min-h-12 items-center rounded-full border border-[#d5e2d2] bg-white px-4 text-base font-semibold text-[#1B4D2B] transition-colors hover:border-[#1B4D2B] hover:bg-[#1B4D2B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F]"
                >
                  {b.judul}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Isi */}
      <div className="mt-8 space-y-10">
        {bagian.map((b) => (
          <section
            key={b.id}
            id={b.id}
            aria-labelledby={`${b.id}-judul`}
            className="scroll-mt-28 border-l-4 border-[#90C226] pl-5 sm:pl-6"
          >
            <h2
              id={`${b.id}-judul`}
              className="text-2xl font-bold text-[#0F2D1A]"
            >
              {b.judul}
            </h2>
            <div className="mt-3 space-y-4 text-lg leading-relaxed text-[#26352b]">
              {b.isi}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-full border border-[#d5e2d2] bg-white px-6 text-base font-bold text-[#1B4D2B] transition-colors hover:bg-[#1B4D2B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F]"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}

/* Daftar poin bergaya sederhana, dipakai di semua halaman informasi. */
export function DaftarPoin({ children }) {
  return <ul className="list-disc space-y-2 pl-6 marker:text-[#3E8E1F]">{children}</ul>;
}

/* Kotak penting, misalnya penafian medis. */
export function KotakPenting({ judul, children }) {
  return (
    <div
      role="note"
      className="rounded-2xl border-2 border-[#E6B91E] bg-[#FFF8DB] p-5 text-[#3b2f00]"
    >
      {judul && <p className="text-lg font-bold">{judul}</p>}
      <div className={cn(judul && "mt-2", "space-y-2")}>{children}</div>
    </div>
  );
}

export default HalamanInfo;
