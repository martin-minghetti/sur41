# Sur41

Demo #4 del kit portfolio AR. Agencia de viajes en Bariloche, 14 excursiones reales (cartel de operador local), página por excursión en 3 idiomas (ES rioplatense / EN US / PT-BR).

> **Live**: https://sur41.vercel.app (próximamente)
>
> **Stack**: Next.js 16 · TS · Tailwind v4 · i18n nativo (App Router) · Drizzle + Neon (booking, fase 2) · MercadoPago Checkout Pro (fase 2) · FLUX 1.1 Pro images
>
> **Vibe**: alpine technical Scandi-Japanese (Snow Peak ∩ Klättermusen ∩ And Wander). Cool off-white, hairlines, JetBrains Mono datapoints, coordenadas GPS visibles, rounded-none.

## Estado actual

- [x] Scaffold Next 16 + Tailwind v4
- [x] i18n routing nativo `/[lang]/...` con dictionary pattern
- [x] 14 excursiones con contenido marketing real (research web por excursión)
- [x] Listado + detail por excursión
- [x] Identidad visual alpine technical
- [ ] Hero images por excursión (FLUX 1.1 Pro · Replicate)
- [ ] Booking flow MP Checkout Pro
- [ ] Tests Vitest + 1 Playwright E2E happy path
- [ ] Deploy a Vercel

## Estructura

```
sur41/
├── app/
│   ├── [lang]/
│   │   ├── excursion/[slug]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
├── content/                 # 14 markdown files con frontmatter + 3 secciones por idioma
├── lib/
│   ├── dictionaries.ts      # UI strings por idioma
│   └── excursions.ts        # parser markdown → estructura
└── proxy.ts                 # locale detection + redirect
```

## Dev

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build  # 48 páginas estáticas (3 langs × 14 excursiones + 3 home + edges)
```

## Reglas del contenido

- Datos del cartel real: nombres, precios, qué incluye/excluye textuales del operador.
- Research web por excursión: parquesnacionales.gob.ar, barilocheturismo.gob.ar, Wikipedia, sitios de operadores reales.
- No se inventan datos puntuales (distancias, alturas, duraciones) sin fuente. Si no hay dato → `consultar`.
- Tono: agencia local que conoce Bariloche, no Lonely Planet genérico.

## Licencia

MIT (código). Contenido de excursiones es referencial — los precios y descripciones provienen del cartel de un operador real local; no representa una operación comercial activa.
