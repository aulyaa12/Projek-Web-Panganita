"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LABEL_KEPUTUSAN } from "@/lib/panganita/label";
import { kg, rupiah } from "@/lib/format";
import type {
  AlternatifKeputusan,
  Keputusan,
} from "@/lib/panganita/types";

type Props = {
  alternatif: AlternatifKeputusan[];
  onPilih: (keputusan: Keputusan) => void;
  sibuk: boolean;
};

export function PilihanKartu({
  alternatif,
  onPilih,
  sibuk,
}: Props) {
  return (
    <div className="grid gap-4">
      {alternatif.map((a) => {
        const info = LABEL_KEPUTUSAN[a.keputusan];

        return (
          <Card
            key={a.keputusan}
            className="rounded-[16px] border-2 border-[#90C226]/40 bg-white"
          >
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-bold text-[#0F2D1A]">
                {info.judul}
              </CardTitle>

              <p className="text-sm leading-6 text-stone-600">
                {info.penjelasan}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Angka
                  judul="Disimpan"
                  nilai={kg(a.beratSimpanKg)}
                />

                <Angka
                  judul="Dijual"
                  nilai={kg(a.beratJualKg)}
                />

                <Angka
                  judul="Perkiraan pendapatan"
                  nilai={rupiah(a.pendapatanRp)}
                />

                <Angka
                  judul="Cukup untuk"
                  nilai={`${a.hariTercukupi} hari`}
                />
              </div>

              <p className="text-sm leading-6 text-[#1B4D2B]">
                Simpanan ini memenuhi{" "}
                <span className="font-semibold">
                  {a.kontribusiEnergiPersen}%
                </span>{" "}
                energi dan{" "}
                <span className="font-semibold">
                  {a.kontribusiProteinPersen}%
                </span>{" "}
                protein kebutuhan keluarga.
              </p>

              <Button
                size="lg"
                className="w-full"
                onClick={() => onPilih(a.keputusan)}
                disabled={sibuk}
              >
                {sibuk ? "Menyimpan…" : "Pilih ini"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

type AngkaProps = {
  judul: string;
  nilai: string;
};

function Angka({ judul, nilai }: AngkaProps) {
  return (
    <div className="rounded-xl border border-[#90C226]/30 bg-[#90C226]/10 p-3">
      <p className="text-xs font-medium text-[#1B4D2B]">
        {judul}
      </p>

      <p className="mt-1 font-semibold text-[#0F2D1A]">
        {nilai}
      </p>
    </div>
  );
}