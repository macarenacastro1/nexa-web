import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/config";
import { LangProvider, type Lang } from "@/lib/i18n";
import { SITE } from "@/lib/seo";

/** Datos estructurados: nombre del sitio y logo que Google muestra en los resultados. */
const LD = JSON.stringify([
  { "@context": "https://schema.org", "@type": "WebSite", name: "The Nexa Company", alternateName: ["Nexa", "NEXA"], url: `${SITE}/` },
  { "@context": "https://schema.org", "@type": "Organization", name: "The Nexa Company", url: `${SITE}/`, logo: `${SITE}/logo-512.png` },
]);

/**
 * Documento HTML compartido. Cada idioma tiene su propio layout raíz
 * (`app/(es)` y `app/(pt)`) para que el HTML salga con el `lang` correcto
 * y Google pueda indexar las dos versiones por separado.
 */
export default function Doc({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang === "pt" ? "pt-BR" : "es-AR"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      </head>
      <body>
        <a className="skip" href="#main">{lang === "pt" ? "Pular para o conteúdo" : "Saltar al contenido"}</a>
        <LangProvider lang={lang}>{children}</LangProvider>
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
