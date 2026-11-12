// Menerima: 08123456789, +628123456789, 628123456789, 0812-3456-789
// Mengembalikan: 628123456789 (atau null kalau tidak valid)
export function normalizePhone(input) {
  if (typeof input !== "string") return null;
  let p = input.replace(/[\s\-().]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "62" + p.slice(1);
  return /^628\d{7,12}$/.test(p) ? p : null;
}
