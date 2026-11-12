"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LABEL_KEPUTUSAN } from "@/lib/panganita/label";
import { kg, rupiah } from "@/lib/format";
import type { AlternatifKeputusan, Keputusan } from "@/lib/panganita/types";

type Props = {
  alternatif: AlternatifKeputusan[];
  onPilih: (k: Keputusan) => void;
  sibuk: boolean;
};

export function PilihanKartu({ alternatif, onPilih, sibuk }: Props) {
  return (
    <div className="grid gap-4">
      {alternatif.map((a) => {
        const info = LABEL_KEPUTUSAN[a.keputusan];
        return (
          <Card key={a.keputusan} className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-xl">{info.judul}</CardTitle>
              <p className="text-sm text-stone-600">{info.penjelasan}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Angka judul="Disimpan" nilai={kg(a.beratSimpanKg)} />
                <Angka judul="Dijual" nilai={kg(a.beratJualKg)} />
                <Angka judul="Perkiraan pendapatan" nilai={rupiah(a.pendapatanRp)} />
                <Angka judul="Cukup untuk" nilai={`${a.hariTercukupi} hari`} />
              </div>
              <p className="text-sm text-stone-700">
                Simpanan ini memenuhi {a.kontribusiEnergiPersen}% energi dan {a.kontribusiProteinPersen}% protein
                kebutuhan keluarga.
              </p>
              <Button className="h-12 w-full text-base" onClick={() => onPilih(a.keputusan)} disabled={sibuk}>
                Pilih ini
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Angka({ judul, nilai }: { judul: string; nilai: string }) {
  return (
    <div className="rounded-lg bg-stone-100 p-3">
      <p className="text-xs text-stone-600">{judul}</p>
      <p className="font-semibold">{nilai}</p>
    </div>
  );
}
