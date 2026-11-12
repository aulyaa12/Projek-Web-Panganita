/**
 * Helper Penyesuaian Zona Waktu Indonesia (WIB, WITA, WIT)
 * Berdasarkan Lokasi / Kota / Provinsi Profil Pengguna
 */

// Kamus pencocokan kata kunci lokasi ke Zona Waktu resmi
const WIT_KEYWORDS = [
  "papua", "papua barat", "papua selatan", "papua tengah", "papua pegunungan", "papua barat daya",
  "bintuni", "teluk bintuni", "babo", "sorong", "jayapura", "merauke", "timika", "mimika",
  "nabire", "fakfak", "manokwari", "biak", "wamena", "serui", "kaimana",
  "maluku", "maluku utara", "ambon", "ternate", "tidore", "tual", "halmahera", "bula"
];

const WITA_KEYWORDS = [
  "bali", "denpasar", "badung", "buleleng", "gianyar", "tabanan",
  "nusa tenggara", "ntt", "ntb", "kupang", "mataram", "lombok", "sumbawa", "flores", "ende", "manggarai", "alor", "roti",
  "sulawesi", "sulsel", "sulteng", "sultra", "sulut", "sulbar",
  "makassar", "gowa", "maros", "palopo", "parepare", "bone",
  "manado", "bitung", "tomohon", "minahasa", "kotamobagu",
  "palu", "poso", "donggala", "banggai", "tolitoli",
  "kendari", "bau-bau", "baubau", "kolaka", "muna",
  "mamuju", "majene", "polewali",
  "gorontalo",
  "kalimantan selatan", "kalsel", "banjarmasin", "banjarbaru", "martapura", "tanah laut", "kotabaru",
  "kalimantan timur", "kaltim", "samarinda", "balikpapan", "bontang", "kutai", "penajam", "ikn", "nusantara",
  "kalimantan utara", "kaltara", "tarakan", "nunukan", "bulungan"
];

const WIB_KEYWORDS = [
  "surakarta", "solo", "semarang", "salatiga", "magelang", "pekalongan", "tegal", "banyumas", "purwokerto", "cilacap", "kudus", "pati", "jawa tengah", "jateng",
  "surabaya", "malang", "sidoarjo", "gresik", "mojokerto", "pasuruan", "probolinggo", "kediri", "blitar", "madiun", "jember", "banyuwangi", "jawa timur", "jatim",
  "bandung", "bogor", "depok", "bekasi", "cimahi", "cirebon", "sukabumi", "tasikmalaya", "banjar", "garut", "sumedang", "subang", "purwakarta", "karawang", "cianjur", "indramayu", "jawa barat", "jabar",
  "jakarta", "dki", "jakpus", "jaksel", "jaktim", "jakbar", "jakut",
  "banten", "serang", "cilegon", "tangerang", "tangsel", "pandeglang", "lebak",
  "yogyakarta", "jogja", "jogjakarta", "sleman", "bantul", "gunungkidul", "kulon progo", "diy",
  "aceh", "banda aceh", "lhokseumawe", "langsa", "sabang",
  "sumatera utara", "sumut", "medan", "binjai", "pematangsiantar", "deli serdang", "karo", "toba",
  "sumatera barat", "sumbar", "padang", "bukittinggi", "payakumbuh", "pariaman",
  "riau", "pekanbaru", "dumai",
  "kepulauan riau", "kepri", "batam", "tanjungpinang",
  "jambi",
  "sumatera selatan", "sumsel", "palembang", "prabumulih", "lubuklinggau",
  "bengkulu",
  "lampung", "bandar lampung", "metro",
  "bangka", "belitung", "pangkalpinang",
  "kalimantan barat", "kalbar", "pontianak", "singkawang",
  "kalimantan tengah", "kalteng", "palangka raya", "palangkaraya", "sampit"
];

/**
 * Tentukan Zona Waktu (WIB, WITA, WIT) berdasarkan teks lokasi atau nama daerah
 */
export function getRegionTimezone(provinceOrLocation = "") {
  const p = (provinceOrLocation || "").toLowerCase();

  // 1. Cek Waktu Indonesia Timur (WIT - UTC+9)
  for (const kw of WIT_KEYWORDS) {
    if (p.includes(kw)) {
      return {
        timeZone: "Asia/Jayapura",
        suffix: "WIT",
      };
    }
  }

  // 2. Cek Waktu Indonesia Tengah (WITA - UTC+8)
  for (const kw of WITA_KEYWORDS) {
    if (p.includes(kw)) {
      return {
        timeZone: "Asia/Makassar",
        suffix: "WITA",
      };
    }
  }

  // 3. Cek Waktu Indonesia Barat (WIB - UTC+7)
  for (const kw of WIB_KEYWORDS) {
    if (p.includes(kw)) {
      return {
        timeZone: "Asia/Jakarta",
        suffix: "WIB",
      };
    }
  }

  // 4. Fallback ke waktu lokal browser jika di browser
  if (typeof window !== "undefined" && window.Intl) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.includes("Jayapura")) return { timeZone: "Asia/Jayapura", suffix: "WIT" };
      if (tz.includes("Makassar")) return { timeZone: "Asia/Makassar", suffix: "WITA" };
    } catch {}
  }

  // Standar nasional: Waktu Indonesia Barat (WIB - UTC+7)
  return {
    timeZone: "Asia/Jakarta",
    suffix: "WIB",
  };
}

