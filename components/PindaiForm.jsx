"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Camera,
  Upload,
  ScanSearch,
  CheckCircle2,
  Search,
  X,
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
  Sprout,
} from "lucide-react";

import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

import { ambilAlternatif, simpanKeputusan } from "@/actions/keputusan";
import { StatusDialog } from "@/components/ui/status-dialog";

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

  const angka = Number(value);
  if (!Number.isFinite(angka)) return "Belum tersedia";

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maksimum,
  }).format(angka);
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

// State harga tetap berupa digit murni; titik ribuan hanya untuk tampilan.
function formatHargaInput(value) {
  if (value === null || value === undefined || value === "") return "";

  const angka = Number(value);
  if (!Number.isFinite(angka)) return "";

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(angka);
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

export function PindaiForm({ bahan }) {
  const router = useRouter();

  const inputGaleriRef = useRef(null);
  const hargaInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const deteksiControllerRef = useRef(null);
  const simpanLockRef = useRef(false);

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
  const [hari, setHari] = useState(1);

  const [hasilHitung, setHasilHitung] = useState(null);

  const [sedangHitung, setSedangHitung] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [keputusanDipilih, setKeputusanDipilih] = useState(null);
  const [popup, setPopup] = useState(null);
  const popupIdRef = useRef(0);

  const tampilkanPopup = useCallback((tipe, pesan, opsi = {}) => {
    const judulDefault =
      tipe === "success"
        ? "Berhasil!"
        : tipe === "loading"
          ? "Sedang diproses..."
          : "Terjadi kendala";

    setPopup({
      id: ++popupIdRef.current,
      tipe,
      title: opsi.title || judulDefault,
      message: pesan,
      duration: opsi.duration ?? (tipe === "loading" ? 0 : 3800),
      actionLabel: opsi.actionLabel || null,
      aksi: opsi.aksi || null,
    });
  }, []);

  const tutupPopup = useCallback(() => {
    const aksi = popup?.aksi;
    setPopup(null);

    if (aksi === "ke-riwayat") {
      router.push("/riwayat");
    }
  }, [popup, router]);

  function pilihPanganManual() {
    setPopup(null);
    setPencarianTerbuka(true);

    const inputPangan = document.getElementById("nama-pangan");
    inputPangan?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => inputPangan?.focus(), 350);
  }

  const panganTerpilih = useMemo(
    () => bahan.find((item) => item.id === bahanId) || null,
    [bahan, bahanId],
  );

  const hasilPencarian = useMemo(() => {
    const q = normalisasiLabel(kataKunci);

    if (!q) return bahan;

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
        tampilkanPopup("error", "Pratinjau kamera tidak dapat ditampilkan.");
      }
    });

    return () => {
      video.pause();
      video.srcObject = null;
    };
  }, [kameraTerbuka, tampilkanPopup]);

  // Pastikan kamera selalu dimatikan ketika halaman/komponen ditinggalkan.
  useEffect(() => {
    return () => {
      deteksiControllerRef.current?.abort();
      deteksiControllerRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Menjaga modal kamera tetap fokus dan dapat ditutup dengan tombol Escape.
  useEffect(() => {
    if (!kameraTerbuka) return;

    const overflowSebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function tanganiTombolEscape(event) {
      if (event.key !== "Escape") return;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setKameraTerbuka(false);
    }

    window.addEventListener("keydown", tanganiTombolEscape);

    return () => {
      document.body.style.overflow = overflowSebelumnya;
      window.removeEventListener("keydown", tanganiTombolEscape);
    };
  }, [kameraTerbuka]);

  function pilihFoto(file) {
    if (!file) return;
    setPopup(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      tampilkanPopup("error", "Format foto harus JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      tampilkanPopup("error", "Ukuran foto maksimal 8 MB.");
      return;
    }

    deteksiControllerRef.current?.abort();
    deteksiControllerRef.current = null;
    setSedangDeteksi(false);

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
      tampilkanPopup(
        "error",
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
        tampilkanPopup(
          "error",
          "Izin kamera ditolak. Izinkan akses kamera pada browser.",
        );
      } else if (
        error?.name === "NotFoundError" ||
        error?.name === "DevicesNotFoundError"
      ) {
        tampilkanPopup("error", "Kamera tidak ditemukan pada perangkat ini.");
      } else if (
        error?.name === "NotReadableError" ||
        error?.name === "TrackStartError"
      ) {
        tampilkanPopup(
          "error",
          "Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.",
        );
      } else {
        tampilkanPopup(
          "error",
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
      tampilkanPopup(
        "error",
        "Kamera belum siap. Tunggu sampai gambar terlihat.",
      );
      return;
    }

    const canvas = document.createElement("canvas");
    const ukuranAsliTerbesar = Math.max(video.videoWidth, video.videoHeight);
    const skala = Math.min(1, 1920 / ukuranAsliTerbesar);

    canvas.width = Math.round(video.videoWidth * skala);
    canvas.height = Math.round(video.videoHeight * skala);

    const context = canvas.getContext("2d");

    if (!context) {
      tampilkanPopup("error", "Foto tidak dapat diproses pada perangkat ini.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          tampilkanPopup(
            "error",
            "Gagal mengambil foto. Silakan coba kembali.",
          );
          return;
        }

        if (blob.size > MAX_UPLOAD_BYTES) {
          tampilkanPopup(
            "error",
            "Ukuran foto melebihi 8 MB. Silakan ambil foto ulang.",
          );
          return;
        }

        const file = new File([blob], `panen-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        pilihFoto(file);
        tutupKamera();
        tampilkanPopup("success", "Foto hasil panen berhasil diambil.", {
          title: "Foto berhasil disiapkan!",
          duration: 2200,
        });
      },
      "image/jpeg",
      0.85,
    );
  }

  function hapusFoto() {
    setPopup(null);
    deteksiControllerRef.current?.abort();
    deteksiControllerRef.current = null;
    setSedangDeteksi(false);

    setFileFoto(null);
    setHasilDeteksi(null);
    setBahanId(null);
    setKataKunci("");
    setHasilHitung(null);
    setKeputusanDipilih(null);
    setTahap(1);

    if (inputGaleriRef.current) {
      inputGaleriRef.current.value = "";
    }
  }

  // Mengirim foto ke API Next.js, lalu diteruskan ke FastAPI.
  // AbortController mencegah hasil deteksi foto lama menimpa foto terbaru.

  async function jalankanDeteksi() {
    if (!fileFoto) {
      tampilkanPopup(
        "error",
        "Ambil atau unggah foto hasil panen terlebih dahulu.",
      );
      return;
    }

    if (deteksiControllerRef.current) return;

    setPopup(null);

    const controller = new AbortController();
    deteksiControllerRef.current = controller;

    setSedangDeteksi(true);
    setHasilDeteksi(null);
    setBahanId(null);
    setKataKunci("");
    setHasilHitung(null);
    setKeputusanDipilih(null);

    try {
      const formData = new FormData();
      formData.append("file", fileFoto);

      const response = await fetch("/api/vision/detect", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Pangan belum berhasil diidentifikasi. Silakan coba lagi.",
        );
      }

      if (deteksiControllerRef.current !== controller) return;

      setHasilDeteksi(data);

      // Backend menentukan kelas dominan.
      const dominantClass = data.identification?.dominant_class;

      if (!data.identification?.success || !dominantClass) {
        tampilkanPopup(
          "error",
          "Sistem belum dapat menentukan jenis pangan secara meyakinkan.",
          {
            title: "Pilih pangan secara manual",
            duration: 0,
            actionLabel: "Pilih Pangan",
          },
        );
        return;
      }

      // Cocokkan nama kelas YOLO dengan katalog pangan.
      const ditemukan = bahan.find(
        (item) =>
          normalisasiLabel(item.nama_kelas_cv) ===
          normalisasiLabel(dominantClass),
      );

      if (ditemukan) {
        pilihBahan(ditemukan);

        tampilkanPopup(
          "success",
          "Sistem berhasil mengenali pangan pada foto.",
          {
            title: "Pangan berhasil dideteksi!",
            duration: 2500,
          },
        );
      } else {
        tampilkanPopup("error", "Jenis pangan belum tersedia dalam katalog.", {
          title: "Pilih pangan secara manual",
          duration: 0,
          actionLabel: "Pilih Pangan",
        });
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("[DETEKSI PANGAN]", error);

        tampilkanPopup("error", "Silakan pilih jenis pangan secara manual.", {
          title: "Pangan belum terdeteksi",
          duration: 0,
          actionLabel: "Pilih Pangan",
        });
      }
    } finally {
      if (deteksiControllerRef.current === controller) {
        deteksiControllerRef.current = null;
        setSedangDeteksi(false);
      }
    }
  }

  function pilihBahan(item) {
    setPopup(null);
    setBahanId(item.id);
    setKataKunci(item.nama);
    setPencarianTerbuka(false);
    setHasilHitung(null);
    setKeputusanDipilih(null);

    setHarga(
      item.harga_umum_per_kg != null ? String(item.harga_umum_per_kg) : "",
    );
  }

  function ubahHari(delta) {
    setHari((nilaiSaatIni) =>
      Math.floor(Math.min(30, Math.max(1, nilaiSaatIni + delta))),
    );
    setHasilHitung(null);
    setKeputusanDipilih(null);
  }

  // Validasi data sebelum perhitungan.
  function validasiInput() {
    if (!fileFoto) {
      tampilkanPopup(
        "error",
        "Ambil atau unggah foto hasil panen terlebih dahulu.",
      );
      return null;
    }

    if (!panganTerpilih) {
      tampilkanPopup(
        "error",
        "Pilih atau koreksi nama pangan terlebih dahulu.",
      );
      return null;
    }

    const beratKg = Number(berat.replace(",", "."));

    if (!Number.isFinite(beratKg) || beratKg <= 0) {
      tampilkanPopup("error", "Masukkan berat panen yang valid.");
      return null;
    }

    // Harga disimpan sebagai digit murni di state.
    const hargaPerKg = Number(String(harga).replace(/[^\d]/g, ""));

    if (!Number.isFinite(hargaPerKg) || harga.trim() === "") {
      tampilkanPopup("error", "Masukkan harga pasar per kilogram.");
      return null;
    }

    const hariValid = Number(hari);

    if (!Number.isInteger(hariValid) || hariValid < 1 || hariValid > 30) {
      tampilkanPopup("error", "Lama cadangan harus antara 1 sampai 30 hari.");
      return null;
    }

    return {
      bahanId: panganTerpilih.id,
      beratPanenKg: beratKg,
      hargaJualPerKg: hargaPerKg,
      hariDisediakan: hariValid,
    };
  }

  // Tahap pertama menuju layar rekomendasi.
  async function hitungPembagian() {
    if (sedangHitung) return;

    const input = validasiInput();
    if (!input) return;

    setSedangHitung(true);
    setKeputusanDipilih(null);

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
      tampilkanPopup("error", error.message || "Perhitungan gagal.");
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
    if (simpanLockRef.current) return;

    const input = validasiInput();
    if (!input) return;

    simpanLockRef.current = true;
    setKeputusanDipilih(keputusan);
    setSedangSimpan(true);
    tampilkanPopup("loading", "Foto hasil panen sedang diunggah.", {
      title: "Menyimpan keputusan...",
      duration: 0,
    });

    const mulaiSimpan = performance.now();
    let penyimpananBerhasil = false;

    try {
      const mulaiUpload = performance.now();
      const foto = await unggahFotoAsli();
      console.info(
        `[KINERJA SIMPAN] Upload foto: ${(performance.now() - mulaiUpload).toFixed(0)} ms`,
      );

      tampilkanPopup("loading", "Keputusan pembagian panen sedang disimpan.", {
        title: "Menyimpan keputusan...",
        duration: 0,
      });

      const mulaiDatabase = performance.now();
      const response = await simpanKeputusan({
        ...input,
        keputusan,
        foto,
      });
      console.info(
        `[KINERJA SIMPAN] Server action: ${(performance.now() - mulaiDatabase).toFixed(0)} ms`,
      );

      if (!response.ok) {
        throw new Error(response.pesan || "Keputusan gagal disimpan.");
      }

      penyimpananBerhasil = true;
      console.info(
        `[KINERJA SIMPAN] Total: ${(performance.now() - mulaiSimpan).toFixed(0)} ms`,
      );

      setSedangSimpan(false);
      tampilkanPopup(
        "success",
        "Keputusan pembagian panen berhasil disimpan.",
        {
          title: "Berhasil disimpan!",
          duration: 700,
          aksi: "ke-riwayat",
        },
      );
    } catch (error) {
      console.error("[SIMPAN KEPUTUSAN]", error);
      setKeputusanDipilih(null);
      tampilkanPopup("error", error.message || "Keputusan gagal disimpan.", {
        title: "Penyimpanan gagal",
        duration: 4500,
      });
    } finally {
      setSedangSimpan(false);
      // Kunci tetap aktif selama popup sukses tampil, sampai navigasi ke riwayat.
      if (!penyimpananBerhasil) simpanLockRef.current = false;
    }
  }

  const alternatif = hasilHitung?.alternatif || [];

  const alternatifTerurut = URUTAN_REKOMENDASI.map((kode) =>
    alternatif.find((item) => item.keputusan === kode),
  ).filter(Boolean);

  return (
    <>
      <StatusDialog
        key={popup?.id || "status-top"}
        open={Boolean(popup)}
        type={popup?.tipe || "success"}
        title={popup?.title || ""}
        message={popup?.message || ""}
        duration={popup?.duration ?? 0}
        actionLabel={popup?.actionLabel || undefined}
        onAction={popup?.actionLabel ? pilihPanganManual : undefined}
        onClose={tutupPopup}
      />

      <div className="space-y-7">
        {/* HEADER DAN PROGRESS */}
        {tahap === 2 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setTahap(1)}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg text-sm font-bold text-[#1B4D2B] transition hover:text-[#0F2D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#90C226]"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
                <span className="font-bold">Kembali </span>
              </button>

              <span className="shrink-0 rounded-full bg-[#EAF3E5] px-3 py-1.5 text-xs font-bold text-[#1B4D2B]">
                Langkah 2
              </span>
            </div>

            <div
              className="mt-4 grid grid-cols-2 gap-2"
              aria-label="Progres: Identifikasi pangan selesai, rekomendasi aktif"
            >
              <div className="h-[5px] rounded-full bg-[#3E8E1F]" />
              <div className="h-[5px] rounded-full bg-[#3E8E1F]" />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold">
              <span className="min-w-0 text-[11px] text-[#1B4D2B] sm:text-xs">
                01 · Pindai Panen
              </span>
              <span className="min-w-0 text-right text-[11px] text-[#1B4D2B] sm:text-xs">
                02 · Rekomendasi
              </span>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1B4D2B]">
              <Sprout size={16} />
              PINDAI PANEN PANGANITA
            </div>

            <h2 className="text-xl font-bold tracking-tight text-[#0F2D1A] sm:text-2xl">
              Identifikasi Hasil Panen
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
              Kenali pangan, periksa informasi gizinya, lalu masukkan jumlah
              hasil panen.
            </p>

            <div
              className="mt-4 grid grid-cols-2 gap-2"
              aria-label="Progres: Identifikasi pangan aktif, rekomendasi belum dimulai"
            >
              <div className="h-[5px] rounded-full bg-[#3E8E1F]" />
              <div className="h-[5px] rounded-full bg-slate-200" />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold">
              <span className="min-w-0 text-[11px] text-[#1B4D2B] sm:text-xs">
                01 · Pindai Panen
              </span>
              <span className="min-w-0 text-right text-[11px] text-slate-500 sm:text-xs">
                02 · Rekomendasi
              </span>
            </div>
          </section>
        )}

        {tahap === 1 && (
          <div className="flex w-full flex-col gap-6">
            {/* FOTO */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Foto Hasil Panen
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Gunakan foto yang jelas dan cukup terang.
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-[#90C226]/20 p-3 text-[#1B4D2B]">
                  <Camera size={21} />
                </div>
              </div>

              <input
                ref={inputGaleriRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Pilih foto hasil panen dari galeri"
                disabled={sedangDeteksi}
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
                    className="h-[200px] w-full object-contain sm:h-[280px]"
                  />

                  <button
                    type="button"
                    onClick={hapusFoto}
                    disabled={sedangDeteksi}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow hover:text-red-600"
                    aria-label="Hapus foto"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputGaleriRef.current?.click()}
                  disabled={sedangDeteksi}
                  aria-label="Pilih foto hasil panen dari galeri"
                  className="flex min-h-[310px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#90C226] bg-[#90C226]/10 px-5 text-center transition hover:bg-[#90C226]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="mb-4 rounded-2xl bg-white p-4 text-[#1B4D2B] shadow-sm">
                    <Upload size={28} />
                  </div>

                  <h4 className="font-semibold text-slate-900">
                    Mulai dengan foto panen
                  </h4>

                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                    Ambil foto hasil panen atau pilih gambar yang sudah
                    tersimpan.
                  </p>
                </button>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={bukaKamera}
                  disabled={kameraMemuat || sedangDeteksi}
                  className="flex min-h-12 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#3E8E1F] bg-[#3E8E1F] px-2 text-sm font-bold text-white transition hover:border-[#1B4D2B] hover:bg-[#1B4D2B] disabled:cursor-wait disabled:opacity-70 sm:gap-2 sm:px-3"
                >
                  {kameraMemuat ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Camera size={17} className="shrink-0" />
                  )}
                  {kameraMemuat ? "Membuka..." : "Ambil Foto"}
                </button>

                <button
                  type="button"
                  onClick={() => inputGaleriRef.current?.click()}
                  disabled={sedangDeteksi}
                  className="flex min-h-12 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E6B91E] bg-[#E6B91E] px-2 text-sm font-bold text-[#0F2D1A] transition hover:border-[#FFD23F] hover:bg-[#FFD23F] disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-3"
                >
                  <Upload size={17} className="shrink-0" />
                  <span>Unggah Foto</span>
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-slate-600">
                JPG, PNG, WebP · Maks. 8 MB
              </p>

              <button
                type="button"
                onClick={jalankanDeteksi}
                disabled={!fileFoto || sedangDeteksi}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1B4D2B] text-sm font-semibold text-white transition hover:bg-[#0F2D1A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sedangDeteksi ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Mengidentifikasi pangan...
                  </>
                ) : (
                  <>
                    <ScanSearch size={18} />
                    Identifikasi Pangan
                  </>
                )}
              </button>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Sistem akan mengenali jenis pangan berdasarkan foto. Jika
                deteksi belum berhasil, Ibu tetap dapat memilih nama pangan
                secara manual.
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
                          <h4 className="text-sm font-bold tabular-nums text-[#0F2D1A]">
                            Hasil Analisis AI
                          </h4>
                          <p className="mt-0.5 text-xs text-slate-600">
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
                        Kotak dan label pada gambar menunjukkan bagian pangan
                        yang dikenali AI. Periksa kembali nama pangan di bagian
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
                    <h3 className="font-bold text-slate-900">
                      Identitas Pangan
                    </h3>
                    <p className="text-xs text-slate-600">
                      Periksa nama pangan yang dikenali sistem.
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="nama-pangan"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nama Pangan
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    id="nama-pangan"
                    type="text"
                    autoComplete="off"
                    value={kataKunci}
                    onChange={(event) => {
                      setKataKunci(event.target.value);
                      setBahanId(null);
                      setPencarianTerbuka(true);
                      setHasilHitung(null);
                      setKeputusanDipilih(null);
                    }}
                    onFocus={() => setPencarianTerbuka(true)}
                    onBlur={() => {
                      setTimeout(() => setPencarianTerbuka(false), 150);
                    }}
                    placeholder="Cari atau koreksi nama pangan..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />

                  {pencarianTerbuka && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                      {hasilPencarian.length > 0 ? (
                        hasilPencarian.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={() => pilihBahan(item)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition hover:bg-[#90C226]/15"
                          >
                            <span className="font-medium text-slate-800">
                              {item.nama}
                            </span>
                            <ArrowRight size={15} className="text-slate-600" />
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-sm text-slate-600">
                          Pangan tidak ditemukan. Coba kata kunci lain.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {panganTerpilih && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={15} />
                    Data gizi ditemukan
                  </div>
                )}

                {/* NILAI GIZI */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold tabular-nums text-[#0F2D1A]">
                        Komposisi Nilai Gizi
                      </h4>
                      <p className="mt-1 text-xs text-slate-600">
                        Per 100 gram bagian yang dapat dimakan (BDD)
                      </p>
                    </div>
                    <Leaf size={18} className="text-emerald-600" />
                  </div>

                  {panganTerpilih ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {NUTRISI.map((nutrisi) => {
                        const value = panganTerpilih[nutrisi.key];

                        return (
                          <div
                            key={nutrisi.key}
                            className="rounded-xl border border-[#DCE9D8] bg-[#F1F7ED] p-3"
                          >
                            <p className="text-[11px] font-semibold text-[#1B4D2B]">
                              {nutrisi.label}
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#0F2D1A]">
                              {formatAngka(value)}
                              {value != null && (
                                <span className="ml-1 text-[10px] font-semibold text-[#1B4D2B]">
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
                      <Info className="mx-auto mb-2 text-slate-600" size={20} />
                      <p className="text-xs text-slate-600">
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
                  Informasi Hasil Panen
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  Masukkan data untuk menghitung pembagian panen.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="berat-panen"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Berat Hasil Panen
                    </label>

                    <div className="relative">
                      <input
                        id="berat-panen"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        value={berat}
                        onChange={(event) => {
                          setBerat(event.target.value);
                          setHasilHitung(null);
                          setKeputusanDipilih(null);
                        }}
                        placeholder="Contoh: 10"
                        className="h-12 w-full rounded-xl border border-slate-200 px-3 pr-12 text-sm font-semibold text-[#0F2D1A] outline-none placeholder:text-slate-500 focus:border-[#3E8E1F] focus:ring-2 focus:ring-[#90C226]/25"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#1B4D2B]">
                        kg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="harga-pasar"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Harga Pasar per Kg
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#1B4D2B]">
                        Rp
                      </span>

                      <input
                        ref={hargaInputRef}
                        id="harga-pasar"
                        type="text"
                        inputMode="numeric"
                        value={formatHargaInput(harga)}
                        onChange={(event) => {
                          const input = event.currentTarget;
                          const posisiKursor =
                            input.selectionStart ?? input.value.length;
                          const jumlahDigitSebelumnya = input.value
                            .slice(0, posisiKursor)
                            .replace(/[^\d]/g, "").length;
                          const nilaiBaru = input.value.replace(/[^\d]/g, "");

                          // Simpan angka tanpa titik agar perhitungan tetap numerik.
                          setHarga(nilaiBaru);
                          setHasilHitung(null);
                          setKeputusanDipilih(null);

                          // Pertahankan posisi kursor saat titik ribuan ditambahkan.
                          window.requestAnimationFrame(() => {
                            const elemen = hargaInputRef.current;
                            if (!elemen) return;

                            const teksTerformat = formatHargaInput(nilaiBaru);
                            let posisiBaru = 0;
                            let digitDihitung = 0;

                            while (
                              posisiBaru < teksTerformat.length &&
                              digitDihitung < jumlahDigitSebelumnya
                            ) {
                              if (/\d/.test(teksTerformat[posisiBaru])) {
                                digitDihitung += 1;
                              }
                              posisiBaru += 1;
                            }

                            elemen.setSelectionRange(posisiBaru, posisiBaru);
                          });
                        }}
                        placeholder="8.000"
                        className="h-12 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold text-[#0F2D1A] outline-none placeholder:text-slate-500 focus:border-[#3E8E1F] focus:ring-2 focus:ring-[#90C226]/25"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CalendarDays size={16} className="text-emerald-700" />
                    Cadangan untuk Berapa Hari?
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <button
                      type="button"
                      onClick={() => ubahHari(-1)}
                      disabled={hari <= 1}
                      aria-label="Kurangi lama cadangan satu hari"
                      className="h-10 w-10 rounded-lg border border-[#3E8E1F] bg-[#3E8E1F] text-lg font-bold text-white transition hover:border-[#1B4D2B] hover:bg-[#1B4D2B] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      −
                    </button>

                    <div className="flex-1 text-center">
                      <p className="text-xl font-bold tabular-nums text-[#0F2D1A]">
                        {hari} Hari
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Minimal 1 Hari
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => ubahHari(1)}
                      disabled={hari >= 30}
                      aria-label="Tambah lama cadangan satu hari"
                      className="h-10 w-10 rounded-lg border border-[#3E8E1F] bg-[#3E8E1F] text-lg font-bold text-white transition hover:border-[#1B4D2B] hover:bg-[#1B4D2B] disabled:cursor-not-allowed disabled:opacity-35"
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
                  disabled={sedangHitung || !fileFoto || !panganTerpilih}
                  className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#1B4D2B] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0F2D1A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sedangHitung ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Menghitung kebutuhan keluarga...
                    </>
                  ) : (
                    <>
                      Pembagian Panen Tumbuh1000
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-slate-600">
                  Perhitungan menggunakan data profil keluarga dan rumus
                  PANGANITA.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAHAP 2: REKOMENDASI */}
        {tahap === 2 && hasilHitung && (
          <section className="space-y-6">
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

                  <p className="mt-1 text-sm text-slate-600">
                    {berat} kg · {formatRupiah(harga)} per kg · Cadangan {hari}{" "}
                    hari
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="text-xs text-emerald-700">Anggota Keluarga</p>
                  <p className="text-xl font-bold text-emerald-900">
                    {hasilHitung.jumlahOrang} orang
                  </p>
                </div>
              </div>
            </div>

            {/* KEBUTUHAN */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-600">Kebutuhan Cadangan</p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatKg(hasilHitung.kebutuhanCadanganKg)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-600">Total Hasil Panen</p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {formatKg(berat)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-600">Kekurangan Pangan</p>
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
                  Hasil panen belum mencukupi perkiraan kebutuhan cadangan
                  selama {hari} hari. Kekurangan sekitar{" "}
                  {formatKg(hasilHitung.kekuranganKg)}. Ibu dapat
                  mempertimbangkan sumber pangan lainnya.
                </p>
              </div>
            )}

            {/* PILIHAN REKOMENDASI */}
            <div>
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1B4D2B]">
                  <Sparkles size={17} />
                  Analisis Tumbuh1000
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-[#0F2D1A] sm:text-3xl">
                  Pilih Pembagian Panen Tumbuh100
                </h2>

                <p className="mt-2 max-w-2xl text-base font-medium leading-relaxed text-[#1B4D2B]">
                  Sistem merekomendasikan beberapa alternatif pembagian panen
                </p>
              </div>

              {alternatifTerurut.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {alternatifTerurut.map((item, index) => {
                    const konfigurasi = REKOMENDASI[item.keputusan];
                    if (!konfigurasi) return null;

                    const Icon = konfigurasi.icon;

                    return (
                      <article
                        key={item.keputusan}
                        className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                          item.keputusan === "seimbang"
                            ? "border-[#90C226] ring-1 ring-[#90C226]/30"
                            : "border-[#DCE9D8]"
                        }`}
                      >
                        {/* LABEL ALTERNATIF */}
                        <div className="flex items-center">
                          <span className="text-sm font-bold tracking-wide text-[#1B4D2B]">
                            ALTERNATIF 0{index + 1}
                          </span>
                        </div>

                        {/* IKON DAN JUDUL: SEJAJAR DI MOBILE DAN DESKTOP */}
                        <div className="mt-4 flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#90C226] text-[#0F2D1A]">
                            <Icon size={21} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold leading-tight text-[#0F2D1A] sm:text-xl">
                              {konfigurasi.judul}
                            </h3>

                            <p className="mt-1 break-words text-xs font-bold leading-snug text-[#1B4D2B] sm:text-sm">
                              {konfigurasi.subjudul}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm font-medium leading-relaxed text-[#0F2D1A] sm:min-h-[92px] sm:text-base">
                          {konfigurasi.penjelasan}
                        </p>

                        {/* INFORMASI PEMBAGIAN PANEN */}
                        <div className="my-4 space-y-3 rounded-xl bg-[#F1F7ED] p-4">
                          <div className="flex justify-between gap-2">
                            <span className="text-sm font-semibold text-[#1B4D2B]">
                              Disimpan
                            </span>
                            <span className="text-base font-bold tabular-nums text-[#0F2D1A]">
                              {formatKg(item.beratSimpanKg)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-2">
                            <span className="text-sm font-semibold text-[#1B4D2B]">
                              Dijual
                            </span>
                            <span className="text-base font-bold tabular-nums text-[#0F2D1A]">
                              {formatKg(item.beratJualKg)}
                            </span>
                          </div>

                          <div className="border-t border-[#DCE9D8] pt-3">
                            <p className="text-sm font-semibold text-[#1B4D2B]">
                              Perkiraan pendapatan
                            </p>
                            <p className="mt-1 text-xl font-bold tabular-nums text-[#0F2D1A]">
                              {formatRupiah(item.pendapatanRp)}
                            </p>
                          </div>
                        </div>

                        {/* KONTRIBUSI PERKIRAAN GIZI */}
                        <div className="mb-5 mt-auto rounded-xl border border-[#DCE9D8] bg-white p-3">
                          <p className="text-sm font-bold text-[#0F2D1A]">
                            Kontribusi perkiraan gizi
                          </p>

                          <div className="mt-2 flex justify-between gap-2 text-sm">
                            <span className="font-medium text-[#1B4D2B]">
                              Energi
                            </span>
                            <span className="font-bold tabular-nums text-[#0F2D1A]">
                              {formatAngka(item.kontribusiEnergiPersen)}%
                            </span>
                          </div>

                          <div className="mt-2 flex justify-between gap-2 text-sm">
                            <span className="font-medium text-[#1B4D2B]">
                              Protein
                            </span>
                            <span className="font-bold tabular-nums text-[#0F2D1A]">
                              {formatAngka(item.kontribusiProteinPersen)}%
                            </span>
                          </div>
                        </div>

                        {/* TOMBOL SIMPAN */}
                        <button
                          type="button"
                          onClick={() => simpanPilihan(item.keputusan)}
                          disabled={
                            sedangSimpan || popup?.aksi === "ke-riwayat"
                          }
                          aria-busy={
                            sedangSimpan && keputusanDipilih === item.keputusan
                          }
                          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                            keputusanDipilih === item.keputusan
                              ? "border-emerald-700 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
                              : "border-[#E6B91E] bg-[#E6B91E] text-[#0F2D1A] hover:border-[#D6A90D] hover:bg-[#F0C83D]"
                          }`}
                        >
                          {sedangSimpan &&
                          keputusanDipilih === item.keputusan ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                              Menyimpan pilihan...
                            </>
                          ) : popup?.aksi === "ke-riwayat" &&
                            keputusanDipilih === item.keputusan ? (
                            <>
                              <CheckCircle2 size={17} />
                              Tersimpan
                            </>
                          ) : (
                            <>
                              {sedangSimpan || popup?.aksi === "ke-riwayat"
                                ? "Tunggu sebentar..."
                                : "Simpan pilihan ini"}
                              {!sedangSimpan &&
                                popup?.aksi !== "ke-riwayat" && (
                                  <ArrowRight size={16} />
                                )}
                            </>
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-base font-medium text-amber-950">
                  Alternatif pembagian belum tersedia dari sistem. Silakan
                  kembali ke data panen dan hitung ulang. Jika masalah
                  berlanjut, periksa respons layanan perhitungan.
                </div>
              )}
            </div>

            {/* INFORMASI EDUKASI PANGANITA */}
            <div className="flex gap-3 rounded-xl border border-[#DCE9D8] bg-[#F1F7ED] p-4">
              <Leaf size={20} className="mt-0.5 shrink-0 text-[#1B4D2B]" />
              <p className="text-justify text-base font-medium leading-relaxed text-[#0F2D1A]">
                Menyisihkan hasil panen membantu Ibu memenuhi kebutuhan gizi
                keluarga. Rekomendasi ini hanya panduan,
                <strong> bukan kewajiban.</strong>{" "}
                <strong>Ibu tetap menentukan pilihan akhir.</strong>
              </p>
            </div>

            {/* KETERANGAN PENYIMPANAN */}
            <p className="text-center text-sm font-medium leading-relaxed text-[#1B4D2B]">
              Pilihan Ibu disimpan dalam riwayat panen.
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
                  <p className="mt-1 text-xs text-slate-600">
                    Arahkan kamera ke pangan, lalu tekan tombol tangkap foto.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={tutupKamera}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3E8E1F] px-7 text-sm font-bold text-white transition hover:bg-[#1B4D2B]"
                >
                  <Camera size={18} />
                  Tangkap foto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
