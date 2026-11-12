import Image from "next/image";
import { FormMasuk } from "@/components/FormMasuk";
import { Logo } from "@/components/Logo";

export default function HalamanMasuk() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-6 flex justify-center">
        <Logo priority />
      </div>

      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-lift sm:p-8">
        <div className="flex items-center gap-4">
          <Image
            src="/images/maskot-bu-nita.png"
            alt="Bu Nita menyapa"
            width={420}
            height={420}
            className="h-20 w-20 shrink-0 object-contain"
          />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Selamat datang, Ibu</h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Masuk untuk mengatur hasil panen keluarga.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <FormMasuk />
        </div>

        <p className="mt-5 rounded-xl bg-warning p-3 text-xs leading-relaxed text-warning-foreground">
          Ini login sementara untuk pengembangan. Nantinya diganti dengan login WhatsApp OTP.
        </p>
      </div>
    </main>
  );
}
