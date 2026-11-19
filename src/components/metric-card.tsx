import { Card, CardContent } from "@/components/ui/card";
import { COLOR_STYLES, type StatusColor } from "@/lib/application-status";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: StatusColor;
  total?: number;
  breakdown?: { label: string; count: number }[];
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  color = "slate",
  total,
  breakdown,
}: MetricCardProps) {
  const styles = COLOR_STYLES[color];
  const percentage =
    total === undefined ? null : total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
    >
      <CardContent className="p-5 flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className={`text-xs font-semibold uppercase tracking-wider ${styles.label}`}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold tracking-tight ${styles.value}`}>
              {value}
            </p>
            {percentage !== null && (
              <span className={`text-sm font-medium ${styles.label}`}>
                {percentage}%
              </span>
            )}
          </div>
          {breakdown && breakdown.length > 0 && (
            <p className={`text-xs ${styles.label}`}>
              {breakdown
                .map((item) => `${item.count} ${item.label.toLowerCase()}`)
                .join(" · ")}
            </p>
          )}
        </div>
      </CardContent>

      <Icon
        strokeWidth={2.75}
        className={`absolute -right-4 -bottom-4 w-24 h-24 pointer-events-none -rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${styles.watermark}`}
      />
    </Card>
  );
}