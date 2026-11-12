import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { generateOtp, hashOtp, OTP_TTL_MS } from "@/lib/otp";
import { sendWhatsApp } from "@/lib/fonnte";

const RESEND_COOLDOWN_S = 60;
const MAX_REQUESTS_PER_HOUR = 5;

async function handle(req) {
  const body = await req.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  if (!phone) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 });
  }

  // Rate limit per nomor (lindungi user dari spam & kuota Fonnte dari terkuras)
  const { rows: [stat] } = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour')::int AS last_hour,
            EXTRACT(EPOCH FROM (now() - MAX(created_at)))::int AS since_last
       FROM otp_codes WHERE phone = $1`,
    [phone]
  );

  if (stat.since_last !== null && stat.since_last < RESEND_COOLDOWN_S) {
    const retryAfter = RESEND_COOLDOWN_S - stat.since_last;
    return NextResponse.json(
      { error: `Tunggu ${retryAfter} detik sebelum meminta kode lagi.`, retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  if (stat.last_hour >= MAX_REQUESTS_PER_HOUR) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi dalam 1 jam." },
      { status: 429 }
    );
  }

  const code = generateOtp();
  const { rows: [row] } = await pool.query(
    `INSERT INTO otp_codes (phone, code_hash, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [phone, hashOtp(phone, code), new Date(Date.now() + OTP_TTL_MS)]
  );

  try {
    await sendWhatsApp(
      phone,
      `*Panganita*\nKode OTP kamu: *${code}*\nBerlaku 5 menit. Jangan bagikan kode ini kepada siapa pun.`
    );
  } catch (err) {
    console.error("[request-otp]", err);
    await pool.query("DELETE FROM otp_codes WHERE id = $1", [row.id]);
    return NextResponse.json(
      { error: "Gagal mengirim OTP. Silakan coba lagi nanti." },
      { status: 502 }
    );
  }

  // Matikan OTP lama supaya hanya kode terbaru yang berlaku
  await pool.query(
    `UPDATE otp_codes SET consumed_at = now()
      WHERE phone = $1 AND id < $2 AND consumed_at IS NULL`,
    [phone, row.id]
  );

  return NextResponse.json({ ok: true, expiresIn: OTP_TTL_MS / 1000, resendAfter: RESEND_COOLDOWN_S });
}

// Bungkus supaya error tak terduga (DB, env, dll.) tetap menghasilkan JSON
// dan tercatat jelas di terminal.
export async function POST(req) {
  try {
    return await handle(req);
  } catch (err) {
    console.error("[request-otp] ERROR:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Cek log terminal untuk detailnya." },
      { status: 500 }
    );
  }
}