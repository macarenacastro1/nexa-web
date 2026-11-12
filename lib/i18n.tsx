"use client";
import { createContext, useCallback, useContext, type ReactNode } from "react";

/**
 * Idiomas de la web: español (Argentina) en `/` y portugués (Brasil) en `/pt/`.
 * El idioma lo define la dirección; el botón ES/PT lleva a la misma página
 * en el otro idioma.
 */
export type Lang = "es" | "pt";

const Ctx = createContext<Lang>("es");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

/** Misma página en el otro idioma (conserva el ancla). */
export function otherLangPath(lang: Lang, pathname: string) {
  if (lang === "pt") return pathname.replace(/^\/pt(\/|$)/, "/") || "/";
  return `/pt${pathname === "/" ? "/" : pathname}`;
}

export function useLang() {
  const lang = useContext(Ctx);
  const setLang = useCallback(
    (l: Lang) => {
      if (l === lang) return;
      try {
        localStorage.setItem("nexa:lang", l);
      } catch {
        /* sin almacenamiento */
      }
      window.location.assign(otherLangPath(lang, window.location.pathname) + window.location.hash);
    },
    [lang],
  );
  return { lang, setLang };
}

/** Devuelve el texto del idioma actual: const L = useL(); L("Hola", "Olá"). */
export function useL() {
  const lang = useContext(Ctx);
  return useCallback(<T,>(es: T, pt: T): T => (lang === "pt" ? pt : es), [lang]);
}

/** Arma enlaces internos en el idioma actual: href("/systems/") → "/pt/systems/". */
export function useHref() {
  const lang = useContext(Ctx);
  return useCallback((path: string) => (lang === "pt" ? `/pt${path}` : path), [lang]);
}

export const locale = (lang: Lang) => (lang === "pt" ? "pt-BR" : "es-AR");
