"use client";

import { useEffect, useState } from "react";

type Props = {
  nilai: string;
};

export function TanggalWaktuLokal({ nilai }: Props) {
  const [waktu, setWaktu] = useState("");

  useEffect(() => {
    const tanggal = new Date(nilai);

    if (Number.isNaN(tanggal.getTime())) {
      setWaktu("Waktu tidak tersedia");
      return;
    }

    const hasil = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(tanggal);

    setWaktu(hasil);
  }, [nilai]);

  return <time dateTime={nilai}>{waktu || "Memuat waktu..."}</time>;
}

export default TanggalWaktuLokal;
