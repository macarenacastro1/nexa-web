# NEXA Automations · Experiencia web

No es una landing tradicional: es una **demo interactiva** de lo que hace la empresa.
El visitante entra a una empresa caótica y la transforma con un movimiento.

## Recorrido
1. **Chaos** — un escritorio caótico: mails, planillas, WhatsApp, facturas, alertas y sistemas desconectados que flotan y reaccionan al cursor. Las ventanas se pueden arrastrar, los post-its también, y al cerrar una notificación llegan dos nuevas. Anotaciones a mano marcan los errores.
2. **Control** — el slider "Take control of your business": las ventanas se frenan, se fragmentan en partículas, forman una estructura conectada y terminan en un panel automatizado. Es reversible.
3. **Flujo** — RECEIVE → UNDERSTAND → EXECUTE → COMPLETE, guiado por el scroll: una factura llega por mail, la IA extrae los datos, se carga en el ERP y todos quedan avisados.
4. **Simulador** — cinco procesos (facturas, ventas, operaciones, atención, integración): el trabajo manual y el automatizado, uno al lado del otro.
5. **Impacto** — calculadora de horas ahorradas con gráficos. Los resultados se pueden enviar por WhatsApp.
6. **Cierre** — estructura luminosa en 3D, "Stop managing chaos. Start building the future." y CTA "LET'S AUTOMATE".

## Stack
Next.js 15 (export estático) · React 19 · GSAP + ScrollTrigger · Three.js + React Three Fiber · Canvas 2D para las partículas.

## Desarrollo
```bash
npm install
npm run dev
```

## Personalizar
- Marca y WhatsApp: `lib/config.ts`
- Textos de cada acto: `components/`
- Estilos y colores: `app/globals.css`

## Publicar en GitHub Pages
Ya está incluido el workflow `.github/workflows/deploy.yml`.
En el repo: **Settings → Pages → Source: GitHub Actions**. Cada push a `main` publica la web.
