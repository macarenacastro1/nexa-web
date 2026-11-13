"use client";
import { useEffect, useState } from "react";

/**
 * Botón fijo con los colores de NEXA para volver al sitio, al mismo idioma y
 * al mismo lugar desde donde se abrió el concepto. Además, la página siempre
 * abre desde el principio.
 */
type Ret = { path: string; lang: "es" | "pt" };
const KEY = "nexa:return";

export default function BackToNexa() {
  const [ret, setRet] = useState<Ret>({ path: "/", lang: "es" });
  const [cameFromNexa, setCame] = useState(false);

  useEffect(() => {
    // abrir siempre arriba (el navegador a veces recuerda la posición anterior)
    try { history.scrollRestoration = "manual"; } catch { /* nada */ }
    if (!location.hash) window.scrollTo(0, 0);
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setRet(JSON.parse(raw) as Ret);
      const ref = document.referrer ? new URL(document.referrer) : null;
      setCame(!!raw && !!ref && ref.origin === location.origin);
    } catch { /* sin almacenamiento */ }
    return () => { try { history.scrollRestoration = "auto"; } catch { /* nada */ } };
  }, []);

  const back = (e: React.MouseEvent) => {
    // volver con el historial conserva el punto exacto donde estaba la persona
    if (cameFromNexa && history.length > 1) { e.preventDefault(); history.back(); }
  };

  const es = ret.lang === "es";
  return (
    <a className="nx-back" href={`${ret.path}#servicios`} onClick={back} lang={es ? "es" : "pt-BR"}>
      <span className="nx-back__arr" aria-hidden>←</span>
      <span className="nx-back__txt">{es ? "Volver a" : "Voltar para"} <b>NEXA</b></span>
    </a>
  );
}

export function rememberReturn(lang: "es" | "pt") {
  try { sessionStorage.setItem(KEY, JSON.stringify({ path: location.pathname, lang })); } catch { /* nada */ }
}
