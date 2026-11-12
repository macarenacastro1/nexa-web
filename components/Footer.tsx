"use client";
import { CONFIG } from "@/lib/config";
import { useL } from "@/lib/i18n";
import { Logo } from "./Nav";

export default function Footer() {
  const L = useL();
  return (
    <footer className="footer">
      <div className="container">
        <span className="logo" style={{ fontSize: 13 }}><Logo />{CONFIG.brand}</span>
        <span>© {new Date().getFullYear()} {CONFIG.brandFull} · {L("Automatización e IA para empresas", "Automação e IA para empresas")}</span>
        <nav aria-label={L("Redes", "Redes")}>
          <a href="https://www.instagram.com/thenexacompany" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.linkedin.com/company/thenexacompany" target="_blank" rel="noopener">LinkedIn</a>
          <a href={`mailto:${CONFIG.contactEmail}`}>{CONFIG.contactEmail}</a>
        </nav>
      </div>
    </footer>
  );
}
