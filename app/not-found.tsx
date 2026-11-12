import type { Metadata } from "next";
import "./globals.css";
import Doc from "@/components/Doc";

export const metadata: Metadata = { title: "Página no encontrada · The Nexa Company", robots: { index: false } };

/** 404 propia (hay varios layouts raíz, así que esta página trae su propio documento). */
export default function NotFound() {
  return (
    <Doc lang="es">
      <main id="main" className="nf">
        <div className="container">
          <p className="label">404</p>
          <h1 className="dp-hero__title">Esta página <span className="serif ctrl">no existe.</span></h1>
          <p className="lead">Puede que el enlace haya cambiado con el nuevo sitio. · Esta página não existe ou o link mudou.</p>
          <div className="dp-hero__cta">
            <a className="btn btn--solid" href="/">Ir al inicio <span className="arr">→</span></a>
            <a className="btn btn--line" href="/pt/" lang="pt-BR">Ir para o início</a>
          </div>
        </div>
      </main>
    </Doc>
  );
}
