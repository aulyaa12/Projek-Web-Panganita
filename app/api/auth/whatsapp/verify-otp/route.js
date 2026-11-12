import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhone } from "@/lib/phone";
import { hashOtp, safeEqualHex } from "@/lib/otp";

const MAX_ATTEMPTS = 5;
// Supabase Auth butuh email. User WhatsApp diberi email "bayangan" yang tidak
// pernah dikirimi email apa pun.
const EMAIL_DOMAIN = process.env.WA_EMAIL_DOMAIN ?? "wa.panganita.app";

// Mengembalikan: "ok" | "invalid" | "expired" | "locked"
async function consumeOtp(phone, code) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // FOR UPDATE: cegah dua request paralel memakai OTP yang sama
    const { rows: [otp] } = await client.query(
      `SELECT id, code_hash, attempts FROM otp_codes
        WHERE phone = $1 AND consumed_at IS NULL AND expires_at > now()
        ORDER BY created_at DESC LIMIT 1
        FOR UPDATE`,
      [phone]
    );

    if (!otp) {
      await client.query("ROLLBACK");
      return "expired";
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await client.query("ROLLBACK");
      return "locked";
    }
    if (!safeEqualHex(otp.code_hash, hashOtp(phone, code))) {
      await client.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", [otp.id]);
      await client.query("COMMIT");
      return "invalid";
    }

    await client.query("UPDATE otp_codes SET consumed_at = now() WHERE id = $1", [otp.id]);
    await client.query("COMMIT");
    return "ok";
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const phone = normalizePhone(body?.phone);
  const code = String(body?.code ?? "").trim();
  if (!phone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Nomor atau kode tidak valid." }, { status: 400 });
  }

  let result;
  try {
    result = await consumeOtp(phone, code);
  } catch (err) {
    console.error("[verify-otp:db]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }

  if (result === "invalid")
    return NextResponse.json({ error: "Kode OTP salah." }, { status: 400 });
  if (result === "expired")
    return NextResponse.json({ error: "Kode salah atau sudah kedaluwarsa. Minta kode baru." }, { status: 400 });
  if (result === "locked")
    return NextResponse.json({ error: "Terlalu banyak percobaan. Minta kode baru." }, { status: 429 });

  // OTP benar -> pastikan user ada di Supabase, lalu minta token login sekali pakai
  try {
    const email = `${phone}@${EMAIL_DOMAIN}`;

    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { phone, login_method: "whatsapp" },
    });
    if (createErr && !/already|registered|exists/i.test(createErr.message)) throw createErr;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (error) throw error;

    // Browser menukar tokenHash ini jadi sesi lewat supabase.auth.verifyOtp
    return NextResponse.json({
      ok: true,
      tokenHash: data.properties.hashed_token,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    console.error("[verify-otp:supabase]", err);
    return NextResponse.json(
      { error: "OTP benar, tapi gagal membuat sesi. Minta kode baru dan coba lagi." },
      { status: 500 }
    );
  }
}