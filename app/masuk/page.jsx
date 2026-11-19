"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LogIn,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;
const emptyDigits = () => Array.from({ length: OTP_LENGTH }, () => "");

// Gaya kartu sama dengan halaman Beranda dan Profil.
const KARTU =
  "rounded-3xl border border-[#D5E2D2] bg-white shadow-[0_5px_25px_rgba(30,77,48,0.07)]";

const TAUTAN_PERSETUJUAN =
  "font-semibold text-[#1B4D2B] underline underline-offset-4 hover:text-[#3E8E1F]";

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

export default function HalamanMasuk() {
  const router = useRouter();
  // Pakai klien yang sama dengan AppNav dan halaman lain, supaya sesi tersimpan
  // di tempat yang sama dan logout benar-benar menghapusnya.
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(emptyDigits);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  // Persetujuan Kebijakan Privasi serta Syarat dan Ketentuan
  const [agreed, setAgreed] = useState(false);
  const inputsRef = useRef([]);
  // Pengunci sinkron: mencegah verifyOtp berjalan dua kali (state loading terlalu lambat)
  const submittingRef = useRef(false);

  const code = digits.join("");

  // Hitung mundur sebelum pengguna dapat meminta kode OTP lagi.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function requestOtp(event) {
    event?.preventDefault();
    if (loading) return;

    // Persetujuan hanya diminta di langkah 1. Tombol "Kirim ulang kode" di langkah 2
    // juga memanggil fungsi ini, dan persetujuan sudah diberikan sebelumnya.
    if (step === 1 && !agreed) {
      setError("Centang persetujuan Kebijakan Privasi serta Syarat dan Ketentuan dahulu ya, Bu.");
      return;
    }

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

  function changeDigit(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    if (digit && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    setError("");
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
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

  const pesanError = error && (
    <p
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-3 text-base font-medium leading-relaxed text-red-800"
    >
      {error}
    </p>
  );

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col justify-center px-3 pb-8 pt-4 sm:min-h-[calc(100dvh-7.5rem)] sm:px-6 sm:pb-12 sm:pt-6">
      {/*
        Area logo: lebar penuh mengikuti kartu. Komponen Logo tetap mengatur
        sendiri logo lengkap atau ikon saja sesuai lebar layar; di sini hanya
        tinggi gambarnya yang diperbesar.
      */}
      <div className="mb-5 flex w-full justify-center sm:mb-6 [&_img]:h-[4.5rem] [&_img]:w-auto [&_img]:max-w-full sm:[&_img]:h-24">
        <Logo priority />
      </div>

      <div className={cn(KARTU, "p-4 sm:p-8")}>
        {/* Kepala kartu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/images/maskot-bu-nita.png"
            alt="Bu Nita menyapa"
            width={420}
            height={420}
            priority
            className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
          />
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-[#3E8E1F]">
              <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
              Masuk dengan WhatsApp
            </p>
            <h1 className="text-2xl font-extrabold leading-tight text-[#0F2D1A]">
              {step === 1 ? "Selamat datang, Ibu" : "Verifikasi nomor Ibu"}
            </h1>
          </div>
        </div>

        <p className="mt-3 text-base leading-relaxed text-[#53665a]">
          {step === 1
            ? "Masuk untuk mengatur hasil panen keluarga."
            : `Masukkan kode 6 digit yang dikirim ke WhatsApp ${phone}.`}
        </p>

        {/* Penanda langkah */}
        <div
          className="mt-5 flex items-center justify-center gap-3"
          aria-label={`Langkah ${step} dari 2`}
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
              step === 1 ? "bg-[#1B4D2B] text-white" : "bg-[#EAF1E8] text-[#1B4D2B]",
            )}
          >
            1
          </span>
          <span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-[#D5E2D2]" />
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
              step === 2 ? "bg-[#1B4D2B] text-white" : "bg-[#F4F7F2] text-[#53665a]",
            )}
          >
            2
          </span>
        </div>

        {step === 1 ? (
          <form onSubmit={requestOtp} className="mt-6 space-y-4" noValidate>
            {/* 1. Isi nomor */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-base font-semibold text-[#0F2D1A]">
                Nomor WhatsApp
              </label>
              <div className="flex h-14 items-center rounded-xl border-2 border-[#1B4D2B] bg-white px-3 transition focus-within:border-[#3E8E1F] focus-within:ring-2 focus-within:ring-[#3E8E1F]/30">
                <Phone aria-hidden="true" className="h-5 w-5 shrink-0 text-[#53665a]" />
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
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-lg text-[#0F2D1A] outline-none placeholder:text-[#53665a]/60 disabled:opacity-60"
                />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#53665a]">
                Pastikan nomor WhatsApp aktif dan dapat menerima pesan.
              </p>
            </div>

            {/* 2. Centang persetujuan */}
            <label
              htmlFor="setuju"
              className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border-2 border-[#D5E2D2] p-3 text-sm leading-relaxed text-[#26352b] transition-colors has-[:checked]:border-[#3E8E1F] has-[:checked]:bg-[#EAF1E8] sm:p-4 sm:text-base"
            >
              <input
                id="setuju"
                type="checkbox"
                checked={agreed}
                onChange={(event) => {
                  setAgreed(event.target.checked);
                  setError("");
                }}
                disabled={loading}
                className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[#3E8E1F] disabled:opacity-60"
              />
              <span>
                Saya telah membaca dan setuju dengan{" "}
                <Link
                  href="/kebijakan-privasi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={TAUTAN_PERSETUJUAN}
                >
                  Kebijakan Privasi
                </Link>{" "}
                serta{" "}
                <Link
                  href="/syarat-dan-ketentuan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={TAUTAN_PERSETUJUAN}
                >
                  Syarat dan Ketentuan
                </Link>{" "}
                Panganita.
              </span>
            </label>

            {pesanError}

            {/* 3. Kirim kode */}
            <PrimaryButton
              type="submit"
              lebarPenuh
              ikon={Send}
              sedangMemuat={loading}
              disabled={!agreed || phone.replace(/\D/g, "").length < 9}
            >
              {loading ? "Mengirim kode..." : "Kirim kode ke WhatsApp"}
            </PrimaryButton>
          </form>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="otp-0" className="mb-3 block text-base font-semibold text-[#0F2D1A]">
                Kode OTP
              </label>
              <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    ref={(element) => {
                      inputsRef.current[index] = element;
                    }}
                    value={digit}
                    onChange={(event) => changeDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onFocus={(event) => event.target.select()}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    disabled={loading}
                    aria-label={`Digit ${index + 1} dari ${OTP_LENGTH}`}
                    className="h-14 w-full min-w-0 rounded-xl border-2 border-[#1B4D2B] bg-white text-center text-2xl font-bold text-[#0F2D1A] outline-none transition focus:border-[#3E8E1F] focus:ring-2 focus:ring-[#3E8E1F]/30 disabled:opacity-60"
                  />
                ))}
              </div>
            </div>

            {pesanError}

            <PrimaryButton
              lebarPenuh
              ikon={LogIn}
              sedangMemuat={loading}
              disabled={code.length !== OTP_LENGTH}
              onClick={() => void verifyOtp()}
            >
              {loading
                ? success
                  ? "Berhasil, membuka beranda..."
                  : "Memverifikasi..."
                : "Verifikasi dan masuk"}
            </PrimaryButton>

            <div className="text-center text-base">
              {cooldown > 0 ? (
                <span className="text-[#53665a]" aria-live="polite">
                  Kirim ulang kode dalam {cooldown} detik
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void requestOtp()}
                  disabled={loading}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 font-semibold text-[#1B4D2B] underline underline-offset-4 transition-colors hover:text-[#3E8E1F] disabled:opacity-50"
                >
                  Kirim ulang kode
                </button>
              )}
            </div>

            <SecondaryButton
              lebarPenuh
              ikon={Smartphone}
              disabled={loading}
              onClick={backToPhone}
            >
              Gunakan nomor WhatsApp lain
            </SecondaryButton>
          </div>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#F4F7F2] p-3 text-sm leading-relaxed text-[#53665a]">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#3E8E1F]" />
          <p>
            Jangan bagikan kode OTP kepada siapa pun. PANGANITA tidak akan
            meminta kode verifikasi Ibu melalui telepon.
          </p>
        </div>

        <div className="mt-5 border-t border-[#D5E2D2] pt-4">
          <SecondaryButton href="/" lebarPenuh ikon={ArrowLeft} className="border-transparent shadow-none">
            Kembali ke Beranda
          </SecondaryButton>
        </div>
      </div>
    </main>
  );
}