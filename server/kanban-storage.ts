import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";
import { kanbanCards, kanbanSubtasks, type KanbanCard, type InsertKanbanCard, type KanbanSubtask } from "@shared/schema";

export class KanbanStorage {
  async getCards(filters?: { appTarget?: string; status?: string }): Promise<KanbanCard[]> {
    const conditions = [];
    if (filters?.appTarget) conditions.push(eq(kanbanCards.appTarget, filters.appTarget));
    if (filters?.status) conditions.push(eq(kanbanCards.status, filters.status));
    if (conditions.length > 0) {
      return db.select().from(kanbanCards).where(and(...conditions)).orderBy(asc(kanbanCards.position));
    }
    return db.select().from(kanbanCards).orderBy(asc(kanbanCards.position));
  }

  async getCard(id: number): Promise<KanbanCard | undefined> {
    const [card] = await db.select().from(kanbanCards).where(eq(kanbanCards.id, id));
    return card;
  }

  async createCard(card: InsertKanbanCard): Promise<KanbanCard> {
    const values = {
      title: card.title,
      type: card.type,
      appTarget: card.appTarget ?? null,
      status: card.status ?? "backlog",
      priority: card.priority ?? "medium",
      description: card.description ?? null,
      acceptanceCriteria: card.acceptanceCriteria ? [...card.acceptanceCriteria] : null,
      technicalNotes: card.technicalNotes ?? null,
      estimatedEffort: card.estimatedEffort ?? null,
      assignedTo: card.assignedTo ?? null,
      dependencies: card.dependencies ? [...card.dependencies] : null,
      tags: card.tags ? [...card.tags] : null,
      agentNotes: card.agentNotes ?? null,
      position: card.position ?? 0,
      sourceApp: card.sourceApp ?? null,
      sourceCardId: card.sourceCardId ?? null,
    };
    const [created] = await db.insert(kanbanCards).values(values).returning();
    return created;
  }

  async updateCard(id: number, data: Partial<InsertKanbanCard>): Promise<KanbanCard | undefined> {
    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updateValues.title = data.title;
    if (data.type !== undefined) updateValues.type = data.type;
    if (data.status !== undefined) updateValues.status = data.status;
    if (data.priority !== undefined) updateValues.priority = data.priority;
    if (data.description !== undefined) updateValues.description = data.description;
    if (data.appTarget !== undefined) updateValues.appTarget = data.appTarget;
    if (data.acceptanceCriteria !== undefined) updateValues.acceptanceCriteria = data.acceptanceCriteria ? [...data.acceptanceCriteria] : null;
    if (data.technicalNotes !== undefined) updateValues.technicalNotes = data.technicalNotes;
    if (data.estimatedEffort !== undefined) updateValues.estimatedEffort = data.estimatedEffort;
    if (data.assignedTo !== undefined) updateValues.assignedTo = data.assignedTo;
    if (data.dependencies !== undefined) updateValues.dependencies = data.dependencies ? [...data.dependencies] : null;
    if (data.tags !== undefined) updateValues.tags = data.tags ? [...data.tags] : null;
    if (data.agentNotes !== undefined) updateValues.agentNotes = data.agentNotes;
    if (data.position !== undefined) updateValues.position = data.position;
    if (data.sourceApp !== undefined) updateValues.sourceApp = data.sourceApp;
    if (data.sourceCardId !== undefined) updateValues.sourceCardId = data.sourceCardId;

    const [updated] = await db.update(kanbanCards).set(updateValues as typeof kanbanCards.$inferInsert).where(eq(kanbanCards.id, id)).returning();
    return updated;
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await db.delete(kanbanCards).where(eq(kanbanCards.id, id)).returning();
    return result.length > 0;
  }

  async importFromKanban(rawCards: Array<Record<string, unknown>>): Promise<KanbanCard[]> {
    if (rawCards.length === 0) return [];
    const results: KanbanCard[] = [];
    for (const c of rawCards) {
      const card = await this.createCard({
        title: c.title as string,
        type: (c.type as string) || "task",
        appTarget: (c.appTarget || c.app_target || null) as string | null,
        status: (c.status as string) || "backlog",
        priority: (c.priority as string) || "medium",
        description: (c.description || null) as string | null,
        acceptanceCriteria: ((c.acceptanceCriteria || c.acceptance_criteria || null) as string[] | null),
        technicalNotes: (c.technicalNotes || c.technical_notes || null) as string | null,
        estimatedEffort: (c.estimatedEffort || c.estimated_effort || null) as string | null,
        assignedTo: (c.assignedTo || c.assigned_to || null) as string | null,
        dependencies: ((c.dependencies || null) as string[] | null),
        tags: ((c.tags || null) as string[] | null),
        agentNotes: (c.agentNotes || c.agent_notes || null) as string | null,
        position: (c.position as number) || 0,
        sourceApp: "kanban",
        sourceCardId: (c.id as number) || null,
      });
      results.push(card);
    }
    return results;
  }

  async getSubtasks(cardId: number): Promise<KanbanSubtask[]> {
    return db.select().from(kanbanSubtasks).where(eq(kanbanSubtasks.cardId, cardId));
  }
}

export const kanbanStorage = new KanbanStorage();
