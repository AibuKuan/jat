'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, Pencil, Trash2, Search, Briefcase, Building2, CheckCircle2, Clock, XCircle } from 'lucide-react';

type Application = {
  id: string;
  jobTitle: string;
  company: string;
  url: string | null;
  appliedDate: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
};

export default function JobTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState<{
    jobTitle: string;
    company: string;
    url: string;
    status: Application['status'];
  }>({
    jobTitle: '',
    company: '',
    url: '',
    status: 'applied',
  });

  const fetchApplications = async () => {
    const res = await fetch('/api/applications');
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setOpenCreate(false);
    setFormData({ jobTitle: '', company: '', url: '', status: 'applied' });
    fetchApplications();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    await fetch('/api/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingApp),
    });

    setEditingApp(null);
    fetchApplications();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/applications?id=${id}`, {
      method: 'DELETE',
    });
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus as Application['status'] } : app))
    );
  };

  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return applications
      .filter((app) => {
        const matchesSearch =
          !query ||
          app.company.toLowerCase().includes(query) ||
          app.jobTitle.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [applications, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      interviewing: applications.filter((a) => a.status === 'interviewing').length,
      offered: applications.filter((a) => a.status === 'offered').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offered':
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25 shadow-none font-medium">Offered</Badge>;
      case 'interviewing':
        return <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20 hover:bg-sky-500/25 shadow-none font-medium">Interviewing</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/25 shadow-none font-medium">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20 hover:bg-slate-500/25 shadow-none font-medium">Applied</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Main Title Banner */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Job Applications</h1>
          <p className="text-muted-foreground text-sm">
            Track, manage, and analyze your job search pipeline.
          </p>
        </div>

        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="shadow-none border-border/60 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Applied</p>
                <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
              </div>
              <Briefcase className="w-5 h-5 text-muted-foreground/60" />
            </CardContent>
          </Card>
          <Card className="shadow-none border-border/60 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-400">Interviewing</p>
                <p className="text-2xl font-bold tracking-tight">{stats.interviewing}</p>
              </div>
              <Clock className="w-5 h-5 text-sky-500/60" />
            </CardContent>
          </Card>
          <Card className="shadow-none border-border/60 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Offered</p>
                <p className="text-2xl font-bold tracking-tight">{stats.offered}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
            </CardContent>
          </Card>
          <Card className="shadow-none border-border/60 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Rejected</p>
                <p className="text-2xl font-bold tracking-tight">{stats.rejected}</p>
              </div>
              <XCircle className="w-5 h-5 text-rose-500/60" />
            </CardContent>
          </Card>
        </div>

        {/* Compact Sticky Filter Bar */}
        <div className="sticky top-0 z-20 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-border/40 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-6xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by company or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border/60"
              />
            </div>
            
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

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger render={<Button className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-xs font-medium shrink-0" />}>
                <Plus className="w-4 h-4" /> Add Application
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Application</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Title</label>
                    <Input
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
                    <Input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Stripe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Posting URL</label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://company.com/careers/role"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => {
                        if (val) setFormData({ ...formData, status: val as Application['status'] });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
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
                    Save Application
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Applications Data Table */}
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[240px]">Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Applied Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Update Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="w-8 h-8 text-muted-foreground/40" />
                        <p className="text-sm">
                          {searchQuery || statusFilter !== 'all'
                            ? 'No job applications found matching your search.'
                            : 'No applications recorded yet.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id} className="group transition-colors hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{app.company}</span>
                          {app.url && (
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">{app.jobTitle}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(app.appliedDate).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={app.status}
                          onValueChange={(val) => {
                            if (val) handleStatusChange(app.id, val);
                          }}
                        >
                          <SelectTrigger className="w-[125px] h-8 text-xs bg-background/50 border-border/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interviewing">Interviewing</SelectItem>
                            <SelectItem value="offered">Offered</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            onClick={() => setEditingApp(app)}
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-rose-500/10 hover:text-rose-600"
                            onClick={() => handleDelete(app.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Application Dialog */}
        <Dialog open={Boolean(editingApp)} onOpenChange={(open) => !open && setEditingApp(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
            </DialogHeader>
            {editingApp && (
              <form onSubmit={handleUpdate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Title</label>
                  <Input
                    required
                    value={editingApp.jobTitle}
                    onChange={(e) => setEditingApp({ ...editingApp, jobTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
                  <Input
                    required
                    value={editingApp.company}
                    onChange={(e) => setEditingApp({ ...editingApp, company: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Posting URL</label>
                  <Input
                    type="url"
                    value={editingApp.url || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, url: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                  <Select
                    value={editingApp.status}
                    onValueChange={(val) => {
                      if (val) setEditingApp({ ...editingApp, status: val as Application['status'] });
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