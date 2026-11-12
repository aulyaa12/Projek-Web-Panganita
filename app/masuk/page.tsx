"use client";

import { useEffect, useRef, useState, type FormEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, MessageCircle, Phone, ShieldCheck, Smartphone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const OTP_LENGTH = 6;
const emptyDigits = () => Array.from({ length: OTP_LENGTH }, () => "");

type ApiResponse = {
  error?: string;
  retryAfter?: number;
  resendAfter?: number;
  tokenHash?: string;
  redirectTo?: string;
};

async function postJson(url: string, body: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as ApiResponse;
  return { ok: response.ok, data };
}

export default function HalamanMasuk() {
  const router = useRouter();
  // Pakai klien yang sama dengan AppNav dan halaman lain, supaya sesi tersimpan
  // di tempat yang sama dan logout benar-benar menghapusnya.
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(emptyDigits);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  // Pengunci sinkron: mencegah verifyOtp berjalan dua kali (state loading terlalu lambat)
  const submittingRef = useRef(false);

  const code = digits.join("");

  // Hitung mundur sebelum pengguna dapat meminta kode OTP lagi.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function requestOtp(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/whatsapp/request-otp", { phone });
      if (!ok) {
        if (data.retryAfter) setCooldown(data.retryAfter);
        setError(data.error || "Gagal mengirim kode. Silakan coba lagi.");
        return;
      }

      setDigits(emptyDigits());
      setCooldown(data.resendAfter ?? 60);
      setStep(2);
      window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Ibu.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (submittingRef.current || code.length !== OTP_LENGTH) return;
    submittingRef.current = true;
    let navigating = false;

    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/whatsapp/verify-otp", { phone, code });
      if (!ok) {
        setError(data.error || "Kode OTP tidak valid. Silakan coba lagi.");
        setDigits(emptyDigits());
        window.setTimeout(() => inputsRef.current[0]?.focus(), 0);
        return;
      }

      if (!data.tokenHash) {
        setError("Token verifikasi tidak ditemukan. Silakan minta kode baru.");
        setDigits(emptyDigits());
        return;
      }

      // Tukar token dari server menjadi sesi Supabase di browser.
      const { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.tokenHash,
        type: "email",
      });

      if (sessionError) {
        console.error("[masuk] supabase.auth.verifyOtp gagal:", sessionError);
        setError(
          "Gagal membuat sesi login. Silakan minta kode baru." +
            (process.env.NODE_ENV !== "production" ? ` (${sessionError.message})` : ""),
        );
        setDigits(emptyDigits());
        return;
      }

      // Berhasil: kunci halaman sampai pindah. Jangan buka kunci di finally,
      // karena di mode dev halaman tujuan butuh beberapa detik untuk dimuat
      // dan klik kedua akan memakai OTP yang sudah terpakai.
      navigating = true;
      setSuccess(true);
      router.replace(data.redirectTo || "/dashboard");
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi internet Ibu.");
      setDigits(emptyDigits());
    } finally {
      if (!navigating) {
        submittingRef.current = false;
        setLoading(false);
      }
    }
  }

  // Verifikasi otomatis setelah keenam digit OTP terisi.
  useEffect(() => {
    if (step === 2 && code.length === OTP_LENGTH && !loading) {
      void verifyOtp();
    }
    // verifyOtp sengaja tidak dimasukkan ke dependency agar efek hanya dipicu perubahan kode/langkah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step]);

  function changeDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    if (digit && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    setError("");
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? ""));
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    setError("");
  }

  function backToPhone() {
    setStep(1);
    setError("");
    setDigits(emptyDigits());
  }

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
            priority
            className="h-20 w-20 shrink-0 object-contain"
          />
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary">
              <MessageCircle size={14} /> MASUK DENGAN WHATSAPP
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {step === 1 ? "Selamat datang, Ibu" : "Verifikasi nomor Ibu"}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {step === 1
                ? "Masuk untuk mengatur hasil panen keluarga."
                : `Masukkan kode 6 digit yang dikirim ke WhatsApp ${phone}.`}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3" aria-label={`Langkah ${step} dari 2`}>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}>1</span>
          <span className="h-px w-10 bg-border" />
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
        </div>

        {step === 1 ? (
          <form onSubmit={requestOtp} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-foreground">
                Nomor WhatsApp
              </label>
              <div className="flex items-center rounded-xl border border-border bg-background px-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <Phone size={18} className="shrink-0 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError("");
                  }}
                  required
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Pastikan nomor WhatsApp aktif dan dapat menerima pesan.
              </p>
            </div>

            {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={loading || phone.replace(/\D/g, "").length < 9}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <><LoaderCircle size={18} className="animate-spin" /> Mengirim kode...</> : <>Kirim kode ke WhatsApp <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <div className="mt-7 space-y-5">
            <div>
              <label htmlFor="otp-0" className="mb-3 block text-sm font-semibold text-foreground">Kode OTP</label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    ref={(element) => { inputsRef.current[index] = element; }}
                    value={digit}
                    onChange={(event) => changeDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onFocus={(event) => event.target.select()}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    disabled={loading}
                    aria-label={`Digit ${index + 1} dari ${OTP_LENGTH}`}
                    className="h-12 w-full min-w-0 rounded-xl border border-border bg-background text-center text-xl font-bold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
                  />
                ))}
              </div>
            </div>

            {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}

            <button
              type="button"
              onClick={() => void verifyOtp()}
              disabled={loading || code.length !== OTP_LENGTH}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <><LoaderCircle size={18} className="animate-spin" /> {success ? "Berhasil, membuka beranda..." : "Memverifikasi..."}</> : <>Verifikasi dan masuk <ArrowRight size={18} /></>}
            </button>

            <div className="text-center text-xs">
              {cooldown > 0 ? (
                <span className="text-muted-foreground" aria-live="polite">Kirim ulang kode dalam {cooldown} detik</span>
              ) : (
                <button type="button" onClick={() => void requestOtp()} disabled={loading} className="font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50">
                  Kirim ulang kode
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={backToPhone}
              disabled={loading}
              className="mx-auto flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              <Smartphone size={14} /> Gunakan nomor WhatsApp lain
            </button>
          </div>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-primary" />
          <p>Jangan bagikan kode OTP kepada siapa pun. PANGANITA tidak akan meminta kode verifikasi Ibu melalui telepon.</p>
        </div>

        <div className="mt-5 border-t border-border/70 pt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground">
            <ArrowLeft size={15} /> Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}