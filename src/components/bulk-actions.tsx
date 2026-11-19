import { ApplicationStatus, JobApplication } from "@/db/schema/job-application-schema";
import { STATUS_OPTIONS } from "@/lib/application-status";
import { ChevronDown, Trash2 } from "lucide-react";
import React from "react";
import { AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialog, AlertDialogTrigger } from "./ui/alert-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function BulkActions({
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