/**
 * Ekstraksi nama lokasi/kota/provinsi jika pengguna menyebutkannya dalam teks percakapan
 * Contoh: "saya tinggal di surakarta", "di kota surakarta jam berapa?" -> "Kota Surakarta, Jawa Tengah"
 */
export function extractLocationFromText(text = "") {
  if (!text || typeof text !== "string") return null;
  const t = text.toLowerCase();

  // Pola Surakarta / Solo
  if (t.includes("surakarta") || t.includes("solo")) {
    return "Kota Surakarta, Jawa Tengah";
  }

  // Pola Papua / Bintuni
  if (t.includes("bintuni") || t.includes("teluk bintuni")) {
    return "Kab. Teluk Bintuni, Papua Barat";
  }
  if (t.includes("sorong")) return "Kota Sorong, Papua Barat Daya";
  if (t.includes("jayapura")) return "Kota Jayapura, Papua";
  if (t.includes("merauke")) return "Kab. Merauke, Papua Selatan";

  // Pola Jawa Tengah
  if (t.includes("semarang")) return "Kota Semarang, Jawa Tengah";
  if (t.includes("salatiga")) return "Kota Salatiga, Jawa Tengah";
  if (t.includes("magelang")) return "Kota Magelang, Jawa Tengah";
  if (t.includes("banyumas") || t.includes("purwokerto")) return "Kab. Banyumas, Jawa Tengah";
  if (t.includes("jawa tengah") || t.includes("jateng")) return "Jawa Tengah";

  // Pola DIY
  if (t.includes("jogja") || t.includes("yogyakarta") || t.includes("sleman") || t.includes("bantul")) {
    return "Kota Yogyakarta, DI Yogyakarta";
  }

  // Pola Jawa Timur
  if (t.includes("surabaya")) return "Kota Surabaya, Jawa Timur";
  if (t.includes("malang")) return "Kota Malang, Jawa Timur";
  if (t.includes("jawa timur") || t.includes("jatim")) return "Jawa Timur";

  // Pola Jawa Barat & Banten
  if (t.includes("bandung")) return "Kota Bandung, Jawa Barat";
  if (t.includes("bogor")) return "Kota Bogor, Jawa Barat";
  if (t.includes("bekasi")) return "Kota Bekasi, Jawa Barat";
  if (t.includes("pandeglang")) return "Kab. Pandeglang, Banten";
  if (t.includes("serang")) return "Kota Serang, Banten";
  if (t.includes("tangerang")) return "Kota Tangerang, Banten";
  if (t.includes("banten")) return "Banten";
  if (t.includes("jakarta")) return "DKI Jakarta";

  // Pola Makassar / Sulawesi
  if (t.includes("makassar")) return "Kota Makassar, Sulawesi Selatan";
  if (t.includes("manado")) return "Kota Manado, Sulawesi Utara";
  if (t.includes("palu")) return "Kota Palu, Sulawesi Tengah";
  if (t.includes("kendari")) return "Kota Kendari, Sulawesi Tenggara";

  // Pola Kalimantan
  if (t.includes("banjarmasin") || t.includes("banjarbaru")) return "Kota Banjarmasin, Kalimantan Selatan";
  if (t.includes("samarinda") || t.includes("balikpapan")) return "Kota Balikpapan, Kalimantan Timur";
  if (t.includes("pontianak")) return "Kota Pontianak, Kalimantan Barat";

  // Pola Bali & NTT/NTB
  if (t.includes("denpasar") || t.includes("bali")) return "Kota Denpasar, Bali";
  if (t.includes("kupang") || t.includes("ntt")) return "Kota Kupang, Nusa Tenggara Timur";
  if (t.includes("mataram") || t.includes("lombok") || t.includes("ntb")) return "Kota Mataram, Nusa Tenggara Barat";

  // Pola Sumatera
  if (t.includes("medan")) return "Kota Medan, Sumatera Utara";
  if (t.includes("padang")) return "Kota Padang, Sumatera Barat";
  if (t.includes("palembang")) return "Kota Palembang, Sumatera Selatan";

  return null;
}

/**
 * Format waktu lokal sesuai tanggal dan lokasi pengguna
 */
export function formatRegionTime(date = new Date(), provinceOrLocation = "") {
  const { timeZone, suffix } = getRegionTimezone(provinceOrLocation);

  try {
    const formatted = new Intl.DateTimeFormat("id-ID", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    // Pastikan separator titik dua (08:42 WIB) agar sesuai standar tampilan jam
    const normalizedTime = formatted.replace(".", ":");
    return `${normalizedTime} ${suffix}`;
  } catch (err) {
    // Fallback jika timezone invalid di browser tertentu
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} ${suffix}`;
  }
}
