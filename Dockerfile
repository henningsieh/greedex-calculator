# syntax=docker/dockerfile:1
FROM node:22-bookworm AS test

# Non-sensitive identifiers may arrive as plain build args.
ARG GOOGLE_CLIENT_ID
ARG DISCORD_CLIENT_ID
ARG GITHUB_CLIENT_ID
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_SENDER
ARG SMTP_SECURE

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl postgresql wget \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version ./
COPY apps/calculator/package.json apps/calculator/package.json
COPY apps/documentation/package.json apps/documentation/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/email/package.json packages/email/package.json
COPY packages/i18n/package.json packages/i18n/package.json

RUN corepack enable && pnpm install --frozen-lockfile

# Browser binaries and system libraries are intentionally confined to this test
# stage. They are never copied into the production runtime image.
RUN pnpm --filter @greendex/calculator exec playwright install --with-deps chromium

COPY . .

# Build configuration is mounted into this single step and exposed to the
# script under /run/secrets/<NAME>. Public URLs are needed while compiling the
# browser bundle; credentials never become part of an image layer or manifest.
RUN --mount=type=secret,id=NEXT_PUBLIC_BASE_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SOCKET_URL \
    --mount=type=secret,id=SMTP_HOST \
    --mount=type=secret,id=SMTP_PORT \
    --mount=type=secret,id=SMTP_SENDER \
    --mount=type=secret,id=SMTP_USERNAME \
    --mount=type=secret,id=SMTP_PASSWORD \
    --mount=type=secret,id=SMTP_SECURE \
    --mount=type=secret,id=IMAP_HOST \
    --mount=type=secret,id=IMAP_PORT \
    --mount=type=secret,id=IMAP_SECURE \
    --mount=type=secret,id=IMAP_USERNAME \
    --mount=type=secret,id=IMAP_PASSWORD \
    --mount=type=secret,id=EMAIL_TEST_SENDER \
    --mount=type=secret,id=EMAIL_TEST_RECIPIENT \
    ./docker/run-candidate-tests.sh

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

# The pinned pnpm package is installed in the test stage and copied with the
# workspace. Runtime invokes it directly with Node, so Corepack cannot fetch a
# package manager during a cold start.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=test /app /app

# The .next output is coupled to the exact node_modules layout it was built
# against (Turbopack bakes resolved package identities into chunks), so the
# full workspace tree ships as-is: building against a production-only tree is
# not possible (TypeScript/tailwind/dotenv-cli are devDependencies) and a
# production-only relink breaks every baked chunk reference. Switching to
# Next.js output:"standalone" is the follow-up refactor that would change
# this. Only the disposable Next.js build cache is dropped.
RUN touch /app/.env \
  && rm -rf /app/apps/*/.next/cache

# Application files stay root-owned (read/execute only). Only the trees the
# runtime legitimately writes (Next.js caches and the documentation app's
# fumadocs codegen) are writable by the unprivileged process.
RUN chown -R node:node /app/apps/calculator/.next \
  /app/apps/documentation/.next \
  /app/apps/documentation/.source

USER node

# The runtime gate is PID 1 in the exact final image. It starts the unchanged
# release command below, withholds Calculator health until all three services
# pass validation, proves graceful shutdown, and then starts the promotable
# process topology. The upstream Node entrypoint remains in front so its normal
# command handling is preserved.
EXPOSE 3000 3001 4000
ENTRYPOINT ["docker-entrypoint.sh", "/app/docker/runtime-entrypoint.sh"]
CMD ["node", "node_modules/pnpm/bin/pnpm.cjs", "run", "start"]
