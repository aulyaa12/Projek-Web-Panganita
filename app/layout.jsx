import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { NavKondisional } from "@/components/NavKondisional";

// Menggunakan font Plus Jakarta Sans dari file lokal.
const plusJakartaSans = localFont({
  src: "./fonts/PlusJakartaSans-Variable.ttf",
  variable: "--font-sans",
  display: "swap",
  weight: "400 800",
});

export const metadata = {
  title: "PANGANITA — Pangan dan Gizi untuk Keluarga",
  description:
    "Bantu keluarga mengatur hasil panen untuk memenuhi kebutuhan gizi dan meningkatkan kesejahteraan keluarga.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} min-h-dvh antialiased`}>
        <NavKondisional>{children}</NavKondisional>

        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}