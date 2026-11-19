import { JobApplication } from "@/db/schema/job-application-schema";
import { buttonVariants } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { DeleteApplicationButton } from "./delete-application-button";
import { cn } from "@/lib/utils";

export function TableRowActions({
  application,
  onDelete,
}: {
  application: JobApplication;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {application.url && (
        <a
          href={application.url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "size-7",
          )}
          aria-label="Open job listing"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {onDelete && (
        <DeleteApplicationButton
          application={application}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
