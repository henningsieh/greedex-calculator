---
applyTo: 'src/config/projects.ts|src/features/projects/**|src/components/features/projects/dashboard/**'
description: 'Complete Projects Sorting & Table Management: shadcn UI + TanStack React Table v8. Includes centralized sorting configuration, row selection, filtering, pagination, column visibility, and full architecture.'
---

# Projects Sorting & Table Management Guide

Complete reference for shadcn UI + TanStack React Table integration in projects feature. Covers centralized sorting configuration, filtering, row selection, pagination, column visibility, and all implementation patterns with current codebase examples.

---

## Quick Start

### The Shared Hook Pattern

All table state management is centralized in one custom hook:

```typescript
// src/components/features/projects/dashboard/use-projects-table.ts
export function useProjectsTable(projects: ProjectType[]) {
  const [sorting, setSorting] = useState<SortingState>(() =>
    getProjectsDefaultSorting()
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    name: true,
    location: true,
    startDate: true,
    createdAt: true,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const columns = useMemo(() => ProjectTableColumns(t), [t]);

  const table = useReactTable({
    data: projects,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    pagination,
    setPagination,
  };
}
```

### Usage in Components

**Table View:**
```typescript
const {
  table,
  columnFilters,
  setColumnFilters,
  pagination,
  setPagination,
} = useProjectsTable(projects);

return <ProjectsTable
  table={table}
  columnFilters={columnFilters}
  setColumnFilters={setColumnFilters}
  pagination={pagination}
  setPagination={setPagination}
  projects={projects}
/>;
```

**Grid View:**
```typescript
const { table, setSorting, pagination, setPagination } = useProjectsTable(projects);

return <ProjectsGrid
  table={table}
  setSorting={setSorting}
  pagination={pagination}
  setPagination={setPagination}
/>;
```

---

## 1. Sorting (Centralized Configuration)

### Configuration: Single Source of Truth

**File:** `src/config/projects.ts`

```typescript
export const DEFAULT_PROJECT_SORT = {
  column: "name",      // Which field to sort by
  order: "desc",       // Sort direction: "asc" or "desc"
} as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
```

**Why object-based instead of array?**
- Clear property names (`.column`, `.order`) instead of confusing `[0].id` index access
- Self-documenting (obvious what each property means)
- Type-safe validation via `satisfies` operator

### Type Safety Layer

**File:** `src/features/projects/types.ts`

```typescript
// Compile-time validated against actual database schema
type ProjectColumns = keyof typeof projectsTable.$inferSelect;
export type ProjectSortField = ProjectColumns;

export const PROJECT_SORT_FIELDS = [
  "name",
  "location",      // NOT "country" - matches DB schema
  "startDate",
  "createdAt",
  "updatedAt",
] as const satisfies readonly ProjectSortField[];

// Re-export with type validation
export const DEFAULT_PROJECT_SORT = CONFIG_DEFAULT_PROJECT_SORT as const satisfies {
  readonly column: ProjectSortField;
  readonly order: "asc" | "desc";
};
```

**Type safety guarantees:**
- ✅ Adding invalid field to `PROJECT_SORT_FIELDS` → Compile error
- ✅ Using non-existent field in `DEFAULT_PROJECT_SORT` → Compile error
- ✅ Field not in database schema → Compile error

### Conversion Helper for TanStack

**File:** `src/features/projects/utils.ts`

```typescript
export function getProjectsDefaultSorting() {
  return [
    {
      id: DEFAULT_PROJECT_SORT.column,
      desc: DEFAULT_PROJECT_SORT.order === "desc",
    },
  ];
}

export function getColumnDisplayName(
  columnId: ProjectSortField | string,
  t: (key: string) => string,
): string {
  switch (columnId) {
    case "name":
      return t("table.name");
    case "location":
      return t("table.country");  // ← Key stays "country" for backward compat
    case "startDate":
      return t("table.start-date");
    case "createdAt":
      return t("table.created");
    case "updatedAt":
      return t("table.updated");
    default:
      return columnId;
  }
}
```

**Why separate helper?**
- Isolates TanStack's data format from our configuration
- Can change TanStack version or format without affecting config
- Both grid and table use same logic
- Prevents format duplication

### Sorting in useProjectsTable Hook

```typescript
const [sorting, setSorting] = useState<SortingState>(() =>
  getProjectsDefaultSorting()  // ← Initialize with centralized config
);

const table = useReactTable({
  data: projects,
  columns,
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),  // ← Enable client-side sorting
  state: { sorting },
});
```

### Column Definitions with shadcn Table

