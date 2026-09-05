# Projects Feature Documentation

Use these documents when changing project-list sorting or authorization.

## Sorting

- [Sorting quick reference](./SORTING-QUICKREF.md) — current sort configuration, client and server consumers, and TanStack Table V9 setup.
- [Sorting architecture](./sorting-centralization-refactoring.md) — ownership boundaries and the checklist for adding a sortable project field.

### Current implementation

| Concern | Source of truth |
| --- | --- |
| Sort fields and default | [`apps/calculator/src/features/projects/types.ts`](../../apps/calculator/src/features/projects/types.ts) |
| Shared sort helpers and database ordering | [`apps/calculator/src/features/projects/utils.ts`](../../apps/calculator/src/features/projects/utils.ts) |
| Client grid | [`apps/calculator/src/features/projects/components/dashboard/projects-grid.tsx`](../../apps/calculator/src/features/projects/components/dashboard/projects-grid.tsx) |
| TanStack Table V9 feature registry | [`apps/calculator/src/features/projects/components/dashboard/projects-table-features.ts`](../../apps/calculator/src/features/projects/components/dashboard/projects-table-features.ts) |
| TanStack Table V9 columns | [`apps/calculator/src/features/projects/components/dashboard/projects-table-columns.tsx`](../../apps/calculator/src/features/projects/components/dashboard/projects-table-columns.tsx) |
| TanStack Table V9 instance and controls | [`apps/calculator/src/features/projects/components/dashboard/projects-table.tsx`](../../apps/calculator/src/features/projects/components/dashboard/projects-table.tsx) |
| List procedure | [`apps/calculator/src/features/projects/procedures.ts`](../../apps/calculator/src/features/projects/procedures.ts) |

## Permissions

- [Permissions model](./permissions.md) — Better Auth organization roles and project access control.

## External references

- [TanStack Table React V9 migration guide](https://tanstack.com/table/v9/docs/framework/react/guide/migrating.md)
- [Greendex oRPC rules](../../.github/instructions/orpc.instructions.md) and [official oRPC v1 documentation](https://v1.orpc.dev/llms.txt)
- [UI component rules](../../.github/instructions/shadcn.instructions.md)
- [Internationalization documentation](../i18n/)
