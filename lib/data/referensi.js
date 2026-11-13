// Fungsi pembacaan data.
// Hanya digunakan di Server Components dan Server Actions.

import { createClient } from "@/lib/supabase/server";

/**
 * Memuat profil keluarga pengguna yang sedang login.
 */
export async function muatProfilSaya() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profil_keluarga")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[muatProfilSaya]", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(
      `Profil keluarga gagal dimuat: ${error.message} (${error.code})`,
    );
  }

  return data ?? null;
}

/**
 * Memuat data kebutuhan gizi.
 */
export async function muatKebutuhanGizi() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("kebutuhan_gizi").select("*");

  if (error || !data) {
    throw new Error("Data kebutuhan gizi gagal dimuat.");
  }

  return data;
}

/**
 * Memuat seluruh daftar bahan pangan.
 */
export async function muatDaftarBahan() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bahan_pangan")
    .select(
      "id, nama, nama_kelas_cv, kategori, bdd, energi_kkal_per_100g_bdd, protein_g_per_100g_bdd, harga_umum_per_kg",
    )
    .order("nama");

  if (error || !data) {
    throw new Error("Daftar pangan gagal dimuat.");
  }

  return data;
}

/**
 * Memuat satu bahan pangan berdasarkan ID.
 */
export async function muatBahan(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bahan_pangan")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Data pangan gagal dimuat.");
  }

  return data ?? null;
}

/**
 * Memuat aturan kalkulasi yang aktif.
 * Rumus yang disahkan diutamakan.
 * Jika belum tersedia, gunakan draf terbaru.
 */
export async function muatAturanAktif() {
  const supabase = await createClient();

  const { data: disahkan } = await supabase
    .from("pengaturan_rumus")
    .select("*")
    .eq("status_pengesahan", "disahkan")
    .order("berlaku_mulai", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (disahkan) return disahkan;

  const { data: draf, error } = await supabase
    .from("pengaturan_rumus")
    .select("*")
    .order("berlaku_mulai", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !draf) {
    throw new Error("Pengaturan rumus belum tersedia.");
  }

  return draf;
}
