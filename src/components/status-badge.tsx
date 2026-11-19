import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/db/schema';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; styles: string }> = {
  offered: {
    label: 'Offered',
    styles: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25',
  },
  interviewing: {
    label: 'Interviewing',
    styles: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20 hover:bg-sky-500/25',
  },
  rejected: {
    label: 'Rejected',
    styles: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/25',
  },
  applied: {
    label: 'Applied',
    styles: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20 hover:bg-slate-500/25',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.applied;

  return (
    <Badge className={`shadow-none font-medium ${config.styles} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}