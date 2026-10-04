import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

type MetricVariant = 'default' | 'sky' | 'emerald' | 'rose';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: MetricVariant;
}

const VARIANT_STYLES: Record<
  MetricVariant,
  {
    card: string;
    label: string;
    value: string;
    watermark: string;
  }
> = {
  default: {
    card: 'bg-slate-500/5 border-slate-200 dark:border-slate-800/60',
    label: 'text-slate-500 dark:text-slate-400',
    value: 'text-slate-900 dark:text-slate-100',
    watermark: 'text-slate-500/10 dark:text-slate-100/10',
  },
  sky: {
    card: 'bg-sky-500/5 border-sky-200/60 dark:border-sky-900/40',
    label: 'text-sky-600/80 dark:text-sky-400/80',
    value: 'text-sky-950 dark:text-sky-100',
    watermark: 'text-sky-500/15 dark:text-sky-400/15',
  },
  emerald: {
    card: 'bg-emerald-500/5 border-emerald-200/60 dark:border-emerald-900/40',
    label: 'text-emerald-600/80 dark:text-emerald-400/80',
    value: 'text-emerald-950 dark:text-emerald-100',
    watermark: 'text-emerald-500/15 dark:text-emerald-400/15',
  },
  rose: {
    card: 'bg-rose-500/5 border-rose-200/60 dark:border-rose-900/40',
    label: 'text-rose-600/80 dark:text-rose-400/80',
    value: 'text-rose-950 dark:text-rose-100',
    watermark: 'text-rose-500/15 dark:text-rose-400/15',
  },
};

export function MetricCard({ label, value, icon: Icon, variant = 'default' }: MetricCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
    >
      <CardContent className="p-5 flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className={`text-xs font-semibold uppercase tracking-wider ${styles.label}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold tracking-tight ${styles.value}`}>{value}</p>
        </div>
      </CardContent>

      {/* Thicker, rotated watermark icon */}
      <Icon
        strokeWidth={2.75}
        className={`absolute -right-4 -bottom-4 w-24 h-24 pointer-events-none -rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${styles.watermark}`}
      />
    </Card>
  );
}