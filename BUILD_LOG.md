# BUILD_LOG — Sur41

> Tracking honesto del tiempo activo. Solo wall-clock cuando estoy en la sesión, no incluye background research que correa solo.

## T-0

`2026-05-06T20:06:19Z` — directorio creado, git init, T-0 timestamp.

## T+ activo

| Mark | UTC | Δ | Hito |
|------|-----|---|------|
| T-0 | 20:06:19 | 0 | git init + content/ folder |
| T+1 | 20:06:30 | +11s | 14 agentes paralelos lanzados (research web + content ES/EN/PT-BR por excursión) |
| T+2 | 20:13:00 | ~7m | 14/14 contenido entregado (~140k tokens combinados) |
| T+3 | 20:14:00 | +1m | Scaffold Next 16 + Tailwind 4 + deps (gray-matter, react-markdown, drizzle, neon) |
| T+4 | 20:24:00 | +10m | i18n + proxy.ts + cards + detail + alpine technical CSS + build pasa (48 páginas SSG) + visual verificado con agent-browser |

## Stack confirmado

- **Framework**: Next.js 16.2.5 (Turbopack, App Router)
- **UI**: React 19.2 + Tailwind v4 (CSS variables + @theme inline)
- **Tipografía**: Inter (display + body) + JetBrains Mono (datapoints)
- **i18n**: nativo App Router con `/[lang]/...` + dictionary pattern + proxy.ts (locale detection vía Accept-Language)
- **Content**: markdown con frontmatter (gray-matter) + secciones `## es / ## en / ## pt-br` parseadas con regex matchAll
- **Render markdown**: react-markdown + remark-gfm (componentes React, sin inyección HTML cruda)

## Decisiones

- **Naming**: Sur41 (Bariloche ≈ 41°S). Datapoint-driven, alinea con estética mono/coordenadas.
- **Identidad**: alpine technical Scandi-Japanese (Snow Peak ∩ Klättermusen ∩ And Wander). Cool off-white #F4F4F2, near-black #1B1F23, glacier accent #9FB8C8, rounded-none, hairlines 1px.
- **Grid 3-col + Custom Trip card**: 14 excursiones + 1 CTA "a medida" = 15 = 3×5 sin slot vacío. Card #15 invertida (negro pleno) sirve como gancho comercial.
- **Card tagline**: extracción por primer párrafo de `### Descripción` con strip-markdown. Hero formats varían demasiado entre archivos para ser fuente confiable.
- **Sin imágenes en este snapshot**: hero images con FLUX 1.1 Pro vienen después.
- **Booking flow + DB**: fase 2. Snapshot actual es content + i18n.

## Próximos hitos

- T+5: Generar 14+ imágenes Replicate FLUX 1.1 Pro (~$0.56)
- T+6: Wiring de imágenes a hero detail + cards
- T+7: Deploy Vercel
- T+8: Verificación live + screenshots
