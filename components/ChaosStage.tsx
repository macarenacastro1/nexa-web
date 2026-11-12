"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sound } from "@/lib/sound";
import { getWindows, getNotifs, type Tpl, type Pick } from "./chaos/windows";
import { locale, useL, useLang } from "@/lib/i18n";
import LogoMark from "./LogoMark";

gsap.registerPlugin(ScrollTrigger);
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

type Spawn = { id: number; tpl: Tpl; x: number; y: number; r: number };
type P = { sx: number; sy: number; mx: number; my: number; ex: number; ey: number; c: number; ph: number; s: number };

let uid = 1;
const pickPos = () => {
  for (let i = 0; i < 20; i++) {
    const x = rand(2, 78), y = rand(12, 76);
    if (!(x > 24 && x < 64 && y > 30 && y < 64)) return { x, y };
  }
  return { x: rand(2, 20), y: rand(14, 70) };
};

export default function ChaosStage() {
  const { lang } = useLang();
  const L = useL();
  const fmt = (n: number) => Math.round(n).toLocaleString(locale(lang));
  const WINDOWS = useMemo(() => getWindows(L), [L]);
  const NOTIFS = useMemo(() => getNotifs(L), [L]);
  const notifsRef = useRef(NOTIFS);
  notifsRef.current = NOTIFS;
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const floats = useRef<gsap.core.Tween[]>([]);
  const prog = useRef(0);
  const doneRef = useRef(false);
  const parts = useRef<{ list: P[]; clusters: { x: number; y: number }[]; hub: { x: number; y: number } } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const lastTick = useRef(0);
  const visible = useRef(true);
  const anim = useRef<gsap.core.Tween | null>(null);

  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [closes, setCloses] = useState(0);
  const [arrived, setArrived] = useState(0);
  const [unread, setUnread] = useState(1284);
  const [notesOn, setNotesOn] = useState(false);
  const [calm, setCalm] = useState(false);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  /* ---------- living chaos: unread counter + notificaciones nuevas ---------- */
  useEffect(() => {
    if (calm) return;
    const a = setInterval(() => setUnread((u) => u + Math.ceil(Math.random() * 3)), 800);
    let n = 0;
    const b = setInterval(() => {
      if (!visible.current || document.hidden) return;
      // Las notificaciones nuevas aparecen entre las ventanas del escritorio (no en el costado),
      // así se entiende que son parte del caos y que se pueden cerrar.
      const list = notifsRef.current;
      const tpl = list[(n++ * 5) % list.length];
      setSpawns((sp) => [...sp, { id: uid++, tpl, ...pickPos(), r: rand(-6, 6) }].slice(-16));
      setArrived((x) => x + 1);
      sound.ding();
    }, 4200);
    return () => { clearInterval(a); clearInterval(b); };
  }, [calm]);

  /* ---------- hydra: close one, two arrive ---------- */
  const multiply = useCallback(() => {
    sound.pop();
    setCloses((c) => c + 1);
    setArrived((a) => a + 2);
    setSpawns((s) => {
      const list = notifsRef.current;
      const add: Spawn[] = [0, 1].map(() => ({ id: uid++, tpl: list[Math.floor(Math.random() * list.length)], ...pickPos(), r: rand(-6, 6) }));
      return [...s, ...add].slice(-16);
    });
  }, []);
  const closeWin = (id: string) => { setClosed((c) => new Set(c).add(id)); multiply(); };
  const closeSpawn = (id: number) => { setSpawns((s) => s.filter((x) => x.id !== id)); multiply(); };

  useEffect(() => {
    if (closes === 4) gsap.fromTo(".nudge", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
  }, [closes]);

  /* ---------- setup timelines ---------- */
  useIso(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) {
        floats.current = gsap.utils.toArray<HTMLElement>(".win-float").map((f) =>
          gsap.to(f, {
            x: () => gsap.utils.random(-22, 22), y: () => gsap.utils.random(-16, 16), rotation: () => gsap.utils.random(-2.5, 2.5),
            duration: () => gsap.utils.random(2.4, 4.4), ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true,
          })
        );
        gsap.utils.toArray<HTMLElement>("[data-shake]").forEach((s, i) => {
          gsap.timeline({ repeat: -1, repeatDelay: 3 + i, delay: 2 + i * 1.4 })
            .to(s, { x: -6, duration: 0.05 }).to(s, { x: 6, duration: 0.05, repeat: 5, yoyo: true }).to(s, { x: 0, duration: 0.05 });
        });
      }
      gsap.from(".win-pos", { opacity: 0, scale: 0.6, duration: 0.9, ease: "back.out(1.5)", stagger: { each: 0.05, from: "random" }, delay: 0.1 });
      gsap.from(".copy-chaos > *", { opacity: 0, y: 30, duration: 1.1, stagger: 0.14, ease: "power3.out", delay: 0.45 });
      gsap.from(".morph, .tally", { opacity: 0, y: 20, duration: 0.8, delay: 1.1, ease: "power3.out" });
      const nt = setTimeout(() => setNotesOn(true), 1500);

      const t = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
      t.to(".copy-chaos", { opacity: 0, y: -24, scale: 0.97, duration: 0.12 }, 0)
        .to(".win .badge, .alert-win .ico, .stamp, .x", { opacity: 0, scale: 0.3, duration: 0.1, stagger: 0.002 }, 0.02)
        .to(".sheet .bad, .sheet .warn", { backgroundColor: "rgba(43,245,156,.16)", color: "#2bf59c", duration: 0.1 }, 0.03)
        .to(".note", { color: "#2bf59c", duration: 0.1 }, 0.04)
        .to(".note .t.bad", { opacity: 0, duration: 0.06 }, 0.04)
        .to(".note .good", { opacity: 1, duration: 0.08 }, 0.08)
        .to(".spawns, .tally, .nudge", { opacity: 0, duration: 0.1 }, 0.03)
        .to(".win-pos", { rotation: 0, scale: 0.97, duration: 0.1 }, 0.07)
        .to(".win-pos", { opacity: 0, scale: 0.9, filter: "blur(10px)", duration: 0.12, stagger: { each: 0.004, from: "random" } }, 0.18)
        .fromTo(".nexo-logo__in", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.1, ease: "power2.out" }, 0.44)
        .to(".nexo-logo__in", { opacity: 0, scale: 1.06, duration: 0.08 }, 0.6)
        .to(".stage__bg--calm", { opacity: 1, duration: 0.35 }, 0.2)
        .to(".stage__veil", { opacity: 0, duration: 0.2 }, 0.2)
        .fromTo(".dash", { opacity: 0, scale: 0.9, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power3.out" }, 0.68)
        .fromTo(".dash-title", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.14 }, 0.8)
        .fromTo(".chart-line", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.2, ease: "none" }, 0.76)
        .fromTo(".chart-area", { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.84)
        .to({}, { duration: 0.02 }, 1);
      tl.current = t;

      ScrollTrigger.create({ trigger: el, start: "bottom 65%", onEnter: () => { if (prog.current < 1) animateTo(1, 1.8); } });
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (visible.current = s.isActive) });
      return () => clearTimeout(nt);
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- cursor: depth parallax + tilt ---------- */
  useEffect(() => {
    const el = root.current!;
    const layers = [...el.querySelectorAll<HTMLElement>(".win-par")].map((n) => ({
      d: +(n.dataset.depth || 0.6),
      x: gsap.quickTo(n, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(n, "y", { duration: 0.9, ease: "power3" }),
      rx: gsap.quickTo(n, "rotationX", { duration: 0.9, ease: "power3" }), ry: gsap.quickTo(n, "rotationY", { duration: 0.9, ease: "power3" }),
    }));
    const move = (e: PointerEvent) => {
      if (prog.current > 0.04 || e.pointerType === "touch") return;
      const mx = e.clientX / window.innerWidth - 0.5, my = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => { l.x(-mx * 46 * l.d); l.y(-my * 32 * l.d); l.ry(mx * 10 * l.d); l.rx(-my * 8 * l.d); });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  /* ---------- drag windows by their bar, and post-its ---------- */
  const onChaosDown = (e: React.PointerEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-close], .x")) return;
    const h = t.closest("[data-drag]");
    if (!h || prog.current > 0.02) return;
    const d = h.closest(".win-drag") as HTMLElement;
    if (!d) return;
    e.preventDefault();
    const ox = +(gsap.getProperty(d, "x") as number), oy = +(gsap.getProperty(d, "y") as number);
    const sx = e.clientX, sy = e.clientY;
    const pos = d.closest(".win-pos") as HTMLElement;
    pos.style.zIndex = "9";
    gsap.to(d, { scale: 1.04, duration: 0.2 });
    const mv = (ev: PointerEvent) => gsap.set(d, { x: ox + ev.clientX - sx, y: oy + ev.clientY - sy });
    const up = () => {
      gsap.to(d, { scale: 1, duration: 0.3, ease: "back.out(2)" });
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  const onChaosClick = (e: React.MouseEvent) => {
    const c = (e.target as HTMLElement).closest("[data-close]");
    if (!c || prog.current > 0.02) return;
    const id = (c.closest(".win-pos") as HTMLElement)?.dataset.id;
    if (id) closeWin(id);
  };

  /* ---------- particles: windows → fragments → structure → dashboard ---------- */
  const buildParticles = () => {
    const el = root.current, cv = canvas.current;
    if (!el || !cv) return;
    const r = el.getBoundingClientRect();
    const w = r.width, h = r.height;
    // El nexo: las partículas dibujan el logo de NEXA (cuadrado redondeado + N) en el centro.
    const cx = w / 2, cy = h * 0.53, S = (Math.min(w, h) * 0.44) / 38;
    const at = (u: number, v: number) => ({ x: cx + (u - 24) * S, y: cy + (v - 24) * S });
    const K = 6;
    const clusters = [at(9, 9), at(39, 9), at(39, 39), at(9, 39), at(17, 17), at(31, 31)];
    const onRect = () => {
      // punto al azar sobre el borde del cuadrado redondeado (x 5..43, radio 11)
      const side = 38 - 22, arc = (Math.PI / 2) * 11, per = 4 * side + 4 * arc;
      let d = Math.random() * per;
      const corners = [[16, 16, Math.PI], [32, 16, -Math.PI / 2], [32, 32, 0], [16, 32, Math.PI / 2]];
      const sides = [[16, 5, 1, 0], [43, 16, 0, 1], [32, 43, -1, 0], [5, 32, 0, -1]];
      for (let k = 0; k < 4; k++) {
        if (d < arc) { const [ox, oy, a0] = corners[k]; const a = a0 + d / 11; return at(ox + Math.cos(a) * 11, oy + Math.sin(a) * 11); }
        d -= arc;
        if (d < side) { const [sx, sy, dx, dy] = sides[k]; return at(sx + dx * d, sy + dy * d); }
        d -= side;
      }
      return at(5, 24);
    };
    const onN = () => {
      const segs = [[17, 31, 17, 17], [17, 17, 31, 31], [31, 31, 31, 17]];
      const [x1, y1, x2, y2] = segs[Math.floor(Math.random() * 3)];
      const t = Math.random();
      return at(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    };
    const nearest = (pt: { x: number; y: number }) => {
      let best = 0, bd = Infinity;
      clusters.forEach((c, i) => { const d = (c.x - pt.x) ** 2 + (c.y - pt.y) ** 2; if (d < bd) { bd = d; best = i; } });
      return best;
    };
    const targets = [...el.querySelectorAll<HTMLElement>(".dash .kpi, .dash .panel, .dash")].map((n) => {
      const b = n.getBoundingClientRect();
      return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
    });
    const list: P[] = [];
    const sources = [...el.querySelectorAll<HTMLElement>(".win-pos:not(.closed), .spawn")];
    sources.forEach((s, i) => {
      const b = s.getBoundingClientRect();
      if (b.width < 2) return;
      const n = Math.round(clamp((b.width * b.height) / 2200, 8, 28));
      for (let j = 0; j < n; j++) {
        const m = Math.random() < 0.62 ? onRect() : onN();
        const c = nearest(m);
        const ang = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 2.2 * S;
        const tg = targets[Math.floor(Math.random() * targets.length)] || { x: cx - 100, y: cy - 50, w: 200, h: 100 };
        const per = Math.random() * 2 * (tg.w + tg.h);
        let ex, ey;
        if (per < tg.w) { ex = tg.x + per; ey = tg.y; }
        else if (per < tg.w + tg.h) { ex = tg.x + tg.w; ey = tg.y + per - tg.w; }
        else if (per < 2 * tg.w + tg.h) { ex = tg.x + per - tg.w - tg.h; ey = tg.y + tg.h; }
        else { ex = tg.x; ey = tg.y + per - 2 * tg.w - tg.h; }
        list.push({
          sx: b.left - r.left + Math.random() * b.width, sy: b.top - r.top + Math.random() * b.height,
          mx: m.x + Math.cos(ang) * rr, my: m.y + Math.sin(ang) * rr,
          ex, ey, c, ph: Math.random() * 6.28, s: rand(0.7, 1.5),
        });
      }
    });
    void K;
    parts.current = { list, clusters, hub: { x: cx, y: cy } };
  };

  useEffect(() => {
    const cv = canvas.current!;
    const g = cv.getContext("2d")!;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext("2d")!;
    const grd = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.25, "rgba(255,255,255,.5)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    sg.fillStyle = grd; sg.fillRect(0, 0, 32, 32);
    const tinted: Record<string, HTMLCanvasElement> = {};
    const tint = (col: string) => {
      if (tinted[col]) return tinted[col];
      const c = document.createElement("canvas"); c.width = c.height = 32;
      const x = c.getContext("2d")!; x.drawImage(sprite, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = col; x.fillRect(0, 0, 32, 32);
      return (tinted[col] = c);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (prog.current > 0) buildParticles();
    };
    resize();
    window.addEventListener("resize", resize);
    const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const CO = [255, 107, 91], TE = [45, 226, 208], GR = [43, 245, 156];
    let raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const p = prog.current;
      g.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
      const P = parts.current;
      if (!P || p <= 0.15 || p >= 0.9) return;
      const t = now / 1000;
      const appear = seg(p, 0.16, 0.3), go1 = ease(seg(p, 0.24, 0.5)), go2 = ease(seg(p, 0.58, 0.78));
      const fade = 1 - seg(p, 0.74, 0.88), alpha = appear * fade;
      const lines = seg(p, 0.36, 0.5) * (1 - seg(p, 0.58, 0.7));
      const col = go2 > 0 ? mix(TE, GR, go2) : mix(CO, TE, go1);
      const cs = `rgb(${col.join(",")})`;
      // structure lines
      if (lines > 0) {
        g.lineWidth = 1;
        P.clusters.forEach((c, k) => {
          const n = P.clusters[(k + 1) % P.clusters.length];
          g.strokeStyle = `rgba(45,226,208,${0.22 * lines})`;
          g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(n.x, n.y); g.stroke();
          g.strokeStyle = `rgba(43,245,156,${0.45 * lines})`;
          g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(P.hub.x, P.hub.y); g.stroke();
          const u = (t * 0.6 + k / 6) % 1;
          g.globalAlpha = lines;
          g.drawImage(tint("#2bf59c"), c.x + (P.hub.x - c.x) * u - 8, c.y + (P.hub.y - c.y) * u - 8, 16, 16);
          g.globalAlpha = 1;
        });
      }
      g.globalCompositeOperation = "lighter";
      const spr = tint(cs);
      for (const q of P.list) {
        let x = q.sx + (q.mx - q.sx) * go1, y = q.sy + (q.my - q.sy) * go1;
        x += (q.ex - x) * go2; y += (q.ey - y) * go2;
        const wob = (1 - go2) * 4;
        x += Math.sin(t * 1.4 + q.ph) * wob; y += Math.cos(t * 1.1 + q.ph) * wob;
        if (lines > 0.02) {
          const c = P.clusters[q.c];
          g.strokeStyle = `rgba(45,226,208,${0.1 * lines * alpha})`;
          g.beginPath(); g.moveTo(x, y); g.lineTo(c.x, c.y); g.stroke();
        }
        const s = 7 * q.s;
        g.globalAlpha = alpha;
        g.drawImage(spr, x - s, y - s, s * 2, s * 2);
      }
      g.globalAlpha = 1;
      if (lines > 0) {
        [...P.clusters, P.hub].forEach((c, i) => {
          const s = i === P.clusters.length ? 26 : 16;
          g.globalAlpha = lines;
          g.drawImage(tint("#ffffff"), c.x - s / 2, c.y - s / 2, s, s);
        });
        g.globalAlpha = 1;
      }
      g.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- slider ---------- */
  const apply = (p: number) => {
    p = clamp(p);
    if (prog.current <= 0.001 && p > 0.001) buildParticles();
    prog.current = p;
    tl.current?.progress(p);
    floats.current.forEach((f) => f.timeScale(Math.max(0.0001, 1 - p * 7)));
    const track = trackRef.current, h = handleRef.current, fill = fillRef.current;
    if (track && h && fill) {
      const max = track.clientWidth - h.offsetWidth - 12;
      gsap.set(h, { x: p * max });
      gsap.set(fill, { width: p * max + h.offsetWidth });
      h.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    }
    setCalm(p > 0.5);
    if (Math.abs(p - lastTick.current) > 0.06) { sound.tick(); lastTick.current = p; }
    if (p >= 0.995 && !doneRef.current) { doneRef.current = true; setDone(true); sound.chime(); celebrate(); }
  };
  const animateTo = (target: number, duration = 0.9) => {
    const o = { p: prog.current };
    anim.current?.kill();
    anim.current = gsap.to(o, { p: clamp(target), duration, ease: "power2.inOut", onUpdate: () => apply(o.p) });
  };
  const celebrate = () => {
    root.current!.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
      const to = parseFloat(n.dataset.count!), suf = n.dataset.suf || "";
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.6, ease: "power3.out", onUpdate: () => (n.textContent = fmt(o.v) + suf) });
    });
    gsap.to(".morph", { opacity: 0, y: 20, duration: 0.4, pointerEvents: "none" });
    gsap.fromTo(".stage__end", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power3.out" });
  };
  const fromEvent = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect(), hw = handleRef.current!.offsetWidth;
    return (clientX - rect.left - 6 - hw / 2) / (rect.width - hw - 12);
  };
  const onDown = (e: React.PointerEvent) => {
    if (doneRef.current) return;
    e.stopPropagation();
    setTouched(true);
    if (e.currentTarget === trackRef.current && e.target === trackRef.current) animateTo(fromEvent(e.clientX), 0.6);
    const move = (ev: PointerEvent) => { anim.current?.kill(); apply(fromEvent(ev.clientX)); };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      if (prog.current > 0.72 && prog.current < 1) animateTo(1, 0.7);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (doneRef.current) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { setTouched(true); animateTo(prog.current + 0.1, 0.3); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") animateTo(prog.current - 0.1, 0.3);
    if (e.key === "Enter" || e.key === " " || e.key === "End") { e.preventDefault(); setTouched(true); animateTo(1, 1.6); }
  };
  const reset = () => {
    doneRef.current = false; setDone(false);
    gsap.to(".stage__end", { opacity: 0, duration: 0.3 });
    gsap.to(".morph", { opacity: 1, y: 0, duration: 0.4, pointerEvents: "auto" });
    setClosed(new Set()); setSpawns([]); setCloses(0); setArrived(0); setUnread(1284);
    gsap.set(".nudge", { opacity: 0 });
    animateTo(0, 1.6);
  };

  // spotlight on dashboard cards
  const onSpot = (e: React.PointerEvent) => {
    const c = (e.target as HTMLElement).closest(".spot") as HTMLElement | null;
    if (!c) return;
    const b = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - b.left}px`); c.style.setProperty("--my", `${e.clientY - b.top}px`);
  };

  return (
    <section className={`stage${done ? " done" : ""}`} ref={root} id="caos" aria-label={L("Del caos al control", "Do caos ao controle")}>
      <div className="stage__bg stage__bg--chaos" />
      <div className="stage__bg stage__bg--calm" />
      <div className="stage__grid" />

      <div className="chaos" onPointerDown={onChaosDown} onClick={onChaosClick}>
        {WINDOWS.map((w) => (
          <div key={w.id} data-id={w.id} className={`win-pos${w.hideSm ? " hide-sm" : ""}${closed.has(w.id) ? " closed" : ""}`}
            style={{ left: `${w.x}%`, top: `${w.y}%`, width: `min(${w.w}px, 44vw)`, transform: `rotate(${w.r}deg)` }}>
            <div className="win-par" data-depth={w.depth}>
              <div className="win-float">
                <div className="win-drag">
                  {w.node}
                  {(w.kind === "toast" || w.kind === "alert") && (
                    <button className="x" aria-label={L("Cerrar notificación", "Fechar notificação")} onClick={(e) => { e.stopPropagation(); closeWin(w.id); }}>×</button>
                  )}
                  {w.note && (
                    <div className={`note${notesOn ? " drawn" : ""}`} style={{ inset: 0, ["--d" as any]: `${w.note.d || 0}s` }} aria-hidden>
                      <svg viewBox={w.note.viewBox} preserveAspectRatio="none" style={w.note.svg}>
                        <path d={w.note.path} pathLength={1} vectorEffect="non-scaling-stroke" />
                      </svg>
                      <span className="t bad" style={w.note.at}>{w.note.text}</span>
                      <span className="t good" style={w.note.at}>{w.note.ok}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="spawns" aria-live="polite">
          {spawns.map((s) => (
            <div key={s.id} className="spawn" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.r}deg)` }}>
              <div className="win toast-win">
                <span className="app-ico" style={{ background: s.tpl.color }}>{s.tpl.ico}</span>
                <div><strong>{s.tpl.title}</strong><small>{s.tpl.body}</small><em>{s.tpl.app} · {L("ahora", "agora")}</em></div>
              </div>
              <button className="x" aria-label={L("Cerrar notificación", "Fechar notificação")} onClick={(e) => { e.stopPropagation(); closeSpawn(s.id); }}>×</button>
            </div>
          ))}
        </div>
      </div>

      <canvas className="particles" ref={canvas} aria-hidden />
      <div className="nexo-logo" aria-hidden><div className="nexo-logo__in"><LogoMark /></div></div>
      <div className="stage__veil" />
      <div className="stage__grain" />


      <div className="tally" role="status">
        <span className="live">{fmt(unread)} {L("sin leer", "não lidas")}</span>
        <span>{L("Cerraste", "Você fechou")} <b>{closes}</b></span>
        <span className="in">{L("Llegaron", "Chegaram")} <b>{arrived}</b></span>
      </div>

      <div className="stage__copy">
        <div className="copy-chaos">
          <h1 className="display">{L("Tu empresa", "Sua empresa")}<br />{L("trabaja mucho.", "trabalha muito.")}<span className="l2">{L("¿Pero trabaja", "Mas com")} <span className="serif">{L("inteligente?", "inteligência?")}</span></span></h1>
          <p>{L("Mails, planillas, chats y facturas que no paran.", "E-mails, planilhas, chats e boletos que não param.")} <b>{L("Probá cerrar alguna.", "Tente fechar alguma.")}</b></p>
        </div>
      </div>

      <div className={`dash-wrap${done ? " live" : ""}`} aria-hidden={!calm} onPointerMove={onSpot}>
        <div style={{ width: "min(1080px,100%)" }}>
          <div className="dash-title"><h2>{L("Ahora trabaja", "Agora trabalha com")} <span className="serif ctrl">{L("inteligente.", "inteligência.")}</span></h2></div>
          <Dashboard L={L} />
        </div>
      </div>

      <div className="nudge" aria-hidden>
        {L("Cerrar ventanas no arregla nada. Probá esto", "Fechar janelas não resolve nada. Tente isto")}
        <svg viewBox="0 0 40 44"><path d="M20 2 C 16 14, 24 24, 20 40 M 11 31 L 20 41 L 29 31" /></svg>
      </div>

      <div className={`morph${touched ? " touched" : ""}`}>
        <p className="morph__hint">{L("Tomá el control", "Assuma o controle")} <span className="serif">{L("de tu empresa.", "da sua empresa.")}</span></p>
        <div className="morph__track" ref={trackRef} onPointerDown={onDown}>
          <div className="morph__fill" ref={fillRef} />
          <div className="morph__labels"><span>{L("CAOS", "CAOS")}</span><span>{L("CONTROL", "CONTROLE")}</span></div>
          <div className="morph__handle" ref={handleRef} role="slider" tabIndex={0} aria-label={L("Transformar el caos en control", "Transformar o caos em controle")}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} onKeyDown={onKey} onPointerDown={onDown}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </div>
        </div>
      </div>

      <div className="stage__end">
        <a href="#flujo" className="btn btn--solid">{L("Ver cómo funciona", "Ver como funciona")} <span className="arr">↓</span></a>
        <button className="btn btn--line" onClick={reset}>↺ {L("Volver al caos", "Voltar ao caos")}</button>
      </div>
    </section>
  );
}

