/**
 * Modul Dialect Normalizer & Cross-Lingual Engine PANGANITA
 * Mendukung pemahaman dialek daerah dari seluruh pelosok Nusantara:
 * - Papua (Teluk Bintuni, Sorong, Jayapura, Merauke)
 * - Sunda (Banten, Pandeglang, Priangan, Cirebon)
 * - Jawa (Jawa Tengah, Jawa Timur, Banyumasan, Jogja/Solo)
 * - Minang & Melayu (Sumatera Barat, Riau, Jambi, Sumsel)
 * - Bugis & Makassar (Sulawesi Selatan, Barat)
 * - Banjar & Dayak (Kalimantan Selatan, Tengah, Timur)
 * - Bali, Sasak (Lombok), & NTT (Kupang, Flores, Sumba)
 * - Batak & Toba (Sumatera Utara)
 */

export const DIALECT_DICTIONARY = [
  // ==================== 1. PAPUA & INDONESIA TIMUR (Weight: 5) ====================
  { dialect: "Papua", regex: /\b(tong|tong pu|kitorang|kitorang pu)\b/gi, standard: "kami / anak kami", weight: 5 },
  { dialect: "Papua", regex: /\b(tra|traada|tada|trada)\s+(mau|makan|bisa|usah)/gi, standard: "tidak $2", weight: 5 },
  { dialect: "Papua", regex: /\b(tra|trada)\b/gi, standard: "tidak", weight: 4 },
  { dialect: "Papua", regex: /\b(de|dong)\b/gi, standard: "dia / mereka", weight: 3 },
  { dialect: "Papua", regex: /\b(kasbi)\b/gi, standard: "singkong ubi kayu", weight: 5 },
  { dialect: "Papua", regex: /\b(petatas)\b/gi, standard: "ubi jalar manis", weight: 5 },
  { dialect: "Papua", regex: /\b(keladi)\b/gi, standard: "talas", weight: 4 },
  { dialect: "Papua", regex: /\b(papeda)\b/gi, standard: "bubur sagu karbohidrat", weight: 5 },
  { dialect: "Papua", regex: /\b(ikan kuah kuning)\b/gi, standard: "sup ikan bumbu kuning berkuah kaya rempah", weight: 5 },
  { dialect: "Papua", regex: /\b(kaskado)\b/gi, standard: "gangguan kulit gatal alergi", weight: 5 },
  { dialect: "Papua", regex: /\b(molo)\b/gi, standard: "menyelam mencari ikan", weight: 5 },
  { dialect: "Papua", regex: /\b(bagaimana e|ka apa|iyo ka)\b/gi, standard: "bagaimana caranya ya", weight: 5 },

  // ==================== 2. SUNDA (BANTEN & JAWA BARAT) (Weight: 5) ====================
  { dialect: "Sunda", regex: /\b(budak leutik|orok|murangkalih)\b/gi, standard: "bayi anak balita", weight: 5 },
  { dialect: "Sunda", regex: /\b(abdi|simkuring|urang)\b/gi, standard: "saya", weight: 4 },
  { dialect: "Sunda", regex: /\b(embung|alim|teu purun)\s+(tuang|neda|emam|makan)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "Sunda", regex: /\b(embung|alim|teu purun)\b/gi, standard: "tidak mau", weight: 4 },
  { dialect: "Sunda", regex: /\b(tuang|neda|emam)\b/gi, standard: "makan", weight: 4 },
  { dialect: "Sunda", regex: /\b(panas tiris|haredang)\b/gi, standard: "demam panas dingin meriang", weight: 5 },
  { dialect: "Sunda", regex: /\b(lauk lele|lauk kembung|lauk mas|lauk mujair)\b/gi, standard: "ikan lele kembung air tawar", weight: 5 },
  { dialect: "Sunda", regex: /\b(lauk)\b/gi, standard: "ikan protein hewani", weight: 3 },
  { dialect: "Sunda", regex: /\b(kumaha atuh|kumaha carana|kumaha ieu)\b/gi, standard: "bagaimana solusinya", weight: 5 },
  { dialect: "Sunda", regex: /\b(sae teu|sae henteu|sae pami)\b/gi, standard: "apakah bagus dan aman jika", weight: 5 },
  { dialect: "Sunda", regex: /\b(tiasa|tiasa teu)\b/gi, standard: "apakah bisa", weight: 4 },
  { dialect: "Sunda", regex: /\b(tahan sabaraha dinten|kuat sabaraha lami)\b/gi, standard: "tahan berapa hari masa simpan", weight: 5 },
  { dialect: "Sunda", regex: /\b(sayur lompong)\b/gi, standard: "sayur batang talas kaya serat", weight: 5 },

  // ==================== 3. JAWA (JATENG, JATIM, DIY, BANYUMAS) (Weight: 5) ====================
  { dialect: "Jawa", regex: /\b(anak kulo|lare kulo|bocah kulo|thole|genduk|lare|bocah)\b/gi, standard: "anak balita saya", weight: 5 },
  { dialect: "Jawa", regex: /\b(kulo|kula|nyong)\b/gi, standard: "saya", weight: 5 },
  { dialect: "Jawa", regex: /\b(mboten purun|ra gelem|mboten kersa|ora gelem)\s+(nedha|maem|mangan)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "Jawa", regex: /\b(mboten purun|ra gelem|ora gelem|mboten kersa)\b/gi, standard: "tidak mau", weight: 5 },
  { dialect: "Jawa", regex: /\b(mboten|ora)\b/gi, standard: "tidak", weight: 4 },
  { dialect: "Jawa", regex: /\b(nedha|maem|mangan)\b/gi, standard: "makan MPASI", weight: 4 },
  { dialect: "Jawa", regex: /\b(awake anget|awake sumer|gerah panas|panas sanget|awake panas)\b/gi, standard: "badan demam panas", weight: 5 },
  { dialect: "Jawa", regex: /\b(lemes sanget|nglentruk)\b/gi, standard: "lemas lesu tidak bertenaga", weight: 5 },
  { dialect: "Jawa", regex: /\b(sekul)\b/gi, standard: "nasi bubur", weight: 5 },
  { dialect: "Jawa", regex: /\b(jangan kelor|bobor kelor|jangan bening)\b/gi, standard: "sayur bening daun kelor", weight: 5 },
  { dialect: "Jawa", regex: /\b(pripun nggih|kados pundi|kepriye carane|pripun)\b/gi, standard: "bagaimana caranya dan rekomendasinya", weight: 5 },
  { dialect: "Jawa", regex: /\b(sae mboten|sae nopo mboten)\b/gi, standard: "bagus dan aman atau tidak", weight: 5 },
  { dialect: "Jawa", regex: /\b(awet pinten dinten|tahan pirang dino)\b/gi, standard: "tahan disimpan berapa hari", weight: 5 },
  { dialect: "Jawa", regex: /\b(nggih|menawi|ingkang)\b/gi, standard: "ya / jika / yang", weight: 4 },

  // ==================== 4. MINANG & MELAYU SUMATERA (Weight: 5) ====================
  { dialect: "Minang", regex: /\b(anak ambo|anak den)\b/gi, standard: "anak saya", weight: 5 },
  { dialect: "Minang", regex: /\b(ambo|aden)\b/gi, standard: "saya", weight: 4 },
  { dialect: "Minang", regex: /\b(indak namuah|indak amuah|ndak nio)\s+(makan|maem)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "Minang", regex: /\b(indak namuah|ndak nio|indak amuah)\b/gi, standard: "tidak mau", weight: 4 },
  { dialect: "Minang", regex: /\b(dingin manggigia|paneh badannyo|damam)\b/gi, standard: "demam panas dingin menggigil", weight: 5 },
  { dialect: "Minang", regex: /\b(baa caronyo|baa caro|ba a caronyo)\b/gi, standard: "bagaimana caranya", weight: 5 },
  { dialect: "Minang", regex: /\b(rancak|rancak bana|rancak indak)\b/gi, standard: "bagus dan bergizi", weight: 5 },
  { dialect: "Minang", regex: /\b(tahan barapo ari|tahan bara hari)\b/gi, standard: "tahan berapa hari simpan", weight: 5 },
  { dialect: "Minang", regex: /\b(pangek ikan|gulai ikan)\b/gi, standard: "olahan sup ikan bumbu rempah kuning", weight: 5 },

  // ==================== 5. BUGIS & MAKASSAR (Weight: 5) ====================
  { dialect: "Makassar", regex: /\b(anakkong|anana|ana-ana)\b/gi, standard: "anak balita saya", weight: 5 },
  { dialect: "Makassar", regex: /\b(teai|tena naero)\s+(manre|nganre)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "Makassar", regex: /\b(teai|tena naero)\b/gi, standard: "tidak mau", weight: 4 },
  { dialect: "Makassar", regex: /\b(manre|nganre)\b/gi, standard: "makan", weight: 4 },
  { dialect: "Makassar", regex: /\b(mamburisi|bambang kale|garring)\b/gi, standard: "demam panas badan meriang", weight: 5 },
  { dialect: "Makassar", regex: /\b(juku|bale|peje)\b/gi, standard: "ikan protein hewani", weight: 4 },
  { dialect: "Makassar", regex: /\b(baiko narekko|antekamma carana|pakkua carana)\b/gi, standard: "bagaimana caranya apakah baik jika", weight: 5 },
  { dialect: "Makassar", regex: /\b(siaga allona tahan|siapa allona)\b/gi, standard: "tahan berapa hari simpan", weight: 5 },

  // ==================== 6. BANJAR (KALIMANTAN) (Weight: 5) ====================
  // Kata khas Banjar: ulun, kakanakan, kada hakun, haruan, kayapa
  { dialect: "Banjar", regex: /\b(anak ulun|kakanakan ulun|kakanakan)\b/gi, standard: "anak balita saya", weight: 5 },
  { dialect: "Banjar", regex: /\b(ulun)\b/gi, standard: "saya", weight: 5 },
  { dialect: "Banjar", regex: /\b(kada hakun|kada handak)\s+(makan|mamamah)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "Banjar", regex: /\b(kada hakun|kada handak|kada kawa|kada)\b/gi, standard: "tidak mau", weight: 4 },
  { dialect: "Banjar", regex: /\b(panas awak|garing)\b/gi, standard: "demam panas badan sakit", weight: 5 },
  { dialect: "Banjar", regex: /\b(iwak haruan)\b/gi, standard: "ikan gabus protein hewani", weight: 5 },
  { dialect: "Banjar", regex: /\b(kayapa caranya|kayapa ninih)\b/gi, standard: "bagaimana caranya", weight: 5 },
  { dialect: "Banjar", regex: /\b(tahan barapa hari|bisa tahan lawas)\b/gi, standard: "tahan berapa hari simpan", weight: 5 },

  // ==================== 7. BALI & NUSA TENGGARA (NTB/NTT) (Weight: 5) ====================
  { dialect: "NusaTenggara", regex: /\b(panak tiange|pianak|anake)\b/gi, standard: "anak saya", weight: 5 },
  { dialect: "NusaTenggara", regex: /\b(tusing nyak|sing nyak)\s+(madaar|makan)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "NusaTenggara", regex: /\b(sonde mau|sonde bisa)\s+(makan)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "NusaTenggara", regex: /\b(sonde)\b/gi, standard: "tidak", weight: 4 },
  { dialect: "NusaTenggara", regex: /\b(marungga)\b/gi, standard: "daun kelor kaya zat besi", weight: 5 },
  { dialect: "NusaTenggara", regex: /\b(ikan kuah asam)\b/gi, standard: "sup ikan kuah asam segar bebas duri", weight: 4 },
  { dialect: "NusaTenggara", regex: /\b(karmana su|kenken carane)\b/gi, standard: "bagaimana caranya", weight: 5 },

  // ==================== 8. BATAK & TOBA (SUMUT) (Weight: 5) ====================
  { dialect: "Batak", regex: /\b(dakdanak|anakhu|anakkon)\b/gi, standard: "anak balita saya", weight: 5 },
  { dialect: "Batak", regex: /\b(ndang olo|dang olo)\s+(mangan)/gi, standard: "GTM tidak mau makan", weight: 5 },
  { dialect: "Batak", regex: /\b(ndang|dang)\b/gi, standard: "tidak", weight: 4 },
  { dialect: "Batak", regex: /\b(mangan)\b/gi, standard: "makan", weight: 4 },
  { dialect: "Batak", regex: /\b(mohop pamatang|hansit)\b/gi, standard: "demam panas badan sakit", weight: 5 },
  { dialect: "Batak", regex: /\b(dengke|dekke)\b/gi, standard: "ikan protein hewani", weight: 5 },
  { dialect: "Batak", regex: /\b(songondia dalanna|boha carana)\b/gi, standard: "bagaimana caranya", weight: 5 }
];

