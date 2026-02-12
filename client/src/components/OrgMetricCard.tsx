import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface OrgMetricCardRow {
  label: string;
  value: string;
}

export interface OrgMetricCardProps {
  ticker: string;
  tickerColor: string;
  title: string;
  value: string;
  changePct: string;
  positive: boolean;
  source?: string;
  time?: string;
  rows?: OrgMetricCardRow[];
}

export function OrgMetricCard({
  ticker,
  tickerColor,
  title,
  value,
  changePct,
  positive,
  source,
  time,
  rows,
}: OrgMetricCardProps) {
  return (
    <Card data-testid="card-org-metric">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {(source || time) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              {source && <span className="text-[10px]">{source}</span>}
              {time && <span className="text-[10px]">{time}</span>}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 mb-3">
          <span
            className={`${tickerColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0`}
            data-testid="text-ticker"
          >
            {ticker}
          </span>
          <p className="text-sm font-medium leading-snug" data-testid="text-title">{title}</p>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl font-bold tabular-nums" data-testid="text-value">{value}</span>
          <span
            className={`text-xs font-medium tabular-nums flex items-center gap-0.5 ${
              positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
            data-testid="text-change"
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {changePct}
          </span>
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
      </CardContent>
    </Card>
  );
}
