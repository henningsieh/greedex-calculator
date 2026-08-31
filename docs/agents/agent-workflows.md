# Agent Task Routes

This opt-in router complements the always-loaded rules in `AGENTS.md`. Use it when a task crosses areas or its starting point is unclear.

## Choose the task route

| Task | Required instruction | Read next | Primary implementation |
| --- | --- | --- | --- |
| Place or split a module | [Architecture](../../.github/instructions/architecture.instructions.md) | [Developer documentation index](../README.md) | `apps/*/src/`, `packages/*/src/` |
| Add or change an oRPC procedure | [oRPC](../../.github/instructions/orpc.instructions.md) | [oRPC v1 index](https://v1.orpc.dev/llms.txt) | Owning feature `procedures.ts`, then `lib/orpc/router.ts` |
| Change Query caching, mutations, prefetching, or hydration | [TanStack Query](../../.github/instructions/tanstack-react-query.instructions.md) | [TanStack Query v5 index](https://tanstack.com/query/v5/llms.txt) | Query client/hydration utilities and owning consumer |
| Change SSR data fetching | [Architecture](../../.github/instructions/architecture.instructions.md), [oRPC](../../.github/instructions/orpc.instructions.md), and [TanStack Query](../../.github/instructions/tanstack-react-query.instructions.md) | [oRPC optimized SSR](https://v1.orpc.dev/docs/best-practices/optimize-ssr.md), [Query advanced SSR](https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr.md), and matching `.next-docs` pages | Server page/layout, hydration utilities, oRPC client seam |
| Change authentication or organizations | [Better Auth](../../.github/instructions/better-auth.instructions.md) | [Better Auth docs](../better-auth/) and [permissions](../projects/permissions.md) | Calculator Better Auth library and owning feature |
| Change database schema | [Repository conventions](../../.github/instructions/conventions.instructions.md) | [Database docs](../database/) | `packages/database/src/schemas/` and generated migration |
| Add or update a UI component/form | [UI components](../../.github/instructions/shadcn.instructions.md) | [shadcn docs](../shadcn/) | Shared or feature component directory |
| Add translations or locale behavior | [Internationalization](../../.github/instructions/i18n.instructions.md) | [i18n docs](../i18n/) | `packages/i18n/src/locales/` and calculator routing |
| Change email templates or delivery | [Architecture](../../.github/instructions/architecture.instructions.md) | [React Email docs](../react-email/) | `packages/email/`; calculator transport wiring stays app-specific |
| Change dependencies or Turbo tasks | [Workspace and Turborepo](../../.github/instructions/turborepo-package-management.instructions.md) | Inspect manifests, `pnpm-workspace.yaml`, and `turbo.json` | Owning workspace plus lockfile |
| Fix or extend questionnaire calculations | [Code standards](../../.github/instructions/code-standards.instructions.md) | [Participation docs](../participate/) | `apps/calculator/src/features/participate/` |
| Add tests | [Code standards](../../.github/instructions/code-standards.instructions.md) | [Participation testing](../participate/testing.md) or relevant feature docs | Unit/integration or E2E test directory |

## Cross-cutting sequence

1. Read `AGENTS.md` and every instruction named by the matching rows.
2. Read the topic documentation linked from those instructions.
3. Inspect the listed source-of-truth files before proposing a change.
4. Implement the smallest coherent change at the owning layer.
5. Add regression coverage at the lowest level that reproduces the behavior.
6. Run formatting, linting, type checking, and affected tests allowed by `AGENTS.md`.
7. Review the final diff for unrelated files, generated output, and leaked configuration.

## Next.js work

For any Next.js task, start at the [local Next.js documentation index](../../.next-docs/index.mdx), then follow the relevant branch to the smallest page set needed before editing. Apply the matching project architecture and integration instructions alongside it.

## Infrastructure work

Deployment and database operations follow the Coolify rules in `AGENTS.md`. Persistent changes belong in Coolify-managed configuration; generated compose files on the host are not source files.