/**
 * Normalisasi teks pertanyaan dalam dialek nusantara apapun
 * Menggunakan sistem Weighted Confidence Scoring agar dialek Jawa tidak tertukar Banjar
 */
export function normalizeDialectText(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return {
      rawText: "",
      normalizedText: "",
      detectedDialects: [],
      localCommodities: [],
      greetings: "Ibu",
      isDialectDetected: false
    };
  }

  let text = rawText;
  const dialectScores = {};
  const localCommodities = [];

  // 1. Eksekusi mapping kamus dialek dengan pembobotan skor akurat
  DIALECT_DICTIONARY.forEach((entry) => {
    // Reset regex index
    entry.regex.lastIndex = 0;
    if (entry.regex.test(text)) {
      const weight = entry.weight || 3;
      dialectScores[entry.dialect] = (dialectScores[entry.dialect] || 0) + weight;
      entry.regex.lastIndex = 0;
      text = text.replace(entry.regex, entry.standard);
    }
  });

  // Urutkan dialek berdasarkan skor tertinggi
  const sortedDialects = Object.entries(dialectScores)
    .sort((a, b) => b[1] - a[1]);

  // Ambil hanya pemenang skor tertinggi (atau dialek dengan skor signifikan)
  let detectedDialects = [];
  if (sortedDialects.length > 0) {
    const topScore = sortedDialects[0][1];
    // Hanya masukkan dialek yang skornya minimal 60% dari top score dan >= 4
    detectedDialects = sortedDialects
      .filter(([_, score]) => score >= 4 && score >= topScore * 0.6)
      .map(([dialect]) => dialect);
  }

  // 2. Deteksi komoditas spesifik pangan nusantara
  const lowerText = (rawText + " " + text).toLowerCase();
  if (lowerText.includes("lele")) localCommodities.push("ikan lele");
  if (lowerText.includes("kembung")) localCommodities.push("ikan kembung");
  if (lowerText.includes("tongkol")) localCommodities.push("ikan tongkol");
  if (lowerText.includes("gurame")) localCommodities.push("ikan gurame");
  if (lowerText.includes("kelor") || lowerText.includes("marungga")) localCommodities.push("daun kelor");
  if (lowerText.includes("sagu") || lowerText.includes("papeda")) localCommodities.push("sagu pekarangan");
  if (lowerText.includes("kasbi") || lowerText.includes("singkong")) localCommodities.push("singkong");
  if (lowerText.includes("petatas") || lowerText.includes("ubi jalar") || lowerText.includes("ubi")) localCommodities.push("ubi jalar");
  if (lowerText.includes("lompong") || lowerText.includes("keladi")) localCommodities.push("talas lompong");
  if (lowerText.includes("abon")) localCommodities.push("abon ikan lele");
  if (lowerText.includes("telur")) localCommodities.push("telur ayam ras");
  if (lowerText.includes("udang")) localCommodities.push("udang segar");
  if (lowerText.includes("bayam")) localCommodities.push("bayam hijau");
  if (lowerText.includes("kangkung")) localCommodities.push("kangkung");
  if (lowerText.includes("jagung")) localCommodities.push("jagung manis");
  if (lowerText.includes("pisang")) localCommodities.push("pisang");
  if (lowerText.includes("tomat")) localCommodities.push("tomat");
  if (lowerText.includes("naga")) localCommodities.push("buah naga");
  if (lowerText.includes("wortel")) localCommodities.push("wortel");

  // 3. Tentukan sapaan hangat berbasis dialek pemenang
  const primaryDialect = detectedDialects[0] || "";
  let greetings = "Ibu";
  if (primaryDialect === "Papua") greetings = "Mama";
  else if (primaryDialect === "Sunda") greetings = "Ibu / Teteh";
  else if (primaryDialect === "Jawa") greetings = "Ibu / Mbak";
  else if (primaryDialect === "Minang") greetings = "Ibu / Uni";
  else if (primaryDialect === "Makassar") greetings = "Ibu / Daeng";
  else if (primaryDialect === "Banjar") greetings = "Ibu / Acil";
  else if (primaryDialect === "NusaTenggara") greetings = "Mama";
  else if (primaryDialect === "Batak") greetings = "Inang";

  return {
    rawText,
    normalizedText: text.replace(/\s+/g, " ").trim(),
    detectedDialects,
    localCommodities: Array.from(new Set(localCommodities)),
    greetings,
    isDialectDetected: detectedDialects.length > 0
  };
}
