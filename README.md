# ResumeAI Pro

An AI-powered platform for building ATS-compatible resumes, scanning existing resumes against real ATS parsing behavior, and matching resumes to job descriptions — with a hybrid rule-based + AI scoring engine at its core.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the system is put together, [`docs/INSTALLATION.md`](docs/INSTALLATION.md) to run it locally or with Docker, and [`docs/ROADMAP.md`](docs/ROADMAP.md) for an honest picture of what's fully built versus scaffolded for follow-up work.

## What's in this repo

A pnpm monorepo:

```
apps/
  web/            Next.js 15 frontend (App Router, Tailwind v4, Clerk auth)
  api/             Express + TypeScript API (Prisma/Postgres, repository/service layers)
packages/
  db/              Prisma schema, client, seed data
  shared/          Zod schemas shared between web and api (the resume document model, DTOs)
  ats-engine/      Rule-based ATS scoring engine (the product's core differentiator)
  ai/              Provider-agnostic AI client (OpenAI / Anthropic / Gemini) + modular prompts
```

## The scoring engine

Instead of a single generic "85/100," every scan produces three distinct scores plus 8 category
scores:

- **ATS Pass Score** — how likely a machine parser is to extract this resume's content correctly
- **Recruiter Appeal Score** — how a human reader would rate clarity, impact, and readability
- **Role Match Score** — how well the resume aligns to a specific job description

Findings are also run through a simulation of 11 major ATS platforms (Greenhouse, Lever, Workday,
Oracle Taleo, SAP SuccessFactors, iCIMS, SmartRecruiters, JazzHR, BambooHR, UKG, Dayforce), each
with different sensitivity to formatting issues like tables, columns, and non-standard headings.
This is a heuristic simulation based on published ATS parsing guidance — not reverse-engineered
vendor behavior — and the UI says so.

See `packages/ats-engine/src/analyze.ts` for the orchestration and
`apps/api/src/services/ats-scan.service.ts` for how it's combined with the AI layer.

## Quick start

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # fill in DATABASE_URL, Clerk keys, an AI provider key
cp apps/web/.env.example apps/web/.env   # fill in Clerk publishable key
pnpm db:migrate   # applies packages/db/prisma/migrations against DATABASE_URL
pnpm db:seed      # plan configs, resume templates, default AI prompts
pnpm dev          # runs apps/web (:3000) and apps/api (:4000) together
```

Full setup instructions (including Docker) are in [`docs/INSTALLATION.md`](docs/INSTALLATION.md).

## Testing

```bash
pnpm -r run typecheck
pnpm -r run lint
pnpm -r run test
```

The ATS engine and AI client packages have unit tests covering scoring, platform simulation,
keyword matching, and prompt/response handling; the API has integration tests for auth and
routing. See `docs/ROADMAP.md` for test coverage gaps.
