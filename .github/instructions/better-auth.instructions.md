---
name: "Better Auth"
description: "Greendex authentication, organizations, permissions, and auth persistence"
applyTo: "apps/calculator/src/lib/better-auth/**/*.ts,apps/calculator/src/features/authentication/**/*.ts,apps/calculator/src/features/authentication/**/*.tsx,apps/calculator/src/features/organizations/**/*.ts,apps/calculator/src/features/organizations/**/*.tsx,apps/calculator/src/features/projects/permissions.ts,apps/calculator/src/lib/orpc/middleware.ts,apps/calculator/src/lib/orpc/procedures.ts,apps/calculator/src/app/api/auth/**/*.ts,packages/database/src/schemas/auth-schema.ts"
---

# Better Auth

1. Confirm the installed `better-auth` 1.7 major in `pnpm-workspace.yaml`.
2. Read the [official v1.7 index](https://better-auth.com/docs/llms.txt), then fetch only the relevant official page.
3. Compare examples with installed declarations and Greendex source. The official `better-auth-best-practices` skill, listed by `npx skills list`, is supplementary workflow guidance.

## Greendex rules

- Server configuration: `apps/calculator/src/lib/better-auth/index.ts`; browser client: `apps/calculator/src/lib/better-auth/auth-client.ts`; route: `apps/calculator/src/app/api/auth/[...all]/route.ts`.
- Preserve request headers through the oRPC context. Server code uses `auth.api` or the server oRPC client; Client Components use the browser client or hydrated `orpcQuery` data.
- `session.activeOrganizationId` is the Organization tenant boundary. Constrain Organization-owned reads and writes by it; apply `authorized` before permission middleware; use `requireProjectPermissions` and preserve `UNAUTHORIZED` versus `FORBIDDEN`.
- OAuth credentials come from `apps/calculator/src/env.ts`. Keep deployed callback paths. Never log or commit OAuth, session, invitation, or verification secrets or tokens.
- Reusable email templates and delivery are in `@greendex/email`; the Calculator injects its sender.

## Schema changes

Update the auth configuration, run `pnpm --filter @greendex/calculator auth:generate`, inspect `packages/database/src/schemas/auth-schema.ts`, generate and inspect the Drizzle migration, and update integration tests. A new database needs migrations before auth testing; OAuth initiation writes to `verification` before provider redirect.

[Project permissions](../../docs/projects/permissions.md) remain the authority for permission semantics.
