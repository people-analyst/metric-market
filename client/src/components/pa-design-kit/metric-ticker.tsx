import { Badge } from "@/components/ui/badge";
import { MiniSparkline } from "./mini-sparkline";
import { TrendIndicator } from "./trend-indicator";
import { formatMetricValue, CLASSIFICATION_STYLES } from "./format-value";
import type { MetricTickerData } from "./types";

interface MetricTickerProps {
  metric: MetricTickerData;
  showClassification?: boolean;
  showSparkline?: boolean;
  invertTrend?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MetricTicker({
  metric,
  showClassification = true,
  showSparkline = true,
  invertTrend = false,
  onClick,
  className = "",
}: MetricTickerProps) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md border border-border/50 min-w-0 ${onClick ? "cursor-pointer hover-elevate" : ""} ${className}`}
      onClick={onClick}
      data-testid={`ticker-${metric.key}`}
    >
      <span className="text-xs text-muted-foreground truncate flex-shrink min-w-0" title={metric.label}>
        {metric.label}
      </span>

      <span className="text-sm font-semibold tabular-nums flex-shrink-0 ml-auto" data-testid={`ticker-value-${metric.key}`}>
        {formatMetricValue(metric.value, metric.unitType, metric.unitLabel)}
      </span>

      {metric.delta && metric.delta.direction !== "flat" && (
        <TrendIndicator delta={metric.delta} size="sm" invertColor={invertTrend} />
      )}

      {showSparkline && metric.sparkline && metric.sparkline.length > 1 && (
        <MiniSparkline data={metric.sparkline} width={48} height={14} className="text-muted-foreground flex-shrink-0" />
      )}

      {showClassification && metric.classification && metric.classification !== "Normal" && (
        <Badge variant="secondary" className={`text-xs px-1.5 py-0 flex-shrink-0 ${CLASSIFICATION_STYLES[metric.classification] || ""}`}>
          {metric.classification}
        </Badge>
      )}
    </div>
  );
}
