"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Camera,
  Upload,
  ScanSearch,
  CheckCircle2,
  Search,
  X,
  Sprout,
  Wheat,
  LoaderCircle,
  ArrowLeft,
  ArrowRight,
  Leaf,
  Wallet,
  Scale,
  CalendarDays,
  Info,
  Sparkles,
} from "lucide-react";

import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

import { ambilAlternatif, simpanKeputusan } from "@/actions/keputusan";

const BUCKET_FOTO = "hasil-panen";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const NUTRISI = [
  {
    key: "energi_kkal_per_100g_bdd",
    label: "Energi",
    unit: "kkal",
  },
  {
    key: "protein_g_per_100g_bdd",
    label: "Protein",
    unit: "g",
  },
  {
    key: "lemak_g_per_100g_bdd",
    label: "Lemak",
    unit: "g",
  },
  {
    key: "serat_g_per_100g_bdd",
    label: "Serat",
    unit: "g",
  },
  {
    key: "kalsium_mg_per_100g_bdd",
    label: "Kalsium",
    unit: "mg",
  },
  {
    key: "vitamin_c_mg_per_100g_bdd",
    label: "Vitamin C",
    unit: "mg",
  },
];

const REKOMENDASI = {
  prioritas_gizi: {
    judul: "Prioritas Gizi",
    subjudul: "Utamakan persediaan keluarga",
    penjelasan:
      "Porsi simpan lebih diutamakan agar keluarga memiliki persediaan pangan untuk periode yang direncanakan. Pertimbangkan pilihan ini ketika kebutuhan konsumsi keluarga menjadi prioritas.",
    icon: Leaf,
  },
  seimbang: {
    judul: "Seimbang",
    subjudul: "Simpan dan jual secara proporsional",
    penjelasan:
      "Membagi hasil panen antara persediaan keluarga dan penjualan. Pilihan ini mempertimbangkan kebutuhan pangan sekaligus peluang memperoleh pemasukan.",
    icon: Scale,
  },
  prioritas_uang: {
    judul: "Prioritas Uang",
    subjudul: "Utamakan pemasukan",
    penjelasan:
      "Porsi penjualan lebih diutamakan untuk memperoleh pemasukan. Pastikan keluarga tetap memiliki sumber pangan yang cukup dari persediaan atau bahan pangan lainnya.",
    icon: Wallet,
  },
};

const URUTAN_REKOMENDASI = ["prioritas_gizi", "seimbang", "prioritas_uang"];

function formatAngka(value, maksimum = 1) {
  if (value === null || value === undefined || value === "") {
    return "Belum tersedia";
  }

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maksimum,
  }).format(Number(value));
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatKg(value) {
  return `${formatAngka(value, 2)} kg`;
}

