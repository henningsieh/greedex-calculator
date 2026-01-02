"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, FunnelXIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { MEMBER_ROLES } from "@/components/features/organizations/types";
import { ProjectTableColumns } from "@/components/features/projects/dashboard/projects-table-columns";
import type { ProjectType } from "@/components/features/projects/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCountryData } from "@/lib/i18n/countries";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

export function ProjectsTable({ projects }: { projects: ProjectType[] }) {
  const t = useTranslations("organization.projects");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // Fetch active organization
  const { data: memberRole } = useSuspenseQuery(
    orpcQuery.organizations.getRole.queryOptions(),
  );

  console.debug("Member role:", memberRole);

  // Get unique countries from projects
  const uniqueCountries = useMemo(
    () => [...new Set(projects.map((p) => p.country))],
    [projects],
  );

  // Get columns with translations
  const projectTableColumns = useMemo(() => ProjectTableColumns(t), [t]);

  // Map the default sort to TanStack format
  const defaultSorting = [
    {
      id: "startDate",
      desc: false,
    },
  ];

  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    name: true,
    country: true,
    startDate: true,
    createdAt: true,
    updatedAt: false,
    endDate: false,
  });
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: projects,
    columns: projectTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedProjectIds = selectedRows.map((row) => row.original.id);
  const selectedProjectNames = selectedRows.map((row) => row.original.name);

  const { mutate: batchDeleteMutation, isPending: isBatchDeleting } =
    useMutation({
      mutationFn: () =>
        orpc.projects.batchDelete({
          projectIds: selectedProjectIds,
        }),
      onSuccess: (result) => {
        if (result.success) {
          toast.success(
            t("form.batch-delete.toast-success", {
              count: result.deletedCount,
            }),
          );
          queryClient.invalidateQueries({
            queryKey: orpcQuery.projects.list.queryKey(),
          });
          table.resetRowSelection();
        } else {
          toast.error(t("form.batch-delete.toast-error"));
        }
      },
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || t("form.batch-delete.toast-error-generic"));
      },
    });

  const handleBatchDelete = async () => {
    const confirmed = await confirm({
      title: t("form.batch-delete.confirm-title"),
      description: t("form.batch-delete.confirm-description", {
        count: selectedProjectIds.length,
        names: selectedProjectNames.join(", "),
      }),
      confirmText: t("form.batch-delete.confirm-button"),
      cancelText: t("form.batch-delete.cancel-button"),
      isDestructive: true,
    });

    if (confirmed) {
      batchDeleteMutation();
    }
  };

  return (
    <>
      <div className="min-w-0">
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              className="h-8 w-full border-secondary focus-visible:border-secondary focus-visible:ring-[3px] focus-visible:ring-secondary sm:w-[250px] lg:w-[300px]"
              id="project-name-filter"
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              placeholder={t("table.search-by-name")}
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
            />
            <div className="flex items-center">
              <Select
                key={`country-filter-${columnFilters.find((f) => f.id === "country")?.value || "none"}`}
                onValueChange={(value) =>
                  setColumnFilters((prev) => {
                    const filtered = prev.filter((f) => f.id !== "country");
                    if (value) {
                      filtered.push({ id: "country", value });
                    }
                    return filtered;
                  })
                }
                value={
                  columnFilters.find((f) => f.id === "country")?.value as string
                }
              >
                <SelectTrigger
                  className="w-[180px] focus-visible:border-secondary focus-visible:ring-[3px] focus-visible:ring-secondary"
                  size="sm"
                >
                  <SelectValue placeholder={t("filter-by-country")} />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCountries.map((code) => {
                    const data = getCountryData(code, locale);
                    if (!data) {
                      return null;
                    }
                    return (
                      <SelectItem
                        className="focus:bg-secondary focus:text-secondary-foreground"
                        key={code}
                        value={code}
                      >
                        {data.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {memberRole === MEMBER_ROLES.Owner && selectedRows.length > 0 && (
              <Button
                disabled={isBatchDeleting}
                onClick={handleBatchDelete}
                size="sm"
                variant="destructive"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                {t("table.batch-delete", {
                  count: selectedRows.length,
                })}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="ml-auto flex h-8 w-32 items-center justify-end"
                  size="sm"
                  variant="secondaryoutline"
                >
                  {t("table.columns")} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-secondary">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        checked={column.getIsVisible()}
                        className="capitalize focus:bg-secondary/80 focus:text-secondary-foreground"
                        key={column.id}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {columnFilters.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Button
              className="h-8 px-2 lg:px-3"
              disabled={columnFilters.length === 0}
              onClick={() => setColumnFilters([])}
              size="sm"
              variant="destructive"
            >
              <FunnelXIcon />
            </Button>
            <span className="text-muted-foreground text-sm">
              {t("table.active-filters")}:
            </span>
            {columnFilters.map((filter) => {
              if (filter.id === "country") {
                const data = getCountryData(filter.value as string, locale);
                return (
                  <Badge
                    className="text-xs"
                    key={filter.id}
                    variant="secondary"
                  >
                    {data?.name || (filter.value as string)}
                  </Badge>
                );
              }
              if (filter.id === "name") {
                return (
                  <Badge
                    className="text-xs"
                    key={filter.id}
                    variant="secondary"
                  >
                    {t("table.name")}: {filter.value as string}
                  </Badge>
                );
              }
              return (
                <Badge className="text-xs" key={filter.id} variant="secondary">
                  {filter.id}: {filter.value as string}
                </Badge>
              );
            })}
          </div>
        )}
        <div className="max-w-full overflow-x-auto rounded-md border">
          <Table className="mb-4 w-full sm:mb-0">
            <TableHeader className="border-b bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className="border-b transition-colors"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:px-2"
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="transition-colors hover:bg-accent/40"
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="pl-3" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={projectTableColumns.length}
                  >
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} {t("row-s-selected")}
          </div>
          <div className="space-x-2">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="outline"
            >
              {t("table.previous")}
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="sm"
              variant="outline"
            >
              {t("table.next")}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmDialogComponent />
    </>
  );
}
