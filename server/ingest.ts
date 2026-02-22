import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { CHART_TYPES } from "@shared/schema";

const conductorPayloadSchema = z.object({
  payload: z.object({
    dataType: z.string().optional().default("market_compensation"),
    effectiveDate: z.string().optional(),
    marketData: z.array(z.object({
      label: z.string(),
      p10: z.number().optional(),
      p25: z.number().optional(),
      p50: z.number().optional(),
      p75: z.number().optional(),
      p90: z.number().optional(),
      employees: z.number().optional(),
      blsWage: z.number().optional(),
    })).optional(),
  }),
  periodLabel: z.string().optional(),
  effectiveAt: z.string().optional(),
});

const metricEnginePayloadSchema = z.object({
  payload: z.object({
    metricKey: z.string().min(1),
    metricName: z.string().optional(),
    value: z.number().optional(),
    unit: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    period: z.string().optional(),
    dimensions: z.record(z.unknown()).optional(),
    trend: z.object({
      periods: z.array(z.object({
        label: z.string(),
        value: z.number(),
      })).optional(),
    }).optional(),
  }),
  periodLabel: z.string().optional(),
  effectiveAt: z.string().optional(),
});

const anycompPayloadSchema = z.object({
  payload: z.object({
    scenarioId: z.string().optional(),
    scenarioName: z.string().optional(),
    scenarioComparison: z.unknown().optional(),
    recommendations: z.array(z.unknown()).optional(),
    optimizationResults: z.unknown().optional(),
  }),
  periodLabel: z.string().optional(),
  effectiveAt: z.string().optional(),
});

const peopleAnalystPayloadSchema = z.object({
  payload: z.object({
    forecastType: z.string().optional(),
    scenario: z.string().optional(),
    simulations: z.number().optional(),
    horizon: z.string().optional(),
    timeSeries: z.array(z.unknown()).optional(),
    results: z.unknown().optional(),
    assumptions: z.unknown().optional(),
    voiAnalysis: z.object({
      decisionImpact: z.string().optional(),
    }).passthrough().optional(),
  }),
  periodLabel: z.string().optional(),
  effectiveAt: z.string().optional(),
});

const METRIC_TO_CHART_MAP: Record<string, string> = {
  rate: "multi_line",
  ratio: "bullet_bar",
  count: "sparkline_rows",
  percentage: "waffle_percent",
  score: "radial_bar",
  index: "radial_bar",
  currency: "range_strip",
  duration: "strip_timeline",
  distribution: "box_whisker",
  trend: "multi_line",
  comparison: "slope_comparison",
  composition: "stacked_area",
  forecast: "confidence_band",
  test_result: "heatmap",
  z_score: "strip_dot",
  scorecard: "sparkline_rows",
  correlation: "bubble_scatter",
};

export function inferChartType(metricKey: string, unit?: string, category?: string): string {
  if (unit && METRIC_TO_CHART_MAP[unit]) return METRIC_TO_CHART_MAP[unit];
  if (category && METRIC_TO_CHART_MAP[category]) return METRIC_TO_CHART_MAP[category];
  if (unit === "%" || unit === "rate") return "multi_line";
  if (unit === "$" || unit === "currency") return "bullet_bar";
  if (metricKey.includes("ratio")) return "bullet_bar";
  if (metricKey.includes("rate")) return "multi_line";
  if (metricKey.includes("score")) return "radial_bar";
  if (metricKey.includes("count")) return "sparkline_rows";
  if (metricKey.includes("distribution")) return "box_whisker";
  return "multi_line";
}

