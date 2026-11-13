import ScrollRefresh from "@/components/ScrollRefresh";
import Nav from "@/components/Nav";
import ChaosStage from "@/components/ChaosStage";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Finale from "@/components/Finale";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Seam = () => <div className="seam" aria-hidden><i /></div>;

/**
 * Home del brief maestro, cinco secciones:
 * 01 Hero CAOS → CONTROL · 02 Servicios (con los proyectos de Experience) · 03 Cómo trabajamos · 04 Contacto.
 * La esfera del cierre funciona como transición hacia el contacto (no es una sección más).
 * La demo de facturas, el simulador y la calculadora viven en /intelligence.
 */
export default function HomePage() {
  return (
    <>
      <ScrollRefresh />
      <Nav home />
      <main id="main">
        <ChaosStage />
        <Seam />
        <Services />
        <Seam />
        <Process />
        <Finale />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
