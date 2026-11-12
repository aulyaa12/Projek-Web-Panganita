"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gagal, ok, pesanGalat, type HasilAksi } from "@/lib/aksi";
import { muatProfilSaya } from "@/lib/data/referensi";
import { jawabBuNita } from "@/lib/chat/bu-nita";
import { cariKonteks } from "@/lib/chat/rag";
import { jumlahOrangProfil } from "@/lib/panganita/profil";
import type { Pesan, RiwayatChatItem } from "@/lib/chat/types";

const kirimSchema = z.object({
  percakapanId: z.string().uuid(),
  isi: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong.")
    .max(2000, "Pesan terlalu panjang, maksimal 2000 karakter."),
});

export async function buatPercakapan(): Promise<HasilAksi<{ id: string }>> {
  try {
    const profil = await muatProfilSaya();
    if (!profil) return gagal("Lengkapi profil keluarga terlebih dahulu.");

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("percakapan")
      .insert({ profil_id: profil.id })
      .select("id")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Percakapan gagal dibuat.");
    return ok({ id: data.id });
  } catch (e) {
    return gagal(pesanGalat(e));
  }
}

export async function kirimPesan(
  raw: unknown,
): Promise<HasilAksi<{ pengguna: Pesan; asisten: Pesan }>> {
  try {
    const { percakapanId, isi } = kirimSchema.parse(raw);

    const profil = await muatProfilSaya();
    if (!profil) return gagal("Lengkapi profil keluarga terlebih dahulu.");

    const supabase = await createClient();

    // RLS memastikan percakapan ini hanya dapat dibaca pemiliknya.
    const { data: percakapan, error: errPercakapan } = await supabase
      .from("percakapan")
      .select("id, judul")
      .eq("id", percakapanId)
      .maybeSingle();
    if (errPercakapan || !percakapan) return gagal("Percakapan tidak ditemukan.");

    // Riwayat terakhir sebagai konteks percakapan.
    const { data: riwayatData } = await supabase
      .from("pesan_chat")
      .select("peran, isi")
      .eq("percakapan_id", percakapanId)
      .order("dibuat_pada", { ascending: false })
      .limit(10);
    const riwayat = ((riwayatData ?? []) as RiwayatChatItem[]).reverse();

    const { data: pesanPengguna, error: errPengguna } = await supabase
      .from("pesan_chat")
      .insert({ percakapan_id: percakapanId, peran: "pengguna", isi })
      .select("id, peran, isi, sumber_rujukan, dibuat_pada")
      .single();
    if (errPengguna || !pesanPengguna) throw new Error("Pesan gagal disimpan.");

    const konteks = await cariKonteks(isi);
    const jawaban = await jawabBuNita({
      riwayat,
      pertanyaan: isi,
      konteks,
      profil: {
        hamil: profil.ibu_hamil,
        trimester: profil.trimester_hamil,
        menyusui: profil.ibu_menyusui,
        jumlahOrang: jumlahOrangProfil(profil),
      },
    });

    const { data: pesanAsisten, error: errAsisten } = await supabase
      .from("pesan_chat")
      .insert({
        percakapan_id: percakapanId,
        peran: "asisten",
        isi: jawaban.teks,
        sumber_rujukan: jawaban.sumber.length ? jawaban.sumber : null,
        model_versi: jawaban.model,
      })
      .select("id, peran, isi, sumber_rujukan, dibuat_pada")
      .single();
    if (errAsisten || !pesanAsisten) throw new Error("Jawaban gagal disimpan.");

    // Judul percakapan diambil dari pertanyaan pertama.
    await supabase
      .from("percakapan")
      .update({
        judul: percakapan.judul ?? isi.slice(0, 60),
        diperbarui_pada: new Date().toISOString(),
      })
      .eq("id", percakapanId);

    revalidatePath("/bu-nita");
    return ok({ pengguna: pesanPengguna as Pesan, asisten: pesanAsisten as Pesan });
  } catch (e) {
    return gagal(pesanGalat(e));
  }
}
