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
      const KANBAI_URL = "http://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev";
      const resp = await fetch(`${KANBAI_URL}/api/kanban/spoke-config?app=metric-market`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEPLOY_SECRET_KEY}`,
        },
      });
      const data = await resp.json();
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: "Could not reach Kanbai hub for config", details: err.message });
    }
  });
}
