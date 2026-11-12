"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/** Idiomas de la web: español (Argentina) y portugués (Brasil). */
export type Lang = "es" | "pt";
const KEY = "nexa:lang";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "es", setLang: () => {} });

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "es" || q === "pt") return q;
    const saved = localStorage.getItem(KEY);
    if (saved === "es" || saved === "pt") return saved;
  } catch {
    /* sin almacenamiento */
  }
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "es";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => setLangState(initialLang()), []);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "es-AR";
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* sin almacenamiento */
    }
  }, []);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Devuelve el texto del idioma actual: const L = useL(); L("Hola", "Olá"). */
export function useL() {
  const { lang } = useLang();
  return useCallback(<T,>(es: T, pt: T): T => (lang === "pt" ? pt : es), [lang]);
}

export const locale = (lang: Lang) => (lang === "pt" ? "pt-BR" : "es-AR");
