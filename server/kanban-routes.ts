import type { Express } from "express";
import { kanbanStorage } from "./kanban-storage";
import { insertKanbanCardSchema, updateKanbanCardSchema } from "@shared/schema";
import { z } from "zod";

const importSchema = z.object({
  cards: z.array(z.object({
    title: z.string(),
    type: z.string().optional(),
    appTarget: z.string().nullable().optional(),
    app_target: z.string().nullable().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    description: z.string().nullable().optional(),
    acceptanceCriteria: z.array(z.string()).nullable().optional(),
    acceptance_criteria: z.array(z.string()).nullable().optional(),
    technicalNotes: z.string().nullable().optional(),
    technical_notes: z.string().nullable().optional(),
    estimatedEffort: z.string().nullable().optional(),
    estimated_effort: z.string().nullable().optional(),
    assignedTo: z.string().nullable().optional(),
    assigned_to: z.string().nullable().optional(),
    dependencies: z.array(z.string()).nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    agentNotes: z.string().nullable().optional(),
    agent_notes: z.string().nullable().optional(),
    position: z.number().optional(),
    id: z.number().optional(),
  })),
});

export function registerKanbanRoutes(app: Express) {
  app.get("/api/kanban/cards", async (req, res) => {
    try {
      const filters: { appTarget?: string; status?: string } = {};
      if (req.query.app) filters.appTarget = req.query.app as string;
      if (req.query.status) filters.status = req.query.status as string;
      const cards = await kanbanStorage.getCards(Object.keys(filters).length ? filters : undefined);
      res.json(cards);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/kanban/cards/:id", async (req, res) => {
    try {
      const card = await kanbanStorage.getCard(parseInt(req.params.id));
      if (!card) return res.status(404).json({ error: "Card not found" });
      res.json(card);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/kanban/cards", async (req, res) => {
    try {
      const parsed = insertKanbanCardSchema.parse(req.body);
      const card = await kanbanStorage.createCard(parsed);
      res.status(201).json(card);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: e.errors });
      }
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/kanban/cards/:id", async (req, res) => {
    try {
      const parsed = updateKanbanCardSchema.parse(req.body);
      const card = await kanbanStorage.updateCard(parseInt(req.params.id), parsed);
      if (!card) return res.status(404).json({ error: "Card not found" });
      res.json(card);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: e.errors });
      }
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/kanban/cards/:id", async (req, res) => {
    try {
      const deleted = await kanbanStorage.deleteCard(parseInt(req.params.id));
      if (!deleted) return res.status(404).json({ error: "Card not found" });
      res.json({ message: "Deleted" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/kanban/import", async (req, res) => {
    try {
      const { cards } = importSchema.parse(req.body);
      const created = await kanbanStorage.importFromKanban(cards);
      res.status(201).json({ imported: created.length, cards: created });
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: e.errors });
      }
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/kanban/export", async (_req, res) => {
    try {
      const cards = await kanbanStorage.getCards();
      res.json({ exportedAt: new Date().toISOString(), cards });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/kanbai/cards", async (req, res) => {
    try {
      const filters: { appTarget?: string; status?: string } = {};
      if (req.query.source) filters.appTarget = req.query.source as string;
      if (req.query.status) filters.status = req.query.status as string;
      const cards = await kanbanStorage.getCards(Object.keys(filters).length ? filters : undefined);
      res.json(cards);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/kanbai/cards", async (req, res) => {
    try {
      const body = z.object({ title: z.string(), description: z.string().optional(), priority: z.string().optional() }).parse(req.body);
      const card = await kanbanStorage.createCard({
        title: body.title,
        description: body.description || null,
        priority: body.priority || "medium",
        type: "task",
        status: "backlog",
      });
      res.status(201).json(card);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: e.errors });
      }
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/kanbai/cards/:id", async (req, res) => {
    try {
      const parsed = updateKanbanCardSchema.parse(req.body);
      const card = await kanbanStorage.updateCard(parseInt(req.params.id), parsed);
      if (!card) return res.status(404).json({ error: "Card not found" });
      res.json(card);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: e.errors });
      }
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/kanban/spoke-config", async (_req, res) => {
    try {
      const kanbaiUrl = process.env.KANBAI_HUB_URL || "https://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev";
      const authToken = process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY || "";
      const resp = await fetch(`${kanbaiUrl}/api/kanban/spoke-config?app=metric-market`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });
      const data = await resp.json();
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: "Could not reach Kanbai hub for config", details: err.message });
    }
  });

  const BOARD_COLUMNS = ["backlog", "todo", "in_progress", "in_review", "done"] as const;

  function authorizeBearerKey(req: any, res: any): boolean {
    const key = process.env.DEPLOY_SECRET_KEY;
    if (!key) { res.status(500).json({ error: "DEPLOY_SECRET_KEY not configured" }); return false; }
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${key}`) {
      res.status(401).json({ error: "Unauthorized" });
      return false;
    }
    return true;
  }

  app.get("/api/pull/board/:slug", async (req, res) => {
    if (!authorizeBearerKey(req, res)) return;
    try {
      const slug = req.params.slug;
      const cards = await kanbanStorage.getCards(
        slug === "all" ? undefined : { appTarget: slug }
      );
      const columns: Record<string, Array<{
        id: number;
        title: string;
        status: string;
        priority: string;
        sourceCardId: number | null;
        tags: string[] | null;
        type: string;
        assignedTo: string | null;
        updatedAt: Date | null;
      }>> = {};
      for (const col of BOARD_COLUMNS) columns[col] = [];
      for (const card of cards) {
        const col = BOARD_COLUMNS.includes(card.status as any) ? card.status : "backlog";
        columns[col].push({
          id: card.id,
          title: card.title,
          status: card.status,
          priority: card.priority,
          sourceCardId: card.sourceCardId,
          tags: card.tags,
          type: card.type,
          assignedTo: card.assignedTo,
          updatedAt: card.updatedAt,
        });
      }
      res.json({
        slug,
        columns,
        totalCards: cards.length,
        generatedAt: new Date().toISOString(),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/receive-cards", async (req, res) => {
    if (!authorizeBearerKey(req, res)) return;
    try {
      const body = req.body;
      const incoming = Array.isArray(body.cards) ? body.cards : Array.isArray(body) ? body : [body];
      const results: Array<{ id: number; title: string; action: string }> = [];
      for (const c of incoming) {
        const title = c.title?.trim();
        if (!title) continue;
        const existing = (await kanbanStorage.getCards()).find(
          (e) => e.sourceCardId === c.id || e.title === title
        );
        if (existing) {
          const updates: Record<string, unknown> = {};
          if (c.status && c.status !== existing.status) updates.status = c.status;
          if (c.priority && c.priority !== existing.priority) updates.priority = c.priority;
          if (c.description && c.description !== existing.description) updates.description = c.description;
          if (c.assignedTo !== undefined) updates.assignedTo = c.assignedTo;
          if (Object.keys(updates).length > 0) {
            await kanbanStorage.updateCard(existing.id, updates as any);
            results.push({ id: existing.id, title, action: "updated" });
          } else {
            results.push({ id: existing.id, title, action: "unchanged" });
          }
        } else {
          const created = await kanbanStorage.createCard({
            title,
            type: c.type || "task",
            appTarget: c.appTarget || c.app_target || "metric-market",
            status: c.status || "backlog",
            priority: c.priority || "medium",
            description: c.description || null,
            tags: c.tags || null,
            sourceApp: c.sourceApp || c.source || "kanbai",
            sourceCardId: c.id || null,
          });
          results.push({ id: created.id, title, action: "created" });
        }
      }
      res.status(201).json({
        received: incoming.length,
        processed: results.length,
        results,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}
