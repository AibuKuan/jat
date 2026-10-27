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
  ExternalLink,
  Eye,
  Trash2,
} from "lucide-react";
import { ApplicationStatus, type JobApplication } from "@/db/schema";
import { LocalDateTime } from "@/components/local-date-time";
import { COLOR_STYLES, STATUS_BY_VALUE } from "@/lib/application-status";
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
  toolbarActions?: React.ReactNode;
}

export function JobApplicationTable({
  data,
  onView,
  onDelete,
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
