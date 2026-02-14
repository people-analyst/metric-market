import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Lightbulb } from "lucide-react";

export interface AnalysisRow {
  label: string;
  value: string;
}

export interface AnalysisSummaryCardProps {
  title: string;
  source?: string;
  time?: string;
  ticker?: string;
  tickerColor?: string;
  riskLevel: "low" | "medium" | "high";
  rows?: AnalysisRow[];
  summary?: string;
}

const RISK_CONFIG = {
  low: { label: "Low Risk", textClass: "text-green-600 dark:text-green-400", iconClass: "text-green-500" },
  medium: { label: "Medium Risk", textClass: "text-amber-600 dark:text-amber-400", iconClass: "text-amber-500" },
  high: { label: "High Risk", textClass: "text-red-600 dark:text-red-400", iconClass: "text-red-500" },
};

export function AnalysisSummaryCard({
  title,
  source,
  time,
  ticker,
  tickerColor,
  riskLevel,
  rows,
  summary,
}: AnalysisSummaryCardProps) {
  const risk = RISK_CONFIG[riskLevel];

  return (
    <Card data-testid="card-analysis">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
          {source && <span className="text-[10px] text-muted-foreground">{source}</span>}
          {time && <span className="text-[10px] text-muted-foreground">{time}</span>}
        </div>

        <div className="flex items-start gap-2 mb-3">
          {ticker && tickerColor && (
            <span className={`${tickerColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0`} data-testid="text-ticker">
              {ticker}
            </span>
          )}
          <p className="text-sm font-medium leading-snug" data-testid="text-title">{title}</p>
        </div>

        <div className="flex items-center gap-2 mb-3" data-testid="section-risk">
          <AlertTriangle className={`h-4 w-4 ${risk.iconClass}`} />
          <span className={`text-xs font-semibold ${risk.textClass}`}>{risk.label}</span>
        </div>

        {rows && rows.length > 0 && (
          <div className="space-y-0 border-t border-dashed border-border pt-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2 py-1.5"
                data-testid={`row-${row.label.toLowerCase().replace(/[\s/]+/g, "-")}`}
              >
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-xs font-medium tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {summary && (
          <p className="text-xs text-muted-foreground mt-2 leading-snug" data-testid="text-summary">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}
