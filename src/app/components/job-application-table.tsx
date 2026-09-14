'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, type DataTableFeatures } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ExternalLink, MoreHorizontal } from 'lucide-react';
import { ApplicationStatus, type JobApplication } from '@/db/schema';

const statusVariants: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  [ApplicationStatus.APPLIED]: {
    label: 'Applied',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  [ApplicationStatus.INTERVIEWING]: {
    label: 'Interviewing',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
  [ApplicationStatus.OFFERED]: {
    label: 'Offered',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
};

interface JobApplicationTableProps {
  data: JobApplication[];
  onEdit?: (application: JobApplication) => void;
  onDelete?: (id: string) => void;
  toolbarActions?: React.ReactNode;
}

export function JobApplicationTable({
  data,
  onEdit,
  onDelete,
  toolbarActions,
}: JobApplicationTableProps) {
  // Column defs are typed against the same feature set DataTable uses
  // internally, rather than `any` — matching FeatureSet keeps things like
  // filterFn's allowed values (and everything else feature-dependent)
  // consistent with what DataTable actually supports.
  const columns = React.useMemo<ColumnDef<DataTableFeatures, JobApplication, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
        accessorKey: 'jobTitle',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Job Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue('jobTitle')}</span>
        ),
      },
      {
        accessorKey: 'company',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as ApplicationStatus;
          const config = statusVariants[status] ?? {
            label: status,
            className: 'bg-gray-100 text-gray-800',
          };

          return (
            <Badge variant="outline" className={`border-0 ${config.className}`}>
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'appliedDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Applied Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const dateVal = row.getValue('appliedDate') as Date | string;
          const date = new Date(dateVal);
          return <span>{date.toLocaleDateString()}</span>;
        },
      },
      {
        accessorKey: 'url',
        header: 'Link',
        cell: ({ row }) => {
          const url = row.getValue('url') as string | null;
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
      {
        id: 'actions',
        cell: ({ row }) => {
          const application = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" className="h-8 w-8 p-0" />}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(application.id)}
                  >
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(application)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-rose-600 focus:text-rose-600"
                      onClick={() => onDelete(application.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumnKey="jobTitle"
      searchPlaceholder="Filter job titles..."
      toolbarActions={toolbarActions}
    />
  );
}