async function findOrCreateCard(opts: {
  bundleKey: string;
  metricKey?: string;
  title: string;
  subtitle?: string;
  source: string;
  refreshPolicy?: string;
  refreshCadence?: string;
  tags?: string[];
}) {
  const bundle = await storage.getCardBundleByKey(opts.bundleKey);
  if (!bundle) return null;

  let metricDef = opts.metricKey
    ? await storage.getMetricDefinitionByKey(opts.metricKey)
    : undefined;

  const existingCards = await storage.listCards();
  const matching = existingCards.find(
    (c) => c.bundleId === bundle.id && c.title === opts.title
  );
  if (matching) return matching;

  const card = await storage.createCard({
    bundleId: bundle.id,
    metricId: metricDef?.id || null,
    title: opts.title,
    subtitle: opts.subtitle,
    sourceAttribution: opts.source,
    refreshPolicy: opts.refreshPolicy || "on_demand",
    refreshCadence: opts.refreshCadence ?? undefined,
    tags: opts.tags || [],
    status: "active",
    isPublished: true,
  });
  return card;
}

export function registerIngestRoutes(app: Express) {

  app.post("/api/ingest/conductor", async (req, res) => {
    try {
      const parsed = conductorPayloadSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      const { payload, periodLabel, effectiveAt } = parsed.data;

      const dataType = payload.dataType || "market_compensation";
      const results: any[] = [];

      if (dataType === "market_compensation" && payload.marketData) {
        const bundleKeys = ["range_strip", "range_strip_aligned", "range_target_bullet"];

        for (const bundleKey of bundleKeys) {
          const card = await findOrCreateCard({
            bundleKey,
            title: `Market Compensation — ${bundleKey.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}`,
            subtitle: `Conductor market data (${payload.effectiveDate || "latest"})`,
            source: "Conductor",
            refreshPolicy: "scheduled",
            tags: ["compensation", "market-data", "conductor"],
          });

          if (card) {
            const data = await storage.pushCardData({
              cardId: card.id,
              payload,
              periodLabel: periodLabel || `Market Data ${payload.effectiveDate || new Date().toISOString().slice(0, 7)}`,
              effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
            });
            await storage.updateCard(card.id, {
              lastRefreshedAt: new Date(),
              refreshStatus: "current",
            });
            results.push({ cardId: card.id, cardTitle: card.title, dataId: data.id, bundleKey });
          }
        }
      }

      res.status(201).json({
        source: "conductor",
        cardsUpdated: results.length,
        results,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ingest/metric-engine", async (req, res) => {
    try {
      const parsed = metricEnginePayloadSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      const { payload, periodLabel, effectiveAt } = parsed.data;

      const metricKey = payload.metricKey;
      let metricCreated = false;

      let metricDef = await storage.getMetricDefinitionByKey(metricKey);
      if (!metricDef) {
        metricCreated = true;
        metricDef = await storage.createMetricDefinition({
          key: metricKey,
          name: metricKey.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          category: payload.category || "workforce",
          unit: payload.unit,
          source: "Metric Engine Calculus",
          cadence: "monthly",
          isActive: true,
        });
      }

      const chartType = inferChartType(metricKey, payload.unit, payload.category);
      const validChartTypes = Object.values(CHART_TYPES);
      if (!validChartTypes.includes(chartType as any)) {
        return res.status(400).json({ error: `Inferred chart type '${chartType}' is not a valid chart type` });
      }
      const bundleKey = chartType;

      const card = await findOrCreateCard({
        bundleKey,
        metricKey,
        title: metricDef.name,
        subtitle: payload.description || `Computed by Metric Engine`,
        source: "Metric Engine Calculus",
        refreshPolicy: "on_demand",
        tags: ["metric-engine", payload.category || "workforce"].filter(Boolean),
      });

      if (!card) {
        return res.status(404).json({ error: `No bundle found for chart type: ${chartType}` });
      }

      const data = await storage.pushCardData({
        cardId: card.id,
        payload,
        periodLabel: periodLabel || payload.trend?.periods?.[payload.trend.periods.length - 1]?.label || new Date().toISOString().slice(0, 7),
        effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
      });

      await storage.updateCard(card.id, {
        lastRefreshedAt: new Date(),
        refreshStatus: "current",
      });

      res.status(201).json({
        source: "metric-engine",
        metricKey,
        chartType,
        cardId: card.id,
        cardTitle: card.title,
        dataId: data.id,
        metricCreated,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ingest/anycomp", async (req, res) => {
    try {
      const parsed = anycompPayloadSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      const { payload, periodLabel, effectiveAt } = parsed.data;

      const results: any[] = [];

      if (payload.scenarioComparison) {
        const compCard = await findOrCreateCard({
          bundleKey: "bullet_bar",
          title: payload.scenarioName || "Compensation Scenario Comparison",
          subtitle: `AnyComp optimization (${payload.scenarioId || "latest"})`,
          source: "AnyComp",
          refreshPolicy: "on_demand",
          tags: ["anycomp", "compensation", "scenario"],
        });
        if (compCard) {
          const data = await storage.pushCardData({
            cardId: compCard.id,
            payload: { scenarioComparison: payload.scenarioComparison, optimizationResults: payload.optimizationResults },
            periodLabel: periodLabel || `Scenario ${payload.scenarioId || "latest"}`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(compCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: compCard.id, cardTitle: compCard.title, dataId: data.id, bundleKey: "bullet_bar" });
        }
      }

      if (payload.recommendations && payload.recommendations.length > 0) {
        const recCard = await findOrCreateCard({
          bundleKey: "slope_comparison",
          title: `${payload.scenarioName || "Compensation"} — Recommendations`,
          subtitle: `Per-job adjustments from AnyComp`,
          source: "AnyComp",
          refreshPolicy: "on_demand",
          tags: ["anycomp", "compensation", "recommendations"],
        });
        if (recCard) {
          const data = await storage.pushCardData({
            cardId: recCard.id,
            payload: { recommendations: payload.recommendations },
            periodLabel: periodLabel || `Recommendations ${payload.scenarioId || "latest"}`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(recCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: recCard.id, cardTitle: recCard.title, dataId: data.id, bundleKey: "slope_comparison" });
        }
      }

      if (payload.optimizationResults) {
        const scoreCard = await findOrCreateCard({
          bundleKey: "radial_bar",
          title: `Compensation Optimization Scores`,
          subtitle: `Equity, competitiveness, retention from AnyComp`,
          source: "AnyComp",
          refreshPolicy: "on_demand",
          tags: ["anycomp", "compensation", "scores"],
        });
        if (scoreCard) {
          const data = await storage.pushCardData({
            cardId: scoreCard.id,
            payload: { optimizationResults: payload.optimizationResults },
            periodLabel: periodLabel || `Optimization ${payload.scenarioId || "latest"}`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(scoreCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: scoreCard.id, cardTitle: scoreCard.title, dataId: data.id, bundleKey: "radial_bar" });
        }
      }

      res.status(201).json({
        source: "anycomp",
        cardsUpdated: results.length,
        results,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ingest/people-analyst", async (req, res) => {
    try {
      const parsed = peopleAnalystPayloadSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      const { payload, periodLabel, effectiveAt } = parsed.data;

      const results: any[] = [];

      if (payload.timeSeries || payload.results) {
        const forecastCard = await findOrCreateCard({
          bundleKey: "people_analyst_forecasts",
          title: `${payload.forecastType?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Forecast"} — ${payload.scenario || "Base Case"}`,
          subtitle: `Monte Carlo (${payload.simulations || "N/A"} simulations, ${payload.horizon || "12m"})`,
          source: "PeopleAnalyst",
          refreshPolicy: "on_demand",
          tags: ["people-analyst", "forecast", "monte-carlo"],
        });
        if (forecastCard) {
          const data = await storage.pushCardData({
            cardId: forecastCard.id,
            payload: { timeSeries: payload.timeSeries, results: payload.results, assumptions: payload.assumptions },
            periodLabel: periodLabel || `${payload.horizon || "12m"} Forecast`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(forecastCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: forecastCard.id, cardTitle: forecastCard.title, dataId: data.id, bundleKey: "people_analyst_forecasts" });
        }
      }

      if (payload.voiAnalysis) {
        const voiCard = await findOrCreateCard({
          bundleKey: "bubble_scatter",
          title: `Value of Information — ${payload.forecastType?.replace(/_/g, " ") || "Analysis"}`,
          subtitle: `Decision impact: ${payload.voiAnalysis.decisionImpact || "unknown"}`,
          source: "PeopleAnalyst",
          refreshPolicy: "on_demand",
          tags: ["people-analyst", "voi", "decision-support"],
        });
        if (voiCard) {
          const data = await storage.pushCardData({
            cardId: voiCard.id,
            payload: { voiAnalysis: payload.voiAnalysis },
            periodLabel: periodLabel || "VOI Analysis",
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(voiCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: voiCard.id, cardTitle: voiCard.title, dataId: data.id, bundleKey: "bubble_scatter" });
        }
      }

      res.status(201).json({
        source: "people-analyst",
        cardsUpdated: results.length,
        results,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ingest/voi-calculator", async (req, res) => {
    try {
      const parsed = z.object({
        payload: z.object({
          analysisType: z.string().optional(),
          title: z.string().optional(),
          investmentName: z.string().optional(),
          roi: z.number().optional(),
          npv: z.number().optional(),
          paybackMonths: z.number().optional(),
          scenarios: z.array(z.object({
            name: z.string(),
            probability: z.number().optional(),
            value: z.number().optional(),
          })).optional(),
          sensitivityData: z.array(z.unknown()).optional(),
          timeSeriesProjection: z.array(z.unknown()).optional(),
        }),
        periodLabel: z.string().optional(),
        effectiveAt: z.string().optional(),
      }).safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      const { payload, periodLabel, effectiveAt } = parsed.data;

      const results: any[] = [];

      if (payload.scenarios && payload.scenarios.length > 0) {
        const scenarioCard = await findOrCreateCard({
          bundleKey: "bullet_bar",
          title: payload.title || `ROI Analysis — ${payload.investmentName || "Investment"}`,
          subtitle: `VOI Calculator (ROI: ${payload.roi !== undefined ? (payload.roi * 100).toFixed(1) + "%" : "N/A"})`,
          source: "VOI Calculator",
          refreshPolicy: "on_demand",
          tags: ["voi-calculator", "roi", "investment"],
        });
        if (scenarioCard) {
          const data = await storage.pushCardData({
            cardId: scenarioCard.id,
            payload: { scenarios: payload.scenarios, roi: payload.roi, npv: payload.npv, paybackMonths: payload.paybackMonths },
            periodLabel: periodLabel || `ROI ${payload.investmentName || "Analysis"}`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(scenarioCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: scenarioCard.id, cardTitle: scenarioCard.title, dataId: data.id, bundleKey: "bullet_bar" });
        }
      }

      if (payload.timeSeriesProjection) {
        const projCard = await findOrCreateCard({
          bundleKey: "confidence_band",
          title: `Investment Projection — ${payload.investmentName || "Forecast"}`,
          subtitle: `NPV: ${payload.npv !== undefined ? "$" + payload.npv.toLocaleString() : "N/A"}`,
          source: "VOI Calculator",
          refreshPolicy: "on_demand",
          tags: ["voi-calculator", "projection", "forecast"],
        });
        if (projCard) {
          const data = await storage.pushCardData({
            cardId: projCard.id,
            payload: { timeSeriesProjection: payload.timeSeriesProjection },
            periodLabel: periodLabel || `Projection ${payload.investmentName || ""}`.trim(),
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(projCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: projCard.id, cardTitle: projCard.title, dataId: data.id, bundleKey: "confidence_band" });
        }
      }

      res.status(201).json({
        source: "voi-calculator",
        cardsUpdated: results.length,
        results,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ingest/product-kanban", async (req, res) => {
    try {
      const parsed = z.object({
        payload: z.object({
          sprintName: z.string().optional(),
          velocity: z.array(z.object({
            sprint: z.string(),
            planned: z.number().optional(),
            completed: z.number().optional(),
          })).optional(),
          burndown: z.array(z.object({
            day: z.union([z.string(), z.number()]),
            remaining: z.number(),
            ideal: z.number().optional(),
          })).optional(),
          appHealth: z.array(z.object({
            app: z.string(),
            score: z.number().optional(),
            status: z.string().optional(),
            docScore: z.number().optional(),
          })).optional(),
          summary: z.object({
            totalCards: z.number().optional(),
            completed: z.number().optional(),
            inProgress: z.number().optional(),
            blocked: z.number().optional(),
          }).optional(),
        }),
        periodLabel: z.string().optional(),
        effectiveAt: z.string().optional(),
      }).safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      const { payload, periodLabel, effectiveAt } = parsed.data;

      const results: any[] = [];

      // Card #50: Development Ops bundle — 4 chart types, 6h refresh cadence
      const devOpsTags = ["product-kanban", "development-ops", "dashboard"];
      const sixHourCadence = "6h";

      if (payload.velocity) {
        const velCard = await findOrCreateCard({
          bundleKey: "multi_line",
          title: "Ecosystem Velocity",
          subtitle: `Sprint: ${payload.sprintName || "current"}`,
          source: "Product Kanban",
          refreshPolicy: "scheduled",
          refreshCadence: sixHourCadence,
          tags: [...devOpsTags, "velocity", "ecosystem-health"],
        });
        if (velCard) {
          const data = await storage.pushCardData({
            cardId: velCard.id,
            payload: { velocity: payload.velocity },
            periodLabel: periodLabel || `Sprint ${payload.sprintName || "current"}`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(velCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: velCard.id, cardTitle: velCard.title, dataId: data.id, bundleKey: "multi_line" });
        }
      }

      if (payload.appHealth) {
        const healthCard = await findOrCreateCard({
          bundleKey: "heatmap",
          title: "Ecosystem App Health",
          subtitle: `${payload.appHealth.length} apps monitored`,
          source: "Product Kanban",
          refreshPolicy: "scheduled",
          refreshCadence: sixHourCadence,
          tags: [...devOpsTags, "health", "ecosystem"],
        });
        if (healthCard) {
          const data = await storage.pushCardData({
            cardId: healthCard.id,
            payload: { appHealth: payload.appHealth },
            periodLabel: periodLabel || "Ecosystem Health",
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(healthCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: healthCard.id, cardTitle: healthCard.title, dataId: data.id, bundleKey: "heatmap" });
        }
      }

      if (payload.burndown) {
        const burnCard = await findOrCreateCard({
          bundleKey: "stacked_area",
          title: "Sprint Burndown",
          subtitle: `Sprint: ${payload.sprintName || "current"}`,
          source: "Product Kanban",
          refreshPolicy: "scheduled",
          refreshCadence: sixHourCadence,
          tags: [...devOpsTags, "burndown", "sprint"],
        });
        if (burnCard) {
          const data = await storage.pushCardData({
            cardId: burnCard.id,
            payload: { burndown: payload.burndown },
            periodLabel: periodLabel || `Burndown ${payload.sprintName || "current"}`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(burnCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: burnCard.id, cardTitle: burnCard.title, dataId: data.id, bundleKey: "stacked_area" });
        }
      }

      if (payload.summary) {
        const total = payload.summary.totalCards ?? 0;
        const completed = payload.summary.completed ?? 0;
        const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const gaugeCard = await findOrCreateCard({
          bundleKey: "radial_bar",
          title: "Sprint Health",
          subtitle: `Sprint: ${payload.sprintName || "current"} — ${completed}/${total} done`,
          source: "Product Kanban",
          refreshPolicy: "scheduled",
          refreshCadence: sixHourCadence,
          tags: [...devOpsTags, "sprint-health", "gauge"],
        });
        if (gaugeCard) {
          const data = await storage.pushCardData({
            cardId: gaugeCard.id,
            payload: {
              summary: payload.summary,
              completionPercent: completionPct,
              totalCards: total,
              completed,
              inProgress: payload.summary.inProgress ?? 0,
              blocked: payload.summary.blocked ?? 0,
            },
            periodLabel: periodLabel || `Sprint ${payload.sprintName || "current"}`,
            effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
          });
          await storage.updateCard(gaugeCard.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });
          results.push({ cardId: gaugeCard.id, cardTitle: gaugeCard.title, dataId: data.id, bundleKey: "radial_bar" });
        }
      }

      res.status(201).json({
        source: "product-kanban",
        cardsUpdated: results.length,
        results,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Card #181: Decision Wizard — decision summaries as dashboard tracking cards
  app.post("/api/ingest/decision-wizard", async (req, res) => {
    try {
      const parsed = z.object({
        payload: z.object({
          decisionId: z.string().optional(),
          decisionTitle: z.string().optional(),
          summary: z.string().optional(),
          status: z.string().optional(),
          options: z.array(z.object({
            label: z.string().optional(),
            selected: z.boolean().optional(),
            value: z.unknown().optional(),
          })).optional(),
          outcome: z.unknown().optional(),
          createdAt: z.string().optional(),
        }),
        periodLabel: z.string().optional(),
        effectiveAt: z.string().optional(),
      }).safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      const { payload, periodLabel, effectiveAt } = parsed.data;

      const card = await findOrCreateCard({
        bundleKey: "bullet_bar",
        title: payload.decisionTitle || `Decision — ${payload.decisionId || "tracking"}`,
        subtitle: payload.summary ? payload.summary.slice(0, 120) + (payload.summary.length > 120 ? "…" : "") : "Decision Wizard",
        source: "Decision Wizard",
        refreshPolicy: "on_demand",
        tags: ["decision-wizard", "tracking", "decision"],
      });
      if (!card) return res.status(404).json({ error: "No bundle found for bullet_bar" });

      const data = await storage.pushCardData({
        cardId: card.id,
        payload: {
          decisionId: payload.decisionId,
          decisionTitle: payload.decisionTitle,
          summary: payload.summary,
          status: payload.status,
          options: payload.options,
          outcome: payload.outcome,
          createdAt: payload.createdAt,
        },
        periodLabel: periodLabel || `Decision ${payload.decisionId || new Date().toISOString().slice(0, 10)}`,
        effectiveAt: effectiveAt ? new Date(effectiveAt) : new Date(),
      });
      await storage.updateCard(card.id, { lastRefreshedAt: new Date(), refreshStatus: "current" });

      res.status(201).json({
        source: "decision-wizard",
        cardId: card.id,
        cardTitle: card.title,
        dataId: data.id,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/ingest/status", async (_req, res) => {
    const allCards = await storage.listCards();
    const bySource: Record<string, number> = {};
    for (const card of allCards) {
      const src = card.sourceAttribution || "unknown";
      bySource[src] = (bySource[src] || 0) + 1;
    }
    res.json({
      totalCards: allCards.length,
      bySource,
      endpoints: [
        { path: "/api/ingest/conductor", method: "POST", status: "ready" },
        { path: "/api/ingest/metric-engine", method: "POST", status: "ready" },
        { path: "/api/ingest/anycomp", method: "POST", status: "ready" },
        { path: "/api/ingest/people-analyst", method: "POST", status: "ready" },
        { path: "/api/ingest/voi-calculator", method: "POST", status: "ready" },
        { path: "/api/ingest/product-kanban", method: "POST", status: "ready" },
        { path: "/api/ingest/decision-wizard", method: "POST", status: "ready" },
      ],
    });
  });
}
