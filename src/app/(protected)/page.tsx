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
import { Plus, Briefcase } from "lucide-react";
import { ApplicationStatus, JobApplication } from "@/db/schema";
import { MetricCard } from "./components/metric-card";
import dynamic from "next/dynamic";
import { ProfileMenu } from "@/components/profile-menu";
import {
  getGroupStats,
  STATUS_OPTIONS,
} from "@/lib/application-status";
import { ApplicationDetailsDialog } from "@/components/application-details-dialog";

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

  const handleSave = async (application: JobApplication) => {
    await fetch("/api/applications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
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

  const groupStats = useMemo(() => getGroupStats(applications), [applications]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Main Title Banner */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Job Applications
            </h1>
            <p className="text-muted-foreground text-sm">
              Track, manage, and analyze your job search pipeline.
            </p>
          </div>
          <ProfileMenu />
        </div>

        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Total"
            value={applications.length}
            icon={Briefcase}
            color="slate"
          />
          {groupStats.map((group) => (
            <MetricCard
              key={group.id}
              label={group.label}
              value={group.count}
              icon={group.icon}
              color={group.color}
              total={applications.length}
              breakdown={group.breakdown}
            />
          ))}
        </div>

        <JobApplicationTable
          data={applications}
          onView={setEditingApp}
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
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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

        {/* Application Dialog */}
        <ApplicationDetailsDialog
          application={editingApp}
          onClose={() => setEditingApp(null)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
