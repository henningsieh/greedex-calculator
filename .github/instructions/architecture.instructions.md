---
name: "Architecture"
description: "Monorepo boundaries, Next.js layers, and critical SSR initialization"
applyTo: "apps/*/src/**/*.ts,apps/*/src/**/*.tsx,packages/*/src/**/*.ts,packages/*/src/**/*.tsx"
---

# Architecture

Use this instruction when placing code, crossing workspace boundaries, or changing server/client data flow. Read [`docs/README.md`](../../docs/README.md) and the topic-specific documentation before changing an integration.

## Workspace boundaries

| Area              | Source of truth           | Responsibility                                                                |
| ----------------- | ------------------------- | ----------------------------------------------------------------------------- |
| Calculator app    | `apps/calculator/src/`    | Next.js routes, feature modules, oRPC adapters, Better Auth wiring, Socket.IO |
| Documentation app | `apps/documentation/src/` | Fumadocs application                                                          |
| Auth package      | `packages/auth/src/`      | Shared Better Auth client types and utilities                                 |
| Config package    | `packages/config/src/`    | Shared domain and locale configuration                                        |
| Database package  | `packages/database/src/`  | Drizzle client, schemas, migrations                                           |
| Email package     | `packages/email/src/`     | Transactional templates, rendering, delivery primitives                       |
| i18n package      | `packages/i18n/src/`      | next-intl exports and locale messages                                         |

Keep environment-specific integration in the consuming app. For example, `apps/calculator/src/lib/email.ts` injects SMTP and application URL configuration into `@greendex/email`.

## Calculator layers

- Routes and layouts: `apps/calculator/src/app/`
- Feature behavior: `apps/calculator/src/features/<feature>/`
- Shared app components: `apps/calculator/src/components/`
- Integration libraries: `apps/calculator/src/lib/`
- Unit/integration tests: `apps/calculator/src/__tests__/` and feature-local `__tests__/`
- Browser tests: `apps/calculator/src/__tests__/e2e/`

Add business procedures to the owning feature, then register them in `apps/calculator/src/lib/orpc/router.ts`. Put reusable cross-app behavior in a workspace package only when it has a clear package-level API.

## Critical SSR oRPC invariant

The universal client in `apps/calculator/src/lib/orpc/orpc.ts` reads `globalThis.$client` when its module is evaluated. Preserve both initialization paths:

1. `apps/calculator/src/instrumentation.ts` dynamically imports `@/lib/orpc/client.server` in the Node.js runtime.
2. `apps/calculator/src/app/[locale]/layout.tsx` side-effect-imports `@/lib/orpc/client.server` before local imports that can load the universal oRPC client.

`apps/calculator/src/lib/orpc/client.server.ts` installs the direct router client on `globalThis.$client`. Removing or delaying either initialization path makes SSR fall back to the browser-only `RPCLink`; existing project routes can then render misleading 404 pages.

Preserve the imports and their effective evaluation order. Validate changes with `apps/calculator/src/__tests__/e2e/project-routing.spec.ts`. Read [`docs/orpc/DUAL-SETUP.md`](../../docs/orpc/DUAL-SETUP.md) before editing this seam.

## Server and client data flow

- Server Components call `orpc` directly or prefetch `orpcQuery` query options into the request query client.
- Client Components use `orpcQuery` with TanStack Query and `orpc` for mutations.
- Prefer Server Components. Add `"use client"` only for hooks, browser APIs, or interaction.
- Pass request-specific headers through the server oRPC context; do not store request data in global reusable context.
- Public REST/OpenAPI traffic enters through `apps/calculator/src/app/api/openapi/`; internal RPC traffic enters through `apps/calculator/src/app/api/rpc/`.

## Placement guide

| Change                                      | Location                                                      |
| ------------------------------------------- | ------------------------------------------------------------- |
| Project or organization procedure           | Owning `apps/calculator/src/features/<feature>/procedures.ts` |
| Procedure registration or shared middleware | `apps/calculator/src/lib/orpc/`                               |
| Database schema or migration                | `packages/database/src/`                                      |
| Transactional email template                | `packages/email/src/templates/`                               |
| Email transport configuration               | `apps/calculator/src/lib/email.ts`                            |
| Translation message                         | Every file in `packages/i18n/src/locales/`                    |
| Shared UI primitive                         | `apps/calculator/src/components/ui/`                          |
| Feature UI                                  | `apps/calculator/src/features/<feature>/components/`          |

## Constraints

- Workspace modules are ESM.
- Read validated environment values from `apps/calculator/src/env.ts`; direct `process.env` access is limited to that file and `apps/calculator/src/instrumentation.ts`.
- Preserve React Compiler configuration in `apps/calculator/next.config.ts`.
- Socket.IO remains a separate process in `apps/calculator/src/socket-server.ts`.
- Import app modules through `@/` and workspace modules through `@greendex/*`; avoid new app-level barrel files.
