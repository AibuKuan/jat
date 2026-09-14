"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { ApplicationStatus, JobApplication } from "@/db/schema";
import { MetricCard } from "./components/metric-card";
import dynamic from "next/dynamic";

// This table is driven entirely by client-fetched data (see fetchApplications
// below) and has interactive, non-deterministic internals (pagination state,
// floating-ui menus) that don't need — and don't reliably match — server
// rendering. Loading it client-only avoids hydration mismatches on things
// like the pagination buttons' `disabled` state.
const JobApplicationTable = dynamic(
  () =>
    import("./components/job-application-table").then(
      (mod) => mod.JobApplicationTable,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading applications…
      </div>
    ),
  },
);

export default function JobTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState<{
    jobTitle: string;
    company: string;
    url: string;
    status: JobApplication["status"];
  }>({
    jobTitle: "",
    company: "",
    url: "",
    status: ApplicationStatus.APPLIED,
  });

  const fetchApplications = async () => {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setOpenCreate(false);
    setFormData({
      jobTitle: "",
      company: "",
      url: "",
      status: ApplicationStatus.APPLIED,
    });
    fetchApplications();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    await fetch("/api/applications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingApp),
    });

    setEditingApp(null);
    fetchApplications();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/applications?id=${id}`, {
      method: "DELETE",
    });
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status: newStatus as JobApplication["status"] }
          : app,
      ),
    );
  };

  const stats = useMemo(() => {
    return {
      total: applications.length,
      interviewing: applications.filter((a) => a.status === "interviewing")
        .length,
      offered: applications.filter((a) => a.status === "offered").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };
  }, [applications]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Main Title Banner */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Job Applications
          </h1>
          <p className="text-muted-foreground text-sm">
            Track, manage, and analyze your job search pipeline.
          </p>
        </div>

        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Total Applied"
            value={stats.total}
            icon={Briefcase}
            variant="default"
          />
          <MetricCard
            label="Interviewing"
            value={stats.interviewing}
            icon={Clock}
            variant="sky"
          />
          <MetricCard
            label="Offered"
            value={stats.offered}
            icon={CheckCircle2}
            variant="emerald"
          />
          <MetricCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            variant="rose"
          />
        </div>

        {/* Compact Sticky Filter Bar */}
        <div className="sticky top-0 z-20 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-border/40 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-6xl mx-auto sm:justify-end">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val !== null) setStatusFilter(val);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-background border-border/60">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <JobApplicationTable
          data={applications}
          onEdit={setEditingApp}
          onDelete={handleDelete}
          toolbarActions={
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger
                render={
                  <Button className="flex items-center justify-center gap-2 shadow-xs font-medium shrink-0" />
                }
              >
                <Plus className="w-4 h-4" /> Add Application
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Application</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Job Title
                    </label>
                    <Input
                      required
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Company
                    </label>
                    <Input
                      required
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="e.g. Stripe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Job Posting URL
                    </label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="https://company.com/careers/role"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => {
                        if (val)
                          setFormData({
                            ...formData,
                            status: val as JobApplication["status"],
                          });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="interviewing">
                          Interviewing
                        </SelectItem>
                        <SelectItem value="offered">Offered</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full mt-2">
                    Save Application
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Edit Application Dialog */}
        <Dialog
          open={Boolean(editingApp)}
          onOpenChange={(open) => !open && setEditingApp(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
            </DialogHeader>
            {editingApp && (
              <form onSubmit={handleUpdate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Job Title
                  </label>
                  <Input
                    required
                    value={editingApp.jobTitle}
                    onChange={(e) =>
                      setEditingApp({ ...editingApp, jobTitle: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Company
                  </label>
                  <Input
                    required
                    value={editingApp.company}
                    onChange={(e) =>
                      setEditingApp({ ...editingApp, company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Posting URL
                  </label>
                  <Input
                    type="url"
                    value={editingApp.url || ""}
                    onChange={(e) =>
                      setEditingApp({ ...editingApp, url: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={editingApp.status}
                    onValueChange={(val) => {
                      if (val)
                        setEditingApp({
                          ...editingApp,
                          status: val as JobApplication["status"],
                        });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="offered">Offered</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full mt-2">
                  Update Application
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}