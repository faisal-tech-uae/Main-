# Architecture

## Monorepo layout

```
apps/web       Next.js 15 (App Router), Tailwind v4, Clerk auth, React Hook Form + Zod
apps/api       Express + TypeScript, Prisma/Postgres
packages/db    Prisma schema, generated client, seed script
packages/shared  Zod schemas shared by web and api (source of truth for the resume document model)
packages/ats-engine  Rule-based ATS scoring engine (no AI dependency — pure functions)
packages/ai    Provider-agnostic AI client (OpenAI / Anthropic / Gemini) + modular prompts
```

Workspace packages (`db`, `shared`, `ats-engine`, `ai`) ship TypeScript source directly — there is
no separate compile step for them. They're consumed as-is by `apps/web` (via Next's bundler) and
`apps/api` (via `tsx`, both in development and in the production Docker image). Only `apps/web`
(Next build) and `apps/api` (a `tsc --noEmit`-equivalent type-safety gate) have "build" scripts in
the traditional sense.

## Why a JSON document for resume content

`Resume` has a `currentVersionId` pointer into `ResumeVersion`, and each version stores a single
`data: Json` column validated against `resumeDocumentSchema` (`packages/shared/src/schemas/resume.ts`).
This was a deliberate choice over one table per section (Experience, Education, Skills, ...):

- Section order and presence is highly variable per resume (custom sections, industry-specific
  ordering), and the builder UI and AI layer always read/write the whole document at once.
- Versioning "the whole resume" is what the product needs (restore a prior version, diff scores
  across versions) — versioning 15 normalized tables in lockstep would add real complexity for no
  practical benefit here.
- Everything that *is* queried/filtered independently — `AtsAnalysis`, `CoverLetter`, `Template`,
  `Subscription`, `AiUsageLog` — is a first-class relational model in `packages/db/prisma/schema.prisma`.

## The ATS scan pipeline

`apps/api/src/services/ats-scan.service.ts` is the orchestrator:

1. Resolve input into a `ParsedResumeStructure` (`packages/ats-engine/src/types.ts`) — either from
   an uploaded file (parsed by `apps/api/src/services/parser.service.ts`, using pdf.js directly
   for PDFs and mammoth + JSZip for DOCX) or from a builder resume (`resume-to-structure.ts`
   derives the same structural contract from the JSON document + template layout).
2. Run `analyzeResume()` from `@resumeai/ats-engine` — pure, deterministic, no network calls.
   Produces rule findings, JD keyword matching, the 11-platform simulation, and the category +
   hybrid scores.
3. Run three AI calls in parallel via `@resumeai/ai`'s `AiClient`: executive analysis, a
   platform-specific parse explanation, and (if a job description is present) a keyword gap
   analysis. Each AI call is independently wrapped so a provider failure degrades gracefully
   instead of failing the whole scan.
4. Persist everything to `AtsAnalysis` and return it to the client.

## AI provider abstraction

`packages/ai` defines a single `AiProviderClient` interface (`complete()`) with adapters for
OpenAI, Anthropic, and Gemini. `AiClient` sits on top of that and exposes one method per product
feature (`analyzeResume`, `generateCoverLetter`, `rewriteBullet`, ...), each backed by a **modular
prompt** (`packages/ai/src/prompts/*.ts` — one file per feature, per the spec's "separate prompts
for resume analysis / ATS analysis / keyword analysis / cover letter / interview / LinkedIn /
rewrite" requirement). Prompts can be overridden per-feature at runtime — `apps/api/src/lib/ai.ts`
loads any active `PromptTemplate` rows from the database and passes them as overrides, which is
what powers the admin panel's live prompt editing.

Responses are validated with Zod (`packages/ai/src/schemas.ts`) before being trusted, and every
call reports token usage/cost/latency through an `onUsage` callback that the API wires to
`AiUsageLog` for the admin cost dashboard.

## Auth & authorization

Clerk issues the session JWT; `apps/api/src/middleware/auth.ts` verifies it with
`@clerk/backend`'s `verifyToken` and lazily upserts a local `User` row keyed by `clerkId` on first
sight (with a `FREE` `Subscription` created alongside it). A Clerk webhook
(`apps/api/src/routes/webhooks/clerk.routes.ts`) keeps `user.updated`/`user.deleted` in sync
without waiting for the user to make an API call.

Plan-gated features (cover letters, interview coach, resume rewrite, LinkedIn optimizer) are
enforced server-side by `middleware/plan-feature.ts`, not just hidden in the UI. Scan quotas
(5/month on Free, unlimited on paid plans) are enforced by `services/subscription.service.ts`.

## Repository / service layers

Each domain has a `repositories/*.repository.ts` (thin Prisma query functions) and, where there's
actual business logic, a `services/*.service.ts` on top (ownership checks, orchestration, AI
calls). Route handlers stay thin — validate input with Zod, call a service, shape the response.
Admin routes that are pure CRUD skip the service layer and call repositories directly; that's a
deliberate simplification, not an oversight.

## Frontend data fetching

There's no React Query/SWR dependency. `apps/web/src/hooks/use-api.ts` wraps `fetch` with the
current Clerk session token; `apps/web/src/hooks/use-resource.ts` is a small `useEffect`-based GET
wrapper with `refetch`. Given the number of read-mostly admin/dashboard pages, this was simpler
than introducing a caching library — worth revisiting if the app grows enough that manual
`refetch()` calls after mutations become a maintenance burden.

## Rendering resumes (preview / PDF / DOCX)

Three renderers share the same section-by-section logic but are intentionally not unified into
one abstraction:

- `apps/web/src/components/resume-builder/resume-preview.tsx` — live browser preview (JSX/Tailwind)
- `apps/api/src/services/export/pdf-exporter.ts` — pdfkit
- `apps/api/src/services/export/docx-exporter.ts` — the `docx` package

All three produce the same layout: single column, no tables, no images, no text boxes — the ATS
engine's own formatting checks would otherwise flag output from this product.
