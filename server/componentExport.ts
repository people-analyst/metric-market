import { BUNDLE_DEFINITIONS } from "./bundleDefinitions";

const APP_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
    : "https://metric-market.replit.app";

interface IntegrationTarget {
  app: string;
  slug: string;
  role: "consumer" | "producer" | "bidirectional";
  description: string;
  dataContract: Record<string, any>;
}

interface ComponentRegistryEntry {
  key: string;
  displayName: string;
  description: string;
  version: number;
  category: string;
  componentType: "chart" | "control";
  tags: string[];
  integrationTargets: string[];
  demoUrl: string;
  lastUpdated: string;
}

interface ExportPackage {
  manifest: {
    component: string;
    displayName: string;
    version: number;
    exportedAt: string;
    sourceApp: string;
    sourceSlug: string;
    demoUrl: string;
  };
  schemas: {
    dataSchema: Record<string, any>;
    configSchema: Record<string, any>;
    outputSchema: Record<string, any>;
  };
  defaults: Record<string, any>;
  exampleData: Record<string, any>;
  exampleConfig: Record<string, any>;
  documentation: string;
  infrastructureNotes: string;
  integrationGuide: string;
  integrationTargets: IntegrationTarget[];
  sourceFiles: string[];
}

const INTEGRATION_TARGETS: Record<string, IntegrationTarget[]> = {
  range_builder: [
    {
      app: "Conductor",
      slug: "conductor",
      role: "producer",
      description: "Supplies market benchmark data (P50/P75), employee population data, and job architecture structure that feeds Range Builder inputs.",
      dataContract: {
        description: "Conductor produces the input data for Range Builder",
        endpoint: "POST /api/cards/:id/data",
        payload: {
          rows: {
            type: "array",
            description: "One entry per job level. Conductor generates these from HRIS snapshots + job architecture.",
            itemSchema: {
              label: "string — Job level label from job architecture (e.g., 'P3', 'M2')",
              rangeMin: "number — Current range minimum from compensation structure",
              rangeMax: "number — Current range maximum from compensation structure",
              currentEmployees: "number — Headcount at this level from HRIS snapshot",
              avgCurrentPay: "number — Mean base compensation at this level from HRIS",
            },
          },
          marketData: {
            type: "array",
            description: "Market benchmark data per level. Conductor aligns from survey sources.",
            itemSchema: {
              p50: "number — Market 50th percentile (median) from survey data",
              p75: "number — Market 75th percentile from survey data",
            },
          },
        },
        fieldMappings: {
          label: { canonicalField: "job_level", source: "Job Architecture / Segmentation Studio" },
          rangeMin: { canonicalField: "salary_range_minimum", source: "Compensation Structure" },
          rangeMax: { canonicalField: "salary_range_maximum", source: "Compensation Structure" },
          currentEmployees: { canonicalField: "headcount", source: "HRIS Snapshot (Tier 1)" },
          avgCurrentPay: { canonicalField: "base_compensation", source: "HRIS Snapshot (aggregated)" },
          p50: { canonicalField: "market_p50", source: "Survey Data / Market Pricing" },
          p75: { canonicalField: "market_p75", source: "Survey Data / Market Pricing" },
        },
      },
    },
    {
      app: "AnyComp",
      slug: "anycomp",
      role: "consumer",
      description: "Consumes Range Builder outputs (adjusted ranges + KPIs) for compensation strategy modeling, scenario comparison, and executive prioritization.",
      dataContract: {
        description: "AnyComp receives the output events from Range Builder",
        eventName: "RangeBuilderChangeEvent",
        payload: {
          activeRanges: {
            type: "array",
            description: "User-adjusted compensation ranges per level",
            itemSchema: {
              label: "string — Job level label",
              min: "number — Adjusted range minimum",
              max: "number — Adjusted range maximum",
            },
          },
          kpis: {
            type: "object",
            description: "Real-time KPI calculations based on current range configuration",
            properties: {
              totalCostImpact: "number — Net dollar change in total compensation cost (positive = increase)",
              costChangePercent: "number — Percentage change in total compensation cost",
              peerEquityScore: "number — Internal equity score (0-1), measures centering within ranges",
              peerEquityChange: "number — Delta vs baseline peer equity",
              competitivenessRatio: "number — Ratio of midpoints to market P50 (1.0 = at market)",
              competitivenessChange: "number — Delta vs baseline competitiveness",
              employeesAffected: "number — Count of employees outside new range boundaries",
              totalEmployees: "number — Total headcount across all levels",
            },
          },
          kpiIndices: {
            type: "object",
            description: "0-100 goodness scores for dashboard display",
            properties: {
              costImpactIndex: "number — 0-100, higher = less cost impact (better)",
              peerEquityIndex: "number — 0-100, higher = better internal equity alignment",
              competitivenessIndex: "number — 0-100, higher = closer to market",
              peopleImpactIndex: "number — 0-100, higher = fewer affected employees",
            },
          },
        },
        integrationPatterns: [
          "Wire onChange callback to POST results to AnyComp scenario endpoint",
          "Use kpiIndices for executive dashboard scorecard display",
          "Compare multiple scenarios by storing snapshots of activeRanges + kpis",
          "Feed totalCostImpact into AnyComp budget constraint modeling",
          "Use competitivenessRatio for market positioning analysis",
        ],
      },
    },
    {
      app: "Metric Engine",
      slug: "metric-engine",
      role: "bidirectional",
      description: "Standardizes metric definitions used by Range Builder and consumes computed KPI values back into the metric definition library. Provides canonical metric schemas, thresholds, and formulas; receives real-time computed values for benchmarking and trend analysis.",
      dataContract: {
        description: "Metric Engine exchanges metric definitions and computed values with Metric Market",
        inbound: {
          description: "Metric Engine supplies standardized metric definitions to Metric Market",
          endpoint: "GET /api/metric-definitions (Metric Engine endpoint)",
          payload: {
            metricDefinitions: {
              type: "array",
              description: "Canonical metric definitions that Range Builder KPIs are based on",
              itemSchema: {
                metricKey: "string — Unique identifier (e.g., 'cost_impact', 'peer_equity', 'competitiveness', 'people_impact')",
                displayName: "string — Human-readable name for UI display",
                category: "string — Metric category (e.g., 'compensation', 'equity', 'market_positioning')",
                formula: "string — Canonical formula expression used for computation",
                unit: "string — Output unit ('currency', 'percentage', 'ratio', 'index_0_100')",
                direction: "string — 'higher_is_better' | 'lower_is_better' | 'target_is_best'",
                thresholds: {
                  critical: "number — Below this value triggers alert",
                  warning: "number — Below this value triggers caution",
                  target: "number — Ideal target value",
                },
                dataRequirements: "string[] — Required input fields (e.g., ['rangeMin', 'rangeMax', 'avgCurrentPay', 'market_p50'])",
                version: "number — Definition version for compatibility tracking",
              },
            },
          },
          fieldMappings: {
            metricKey: { canonicalField: "metric_identifier", source: "Metric Definition Library" },
            formula: { canonicalField: "metric_formula", source: "Metric Definition Library" },
            thresholds: { canonicalField: "metric_thresholds", source: "Metric Definition Library / Org Config" },
          },
        },
        outbound: {
          description: "Metric Market sends computed metric values back to Metric Engine",
          eventName: "MetricComputationEvent",
          endpoint: "POST /api/metric-values (Metric Engine endpoint)",
          payload: {
            computedMetrics: {
              type: "array",
              description: "Computed KPI values from Range Builder sessions",
              itemSchema: {
                metricKey: "string — References metric definition key",
                value: "number — Computed raw value",
                indexScore: "number — Normalized 0-100 goodness index",
                context: {
                  jobFunction: "string — Super Job Function filter applied (GTM, R&D, OPS, G&A, or 'all')",
                  levelType: "string — Level type filter applied (Professional, Manager, Executive, Support, or 'all')",
                  levelStructure: "string — 'standard' or 'custom_N' (e.g., 'custom_5')",
                  scenarioId: "string — Optional scenario identifier for multi-scenario comparison",
                },
                computedAt: "string — ISO 8601 timestamp",
              },
            },
          },
          integrationPatterns: [
            "Push computed KPI values after each Range Builder session for historical tracking",
            "Use metric definitions to validate that Range Builder formulas match canonical definitions",
            "Sync threshold updates from Metric Engine to update KPI index scoring",
            "Feed computed values into Metric Engine trend analysis and benchmarking",
            "Use Metric Engine definition versions to detect formula drift across ecosystem",
          ],
        },
      },
    },
  ],
  range_target_bullet: [
    {
      app: "AnyComp",
      slug: "anycomp",
      role: "consumer",
      description: "Displays range comparison visualization alongside Range Builder in comp modeling interface.",
      dataContract: {
        description: "AnyComp renders this chart with data derived from Range Builder + market data",
        payload: {
          rows: {
            itemSchema: {
              label: "string",
              marketMin: "number",
              marketMax: "number",
              targetMin: "number — from Range Builder activeRanges",
              targetMax: "number — from Range Builder activeRanges",
              actualMin: "number — from HRIS employee records",
              actualMax: "number — from HRIS employee records",
            },
          },
        },
      },
    },
  ],
  range_dot_plot: [
    {
      app: "AnyComp",
      slug: "anycomp",
      role: "consumer",
      description: "Renders employee position-in-range visualization for compensation analysis. Shows individual employee salaries as dots within salary band ranges by level, color-coded as below range, in range, or above range. Used alongside Range Builder to visualize the impact of range adjustments on employee positioning.",
      dataContract: {
        description: "AnyComp renders this chart using employee salary data and target/market range bands per level",
        endpoint: "POST /api/cards/:id/data",
        payload: {
          levels: {
            type: "array",
            description: "One entry per job level with salary band and employee positions",
            itemSchema: {
              level: "string — Job level label (e.g., 'P3', 'M2', 'Level 4')",
              bandMin: "number — Salary range minimum (from Range Builder activeRanges or compensation structure)",
              bandMax: "number — Salary range maximum (from Range Builder activeRanges or compensation structure)",
              employees: {
                type: "array",
                description: "Individual employee salary records at this level",
                itemSchema: {
                  id: "string — Employee identifier (anonymized or HRIS ID)",
                  salary: "number — Employee base salary from HRIS",
                  label: "string? — Optional display name for tooltip",
                },
              },
            },
          },
        },
        fieldMappings: {
          level: { canonicalField: "job_level", source: "Job Architecture / Segmentation Studio" },
          bandMin: { canonicalField: "salary_range_minimum", source: "Range Builder activeRanges or Compensation Structure" },
          bandMax: { canonicalField: "salary_range_maximum", source: "Range Builder activeRanges or Compensation Structure" },
          "employees[].id": { canonicalField: "employee_id", source: "HRIS (anonymized)" },
          "employees[].salary": { canonicalField: "base_compensation", source: "HRIS Snapshot (Tier 1)" },
        },
        integrationPatterns: [
          "Pair with Range Builder: when user adjusts ranges, update bandMin/bandMax and re-render to show how employees shift between below/in/above",
          "Filter by Job Function or Department to focus on specific populations",
          "Use alongside Range Target Bullet for complementary aggregate vs individual views",
          "Feed into equity analysis by highlighting employees needing pay adjustments",
          "Link employee dots to individual compensation detail cards for drill-down",
        ],
      },
    },
    {
      app: "Conductor",
      slug: "conductor",
      role: "producer",
      description: "Supplies employee salary records and compensation structure ranges that feed the Range Dot Plot visualization.",
      dataContract: {
        description: "Conductor produces the input data from HRIS snapshots and compensation structures",
        payload: {
          levels: {
            type: "array",
            description: "Conductor assembles levels from job architecture with employee salary data from HRIS",
            itemSchema: {
              level: "string — From job architecture",
              bandMin: "number — From compensation structure",
              bandMax: "number — From compensation structure",
              employees: "array — Individual records from HRIS snapshot with id and salary fields",
            },
          },
        },
        fieldMappings: {
          level: { canonicalField: "job_level", source: "Job Architecture" },
          bandMin: { canonicalField: "salary_range_minimum", source: "Compensation Structure" },
          bandMax: { canonicalField: "salary_range_maximum", source: "Compensation Structure" },
          "employees[].salary": { canonicalField: "base_compensation", source: "HRIS Snapshot" },
        },
      },
    },
  ],
};

