import { BUNDLE_DEFINITIONS } from "./bundleDefinitions";

const APP_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
    : "https://metric-market.replit.app";

interface IntegrationTarget {
  app: string;
  slug: string;
  role: "consumer" | "producer";
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
};

const INTEGRATION_GUIDE_RANGE_BUILDER = `# Range Builder — Integration Guide

## Overview

The Range Builder is an interactive compensation range simulation control built by Metric Market. 
It enables analysts to visually adjust pay ranges and see real-time impact on four key KPIs:
Cost Impact, Peer Equity, Competitiveness, and People Impact.

## Data Flow Architecture

\`\`\`
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Conductor   │────────►│ Metric Market │────────►│   AnyComp    │
│  (Producer)  │  Input  │ Range Builder │ Output  │  (Consumer)  │
│              │  Data   │   Control     │ Events  │              │
└──────────────┘         └──────────────┘         └──────────────┘
     │                         │                         │
     │ • HRIS snapshots        │ • Interactive UI         │ • Strategy modeling
     │ • Market surveys        │ • KPI computation        │ • Scenario comparison
     │ • Job architecture      │ • Custom level modes     │ • Executive dashboards
     │ • Field Exchange        │ • Range adjustments      │ • Budget constraints
     └─────────────────────────┘─────────────────────────┘
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
