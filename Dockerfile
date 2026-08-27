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

# Sensitive credentials are provided as Docker build secrets, mounted into this
# single step and exposed to the script under /run/secrets/<NAME>. They never
# become part of any image layer, manifest, or cache entry.
RUN --mount=type=secret,id=BETTER_AUTH_SECRET \
    --mount=type=secret,id=GOOGLE_CLIENT_ID \
    --mount=type=secret,id=GOOGLE_CLIENT_SECRET \
    --mount=type=secret,id=DISCORD_CLIENT_ID \
    --mount=type=secret,id=DISCORD_CLIENT_SECRET \
    --mount=type=secret,id=GITHUB_CLIENT_ID \
    --mount=type=secret,id=GITHUB_CLIENT_SECRET \
    --mount=type=secret,id=SMTP_HOST \
    --mount=type=secret,id=SMTP_PORT \
    --mount=type=secret,id=SMTP_SENDER \
    --mount=type=secret,id=SMTP_USERNAME \
    --mount=type=secret,id=SMTP_PASSWORD \
    --mount=type=secret,id=SMTP_SECURE \
    ./docker/run-candidate-tests.sh

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=test /app /app

# Enable pnpm, provide an empty dotenv target for the start task, and install
# curl so Coolify's container healthcheck can probe /api/rpc/health without
# falling back from a missing curl to wget.
RUN corepack enable && touch /app/.env \
  && apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["pnpm", "run", "start"]
