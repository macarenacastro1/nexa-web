import type { MetadataRoute } from "next";
import { ROUTES, SITE } from "@/lib/seo";

export const dynamic = "force-static";

/** Sitemap con las dos versiones de cada página (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: `${SITE}${r}`,
    alternates: { languages: { "es-AR": `${SITE}${r}`, "pt-BR": `${SITE}/pt${r}` } },
  })).flatMap((e, i) => [e, { url: `${SITE}/pt${ROUTES[i]}`, alternates: e.alternates }]);
}