function Dashboard({ L }: { L: Pick }) {
  const icons = [
    <path key="a" d="M3 12l9-8 9 8M5 10v10h14V10" />,
    <path key="b" d="M4 19V9M10 19V5M16 19v-7M22 19H2" />,
    <path key="c" d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12z" />,
    <path key="d" d="M4 4h16v16H4zM4 10h16M10 4v16" />,
    <path key="e" d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1" />,
  ];
  const pipes = [["Email", "IA", "ERP", L("Aviso", "Aviso")], ["WhatsApp", "IA", L("Pedido", "Pedido"), L("Stock", "Estoque")], ["Web", "IA", "CRM", L("Seguimiento", "Follow-up")], [L("Planilla", "Planilha"), "Sync", L("Tienda", "Loja"), L("Reporte", "Relatório")]];
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
          <h3>{L("Centro de operaciones", "Central de operações")}</h3>
          <span className="pill-live">{L("EN VIVO", "AO VIVO")}</span>
          <small>{L("12 procesos conectados · 0 pendientes", "12 processos conectados · 0 pendências")}</small>
        </div>
        <div className="kpis">
          <div className="kpi spot"><small>{L("Facturas procesadas", "Notas processadas")}</small><b data-count="312">0</b><em>{L("sin carga manual", "sem lançamento manual")}</em></div>
          <div className="kpi spot"><small>{L("Consultas resueltas por IA", "Atendimentos resolvidos por IA")}</small><b data-count="1284">0</b><em>{L("al instante", "na hora")}</em></div>
          <div className="kpi spot"><small>{L("Tiempo de respuesta", "Tempo de resposta")}</small><b data-count="4" data-suf=" s">0</b><em>{L("antes: 6 h", "antes: 6 h")}</em></div>
          <div className="kpi spot"><small>{L("Horas liberadas / semana", "Horas liberadas / semana")}</small><b data-count="46" data-suf=" h">0</b><em>{L("para hacer crecer el negocio", "para fazer o negócio crescer")}</em></div>
        </div>
        <div className="dash__grid">
          <div className="panel spot">
            <h4><span>{L("Operaciones automatizadas", "Operações automatizadas")}</span><span className="ok">▲ 38%</span></h4>
            <svg className="chart" viewBox="0 0 400 124" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2de2d0" stopOpacity=".35" /><stop offset="1" stopColor="#2de2d0" stopOpacity="0" /></linearGradient>
                <linearGradient id="ln" x1="0" x2="1"><stop offset="0" stopColor="#4c8dff" /><stop offset=".6" stopColor="#2de2d0" /><stop offset="1" stopColor="#2bf59c" /></linearGradient>
              </defs>
              {[30, 62, 94].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgba(255,255,255,.05)" />)}
              <path className="chart-area" d="M0,108 C40,104 60,95 90,90 S150,70 180,73 S240,50 270,47 S330,28 360,21 L400,13 L400,124 L0,124Z" fill="url(#area)" />
              <path className="chart-line" d="M0,108 C40,104 60,95 90,90 S150,70 180,73 S240,50 270,47 S330,28 360,21 L400,13" fill="none" stroke="url(#ln)" strokeWidth="2.2" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
            </svg>
          </div>
          <div className="panel spot">
            <h4><span>{L("Flujos activos", "Fluxos ativos")}</span><span className="ok">4/4 OK</span></h4>
            <div className="pipes">
              {pipes.map((p) => (
                <div className="pipe-wrap pipe" key={p[0]}>
                  {p.map((s, i) => (<span key={s} style={{ display: "contents" }}>{i > 0 && <i />}<span>{s}</span></span>))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
