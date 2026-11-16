// Taruh gambar di public/images/avatar/ava-1.png, ava-2.png, dst.
// Tambah atau kurangi avatar cukup lewat daftar ini.
export const DAFTAR_AVATAR = Array.from({ length: 9 }, (_, i) => ({
  id: `ava-${i + 1}`,
  src: `/images/avatar/ava-${i + 1}.png`,
  alt: `Avatar ${i + 1}`,
}));

export const AVATAR_DEFAULT = DAFTAR_AVATAR[0];

// ID yang tidak dikenal (atau kosong) otomatis jatuh ke avatar default.
export function cariAvatar(id) {
  return DAFTAR_AVATAR.find((a) => a.id === id) ?? AVATAR_DEFAULT;
}