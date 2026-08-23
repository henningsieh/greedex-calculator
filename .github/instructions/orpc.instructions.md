---
name: "oRPC"
description: "Procedures, middleware, router registration, OpenAPI, and SSR clients"
applyTo: "apps/calculator/src/lib/orpc/**/*.ts,apps/calculator/src/app/api/rpc/**/*.ts,apps/calculator/src/app/api/openapi/**/*.ts,apps/calculator/src/features/**/procedures.ts,apps/calculator/src/features/**/validation-schemas.ts,apps/calculator/src/instrumentation.ts,apps/calculator/src/app/**/page.tsx,apps/calculator/src/app/**/layout.tsx"
---

# oRPC

Read [`docs/orpc/QUICKSTART.md`](../../docs/orpc/QUICKSTART.md), then [`docs/orpc/DUAL-SETUP.md`](../../docs/orpc/DUAL-SETUP.md), before changing procedures or SSR data flow.

## Sources of truth

| Concern                          | Location                                                   |
| -------------------------------- | ---------------------------------------------------------- |
| Router                           | `apps/calculator/src/lib/orpc/router.ts`                   |
| Context and typed errors         | `apps/calculator/src/lib/orpc/context.ts`                  |
| Auth/permission middleware       | `apps/calculator/src/lib/orpc/middleware.ts`               |
| Shared auth/health procedures    | `apps/calculator/src/lib/orpc/procedures.ts`               |
| Feature procedures               | `apps/calculator/src/features/<feature>/procedures.ts`     |
| Direct server client             | `apps/calculator/src/lib/orpc/client.server.ts`            |
| Universal client/query utilities | `apps/calculator/src/lib/orpc/orpc.ts`                     |
| Internal RPC route               | `apps/calculator/src/app/api/rpc/[[...rest]]/route.ts`     |
| REST/OpenAPI route               | `apps/calculator/src/app/api/openapi/[[...rest]]/route.ts` |

## Critical SSR setup

The direct router client must exist before `apps/calculator/src/lib/orpc/orpc.ts` evaluates on the server.

- Preserve the dynamic server-client import in `apps/calculator/src/instrumentation.ts`.
- Preserve the side-effect server-client import in `apps/calculator/src/app/[locale]/layout.tsx` before local SSR consumers.
- Do not replace server calls with HTTP calls back into the same Next.js process.
- Keep server-client context request-scoped by resolving `headers()` inside the context function.

A broken setup can turn successful database queries into misleading route-level 404s. Run `apps/calculator/src/__tests__/e2e/project-routing.spec.ts` after changing this seam.

## Adding or changing procedures

1. Put domain behavior in the owning feature's `procedures.ts`.
2. Define Zod input and output schemas at the boundary.
3. Add `.route(...)` metadata when the procedure belongs in REST/OpenAPI.
4. Use `base` for public procedures or `authorized` for authenticated procedures.
5. Apply permission middleware after `authorized`.
6. Constrain tenant-owned database queries by `context.session.activeOrganizationId`.
7. Throw typed errors from the error map instead of generic HTTP-shaped objects.
8. Register the procedure in `apps/calculator/src/lib/orpc/router.ts`.
9. Add procedure and consumer regression tests.

## Consumers

- Server Components call `orpc` directly or prefetch `orpcQuery.*.queryOptions()` into the request query client.
- Client Components use TanStack Query with `orpcQuery` and use `orpc` as mutation functions.
- Hydrate prefetched data before a client component calls `useSuspenseQuery`.
- Handle typed oRPC errors explicitly when navigation depends on `UNAUTHORIZED`, `FORBIDDEN`, or `NOT_FOUND`.
- Public participation reads use the public project procedure; internal project reads remain authenticated and organization-scoped.

## OpenAPI

Keep route metadata, schemas, and handler prefixes aligned. Changes to public routes require updating OpenAPI tests and checking the generated specification/Scalar UI.

Further references:

- [Error handling](../../docs/orpc/orpc.error-handling.md)
- [TanStack Query](../../docs/orpc/orpc.tanstack-query.md)
- [OpenAPI handler](../../docs/orpc/orpc.openapi-handler.md)
- [Better Auth integration](../../docs/orpc/orpc.better-auth.md)
