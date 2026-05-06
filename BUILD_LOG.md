# BUILD_LOG — Sur41

> Tracking honesto del tiempo activo. Solo wall-clock cuando estoy en la sesión.

## T-0

`2026-05-06T20:06:19Z` — directorio creado, git init, T-0 timestamp.

## T+ activo

| Mark | UTC | Δ | Hito |
|------|-----|---|------|
| T-0 | 20:06:19 | 0 | git init + content/ folder |
| T+1 | 20:06:30 | +11s | 14 agentes paralelos lanzados (research web + content ES/EN/PT-BR por excursión) |
| T+2 | 20:13:00 | ~7m | 14/14 contenido entregado |
| T+3 | 20:14:00 | +1m | Scaffold Next 16 + Tailwind 4 + deps (gray-matter, react-markdown, drizzle, neon) |
| T+4 | 20:24:00 | +10m | i18n + proxy.ts + cards + detail + alpine technical CSS + build pasa (48 páginas SSG) |
| T+5 | 20:28:00 | +4m | Repo público GH + push (https://github.com/martin-minghetti/sur41) |
| T+6 | 20:31:00 | +3m | 15 imágenes Replicate FLUX 1.1 Pro (~$0.60, 6/min throttle por saldo <$5) |
| T+7 | 20:34:00 | +3m | Wire next/image cards + cover + detail hero, fix lazy-load |
| T+8 | 20:35:00 | +1m | `vercel --prod` deploy en 48s · LIVE: https://sur41.vercel.app |
| **TOTAL** | **20:36:00** | **~30 min** | wall-clock activo |

## Stack confirmado

- **Framework**: Next.js 16.2.5 (Turbopack, App Router) · React 19.2
- **UI**: Tailwind v4 (CSS variables + @theme inline) · rounded-none · hairlines 1px
- **Tipografía**: Inter Display (headers + body) + JetBrains Mono (datapoints)
- **i18n**: nativo App Router `/[lang]/...` + dictionary pattern + proxy.ts (Accept-Language)
- **Content**: markdown con frontmatter (gray-matter) + 3 secciones por idioma parseadas con regex matchAll
- **Render markdown**: react-markdown + remark-gfm
- **Imágenes**: Replicate FLUX 1.1 Pro · 16:9 · script `scripts/generate-images.ts` con throttle + retry 429
- **Deploy**: Vercel (auto-detect Next 16) · proxy.ts soportado nativo

## Decisiones

- **Naming**: `Sur41` (Bariloche ≈ 41°S). Datapoint-driven, alinea con estética mono/coordenadas.
- **Identidad**: alpine technical Scandi-Japanese (Snow Peak ∩ Klättermusen ∩ And Wander). Cool off-white `#F4F4F2`, near-black `#1B1F23`, glacier accent `#9FB8C8`, rounded-none, hairlines.
- **Grid 3-col + Custom Trip card**: 14 + 1 CTA "a medida" = 15 = 3×5 sin slot vacío. Card #15 invertida (negro pleno) gancho comercial.
- **Card tagline**: extracción del primer párrafo de `### Descripción` con strip-markdown. Hero formats variaron demasiado entre los 14 agentes para ser fuente confiable.
- **No `existsSync`**: turbopack RSC server tenía cwd inestable, dropea images condicionales aleatoriamente. Render unconditional con `/images/{slug}.jpg` y next/image se encarga del fallback si falta.
- **Booking + DB**: fase 2. Snapshot actual es content + i18n + visual.

## Costos reales

- Replicate FLUX 1.1 Pro: 15 × $0.04 = **$0.60** (verificado en saldo)
- Vercel: free tier (preview + prod)
- Neon: no aplica todavía (fase 2)

## Próximos hitos (fase 2)

- Booking flow MP Checkout Pro con simulated mode default
- DB Drizzle + Neon (excursión + reserva + cliente)
- Email Resend transaccional
- Tests Vitest unit + 1 Playwright E2E
- Security audit (HMAC tokens, rate limit, CSP, IDOR)
