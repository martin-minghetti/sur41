# Sur41

Demo #4 del kit portfolio AR. Agencia de viajes en Bariloche, 14 excursiones reales (cartel de operador local), página por excursión en 3 idiomas (ES rioplatense / EN US / PT-BR).

> **Live**: https://sur41.vercel.app
>
> **Stack**: Next.js 16 · TS · Tailwind v4 · i18n nativo App Router · react-markdown · Replicate FLUX 1.1 Pro · Vercel
>
> **Vibe**: alpine technical Scandi-Japanese (Snow Peak ∩ Klättermusen ∩ And Wander). Cool off-white, hairlines 1px, JetBrains Mono datapoints, coordenadas GPS visibles, rounded-none.
>
> **Speed-to-prod**: ~30 min wall-clock de T-0 a deploy live · $0.60 Replicate (15 imágenes FLUX × $0.04).

## Estado actual

- [x] Scaffold Next 16 + Tailwind v4 + Turbopack
- [x] i18n routing nativo `/[lang]/...` con dictionary pattern
- [x] proxy.ts con Accept-Language detection + redirect a `/{locale}`
- [x] 14 excursiones con contenido marketing real (research web por excursión)
- [x] Listado + detail por excursión
- [x] Identidad visual alpine technical
- [x] 14 hero images por excursión + 1 cover home (FLUX 1.1 Pro · Replicate)
- [x] Build SSG: 48 páginas estáticas (3 langs × 14 excursiones + 3 home + edges)
- [x] Deploy a Vercel ✅
- [ ] Booking flow MP Checkout Pro (fase 2)
- [ ] DB Drizzle + Neon (fase 2)
- [ ] Email Resend transaccional (fase 2)
- [ ] Tests Vitest + 1 Playwright E2E happy path (fase 2)
- [ ] Security audit: HMAC tokens · rate limit · CSP · IDOR (fase 2)

## Estructura

```
sur41/
├── app/
│   ├── [lang]/
│   │   ├── excursion/[slug]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ExcursionCard.tsx
│   ├── ExcursionDetail.tsx
│   ├── CustomTripCard.tsx
│   ├── Hero.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── content/                  # 14 markdown files con frontmatter + 3 secciones por idioma
├── lib/
│   ├── dictionaries.ts       # UI strings por idioma
│   └── excursions.ts         # parser markdown → estructura
├── public/images/            # 15 imágenes FLUX 1.1 Pro (14 hero + 1 cover)
├── scripts/
│   └── generate-images.ts    # Replicate FLUX runner con throttle + retry 429
├── BUILD_LOG.md              # T-0 inmutable + tracking honesto del tiempo
└── proxy.ts                  # locale detection + redirect (Next 16, ex-middleware)
```

## Dev

```bash
pnpm install
pnpm dev
# http://localhost:3000 → redirect a /es | /en | /pt-br según Accept-Language
```

## Build

```bash
pnpm build
# 48 páginas estáticas SSG (3 langs × 14 excursiones + 3 home + edges)
```

## Generar imágenes (cuando agregás excursiones)

```bash
# Requiere REPLICATE_API_TOKEN en .env.local
pnpm tsx scripts/generate-images.ts
# Throttle 11s entre llamadas + retry automático en 429
# Skip de las que ya existen en public/images/
# Filtro opcional: pnpm tsx scripts/generate-images.ts canopy
```

## Workflow novel: 14 agentes paralelos para contenido

El contenido marketing de las 14 excursiones se generó con 14 sub-agentes en paralelo (uno por excursión). Cada uno hizo research web (parquesnacionales.gob.ar, barilocheturismo.gob.ar, Wikipedia, sitios de operadores reales) y escribió `content/{slug}.md` con frontmatter + 3 secciones idiomáticas. Total: ~7 min para 14 archivos × 3 idiomas = 42 secciones.

## Reglas del contenido

- Datos del cartel real: nombres, precios, qué incluye/excluye textuales del operador.
- Research web por excursión, no inventado.
- No se inventan datos puntuales (distancias, alturas, duraciones) sin fuente. Si no hay dato → `consultar`.
- Tono: agencia local que conoce Bariloche, no Lonely Planet genérico. Cero "paisaje inolvidable / naturaleza pura / magia".

## Decisiones técnicas (firmadas)

- **proxy.ts** (no `middleware.ts`): Next 16 deprecó middleware → proxy. Convención respetada.
- **react-markdown + remark-gfm**: render de markdown sin inyección HTML cruda (componentes React).
- **Render unconditional de imágenes**: Turbopack server-side `process.cwd()` + `existsSync` es inestable, dropea condicionales aleatoriamente. Mejor render directo `<Image src="/images/{slug}.jpg">` y dejar que `next/image` maneje el fallback.
- **Card tagline**: extracción del primer párrafo de `### Descripción` con strip-markdown. Hero formats variaron mucho entre los 14 agentes — no es fuente confiable.

## Costos reales

| Item | Costo |
|------|-------|
| Replicate FLUX 1.1 Pro · 15 imágenes × $0.04 | $0.60 |
| Vercel | free tier |
| Neon | n/a (fase 2) |
| **Total snapshot 1** | **$0.60** |

## Licencia

MIT (código). Contenido de excursiones es referencial — los precios y descripciones provienen del cartel de un operador real local; no representa una operación comercial activa.
