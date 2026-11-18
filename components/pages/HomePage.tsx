import ScrollRefresh from "@/components/ScrollRefresh";
import Nav from "@/components/Nav";
import ChaosStage from "@/components/ChaosStage";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Seam = () => <div className="seam" aria-hidden><i /></div>;

/**
 * Home: cuatro secciones · 01 Hero CAOS → CONTROL · 02 Servicios · 03 Cómo trabajamos · 04 Contacto.
 * Testimonios y el cierre (Finale) quedan en el código pero no se muestran:
 * los testimonios vuelven cuando estén verificados y autorizados.
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
        <Contact />
      </main>
      <Footer />
    </>
  );
}
