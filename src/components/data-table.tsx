'use client';

import * as React from 'react';
import {
  useTable,
  tableFeatures,
  rowSortingFeature,
  columnFilteringFeature,
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
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

// Feature set is defined once, at module scope, and reused for every
// instance of this table. Row model factories (e.g. paginatedRowModel)
// live as slots on this same object, not as options passed to useTable.
// filterFns must be registered explicitly too — v9 doesn't ship built-in
// filter function names for free, so 'includesString' (the default
// `filterFn: 'auto'` resolves to for string columns) has to be listed here
// or every column filter silently stops working and warns in the console.
const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
});

type FeatureSet = typeof features;

// Exported so files defining columns for this table can type them against
// the exact same feature set, instead of falling back to `any` (which
// silently widens what's allowed for things like `filterFn` string values).
export type DataTableFeatures = FeatureSet;

interface DataTableProps<TData extends RowData, TValue> {
  // ColumnDef's first generic is now the feature set, not TData.
  columns: ColumnDef<FeatureSet, TData, TValue>[];
  data: TData[];
  searchColumnKey?: string;
  searchPlaceholder?: string;
  // Rendered next to the search input — e.g. an "Add" button/dialog that a
  // consuming page wants placed in the table's toolbar rather than elsewhere
  // on the page. Kept generic so DataTable stays data-agnostic.
  toolbarActions?: React.ReactNode;
}

export function DataTable<TData extends RowData, TValue>({
  columns,
  data,
  searchColumnKey,
  searchPlaceholder = 'Filter...',
  toolbarActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useTable({
    features,
    data,
    // TValue is a generic parameter on this component, not a concrete type,
    // so TanStack Table can't infer it structurally from the columns array —
    // it collapses to `unknown` and fights with our TValue. Asserting here
    // sidesteps that inference dead-end (the same trick shadcn/ui uses for
    // the equivalent v8 pattern).
    columns: columns as ColumnDef<FeatureSet, TData, unknown>[],
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  const searchValue = searchColumnKey
    ? ((table.getColumn(searchColumnKey)?.getFilterValue() as string) ?? '')
    : '';

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {searchColumnKey && (
            <div className="relative max-w-sm w-full">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) =>
                  table.getColumn(searchColumnKey)?.setFilterValue(event.target.value)
                }
                className={searchValue ? 'pr-8' : undefined}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => table.getColumn(searchColumnKey)?.setFilterValue('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {toolbarActions}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2" />
            }
          >
            <SlidersHorizontal className="h-4 w-4" />
            View
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Page</p>
            <span className="text-sm font-medium">
              {table.state.pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
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