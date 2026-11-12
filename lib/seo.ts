import type { Metadata } from "next";
import type { Lang } from "./i18n";

export const SITE = "https://thenexacompany.com";

/** Metadatos de una página: título, descripción, canonical, hreflang y Open Graph. */
export function pageMeta(lang: Lang, path: string, title: string, description: string): Metadata {
  const es = path;
  const pt = `/pt${path}`;
  const url = lang === "pt" ? pt : es;
  return {
    metadataBase: new URL(SITE),
    title,
    description,
    alternates: {
      canonical: url,
      languages: { "es-AR": es, "pt-BR": pt, "x-default": es },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "The Nexa Company",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Nexa Company" }],
      locale: lang === "pt" ? "pt_BR" : "es_AR",
      alternateLocale: lang === "pt" ? ["es_AR"] : ["pt_BR"],
      type: "website",
    },
    twitter: { card: "summary_large_image", images: ["/og.png"] },
  };
}

/** Rutas públicas e indexables (para el sitemap). */
export const ROUTES = ["/", "/experience/", "/systems/", "/intelligence/", "/proyectos/", "/privacidad/"];