const INTEGRATION_GUIDE_RANGE_BUILDER = `# Range Builder — Integration Guide

## Overview

The Range Builder is an interactive compensation range simulation control built by Metric Market. 
It enables analysts to visually adjust pay ranges and see real-time impact on four key KPIs:
Cost Impact, Peer Equity, Competitiveness, and People Impact.

## Data Flow Architecture

\`\`\`
                        ┌────────────────┐
                        │ Metric Engine  │
                        │ (Bidirectional)│
                        └──────┬───┬─────┘
              Definitions ↓   ↑ Computed Values
┌──────────────┐    ┌─────▼───┴──────┐         ┌──────────────┐
│  Conductor   │───►│  Metric Market  │────────►│   AnyComp    │
│  (Producer)  │    │  Range Builder  │ Output  │  (Consumer)  │
│              │    │    Control      │ Events  │              │
└──────────────┘    └────────────────┘         └──────────────┘
     │                      │                         │
     │ • HRIS snapshots     │ • Interactive UI         │ • Strategy modeling
     │ • Market surveys     │ • KPI computation        │ • Scenario comparison
     │ • Job architecture   │ • Custom level modes     │ • Executive dashboards
     │ • Field Exchange     │ • Range adjustments      │ • Budget constraints
\`\`\`

## Step 1: Conductor → Metric Market (Input Data)

Conductor supplies three categories of data:

### A. Job Architecture (rows)
Source: HRIS + Segmentation Studio job structure
\`\`\`json
{
  "rows": [
    {
      "label": "P3",
      "rangeMin": 110000,
      "rangeMax": 150000,
      "currentEmployees": 24,
      "avgCurrentPay": 128000
    }
  ]
}
\`\`\`

### B. Market Benchmarks (marketData)
Source: Compensation survey data, market pricing tools
\`\`\`json
{
  "marketData": [
    { "p50": 130000, "p75": 148000 }
  ]
}
\`\`\`

### C. Field Mappings
Use the Field Exchange SDK to map Conductor's internal field names to Metric Market's expected schema:

| Metric Market Field | Canonical Field | Typical HRIS Source |
|---|---|---|
| label | job_level | Job Architecture |
| rangeMin | salary_range_minimum | Compensation Structure |
| rangeMax | salary_range_maximum | Compensation Structure |
| currentEmployees | headcount | HRIS Snapshot (Tier 1) |
| avgCurrentPay | base_compensation | HRIS Snapshot (aggregated) |
| p50 | market_p50 | Survey Data |
| p75 | market_p75 | Survey Data |

### Push Data via API
\`\`\`bash
POST /api/cards/:cardId/data
Content-Type: application/json
X-API-Key: {HUB_API_KEY}

{
  "payload": {
    "rows": [...],
    "marketData": [...]
  }
}
\`\`\`

## Step 2: Metric Market → AnyComp (Output Events)

When a user adjusts ranges, the Range Builder emits a \`RangeBuilderChangeEvent\`:

\`\`\`json
{
  "activeRanges": [
    { "label": "P3", "min": 105000, "max": 155000 }
  ],
  "kpis": {
    "totalCostImpact": 45000,
    "costChangePercent": 1.2,
    "peerEquityScore": 0.82,
    "peerEquityChange": 0.05,
    "competitivenessRatio": 1.03,
    "competitivenessChange": 0.02,
    "employeesAffected": 3,
    "totalEmployees": 60
  }
}
\`\`\`

### KPI Index Scores (0-100)
For executive dashboard display, each KPI has a normalized 0-100 "goodness" index:

| KPI | Index Formula | Perfect Score |
|---|---|---|
| Cost Impact | \`max(0, 100 - abs(costChange%) * 10)\` | 100 = zero cost change |
| Peer Equity | \`peerEquityScore * 100\` | 100 = perfectly centered |
| Competitiveness | \`100 - abs(ratio - 1.0) * 200\` | 100 = exactly at market |
| People Impact | \`(1 - affected/total) * 100\` | 100 = no employees affected |

### Integration Patterns for AnyComp

1. **Scenario Comparison**: Store snapshots of activeRanges + kpis per scenario
2. **Budget Modeling**: Feed totalCostImpact into budget constraint calculations
3. **Executive Prioritization**: Use kpiIndices in weighted scoring for comp strategy decisions
4. **100 Pennies**: Map kpiIndices to penny allocation weights
5. **VOI Analysis**: Use KPI deltas to estimate Value of Information for comp research

## Step 2b: Metric Engine ↔ Metric Market (Definition Standardization)

Metric Engine serves as the canonical source for metric definitions across the People Analytics Toolbox ecosystem. 
It provides standardized schemas, formulas, thresholds, and versioning — and receives computed values back.

### Inbound: Metric Definitions → Range Builder
Metric Engine supplies the canonical definitions that Range Builder KPIs are built on:

\`\`\`json
{
  "metricDefinitions": [
    {
      "metricKey": "cost_impact",
      "displayName": "Cost Impact",
      "category": "compensation",
      "formula": "sum(max(0, newRangeMin - currentPay) * employees)",
      "unit": "currency",
      "direction": "lower_is_better",
      "thresholds": { "critical": 500000, "warning": 100000, "target": 0 },
      "dataRequirements": ["rangeMin", "rangeMax", "avgCurrentPay", "currentEmployees"],
      "version": 2
    },
    {
      "metricKey": "peer_equity",
      "displayName": "Peer Equity",
      "category": "equity",
      "formula": "1 - avg(abs(currentPay - midpoint) / (rangeMax - rangeMin))",
      "unit": "ratio",
      "direction": "higher_is_better",
      "thresholds": { "critical": 0.5, "warning": 0.7, "target": 0.9 },
      "dataRequirements": ["rangeMin", "rangeMax", "avgCurrentPay"],
      "version": 2
    }
  ]
}
\`\`\`

### Outbound: Computed Values → Metric Engine
After each Range Builder adjustment, computed metric values are sent back:

\`\`\`json
{
  "computedMetrics": [
    {
      "metricKey": "cost_impact",
      "value": 45000,
      "indexScore": 88,
      "context": {
        "jobFunction": "R&D",
        "levelType": "Professional",
        "levelStructure": "standard",
        "scenarioId": "scenario_q2_2026"
      },
      "computedAt": "2026-02-14T15:30:00Z"
    }
  ]
}
\`\`\`

### Integration Patterns for Metric Engine

1. **Definition Sync**: Pull metric definitions on Range Builder initialization to ensure formula consistency
2. **Version Tracking**: Compare local formula versions vs Metric Engine versions to detect drift
3. **Threshold Updates**: Metric Engine threshold changes propagate to KPI index scoring in Range Builder
4. **Historical Benchmarks**: Computed values feed Metric Engine trend analysis across all spoke apps
5. **Cross-App Standardization**: Same metric definitions used by AnyComp, Conductor, and other spokes

## Step 3: Custom Level Structure

The Range Builder supports two level structure modes:

- **Standard**: Uses market-defined levels (P1-P6, M1-M6, etc.)
- **Custom (2-10)**: Partitions the overall compensation range into N evenly-spaced levels

When using Custom mode, the data contract remains the same — rows[] and marketData[] are 
generated client-side from the source data. AnyComp receives the same output format regardless 
of which level structure mode was used.

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /api/components | Component registry (discover available components) |
| GET | /api/components/:key | Full component metadata + schemas |
| GET | /api/export/:key | Export package with schemas, docs, integration guide |
| POST | /api/cards/:id/data | Push data payload (Conductor → Metric Market) |
| GET | /api/bundles/key/:key | Get bundle definition with schemas |
| GET | /api/metric-definitions | Pull metric definitions (Metric Engine → Metric Market) |
| POST | /api/metric-values | Push computed values (Metric Market → Metric Engine) |

## Demo

Live demo: {APP_URL}/range-builder
`;

