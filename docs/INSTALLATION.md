# Installation Guide

## Prerequisites

- Node.js 22+
- pnpm 10+ (`corepack enable` will pick up the pinned version from `package.json`)
- PostgreSQL 16 (local install or Docker)
- A [Clerk](https://clerk.com) application (free tier is enough for development)
- At least one AI provider API key: [OpenAI](https://platform.openai.com), [Anthropic](https://console.anthropic.com), or [Google AI Studio](https://aistudio.google.com) (Gemini)

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Fill in `apps/api/.env`:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` |
| `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` | From your Clerk dashboard |
| `CLERK_WEBHOOK_SECRET` | From Clerk's Webhooks page, if you wire up `/webhooks/clerk` |
| `AI_PROVIDER` | `OPENAI`, `ANTHROPIC`, or `GEMINI` — which to prefer if multiple keys are set |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | At least one is required |

Fill in `apps/web/.env`:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same Clerk project as the API |
| `CLERK_SECRET_KEY` | Needed by Clerk's Next.js middleware |
| `NEXT_PUBLIC_API_URL` | Where the Express API is reachable, e.g. `http://localhost:4000` |

> Clerk publishable keys are inlined into the client bundle at build time. Even a placeholder
> value is required for `next build` to succeed — see `.github/workflows/ci.yml` for the exact
> placeholder CI uses.

## 3. Set up the database

```bash
pnpm db:migrate   # applies packages/db/prisma/migrations/*
pnpm db:seed      # subscription plan configs, resume templates, default AI prompts
```

`pnpm db:studio` opens Prisma Studio if you want to browse data directly.

## 4. Run the app

```bash
pnpm dev            # web (:3000) + api (:4000) together
pnpm dev:web         # web only
pnpm dev:api         # api only
```

Visit `http://localhost:3000`. Sign up through Clerk, and the API will lazily create the
corresponding `User` row (with a `FREE` subscription) on first authenticated request.

To use the admin panel (`/admin`), promote your user's `role` to `ADMIN` directly in the
database (Prisma Studio, or `UPDATE "User" SET role = 'ADMIN' WHERE email = '...'`) — there is no
self-service way to become an admin, by design.

## 5. Docker

```bash
cp apps/api/.env.example .env   # docker-compose reads CLERK_*/AI provider keys from repo-root .env
docker compose up --build
```

This starts Postgres, the API (`:4000`), and the web app (`:3000`). Docker Compose runs
migrations automatically only if you add a migration step to your deployment pipeline — for a
first run, `docker compose exec api pnpm --filter @resumeai/db exec prisma migrate deploy` (and
`... run seed`) once the containers are up.

Because `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is baked into the web image at build time, rebuild
the `web` image (`docker compose build web`) whenever you change Clerk keys.

## Running tests

```bash
pnpm -r run typecheck
pnpm -r run lint
pnpm -r run test
```

`packages/ats-engine` and `packages/ai` have the most substantial unit test coverage (scoring
logic, platform simulation, prompt/response handling). `apps/api` has integration tests for auth
and route wiring using supertest. See `docs/ROADMAP.md` for known coverage gaps.
