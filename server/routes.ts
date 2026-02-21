import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertMetricDefinitionSchema,
  insertChartConfigSchema,
  insertCardSchema,
  insertCardDataSchema,
  insertCardBundleSchema,
  insertCardRelationSchema,
  CHART_TYPES,
  RELATION_TYPES,
} from "@shared/schema";
import * as hub from "./hub-client";
import { getComponentRegistry, getComponentDetail } from "./componentExport";
import { getDesignSystemSpec, getDesignSystemComponent } from "./designSystemRegistry";
import { registerIngestRoutes } from "./ingest";
import { pushToGitHub, pullFromGitHub, getSyncStatus, getGitStatus, startAutoSync, stopAutoSync, authorizeGitHubSync, detectIDE } from "./githubSync";
import { processAgentInstruction } from "./aiAgent";
import { registerKanbanRoutes } from "./kanban-routes";
// @ts-ignore - JS module
import { registerAgentRoutes } from "./kanbai-agent-runner.js";

export async function registerRoutes(app: Express): Promise<Server> {

  registerIngestRoutes(app);

  // ========================================
  // Card Bundle Discovery API for Spoke Apps
  // ========================================
  // Returns all available card bundles with dataSchema, configSchema, and outputSchema
  // Enables Spoke apps to discover and integrate metric visualization components
  app.get("/api/bundles", async (_req, res) => {
    const bundles = await storage.listCardBundles();
    res.json(bundles);
  });

  app.get("/api/bundles/:id", async (req, res) => {
    const b = await storage.getCardBundle(req.params.id);
    if (!b) return res.status(404).json({ error: "Bundle not found" });
    res.json(b);
  });

  app.get("/api/bundles/key/:key", async (req, res) => {
    const b = await storage.getCardBundleByKey(req.params.key);
    if (!b) return res.status(404).json({ error: "Bundle not found" });
    res.json(b);
  });

  app.post("/api/bundles", async (req, res) => {
    const parsed = insertCardBundleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const b = await storage.createCardBundle(parsed.data);
    res.status(201).json(b);
  });

  app.patch("/api/bundles/:id", async (req, res) => {
    const partial = insertCardBundleSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error.flatten() });
    const b = await storage.updateCardBundle(req.params.id, partial.data);
    if (!b) return res.status(404).json({ error: "Bundle not found" });
    res.json(b);
  });

  app.delete("/api/bundles/:id", async (req, res) => {
    const ok = await storage.deleteCardBundle(req.params.id);
    if (!ok) return res.status(404).json({ error: "Bundle not found" });
    res.status(204).end();
  });

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

  app.get("/api/cards/:id/full", async (req, res) => {
    const result = await storage.getCardWithLatest(req.params.id);
    if (!result) return res.status(404).json({ error: "Card not found" });
    res.json(result);
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
    await storage.updateCard(req.params.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
    res.status(201).json(d);
  });

  app.get("/api/cards/:id/drilldowns", async (req, res) => {
    const card = await storage.getCard(req.params.id);
    if (!card) return res.status(404).json({ error: "Card not found" });
    const drilldowns = await storage.getDrilldownCards(req.params.id);
    res.json(drilldowns);
  });

  app.get("/api/cards/:id/relations", async (req, res) => {
    const relations = await storage.listCardRelations(req.params.id);
    res.json(relations);
  });

  app.post("/api/card-relations", async (req, res) => {
    const parsed = insertCardRelationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (!RELATION_TYPES.includes(parsed.data.relationType as any)) {
      return res.status(400).json({ error: `Invalid relationType. Must be one of: ${RELATION_TYPES.join(", ")}` });
    }
    const sourceCard = await storage.getCard(parsed.data.sourceCardId);
    const targetCard = await storage.getCard(parsed.data.targetCardId);
    if (!sourceCard || !targetCard) {
      return res.status(400).json({ error: "Both source and target cards must exist" });
    }
    const r = await storage.createCardRelation(parsed.data);
    res.status(201).json(r);
  });

  app.delete("/api/card-relations/:id", async (req, res) => {
    const ok = await storage.deleteCardRelation(req.params.id);
    if (!ok) return res.status(404).json({ error: "Relation not found" });
    res.status(204).end();
  });

  app.get("/api/chart-types", async (_req, res) => {
    res.json(CHART_TYPES);
  });

  app.get("/api/hub/status", async (_req, res) => {
    res.json({
      configured: hub.isConfigured(),
      hubUrl: hub.HUB_URL,
      appSlug: hub.APP_SLUG,
    });
  });

  app.get("/api/hub/directives", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const directives = await hub.fetchDirectives(status);
      res.json(directives);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.patch("/api/hub/directives/:id", async (req, res) => {
    try {
      const { status, response } = req.body;
      const result = await hub.updateDirective(req.params.id, status, response);
      res.json(result);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.post("/api/hub/documentation", async (req, res) => {
    try {
      const { content, version } = req.body;
      const result = await hub.pushDocumentation(content, version);
      res.json(result);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.get("/api/hub/registry", async (_req, res) => {
    try {
      const registry = await hub.fetchRegistry();
      res.json(registry);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.get("/api/hub/architecture", async (_req, res) => {
    try {
      const arch = await hub.fetchArchitecture();
      res.json(arch);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.get("/api/components", async (req, res) => {
    const filters = {
      category: req.query.category as string | undefined,
      componentType: req.query.type as string | undefined,
      integrationTarget: req.query.target as string | undefined,
    };
    res.json(getComponentRegistry(filters));
  });

  app.get("/api/components/:key", async (req, res) => {
    const pkg = getComponentDetail(req.params.key);
    if (!pkg) return res.status(404).json({ error: "Component not found" });
    res.json(pkg);
  });

  app.get("/api/export/:key", async (req, res) => {
    const pkg = getComponentDetail(req.params.key);
    if (!pkg) return res.status(404).json({ error: "Component not found" });
    res.setHeader("Content-Disposition", `attachment; filename="${req.params.key}-export.json"`);
    res.json(pkg);
  });

  app.get("/api/design-system", async (_req, res) => {
    res.json(getDesignSystemSpec());
  });

  app.get("/api/design-system/:component", async (req, res) => {
    const comp = getDesignSystemComponent(req.params.component);
    if (!comp) return res.status(404).json({ error: "Design system component not found", available: getDesignSystemSpec().components.map((c) => c.name) });
    res.json(comp);
  });

  // --- AI Agent Endpoint ---
  app.post("/api/ai/agent", async (req, res) => {
    try {
      const { instruction, context } = req.body;
      if (!instruction) {
        return res.status(400).json({ error: "instruction is required" });
      }
      const result = await processAgentInstruction({ instruction, context });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ status: "error", result: e.message });
    }
  });

  // --- Kanban / Kanbai Integration (local spoke) ---
  registerKanbanRoutes(app);

  // --- Kanbai Agent Runner (Claude-powered task processing) ---
  registerAgentRoutes(app);

  // --- GitHub Sync API (Spoke GitHub Sync Standard v2.0) ---

  app.get("/api/github/status", async (req, res) => {
    if (!authorizeGitHubSync(req, res)) return;
    try {
      res.json(getGitStatus());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/github/sync-status", async (req, res) => {
    if (!authorizeGitHubSync(req, res)) return;
    try {
      res.json(getSyncStatus());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/github/pull", async (req, res) => {
    if (!authorizeGitHubSync(req, res)) return;
    try {
      const result = await pullFromGitHub({
        branch: req.body?.branch,
        source: req.body?.source || "manual",
        trigger: req.body?.trigger || "api",
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.stderr || err.message });
    }
  });

  app.post("/api/github/push", async (req, res) => {
    if (!authorizeGitHubSync(req, res)) return;
    try {
      const result = await pushToGitHub({
        branch: req.body?.branch,
        ide: req.body?.ide || detectIDE(),
        message: req.body?.message,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.stderr || err.message });
    }
  });

  app.post("/api/github/auto-sync/start", async (req, res) => {
    if (!authorizeGitHubSync(req, res)) return;
    startAutoSync();
    res.json({ enabled: true, ...getSyncStatus() });
  });

  app.post("/api/github/auto-sync/stop", async (req, res) => {
    if (!authorizeGitHubSync(req, res)) return;
    stopAutoSync();
    res.json({ enabled: false, ...getSyncStatus() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
