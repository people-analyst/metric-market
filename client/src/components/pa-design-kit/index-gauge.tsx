import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { MiniSparkline } from "./mini-sparkline";
import type { IndexGaugeData } from "./types";

const INDEX_CONFIG: Record<string, { abbr: string; fullLabel: string; ringColor: string; textColor: string; isRisk: boolean }> = {
  ecosystem_health_index: { abbr: "EHI", fullLabel: "Ecosystem Health", ringColor: "stroke-emerald-500", textColor: "text-emerald-500", isRisk: false },
  ecosystem_risk_index: { abbr: "ERI", fullLabel: "Ecosystem Risk", ringColor: "stroke-orange-500", textColor: "text-orange-500", isRisk: true },
  cross_app_anomaly_index: { abbr: "CAAI", fullLabel: "Cross-App Anomaly", ringColor: "stroke-violet-500", textColor: "text-violet-500", isRisk: true },
};

interface IndexGaugeProps {
  data: IndexGaugeData;
  size?: "sm" | "md";
  className?: string;
}

export function IndexGauge({ data, size = "md", className = "" }: IndexGaugeProps) {
  const config = INDEX_CONFIG[data.key] || { abbr: data.key.slice(0, 4).toUpperCase(), fullLabel: data.key, ringColor: "stroke-primary", textColor: "text-primary", isRisk: false };
  const gaugeSize = size === "sm" ? "w-16 h-16" : "w-20 h-20";
  const textSize = size === "sm" ? "text-base" : "text-lg";
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, data.value)) / 100;

  const deltaColor = data.delta !== null && data.delta !== undefined
    ? data.delta > 0
      ? config.isRisk ? "text-red-500" : "text-emerald-500"
      : data.delta < 0
        ? config.isRisk ? "text-emerald-500" : "text-red-500"
        : "text-muted-foreground"
    : "";

  return (
    <Card className={className} data-testid={`index-gauge-${config.abbr.toLowerCase()}`}>
      <CardContent className="p-3 flex flex-col items-center gap-1">
        <div className={`relative ${gaugeSize}`}>
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
            <circle
              cx="40" cy="40" r={radius} fill="none"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              className={config.ringColor}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${textSize} font-bold ${config.textColor}`} data-testid={`index-value-${config.abbr.toLowerCase()}`}>
              {data.value.toFixed(0)}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium">{config.abbr}</div>
          <div className="text-xs text-muted-foreground">{config.fullLabel}</div>
          <Badge variant="secondary" className={`text-xs mt-1 ${config.isRisk && data.value > 50 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" : ""}`}>
            {data.label}
          </Badge>
        </div>
        {data.delta !== null && data.delta !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs ${deltaColor}`}>
            {data.delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : data.delta < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {Math.abs(data.delta).toFixed(1)}
          </div>
        )}
        {data.sparkline && data.sparkline.length > 1 && (
          <MiniSparkline data={data.sparkline} width={56} height={16} className={config.textColor} />
        )}
      </CardContent>
    </Card>
  );
}

export { INDEX_CONFIG };