**File:** `src/components/features/projects/dashboard/projects-table-columns.tsx`

```typescript
export function ProjectTableColumns(
  t: (key: string) => string,
): ColumnDef<ProjectType>[] {
  return [
    // Checkbox column for selection
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // Name column with sorting
    {
      accessorKey: "name",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    // Location column with custom sorting
    {
      accessorKey: "location",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => (
        <ProjectLocation
          project={{ location: row.original.location, country: row.original.country }}
          showFlag={true}
          variant="inline"
        />
      ),
      filterFn: (row, _columnId, filterValue) => {
        return row.original.location === filterValue;
      },
      sortingFn: (rowA, rowB, _columnId) => {
        // Custom sort handling null values
        const locA = rowA.original.location;
        const locB = rowB.original.location;
        if (!locA) return 1;
        if (!locB) return -1;
        return locA.localeCompare(locB);
      },
    },
    // Date columns with custom sorting
    {
      accessorKey: "startDate",
      header: ({ column, table }) => (
        <SortableHeader
          column={column}
          isNumeric
          table={table}
          title={getColumnDisplayName(column.id, t)}
        />
      ),
      cell: ({ row }) => {
        const format = useFormatter();
        return format.dateTime(row.original.startDate, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.original.startDate).getTime();
        const dateB = new Date(rowB.original.startDate).getTime();
        return dateA - dateB;
      },
    },
    // More columns...
  ];
}
```

### SortableHeader Component (shadcn + TanStack)

**File:** `src/components/features/projects/sortable-header.tsx`

```typescript
interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  table: Table<TData>;
  title: string;
  isNumeric?: boolean;
  className?: string;
}

export function SortableHeader<TData, TValue>({
  column,
  table,
  title,
  isNumeric = false,
  className,
}: SortableHeaderProps<TData, TValue>) {
  // Get current sort state for this column
  const sorting = table.getState().sorting;
  const currentSort = sorting.find((sort) => sort.id === column.id);
  let sortState: "asc" | "desc" | false = false;
  if (currentSort) {
    sortState = currentSort.desc ? "desc" : "asc";
  }

  // Compute accessible sort state
  let sortDirection: "ascending" | "descending" | "none";
  if (sortState === "asc") {
    sortDirection = "ascending";
  } else if (sortState === "desc") {
    sortDirection = "descending";
  } else {
    sortDirection = "none";
  }

  return (
    <Button
      aria-label={
        sortDirection === "none" ? title : `${title}, sorted ${sortDirection}`
      }
      aria-sort={sortDirection}
      className={cn(
        "group -ml-4 h-8",
        sortState && "font-medium text-foreground",
        className,
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      variant="secondaryghost"
    >
      {title}
      {sortState === "asc" ? (
        isNumeric ? (
          <ArrowUp01Icon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
        ) : (
          <ArrowUpAZIcon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
        )
      ) : sortState === "desc" ? (
        isNumeric ? (
          <ArrowDown10Icon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
        ) : (
          <ArrowDownZAIcon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
        )
      ) : (
        <ArrowUpDown className="ml-2 size-5 opacity-50" />
      )}
    </Button>
  );
}
```

### Server-Side Prefetch with Sorting

**Files:** `src/app/[locale]/(app)/org/projects/page.tsx`, `src/app/[locale]/(app)/org/dashboard/page.tsx`

```typescript
import { DEFAULT_PROJECT_SORT } from "@/config/projects";

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  // Prefetch with same config as client
  await queryClient.prefetchQuery(
    orpcQuery.projects.list.queryOptions({
      input: {
        sort_by: DEFAULT_PROJECT_SORT.column,
      },
    }),
  );

  return <ProjectsTab />;
}
```

### Backend RPC Procedure with Sorting

**File:** `src/features/projects/procedures.ts`

```typescript
import { DEFAULT_PROJECT_SORT } from "@/config/projects";

export const listProjects = authorized
  .use(requireProjectPermissions(["read"]))
  .input(
    z.object({
      sort_by: z.enum(PROJECT_SORT_FIELDS).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const sortField = input?.sort_by ?? DEFAULT_PROJECT_SORT.column;

    let sortDesc: boolean;
    if (input?.sort_by === undefined) {
      // No sort specified → use default order
      sortDesc = DEFAULT_PROJECT_SORT.order === "desc";
    } else if (input.sort_by === DEFAULT_PROJECT_SORT.column) {
      // User chose default column → use default direction
      sortDesc = DEFAULT_PROJECT_SORT.order === "desc";
    } else {
      // User chose different column → default to ascending
      sortDesc = false;
    }

    const orderByClause = sortDesc
      ? desc(projectsTable[sortField])
      : asc(projectsTable[sortField]);

    return db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.organizationId, context.org.id))
      .orderBy(orderByClause);
  });
```

