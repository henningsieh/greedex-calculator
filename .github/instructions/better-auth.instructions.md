---
name: "Better Auth"
description: "Authentication, organizations, permissions, and auth persistence"
applyTo: "apps/calculator/src/lib/better-auth/**/*.ts,apps/calculator/src/features/authentication/**/*.ts,apps/calculator/src/features/authentication/**/*.tsx,apps/calculator/src/features/organizations/**/*.ts,apps/calculator/src/features/organizations/**/*.tsx,apps/calculator/src/features/projects/permissions.ts,apps/calculator/src/lib/orpc/middleware.ts,apps/calculator/src/lib/orpc/procedures.ts,apps/calculator/src/app/api/auth/**/*.ts,packages/database/src/schemas/auth-schema.ts"
---

# Better Auth

Read the relevant Better Auth documentation before changing authentication or organization behavior:

- [Options](../../docs/better-auth/better-auth.options.md)
- [Email/password](../../docs/better-auth/better-auth.credentials.email_password.md)
- [Organizations](../../docs/better-auth/better-auth.organizations.md)
- [oRPC integration](https://v1.orpc.dev/docs/integrations/better-auth.md)
- [Project permissions](../../docs/projects/permissions.md)

## Sources of truth

| Concern              | Location                                               |
| -------------------- | ------------------------------------------------------ |
| Server configuration | `apps/calculator/src/lib/better-auth/index.ts`         |
| Browser client       | `apps/calculator/src/lib/better-auth/auth-client.ts`   |
| Auth route           | `apps/calculator/src/app/api/auth/[...all]/route.ts`   |
| Auth database schema | `packages/database/src/schemas/auth-schema.ts`         |
| oRPC auth procedures | `apps/calculator/src/lib/orpc/procedures.ts`           |
| Auth middleware      | `apps/calculator/src/lib/orpc/middleware.ts`           |
| Permission model     | `apps/calculator/src/features/projects/permissions.ts` |

## Server/client rule

- Server Components and protected procedures use `auth.api` or the server-side oRPC client with request headers.
- Client Components use the Better Auth browser client or hydrated `orpcQuery` data.
- Do not call client hooks from Server Components.
- Preserve request headers through the oRPC context; authentication is request-specific.

## Organization access

- Treat `session.activeOrganizationId` as the tenant boundary.
- Organization-owned reads and writes must constrain database queries by that ID.
- Apply `authorized` before permission middleware.
- Use `requireProjectPermissions` for project operations and keep role semantics aligned with `apps/calculator/src/features/projects/permissions.ts`.
- Distinguish unauthenticated (`UNAUTHORIZED`) from authenticated-but-disallowed (`FORBIDDEN`) behavior.

## Email and providers

- Provider credentials come from `apps/calculator/src/env.ts`.
- Better Auth callbacks call the configured calculator `emailSender`; reusable templates and delivery live in `@greendex/email`.
- Preserve the deployed OAuth callback paths when changing provider configuration.
- Never log or commit OAuth secrets, session secrets, invitation tokens, or verification tokens.

## Schema changes

When a Better Auth model changes:

1. Update `apps/calculator/src/lib/better-auth/index.ts`.
2. Run `pnpm --filter @greendex/calculator auth:generate`.
3. Inspect the generated change in `packages/database/src/schemas/auth-schema.ts`.
4. Generate and inspect the Drizzle migration.
5. Add or update auth integration tests.

A new database must be migrated before auth testing. OAuth initiation writes state to the `verification` table; a failure before provider redirect usually warrants checking schema and database logs first.
