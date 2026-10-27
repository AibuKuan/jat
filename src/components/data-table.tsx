"use client";

import * as React from "react";
import {
  useTable,
  tableFeatures,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createFilteredRowModel,
  filterFn_includesString,
  flexRender,
  ColumnDef,
  RowData,
  SortingState,
  ColumnVisibilityState,
  ColumnFiltersState,
  RowSelectionState,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_basic,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    basic: sortFn_basic,
  },
});

const INTERACTIVE_SELECTOR =
  "button, a, input, label, select, textarea, [role='checkbox'], [role='switch'], [role='menuitem'], [data-row-click-ignore]";

type FeatureSet = typeof features;

export type DataTableFeatures = FeatureSet;

interface DataTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<FeatureSet, TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  toolbarActions?: React.ReactNode;
  toolbarEnd?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  rowActions?: (row: TData) => React.ReactNode;
}

export function DataTable<TData extends RowData, TValue>({
  columns,
  data,
  searchPlaceholder = "Filter...",
  toolbarActions,
  toolbarEnd,
  onRowClick,
  rowActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  function handleRowClick(
    e: React.MouseEvent<HTMLTableRowElement>,
    row: TData,
  ) {
    if (!onRowClick) return;
    const target = e.target as HTMLElement;
    if (!e.currentTarget.contains(target)) return;
    if (target.closest(INTERACTIVE_SELECTOR)) return;
    if (window.getSelection()?.toString()) return;
    onRowClick(row);
  }

  function handleRowKeyDown(
    e: React.KeyboardEvent<HTMLTableRowElement>,
    row: TData,
  ) {
    if (!onRowClick || e.target !== e.currentTarget) return;
    if (e.key === "Enter") onRowClick(row);
  }

  // TanStack Table doesn't sort the data, so we do it here.
  const sortedData = React.useMemo(() => {
    if (!sorting.length) return data;
    const { id, desc } = sorting[0];
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[id];
      const bv = (b as Record<string, unknown>)[id];
      if (av == null) return 1;
      if (bv == null) return -1;
      const result = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return desc ? -result : result;
    });
  }, [data, sorting]);

  const table = useTable({
    features,
    data: sortedData, // TanStack wont sort the column for some reason.
    columns: columns as ColumnDef<FeatureSet, TData, unknown>[],
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-sm w-full">
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className={globalFilter ? "pr-8" : undefined}
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {toolbarActions}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {toolbarEnd}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                />
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
              View
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
                {rowActions && <TableHead className="w-0 p-0" />}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("group", onRowClick && "cursor-pointer")}
                  data-state={row.getIsSelected() && "selected"}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={(e) => handleRowClick(e, row.original)}
                  onKeyDown={(e) => handleRowKeyDown(e, row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell className="sticky right-0 z-10 w-0 p-0">
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-muted opacity-0 shadow-sm transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-visible:pointer-events-auto group-focus-visible:opacity-100 group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:opacity-100">
                        {rowActions(row.original)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Page</p>
            <span className="text-sm font-medium">
              {table.state.pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
