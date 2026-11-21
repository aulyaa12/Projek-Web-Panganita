import { redirect } from "next/navigation";

import ChatBuNita from "@/components/chat/ChatBuNita";
import { muatProfilSaya } from "@/lib/data/referensi";

export const dynamic = "force-dynamic";

export default async function HalamanBuNita() {
  const profil = await muatProfilSaya();

  if (!profil) {
    redirect("/keluarga");
  }

  const lokasi = [profil.kabupaten_kota, profil.provinsi]
    .filter(Boolean)
    .join(", ");

  // <main> sudah disediakan NavKondisional, jadi tidak dibungkus <main> lagi.
  return <ChatBuNita namaIbu={profil.nama_ibu} lokasi={lokasi} />;
}