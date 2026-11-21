"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { StatusDialog } from "@/components/ui/status-dialog";

type HasilHapus = {
  ok: boolean;
  pesan?: string;
  jumlahTerhapus?: number;
};

type Props = {
  action: () => Promise<HasilHapus>;
  tampilkanTombol: boolean;
};

type PopupState = {
  type: "warning" | "loading" | "success" | "error";
  title: string;
  message: string;
  duration?: number;
};

export function TombolHapusRiwayat({ action, tampilkanTombol }: Props) {
  const router = useRouter();

  const [popup, setPopup] = useState<PopupState | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  function bukaKonfirmasi() {
    setPopup({
      type: "warning",
      title: "Hapus semua riwayat?",
      message:
        "Seluruh riwayat keputusan panen akan dihapus permanen.",
    });
  }

  function tutupPopup() {
    if (sedangHapus) return;
    setPopup(null);
  }

  async function konfirmasiHapus() {
    if (sedangHapus) return;

    setSedangHapus(true);

    setPopup({
      type: "loading",
      title: "Menghapus riwayat...",
      message: "Mohon tunggu, riwayat sedang dihapus.",
    });

    try {
      const hasil = await action();

      if (!hasil.ok) {
        throw new Error(hasil.pesan || "Riwayat gagal dihapus.");
      }

      // Langsung perbarui data halaman setelah penghapusan berhasil.
      router.refresh();

      setPopup({
        type: "success",
        title: "Riwayat berhasil dihapus!",
        message:
          hasil.jumlahTerhapus && hasil.jumlahTerhapus > 0
            ? `${hasil.jumlahTerhapus} riwayat keputusan berhasil dihapus.`
            : "Tidak ada riwayat yang perlu dihapus.",
        duration: 2000,
      });
    } catch (error) {
      console.error("[HAPUS RIWAYAT]", error);

      setPopup({
        type: "error",
        title: "Penghapusan gagal",
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menghapus riwayat.",
        duration: 4500,
      });
    } finally {
      setSedangHapus(false);
    }
  }

  return (
    <>
      {tampilkanTombol && (
        <button
          type="button"
          onClick={bukaKonfirmasi}
          disabled={sedangHapus}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={17} />
          Hapus Semua Riwayat
        </button>
      )}

      <StatusDialog
        open={Boolean(popup)}
        type={popup?.type || "success"}
        title={popup?.title || ""}
        message={popup?.message || ""}
        duration={popup?.duration ?? 0}
        actionLabel={popup?.type === "warning" ? "Ya, hapus semua" : undefined}
        cancelLabel={popup?.type === "warning" ? "Batal" : undefined}
        onAction={popup?.type === "warning" ? konfirmasiHapus : undefined}
        onCancel={tutupPopup}
        onClose={tutupPopup}
      />
    </>
  );
}
