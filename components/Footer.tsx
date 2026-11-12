"use client";
import { CONFIG } from "@/lib/config";
import { useHref, useL } from "@/lib/i18n";
import { DIVISIONS, Logo } from "./Nav";

export default function Footer() {
  const L = useL();
  const href = useHref();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="logo"><Logo />NEXA</span>
          <p>{L("Estudio de tecnología, diseño y transformación digital.", "Estúdio de tecnologia, design e transformação digital.")}</p>
        </div>
        <nav aria-label={L("Servicios", "Serviços")}>
          <b>{L("Servicios", "Serviços")}</b>
          {DIVISIONS.map((d) => <a key={d.key} href={href(d.path)}>Nexa {d.name}</a>)}
        </nav>
        <nav aria-label={L("Estudio", "Estúdio")}>
          <b>{L("Estudio", "Estúdio")}</b>
          <a href={href("/proyectos/")}>{L("Proyectos", "Projetos")}</a>
          <a href={`${href("/")}#proceso`}>{L("Cómo trabajamos", "Como trabalhamos")}</a>
          <a href={`${href("/")}#contacto`}>{L("Contacto", "Contato")}</a>
        </nav>
        <nav aria-label={L("Redes y contacto", "Redes e contato")}>
          <b>{L("Seguinos", "Siga a gente")}</b>
          <a href="https://www.instagram.com/thenexacompany" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.linkedin.com/company/thenexacompany" target="_blank" rel="noopener">LinkedIn</a>
          <a href={`mailto:${CONFIG.contactEmail}`}>{CONFIG.contactEmail}</a>
        </nav>
      </div>
      <div className="container footer__legal">
        <span>© {new Date().getFullYear()} The Nexa Company</span>
        <a href={href("/privacidad/")}>{L("Privacidad y datos personales", "Privacidade e dados pessoais")}</a>
      </div>
    </footer>
  );
}
