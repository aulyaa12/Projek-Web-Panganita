// Dokumentasi: https://docs.fonnte.com
export async function sendWhatsApp(target, message) {
  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_TOKEN,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ target, message }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.status !== true) {
    throw new Error(`Fonnte gagal kirim: ${data?.reason ?? `HTTP ${res.status}`}`);
  }
  return data;
}
