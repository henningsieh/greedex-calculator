import {
  filterFn_includesString,
  sortFn_text,
  useTable,
} from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usersTableFeatures } from "@/features/organizations/components/users-table-features";

describe("usersTableFeatures", () => {
  it("registers the automatic person sort and filter functions", () => {
    let memberFilterFn: unknown;
    let memberSortFn: unknown;
    let filteredMembers: string[] = [];
    let sortedMembers: string[] = [];

    function TableProbe() {
      const filteredTable = useTable({
        features: usersTableFeatures,
        data: [{ member: "Zulu" }, { member: "Alpha" }],
        columns: [{ accessorKey: "member" }],
        state: {
          columnFilters: [{ id: "member", value: "alpha" }],
        },
      });
      const unfilteredTable = useTable({
        features: usersTableFeatures,
        data: [{ member: "Zulu" }, { member: "Alpha" }],
        columns: [{ accessorKey: "member" }],
        state: {
          sorting: [{ id: "member", desc: false }],
        },
      });

      const memberColumn = filteredTable.getColumn("member");
      memberFilterFn = memberColumn?.getFilterFn();
      memberSortFn = unfilteredTable.getColumn("member")?.getSortFn();
      filteredMembers = filteredTable
        .getFilteredRowModel()
        .rows.map((row) => row.original.member);
      sortedMembers = unfilteredTable
        .getSortedRowModel()
        .rows.map((row) => row.original.member);

      return null;
    }

    renderToStaticMarkup(<TableProbe />);

    expect(memberFilterFn).toBe(filterFn_includesString);
    expect(memberSortFn).toBe(sortFn_text);
    expect(filteredMembers).toEqual(["Alpha"]);
    expect(sortedMembers).toEqual(["Alpha", "Zulu"]);
  });
});
