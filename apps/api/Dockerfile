# Build context is the monorepo root: docker build -f apps/api/Dockerfile .
#
# Workspace packages (packages/db, shared, ats-engine, ai) ship TypeScript
# source directly (no separate compile step) and are transpiled on the fly
# by tsx, both in development and in this production image. `pnpm run build`
# still runs `tsc --noEmit`-equivalent compilation for apps/api as a build-time
# type-safety gate, but the running process is `tsx src/index.ts`.
FROM node:22-slim AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ats-engine/package.json packages/ats-engine/package.json
COPY packages/ai/package.json packages/ai/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm --filter @resumeai/db run generate
RUN pnpm --filter @resumeai/api run build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api ./apps/api

WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["pnpm", "run", "start"]
