# Sur41

Travel agency in Bariloche (Argentine Patagonia). 14 real excursions from a local operator's printed price sheet, one page per excursion, three native languages (Argentine Spanish / US English / Brazilian Portuguese).

> **Live**: https://sur41.vercel.app
>
> **Stack**: Next.js 16 · TS · Tailwind v4 · native App Router i18n · Drizzle + Neon Postgres · MercadoPago Checkout Pro · Resend (email) · Replicate FLUX 1.1 Pro (images) · Vercel
>
> **Visual identity**: alpine technical Scandi-Japanese (Snow Peak ∩ Klättermusen ∩ And Wander). Cool off-white, 1px hairlines, JetBrains Mono datapoints, GPS coordinates surfaced as UI, no rounded corners.
>
> **Speed-to-prod**: ~30 min wall-clock from T-0 to live (snapshot 1 — content + i18n + visual + deploy). Fase 2 (booking + DB + email + tests + security) added afterwards. $0.60 Replicate spend (15 FLUX images × $0.04).

This is demo #4 of a portfolio kit showcasing fullstack Argentine commerce sites. The other three live: [Norhaven Lodge](https://norhaven-lodge.vercel.app), [Cohere](https://cohere-six.vercel.app), [Bosque](https://bosque-three.vercel.app).

## Status

- [x] Next.js 16 + Tailwind v4 + Turbopack scaffold
- [x] Native App Router i18n via `/[lang]/...` + dictionary pattern + `proxy.ts` (Accept-Language)
- [x] 14 excursions with real marketing copy (web research per excursion)
- [x] Catalogue + per-excursion detail pages
- [x] Alpine technical visual identity
- [x] 14 excursion hero images + 1 home cover (FLUX 1.1 Pro · Replicate)
- [x] SSG build: 96 static pages (3 langs × 14 excursions × 2 routes + 3 home + edges)
- [x] Booking flow with MercadoPago Checkout Pro (simulated mode by default, `PAYMENT_MODE=production` flag for real charges)
- [x] Drizzle + Neon Postgres (`bookings` table, status enum, indices)
- [x] Transactional email via Resend (trilingual HTML template)
- [x] 26 unit tests (Vitest) + Playwright E2E spec
- [x] Security: HMAC tokens (kind-separated checkout 30min / portal 90d), rate limiting, CSP, X-Frame-Options DENY, HSTS, no-sniff, IDOR defense (verified 404 in prod)
- [x] Vercel production deploy

## Architecture

```
sur41/
├── app/
│   ├── [lang]/
│   │   ├── checkout/{exito,error,simulated/[orderId]}/page.tsx
│   │   ├── excursion/[slug]/page.tsx
│   │   ├── excursion/[slug]/reservar/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/mp/webhook/route.ts            # MP webhook with HMAC + timestamp + idempotency
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── BookingForm.tsx                    # client form, useActionState, day-of-week guards
│   ├── ExcursionCard.tsx
│   ├── ExcursionDetail.tsx
│   ├── CustomTripCard.tsx
│   ├── Hero.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── content/                                # 14 markdown files: frontmatter + 3 language sections
├── lib/
│   ├── dictionaries.ts                     # UI strings per locale
│   ├── excursions.ts                       # markdown parser (server-only, uses node:fs)
│   ├── format.ts                           # client-safe formatters
│   ├── server/
│   │   ├── bookings.ts                     # server actions: createBooking + simulatePayment
│   │   ├── db.ts                           # Drizzle + Neon serverless driver
│   │   ├── schema.ts                       # `bookings` table
│   │   ├── hmac.ts                         # HMAC SHA256 IDOR token, kind-separated
│   │   ├── rate-limit.ts                   # in-memory bucket per IP
│   │   ├── payment.ts                      # MercadoPago client
│   │   └── validation.ts                   # Zod safeParse schemas
│   └── email/
│       └── booking-confirmed.ts            # Resend trilingual HTML template
├── public/images/                          # 15 FLUX 1.1 Pro images
├── scripts/
│   ├── generate-images.ts                  # Replicate FLUX runner (throttle + 429 retry)
│   └── db-push.ts                          # Provision schema in Neon
├── tests/
│   ├── unit/                               # Vitest: hmac, excursions, rate-limit, validation
│   └── e2e/                                # Playwright: catalogue + detail + reservar
├── BUILD_LOG.md                            # T-0 immutable + honest time tracking
├── drizzle.config.ts
├── next.config.ts                          # CSP + security headers
├── playwright.config.ts
├── proxy.ts                                # Locale detection + redirect (Next 16, ex-middleware)
└── vitest.config.ts
```

