import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MiniSparkline } from "./mini-sparkline";
import { TrendIndicator, TrendIcon } from "./trend-indicator";
import { formatMetricValue, CLASSIFICATION_STYLES } from "./format-value";
import type { MetricCardData } from "./types";

interface MetricCardProps {
  metric: MetricCardData;
  expandable?: boolean;
  invertTrend?: boolean;
  className?: string;
}

export function MetricCard({ metric, expandable = true, invertTrend = false, className = "" }: MetricCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`flex flex-col gap-1 p-2 rounded-md border border-border/50 ${expandable ? "cursor-pointer hover-elevate" : ""} ${className}`}
      onClick={expandable ? () => setExpanded(!expanded) : undefined}
      data-testid={`metric-card-${metric.key}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {metric.delta && <TrendIcon direction={metric.delta.direction} className="h-3.5 w-3.5" />}
          <span className="text-xs font-medium truncate" title={metric.label}>{metric.label}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-sm font-semibold tabular-nums" data-testid={`metric-card-value-${metric.key}`}>
            {formatMetricValue(metric.value, metric.unitType, metric.unitLabel)}
          </span>
          {metric.classification && (
            <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${CLASSIFICATION_STYLES[metric.classification] || ""}`}>
              {metric.classification}
            </Badge>
          )}
        </div>
      </div>

      {metric.delta && metric.delta.percent !== null && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendIndicator delta={metric.delta} invertColor={invertTrend} />
          {metric.sparkline && metric.sparkline.length > 1 && (
            <MiniSparkline data={metric.sparkline} width={48} height={14} className="text-muted-foreground" />
          )}
          {metric.confidence !== undefined && metric.confidence < 0.7 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-amber-500">low conf</span>
              </TooltipTrigger>
              <TooltipContent>Confidence: {((metric.confidence || 0) * 100).toFixed(0)}%</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      {expanded && expandable && (
        <div className="mt-1 pt-1 border-t border-border/30 space-y-0.5 text-xs text-muted-foreground">
          {metric.description && <p>{metric.description}</p>}
          <div className="flex flex-wrap gap-2">
            {metric.domain && <span>Domain: {metric.domain}</span>}
            {metric.category && <span>Category: {metric.category}</span>}
            {metric.sampleSize && <span>n={metric.sampleSize.toLocaleString()}</span>}
            {metric.dataQualityScore !== null && metric.dataQualityScore !== undefined && (
              <span>DQ: {((metric.dataQualityScore || 0) * 100).toFixed(0)}%</span>
            )}
          </div>
          {metric.reasons && metric.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {metric.reasons.map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0">{r}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
