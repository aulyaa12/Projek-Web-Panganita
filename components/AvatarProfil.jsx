"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { DAFTAR_AVATAR, cariAvatar } from "@/lib/data/avatar";
import { cn } from "@/lib/utils";

// Props:
// - ukuran : class ukuran foto, contoh "h-24 w-24 sm:h-28 sm:w-28"
// - bisaUbah : true = tampil tombol ganti avatar, false = hanya tampilan
export function AvatarProfil({
  ukuran = "h-24 w-24 sm:h-28 sm:w-28",
  bisaUbah = true,
}) {
  const [avatarId, setAvatarId] = useState(null);
  const [terbuka, setTerbuka] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const avatar = cariAvatar(avatarId);

  // Ambil pilihan avatar dari sesi login.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setAvatarId(data.session?.user?.user_metadata?.avatar_id ?? null);
    });
  }, []);

  // Tutup pilihan dengan tombol Escape.
  useEffect(() => {
    if (!terbuka) return;
    function tekan(e) {
      if (e.key === "Escape") setTerbuka(false);
    }
    document.addEventListener("keydown", tekan);
    return () => document.removeEventListener("keydown", tekan);
  }, [terbuka]);

  async function pilih(id) {
    if (sedangSimpan) return;
    const sebelumnya = avatarId;

    setAvatarId(id); // langsung terlihat
    setSedangSimpan(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { avatar_id: id },
    });

    setSedangSimpan(false);

    if (error) {
      setAvatarId(sebelumnya);
      toast.error("Avatar gagal disimpan. Silakan coba lagi.");
      return;
    }

    toast.success("Avatar diganti.");
    setTerbuka(false);
  }

  const foto = (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-[24px] border-2 border-[#1B4D2B] bg-[#eaf1e8]",
        ukuran,
      )}
    >
      <Image
        src={avatar.src}
        alt={avatar.alt}
        width={224}
        height={224}
        className="h-full w-full object-cover object-top"
      />
    </span>
  );

  if (!bisaUbah) return foto;

  return (
    <>
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        aria-label="Ganti avatar"
        className="group relative shrink-0 rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] focus-visible:ring-offset-2 active:scale-95"
      >
        {foto}
        <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#E6B91E] text-[#0F2D1A] shadow-md">
          <Pencil aria-hidden="true" className="h-5 w-5" />
        </span>
      </button>

      {terbuka && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0F2D1A]/70 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih avatar"
          onClick={() => setTerbuka(false)}
        >
          <div
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-[#0F2D1A]">
                  Pilih avatar
                </h3>
                <p className="mt-1 text-base text-[#26352b]">
                  Sentuh gambar yang Ibu suka.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTerbuka(false)}
                aria-label="Tutup"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d5e2d2] text-[#1B4D2B] hover:bg-[#eaf1e8]"
              >
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {DAFTAR_AVATAR.map((a) => {
                const dipilih = a.id === avatar.id;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => pilih(a.id)}
                      disabled={sedangSimpan}
                      aria-label={a.alt}
                      aria-pressed={dipilih}
                      className={cn(
                        "relative block aspect-square w-full overflow-hidden rounded-[20px] border-4 bg-[#eaf1e8] transition active:scale-95 disabled:opacity-60",
                        dipilih
                          ? "border-[#3E8E1F]"
                          : "border-transparent hover:border-[#90C226]",
                      )}
                    >
                      <Image
                        src={a.src}
                        alt=""
                        width={160}
                        height={160}
                        className="h-full w-full object-cover object-top"
                      />
                      {dipilih && (
                        <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#3E8E1F] text-white">
                          <Check aria-hidden="true" className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default AvatarProfil;