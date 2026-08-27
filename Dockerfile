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

# Install curl and enable pnpm BEFORE copying the application layers. This
# keeps the small, cacheable apt layer independent of the multi-gigabyte
# COPY --from=test step, so apt never competes with the test-stage export
# for disk space.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

# Create production-only dependency tree
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version ./
COPY apps/calculator/package.json apps/calculator/package.json
COPY apps/documentation/package.json apps/documentation/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/email/package.json packages/email/package.json
COPY packages/i18n/package.json packages/i18n/package.json

RUN pnpm install --frozen-lockfile --prod

# Copy only required runtime build outputs from test stage
COPY --from=test /app/apps ./apps
COPY --from=test /app/packages ./packages
COPY --from=test /app/turbo.json ./turbo.json
COPY --from=test /app/.oxfmtrc.json ./.oxfmtrc.json

# Create non-root user and set ownership
RUN groupadd -r appuser && useradd -r -g appuser appuser \
  && chown -R appuser:appuser /app \
  && touch /app/.env \
  && chown appuser:appuser /app/.env

USER appuser

EXPOSE 3000
CMD ["pnpm", "run", "start"]
