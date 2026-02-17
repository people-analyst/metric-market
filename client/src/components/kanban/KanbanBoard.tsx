import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./KanbanCard";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["backlog", "planning", "planned", "prioritization", "ready", "assignment", "in_progress", "review", "done"] as const;
const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  planning: "Planning",
  planned: "Planned",
  prioritization: "Prioritization",
  ready: "Ready",
  assignment: "Assignment",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const STATUS_COLORS: Record<string, string> = {
  backlog: "bg-muted/50",
  planning: "bg-blue-50 dark:bg-blue-950/20",
  planned: "bg-indigo-50 dark:bg-indigo-950/20",
  prioritization: "bg-amber-50 dark:bg-amber-950/20",
  ready: "bg-emerald-50 dark:bg-emerald-950/20",
  assignment: "bg-cyan-50 dark:bg-cyan-950/20",
  in_progress: "bg-sky-50 dark:bg-sky-950/20",
  review: "bg-violet-50 dark:bg-violet-950/20",
  done: "bg-emerald-50 dark:bg-emerald-950/20",
};

interface KanbanCardData {
  id: number;
  title: string;
  type: string;
  status: string;
  priority: string;
  description?: string | null;
  appTarget?: string | null;
  tags?: string[] | null;
  acceptanceCriteria?: string[] | null;
  technicalNotes?: string | null;
  estimatedEffort?: string | null;
  assignedTo?: string | null;
  dependencies?: string[] | null;
  agentNotes?: string | null;
}

export function KanbanBoard() {
  const { data: cards = [], isLoading } = useQuery<KanbanCardData[]>({
    queryKey: ["/api/kanban/cards"],
  });

  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/kanban/cards/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/cards"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-kanban">
        <span className="text-sm text-muted-foreground">Loading board...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 p-4 overflow-x-auto h-full" data-testid="kanban-board">
        {STATUSES.map((status) => {
          const statusCards = cards.filter((c) => c.status === status);
          return (
            <div key={status} className="flex-shrink-0 w-64" data-testid={`column-${status}`}>
              <div className={`rounded-md p-2 ${STATUS_COLORS[status] || "bg-muted/50"}`}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <h3 className="font-semibold text-xs text-foreground">{STATUS_LABELS[status]}</h3>
                  <Badge variant="secondary" className="text-[10px]">{statusCards.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[4rem]">
                  {statusCards.map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      onClick={() => setSelectedCard(card)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        {selectedCard && (
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" data-testid="dialog-card-detail">
            <DialogHeader>
              <DialogTitle className="text-sm">{selectedCard.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{selectedCard.priority}</Badge>
                <Badge variant="outline">{selectedCard.type}</Badge>
                {selectedCard.appTarget && <Badge variant="outline">{selectedCard.appTarget}</Badge>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={selectedCard.status}
                  onValueChange={(val) => {
                    updateMutation.mutate({ id: selectedCard.id, data: { status: val } });
                    setSelectedCard({ ...selectedCard, status: val });
                  }}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCard.description && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <p className="text-xs text-foreground whitespace-pre-wrap">{selectedCard.description}</p>
                </div>
              )}

              {selectedCard.acceptanceCriteria && selectedCard.acceptanceCriteria.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Acceptance Criteria</label>
                  <ul className="list-disc list-inside space-y-0.5">
                    {selectedCard.acceptanceCriteria.map((ac, i) => (
                      <li key={i} className="text-xs text-foreground">{ac}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCard.tags && selectedCard.tags.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  <div className="flex gap-1 flex-wrap">
                    {selectedCard.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.technicalNotes && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Technical Notes</label>
                  <p className="text-xs text-foreground whitespace-pre-wrap">{selectedCard.technicalNotes}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCard(null)}
                  data-testid="button-close-detail"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
