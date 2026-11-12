"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gagal, ok, pesanGalat, type HasilAksi } from "@/lib/aksi";

const jumlah = z.number().int().min(0).max(20);

const profilSchema = z
  .object({
    nama_ibu: z.string().trim().min(1, "Nama ibu wajib diisi.").max(100),
    provinsi: z.string().trim().max(100).optional().nullable(),
    kabupaten_kota: z.string().trim().max(100).optional().nullable(),
    ibu_hamil: z.boolean(),
    trimester_hamil: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable(),
    ibu_menyusui: z.boolean(),
    periode_menyusui: z.union([z.literal(1), z.literal(2)]).nullable(),
    jumlah_bayi_6_11: jumlah,
    jumlah_anak_1_3: jumlah,
    jumlah_anak_4_6: jumlah,
    jumlah_anak_7_9: jumlah,
    jumlah_anak_l_10_12: jumlah,
    jumlah_anak_p_10_12: jumlah,
  })
  .superRefine((d, ctx) => {
    if (d.ibu_hamil && d.trimester_hamil === null) {
      ctx.addIssue({ code: "custom", path: ["trimester_hamil"], message: "Pilih trimester kehamilan." });
    }
    if (d.ibu_menyusui && d.periode_menyusui === null) {
      ctx.addIssue({ code: "custom", path: ["periode_menyusui"], message: "Pilih usia bayi termuda." });
    }
  });

export async function simpanProfil(raw: unknown): Promise<HasilAksi<{ id: number }>> {
  try {
    const d = profilSchema.parse(raw);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return gagal("Silakan masuk terlebih dahulu.");

    const { data, error } = await supabase
      .from("profil_keluarga")
      .upsert(
        {
          user_id: user.id,
          nama_ibu: d.nama_ibu,
          provinsi: d.provinsi || null,
          kabupaten_kota: d.kabupaten_kota || null,
          ibu_hamil: d.ibu_hamil,
          trimester_hamil: d.ibu_hamil ? d.trimester_hamil : null,
          ibu_menyusui: d.ibu_menyusui,
          periode_menyusui: d.ibu_menyusui ? d.periode_menyusui : null,
          jumlah_bayi_6_11: d.jumlah_bayi_6_11,
          jumlah_anak_1_3: d.jumlah_anak_1_3,
          jumlah_anak_4_6: d.jumlah_anak_4_6,
          jumlah_anak_7_9: d.jumlah_anak_7_9,
          jumlah_anak_l_10_12: d.jumlah_anak_l_10_12,
          jumlah_anak_p_10_12: d.jumlah_anak_p_10_12,
          diperbarui_pada: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("id")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Profil gagal disimpan.");

    revalidatePath("/keluarga");
    revalidatePath("/dashboard");
    return ok({ id: data.id });
  } catch (e) {
    return gagal(pesanGalat(e));
  }
}
