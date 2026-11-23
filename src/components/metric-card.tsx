import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  COLOR_STYLES,
  formatPercent,
  type StatusColor,
  type StatusDetail,
} from "@/lib/application-status";
import { LucideIcon } from "lucide-react";

const DECIMAL_OPTIONS = [0, 1, 2, 3];

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: StatusColor;
  total: number;
  showShare?: boolean;
  breakdown?: { label: string; count: number }[];
  statuses?: StatusDetail[];
  decimals?: number;
  onDecimalsChange?: (decimals: number) => void;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  color = "slate",
  total,
  showShare = true,
  breakdown,
  statuses,
  decimals = 0,
  onDecimalsChange,
}: MetricCardProps) {
  const styles = COLOR_STYLES[color];

  const card = (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
    >
      <CardContent className="relative z-10 p-4">
        <div className="space-y-0.5">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${styles.label}`}
          >
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-2xl font-bold tracking-tight ${styles.value}`}>
              {value}
            </p>
            {showShare && (
              <span className={`text-xs font-medium ${styles.label}`}>
                {formatPercent(value, total, decimals)}
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
        strokeWidth={2.5}
        className={`pointer-events-none absolute -right-3 -bottom-3 h-16 w-16 -rotate-12 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${styles.watermark}`}
      />
    </Card>
  );

  if (!statuses) return card;

  return (
    <Popover>
      <PopoverTrigger
        className="block w-full cursor-pointer rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${label} details`}
      >
        {card}
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {value} of {total} application{total === 1 ? "" : "s"} shown
            {showShare && ` · ${formatPercent(value, total, decimals)}`}
          </p>
        </div>

        <ul className="space-y-2">
          {statuses.map((status) => (
            <li key={status.value} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <status.icon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                <span className="tabular-nums">
                  <span className="text-muted-foreground">{status.count}</span>
                  {" · "}
                  {formatPercent(status.count, total, decimals)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full bg-current ${COLOR_STYLES[status.color].label}`}
                  style={{
                    width: `${total > 0 ? (status.count / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        {onDecimalsChange && (
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              Decimal places
            </span>
            <div className="flex gap-1">
              {DECIMAL_OPTIONS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={decimals === option ? "secondary" : "ghost"}
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => onDecimalsChange(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}