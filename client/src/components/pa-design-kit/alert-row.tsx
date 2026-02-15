import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MiniSparkline } from "./mini-sparkline";
import { formatMetricValue, CLASSIFICATION_STYLES } from "./format-value";
import type { AlertRowData } from "./types";

interface AlertRowProps {
  alert: AlertRowData;
  className?: string;
}

export function AlertRow({ alert, className = "" }: AlertRowProps) {
  const iconColor = alert.classification === "Critical" ? "text-red-500" : "text-orange-500";

  return (
    <div className={`flex items-center gap-2 p-2 rounded-md border border-border/50 ${className}`} data-testid={`alert-${alert.key}`}>
      <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate">{alert.label}</span>
          <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${CLASSIFICATION_STYLES[alert.classification] || ""}`}>
            {alert.classification}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatMetricValue(alert.value, alert.unitType)}
          {alert.delta && alert.delta.percent !== null && (
            <span className={`ml-1 ${alert.delta.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : alert.delta.direction === "down" ? "text-red-600 dark:text-red-400" : ""}`}>
              ({alert.delta.percent > 0 ? "+" : ""}{alert.delta.percent.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>
      {alert.sparkline && alert.sparkline.length > 1 && (
        <MiniSparkline data={alert.sparkline} width={48} height={16} className="text-muted-foreground flex-shrink-0" />
      )}
    </div>
  );
}