---

## 2. Row Selection

### Selection State in Hook

```typescript
const [rowSelection, setRowSelection] = useState({});

const table = useReactTable({
  data: projects,
  columns,
  onRowSelectionChange: setRowSelection,
  state: { rowSelection },
});
```

### Selection State Shape

```typescript
{
  "0": true,    // Row at index 0 is selected
  "1": false,   // Row at index 1 is not selected
  "2": true,    // Row at index 2 is selected
}
```

### Select-All Checkbox Column (shadcn Checkbox)

```typescript
{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      onClick={(e) => e.stopPropagation()}
    />
  ),
  enableSorting: false,
  enableHiding: false,
}
```

### Batch Actions

```typescript
const selectedRows = table.getFilteredSelectedRowModel().rows;
const selectedProjectIds = selectedRows.map(row => row.original.id);

const { mutate: batchDelete } = useMutation({
  mutationFn: () =>
    orpc.projects.batchDelete({ projectIds: selectedProjectIds }),
  onSuccess: () => {
    table.resetRowSelection();  // ← Clear selection after action
  },
});
```

---

## 3. Filtering

### Column Filters State

```typescript
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

const table = useReactTable({
  data: projects,
  columns,
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: { columnFilters },
});
```

### Name Filter (shadcn Input)

```typescript
<Input
  value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
  onChange={(event) =>
    table.getColumn("name")?.setFilterValue(event.target.value)
  }
  placeholder="Search by name..."
/>
```

### Location Filter (shadcn Select)

```typescript
<Select
  value={
    (columnFilters.find((f) => f.id === "location")?.value as string) || ""
  }
  onValueChange={(value) =>
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== "location");
      if (value && value !== "all") {
        filtered.push({ id: "location", value });
      }
      return filtered;
    })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Filter by country" />
  </SelectTrigger>
  <SelectContent>
    {uniqueCountries.map((code) => (
      <SelectItem key={code} value={code}>
        {getCountryData(code, locale)?.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Active Filters Display (shadcn Badge + Button)

```typescript
{columnFilters.length > 0 && (
  <div className="flex flex-wrap items-center gap-2">
    <Button
      className="size-7"
      onClick={() => setColumnFilters([])}
      variant="destructive"
    >
      <FunnelXIcon />
    </Button>
    {columnFilters.map((filter) => (
      <Badge key={filter.id} variant="secondaryoutline">
        {filter.id}: {filter.value}
      </Badge>
    ))}
  </div>
)}
```

---

## 4. Pagination

### Pagination State in Hook

```typescript
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: DEFAULT_PAGE_SIZE,
});

const table = useReactTable({
  data: projects,
  columns,
  getPaginationRowModel: getPaginationRowModel(),
  onPaginationChange: setPagination,
  state: { pagination },
});
```

### Page Size Selector (shadcn Select)

```typescript
<Select
  value={pagination.pageSize.toString()}
  onValueChange={(value) =>
    setPagination({ pageIndex: 0, pageSize: Number(value) })
  }
