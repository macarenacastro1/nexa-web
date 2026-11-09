# NEXA Automations · Experiencia web

No es una landing tradicional: es una **demo interactiva** de lo que hace la empresa.
El visitante entra a una empresa caótica y la transforma con un movimiento.

## Recorrido
1. **El problema**: un escritorio lleno de mails, planillas, chats, alertas y pendientes que no paran.
2. **La transformación**: el visitante arrastra el slider de *Caos* a *Control*. Las ventanas se ordenan, se conectan y se convierten en un panel que funciona solo (con sonido opcional).
3. **La inteligencia**: escena 3D (React Three Fiber) del "cerebro" que conecta WhatsApp, web, mails, planillas, redes, pagos, CRM y stock. Avanza con el scroll.
4. **Tu negocio**: cuatro áreas (Ventas, Atención, Marketing, Operaciones), cada una con su flujo de automatización animado.
5. **El impacto**: calculadora de ahorro, "Menos caos. Más negocio." y formulario de contacto.

## Stack
Next.js 15 (export estático) · React 19 · GSAP + ScrollTrigger · Three.js + React Three Fiber + Drei.

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
