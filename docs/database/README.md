# Database Documentation

Use these documents when changing database schemas, migrations, or the connection configuration.

## Documents

- [Coolify SSL connection](./coolify-ssl-connection.md) — configuring `sslmode=require` for PostgreSQL databases hosted on Coolify.

## Source of truth

Database schemas and migrations live in the [`@greendex/database`](../../packages/database/) package.

| Concern | Source of truth |
| --- | --- |
| Drizzle client and connection pool | [`packages/database/src/client.ts`](../../packages/database/src/client.ts) |
| Schema exports | [`packages/database/src/schema.ts`](../../packages/database/src/schema.ts) |
| Better Auth schema | [`packages/database/src/schemas/auth-schema.ts`](../../packages/database/src/schemas/auth-schema.ts) |
| Project/domain schema | [`packages/database/src/schemas/project-schema.ts`](../../packages/database/src/schemas/project-schema.ts) |
| Migrations | [`packages/database/src/migrations/`](../../packages/database/src/migrations/) |
| Drizzle Kit config | [`packages/database/drizzle.config.ts`](../../packages/database/drizzle.config.ts) |

## Changing the schema

Schemas and migrations live in `packages/database/src/`.

1. Edit the appropriate schema under `packages/database/src/schemas/`.
2. Run `pnpm run db:generate`.
3. Inspect the generated SQL and snapshot.
4. Apply with `pnpm run db:migrate` only against the intended database.

Better Auth schema generation uses the calculator's `auth:generate` script and writes to `packages/database/src/schemas/auth-schema.ts`.

## Connection

The client reads `DATABASE_URL` from the environment and creates a `pg` connection pool lazily on first query. See [Coolify SSL connection](./coolify-ssl-connection.md) for the required `sslmode`/`uselibpqcompat` parameters when connecting to Coolify-hosted PostgreSQL.
