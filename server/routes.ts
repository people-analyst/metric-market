import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertMetricDefinitionSchema,
  insertChartConfigSchema,
  insertCardSchema,
  insertCardDataSchema,
  CHART_TYPES,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  app.get("/api/metric-definitions", async (_req, res) => {
    const metrics = await storage.listMetricDefinitions();
    res.json(metrics);
  });

  app.get("/api/metric-definitions/:id", async (req, res) => {
    const m = await storage.getMetricDefinition(req.params.id);
    if (!m) return res.status(404).json({ error: "Metric not found" });
    res.json(m);
  });

  app.post("/api/metric-definitions", async (req, res) => {
    const parsed = insertMetricDefinitionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const m = await storage.createMetricDefinition(parsed.data);
    res.status(201).json(m);
  });

  app.patch("/api/metric-definitions/:id", async (req, res) => {
    const partial = insertMetricDefinitionSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const m = await storage.updateMetricDefinition(req.params.id, partial.data);
    if (!m) return res.status(404).json({ error: "Metric not found" });
    res.json(m);
  });

  app.delete("/api/metric-definitions/:id", async (req, res) => {
    const ok = await storage.deleteMetricDefinition(req.params.id);
    if (!ok) return res.status(404).json({ error: "Metric not found" });
    res.status(204).end();
  });

  app.get("/api/chart-configs", async (_req, res) => {
    const configs = await storage.listChartConfigs();
    res.json(configs);
  });

  app.get("/api/chart-configs/:id", async (req, res) => {
    const c = await storage.getChartConfig(req.params.id);
    if (!c) return res.status(404).json({ error: "Chart config not found" });
    res.json(c);
  });

  app.post("/api/chart-configs", async (req, res) => {
    const parsed = insertChartConfigSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (!CHART_TYPES.includes(parsed.data.chartType as any)) {
      return res.status(400).json({ error: `Invalid chartType. Must be one of: ${CHART_TYPES.join(", ")}` });
    }
    const c = await storage.createChartConfig(parsed.data);
    res.status(201).json(c);
  });

  app.patch("/api/chart-configs/:id", async (req, res) => {
    const partial = insertChartConfigSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    if (partial.data.chartType && !CHART_TYPES.includes(partial.data.chartType as any)) {
      return res.status(400).json({ error: `Invalid chartType. Must be one of: ${CHART_TYPES.join(", ")}` });
    }
    const c = await storage.updateChartConfig(req.params.id, partial.data);
    if (!c) return res.status(404).json({ error: "Chart config not found" });
    res.json(c);
  });

  app.delete("/api/chart-configs/:id", async (req, res) => {
    const ok = await storage.deleteChartConfig(req.params.id);
    if (!ok) return res.status(404).json({ error: "Chart config not found" });
    res.status(204).end();
  });

  app.get("/api/cards", async (_req, res) => {
    const list = await storage.listCards();
    res.json(list);
  });

  app.get("/api/cards/:id", async (req, res) => {
    const c = await storage.getCard(req.params.id);
    if (!c) return res.status(404).json({ error: "Card not found" });
    res.json(c);
  });

  app.post("/api/cards", async (req, res) => {
    const parsed = insertCardSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const c = await storage.createCard(parsed.data);
    res.status(201).json(c);
  });

  app.patch("/api/cards/:id", async (req, res) => {
    const partial = insertCardSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const c = await storage.updateCard(req.params.id, partial.data);
    if (!c) return res.status(404).json({ error: "Card not found" });
    res.json(c);
  });

  app.delete("/api/cards/:id", async (req, res) => {
    const ok = await storage.deleteCard(req.params.id);
    if (!ok) return res.status(404).json({ error: "Card not found" });
    res.status(204).end();
  });

  app.get("/api/cards/:id/data", async (req, res) => {
    const data = await storage.listCardData(req.params.id);
    res.json(data);
  });

  app.get("/api/cards/:id/data/latest", async (req, res) => {
    const d = await storage.getLatestCardData(req.params.id);
    if (!d) return res.status(404).json({ error: "No data for this card" });
    res.json(d);
  });

  app.post("/api/cards/:id/data", async (req, res) => {
    const card = await storage.getCard(req.params.id);
    if (!card) return res.status(404).json({ error: "Card not found" });
    const parsed = insertCardDataSchema.safeParse({ ...req.body, cardId: req.params.id });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const d = await storage.pushCardData(parsed.data);
    res.status(201).json(d);
  });

  app.get("/api/chart-types", async (_req, res) => {
    res.json(CHART_TYPES);
  });

  const httpServer = createServer(app);
  return httpServer;
}
