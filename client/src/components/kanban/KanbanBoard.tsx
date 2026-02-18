import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AgentControlPanel } from "./AgentControlPanel";

const DEFAULT_STATUSES = ["backlog", "planning", "planned", "prioritization", "ready", "assignment", "in_progress", "review", "done"];
const DEFAULT_STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog", planning: "Planning", planned: "Planned", prioritization: "Prioritization",
  ready: "Ready", assignment: "Assignment", in_progress: "In Progress", review: "Review", done: "Done"
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-600 text-red-50",
  high: "bg-orange-500 text-orange-50",
  medium: "bg-blue-500 text-blue-50",
  low: "bg-muted text-muted-foreground",
};

interface ColumnConfig {
  status: string;
  label: string;
  isAgent?: boolean;
}

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
  lockedBy?: string | null;
}

export function KanbanBoard() {
  const { data, isLoading, error, refetch } = useQuery<any>({ queryKey: ["/api/kanban/cards"] });
  const { data: spokeConfig } = useQuery<any>({ queryKey: ["/api/kanban/spoke-config"] });
  const [showAgent, setShowAgent] = useState(true);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const cards: KanbanCardData[] = Array.isArray(data) ? data : (data?.cards ?? []);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/kanban/cards/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/cards"] });
    },
  });

  const columns: ColumnConfig[] = spokeConfig?.columns?.length
    ? spokeConfig.columns.map((c: any) => ({ status: c.status, label: c.label || DEFAULT_STATUS_LABELS[c.status] || c.status, isAgent: c.isAgent }))
    : DEFAULT_STATUSES.map(s => ({ status: s, label: DEFAULT_STATUS_LABELS[s] || s }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3" data-testid="board-error">
        <div className="text-destructive font-medium">Failed to load board</div>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} data-testid="button-retry-board">
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full" data-testid="board-loading">
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-3 p-4 overflow-x-auto flex-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-shrink-0 w-64 space-y-2">
              <div className="h-5 w-24 bg-muted rounded animate-pulse mb-3" />
              {[1,2,3].map(j => (
                <div key={j} className="h-20 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalByPriority = cards.reduce((acc: Record<string, number>, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full" data-testid="kanban-board">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">Kanban Board</h2>
          <Badge variant="secondary" data-testid="badge-card-count">{cards.length} cards</Badge>
          {Object.entries(totalByPriority).map(([p, count]) => (
            <Badge key={p} variant="outline" className="text-[10px]" data-testid={`badge-priority-${p}`}>
              {p}: {count as number}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-visible">
            <Button
              variant={viewMode === "board" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("board")}
              data-testid="button-view-board"
            >
              Board
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              List
            </Button>
          </div>
          <Button
            variant={showAgent ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAgent(!showAgent)}
            data-testid="button-toggle-agent-panel"
          >
            {showAgent ? "Hide Agent" : "Show AI Agent"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {viewMode === "board" ? (
          <div className="flex gap-3 p-4 overflow-x-auto flex-1">
            {columns.map(col => {
              const columnCards = cards.filter(c => c.status === col.status);
              return (
                <div key={col.status} className="flex-shrink-0 w-64 flex flex-col" data-testid={`column-${col.status}`}>
                  <div className="flex items-center justify-between gap-2 mb-2 px-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm">{col.label}</h3>
                      {col.isAgent && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-cyan-500 text-cyan-600 dark:text-cyan-400">AI</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{columnCards.length}</Badge>
                  </div>
                  <div className="space-y-2 overflow-y-auto flex-1 min-h-[120px]">
                    {columnCards.map((card: KanbanCardData) => (
                      <Card
                        key={card.id}
                        className={`p-3 hover-elevate cursor-pointer ${card.lockedBy ? "ring-1 ring-cyan-500/50" : ""}`}
                        onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                        data-testid={`card-${card.id}`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-medium text-sm leading-tight flex-1">{card.title}</h4>
                          <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">#{card.id}</span>
                        </div>
                        {card.lockedBy && (
                          <div className="flex items-center gap-1 mb-1.5 text-xs text-cyan-600 dark:text-cyan-400" data-testid={`card-agent-lock-${card.id}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span>Agent: {card.lockedBy}</span>
                          </div>
                        )}
                        {card.description && (
                          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">{card.description}</p>
                        )}
                        <div className="flex gap-1 flex-wrap">
                          <Badge className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[card.priority] || ""}`}>
                            {card.priority}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{card.type}</Badge>
                          {card.tags?.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                          ))}
                        </div>
                      </Card>
                    ))}
                    {columnCards.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <p className="text-xs">No cards</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-medium">ID</th>
                    <th className="text-left p-2 font-medium">Title</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Priority</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card: KanbanCardData) => (
                    <tr
                      key={card.id}
                      className="border-b hover-elevate cursor-pointer"
                      onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                      data-testid={`list-row-${card.id}`}
                    >
                      <td className="p-2 font-mono text-muted-foreground">#{card.id}</td>
                      <td className="p-2 font-medium">{card.title}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-[10px]">{DEFAULT_STATUS_LABELS[card.status] || card.status}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[card.priority] || ""}`}>{card.priority}</Badge>
                      </td>
                      <td className="p-2"><Badge variant="outline" className="text-[10px]">{card.type}</Badge></td>
                      <td className="p-2">
                        {card.lockedBy && (
                          <span className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            {card.lockedBy}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showAgent && (
          <div className="w-80 flex-shrink-0 border-l overflow-y-auto" data-testid="agent-panel-sidebar">
            <AgentControlPanel />
            {selectedCard && (
              <div className="p-4 border-t" data-testid="card-detail-panel">
                <h3 className="font-semibold text-sm mb-2">{selectedCard.title}</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div><span className="font-medium text-foreground">Status:</span> {DEFAULT_STATUS_LABELS[selectedCard.status] || selectedCard.status}</div>
                  <div><span className="font-medium text-foreground">Priority:</span> {selectedCard.priority}</div>
                  <div><span className="font-medium text-foreground">Type:</span> {selectedCard.type}</div>
                  {selectedCard.description && <div><span className="font-medium text-foreground">Description:</span> {selectedCard.description}</div>}
                  {selectedCard.technicalNotes && <div><span className="font-medium text-foreground">Notes:</span> {selectedCard.technicalNotes}</div>}
                  {selectedCard.acceptanceCriteria && selectedCard.acceptanceCriteria.length > 0 && (
                    <div>
                      <span className="font-medium text-foreground">Acceptance Criteria:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {selectedCard.acceptanceCriteria.map((ac: string, i: number) => (
                          <li key={i}>{ac}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCard.tags && selectedCard.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedCard.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        {selectedCard && (
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" data-testid="dialog-card-detail">
            <DialogHeader>
              <DialogTitle className="text-sm">{selectedCard.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${PRIORITY_COLORS[selectedCard.priority] || ""}`}>{selectedCard.priority}</Badge>
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
                    {DEFAULT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{DEFAULT_STATUS_LABELS[s]}</SelectItem>
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
    </div>
  );
}
