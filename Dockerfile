FROM node:22-bookworm AS test

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql python3-aiosmtpd wget \
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
RUN ./docker/run-candidate-tests.sh

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=test /app /app

# Enable pnpm and provide an empty dotenv target; real configuration is supplied
# by the platform environment and the repository-managed .env behavior.
RUN corepack enable && touch /app/.env

EXPOSE 3000
CMD ["pnpm", "run", "start"]
