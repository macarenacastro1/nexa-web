"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sound } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Win = { id: string; x: number; y: number; w: number; r: number; hideSm?: boolean; node: React.ReactNode };

const Bar = ({ title, badge }: { title: string; badge?: string }) => (
  <div className="win__bar">
    <i /><i /><i />
    <span>{title}</span>
    {badge && <b className="badge">{badge}</b>}
  </div>
);

const WINDOWS: Win[] = [
  {
    id: "mail", x: 2.5, y: 13, w: 310, r: -4,
    node: (
      <div className="win">
        <Bar title="Bandeja de entrada — 2.318 sin leer" badge="99+" />
        <div className="win__body">
          {[
            ["URGENTE: factura vencida", "Proveedor Textil Sur · 2º aviso", "09:12"],
            ["Re: Re: Re: ¿Pudiste ver el presupuesto?", "Cliente esperando hace 3 días", "08:47"],
            ["Pedido #4471 sin confirmar", "Ventas online", "08:30"],
            ["Reclamo: no me respondieron", "soporte@ · prioridad alta", "Ayer"],
            ["Reunión movida (otra vez)", "Calendario", "Ayer"],
          ].map(([a, b, t]) => (
            <div className="mail-row" key={a}><span className="dot" /><div><strong>{a}</strong><small>{b}</small></div><time>{t}</time></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "sheet", x: 67, y: 11, w: 340, r: 3,
    node: (
      <div className="win win--light">
        <Bar title="Pedidos_FINAL_v3 (2).xlsx" />
        <div className="sheet">
          {["", "A", "B", "C", "D"].map((h) => <span className="h" key={"h" + h}>{h}</span>)}
          {[
            ["1", "Cliente", "Monto", "Estado", "Stock"],
            ["2", "Moda Norte", "$184.000", "¿pagó?", "#REF!"],
            ["3", "Dist. Sur", "$92.500", "pendiente", "12"],
            ["4", "Textil Andes", "#¡VALOR!", "???", "-4"],
            ["5", "Local Centro", "$41.200", "duplicado", "0"],
            ["6", "Tienda Web", "$77.900", "sin cargar", "#N/A"],
          ].map((row) =>
            row.map((c, i) => (
              <span key={row[0] + i} className={i === 0 ? "h" : /#|\?|-4|duplicado/.test(c) ? "bad" : /pendiente|sin cargar/.test(c) ? "warn" : ""}>{c}</span>
            ))
          )}
        </div>
      </div>
    ),
  },
  {
    id: "wa", x: 74, y: 50, w: 290, r: -3,
    node: (
      <div className="win">
        <Bar title="WhatsApp Business" badge="47" />
        <div className="win__body">
          {[
            ["#25d366", "LG", "Laura G.", "Hola? Hay alguien? 😡", "12"],
            ["#0a84ff", "MP", "Martín P.", "¿Precio por mayor?", "5"],
            ["#ff9f0a", "SC", "Sofía C.", "Quiero cambiar el pedido", "8"],
            ["#bf5af2", "DR", "Diego R.", "¿Hacen envíos a Córdoba?", "3"],
          ].map(([c, i, n, m, b]) => (
            <div className="chat-row" key={n}><span className="av" style={{ background: c }}>{i}</span><div><strong>{n}</strong><small>{m}</small></div><i className="badge">{b}</i></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "alert", x: 7, y: 56, w: 250, r: 5,
    node: (
      <div className="win alert-win" data-shake>
        <div className="ico">!</div>
        <strong>No se pudo sincronizar</strong>
        <p>Hay 3 versiones distintas de la lista de precios.</p>
        <div className="btns"><span>Ignorar</span><span>Reintentar</span></div>
      </div>
    ),
  },
  {
    id: "sticky1", x: 25, y: 67, w: 160, r: -8, hideSm: true,
    node: <div className="sticky">Llamar al contador!!!<br />URGENTE<br />(antes del viernes)</div>,
  },
  {
    id: "cal", x: 55, y: 69, w: 300, r: 4, hideSm: true,
    node: (
      <div className="win">
        <Bar title="Calendario — Esta semana" badge="6" />
        <div className="win__body cal">
          {["Lun", "Mar", "Mié", "Jue", "Vie"].map((d) => <span key={d} style={{ background: "none", opacity: .5 }}>{d}</span>)}
          <span className="ev">Reunión</span><span className="ev2">Entrega</span><span className="ev">Call</span><span className="ev3">Pagos</span><span className="ev2">Vence</span>
          <span className="ev2">Reclamo</span><span className="ev">Call</span><span className="ev3">Stock</span><span className="ev">Reunión</span><span className="ev2">Choque</span>
        </div>
      </div>
    ),
  },
  {
    id: "ig", x: 31, y: 15, w: 270, r: 2,
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "linear-gradient(45deg,#f58529,#dd2a7b,#8134af)" }}>IG</span>
        <div><strong>Instagram</strong><small>34 comentarios y 19 mensajes sin responder</small></div>
      </div>
    ),
  },
  {
    id: "pay", x: 84, y: 31, w: 250, r: -5, hideSm: true,
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#0a84ff" }}>$</span>
        <div><strong>Banco</strong><small>5 transferencias sin conciliar</small></div>
      </div>
    ),
  },
  {
    id: "sticky2", x: 88, y: 78, w: 150, r: 7, hideSm: true,
    node: <div className="sticky sticky--pink">Stock?? revisar planilla v3_FINAL</div>,
  },
  {
    id: "crm", x: 11, y: 37, w: 250, r: -2,
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#ff453a" }}>CRM</span>
        <div><strong>47 leads sin seguimiento</strong><small>El más antiguo: hace 12 días</small></div>
      </div>
    ),
  },
  {
    id: "remail", x: 20, y: 86, w: 250, r: 3, hideSm: true,
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#636366" }}>✉</span>
        <div><strong>Re: Re: Fwd: Presupuesto</strong><small>“Te lo reenvío por las dudas…”</small></div>
      </div>
    ),
  },
  {
    id: "file", x: 61, y: 37, w: 250, r: -6,
    node: (
      <div className="win alert-win" data-shake>
        <div className="ico">⚠</div>
        <strong>Archivo en uso</strong>
        <p>“Clientes_definitivo_ESTE.xlsx” está abierto por otra persona.</p>
        <div className="btns"><span>Cancelar</span><span>Solo lectura</span></div>
      </div>
    ),
  },
  {
    id: "tasks", x: 1.5, y: 74, w: 260, r: -2, hideSm: true,
    node: (
      <div className="win win--light">
        <Bar title="Tareas" badge="23" />
        <div className="win__body">
          {["Responder a 12 clientes", "Cargar pedidos de ayer", "Pasar stock a la planilla", "Mandar presupuestos"].map((t) => (
            <div className="mail-row" key={t}><span className="dot" style={{ background: "#ff453a" }} /><div><strong>{t}</strong><small className="err">Vencida</small></div><time>!</time></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "backup", x: 82, y: 4.5, w: 250, r: 4, hideSm: true,
    node: (
      <div className="win toast-win">
        <span className="app-ico" style={{ background: "#ff9f0a" }}>!</span>
        <div><strong>Sistema</strong><small>La copia de seguridad falló (otra vez)</small></div>
      </div>
    ),
  },
];

const fmt = (n: number) => Math.round(n).toLocaleString("es-AR");

export default function ChaosStage() {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const floats = useRef<gsap.core.Tween[]>([]);
  const prog = useRef(0);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);
  const [calm, setCalm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [unread, setUnread] = useState(1284);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const lastTick = useRef(0);

  // notifications keep piling up while in chaos
  useEffect(() => {
    if (calm) return;
    const id = setInterval(() => setUnread((u) => u + Math.ceil(Math.random() * 3)), 700);
    return () => clearInterval(id);
  }, [calm]);

  // compute wire endpoints (window centers → stage center)
  const measure = () => {
    const el = root.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.width / 2, cy = r.height / 2;
    const ls = [...el.querySelectorAll<HTMLElement>(".win-pos")].map((w) => ({
      x1: w.offsetLeft + w.offsetWidth / 2, y1: w.offsetTop + w.offsetHeight / 2, x2: cx, y2: cy,
    }));
    setLines(ls);
  };

  useIso(() => {
    const el = root.current!;
    measure();
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // living chaos
      if (!reduce) {
        floats.current = gsap.utils.toArray<HTMLElement>(".win-float").map((f) =>
          gsap.to(f, {
            x: () => gsap.utils.random(-26, 26), y: () => gsap.utils.random(-20, 20), rotation: () => gsap.utils.random(-3, 3),
            duration: () => gsap.utils.random(2.2, 4.2), ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true,
          })
        );
        gsap.utils.toArray<HTMLElement>("[data-shake]").forEach((s, i) => {
          gsap.timeline({ repeat: -1, repeatDelay: 2.6 + i, delay: i * 1.3 })
            .to(s, { x: -6, duration: 0.05 }).to(s, { x: 6, duration: 0.05, repeat: 5, yoyo: true }).to(s, { x: 0, duration: 0.05 });
        });
      }
      // entrance
      gsap.from(".win-pos", { opacity: 0, scale: 0.6, duration: 0.9, ease: "back.out(1.6)", stagger: { each: 0.06, from: "random" }, delay: 0.15 });
      gsap.from(".copy-chaos > *", { opacity: 0, y: 30, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.5 });
      gsap.from(".morph, .counter-pill", { opacity: 0, y: 20, duration: 0.8, delay: 1.1, ease: "power3.out" });

      // the transformation timeline (scrubbed by the slider)
      const wins = gsap.utils.toArray<HTMLElement>(".win-pos");
      const r = el.getBoundingClientRect();
      const t = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
      t.to(".copy-chaos", { opacity: 0, y: -30, scale: 0.96, duration: 0.2 }, 0)
        .to(".win .badge, .win .err, .alert-win .ico", { opacity: 0, scale: 0.4, duration: 0.15, stagger: 0.003 }, 0.02)
        .to(".sheet .bad, .sheet .warn", { backgroundColor: "rgba(50,215,75,.14)", color: "#1c7c2e", duration: 0.15 }, 0.05)
        .to(".wire", { strokeDashoffset: 0, duration: 0.25, stagger: 0.008 }, 0.18)
        .to(".stage__bg--calm", { opacity: 1, duration: 0.45 }, 0.25)
        .to(".stage__veil", { opacity: 0, duration: 0.3 }, 0.25);
      wins.forEach((w, i) => {
        const cx = r.width / 2 - (w.offsetLeft + w.offsetWidth / 2);
        const cy = r.height / 2 - (w.offsetTop + w.offsetHeight / 2);
        t.to(w, { rotation: 0, scale: 0.82, duration: 0.18 }, 0.05 + i * 0.006)
          .to(w, { x: cx * 0.55, y: cy * 0.55, scale: 0.45, duration: 0.22 }, 0.24 + i * 0.006)
          .to(w, { x: cx, y: cy, scale: 0.08, opacity: 0, duration: 0.16, ease: "power3.in" }, 0.44 + i * 0.008);
      });
      t.to(".wire", { opacity: 0, duration: 0.12 }, 0.6)
        .to(".counter-pill", { opacity: 0, y: -10, duration: 0.1 }, 0.5)
        .fromTo(".dash", { opacity: 0, scale: 0.82, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" }, 0.6)
        .fromTo(".dash-title", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.72)
        .fromTo(".chart-line", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: "none" }, 0.7)
        .fromTo(".chart-area", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.8)
        .to({}, { duration: 0.02 }, 1);
      tl.current = t;

      // if the visitor scrolls past without dragging, finish the transformation for them
      ScrollTrigger.create({
        trigger: el, start: "bottom 65%",
        onEnter: () => { if (prog.current < 1) animateTo(1, 1.6); },
      });
    }, el);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => { ctx.revert(); window.removeEventListener("resize", onResize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pointer parallax for depth
  useEffect(() => {
    const el = root.current!;
    const chaos = el.querySelector(".chaos") as HTMLElement;
    const qx = gsap.quickTo(chaos, "x", { duration: 0.8, ease: "power3" });
    const qy = gsap.quickTo(chaos, "y", { duration: 0.8, ease: "power3" });
    const move = (e: PointerEvent) => {
      if (prog.current > 0.05) return;
      qx((e.clientX / window.innerWidth - 0.5) * -24);
      qy((e.clientY / window.innerHeight - 0.5) * -18);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const apply = (p: number) => {
    p = Math.max(0, Math.min(1, p));
    prog.current = p;
    tl.current?.progress(p);
    floats.current.forEach((f) => f.timeScale(Math.max(0.0001, 1 - p * 3)));
    const track = trackRef.current, h = handleRef.current, fill = fillRef.current;
    if (track && h && fill) {
      const max = track.clientWidth - h.offsetWidth - 12;
      gsap.set(h, { x: p * max });
      gsap.set(fill, { width: p * max + h.offsetWidth });
    }
    setCalm(p > 0.5);
    if (sound.enabled && Math.abs(p - lastTick.current) > 0.06) { sound.tick(); lastTick.current = p; }
    if (p >= 0.995 && !doneRef.current) {
      doneRef.current = true;
      setDone(true);
      sound.chime();
      celebrate();
    }
  };

  const animateTo = (target: number, duration = 0.9) => {
    const o = { p: prog.current };
    gsap.to(o, { p: target, duration, ease: "power2.inOut", onUpdate: () => apply(o.p) });
  };

  const celebrate = () => {
    const el = root.current!;
    el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
      const to = parseFloat(n.dataset.count!);
      const dec = n.dataset.dec ? +n.dataset.dec : 0;
      const pre = n.dataset.pre || "", suf = n.dataset.suf || "";
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.6, ease: "power3.out", onUpdate: () => (n.textContent = pre + (dec ? o.v.toFixed(dec).replace(".", ",") : fmt(o.v)) + suf) });
    });
    gsap.to(".morph", { opacity: 0, y: 20, duration: 0.4, pointerEvents: "none" });
    gsap.fromTo(".stage__end", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power3.out" });
    gsap.fromTo(".dash", { boxShadow: "0 0 0 1px rgba(167,139,250,.9), 0 60px 220px -10px rgba(124,58,237,1)" }, { boxShadow: "0 0 0 1px rgba(124,58,237,.12), 0 60px 160px -30px rgba(124,58,237,.7)", duration: 1.6 });
  };

  // slider interactions
  const fromEvent = (clientX: number) => {
    const track = trackRef.current!, h = handleRef.current!;
    const rect = track.getBoundingClientRect();
    return (clientX - rect.left - 6 - h.offsetWidth / 2) / (rect.width - h.offsetWidth - 12);
  };
  const onDown = (e: React.PointerEvent) => {
    if (doneRef.current) return;
    setTouched(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const onTrack = e.target === trackRef.current;
    if (onTrack) animateTo(Math.max(0, Math.min(1, fromEvent(e.clientX))), 0.6);
    const move = (ev: PointerEvent) => apply(fromEvent(ev.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (prog.current > 0.7 && prog.current < 1) animateTo(1, 0.7);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (doneRef.current) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { setTouched(true); animateTo(prog.current + 0.1, 0.3); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") animateTo(prog.current - 0.1, 0.3);
    if (e.key === "Enter" || e.key === " " || e.key === "End") { e.preventDefault(); animateTo(1, 1.2); }
  };

  const reset = () => {
    doneRef.current = false;
    setDone(false);
    gsap.to(".stage__end", { opacity: 0, duration: 0.3 });
    gsap.to(".morph", { opacity: 1, y: 0, duration: 0.4, pointerEvents: "auto" });
    animateTo(0, 1.4);
    setUnread(1284);
  };

  return (
    <section className={`stage${done ? " done" : ""}`} ref={root} id="problema" aria-label="El problema">
      <div className="stage__bg stage__bg--chaos" />
      <div className="stage__bg stage__bg--calm" />
      <div className="stage__grain" />

      <svg className="wires" aria-hidden>
        <defs>
          <linearGradient id="wireG" x1="0" x2="1"><stop offset="0" stopColor="#7c3aed" stopOpacity=".2" /><stop offset="1" stopColor="#c4b5fd" /></linearGradient>
        </defs>
        {lines.map((l, i) => {
          const mx = (l.x1 + l.x2) / 2;
          return (
            <path key={i} className="wire" d={`M${l.x1},${l.y1} C${mx},${l.y1} ${mx},${l.y2} ${l.x2},${l.y2}`}
              fill="none" stroke="url(#wireG)" strokeWidth="1.4" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          );
        })}
      </svg>

      <div className="chaos" aria-hidden>
        {WINDOWS.map((w) => (
          <div key={w.id} className={`win-pos${w.hideSm ? " hide-sm" : ""}`}
            style={{ left: `${w.x}%`, top: `${w.y}%`, width: `min(${w.w}px, 44vw)`, transform: `rotate(${w.r}deg)` }}>
            <div className="win-float">{w.node}</div>
          </div>
        ))}
      </div>

      <div className="stage__veil" />

      <div className={`counter-pill`} role="status">
        <i /> {fmt(unread)} notificaciones sin leer
      </div>

      <div className="stage__copy">
        <div className="copy-chaos">
          <h1>Tu negocio no fue<br />hecho para el caos.</h1>
          <p>Mails, planillas, chats y pendientes que no paran. ¿Te suena?</p>
        </div>
      </div>

      <div className="dash-wrap" aria-hidden={!calm}>
        <div style={{ width: "min(1040px,100%)" }}>
          <div className="dash-title" style={{ textAlign: "center", marginBottom: 22, opacity: 0 }}>
            <h2 style={{ fontSize: "clamp(30px,4.6vw,58px)", letterSpacing: "-.045em", lineHeight: 1, fontWeight: 800 }}>
              Menos caos. <span className="grad">Más negocio.</span>
            </h2>
          </div>
          <Dashboard />
        </div>
      </div>

      <div className={`morph${touched ? " touched" : ""}`}>
        <p className="morph__hint">ARRASTRÁ PARA ORDENAR TU EMPRESA →</p>
        <div className="morph__track" ref={trackRef} onPointerDown={onDown}>
          <div className="morph__fill" ref={fillRef} />
          <div className="morph__labels"><span>Caos</span><span className="morph__shine">Control</span></div>
          <div className="morph__handle" ref={handleRef} role="slider" tabIndex={0} aria-label="Transformar caos en control"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(prog.current * 100)} onKeyDown={onKey} onPointerDown={onDown}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </div>
        </div>
      </div>

      <div className="stage__end">
        <a href="#inteligencia" className="btn btn--primary">Ver cómo funciona ↓</a>
        <button className="btn btn--ghost" onClick={reset}>↺ Volver al caos</button>
      </div>
    </section>
  );
}

function Dashboard() {
  const icons = [
    <path key="a" d="M3 12l9-8 9 8M5 10v10h14V10" />,
    <path key="b" d="M4 19V9M10 19V5M16 19v-7M22 19H2" />,
    <path key="c" d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12z" />,
    <path key="d" d="M4 4h16v16H4zM4 10h16M10 4v16" />,
    <path key="e" d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4" />,
  ];
  return (
    <div className="dash">
      <aside className="dash__side">
        {icons.map((p, i) => (
          <span key={i} className={i === 1 ? "on" : ""}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
          </span>
        ))}
      </aside>
      <div className="dash__main">
        <div className="dash__top">
          <h3>Panel de operaciones</h3>
          <span className="live">EN VIVO</span>
          <small>Todo funcionando solo · 0 pendientes</small>
        </div>
        <div className="kpis">
          <div className="kpi"><small>Consultas resueltas por IA</small><b data-count="1284">0</b><em>+100% al instante</em></div>
          <div className="kpi"><small>Tiempo de respuesta</small><b data-count="4" data-suf=" s">0</b><em>antes: 6 h</em></div>
          <div className="kpi"><small>Pedidos procesados</small><b data-count="312">0</b><em>sin cargar a mano</em></div>
          <div className="kpi"><small>Horas ahorradas / mes</small><b data-count="186" data-suf=" h">0</b><em>+ tiempo para crecer</em></div>
        </div>
        <div className="dash__grid">
          <div className="panel">
            <h4><span>Ventas automatizadas</span><span className="ok">▲ 38%</span></h4>
            <svg className="chart" viewBox="0 0 400 130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7c3aed" stopOpacity=".55" /><stop offset="1" stopColor="#7c3aed" stopOpacity="0" /></linearGradient>
              </defs>
              {[30, 65, 100].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgba(255,255,255,.06)" />)}
              <path className="chart-area" d="M0,110 C40,105 60,96 90,92 S150,70 180,74 S240,52 270,48 S330,30 360,22 L400,14 L400,130 L0,130Z" fill="url(#area)" />
              <path className="chart-line" d="M0,110 C40,105 60,96 90,92 S150,70 180,74 S240,52 270,48 S330,30 360,22 L400,14" fill="none" stroke="#c4b5fd" strokeWidth="2.4" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            </svg>
          </div>
          <div className="panel">
            <h4><span>Procesos activos</span><span className="ok">4/4 OK</span></h4>
            <ul className="proc">
              {[["Bot de WhatsApp respondiendo", "24/7"], ["Pedidos → stock → factura", "auto"], ["Leads → seguimiento", "auto"], ["Contenido de la semana", "listo"]].map(([a, b]) => (
                <li key={a}><span>{a}</span><span className="ok">● {b}</span><span className="bar"><i /></span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
