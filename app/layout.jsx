import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { NavKondisional } from "@/components/NavKondisional";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
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
