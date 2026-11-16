import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrimaryButton({
  children,
  ikon: Ikon,
  sedangMemuat = false,
  lebarPenuh = false,
  ukuran = "lg",
  className,
  disabled,
  ...props
}) {
  return (
    <Button
      type="button"
      variant="default"
      size={ukuran}
      disabled={disabled || sedangMemuat}
      aria-busy={sedangMemuat}
      className={cn("min-h-14 text-base", lebarPenuh && "w-full", className)}
      {...props}
    >
      {sedangMemuat ? (
        <LoaderCircle
          aria-hidden="true"
          strokeWidth={2.5}
          className="h-5 w-5 shrink-0 animate-spin"
        />
      ) : (
        Ikon && <Ikon aria-hidden="true" className="h-5 w-5 shrink-0" />
      )}
      {children}
    </Button>
  );
}

export default PrimaryButton;