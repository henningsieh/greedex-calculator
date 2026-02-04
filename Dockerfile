FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb ./
COPY turbo.json ./
COPY packages packages
COPY apps apps
RUN bun install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run prebuild
RUN bun run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000 4000

CMD ["bun", "run", "prestart && bun run start"]