function normalisasiLabel(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function cocokkanPangan(counts, bahan) {
  const kandidat = Object.entries(counts || {}).sort(
    (a, b) => Number(b[1]) - Number(a[1]),
  );

  for (const [label] of kandidat) {
    const ditemukan = bahan.find(
      (item) =>
        normalisasiLabel(item.nama_kelas_cv) === normalisasiLabel(label),
    );

    if (ditemukan) return ditemukan;
  }

  return null;
}

export function PindaiForm({ bahan, hariDefault }) {
  const router = useRouter();

  const inputGaleriRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [kameraTerbuka, setKameraTerbuka] = useState(false);
  const [kameraMemuat, setKameraMemuat] = useState(false);

  const [tahap, setTahap] = useState(1);

  const [fileFoto, setFileFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [sedangDeteksi, setSedangDeteksi] = useState(false);
  const [hasilDeteksi, setHasilDeteksi] = useState(null);

  const [bahanId, setBahanId] = useState(null);
  const [kataKunci, setKataKunci] = useState("");
  const [pencarianTerbuka, setPencarianTerbuka] = useState(false);

  const [berat, setBerat] = useState("");
  const [harga, setHarga] = useState("");
  const [hari, setHari] = useState(Math.max(1, Number(hariDefault) || 1));

  const [hasilHitung, setHasilHitung] = useState(null);

  const [sedangHitung, setSedangHitung] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [keputusanDipilih, setKeputusanDipilih] = useState(null);

  const panganTerpilih = useMemo(
    () => bahan.find((item) => item.id === bahanId) || null,
    [bahan, bahanId],
  );

  const hasilPencarian = useMemo(() => {
    const q = normalisasiLabel(kataKunci);

    if (!q) return bahan.slice(0, 6);

    return bahan
      .filter((item) => normalisasiLabel(item.nama).includes(q))
      .slice(0, 8);
  }, [bahan, kataKunci]);

  // Membuat dan membersihkan preview foto.
  useEffect(() => {
    if (!fileFoto) {
      setPreviewFoto("");
      return;
    }

    const url = URL.createObjectURL(fileFoto);
    setPreviewFoto(url);

    return () => URL.revokeObjectURL(url);
  }, [fileFoto]);

  // Menampilkan stream kamera setelah elemen video tersedia.
  useEffect(() => {
    if (!kameraTerbuka || !streamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const stream = streamRef.current;

    video.srcObject = stream;

    video.play().catch((error) => {
      // AbortError dapat terjadi ketika kamera ditutup saat video mulai diputar.
      if (error?.name !== "AbortError") {
        console.error("[PUTAR KAMERA]", error);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setKameraTerbuka(false);
        toast.error("Pratinjau kamera tidak dapat ditampilkan.");
      }
    });

    return () => {
      video.pause();
      video.srcObject = null;
    };
  }, [kameraTerbuka]);

  // Pastikan kamera selalu dimatikan ketika halaman/komponen ditinggalkan.
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  function pilihFoto(file) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Ukuran foto maksimal 8 MB.");
      return;
    }

    setFileFoto(file);
    setHasilDeteksi(null);
    setBahanId(null);
    setKataKunci("");
    setHasilHitung(null);
    setKeputusanDipilih(null);
    setTahap(1);
  }

  // Membuka kamera perangkat secara langsung, bukan membuka pemilih file.
  async function bukaKamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        "Kamera tidak didukung browser ini. Gunakan HTTPS atau localhost.",
      );
      return;
    }

    setKameraMemuat(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setKameraTerbuka(true);
    } catch (error) {
      console.error("[BUKA KAMERA]", error);

      if (
        error?.name === "NotAllowedError" ||
        error?.name === "PermissionDeniedError"
      ) {
        toast.error("Izin kamera ditolak. Izinkan akses kamera pada browser.");
      } else if (
        error?.name === "NotFoundError" ||
        error?.name === "DevicesNotFoundError"
      ) {
        toast.error("Kamera tidak ditemukan pada perangkat ini.");
      } else if (
        error?.name === "NotReadableError" ||
        error?.name === "TrackStartError"
      ) {
        toast.error(
          "Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.",
        );
      } else {
        toast.error(
          "Kamera tidak dapat dibuka. Periksa izin dan koneksi kamera.",
        );
      }
    } finally {
      setKameraMemuat(false);
    }
  }

  // Menghentikan seluruh track agar kamera tidak terus aktif di latar belakang.
  function tutupKamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setKameraTerbuka(false);
  }

  // Mengambil satu frame dari video kamera dan menjadikannya file foto.
  function tangkapFoto() {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Kamera belum siap. Tunggu sampai gambar terlihat.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ukuranAsliTerbesar = Math.max(video.videoWidth, video.videoHeight);
    const skala = Math.min(1, 1920 / ukuranAsliTerbesar);

    canvas.width = Math.round(video.videoWidth * skala);
    canvas.height = Math.round(video.videoHeight * skala);

    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Foto tidak dapat diproses pada perangkat ini.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Gagal mengambil foto. Silakan coba kembali.");
          return;
        }

        if (blob.size > MAX_UPLOAD_BYTES) {
          toast.error("Ukuran foto melebihi 8 MB. Silakan ambil foto ulang.");
          return;
        }

        const file = new File([blob], `panen-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        pilihFoto(file);
        tutupKamera();
        toast.success("Foto berhasil diambil.");
      },
      "image/jpeg",
      0.85,
    );
  }

  function hapusFoto() {
    setFileFoto(null);
    setHasilDeteksi(null);
    setBahanId(null);
    setKataKunci("");
    setHasilHitung(null);
    setKeputusanDipilih(null);

    if (inputGaleriRef.current) {
      inputGaleriRef.current.value = "";
    }
  }

  // Mengirim foto ke API Next.js, lalu diteruskan ke FastAPI.
  async function jalankanDeteksi() {
    if (!fileFoto) {
      toast.error("Ambil atau unggah foto hasil panen terlebih dahulu.");
      return;
    }

    setSedangDeteksi(true);
    setHasilDeteksi(null);
    setBahanId(null);
    setKataKunci("");

    try {
      const formData = new FormData();
      formData.append("file", fileFoto);

      const response = await fetch("/api/vision/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Pangan belum berhasil diidentifikasi.");
      }

      setHasilDeteksi(data);

      // Pencocokan kelas AI dengan katalog Supabase.
      const ditemukan = cocokkanPangan(data.counts, bahan);

      if (ditemukan) {
        pilihBahan(ditemukan);
        toast.success("Pangan berhasil diidentifikasi.");
      } else {
        toast.warning(
          "Jenis pangan belum cocok dengan katalog. Silakan cari secara manual.",
        );
      }
    } catch (error) {
      console.error("[DETEKSI PANGAN]", error);

      toast.error(error.message || "Terjadi kesalahan saat mendeteksi pangan.");
    } finally {
      setSedangDeteksi(false);
    }
  }

  function pilihBahan(item) {
    setBahanId(item.id);
    setKataKunci(item.nama);
    setPencarianTerbuka(false);
    setHasilHitung(null);

    setHarga(
      item.harga_umum_per_kg != null ? String(item.harga_umum_per_kg) : "",
    );
  }

  // Validasi data sebelum perhitungan.
  function validasiInput() {
    if (!fileFoto || !hasilDeteksi) {
      toast.error("Identifikasi foto pangan terlebih dahulu.");
      return null;
    }

    if (!panganTerpilih) {
      toast.error("Pilih atau koreksi nama pangan terlebih dahulu.");
      return null;
    }

    const beratKg = Number(berat.replace(",", "."));

    if (!Number.isFinite(beratKg) || beratKg <= 0) {
      toast.error("Masukkan berat panen yang valid.");
      return null;
    }

    const hargaPerKg = Number(harga.replace(/[^\d]/g, ""));

    if (!Number.isFinite(hargaPerKg) || harga.trim() === "") {
      toast.error("Masukkan harga pasar per kilogram.");
      return null;
    }

    if (!Number.isInteger(Number(hari)) || Number(hari) < 1) {
      toast.error("Lama cadangan minimal 1 hari.");
      return null;
    }

    return {
      bahanId: panganTerpilih.id,
      beratPanenKg: beratKg,
      hargaJualPerKg: hargaPerKg,
      hariDisediakan: Number(hari),
    };
  }

  // Tahap pertama menuju layar rekomendasi.
  async function hitungPembagian() {
    const input = validasiInput();

    if (!input) return;

    setSedangHitung(true);

    try {
      const response = await ambilAlternatif(input);

      if (!response.ok) {
        throw new Error(response.pesan);
      }

      setHasilHitung(response.data);
      setTahap(2);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("[HITUNG PANEN]", error);
      toast.error(error.message || "Perhitungan gagal.");
    } finally {
      setSedangHitung(false);
    }
  }

  // Upload foto asli untuk riwayat panen.
  async function unggahFotoAsli() {
    if (!fileFoto) {
      throw new Error("Foto hasil panen tidak ditemukan.");
    }

    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Sesi login tidak valid. Silakan masuk kembali.");
    }

    const ekstensi = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[fileFoto.type];

    const path = `${user.id}/${crypto.randomUUID()}.${ekstensi}`;

    const { error } = await supabase.storage
      .from(BUCKET_FOTO)
      .upload(path, fileFoto, {
        cacheControl: "3600",
        contentType: fileFoto.type,
        upsert: false,
      });

    if (error) {
      console.error("[UPLOAD FOTO]", error);
      throw new Error("Foto gagal disimpan. Silakan coba kembali.");
    }

    return {
      path,
      tipeMime: fileFoto.type,
      ukuranByte: fileFoto.size,
    };
  }

  // Simpan hanya satu keputusan yang dipilih pengguna.
  async function simpanPilihan(keputusan) {
    const input = validasiInput();

    if (!input) return;

    setKeputusanDipilih(keputusan);
    setSedangSimpan(true);

    try {
      const foto = await unggahFotoAsli();

      const response = await simpanKeputusan({
        ...input,
        keputusan,
        foto,
      });

      if (!response.ok) {
        throw new Error(response.pesan);
      }

      toast.success("Keputusan panen berhasil disimpan.");

      router.push("/riwayat");
      router.refresh();
    } catch (error) {
      console.error("[SIMPAN KEPUTUSAN]", error);
      setKeputusanDipilih(null);
      toast.error(error.message || "Keputusan gagal disimpan.");
    } finally {
      setSedangSimpan(false);
    }
  }

  const alternatif = hasilHitung?.alternatif || [];

  const alternatifTerurut = URUTAN_REKOMENDASI.map((kode) =>
    alternatif.find((item) => item.keputusan === kode),
  ).filter(Boolean);

  return (
    <div className="space-y-7">
      {/* HEADER DAN PROGRESS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Sprout size={15} />
              Panganita Smart Harvest
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {tahap === 1
                ? "Identifikasi hasil panen"
                : "Tentukan pembagian panen"}
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
              {tahap === 1
                ? "Kenali pangan, periksa informasi gizinya, lalu masukkan jumlah hasil panen."
                : "Bandingkan tiga alternatif dan pilih pembagian yang sesuai dengan kebutuhan keluarga."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                tahap === 1
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {tahap === 2 ? <CheckCircle2 size={18} /> : "1"}
            </div>

            <div
              className={`h-1 w-10 rounded-full ${
                tahap === 2 ? "bg-emerald-600" : "bg-slate-200"
              }`}
            />

            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                tahap === 2
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold">
          <div className={tahap === 1 ? "text-emerald-800" : "text-slate-400"}>
            01 · Identifikasi pangan
          </div>
          <div
            className={`text-right ${
              tahap === 2 ? "text-emerald-800" : "text-slate-400"
            }`}
          >
            02 · Rekomendasi
          </div>
        </div>
      </section>

      {tahap === 1 && (
        <div className="flex w-full flex-col gap-6">
          {/* FOTO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Foto hasil panen</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Gunakan foto yang jelas dan tidak terlalu gelap.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Camera size={21} />
              </div>
            </div>

            <input
              ref={inputGaleriRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                pilihFoto(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            {previewFoto ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={previewFoto}
                  alt="Foto hasil panen"
                  className="h-[310px] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={hapusFoto}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow hover:text-red-600"
                  aria-label="Hapus foto"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex min-h-[310px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-5 text-center">
                <div className="mb-4 rounded-2xl bg-white p-4 text-emerald-700 shadow-sm">
                  <Upload size={28} />
                </div>

                <h4 className="font-semibold text-slate-900">
                  Mulai dengan foto panen
                </h4>

                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  Ambil foto hasil panen atau pilih gambar yang sudah tersimpan.
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={bukaKamera}
                disabled={kameraMemuat}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70"
              >
                {kameraMemuat ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Camera size={17} />
                )}
                {kameraMemuat ? "Membuka kamera..." : "Ambil foto"}
              </button>

              <button
                type="button"
                onClick={() => inputGaleriRef.current?.click()}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Upload size={17} />
                Unggah foto
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              JPG, PNG atau WebP · Maksimal 8 MB
            </p>

            <button
              type="button"
              onClick={jalankanDeteksi}
              disabled={!fileFoto || sedangDeteksi}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sedangDeteksi ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Mengidentifikasi pangan...
                </>
              ) : (
                <>
                  <ScanSearch size={18} />
                  Identifikasi pangan
                </>
              )}
            </button>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Sistem akan mengenali jenis pangan berdasarkan foto. Ibu tetap
              dapat memeriksa dan mengoreksi hasilnya.
            </p>

            {typeof hasilDeteksi?.annotated_image === "string" &&
              hasilDeteksi.annotated_image.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                  <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <ScanSearch size={19} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Hasil analisis AI
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Visualisasi area pangan yang dikenali sistem.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={14} />
                      Deteksi berhasil
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-4">
                    <img
                      src={hasilDeteksi.annotated_image}
                      alt="Foto hasil deteksi pangan dengan bounding box YOLO"
                      className="mx-auto block max-h-64 w-auto max-w-full rounded-xl border border-slate-200 object-contain sm:max-h-72"
                    />
                  </div>

                  <div className="flex items-start gap-2 px-4 py-3 sm:px-5">
                    <Info
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />
                    <p className="text-xs leading-relaxed text-slate-600">
                      Kotak dan label pada gambar menunjukkan bagian pangan yang
                      dikenali AI. Periksa kembali nama pangan di bagian
                      Identitas Pangan. Jika belum sesuai, Ibu dapat
                      mengoreksinya melalui kolom pencarian.
                    </p>
                  </div>
                </div>
              )}
          </section>

          {/* IDENTITAS PANGAN DAN INPUT */}
          <section className="space-y-5">
            {/* IDENTITAS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <Wheat size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">Identitas pangan</h3>
                  <p className="text-xs text-slate-500">
                    Periksa nama pangan yang dikenali sistem.
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nama pangan
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={kataKunci}
                  onChange={(event) => {
                    setKataKunci(event.target.value);
                    setBahanId(null);
                    setPencarianTerbuka(true);
                    setHasilHitung(null);
                  }}
                  onFocus={() => setPencarianTerbuka(true)}
                  onBlur={() => {
                    setTimeout(() => setPencarianTerbuka(false), 150);
                  }}
                  placeholder="Cari atau koreksi nama pangan..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />

                {pencarianTerbuka && hasilPencarian.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {hasilPencarian.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={() => pilihBahan(item)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition hover:bg-emerald-50"
                      >
                        <span className="font-medium text-slate-800">
                          {item.nama}
                        </span>
                        <ArrowRight size={15} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {panganTerpilih && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={15} />
                  Data pangan terhubung dengan katalog gizi PANGANITA
                </div>
              )}

              {/* NILAI GIZI */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Komposisi nilai gizi
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Per 100 gram bagian yang dapat dimakan (BDD)
                    </p>
                  </div>
                  <Leaf size={18} className="text-emerald-600" />
                </div>

                {panganTerpilih ? (
                  <div className="grid grid-cols-3 gap-2">
                    {NUTRISI.map((nutrisi) => {
                      const value = panganTerpilih[nutrisi.key];

                      return (
                        <div
                          key={nutrisi.key}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                        >
                          <p className="text-[11px] text-slate-500">
                            {nutrisi.label}
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {formatAngka(value)}
                            {value != null && (
                              <span className="ml-1 text-[10px] font-medium text-slate-500">
                                {nutrisi.unit}
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                    <Info className="mx-auto mb-2 text-slate-400" size={20} />
                    <p className="text-xs text-slate-500">
                      Nilai gizi akan muncul setelah nama pangan dikenali atau
                      dipilih.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* INPUT PANEN */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-slate-900">
                Informasi hasil panen
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Masukkan data untuk menghitung pembagian panen.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Berat hasil panen
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={berat}
                      onChange={(event) => {
                        setBerat(event.target.value);
                        setHasilHitung(null);
                      }}
                      placeholder="Contoh: 10"
                      className="h-12 w-full rounded-xl border border-slate-200 px-3 pr-12 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      kg
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Harga pasar per kg
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      Rp
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={harga}
                      onChange={(event) => {
                        setHarga(event.target.value.replace(/[^\d]/g, ""));
                        setHasilHitung(null);
                      }}
                      placeholder="8000"
                      className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays size={16} className="text-emerald-700" />
                  Lama cadangan pangan keluarga
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <button
                    type="button"
                    onClick={() => setHari((v) => Math.max(1, v - 1))}
                    disabled={hari <= 1}
                    className="h-10 w-10 rounded-lg border border-slate-200 text-lg font-semibold text-slate-700 disabled:opacity-30"
                  >
                    −
                  </button>

                  <div className="flex-1 text-center">
                    <p className="text-xl font-bold text-slate-900">
                      {hari} hari
                    </p>
                    <p className="text-[11px] text-slate-500">Minimal 1 hari</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHari((v) => Math.min(30, v + 1))}
                    disabled={hari >= 30}
                    className="h-10 w-10 rounded-lg border border-slate-200 text-lg font-semibold text-slate-700 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-3">
                <Info size={17} className="mt-0.5 shrink-0 text-amber-700" />
                <p className="text-xs leading-relaxed text-amber-900">
                  Berat dan harga digunakan untuk memperkirakan persediaan
                  keluarga serta potensi pendapatan dari penjualan.
                </p>
              </div>

              <button
                type="button"
                onClick={hitungPembagian}
                disabled={sedangHitung || !panganTerpilih || !hasilDeteksi}
                className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sedangHitung ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Menghitung kebutuhan keluarga...
                  </>
                ) : (
                  <>
                    Hitung pembagian panen
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                Perhitungan berdasarkan profil keluarga dan rumus PANGANITA.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* TAHAP 2: REKOMENDASI */}
      {tahap === 2 && hasilHitung && (
        <section className="space-y-6">
          <button
            type="button"
            onClick={() => setTahap(1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
          >
            <ArrowLeft size={17} />
            Kembali ke data panen
          </button>

          {/* RINGKASAN PANEN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {previewFoto && (
                <img
                  src={previewFoto}
                  alt="Hasil panen"
                  className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                />
              )}

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Ringkasan hasil panen
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  {panganTerpilih?.nama}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {berat} kg · {formatRupiah(harga)} per kg · Cadangan {hari}{" "}
                  hari
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-xs text-emerald-700">Anggota keluarga</p>
                <p className="text-xl font-bold text-emerald-900">
                  {hasilHitung.jumlahOrang} orang
                </p>
              </div>
            </div>
          </div>

          {/* KEBUTUHAN */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Kebutuhan cadangan</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatKg(hasilHitung.kebutuhanCadanganKg)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total hasil panen</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatKg(berat)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Kekurangan pangan</p>
              <p
                className={`mt-2 text-xl font-bold ${
                  hasilHitung.kekuranganKg > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {formatKg(hasilHitung.kekuranganKg)}
              </p>
            </div>
          </div>

          {hasilHitung.kekuranganKg > 0 && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Info className="mt-0.5 shrink-0 text-amber-700" size={18} />
              <p className="text-sm leading-relaxed text-amber-900">
                Hasil panen belum mencukupi perkiraan kebutuhan cadangan selama{" "}
                {hari} hari. Kekurangan sekitar{" "}
                {formatKg(hasilHitung.kekuranganKg)}. Ibu dapat mempertimbangkan
                sumber pangan lainnya.
              </p>
            </div>
          )}

          {/* PILIHAN REKOMENDASI */}
          <div>
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Sparkles size={15} />
                Analisis PANGANITA
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Pilih pembagian panen
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Bandingkan tiga alternatif berikut. Setiap pilihan memiliki
                pertimbangan yang berbeda. Ibu menentukan keputusan akhir sesuai
                keadaan keluarga.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {alternatifTerurut.map((item, index) => {
                const konfigurasi = REKOMENDASI[item.keputusan];
                if (!konfigurasi) return null;

                const Icon = konfigurasi.icon;

                return (
                  <article
                    key={item.keputusan}
                    className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                      item.keputusan === "seimbang"
                        ? "border-emerald-300 ring-1 ring-emerald-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        ALTERNATIF 0{index + 1}
                      </span>

                      {item.keputusan === "seimbang" && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          Pilihan tengah
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon size={21} />
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-950">
                      {konfigurasi.judul}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {konfigurasi.subjudul}
                    </p>

                    <p className="mt-4 min-h-[92px] text-sm leading-relaxed text-slate-600">
                      {konfigurasi.penjelasan}
                    </p>

                    <div className="my-4 space-y-3 rounded-xl bg-slate-50 p-4">
                      <div className="flex justify-between gap-2">
                        <span className="text-xs text-slate-500">Disimpan</span>
                        <span className="text-sm font-bold text-emerald-800">
                          {formatKg(item.beratSimpanKg)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-xs text-slate-500">Dijual</span>
                        <span className="text-sm font-bold text-slate-900">
                          {formatKg(item.beratJualKg)}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs text-slate-500">
                          Perkiraan pendapatan
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                          {formatRupiah(item.pendapatanRp)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 mt-auto rounded-xl border border-slate-100 p-3">
                      <p className="text-xs font-semibold text-slate-700">
                        Kontribusi perkiraan gizi
                      </p>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="text-slate-500">Energi</span>
                        <span className="font-semibold text-slate-800">
                          {formatAngka(item.kontribusiEnergiPersen)}%
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-xs">
                        <span className="text-slate-500">Protein</span>
                        <span className="font-semibold text-slate-800">
                          {formatAngka(item.kontribusiProteinPersen)}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => simpanPilihan(item.keputusan)}
                      disabled={sedangSimpan}
                      aria-pressed={keputusanDipilih === item.keputusan}
                      className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                        keputusanDipilih === item.keputusan
                          ? "border-emerald-700 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
                      }`}
                    >
                      {sedangSimpan ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <>
                          Pilih rekomendasi ini
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <Leaf size={19} className="mt-0.5 shrink-0 text-emerald-700" />
            <p className="text-sm leading-relaxed text-emerald-950">
              Menyisihkan sebagian hasil panen membantu keluarga
              mempertimbangkan ketersediaan pangan di rumah. Rekomendasi ini
              merupakan alat bantu keputusan, bukan kewajiban. Ibu tetap
              menentukan pilihan akhir.
            </p>
          </div>

          <p className="text-center text-xs text-slate-400">
            Setelah Ibu memilih, hanya alternatif yang dipilih akan disimpan
            sebagai keputusan pada riwayat panen.
          </p>
        </section>
      )}

      {/* MODAL KAMERA LANGSUNG */}
      {kameraTerbuka && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Ambil foto hasil panen"
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
              <div>
                <h3 className="font-bold text-slate-950">
                  Ambil foto hasil panen
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Arahkan kamera ke pangan, lalu tekan tombol tangkap foto.
                </p>
              </div>

              <button
                type="button"
                onClick={tutupKamera}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Tutup kamera"
              >
                <X size={21} />
              </button>
            </div>

            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="aspect-[4/3] max-h-[65vh] w-full object-contain"
              />
              <div className="pointer-events-none absolute inset-5 rounded-xl border border-white/60 sm:inset-8" />
            </div>

            <div className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
              <button
                type="button"
                onClick={tutupKamera}
                className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={tangkapFoto}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                <Camera size={18} />
                Tangkap foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
