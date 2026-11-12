import { Button } from "@/components/ui/button";

type Props = {
  nilai: number;
  onChange: (n: number) => void;
  label: string;
  maks?: number;
};

export function Stepper({ nilai, onChange, label, maks = 20 }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Kurangi ${label}`}
        disabled={nilai <= 0}
        onClick={() => onChange(Math.max(0, nilai - 1))}
      >
        −
      </Button>
      <span className="w-8 text-center text-lg font-semibold tabular-nums">{nilai}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Tambah ${label}`}
        disabled={nilai >= maks}
        onClick={() => onChange(Math.min(maks, nilai + 1))}
      >
        +
      </Button>
    </div>
  );
}
