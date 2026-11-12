import crypto from "node:crypto";

export const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit

// crypto.randomInt aman secara kriptografi (Math.random TIDAK aman untuk OTP)
export function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// OTP disimpan sebagai hash, jadi kalau database bocor kodenya tidak terbaca
export function hashOtp(phone, code) {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${phone}:${code}`)
    .digest("hex");
}

export function safeEqualHex(a, b) {
  const A = Buffer.from(a, "hex");
  const B = Buffer.from(b, "hex");
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}
