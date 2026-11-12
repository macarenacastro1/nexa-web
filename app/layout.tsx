import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { GA_MEASUREMENT_ID } from "@/lib/config";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "NEXA · Automatización e IA para empresas",
  description:
    "Transformamos empresas que trabajan con procesos manuales en sistemas inteligentes y automatizados. Probá la transformación vos mismo.",
};

export const viewport: Viewport = { themeColor: "#07080a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Caveat:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2307080a'/%3E%3Cpath d='M9 23V9l14 14V9' stroke='%232de2c8' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
        {/* Google Analytics (etiqueta de Google) */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </body>
    </html>
  );
}
