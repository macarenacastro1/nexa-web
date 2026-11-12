import ScrollRefresh from "@/components/ScrollRefresh";
import Nav from "@/components/Nav";
import ChaosStage from "@/components/ChaosStage";
import Flow from "@/components/Flow";
import Services from "@/components/Services";
import Simulator from "@/components/Simulator";
import Impact from "@/components/Impact";
import Finale from "@/components/Finale";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

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
      <Footer />
      <a href="#contacto" className="wa-float" aria-label="Agendar diagnóstico / Agendar diagnóstico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
      </a>
    </>
  );
}
