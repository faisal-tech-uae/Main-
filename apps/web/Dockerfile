# Build context is the monorepo root: docker build -f apps/web/Dockerfile .
FROM node:22-slim AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* variables are inlined into the client bundle at build time,
# so the real Clerk publishable key must be supplied as a build arg for a
# production image (`docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`).
# The placeholder below only lets the image build without secrets present;
# it will not authenticate real users until rebuilt with real keys.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV CLERK_SECRET_KEY=sk_test_placeholder

RUN pnpm --filter @resumeai/web run build

FROM node:22-slim AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
