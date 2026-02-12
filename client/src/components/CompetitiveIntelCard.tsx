import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export interface CompetitiveIntelRow {
  label: string;
  value: string;
}

export interface CompetitiveIntelCardProps {
  title: string;
  source?: string;
  time?: string;
  tags?: string[];
  rows?: CompetitiveIntelRow[];
  summary?: string;
}

export function CompetitiveIntelCard({
  title,
  source,
  time,
  tags,
  rows,
  summary,
}: CompetitiveIntelCardProps) {
  return (
    <Card data-testid="card-competitive-intel">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          {source && <span className="text-[10px] text-muted-foreground">{source}</span>}
          {time && <span className="text-[10px] text-muted-foreground">{time}</span>}
        </div>

        <p className="text-sm font-medium leading-snug mb-2" data-testid="text-title">{title}</p>

        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap" data-testid="section-tags">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}

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
          <p className="text-xs text-muted-foreground mt-2 leading-snug border-t border-dashed border-border pt-2" data-testid="text-summary">
            {summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
