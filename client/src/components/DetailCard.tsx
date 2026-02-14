import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export interface DetailCardTag {
  label: string;
  active?: boolean;
}

export interface DetailCardRow {
  label: string;
  value: string;
}

export interface DetailCardFooter {
  icon?: string;
  label: string;
  value: string;
  href?: string;
}

export interface DetailCardProps {
  tags?: DetailCardTag[];
  rows: DetailCardRow[];
  footer?: DetailCardFooter;
}

export function DetailCard({ tags, rows, footer }: DetailCardProps) {
  return (
    <Card data-testid="detail-card">
      <CardContent className="p-4 space-y-0">
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-dashed border-border" data-testid="detail-card-tags">
            {tags.map((tag) => (
              <Badge
                key={tag.label}
                variant={tag.active ? "default" : "outline"}
                className="text-xs"
                data-testid={`tag-${tag.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}

        <div>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-3 border-b border-dashed border-border last:border-b-0"
              data-testid={`detail-row-${row.label.toLowerCase().replace(/[\s/]+/g, "-")}`}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {row.label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-right">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {footer && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-dashed border-border" data-testid="detail-card-footer">
            <div className="flex items-center gap-2 min-w-0">
              {footer.icon && (
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 text-sm">
                  {footer.icon}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{footer.label}</p>
                <p className="text-sm font-bold">{footer.value}</p>
              </div>
            </div>
            {footer.href && (
              <a href={footer.href} target="_blank" rel="noopener noreferrer" data-testid="link-detail-external">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
