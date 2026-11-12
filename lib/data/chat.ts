import { createClient } from "@/lib/supabase/server";
import type { Pesan, PercakapanRingkas } from "@/lib/chat/types";

export async function daftarPercakapan(): Promise<PercakapanRingkas[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("percakapan")
    .select("id, judul, diperbarui_pada")
    .eq("diarsipkan", false)
    .order("diperbarui_pada", { ascending: false })
    .limit(20);
  if (error) throw new Error("Daftar percakapan gagal dimuat.");
  return (data ?? []) as PercakapanRingkas[];
}

export async function muatPesan(percakapanId: string): Promise<Pesan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pesan_chat")
    .select("id, peran, isi, sumber_rujukan, dibuat_pada")
    .eq("percakapan_id", percakapanId)
    .order("dibuat_pada", { ascending: true });
  if (error) throw new Error("Pesan gagal dimuat.");
  return (data ?? []) as Pesan[];
}