const SOURCE_FILES: Record<string, string[]> = {
  range_builder: [
    "client/src/components/controls/RangeBuilderControl.tsx",
    "client/src/pages/RangeBuilderPage.tsx",
  ],
  range_target_bullet: [
    "client/src/components/charts/RangeTargetBulletChart.tsx",
  ],
};

export function getComponentRegistry(filters?: {
  category?: string;
  componentType?: string;
  integrationTarget?: string;
}): ComponentRegistryEntry[] {
  const controlKeys = ["range_builder"];

  let entries = BUNDLE_DEFINITIONS.map((b) => ({
    key: b.key,
    displayName: b.displayName,
    description: b.description || "",
    version: b.version ?? 1,
    category: b.category || "Uncategorized",
    componentType: (controlKeys.includes(b.key) ? "control" : "chart") as "chart" | "control",
    tags: b.tags || [],
    integrationTargets: (INTEGRATION_TARGETS[b.key] || []).map((t) => t.slug),
    demoUrl: b.key === "range_builder" ? `${APP_URL}/range-builder` : `${APP_URL}/dashboard`,
    lastUpdated: new Date().toISOString().split("T")[0],
  }));

  if (filters?.category) {
    entries = entries.filter((e) => e.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.componentType) {
    entries = entries.filter((e) => e.componentType === filters.componentType);
  }
  if (filters?.integrationTarget) {
    entries = entries.filter((e) => e.integrationTargets.includes(filters.integrationTarget!));
  }

  return entries;
}

export function getComponentDetail(key: string): ExportPackage | null {
  const bundle = BUNDLE_DEFINITIONS.find((b) => b.key === key);
  if (!bundle) return null;

  const targets = INTEGRATION_TARGETS[key] || [];
  const guide = key === "range_builder"
    ? INTEGRATION_GUIDE_RANGE_BUILDER.replace("{APP_URL}", APP_URL)
    : generateGenericGuide(bundle);

  return {
    manifest: {
      component: key,
      displayName: bundle.displayName,
      version: bundle.version ?? 1,
      exportedAt: new Date().toISOString(),
      sourceApp: "Metric Market",
      sourceSlug: "metric-market",
      demoUrl: key === "range_builder" ? `${APP_URL}/range-builder` : `${APP_URL}/dashboard`,
    },
    schemas: {
      dataSchema: bundle.dataSchema as Record<string, any>,
      configSchema: bundle.configSchema as Record<string, any>,
      outputSchema: bundle.outputSchema as Record<string, any>,
    },
    defaults: bundle.defaults as Record<string, any>,
    exampleData: bundle.exampleData as Record<string, any>,
    exampleConfig: bundle.exampleConfig as Record<string, any>,
    documentation: bundle.documentation || "",
    infrastructureNotes: bundle.infrastructureNotes || "",
    integrationGuide: guide,
    integrationTargets: targets,
    sourceFiles: SOURCE_FILES[key] || [],
  };
}

function generateGenericGuide(bundle: any): string {
  return `# ${bundle.displayName} — Integration Guide

## Overview
${bundle.description || ""}

## Data Schema
Push data conforming to the dataSchema via:
\`\`\`
POST /api/cards/:cardId/data
{ "payload": { ... } }
\`\`\`

## Configuration
Apply configuration options via the configSchema when creating a chart config.

## Documentation
${bundle.documentation || "See bundle definition for details."}

## Demo
Live demo available at the Metric Market dashboard.
`;
}
