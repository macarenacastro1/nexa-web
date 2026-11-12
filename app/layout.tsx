import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { GA_MEASUREMENT_ID } from "@/lib/config";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://thenexacompany.com"),
  title: "NEXA · Automatización e IA para empresas",
  description:
    "Transformamos empresas que trabajan con procesos manuales en sistemas inteligentes y automatizados. Probá la transformación vos mismo.",
  openGraph: {
    title: "NEXA · Automatización e IA para empresas",
    description: "Del caos al control: sistemas, automatizaciones e IA para empresas de Argentina y Brasil.",
    url: "https://thenexacompany.com",
    siteName: "NEXA",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NEXA" }],
    locale: "es_AR",
    alternateLocale: ["pt_BR"],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
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
