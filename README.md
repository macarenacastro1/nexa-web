# The Nexa Company · Sitio web

Estudio de tecnología, diseño y transformación digital. Sitio institucional y comercial en
español (Argentina) y portugués (Brasil).

## Estructura

| Ruta | Contenido |
|---|---|
| `/` · `/pt/` | Home: Hero CAOS → CONTROL · Servicios (3 divisiones) · Proyectos · Cómo trabajamos · Contacto |
| `/experience/` | Nexa Experience: sitios premium, e-commerce, experiencias interactivas, UI/UX |
| `/systems/` | Nexa Systems: aplicaciones web, sistemas de gestión, dashboards, portales |
| `/intelligence/` | Nexa Intelligence: automatización, integraciones, asistentes, documentos (demo de facturas, simulador y calculadora) |
| `/proyectos/` | Proyectos con su estado real (concepto, prototipo, en desarrollo, publicado) |
| `/privacidad/` | Política de privacidad (Ley 25.326 · LGPD) |
| `/casos/criscuolo/` | Concepto navegable de Criscuolo Coffee (en portugués, no indexado) |

Cada página existe en `/` (español) y `/pt/` (portugués). El idioma lo define la dirección y el
botón ES/PT lleva a la misma página en el otro idioma (hreflang + canonical en `lib/seo.ts`).

## Stack
Next.js 15 (export estático) · React 19 · GSAP + ScrollTrigger · Three.js + React Three Fiber
(esfera del cierre) · Canvas 2D (partículas del hero).

## Dónde está cada cosa
- Textos ES/PT: dentro de cada componente con `L("español", "português")` (`lib/i18n.tsx`).
- Divisiones y sus demos: `components/Services.tsx`, `components/demos.tsx`.
- Proyectos (agregar o cambiar estado): `components/projects.tsx`.
- Páginas comerciales: `components/pages/DivisionPage.tsx`.
- Formulario: `components/Contact.tsx` → función `web-lead` de Nexa OS (CRM). Endpoint en `lib/config.ts`.
- Estilos y tokens de color: `app/globals.css` (`:root`).
- Metadatos, sitemap y robots: `lib/seo.ts`, `app/(es)/sitemap.ts`, `app/robots.ts`.

## Reglas de contenido
- No publicar clientes, cifras, testimonios ni resultados que no estén verificados.
- Los conceptos se marcan como conceptos. Sin enlaces vacíos.
- Analítica (GA4): solo eventos sin datos personales (`lib/config.ts → track`).

## Desarrollo
```bash
npm install
npm run dev
```

## Publicación
Cada push a `main` publica en GitHub Pages (`.github/workflows/deploy.yml`), con el dominio
thenexacompany.com. La versión anterior al rediseño quedó en la rama `respaldo/v1-antes-del-brief`.
