# Projects Feature Documentation

Technical documentation for the projects feature, including sorting configuration and permission patterns.

## Documents

### 1. [table-management.md](./table-management.md) ⭐ **START HERE**

**Complete TanStack React Table Management Guide** — Everything about the `useProjectsTable` hook and all table features.

**Covers:**
- Shared hook pattern for grid and table views
- **Sorting** with centralized configuration
- **Row selection** with batch actions
- **Filtering** by name and location
- **Pagination** with page size control
- **Column visibility** toggling
- Type safety, troubleshooting, performance

**Quick Reference:** Sorting, selection, filtering, pagination patterns with copy-paste examples.

**When to read:** Working with tables, implementing table features, understanding the complete architecture.

---

### 2. [permissions.md](./permissions.md)

**Better Auth Permissions Model** — Abstract permission system for project resources.

**Covers:**
- Role-based access control (owner/admin/member)
- Permission matrix for project actions
- Server-side enforcement patterns
- Client-side permission utilities

**When to read:** Implementing authorization features, understanding access control.

---

## Project Sorting Implementation

### Core Configuration

File: [src/config/projects.ts](../../src/config/projects.ts)

```typescript
export const DEFAULT_PROJECT_SORT = {
  column: "name",      // Default sort field (type-safe)
  order: "desc",       // Sort direction: "asc" | "desc"
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
```

### Type Definitions

File: [src/features/projects/types.ts](../../src/features/projects/types.ts)

- `ProjectSortField` — Type-safe sort field names (validated against DB schema)
- `PROJECT_SORT_FIELDS` — Array of available sort fields
- `DEFAULT_PROJECT_SORT` — Re-exported configuration with type validation

### Helper Functions

File: [src/features/projects/utils.ts](../../src/features/projects/utils.ts)

- `getProjectsDefaultSorting()` — Convert config to TanStack SortingState format
- `getColumnDisplayName()` — Get translated column display names

---

## Consumers

### Grid View

File: [src/components/features/projects/dashboard/projects-grid.tsx](../../src/components/features/projects/dashboard/projects-grid.tsx)

- In-memory sorting using `DEFAULT_PROJECT_SORT.column` and `.order`
- Type-safe field access via `keyof ProjectType`
- Handles null values, dates, and string comparisons

### Table View (TanStack React Table)

File: [src/components/features/projects/dashboard/projects-table.tsx](../../src/components/features/projects/dashboard/projects-table.tsx)

- Initializes sorting with `getProjectsDefaultSorting()` helper
- Uses column definitions from [projects-table-columns.tsx](../../src/components/features/projects/dashboard/projects-table-columns.tsx)

### Backend Procedures (oRPC)

File: [src/features/projects/procedures.ts](../../src/features/projects/procedures.ts)

- `listProjects()` procedure uses `DEFAULT_PROJECT_SORT.column` for fallback
- Implements sort direction logic
- Database queries properly ordered

### Server-Side Prefetch (SSR)

Files:
- [src/app/[locale]/(app)/org/projects/page.tsx](../../src/app/[locale]/(app)/org/projects/page.tsx)
- [src/app/[locale]/(app)/org/dashboard/page.tsx](../../src/app/[locale]/(app)/org/dashboard/page.tsx)

- Prefetch data with `sort_by: DEFAULT_PROJECT_SORT.column`
- Ensures consistency between server and client
- Prevents hydration mismatches

---

## Type Safety Pattern

### The `as const satisfies` Pattern

```typescript
export const DEFAULT_PROJECT_SORT = {
  column: "name",
  order: "desc",
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
```

**Guarantees:**
- `as const` creates literal types ("name" not string)
- `satisfies` validates field is valid `ProjectSortField`
- Compile-time validation prevents invalid configurations

### Field Validation

Sort fields validated against database schema:

```typescript
type ProjectColumns = keyof typeof projectsTable.$inferSelect;
export type ProjectSortField = ProjectColumns;

export const PROJECT_SORT_FIELDS = [
  "name",
  "location",
  "startDate",
  "createdAt",
  "updatedAt",
] as const satisfies readonly ProjectSortField[];
```

---

## Common Tasks

### Update Default Sort Field

Edit [src/config/projects.ts](../../src/config/projects.ts):

```typescript
export const DEFAULT_PROJECT_SORT = {
  column: "startDate",  // Change to desired field
  order: "desc",
} as const satisfies { ... };
```

All consumers automatically use new default.

### Add New Sortable Field

1. Update database schema in [src/lib/drizzle/schema.ts](../../src/lib/drizzle/schema.ts)
2. Add field to [src/features/projects/types.ts](../../src/features/projects/types.ts):
   ```typescript
   export const PROJECT_SORT_FIELDS = [
     "name",
     "newField",  // Add here
   ] as const satisfies readonly ProjectSortField[];
   ```
3. Add sort case in [src/features/projects/procedures.ts](../../src/features/projects/procedures.ts)
4. Add column definition in [src/components/features/projects/dashboard/projects-table-columns.tsx](../../src/components/features/projects/dashboard/projects-table-columns.tsx)

### Troubleshooting

**Import Error: "Cannot find module"**

→ Use correct import: `import { DEFAULT_PROJECT_SORT } from "@/config/projects"`

**Type Error: "not assignable to ProjectSortField"**

→ Field doesn't exist in database. Add to schema first, then to PROJECT_SORT_FIELDS.

**Sort not working in backend**

→ Check [src/features/projects/procedures.ts](../../src/features/projects/procedures.ts) listProjects handler has case for the sort field.

---

## Related Documentation

- **oRPC procedures:** [docs/orpc/](../orpc/)
- **TanStack React Table:** [docs/tanstack-react-query/](../tanstack-react-query/)
- **UI components:** [docs/shadcn/](../shadcn/)
- **Internationalization:** [docs/i18n/](../i18n/)
