"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { ApplicationStatus, type JobApplication } from "@/db/schema";
import { LocalDateTime } from "@/components/local-date-time";
import { COLOR_STYLES, STATUS_BY_VALUE, STATUS_OPTIONS } from "@/lib/application-status";
import { AgentSheet } from "@/components/agent-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SortableColumn = {
  getIsSorted: () => false | "asc" | "desc";
  toggleSorting: (desc?: boolean) => void;
  clearSorting: () => void;
};

function SortableHeader({
  title,
  column,
}: {
  title: string;
  column: SortableColumn;
}) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  const handleClick = () => {
    if (sorted === "desc") column.clearSorting();
    else column.toggleSorting(sorted === "asc");
  };

  return (
    <Button variant="ghost" onClick={handleClick}>
      {title}
      <Icon className="ml-2 h-4 w-4" />
    </Button>
  );
}

interface JobApplicationTableProps {
  data: JobApplication[];
  onView?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => Promise<boolean>;
  onBulkStatusChange?: (
    ids: string[],
    status: ApplicationStatus,
  ) => Promise<boolean>;
  toolbarActions?: React.ReactNode;
}

export function JobApplicationTable({
  data,
  onView,
  onDelete,
  onBulkDelete,
  onBulkStatusChange,
  toolbarActions,
}: JobApplicationTableProps) {
  const columns = React.useMemo<
    ColumnDef<DataTableFeatures, JobApplication, any>[]
  >(
    () => [
      {
        id: "select",
        enableGlobalFilter: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      },
      {
        accessorKey: "jobTitle",
        header: ({ column }) => (
          <SortableHeader title="Job Title" column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue("jobTitle")}</span>
        ),
      },
      {
        accessorKey: "company",
        header: ({ column }) => (
          <SortableHeader title="Company" column={column} />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader title="Status" column={column} />
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as ApplicationStatus;
          const option = STATUS_BY_VALUE[status];

          return (
            <Badge
              variant="outline"
              className={`border-0 ${option ? COLOR_STYLES[option.color].badge : COLOR_STYLES.slate.badge}`}
            >
              {option?.label ?? status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "appliedDate",
        enableGlobalFilter: false,
        header: ({ column }) => (
          <SortableHeader title="Applied Date" column={column} />
        ),
        cell: ({ row }) => {
          const dateVal = row.getValue("appliedDate") as Date | string;
          return <LocalDateTime dateTime={dateVal} />;
        },
      },
      {
        accessorKey: "url",
        enableGlobalFilter: false,
        header: "Link",
        cell: ({ row }) => {
          const url = row.getValue("url") as string | null;
          if (!url) return <span className="text-muted-foreground">-</span>;

          return (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
            >
              View Listing
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search job title or company..."
      toolbarActions={toolbarActions}
      toolbarEnd={<AgentSheet />}
      onRowClick={onView}
      getRowId={(application) => application.id}
      bulkActions={
        onBulkDelete || onBulkStatusChange
          ? ({ selectedRows, clearSelection }) => (
              <BulkActions
                selectedRows={selectedRows}
                clearSelection={clearSelection}
                onStatusChange={onBulkStatusChange}
                onDelete={onBulkDelete}
              />
            )
          : undefined
      }
      rowActions={
        onDelete
          ? (application) => (
              <DeleteApplicationButton
                application={application}
                onDelete={onDelete}
              />
            )
          : undefined
      }
    />
  );
}

function DeleteApplicationButton({
  application,
  onDelete,
}: {
  application: JobApplication;
  onDelete: (id: string) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-600 hover:text-rose-600"
            aria-label="Delete application"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this application?</AlertDialogTitle>
          <AlertDialogDescription>
            {application.jobTitle} at {application.company} will be permanently
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(application.id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BulkActions({
  selectedRows,
  clearSelection,
  onStatusChange,
  onDelete,
}: {
  selectedRows: JobApplication[];
  clearSelection: () => void;
  onStatusChange?: (
    ids: string[],
    status: ApplicationStatus,
  ) => Promise<boolean>;
  onDelete?: (ids: string[]) => Promise<boolean>;
}) {
  const [busy, setBusy] = React.useState(false);
  const ids = selectedRows.map((application) => application.id);

  async function run(action: () => Promise<boolean>) {
    setBusy(true);
    const ok = await action();
    setBusy(false);
    if (ok) clearSelection();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {ids.length} selected
      </span>

      {onStatusChange && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="sm" disabled={busy} />}
          >
            Set status
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => run(() => onStatusChange(ids, option.value))}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                className="text-rose-600 hover:text-rose-600"
              />
            }
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {ids.length} application{ids.length === 1 ? "" : "s"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                The selected applications will be permanently deleted. This
                can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => run(() => onDelete(ids))}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
