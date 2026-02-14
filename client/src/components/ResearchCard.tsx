import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";

export interface ResearchCardRow {
  label: string;
  value: string;
}

export interface ResearchCardProps {
  title: string;
  source: string;
  time?: string;
  citation: string;
  tags?: string[];
  rows?: ResearchCardRow[];
  href?: string;
}

export function ResearchCard({
  title,
  source,
  time,
  citation,
  tags,
  rows,
  href,
}: ResearchCardProps) {
  return (
    <Card data-testid="card-research">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{source}</span>
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
          <div className="space-y-0 border-t border-dashed border-border pt-2 mb-3">
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

        <div className="flex items-start gap-1.5 border-t border-dashed border-border pt-2">
          <p className="text-[10px] text-muted-foreground italic leading-snug flex-1" data-testid="text-citation">
            {citation}
          </p>
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" data-testid="link-external" className="shrink-0">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
