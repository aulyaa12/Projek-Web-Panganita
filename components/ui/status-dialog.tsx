"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

type StatusDialogType = "success" | "error" | "loading" | "warning";

interface StatusDialogProps {
  open: boolean;
  type: StatusDialogType;
  title: string;
  message?: string;
  duration?: number;
  actionLabel?: string;
  cancelLabel?: string;
  onAction?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
}

const STATUS_STYLES = {
  success: {
    container: "border-[#B8D9B2] bg-[#E8F5E9] text-[#1B4D2B]",
    message: "text-[#315B40]",
    button: "bg-[#1B4D2B] text-white hover:bg-[#0F2D1A]",
  },
  error: {
    container: "border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]",
    message: "text-[#991B1B]",
    button: "bg-[#1B4D2B] text-white hover:bg-[#0F2D1A]",
  },
  loading: {
    container: "border-[#D1DCCF] bg-[#F0F5ED] text-[#1B4D2B]",
    message: "text-[#315B40]",
    button: "bg-[#1B4D2B] text-white hover:bg-[#0F2D1A]",
  },
  warning: {
    container: "border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]",
    message: "text-[#991B1B]",
    button: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
  },
} as const;

export function StatusDialog({
  open,
  type,
  title,
  message,
  duration = 0,
  actionLabel,
  cancelLabel,
  onAction,
  onCancel,
  onClose,
  className = "",
}: StatusDialogProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || duration <= 0) return;

    const timer = window.setTimeout(() => {
      onCloseRef.current?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [open, duration]);

  if (!open) return null;

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "loading"
        ? LoaderCircle
        : AlertCircle;

  const styles = STATUS_STYLES[type];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[5.5rem] z-[130] flex justify-center px-4 sm:top-24">
      <section
        role={type === "error" || type === "warning" ? "alert" : "status"}
        aria-live={
          type === "error" || type === "warning" ? "assertive" : "polite"
        }
        aria-atomic="true"
        className={`pointer-events-auto w-full max-w-2xl rounded-xl border p-4 shadow-lg ${styles.container} ${className}`}
      >
        <div className="flex items-center justify-center gap-2 text-center">
          <Icon
            size={20}
            strokeWidth={2.4}
            className={`shrink-0 ${type === "loading" ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <h3 className="text-sm font-bold leading-snug sm:text-base">
            {title}
          </h3>
        </div>

        {message && (
          <p
            className={`mt-2 text-center text-sm leading-relaxed ${styles.message}`}
          >
            {message}
          </p>
        )}

        {(actionLabel || cancelLabel) && (
          <div
            className={`mt-3 grid gap-2 ${
              actionLabel && cancelLabel ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {cancelLabel && (
              <button
                type="button"
                onClick={onCancel ?? onClose}
                className="flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                {cancelLabel}
              </button>
            )}

            {actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className={`flex min-h-10 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#90C226] focus-visible:ring-offset-2 ${styles.button}`}
              >
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
