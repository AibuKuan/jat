"use client";

import { useEffect, useState } from "react";
import { Info, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";

type Stats =
  | { enoughData: false; minUsers: number }
  | {
      enoughData: true;
      users: number;
      interviewRate: number;
      ignoredRate: number;
    };

const DISCLAIMER =
  "The activity stats for this job posting are based on self-reported, anonymous data from users in our application. Statistics are provided for informational purposes only and may not reflect the employer's official hiring status or complete applicant pool.";

function InfoBubble() {
  return (
    <Popover>
      <PopoverTrigger
        className="rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="About this data"
      >
        <Info className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-72 text-xs leading-relaxed">
        {DISCLAIMER}
      </PopoverContent>
    </Popover>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function ApplicationStats({ applicationId }: { applicationId: string }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const isGuest = Boolean(session?.user.isAnonymous);

  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || isGuest) return;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setOptedIn(Boolean(data.shareStatusAnonymously)))
      .catch(() => setError("Could not load your settings"));
  }, [userId, isGuest]);

  useEffect(() => {
    if (!optedIn) return;
    let cancelled = false;
    fetch(`/api/applications/${applicationId}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load community stats");
      });
    return () => {
      cancelled = true;
    };
  }, [optedIn, applicationId]);

  if (isPending || (userId && !isGuest && optedIn === null && !error)) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (!session || isGuest) {
    return (
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Community activity</h3>
        <p className="text-sm text-muted-foreground">
          Create an account to see how other applicants are doing with this
          posting. Guest accounts can't take part in community stats.
        </p>
      </div>
    );
  }

  if (!optedIn) {
    return (
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Community activity</h3>
        <p className="text-sm text-muted-foreground">
          To see how other applicants are doing with this posting, open Account
          from the profile menu and turn on "Share my status anonymously".
        </p>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-semibold">Community activity</h3>
        <InfoBubble />
      </div>

      {error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : !stats ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : stats.enoughData ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <Tile value={`${stats.interviewRate}%`} label="reached interview" />
            <Tile value={`${stats.ignoredRate}%`} label="no response" />
          </div>
          <p className="text-xs text-muted-foreground">
            Based on {stats.users} applicants
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Not enough data yet. Stats appear once at least {stats.minUsers}{" "}
          opted-in users have applied to this posting.
        </p>
      )}
    </div>
  );
}
