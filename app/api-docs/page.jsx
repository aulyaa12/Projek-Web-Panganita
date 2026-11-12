"use client";

import { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function ApiDocsPage() {
  useEffect(() => {
    const initSwagger = () => {
      if (typeof window !== "undefined" && window.SwaggerUIBundle) {
        window.SwaggerUIBundle({
          url: `/api/openapi.json?t=${Date.now()}`,
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            window.SwaggerUIBundle.presets.apis,
            window.SwaggerUIStandalonePreset ||
              window.SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: "BaseLayout",
          docExpansion: "list",
          defaultModelsExpandDepth: 1,
        });
      }
    };

    if (window.SwaggerUIBundle) {
      initSwagger();
      return undefined;
    }

    const interval = setInterval(() => {
      if (window.SwaggerUIBundle) {
        clearInterval(interval);
        initSwagger();
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#F7FCF8] pt-20 text-[#173D30]">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css"
      />

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"
        strategy="afterInteractive"
      />

      <header className="border-b border-[#D0EBDD] bg-[#105A40] px-4 py-4 text-white shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              PANGANITA API Documentation
            </h1>
            <p className="text-xs text-green-100/90">
              OpenAPI 3.0.3 • Spesifikasi REST API Platform PANGANITA
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 hover:bg-white/20"
            >
              OpenAPI JSON
            </a>
            <Link
              href="/bu-nita"
              className="rounded-lg bg-white px-3 py-1.5 text-[#105A40] hover:bg-green-50"
            >
              Buka Bu Nita AI
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8">
        <div className="rounded-xl border border-[#C8E9D6] bg-white px-4 py-3 text-xs leading-relaxed text-[#294A3B] shadow-sm">
          <span className="font-semibold text-[#105A40]">Catatan Pengujian:</span>{" "}
          Gunakan tombol <em>Try it out</em> untuk menguji endpoint secara
          langsung. Untuk endpoint yang membutuhkan sesi pengguna (seperti{" "}
          <code>/api/chat</code>, <code>/api/profil</code>,{" "}
          <code>/api/pindai</code>, <code>/api/keputusan</code>, dan{" "}
          <code>/api/riwayat</code>), silakan login terlebih dahulu melalui{" "}
          <Link href="/masuk" className="font-semibold text-[#105A40] underline">
            /masuk
          </Link>{" "}
          pada browser yang sama agar cookie sesi Supabase terkirim otomatis.
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-2 py-4 sm:px-6">
        <div id="swagger-ui" />
      </div>
    </main>
  );
}

