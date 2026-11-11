import ScrollRefresh from "@/components/ScrollRefresh";
import Nav, { Logo } from "@/components/Nav";
import ChaosStage from "@/components/ChaosStage";
import Flow from "@/components/Flow";
import Services from "@/components/Services";
import Simulator from "@/components/Simulator";
import Impact from "@/components/Impact";
import Finale from "@/components/Finale";
import Contact from "@/components/Contact";
import { CONFIG } from "@/lib/config";

const Seam = () => <div className="seam" aria-hidden><i /></div>;

export default function Home() {
  return (
    <>
      <ScrollRefresh />
      <Nav />
      <main>
        <ChaosStage />
        <Seam />
        <Flow />
        <Seam />
        <Services />
        <Seam />
        <Simulator />
        <Seam />
        <Impact />
        <Finale />
        <Contact />
      </main>
      <footer className="footer">
        <div className="container">
          <span className="logo" style={{ fontSize: 13 }}><Logo />{CONFIG.brand}</span>
          <span>© {new Date().getFullYear()} {CONFIG.brandFull} · Automatización e IA para empresas</span>
          <nav>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </footer>
      <a href="#contacto" className="wa-float" aria-label="Agendar diagnóstico gratis">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
      </a>
    </>
  );
}
