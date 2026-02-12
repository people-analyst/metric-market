import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ClipboardList } from "lucide-react";

export interface ActionPlanCardProps {
  title: string;
  source?: string;
  time?: string;
  tags?: string[];
  actions: { label: string; completed: boolean }[];
  progressPct?: number;
}

export function ActionPlanCard({
  title,
  source,
  time,
  tags,
  actions,
  progressPct,
}: ActionPlanCardProps) {
  const completed = actions.filter((a) => a.completed).length;

  return (
    <Card data-testid="card-action-plan">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
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

        <div className="space-y-2 border-t border-dashed border-border pt-3 mb-3">
          {actions.map((action, i) => (
            <div key={i} className="flex items-start gap-2" data-testid={`action-item-${i}`}>
              {action.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={`text-xs leading-snug ${action.completed ? "line-through text-muted-foreground" : ""}`}>
                {action.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0f69ff] rounded-full transition-all"
              style={{ width: `${progressPct ?? Math.round((completed / actions.length) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums" data-testid="text-progress">
            {completed}/{actions.length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
