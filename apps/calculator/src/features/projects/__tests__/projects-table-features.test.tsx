import {
  filterFn_includesString,
  sortFn_text,
  useTable,
} from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { projectsTableFeatures } from "@/features/projects/components/dashboard/projects-table-features";

describe("projectsTableFeatures", () => {
  it("registers the automatic name sort and filter functions", () => {
    let nameFilterFn: unknown;
    let nameSortFn: unknown;
    let filteredNames: string[] = [];
    let sortedNames: string[] = [];

    function TableProbe() {
      const filteredTable = useTable({
        features: projectsTableFeatures,
        data: [{ name: "Zulu" }, { name: "Alpha" }],
        columns: [{ accessorKey: "name" }],
        state: {
          columnFilters: [{ id: "name", value: "alpha" }],
        },
      });
      const unfilteredTable = useTable({
        features: projectsTableFeatures,
        data: [{ name: "Zulu" }, { name: "Alpha" }],
        columns: [{ accessorKey: "name" }],
        state: {
          sorting: [{ id: "name", desc: false }],
        },
      });

      const nameColumn = filteredTable.getColumn("name");
      nameFilterFn = nameColumn?.getFilterFn();
      nameSortFn = unfilteredTable.getColumn("name")?.getSortFn();
      filteredNames = filteredTable
        .getFilteredRowModel()
        .rows.map((row) => row.original.name);
      sortedNames = unfilteredTable
        .getSortedRowModel()
        .rows.map((row) => row.original.name);

      return null;
    }

    renderToStaticMarkup(<TableProbe />);

    expect(nameFilterFn).toBe(filterFn_includesString);
    expect(nameSortFn).toBe(sortFn_text);
    expect(filteredNames).toEqual(["Alpha"]);
    expect(sortedNames).toEqual(["Alpha", "Zulu"]);
  });
});