>
  <SelectTrigger className="h-8 w-[72px]">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {[10, 20, 30, 40, 50].map((size) => (
      <SelectItem key={size} value={size.toString()}>
        {size}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Pagination Controls (shadcn Pagination)

```typescript
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      />
    </PaginationItem>
    {Array.from(
      {
        length: Math.ceil(
          table.getFilteredRowModel().rows.length / pagination.pageSize
        ),
      },
      (_, i) => (
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === pagination.pageIndex}
            onClick={() => table.setPageIndex(i)}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      )
    )}
    <PaginationItem>
      <PaginationNext
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Row Count Display (shadcn Badge)

```typescript
<Badge variant="outline">
  <span className="font-medium">
    {table.getFilteredRowModel().rows.length}
  </span>
  <span className="text-muted-foreground">
    / {projects.length}
  </span>
</Badge>
```

---

## 5. Column Visibility

### Column Visibility State

```typescript
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
  name: true,
  location: true,
  startDate: true,
  createdAt: true,
  updatedAt: false,  // Hidden by default
});

const table = useReactTable({
  data: projects,
  columns,
  onColumnVisibilityChange: setColumnVisibility,
  state: { columnVisibility },
});
```

### Column Visibility Checkbox List

```typescript
{columns.map((column) => (
  <label key={column.id}>
    <input
      type="checkbox"
      checked={column.getIsVisible()}
      onChange={(e) => column.toggleVisibility(e.target.checked)}
    />
    {getColumnDisplayName(column.id, t)}
  </label>
))}
```

---

## File Structure

```
src/
  config/
    projects.ts                    ← DEFAULT_PROJECT_SORT
  features/projects/
    types.ts                       ← ProjectSortField, PROJECT_SORT_FIELDS
    utils.ts                       ← getProjectsDefaultSorting(), getColumnDisplayName()
    procedures.ts                  ← Backend RPC with sorting
  components/ui/
    button.tsx                     ← shadcn Button
    input.tsx                      ← shadcn Input
    select.tsx                     ← shadcn Select
    checkbox.tsx                   ← shadcn Checkbox
    badge.tsx                      ← shadcn Badge
    pagination.tsx                 ← shadcn Pagination
    table.tsx                      ← shadcn Table
  components/features/projects/
    sortable-header.tsx            ← SortableHeader with sort icons
    dashboard/
      use-projects-table.ts        ← Shared hook with all state management
      projects-grid.tsx            ← Grid view
      projects-table.tsx           ← Table view with shadcn components
      projects-table-columns.tsx   ← Column definitions
      projects-tab.tsx             ← Tab wrapper
      archived-projects-tab.tsx    ← Archived tab
  app/[locale]/(app)/org/
    projects/
      page.tsx                     ← Server prefetch
    dashboard/
      page.tsx                     ← Server prefetch
```

---

## Common Tasks

### Change Default Sort Column

```typescript
// src/config/projects.ts
export const DEFAULT_PROJECT_SORT = {
  column: "startDate",  // ← Change from "name"
  order: "desc",
} as const satisfies { ... };
```

### Change Default Sort Direction

```typescript
// src/config/projects.ts
export const DEFAULT_PROJECT_SORT = {
  column: "name",
  order: "asc",  // ← Change from "desc"
} as const satisfies { ... };
```

### Add New Sortable Field

1. Add to `PROJECT_SORT_FIELDS` in `src/features/projects/types.ts`
2. Add sort case in `src/features/projects/procedures.ts`
3. Add column definition in `src/components/features/projects/dashboard/projects-table-columns.tsx`

### Initialize Component with Default Sort

```typescript
const [sortBy, setSortBy] = useState<ProjectSortField>(
  DEFAULT_PROJECT_SORT.column
);
```

### Reset Row Selection

```typescript
table.resetRowSelection();
```

### Get Selected Project IDs

```typescript
const selectedRows = table.getFilteredSelectedRowModel().rows;
const selectedIds = selectedRows.map(row => row.original.id);
```

---

## Troubleshooting

### Sort Not Working

**Check:**
1. Is `getSortedRowModel()` provided to `useReactTable`?
2. Is `onSortingChange` hooked up?
3. For custom sorts: is `sortingFn` correct?

### Row Selection Not Working

**Check:**
1. Is `onRowSelectionChange` hooked up?
2. Is `rowSelection` in the `state`?
3. Is `enableRowSelection` true (default)?

### Filters Not Working

**Check:**
1. Is `getFilteredRowModel()` provided?
2. Is `onColumnFiltersChange` hooked up?
3. Does the column have custom `filterFn`?

### Pagination Not Working

**Check:**
1. Is `getPaginationRowModel()` provided?
2. Is `onPaginationChange` hooked up?
3. Is `pagination` in the `state`?

---

## Why This Architecture

### Centralized Sorting
- **Problem:** Grid, table, and backend had different defaults
- **Solution:** Single `DEFAULT_PROJECT_SORT` in `src/config/projects.ts`
- **Result:** Change once, everywhere updates

### Type Safety
- **Problem:** Could add invalid sort fields without detection
- **Solution:** `ProjectSortField` validated against DB schema
- **Result:** Compile errors for invalid fields

### Shared Hook
- **Problem:** Grid and table had duplicate state logic
- **Solution:** Single `useProjectsTable` hook
- **Result:** Consistent behavior, less code

### shadcn Components
- **Benefit:** Pre-built, accessible UI components
- **Usage:** Button, Input, Select, Checkbox, Badge, Pagination, Table
- **Integration:** Works seamlessly with TanStack Table

---

## Related Documentation

- 🔐 [Permission Patterns](./permissions.md)
- 📚 [Projects Feature Overview](./README.md)

---

**Last Updated:** January 5, 2026  
**Version:** 2.0 (Consolidated - Sorting + shadcn + TanStack)
