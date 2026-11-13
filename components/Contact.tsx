"use client";
import { useEffect, useRef, useState } from "react";
import { CALC_KEY, CONFIG, CONSENT_VERSION, LEAD_ENDPOINT, track, type CalcSummary } from "@/lib/config";
import { sound } from "@/lib/sound";
import { useHref, useL, useLang } from "@/lib/i18n";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
);

/** Tipos de proyecto. El valor que llega al CRM es siempre el mismo, en español. */
export const NEEDS = [
  { key: "web", value: "Sitio web o e-commerce", es: "Sitio web o e-commerce", pt: "Site ou e-commerce" },
  { key: "sistema", value: "Sistema o aplicación a medida", es: "Sistema o aplicación a medida", pt: "Sistema ou aplicativo sob medida" },
  { key: "ia", value: "Automatización o inteligencia artificial", es: "Automatización o inteligencia artificial", pt: "Automação ou inteligência artificial" },
  { key: "orientacion", value: "Necesito orientación", es: "Necesito orientación", pt: "Preciso de orientação" },
  { key: "otro", value: "Otro proyecto", es: "Otro proyecto", pt: "Outro projeto" },
] as const;
export type NeedKey = (typeof NEEDS)[number]["key"];

/** Rubro o sector. "Otro" pide escribirlo. */
export const SECTORS: [string, string][] = [
  ["Gastronomía", "Gastronomia"],
  ["Salud y bienestar", "Saúde e bem-estar"],
  ["Estética y belleza", "Estética e beleza"],
  ["Moda e indumentaria", "Moda e vestuário"],
  ["Comercio y tiendas", "Comércio e lojas"],
  ["E-commerce", "E-commerce"],
  ["Inmobiliaria y construcción", "Imobiliária e construção"],
  ["Servicios profesionales (contable, legal, consultoría)", "Serviços profissionais (contábil, jurídico, consultoria)"],
  ["Educación y capacitación", "Educação e treinamento"],
  ["Industria y manufactura", "Indústria e manufatura"],
  ["Logística y distribución", "Logística e distribuição"],
  ["Tecnología y software", "Tecnologia e software"],
  ["Turismo y hotelería", "Turismo e hotelaria"],
  ["Agro", "Agro"],
  ["Finanzas y seguros", "Finanças e seguros"],
  ["Marketing y comunicación", "Marketing e comunicação"],
  ["Deportes y fitness", "Esportes e fitness"],
  ["Arte, diseño y cultura", "Arte, design e cultura"],
  ["ONG o institución", "ONG ou instituição"],
  ["Emprendimiento personal", "Empreendimento pessoal"],
];

function readCalc(): CalcSummary | null {
  try {
    const raw = sessionStorage.getItem(CALC_KEY);
    return raw ? (JSON.parse(raw) as CalcSummary) : null;
  } catch {
    return null;
  }
}

/** UTM de la visita: la del link actual o, si la persona navegó, la que se guardó al entrar. */
function utm() {
  const q = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "content", "term"]) {
    const v = q.get(`utm_${k}`);
    if (v) out[k] = v;
  }
  if (Object.keys(out).length) return out;
  try {
    return JSON.parse(sessionStorage.getItem("nexa:utm") || "{}") as Record<string, string>;
  } catch {
    return out;
  }
}

/**
 * 05 · Contacto. Un solo sistema de contacto para toda la web: envía la
 * consulta al CRM (función web-lead), con campo trampa contra spam, límites
 * de envío en el servidor y consentimiento. La confirmación aparece solo
 * después de que el servidor la guardó.
 */
