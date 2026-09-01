# syntax=docker/dockerfile:1
FROM node:22-bookworm AS dependencies

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

# Build the migration-only production dependency tree before source is copied,
# so source-only deployments reuse this package-install work.
FROM dependencies AS runtime-dependencies

RUN pnpm --filter @greendex/database deploy --prod --legacy --ignore-scripts /runtime/packages/database \
  && chmod -R a-w /runtime/packages/database

FROM dependencies AS test

# Browser binaries and system libraries are intentionally confined to this test
# stage. They are never copied into the production runtime image.
RUN pnpm --filter @greendex/calculator exec playwright install --with-deps chromium

# Non-sensitive identifiers may arrive as plain build args.
ARG GOOGLE_CLIENT_ID
ARG DISCORD_CLIENT_ID
ARG GITHUB_CLIENT_ID
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_SENDER
ARG SMTP_SECURE

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

# Merge both traced Next.js deployments and the small non-Next runtime assets
# into one tree. Permissions are finalized here so the runtime stage does not
# add a second large recursive chown/chmod layer.
FROM test AS runtime-assets

RUN set -eux; \
  mkdir -p /runtime; \
  cp -a apps/calculator/.next/standalone/. /runtime/; \
  cp -a apps/documentation/.next/standalone/. /runtime/; \
  mkdir -p \
    /runtime/apps/calculator/.next \
    /runtime/apps/documentation/.next \
    /runtime/apps/documentation/.source \
    /runtime/packages/database/src \
    /runtime/docker; \
  cp -a apps/calculator/.next/static /runtime/apps/calculator/.next/static; \
  cp -a apps/calculator/public /runtime/apps/calculator/public; \
  cp -a apps/calculator/dist/socket-server.mjs /runtime/apps/calculator/socket-server.mjs; \
  cp -a apps/documentation/.next/static /runtime/apps/documentation/.next/static; \
  cp -a apps/documentation/.source/. /runtime/apps/documentation/.source/; \
  cp -a packages/database/drizzle.config.ts packages/database/package.json /runtime/packages/database/; \
  cp -a packages/database/src/. /runtime/packages/database/src/; \
  cp -a docker/runtime-entrypoint.sh docker/runtime-start.sh /runtime/docker/; \
  touch /runtime/.env; \
  chmod -R a-w /runtime; \
  chmod -R u+w \
    /runtime/apps/calculator/.next \
    /runtime/apps/documentation/.next \
    /runtime/apps/documentation/.source

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=runtime-dependencies /runtime/ /app/
COPY --from=runtime-assets --chown=node:node /runtime/ /app/

USER node

# The runtime gate is PID 1 in the exact final image. It validates migration,
# both standalone Next.js servers, Socket.IO, permissions, and shutdown before
# starting the promotable topology through the same command.
EXPOSE 3000 3001 4000
ENTRYPOINT ["docker-entrypoint.sh", "/app/docker/runtime-entrypoint.sh"]
CMD ["/app/docker/runtime-start.sh"]
