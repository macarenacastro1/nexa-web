"use client";
import { useL } from "@/lib/i18n";
import ScrollRefresh from "@/components/ScrollRefresh";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { ProjectCard, useProjects } from "@/components/projects";

/** /proyectos: todos los proyectos con su estado real. */
export default function ProjectsPage() {
  const L = useL();
  const P = useProjects();
  const states = L(
    [["Concepto", "Una propuesta de diseño y experiencia, sin un cliente detrás."], ["Prototipo", "Una versión navegable para validar la idea."], ["En desarrollo", "En construcción con un alcance definido."], ["Publicado", "En línea y en uso."]],
    [["Conceito", "Uma proposta de design e experiência, sem um cliente por trás."], ["Protótipo", "Uma versão navegável para validar a ideia."], ["Em desenvolvimento", "Em construção com um escopo definido."], ["Publicado", "No ar e em uso."]],
  );
  return (
    <>
      <ScrollRefresh />
      <Nav />
      <main id="main" className="dp">
        <section className="dp-hero" aria-labelledby="pp-title">
          <div className="container">
            <p className="label">{L("Proyectos", "Projetos")}</p>
            <h1 className="dp-hero__title" id="pp-title">{L("Proyectos y", "Projetos e")} <span className="serif ctrl">{L("conceptos.", "conceitos.")}</span></h1>
            <p className="lead">{L(
              "Cada proyecto tiene su propia identidad, sus desafíos y una forma distinta de resolverlos. Indicamos siempre en qué estado está cada uno.",
              "Cada projeto tem sua própria identidade, seus desafios e uma forma diferente de resolvê-los. Sempre indicamos em que status cada um está.",
            )}</p>
            <dl className="pp-states">
              {states.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
            </dl>
          </div>
        </section>
        <section className="dp-sec" aria-label={L("Lista de proyectos", "Lista de projetos")}>
          <div className="container pjs__list pp-list">
            {P.map((p, i) => <ProjectCard key={p.key} p={p} i={i} detail />)}
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
