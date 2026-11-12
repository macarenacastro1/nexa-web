"use client";
import { useEffect, useRef, useState } from "react";
import { CALC_KEY, CONFIG, CONSENT_VERSION, LEAD_ENDPOINT, track, type CalcSummary } from "@/lib/config";
import { sound } from "@/lib/sound";
import { useL, useLang } from "@/lib/i18n";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
);

function readCalc(): CalcSummary | null {
  try {
    const raw = sessionStorage.getItem(CALC_KEY);
    return raw ? (JSON.parse(raw) as CalcSummary) : null;
  } catch {
    return null;
  }
}

function utm() {
  const q = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "content", "term"]) {
    const v = q.get(`utm_${k}`);
    if (v) out[k] = v;
  }
  return out;
}

export default function Contact() {
  const L = useL();
  const { lang } = useLang();
  const [toast, setToast] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const msgRef = useRef<HTMLTextAreaElement>(null);

  // Si viene de la calculadora, sugerimos el mensaje con sus números
  useEffect(() => {
    const fill = (c: CalcSummary | null) => {
      const el = msgRef.current;
      if (!c || !el || el.value.trim()) return;
      el.value = L(
        `Usé la calculadora: ${c.tasks} tareas manuales por semana, ${c.mins} min cada una, ${c.pct}% automatizable. Me da unas ${c.hours_week} h por semana para recuperar.`,
        `Usei a calculadora: ${c.tasks} tarefas manuais por semana, ${c.mins} min cada, ${c.pct}% automatizável. Dá umas ${c.hours_week} h por semana para recuperar.`,
      );
    };
    fill(readCalc());
    const onCalc = (e: Event) => fill((e as CustomEvent<CalcSummary>).detail);
    window.addEventListener(CALC_KEY, onCalc);
    return () => window.removeEventListener(CALC_KEY, onCalc);
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    setError("");
    let ok = true;
    form.querySelectorAll<HTMLInputElement>("input[required], select[required], textarea[required]").forEach((f) => {
      const valid = f.type === "checkbox" ? f.checked : f.checkValidity() && f.value.trim() !== "";
      const fld = f.closest(".field")!;
      fld.classList.toggle("err", !valid);
      const s = fld.querySelector("small");
      if (s) s.textContent = valid ? "" : f.type === "email" ? L("Ingresá un email válido", "Digite um e-mail válido") : f.type === "checkbox" ? L("Necesitamos tu autorización para responderte", "Precisamos da sua autorização para responder") : L("Completá este campo", "Preencha este campo");
      if (!valid) ok = false;
    });
    if (!ok) return;

    const v = (id: string) => (form.querySelector<HTMLInputElement>(`#${id}`)?.value ?? "").trim();
    setSending(true);
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: v("f-n"),
          company: v("f-c"),
          email: v("f-e"),
          phone: v("f-w"),
          need: v("f-s"),
          message: v("f-m"),
          consent: form.querySelector<HTMLInputElement>("#f-ok")?.checked === true,
          consent_version: lang === "pt" ? `${CONSENT_VERSION}-pt` : CONSENT_VERSION,
          website: v("f-web"),
          page: window.location.pathname,
          utm: utm(),
          calculator: readCalc(),
        }),
      });
      if (res.status === 429) throw new Error("rate");
      if (!res.ok) throw new Error("fail");
      track("generate_lead", { form: "diagnostico", topic: v("f-s") || "sin tema" });
      form.reset();
      try { sessionStorage.removeItem(CALC_KEY); } catch { /* nada */ }
      sound.chime();
      setToast(L("¡Listo! Recibimos tu consulta. Te escribimos en menos de 24 h para coordinar el diagnóstico.", "Pronto! Recebemos sua mensagem. Escrevemos em menos de 24 h para agendar o diagnóstico."));
      setTimeout(() => setToast(""), 5000);
    } catch (err) {
      setError(err instanceof Error && err.message === "rate" ? L("Recibimos varias consultas seguidas. Probá de nuevo en un rato o escribinos por mail.", "Recebemos várias mensagens seguidas. Tente de novo daqui a pouco ou escreva por e-mail.") : L("No pudimos enviar tu consulta. Probá de nuevo o escribinos por mail.", "Não conseguimos enviar sua mensagem. Tente de novo ou escreva por e-mail."));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact" id="contacto" aria-label={L("Contacto", "Contato")}>
      <div className="container contact__grid">
        <div>
          <p className="label">{L("Diagnóstico gratis", "Diagnóstico gratuito")}</p>
          <h2 className="h2">{L("Encontremos qué", "Vamos ver o que")}<br /><span className="serif ctrl">{L("automatizar primero.", "automatizar primeiro.")}</span></h2>
          <p className="lead">{L("En una llamada de 30 minutos revisamos tus procesos y te decimos qué conviene automatizar primero, cuánto tiempo te ahorra y cuánto cuesta.", "Em uma chamada de 30 minutos revisamos seus processos e dizemos o que vale automatizar primeiro, quanto tempo economiza e quanto custa.")}</p>
          <ul className="trust">
            <li><Check /><div>{L("Sin compromiso", "Sem compromisso")}<small>{L("Si no hay nada que valga la pena automatizar, te lo decimos.", "Se não houver nada que valha a pena automatizar, a gente avisa.")}</small></div></li>
            <li><Check /><div>{L("Respuesta en menos de 24 h", "Resposta em menos de 24 h")}<small>{L("Hablás con personas, no con un formulario.", "Você fala com pessoas, não com um formulário.")}</small></div></li>
            <li><Check /><div>{L("Argentina y Brasil", "Argentina e Brasil")}<small>{L("Trabajamos con empresas de Argentina y Brasil, en español y portugués.", "Trabalhamos com empresas da Argentina e do Brasil, em espanhol e português.")}</small></div></li>
            <li><Check /><div>{L("Caso real: Tex Hub para Texbros", "Case real: Tex Hub para a Texbros")}<small>{L("Un sistema a medida que centraliza toda su operación.", "Um sistema sob medida que centraliza toda a operação.")}</small></div></li>
          </ul>
          <a href={`mailto:${CONFIG.contactEmail}`} onClick={() => track("contact_email_click")} className="btn btn--line" style={{ marginTop: 30 }}>{L("Prefiero escribir por mail", "Prefiro escrever por e-mail")} <span className="arr">→</span></a>
        </div>
        <form className="form" onSubmit={submit} noValidate>
          <h3>{L("Agendá tu diagnóstico", "Agende seu diagnóstico")}<small>{L("Completá tus datos y te contactamos.", "Preencha seus dados e entraremos em contato.")}</small></h3>
          <div className="field"><label htmlFor="f-n">{L("Nombre", "Nome")}</label><input id="f-n" required autoComplete="name" /><small /></div>
          <div className="field"><label htmlFor="f-c">Empresa</label><input id="f-c" required autoComplete="organization" /><small /></div>
          <div className="field"><label htmlFor="f-e">Email</label><input id="f-e" type="email" required autoComplete="email" /><small /></div>
          <div className="field"><label htmlFor="f-w">{L("WhatsApp o teléfono", "WhatsApp ou telefone")} <span style={{ opacity: .6 }}>(opcional)</span></label><input id="f-w" type="tel" placeholder={L("+54 9 11 …", "+55 11 9 …")} autoComplete="tel" /><small /></div>
          <div className="field field--full"><label htmlFor="f-s">{L("¿Qué te gustaría resolver?", "O que você gostaria de resolver?")}</label>
            <select id="f-s" required defaultValue="">
              <option value="" disabled>{L("Elegí una opción", "Escolha uma opção")}</option>
              <option value="Procesamiento de facturas">{L("Procesamiento de facturas", "Processamento de notas fiscais")}</option>
              <option value="Clientes y ventas">{L("Clientes y ventas", "Clientes e vendas")}</option>
              <option value="Atención al cliente / WhatsApp">{L("Atención al cliente / WhatsApp", "Atendimento ao cliente / WhatsApp")}</option>
              <option value="Seguimiento de operaciones">{L("Seguimiento de operaciones", "Acompanhamento de operações")}</option>
              <option value="Integración entre sistemas">{L("Integración entre sistemas", "Integração entre sistemas")}</option>
              <option value="Web inteligente">{L("Web inteligente", "Site inteligente")}</option>
              <option value="Contenido visual con IA">{L("Contenido visual con IA", "Conteúdo visual com IA")}</option>
              <option value="No sé, quiero asesoramiento">{L("No sé, quiero asesoramiento", "Não sei, quero orientação")}</option>
            </select><small />
          </div>
          <div className="field field--full"><label htmlFor="f-m">{L("Contanos brevemente", "Conte brevemente")}</label><textarea id="f-m" ref={msgRef} rows={4} required /><small /></div>
          <div className="field field--full" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="f-web">{L("No completar", "Não preencher")}</label><input id="f-web" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="field field--full">
            <label htmlFor="f-ok" style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", lineHeight: 1.45 }}>
              <input id="f-ok" type="checkbox" required style={{ width: 16, height: 16, marginTop: 2, flex: "none", accentColor: "var(--teal)" }} />
              <span>{L(
                `Acepto que NEXA guarde estos datos para responder mi consulta y coordinar el diagnóstico. Puedo pedir que los borren cuando quiera escribiendo a ${CONFIG.contactEmail} (Ley 25.326).`,
                `Aceito que a NEXA guarde estes dados para responder minha mensagem e agendar o diagnóstico. Posso pedir a exclusão quando quiser escrevendo para ${CONFIG.contactEmail} (LGPD).`,
              )}</span>
            </label>
            <small />
          </div>
          {error && <p className="field--full" role="alert" style={{ color: "var(--coral-2)", fontSize: 13.5, margin: 0 }}>{error}</p>}
          <button className="btn btn--solid field--full" type="submit" disabled={sending} aria-busy={sending}>{sending ? L("Enviando…", "Enviando…") : <>{L("Agendar diagnóstico gratis", "Agendar diagnóstico gratuito")} <span className="arr">→</span></>}</button>
        </form>
      </div>
      <div className={`toast${toast ? " show" : ""}`} role="status">{toast}</div>
    </section>
  );
}
