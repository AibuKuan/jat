"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Check, Copy, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const PERMISSION_OPTIONS = [
  { id: "read", label: "Read", hint: "List your applications" },
  { id: "create", label: "Create", hint: "Add new applications" },
  { id: "update", label: "Update", hint: "Edit and change status" },
  { id: "delete", label: "Delete", hint: "Permanently remove applications" },
] as const;

type AgentToken = {
  id: string;
  name: string;
  permissions: string[];
  expiresAt: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function AgentSheet() {
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<AgentToken[] | null>(null);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([
    "read",
    "create",
    "update",
  ]);
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [generating, setGenerating] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    const res = await fetch("/api/agent/tokens");
    if (res.ok) setTokens(await res.json());
  }, []);

  useEffect(() => {
    if (open) fetchTokens();
  }, [open, fetchTokens]);

  function togglePermission(id: string, checked: boolean) {
    setPermissions((prev) =>
      checked ? [...prev, id] : prev.filter((p) => p !== id),
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!permissions.length) {
      setError("Select at least one permission");
      return;
    }

    setGenerating(true);
    setError(null);
    setNewLink(null);
    setCopied(false);

    const res = await fetch("/api/agent/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || "AI assistant",
        permissions,
        expiresInDays: Number(expiresInDays),
      }),
    });

    setGenerating(false);

    if (!res.ok) {
      setError("Could not generate link");
      return;
    }

    const data = await res.json();
    setNewLink(data.link);
    setName("");
    fetchTokens();
  }

  async function handleCopy() {
    if (!newLink) return;
    await navigator.clipboard.writeText(newLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke(id: string) {
    setRevokingId(id);
    await fetch(`/api/agent/tokens?id=${id}`, { method: "DELETE" });
    setRevokingId(null);
    setTokens((prev) => prev?.filter((t) => t.id !== id) ?? null);
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="AI assistant access"
      >
        <Bot />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>AI assistant access</SheetTitle>
            <SheetDescription>
              Generate a link, paste it into your AI chat, then send it a job
              posting. It adds the application for you.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-4 pb-6">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ChatGPT, Claude"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Permissions</label>
                {PERMISSION_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-start gap-2"
                  >
                    <Checkbox
                      checked={permissions.includes(option.id)}
                      onCheckedChange={(checked) =>
                        togglePermission(option.id, Boolean(checked))
                      }
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-tight">
                      <span className="font-medium">{option.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                ))}
                {permissions.includes("delete") && (
                  <p className="text-xs text-rose-600">
                    Delete is irreversible. Only enable it if you really need
                    it.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Expires in</label>
                <Select
                  value={expiresInDays}
                  onValueChange={(val) => {
                    if (val) setExpiresInDays(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-rose-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={generating}>
                {generating && <Loader2 className="animate-spin" />}
                Generate link
              </Button>
            </form>

            {newLink && (
              <div className="space-y-2 rounded-md border border-emerald-500/40 bg-emerald-50 p-3 dark:bg-emerald-950/30">
                <p className="text-sm font-medium">Your new link</p>
                <div className="flex gap-2">
                  <Input readOnly value={newLink} className="font-mono text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    aria-label="Copy link"
                  >
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy it now. For your security it can't be shown again. Treat
                  it like a password.
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Active links</h3>
              {tokens === null ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : tokens.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No links yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {tokens.map((token) => {
                    const expired = new Date(token.expiresAt) < new Date();
                    return (
                      <li
                        key={token.id}
                        className="flex items-start justify-between gap-3 rounded-md border p-3"
                      >
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {token.name}
                            </span>
                            {expired && (
                              <Badge variant="secondary">Expired</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {token.permissions.map((p) => (
                              <Badge key={p} variant="outline">
                                {p}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {token.lastUsedAt
                              ? `Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`
                              : "Never used"}
                            {" · "}
                            {expired ? "Expired" : "Expires"}{" "}
                            {new Date(token.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-rose-600 hover:text-rose-600"
                          onClick={() => handleRevoke(token.id)}
                          disabled={revokingId === token.id}
                          aria-label={`Revoke ${token.name}`}
                        >
                          {revokingId === token.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}