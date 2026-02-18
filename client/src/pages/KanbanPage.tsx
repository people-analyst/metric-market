import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export function KanbanPage() {
  return (
    <div className="h-full flex flex-col" data-testid="page-kanban">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <h1 className="text-sm font-semibold text-foreground" data-testid="text-kanban-title">Kanbai Board</h1>
        <span className="text-xs text-muted-foreground">Work items and integration tasks</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
