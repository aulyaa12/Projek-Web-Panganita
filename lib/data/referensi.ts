// Fungsi pembacaan data. Hanya dipakai di server (Server Components dan Server Actions).
import { createClient } from "@/lib/supabase/server";
import type {
  BahanPangan,
  KebutuhanGizi,
  PengaturanRumus,
  ProfilKeluarga,
} from "@/lib/panganita/types";

export async function muatProfilSaya(): Promise<ProfilKeluarga | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profil_keluarga")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Profil keluarga gagal dimuat.");
  return (data as ProfilKeluarga | null) ?? null;
}

export async function muatKebutuhanGizi(): Promise<KebutuhanGizi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("kebutuhan_gizi").select("*");
  if (error || !data) throw new Error("Data kebutuhan gizi gagal dimuat.");
  return data as KebutuhanGizi[];
}

export async function muatDaftarBahan(): Promise<BahanPangan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bahan_pangan")
    .select(
      "id, nama, nama_kelas_cv, kategori, bdd, energi_kkal_per_100g_bdd, protein_g_per_100g_bdd, harga_umum_per_kg",
    )
    .order("nama");
  if (error || !data) throw new Error("Daftar pangan gagal dimuat.");
  return data as BahanPangan[];
}

export async function muatBahan(id: number): Promise<BahanPangan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bahan_pangan")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Data pangan gagal dimuat.");
  return (data as BahanPangan | null) ?? null;
}

// Rumus yang disahkan diutamakan. Jika belum ada, dipakai draf terbaru (hanya untuk pengembangan).
export async function muatAturanAktif(): Promise<PengaturanRumus> {
  const supabase = await createClient();

  const { data: disahkan } = await supabase
    .from("pengaturan_rumus")
    .select("*")
    .eq("status_pengesahan", "disahkan")
    .order("berlaku_mulai", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (disahkan) return disahkan as PengaturanRumus;

  const { data: draf, error } = await supabase
    .from("pengaturan_rumus")
    .select("*")
    .order("berlaku_mulai", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !draf) throw new Error("Pengaturan rumus belum tersedia.");
  return draf as PengaturanRumus;
}
