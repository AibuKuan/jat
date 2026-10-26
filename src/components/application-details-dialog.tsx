"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { JobApplication } from "@/db/schema";
import { STATUS_OPTIONS } from "@/lib/application-status";
import { ApplicationStats } from "./application-stats";

const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function DetailsForm({
  application,
  onSave,
}: {
  application: JobApplication;
  onSave: (application: JobApplication) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState(application);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <label className={labelClass}>Job Title</label>
        <Input
          required
          value={draft.jobTitle}
          onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Company</label>
        <Input
          required
          value={draft.company}
          onChange={(e) => setDraft({ ...draft, company: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Posting URL</label>
        <Input
          type="url"
          value={draft.url ?? ""}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass}>Status</label>
        <Select
          value={draft.status}
          onValueChange={(val) => {
            if (val)
              setDraft({ ...draft, status: val as JobApplication["status"] });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving && <Loader2 className="animate-spin" />}
        Update Application
      </Button>
    </form>
  );
}

export function ApplicationDetailsDialog({
  application,
  onClose,
  onSave,
}: {
  application: JobApplication | null;
  onClose: () => void;
  onSave: (application: JobApplication) => Promise<void> | void;
}) {
  return (
    <Dialog
      open={Boolean(application)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application details</DialogTitle>
          <DialogDescription>
            View and update this application.
          </DialogDescription>
        </DialogHeader>
        {application && (
          <>
            <DetailsForm
              key={application.id}
              application={application}
              onSave={onSave}
            />
            <Separator />
            <ApplicationStats applicationId={application.id} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}