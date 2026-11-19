"use client";
import { useEffect, useRef, useState } from "react";
import type { SceneApi, TimeKey, ViewKey } from "./scene";

/* Casa Materia · prueba de realismo (patio tropical + sala de experiencias). */

const VIEWS: { k: ViewKey; label: string; title: string; text: string }[] = [
  { k: "aerea", label: "La casa", title: "Casa Materia", text: "Una casa de experiencias alrededor de un patio tropical: barra de café y vino, salas para crear, el horno, la boutique y los baños al costado del jardín." },
  { k: "entrada", label: "Entrada", title: "La entrada", text: "Escalones de travertino, un portón doble de roble y canteros tropicales a los dos lados. El cobogó terracota marca la sala de workshops." },
  { k: "patio", label: "Patio", title: "Patio tropical", text: "Piso de piedra irregular, monsteras, strelitzias y palmeras, una mesita para dos y guirnaldas de luces para la tarde." },
  { k: "barra", label: "Barra", title: "Barra de café y vino", text: "Isla curva con frente de listones de roble y tapa de travertino. Atrás, la cava, la cerámica de la casa y plantas que caen." },
  { k: "experiencias", label: "Experiencias", title: "Sala de experiencias", text: "Cerámica & Café y Cerámica & Vino: una mesa larga para catorce, sillas de ratán y lámparas de fibra." },
  { k: "workshops", label: "Workshops", title: "Sala de workshops", text: "Tres mesas de trabajo para azulejos, pantallas de lámparas, crochet o pastas. Las estanterías guardan materiales y piezas." },
  { k: "atelier", label: "Atelier", title: "Atelier de cerámica", text: "Cuatro tornos para los cursos mensuales, con estanterías de piezas en distintas etapas." },
  { k: "horno", label: "Horno", title: "Sala del horno", text: "El horno, los carros de secado y la mesa de amasado: conectada con el atelier, los workshops y la sala de experiencias." },
  { k: "boutique", label: "Boutique", title: "Boutique", text: "Piezas de la casa sobre estanterías de roble y una isla de exhibición. Pronto, también para comprar online." },
  { k: "banos", label: "Baños", title: "Lavamanos y baños", text: "Lavamanos de travertino en el jardín, con espejos ovalados sobre el biombo de listones. Detrás, dos baños individuales." },
];
const TIMES: { k: TimeKey; label: string; mood: string }[] = [
  { k: "11", label: "11:00", mood: "Luz de mañana" },
  { k: "18", label: "18:00", mood: "Atardecer" },
  { k: "20", label: "20:00", mood: "Noche" },
];

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function CasaMateria() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<SceneApi | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [view, setView] = useState<ViewKey>("aerea");
  const [time, setTime] = useState<TimeKey>("11");

  useEffect(() => {
    if (!canvas.current) return;
    if (!webglOk()) { setFailed("Tu navegador no puede mostrar escenas 3D (WebGL)."); return; }
    let disposed = false;
    // ?calidad=baja fuerza el modo liviano (celulares, equipos sin placa de video y capturas automáticas)
    const forced = new URLSearchParams(location.search).get("calidad") === "baja";
    const lowPower = forced || window.matchMedia("(max-width: 760px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    import("./scene").then(({ createScene }) => {
      if (disposed || !canvas.current) return;
      api.current = createScene(canvas.current, {
        lowPower,
        onProgress: (p) => setProgress(p),
        onReady: () => {
          // links directos a un espacio y un horario: ?vista=sala&hora=20
          const q = new URLSearchParams(location.search);
          const qv = q.get("vista") as ViewKey | null;
          const qt = q.get("hora") as TimeKey | null;
          const v0 = VIEWS.some((x) => x.k === qv) ? qv! : "aerea";
          const t0 = TIMES.some((x) => x.k === qt) ? qt! : "11";
          if (v0 !== "aerea" || t0 !== "11") api.current?.jumpTo(v0, t0);
          setView(v0);
          setTime(t0);
          setReady(true);
        },
        onError: () => setFailed("No se pudo cargar la casa. Probá recargar la página."),
      });
    });
    return () => { disposed = true; api.current?.dispose(); };
  }, []);

  const v = VIEWS.find((x) => x.k === view)!;
  return (
    <main className="cm">
      <canvas ref={canvas} className="cm-canvas" aria-label="Recorrido 3D de Casa Materia" />

      <header className="cm-top">
        <p className="cm-brand">Casa Materia</p>
        <p className="cm-sub">Atelier de experiencias creativas</p>
      </header>
      <p className="cm-tag">Prueba de realismo · versión de trabajo</p>

      {ready && (
        <>
          <section className="cm-card" aria-live="polite" key={view}>
            <h1>{v.title}</h1>
            <p>{v.text}</p>
          </section>

          <nav className="cm-views" aria-label="Espacios">
            {VIEWS.map((x) => (
              <button key={x.k} type="button" className={view === x.k ? "on" : ""} aria-pressed={view === x.k} onClick={() => { setView(x.k); api.current?.setView(x.k); history.replaceState(null, "", `?vista=${x.k}&hora=${time}`); }}>{x.label}</button>
            ))}
          </nav>

          <div className="cm-clock" role="group" aria-label="Horario">
            <p>Elegí un horario y mirá cómo cambia la luz</p>
            <div>
              {TIMES.map((t) => (
                <button key={t.k} type="button" className={time === t.k ? "on" : ""} aria-pressed={time === t.k} onClick={() => { setTime(t.k); api.current?.setTime(t.k); history.replaceState(null, "", `?vista=${view}&hora=${t.k}`); }}>
                  <b>{t.label}</b><small>{t.mood}</small>
                </button>
              ))}
            </div>
          </div>
          <p className="cm-hint">Arrastrá para mirar alrededor · rueda o pellizco para acercarte</p>
        </>
      )}

      {!ready && !failed && (
        <div className="cm-loader" role="status">
          <p className="cm-brand">Casa Materia</p>
          <span className="cm-bar"><i style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} /></span>
          <small>Preparando la casa · {Math.round(progress * 100)} %</small>
        </div>
      )}
      {failed && (
        <div className="cm-loader" role="alert">
          <p className="cm-brand">Casa Materia</p>
          <small>{failed}</small>
        </div>
      )}
    </main>
  );
}
