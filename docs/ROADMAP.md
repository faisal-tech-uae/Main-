# Roadmap / Status

The original spec asked for essentially every feature a mature resume-tech company might ship
over a year or more. This document is an honest accounting of what's genuinely implemented end to
end versus what's scaffolded or left as follow-up work — written so nobody mistakes "the folder
exists" for "the feature works."

## Fully implemented (real logic, tested where noted)

- **Resume builder** — all 14 sections from the spec (personal info, summary, experience,
  projects, education, certifications, skills, languages, awards, volunteer, references,
  publications, patents, research, custom sections), versioned storage, restore, live preview.
- **ATS Scanner** — file upload (PDF/DOCX/TXT) with real structural parsing (pdf.js text-position
  clustering for columns/tables, DOCX XML inspection for tables/headers/footers/columns/images),
  contact validation, missing-section detection, weak-verb/buzzword/passive-voice/readability
  checks. Unit-tested (`packages/ats-engine`).
- **Hybrid scoring engine** — the three differentiator scores (ATS Pass / Recruiter Appeal / Role
  Match) plus 8 category scores, computed from real rule findings and JD keyword matching, not
  placeholders.
- **11-platform ATS simulation** — heuristic, clearly labeled as such in the UI (see
  `packages/ats-engine/src/platform-profiles.ts` for the documented basis).
- **AI features** — resume analysis, ATS platform explanation, keyword/JD gap analysis, cover
  letter generation, interview prep (STAR answers), LinkedIn optimization, fact-preserving bullet
  and full-resume rewrite. All three providers (OpenAI/Anthropic/Gemini) implemented behind one
  interface; prompts are modular and admin-editable at runtime.
- **PDF/DOCX export** — real generation (pdfkit, `docx`), not stubs.
- **Auth, plan gating, scan quotas, GDPR export/delete, privacy settings** — enforced server-side.
- **Admin panel** — users, subscriptions/pricing, template activation, live prompt editing, AI
  cost/usage dashboard, audit log — all backed by real queries, not mock data.
- **Dashboard** — score trend, interview rate, profile completion, application tracker, all
  computed from real data (no seeded fake numbers).

## Implemented but intentionally smaller than the spec's number

- **Templates** — the spec asked for 50+. We shipped 22 real, distinct templates covering every
  requested industry category, plus an extensible `Template` model + registry
  (`layoutConfig` JSON: columns, font, accent color, section order) so adding the rest is a data
  problem, not an engineering one. See `packages/db/prisma/seed.ts`.

## Scaffolded / needs follow-up before production launch

- **Billing** — `PlanConfig`/`Subscription` models and admin pricing controls exist, but there's
  no Stripe (or other payment provider) integration wired up yet. Upgrading a plan today would
  need to happen through the admin API, not a checkout flow.
- **Object storage** — uploaded resumes are written to local disk (`apps/api/src/lib/storage.ts`).
  The interface is deliberately minimal so swapping in S3/R2 doesn't require touching callers, but
  that swap hasn't been done — don't run multiple API replicas against local disk in production.
- **Rate limiting** — in-memory (`express-rate-limit`) per process. Fine for a single instance;
  needs a shared store (Redis) behind a load balancer.
- **Background jobs** — none. AI calls and file parsing run synchronously in the request/response
  cycle. For large files or slow AI responses this should move to a queue (BullMQ, etc.) with the
  frontend polling or subscribing for results.
- **Resume comparison** (explicit old-vs-new diff view) and standalone **resume checker**
  (independent of a full ATS scan) are covered implicitly by the existing scan+history/versioning
  features, but there's no dedicated UI for "diff two resumes side by side."
- **Voice resume review, video resume, portfolio builder, AI career coach, salary predictor, job
  recommendation engine, LinkedIn/GitHub/Indeed/Glassdoor import, AI networking assistant** — none
  of these "Future Features" from the spec are implemented. The data model doesn't preclude them,
  but building any one properly is its own project.
- **CI** runs typecheck/lint/test/build on every push/PR to `main`; it does not deploy anywhere.
  Deployment configuration (Vercel for web, Railway/Docker for the API) is documented but not
  automated in this repo.
- **Test coverage** — the ATS engine and AI client have solid unit tests; the API has smoke-level
  integration tests (auth, routing, health). There is no end-to-end test suite (Playwright, etc.)
  driving the actual UI, and no tests for the Prisma repository layer against a real database
  beyond what CI's migration step implicitly verifies.

## A note on the ATS platform simulation

The 11-platform breakdown is a genuinely useful differentiator, but it's important to be precise
about what it is: a heuristic weighting of the same underlying rule findings, informed by publicly
documented ATS parsing best practices (tables/columns/graphics tend to hurt legacy enterprise
platforms like Oracle Taleo/Workday more than modern ones like Greenhouse/Lever). It is **not**
reverse-engineered from any vendor's actual parsing code, and a real employer's specific ATS
configuration will differ from this baseline. The product should keep saying so — it already does,
in both the API's `platform-profiles.ts` comments and the scanner results page.