## Local development

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local — set HMAC_SECRET (openssl rand -hex 32) at minimum
pnpm dev
# Open http://localhost:3000 → redirected to /es | /en | /pt-br
```

## Build

```bash
pnpm build
# 96 static pages SSG + 4 dynamic routes (checkout flow + webhook)
```

## Tests

```bash
pnpm test         # Vitest unit (26 tests)
pnpm test:e2e     # Playwright E2E (requires browsers: pnpm exec playwright install)
```

## Generate images (when adding new excursions)

```bash
# Requires REPLICATE_API_TOKEN in .env.local
pnpm images:gen
# Throttles to 11s between calls, auto-retries on 429
# Skips already-existing files in public/images/
# Optional filter: pnpm images:gen canopy
```

## Provision database schema

```bash
# Requires DATABASE_URL pointing to a Neon Postgres branch
pnpm db:push
```

## Novel workflow: 14 parallel agents for marketing content

The marketing copy for the 14 excursions was generated by spinning up 14 sub-agents in parallel (one per excursion). Each one performed web research (parquesnacionales.gob.ar, barilocheturismo.gob.ar, Wikipedia, real local operator sites) and wrote `content/{slug}.md` with frontmatter and three language sections. Total: ~7 minutes for 14 files × 3 languages = 42 sections. Output is verifiable from the markdown source in `content/`.

## Content rules

- Excursion data (names, prices, what's included/excluded) is verbatim from the operator's printed price sheet.
- Web research per excursion, no fabricated data.
- No invented specifics (distances, altitudes, durations) without a source. When unverifiable → `consultar`.
- Tone: a local agency that knows Bariloche, not a generic Lonely Planet rewrite. No "unforgettable landscape", no "pure nature", no "magic".

## Security

The booking flow defends against the IDOR class by signing an HMAC SHA256 token bound to the booking UUID and a kind discriminator (`checkout` vs `portal`) with separate TTLs (30 min vs 90 days). The success page (`/checkout/exito`) requires both `orderId` and a valid token — fake or missing tokens return 404 (verified live).

Other defenses:
- Rate limiting per IP (in-memory bucket): booking 10/5min, simulated checkout 6/5min, MP webhook 60/60s.
- MP webhook signature verification (`x-signature` HMAC SHA256 + `ts` freshness ±5min).
- Strict CSP, `X-Frame-Options: DENY`, HSTS preload, `nosniff`, locked `Permissions-Policy`.
- Zod `safeParse` on all server actions with field-level error reporting.
- Client/server module separation: `lib/excursions.ts` (uses `node:fs`) is server-only; `lib/format.ts` is client-safe.

## Cost breakdown

| Item | Cost |
|------|------|
| Replicate FLUX 1.1 Pro · 15 images × $0.04 | $0.60 |
| Vercel | free tier |
| Neon Postgres | shared free-tier branch |
| Resend | free tier (100 emails/day) |
| **Total snapshot 1 + fase 2** | **$0.60** |

## Production env vars (Vercel)

- `HMAC_SECRET` — required (`openssl rand -hex 32`)
- `DATABASE_URL` — required (Neon Postgres connection string)
- `PAYMENT_MODE` — `simulated` (default) or `production`
- `MP_ACCESS_TOKEN` / `MP_WEBHOOK_SECRET` — only in production payment mode
- `RESEND_API_KEY` / `RESEND_FROM` — for transactional email
- `REPLICATE_API_TOKEN` — only for image generation script

## License

MIT (code). Excursion content is referential — prices and descriptions come from a real local operator's printed price sheet; this is not an active commercial operation.