export default function Contact({ need }: { need?: NeedKey }) {
  const L = useL();
  const href = useHref();
  const { lang } = useLang();
  const [state, setState] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState("");
  const started = useRef(false);
  const [sector, setSector] = useState("");
  const msgRef = useRef<HTMLTextAreaElement>(null);

  // Si viene de la calculadora (en /intelligence), sugerimos el mensaje con sus números
  useEffect(() => {
    const fill = (c: CalcSummary | null) => {
      const el = msgRef.current;
      if (!c || !el || el.value.trim()) return;
      el.value = L(
        `Usé la calculadora: ${c.tasks} tareas manuales por semana, ${c.mins} min cada una, ${c.pct}% automatizable (estimación de ${c.hours_week} h por semana).`,
        `Usei a calculadora: ${c.tasks} tarefas manuais por semana, ${c.mins} min cada, ${c.pct}% automatizável (estimativa de ${c.hours_week} h por semana).`,
      );
      const r = document.querySelector<HTMLInputElement>('input[name="need"][value="' + NEEDS[2].value + '"]');
      if (r && !document.querySelector('input[name="need"]:checked')) r.checked = true;
    };
    fill(readCalc());
    const onCalc = (e: Event) => fill((e as CustomEvent<CalcSummary>).detail);
    window.addEventListener(CALC_KEY, onCalc);
    return () => window.removeEventListener(CALC_KEY, onCalc);
  }, [L]);

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track("form_start", { page: window.location.pathname });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return; // evita envíos duplicados
    const form = e.currentTarget;
    setError("");
    let ok = true;
    let first: HTMLElement | null = null;
    form.querySelectorAll<HTMLInputElement>("input[required], select[required], textarea[required]").forEach((f) => {
      const valid = f.type === "checkbox" ? f.checked : f.checkValidity() && f.value.trim() !== "";
      const fld = f.closest(".field")!;
      fld.classList.toggle("err", !valid);
      f.setAttribute("aria-invalid", valid ? "false" : "true");
      const s = fld.querySelector("small");
      if (s)
        s.textContent = valid
          ? ""
          : f.type === "email"
            ? L("Ingresá un email válido", "Digite um e-mail válido")
            : f.type === "checkbox"
              ? L("Necesitamos tu autorización para responderte", "Precisamos da sua autorização para responder")
              : f.tagName === "SELECT"
                ? L("Elegí una opción", "Escolha uma opção")
                : L("Completá este campo", "Preencha este campo");
      if (!valid) {
        ok = false;
        first ??= f;
      }
    });
    // tipo de proyecto (opciones tocables)
    const needSel = form.querySelector<HTMLInputElement>('input[name="need"]:checked');
    const needFld = form.querySelector<HTMLElement>(".field--need")!;
    needFld.classList.toggle("err", !needSel);
    needFld.querySelector("small")!.textContent = needSel ? "" : L("Elegí una opción", "Escolha uma opção");
    if (!needSel) { ok = false; first ??= form.querySelector<HTMLInputElement>('input[name="need"]'); }
    // rubro "Otro": hay que escribirlo
    if (sector === "__otro") {
      const o = form.querySelector<HTMLInputElement>("#f-so")!;
      const valid = o.value.trim().length > 1;
      o.closest(".field")!.classList.toggle("err", !valid);
      o.closest(".field")!.querySelector("small")!.textContent = valid ? "" : L("Contanos cuál es tu rubro", "Conte qual é o seu setor");
      if (!valid) { ok = false; first ??= o; }
    }
    if (!ok) {
      (first as HTMLElement | null)?.focus();
      return;
    }

    const v = (id: string) => (form.querySelector<HTMLInputElement>(`#${id}`)?.value ?? "").trim();
    setState("sending");
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: v("f-n"),
          company: v("f-c"),
          email: v("f-e"),
          phone: v("f-w"),
          need: needSel?.value ?? "",
          sector: sector === "__otro" ? v("f-so") : sector,
          message: v("f-m"),
          consent: form.querySelector<HTMLInputElement>("#f-ok")?.checked === true,
          consent_version: lang === "pt" ? `${CONSENT_VERSION}-pt` : CONSENT_VERSION,
          website: v("f-web"),
          page: window.location.pathname,
          lang,
          utm: utm(),
          calculator: readCalc(),
        }),
      });
      if (res.status === 429) throw new Error("rate");
      const data = (await res.json().catch(() => ({}))) as { status?: string };
      if (!res.ok || (data.status && data.status !== "ok")) throw new Error(data.status === "rate_limited" ? "rate" : "fail");
      // Solo el tipo de proyecto: nada de datos personales en analítica
      track("generate_lead", { need: NEEDS.find((n) => n.value === needSel?.value)?.key ?? "otro" });
      form.reset();
      setSector("");
      try { sessionStorage.removeItem(CALC_KEY); } catch { /* nada */ }
      sound.chime();
      setState("ok");
    } catch (err) {
      setState("idle");
      setError(
        err instanceof Error && err.message === "rate"
          ? L(`Recibimos varias consultas seguidas desde esta conexión. Probá de nuevo en un rato o escribinos a ${CONFIG.contactEmail}.`, `Recebemos várias mensagens seguidas desta conexão. Tente de novo daqui a pouco ou escreva para ${CONFIG.contactEmail}.`)
          : L(`No pudimos enviar tu consulta. Probá de nuevo o escribinos a ${CONFIG.contactEmail}.`, `Não conseguimos enviar sua mensagem. Tente de novo ou escreva para ${CONFIG.contactEmail}.`),
      );
    }
  };

  const defaultNeed = need ? NEEDS.find((n) => n.key === need)?.value ?? "" : "";

  return (
    <section className="contact" id="contacto" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div>
          <p className="label">{L("Contacto", "Contato")}</p>
          <h2 className="h2" id="contact-title">{L("Contanos qué querés", "Conte o que você quer")} <span className="serif ctrl">{L("construir.", "construir.")}</span></h2>
          <p className="lead">{L("¿Tenés una idea, un proyecto en marcha o un problema que necesitás resolver? Conversemos sobre cómo podemos ayudarte.", "Tem uma ideia, um projeto em andamento ou um problema que precisa resolver? Vamos conversar sobre como podemos ajudar.")}</p>
          <ul className="trust">
            <li><Check /><div>{L("La lee una persona del equipo", "Uma pessoa da equipe lê")}<small>{L("Te respondemos por mail con los próximos pasos.", "Respondemos por e-mail com os próximos passos.")}</small></div></li>
            <li><Check /><div>{L("Para las tres especialidades", "Para as três especialidades")}<small>{L("Web y e-commerce, sistemas a medida o automatización: contanos tu caso.", "Web e e-commerce, sistemas sob medida ou automação: conte o seu caso.")}</small></div></li>
            <li><Check /><div>{L("Argentina y toda Latinoamérica", "Argentina e toda a América Latina")}<small>{L("Trabajamos en español y en portugués.", "Trabalhamos em espanhol e em português.")}</small></div></li>
          </ul>
        </div>

        {state === "ok" ? (
          <div className="form form--done" role="status" aria-live="polite">
            <span className="form__ok" aria-hidden>✓</span>
            <h3>{L("Recibimos tu consulta.", "Recebemos sua mensagem.")}</h3>
            <p>{L("Gracias por escribirnos. Te vamos a responder al email que nos dejaste.", "Obrigado por escrever. Vamos responder no e-mail que você deixou.")}</p>
            <button className="btn btn--line btn--sm" onClick={() => setState("idle")}>{L("Enviar otra consulta", "Enviar outra mensagem")}</button>
          </div>
        ) : (
          <form className="form" noValidate onSubmit={submit} onFocus={onStart} aria-describedby="form-req">
            <p className="form__req" id="form-req">{L("Los campos con * son obligatorios.", "Os campos com * são obrigatórios.")}</p>
            <div className="field"><label htmlFor="f-n">{L("Nombre", "Nome")} *</label><input id="f-n" required autoComplete="name" maxLength={200} /><small /></div>
            <div className="field"><label htmlFor="f-e">Email *</label><input id="f-e" type="email" required autoComplete="email" maxLength={200} /><small /></div>
            <div className="field"><label htmlFor="f-c">{L("Empresa o marca", "Empresa ou marca")} <span className="opt">(opcional)</span></label><input id="f-c" autoComplete="organization" maxLength={200} /><small /></div>
            <div className="field"><label htmlFor="f-w">{L("WhatsApp o teléfono", "WhatsApp ou telefone")} <span className="opt">(opcional)</span></label><input id="f-w" type="tel" placeholder={L("Con código de área", "Com DDD")} autoComplete="tel" maxLength={40} /><small /></div>
            <div className="field field--full">
              <label htmlFor="f-sector">{L("Rubro o sector", "Setor de atuação")} <span className="opt">(opcional)</span></label>
              <select id="f-sector" value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="">{L("Elegí tu rubro", "Escolha seu setor")}</option>
                {SECTORS.map(([es, pt]) => <option key={es} value={es}>{L(es, pt)}</option>)}
                <option value="__otro">{L("Otro", "Outro")}</option>
              </select><small />
            </div>
            {sector === "__otro" && (
              <div className="field field--full"><label htmlFor="f-so">{L("¿Cuál es tu rubro?", "Qual é o seu setor?")} *</label><input id="f-so" maxLength={80} autoFocus /><small /></div>
            )}
            <fieldset className="field field--full field--need">
              <legend>{L("¿Qué querés construir?", "O que você quer construir?")} *</legend>
              <div className="chips" role="radiogroup">
                {NEEDS.map((n) => (
                  <label key={n.key} className="chip">
                    <input type="radio" name="need" value={n.value} defaultChecked={n.value === defaultNeed} />
                    <span>{L(n.es, n.pt)}</span>
                  </label>
                ))}
              </div>
              <small />
            </fieldset>
            <div className="field field--full">
              <label htmlFor="f-m">{L("¿Qué te gustaría resolver o mejorar?", "O que você gostaria de resolver ou melhorar?")} *</label>
              <textarea id="f-m" ref={msgRef} rows={4} required maxLength={3000}
                placeholder={L("Por ejemplo: tenemos una tienda y queremos que los pedidos de WhatsApp se carguen solos en el sistema.", "Por exemplo: temos uma loja e queremos que os pedidos do WhatsApp entrem sozinhos no sistema.")} />
              <p className="hint">{L("Unas líneas alcanzan. Lo charlamos en detalle después.", "Algumas linhas bastam. Conversamos em detalhe depois.")}</p>
              <small />
            </div>
            <div className="hp" aria-hidden>
              <label htmlFor="f-web">{L("No completar", "Não preencher")}</label><input id="f-web" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="field field--full consent">
              <label htmlFor="f-ok">
                <input id="f-ok" type="checkbox" required />
                <span>{L(
                  "Acepto que The Nexa Company use estos datos para responder mi consulta, según la ",
                  "Aceito que a The Nexa Company use estes dados para responder minha mensagem, conforme a ",
                )}<a href={href("/privacidad/")} target="_blank" rel="noopener">{L("política de privacidad", "política de privacidade")}</a>.</span>
              </label>
              <small />
            </div>
            {error && <p className="field--full form__err" role="alert">{error}</p>}
            <button className="btn btn--solid field--full" type="submit" disabled={state === "sending"} aria-busy={state === "sending"}>
              {state === "sending" ? L("Enviando…", "Enviando…") : <>{L("Enviar consulta", "Enviar mensagem")} <span className="arr">→</span></>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
