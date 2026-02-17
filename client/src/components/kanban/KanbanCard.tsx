import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KanbanCardProps {
  card: {
    id: number;
    title: string;
    type: string;
    status: string;
    priority: string;
    description?: string | null;
    appTarget?: string | null;
    tags?: string[] | null;
  };
  onClick?: () => void;
}

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-kanban-${card.id}`}
    >
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-xs font-medium leading-snug">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant={PRIORITY_VARIANT[card.priority] || "secondary"} data-testid={`badge-priority-${card.id}`}>
            {card.priority}
          </Badge>
          <Badge variant="outline" data-testid={`badge-type-${card.id}`}>{card.type}</Badge>
          {card.appTarget && (
            <Badge variant="outline" data-testid={`badge-target-${card.id}`}>{card.appTarget}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
