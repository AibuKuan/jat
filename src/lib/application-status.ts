import {
  Archive,
  BellRing,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  EyeOff,
  Hourglass,
  Send,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { ApplicationStatus } from "@/db/schema";

export type StatusColor =
  | "slate"
  | "blue"
  | "sky"
  | "purple"
  | "amber"
  | "emerald"
  | "rose";

export const COLOR_STYLES: Record<
  StatusColor,
  {
    badge: string;
    card: string;
    label: string;
    value: string;
    watermark: string;
  }
> = {
  slate: {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
    card: "bg-slate-500/5 border-slate-200 dark:border-slate-800/60",
    label: "text-slate-500 dark:text-slate-400",
    value: "text-slate-900 dark:text-slate-100",
    watermark: "text-slate-500/10 dark:text-slate-100/10",
  },
  blue: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    card: "bg-blue-500/5 border-blue-200/60 dark:border-blue-900/40",
    label: "text-blue-600/80 dark:text-blue-400/80",
    value: "text-blue-950 dark:text-blue-100",
    watermark: "text-blue-500/15 dark:text-blue-400/15",
  },
  sky: {
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    card: "bg-sky-500/5 border-sky-200/60 dark:border-sky-900/40",
    label: "text-sky-600/80 dark:text-sky-400/80",
    value: "text-sky-950 dark:text-sky-100",
    watermark: "text-sky-500/15 dark:text-sky-400/15",
  },
  purple: {
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    card: "bg-purple-500/5 border-purple-200/60 dark:border-purple-900/40",
    label: "text-purple-600/80 dark:text-purple-400/80",
    value: "text-purple-950 dark:text-purple-100",
    watermark: "text-purple-500/15 dark:text-purple-400/15",
  },
  amber: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    card: "bg-amber-500/5 border-amber-200/60 dark:border-amber-900/40",
    label: "text-amber-600/80 dark:text-amber-400/80",
    value: "text-amber-950 dark:text-amber-100",
    watermark: "text-amber-500/15 dark:text-amber-400/15",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    card: "bg-emerald-500/5 border-emerald-200/60 dark:border-emerald-900/40",
    label: "text-emerald-600/80 dark:text-emerald-400/80",
    value: "text-emerald-950 dark:text-emerald-100",
    watermark: "text-emerald-500/15 dark:text-emerald-400/15",
  },
  rose: {
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    card: "bg-rose-500/5 border-rose-200/60 dark:border-rose-900/40",
    label: "text-rose-600/80 dark:text-rose-400/80",
    value: "text-rose-950 dark:text-rose-100",
    watermark: "text-rose-500/15 dark:text-rose-400/15",
  },
};

export type StatusGroup = "waiting" | "action" | "closed";

export interface StatusOption {
  value: ApplicationStatus;
  label: string;
  icon: LucideIcon;
  color: StatusColor;
  group: StatusGroup;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { value: ApplicationStatus.APPLIED, label: "Applied", icon: Send, color: "blue", group: "waiting" },
  { value: ApplicationStatus.INTERVIEWING, label: "Interviewing", icon: CalendarClock, color: "purple", group: "action" },
  { value: ApplicationStatus.INTERVIEWED, label: "Interviewed", icon: CalendarCheck, color: "sky", group: "waiting" },
  { value: ApplicationStatus.OFFERED, label: "Offered", icon: CheckCircle2, color: "emerald", group: "action" },
  { value: ApplicationStatus.REJECTED, label: "Rejected", icon: XCircle, color: "rose", group: "closed" },
  { value: ApplicationStatus.IGNORED, label: "Ignored", icon: EyeOff, color: "slate", group: "closed" },
];

export const STATUS_BY_VALUE = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option]),
) as Record<ApplicationStatus, StatusOption>;

export interface GroupOption {
  id: StatusGroup;
  label: string;
  icon: LucideIcon;
  color: StatusColor;
}

export const STATUS_GROUPS: GroupOption[] = [
  { id: "waiting", label: "Waiting", icon: Hourglass, color: "blue" },
  { id: "action", label: "Needs you", icon: BellRing, color: "amber" },
  { id: "closed", label: "Closed", icon: Archive, color: "rose" },
];

export function getGroupStats(applications: { status: ApplicationStatus }[]) {
  const counts: Partial<Record<ApplicationStatus, number>> = {};
  for (const app of applications) {
    counts[app.status] = (counts[app.status] ?? 0) + 1;
  }

  return STATUS_GROUPS.map((group) => {
    const breakdown = STATUS_OPTIONS.filter((o) => o.group === group.id)
      .map((o) => ({ label: o.label, count: counts[o.value] ?? 0 }))
      .filter((item) => item.count > 0);

    return {
      ...group,
      count: breakdown.reduce((sum, item) => sum + item.count, 0),
      breakdown,
    };
  });
}