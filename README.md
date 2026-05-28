# Kodu — Eesti kinnisvaraportaal

Eesti kinnisvara turuplats, kus müüjad ja ostjad teevad tehinguid otse, ilma maaklerita.

## Tehniline stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** — autentimine, andmebaas, salvestus, realtime
- **Vercel AI Gateway** — Claude Sonnet 4.6 kuulutuste kirjelduste genereerimiseks
- **Stripe** — maksete skelett (test mode)
- **Vercel** — deploy + preview URL-id per PR

## Käivitamine lokaalselt

```bash
pnpm install
cp .env.local.example .env.local   # täida väärtused
pnpm dev
```

Avab `http://localhost:3000`.

## Keskkonnamuutujad

| Nimi | Kirjeldus |
|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projekti URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon võti |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service role (ainult API route'ides) |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway võti (auto Vercel'is) |
| `STRIPE_SECRET_KEY` | Stripe test mode secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe test mode publishable |

## Andmebaas ja seemned

```bash
pnpm db:migrate   # rakendab supabase/migrations/*.sql
pnpm db:seed      # loob 2 demo müüjat + 6 Tallinna kuulutust
```

Demo müüja login: `kodu.seed.mari@gmail.com` / `kodu-demo-1234`

## Deploy

`main` haru push → automaatne production deploy Vercel'i.
Iga PR → preview URL.

## Märkused

- AI kirjelduse genereerimine vajab Vercel kontol kehtivat krediitkaarti (AI Gateway nõue).
- Stripe on test-mode skelett; makset ei nõuta kuulutuse avaldamiseks.
