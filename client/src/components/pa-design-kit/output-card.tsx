import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface OutputCardData {
  id: string | number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  status?: string | null;
  statusVariant?: "default" | "secondary" | "outline" | "destructive";
  tags?: string[];
  metadata?: { label: string; value: string }[];
  timestamp?: string | Date | null;
  icon?: any;
  onClick?: () => void;
}

interface OutputCardProps {
  item: OutputCardData;
  compact?: boolean;
  className?: string;
}

export function OutputCard({ item, compact = false, className }: OutputCardProps) {
  const IconComp = item.icon;
  const hasTimestamp = item.timestamp != null;
  const timeAgo = hasTimestamp
    ? formatDistanceToNow(new Date(item.timestamp!), { addSuffix: true })
    : null;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-md border border-transparent transition-colors",
        item.onClick && "cursor-pointer hover-elevate",
        className,
      )}
      onClick={item.onClick}
      data-testid={`output-card-${item.id}`}
    >
      {IconComp && (
        <div className="mt-0.5 shrink-0 text-muted-foreground">
          <IconComp className="h-4 w-4" />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{item.title}</div>
            {item.subtitle && (
              <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
            )}
          </div>
          {item.status && (
            <Badge variant={item.statusVariant || "secondary"} className="shrink-0 text-xs">
              {item.status}
            </Badge>
          )}
        </div>

        {!compact && item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {item.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">+{item.tags.length - 4}</span>
              )}
            </div>
          )}

          {!compact && item.metadata && item.metadata.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {item.metadata.map((m) => (
                <span key={m.label}>
                  <span className="opacity-60">{m.label}:</span>{" "}
                  <span className="tabular-nums">{m.value}</span>
                </span>
              ))}
            </div>
          )}

          {timeAgo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          )}
        </div>
      </div>

      {item.onClick && (
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
