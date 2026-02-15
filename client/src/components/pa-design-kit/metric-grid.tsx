import type { MetricTickerData, MetricCardData } from "./types";
import { MetricTicker } from "./metric-ticker";
import { MetricCard } from "./metric-card";

interface MetricGridProps {
  metrics: MetricTickerData[] | MetricCardData[];
  variant?: "ticker" | "card";
  columns?: 1 | 2 | 3 | 4;
  maxVisible?: number;
  showMore?: boolean;
  invertTrend?: boolean;
  onMetricClick?: (key: string) => void;
  className?: string;
}

export function MetricGrid({
  metrics,
  variant = "ticker",
  columns = 2,
  maxVisible,
  showMore = true,
  invertTrend = false,
  onMetricClick,
  className = "",
}: MetricGridProps) {
  const colClass = columns === 1 ? "grid-cols-1"
    : columns === 2 ? "grid-cols-1 md:grid-cols-2"
    : columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  const visible = maxVisible ? metrics.slice(0, maxVisible) : metrics;
  const hiddenCount = maxVisible ? Math.max(0, metrics.length - maxVisible) : 0;

  return (
    <div className={className} data-testid="metric-grid">
      <div className={`grid ${colClass} gap-1.5`}>
        {visible.map((m) => (
          variant === "ticker" ? (
            <MetricTicker
              key={m.key}
              metric={m}
              invertTrend={invertTrend}
              onClick={onMetricClick ? () => onMetricClick(m.key) : undefined}
            />
          ) : (
            <MetricCard
              key={m.key}
              metric={m as MetricCardData}
              invertTrend={invertTrend}
            />
          )
        ))}
      </div>
      {showMore && hiddenCount > 0 && (
        <div className="text-xs text-muted-foreground mt-1.5 text-center">
          +{hiddenCount} more
        </div>
      )}
    </div>
  );
}
