# Metric Market + AnyComp Integration Specification

**Version:** 1.0.0
**Date:** 2026-02-12
**Audience:** Both AnyComp and Metric Market development teams / AI agents

---

## 1. Integration Overview

AnyComp is the **producer** of compensation configuration decisions and computed metrics. Metric Market is the **consumer** that renders those metrics as dashboard cards, enables cross-metric analysis, and tracks changes over time.

The integration uses Metric Market's existing **card bundle data contracts** — AnyComp pushes structured JSON payloads conforming to specific bundle `dataSchema` definitions, and Metric Market renders them with its D3-powered chart components.

```
AnyComp (Pay Structure Engine)
    │
    │  POST /api/cards/:id/data
    │  (push computed metrics as card data payloads)
    │
    ▼
Metric Market (Card Dashboard)
├─ Renders visualizations via card bundles
├─ Enables cross-metric comparison
├─ Tracks metric history over time
└─ Provides drill-down navigation between cards
```

---

## 2. Architecture: What Lives Where

### AnyComp Owns (DO NOT replicate in Metric Market)

| Capability | Why it stays in AnyComp |
|-----------|------------------------|
| Interactive pay range configuration (MRP, spread, levels, overlap) | Tightly coupled to strategy/scenario workflow |
| Real-time recalculation engine | Needs sub-second response; client-side in AnyComp |
| Job architecture management | Part of job matching / market mapping |
| HRIS + market survey data ingestion | Uses AnyComp's Field Exchange integration |
| AI-assisted configuration recommendations | Uses AnyComp's OpenAI integration |
| Pay structure configuration presets | Tied to AnyComp strategies |

### Metric Market Owns (DO NOT replicate in AnyComp)

| Capability | Why it stays in Metric Market |
|-----------|-------------------------------|
| 20 D3-powered chart types | Reusable across all spoke apps |
| Card bundle registry with data/config/output schemas | Standardized machine-readable contracts |
| Card lifecycle (draft → active → archived) | Centralized card management |
| Card scoring (importance, significance, relevance) | Cross-app metric prioritization |
| Refresh tracking (manual, scheduled, on_push) | Standardized data freshness |
| Card relations (drill-down navigation) | Cross-card, cross-app navigation |
| Dashboard consumer view | Read-only card consumption for end users |

### Shared Concerns

| Concern | AnyComp Role | Metric Market Role |
|---------|-------------|-------------------|
| Metric definitions | Computes values | Stores definitions + displays |
| Data freshness | Pushes on config change | Tracks refresh timestamps |
| Aggregation dimensions | Computes per dimension | Renders per dimension |

---

## 3. Metric Market Card Bundles for Compensation Analytics

The following maps AnyComp's computed metrics to existing and new Metric Market card bundles. AnyComp pushes data conforming to each bundle's `dataSchema`.

### 3.1 Existing Bundles AnyComp Can Use Directly

#### Box & Whisker → Compa-Ratio / Range Penetration Distribution

**Bundle key:** `box_whisker`
**Use case:** Show compa-ratio or range penetration distribution across departments, job families, or grades.

**AnyComp pushes:**
```json
{
  "data": [
    { "label": "Engineering", "min": 0.72, "q1": 0.88, "median": 1.02, "q3": 1.15, "max": 1.38 },
    { "label": "Sales", "min": 0.80, "q1": 0.92, "median": 1.00, "q3": 1.08, "max": 1.25 },
    { "label": "Operations", "min": 0.65, "q1": 0.82, "median": 0.95, "q3": 1.05, "max": 1.18 }
  ]
}
```
**Config override:** `{ "yLabel": "Compa-Ratio" }`

#### Bullet Bar → Metric vs Target Tracking

**Bundle key:** `bullet_bar`
**Use case:** Show actual metric values against targets and qualitative ranges for cost-to-market, % in range, etc.

**AnyComp pushes:**
```json
{
  "data": [
    { "label": "Cost to Market", "ranges": [500000, 1000000, 2000000], "value": 780000, "marker": 600000 },
    { "label": "% In Range", "ranges": [60, 80, 100], "value": 82, "marker": 90 },
    { "label": "Avg Compa-Ratio", "ranges": [0.8, 1.0, 1.2], "value": 0.98, "marker": 1.0 }
  ]
}
```

#### Heatmap → Pay Equity Matrix

**Bundle key:** `heatmap`
**Use case:** Cross-dimensional pay equity analysis (department × gender, grade × ethnicity, etc.)

**AnyComp pushes:**
```json
{
  "data": [[0.97, 0.94, 0.99], [0.95, 0.91, 0.98], [1.01, 0.96, 0.97]],
  "rowLabels": ["Engineering", "Sales", "Operations"],
  "colLabels": ["Gender Ratio", "Ethnicity Ratio", "Age Ratio"]
}
```

#### Sparkline Rows → Metric Summary Dashboard

**Bundle key:** `sparkline_rows`
**Use case:** Compact overview of all compensation metrics with trend history.

**AnyComp pushes:**
```json
{
  "rows": [
    { "label": "Avg Compa-Ratio", "value": "1.02", "data": [0.98, 0.99, 1.01, 1.00, 1.02] },
    { "label": "% In Range", "value": "82%", "data": [78, 79, 80, 81, 82] },
    { "label": "Cost to Market", "value": "$780K", "data": [900, 850, 820, 800, 780] },
    { "label": "Compression Ratio", "value": "0.93", "data": [0.88, 0.90, 0.91, 0.92, 0.93] },
    { "label": "Pay Equity (Gender)", "value": "0.96", "data": [0.93, 0.94, 0.95, 0.95, 0.96] }
  ]
}
```

#### Stacked Area → Quartile Distribution Over Time

**Bundle key:** `stacked_area`
**Use case:** Show how range quartile distribution shifts across configuration versions.

**AnyComp pushes:**
```json
{
  "series": [
    { "label": "Q1 (Below Min)", "values": [15, 12, 8, 5] },
    { "label": "Q2 (Min-Mid)", "values": [30, 32, 35, 38] },
    { "label": "Q3 (Mid-Max)", "values": [35, 36, 38, 40] },
    { "label": "Q4 (Above Max)", "values": [20, 20, 19, 17] }
  ],
  "xLabels": ["Config v1", "Config v2", "Config v3", "Current"]
}
```

#### Bubble Scatter → Multi-Dimensional Compensation Analysis

**Bundle key:** `bubble_scatter`
**Use case:** Plot departments by compa-ratio (x) vs retention (y) vs headcount (size).

**AnyComp pushes:**
```json
{
  "data": [
    { "x": 1.05, "y": 92, "size": 120, "label": "Engineering" },
    { "x": 0.95, "y": 78, "size": 80, "label": "Sales" },
    { "x": 1.00, "y": 88, "size": 200, "label": "Operations" }
  ]
}
```
**Config override:** `{ "xLabel": "Avg Compa-Ratio", "yLabel": "Retention Rate %" }`

#### Slope Comparison → Before/After Configuration Change

**Bundle key:** `slope_comparison`
**Use case:** Show impact of a configuration change on key metrics.

**AnyComp pushes:**
```json
{
  "items": [
    { "label": "Avg Compa-Ratio", "startValue": 1.05, "endValue": 0.87 },
    { "label": "Cost to Market ($K)", "startValue": 450, "endValue": 780 },
    { "label": "% In Range", "startValue": 78, "endValue": 85 },
    { "label": "Pay Equity Ratio", "startValue": 0.93, "endValue": 0.96 }
  ]
}
```
**Config override:** `{ "startYear": "Before", "endYear": "After" }`

### 3.2 New Card Bundles to Add to Metric Market

These bundles should be added to Metric Market's `bundleDefinitions.ts` to support compensation-specific visualizations:

#### NEW: Pay Range Bar Bundle

**Bundle key:** `pay_range_bar`
**Category:** Compensation
**Purpose:** Static/read-only version of AnyComp's interactive range bar. Shows market range, internal range, MRP position, and optional employee dots. Used in Metric Market dashboards to display the current pay structure configuration.

```typescript
{
  key: "pay_range_bar",
  chartType: "pay_range_bar",
  displayName: "Pay Range Bar Chart",
  description: "Horizontal range bar showing market percentiles, internal pay range, and Market Reference Point position.",
  version: 1,
  category: "Compensation",
  tags: ["compensation", "pay-range", "market", "structure"],
  dataSchema: {
    type: "object",
    required: ["marketRange", "internalRange", "mrpPercentile"],
    properties: {
      marketRange: {
        type: "object",
        required: ["p10", "p25", "p50", "p75", "p90"],
        properties: {
          p10: { type: "number" }, p25: { type: "number" },
          p50: { type: "number" }, p75: { type: "number" },
          p90: { type: "number" }
        }
      },
      internalRange: {
        type: "object",
        required: ["min", "midpoint", "max"],
        properties: {
          min: { type: "number" }, midpoint: { type: "number" }, max: { type: "number" }
        }
      },
      mrpPercentile: { type: "number", description: "Market Reference Point percentile (10-90)" },
      levels: {
        type: "array",
        items: {
          type: "object",
          required: ["label", "min", "midpoint", "max"],
          properties: {
            label: { type: "string" },
            min: { type: "number" }, midpoint: { type: "number" }, max: { type: "number" },
            overlapZone: {
              type: "object",
              properties: { start: { type: "number" }, end: { type: "number" } }
            }
          }
        }
      },
      employees: {
        type: "array",
        items: {
          type: "object",
          required: ["pay"],
          properties: {
            pay: { type: "number" },
            label: { type: "string" },
            group: { type: "string" }
          }
        }
      }
    }
  },
  configSchema: {
    type: "object",
    properties: {
      showDistribution: { type: "boolean" },
      showEmployees: { type: "boolean" },
      showLevels: { type: "boolean" },
      marketBarColor: { type: "string" },
      rangeColor: { type: "string" },
      overlapColor: { type: "string" },
      width: { type: "number" },
      height: { type: "number" }
    }
  },
  outputSchema: { type: "object", description: "Rendered SVG pay range bar chart" },
  defaults: {
    showDistribution: false,
    showEmployees: false,
    showLevels: false,
    marketBarColor: "#e0e4e9",
    rangeColor: "#232a31",
    overlapColor: "#0f69ff"
  },
  documentation: "Read-only visualization of a pay structure configuration. Shows the market range (10P-90P) as a background bar, the internal pay range positioned at the Market Reference Point, and optional grade levels with overlap zones. AnyComp pushes the current configuration state; Metric Market renders it for dashboard consumption."
}
```

#### NEW: Compa-Ratio Distribution Bundle

**Bundle key:** `compa_distribution`
**Category:** Compensation
**Purpose:** Histogram showing the distribution of compa-ratios across a population, with reference lines at 0.80, 1.00, and 1.20.

```typescript
{
  key: "compa_distribution",
  chartType: "compa_distribution",
  displayName: "Compa-Ratio Distribution",
  description: "Histogram of compa-ratio distribution with reference lines and quartile shading.",
  version: 1,
  category: "Compensation",
  tags: ["compensation", "compa-ratio", "distribution", "histogram"],
  dataSchema: {
    type: "object",
    required: ["buckets"],
    properties: {
      buckets: {
        type: "array",
        items: {
          type: "object",
          required: ["rangeStart", "rangeEnd", "count"],
          properties: {
            rangeStart: { type: "number" },
            rangeEnd: { type: "number" },
            count: { type: "number" },
            label: { type: "string" }
          }
        }
      },
      referenceLines: {
        type: "array",
        items: {
          type: "object",
          required: ["value", "label"],
          properties: {
            value: { type: "number" },
            label: { type: "string" },
            color: { type: "string" }
          }
        }
      },
      summary: {
        type: "object",
        properties: {
          mean: { type: "number" },
          median: { type: "number" },
          stdDev: { type: "number" },
          belowMin: { type: "number" },
          aboveMax: { type: "number" },
          inRange: { type: "number" }
        }
      }
    }
  },
  configSchema: {
    type: "object",
    properties: {
      barColor: { type: "string" },
      referenceLineColor: { type: "string" },
      xLabel: { type: "string" },
      yLabel: { type: "string" },
      width: { type: "number" },
      height: { type: "number" }
    }
  },
  outputSchema: { type: "object", description: "Rendered SVG compa-ratio distribution histogram" },
  defaults: { barColor: "#0f69ff", referenceLineColor: "#232a31" },
  documentation: "Show the distribution of compa-ratios across a population. Buckets represent ranges (e.g., 0.70-0.80, 0.80-0.90). Reference lines mark key thresholds. Summary statistics shown below."
}
```

---

## 4. Metric Definitions for Metric Market

AnyComp should register these metric definitions in Metric Market so they appear in the workbench and can be attached to cards:

```json
[
  {
    "key": "comp_avg_compa_ratio",
    "name": "Average Compa-Ratio",
    "description": "Average ratio of employee pay to range midpoint across the organization",
    "category": "Compensation",
    "unit": "ratio",
    "unitLabel": "x",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_pct_in_range",
    "name": "% In Range",
    "description": "Percentage of employees whose pay falls within their assigned pay range",
    "category": "Compensation",
    "unit": "percent",
    "unitLabel": "%",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_cost_to_market",
    "name": "Cost to Market",
    "description": "Total variance between actual employee pay and Market Reference Point values",
    "category": "Compensation",
    "unit": "currency",
    "unitLabel": "$",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_cost_to_midpoint",
    "name": "Cost to Midpoint",
    "description": "Total variance between actual employee pay and internal range midpoints",
    "category": "Compensation",
    "unit": "currency",
    "unitLabel": "$",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_cost_to_min",
    "name": "Cost to Bring to Minimum",
    "description": "Total cost to bring all below-range employees to their range minimum",
    "category": "Compensation",
    "unit": "currency",
    "unitLabel": "$",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_pay_equity_gender",
    "name": "Pay Equity Ratio (Gender)",
    "description": "Median pay ratio between gender groups, controlled for job and level",
    "category": "Pay Equity",
    "unit": "ratio",
    "unitLabel": "x",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_pay_equity_ethnicity",
    "name": "Pay Equity Ratio (Ethnicity)",
    "description": "Median pay ratio between ethnicity groups, controlled for job and level",
    "category": "Pay Equity",
    "unit": "ratio",
    "unitLabel": "x",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_compression_ratio",
    "name": "Compression Ratio",
    "description": "Ratio of minimum compa-ratio in grade N+1 to maximum compa-ratio in grade N",
    "category": "Compensation",
    "unit": "ratio",
    "unitLabel": "x",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_market_position",
    "name": "Market Position",
    "description": "Percentile position of internal midpoint within the market distribution",
    "category": "Compensation",
    "unit": "percentile",
    "unitLabel": "P",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_avg_range_penetration",
    "name": "Average Range Penetration",
    "description": "Average percentage position within pay range across all employees",
    "category": "Compensation",
    "unit": "percent",
    "unitLabel": "%",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_pct_above_range",
    "name": "% Above Range",
    "description": "Percentage of employees paid above their range maximum",
    "category": "Compensation",
    "unit": "percent",
    "unitLabel": "%",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_pct_below_range",
    "name": "% Below Range",
    "description": "Percentage of employees paid below their range minimum",
    "category": "Compensation",
    "unit": "percent",
    "unitLabel": "%",
    "source": "anycomp",
    "cadence": "on_push"
  },
  {
    "key": "comp_promotion_cost",
    "name": "Estimated Promotion Cost",
    "description": "Estimated total cost if all eligible employees promote to next grade level midpoint",
    "category": "Compensation",
    "unit": "currency",
    "unitLabel": "$",
    "source": "anycomp",
    "cadence": "on_push"
  }
]
```

---

## 5. Push Protocol

### 5.1 How AnyComp Pushes Data to Metric Market

AnyComp uses the Metric Market API to push computed metrics whenever a pay structure configuration is saved or a snapshot is taken.

**Step 1:** Discover or create cards in Metric Market

```
GET https://metric-market.replit.app/api/bundles/key/box_whisker
→ Returns bundle definition with dataSchema

POST https://metric-market.replit.app/api/cards
{
  "bundleId": "<box_whisker_bundle_id>",
  "title": "Compa-Ratio Distribution by Department",
  "subtitle": "From AnyComp Pay Structure Config: 'Engineering Focus v2'",
  "tags": ["compensation", "compa-ratio", "anycomp"],
  "sourceAttribution": "anycomp",
  "createdBy": "anycomp-auto",
  "status": "active",
  "isPublished": true,
  "refreshPolicy": "on_demand"
}
→ Returns card with ID
```

**Step 2:** Push data payloads to the card

```
POST https://metric-market.replit.app/api/cards/<card_id>/data
{
  "payload": {
    "data": [
      { "label": "Engineering", "min": 0.72, "q1": 0.88, "median": 1.02, "q3": 1.15, "max": 1.38 },
      { "label": "Sales", "min": 0.80, "q1": 0.92, "median": 1.00, "q3": 1.08, "max": 1.25 }
    ]
  },
  "periodLabel": "2026-Q1",
  "effectiveAt": "2026-02-12T00:00:00Z"
}
```

**Step 3:** Repeat for each metric/bundle combination

### 5.2 Batch Push Pattern

For efficiency, AnyComp should batch all metric pushes when a configuration is saved:

```typescript
async function pushMetricsToMetricMarket(config: PayStructureConfig, computedMetrics: ComputedMetrics) {
  const MM_URL = "https://metric-market.replit.app";
  
  const pushes = [
    {
      bundleKey: "box_whisker",
      title: `Compa-Ratio Distribution — ${config.name}`,
      payload: computedMetrics.compaRatioByDept,
    },
    {
      bundleKey: "bullet_bar",
      title: `Compensation KPIs — ${config.name}`,
      payload: computedMetrics.kpiTargets,
    },
    {
      bundleKey: "heatmap",
      title: `Pay Equity Matrix — ${config.name}`,
      payload: computedMetrics.payEquityMatrix,
    },
    {
      bundleKey: "sparkline_rows",
      title: `Compensation Metrics Summary — ${config.name}`,
      payload: computedMetrics.metricsSummary,
    },
  ];
  
  for (const push of pushes) {
    // Find or create card
    // Push data payload
    // Log to audit trail
  }
}
```

---

## 6. Card Relations (Drill-Down Navigation)

Metric Market supports card-to-card navigation via `card_relations`. AnyComp's compensation cards should be linked for logical drill-down:

```
Compensation Metrics Summary (sparkline_rows)
    │
    ├─ drilldown → Compa-Ratio Distribution (box_whisker)
    ├─ drilldown → Pay Range Bar (pay_range_bar)
    ├─ drilldown → Cost to Market KPIs (bullet_bar)
    └─ drilldown → Pay Equity Matrix (heatmap)
         │
         └─ drilldown → Pay Equity by Department (bubble_scatter)
```

These relations are created via:
```
POST https://metric-market.replit.app/api/card-relations
{
  "sourceCardId": "<summary_card_id>",
  "targetCardId": "<compa_ratio_card_id>",
  "relationType": "drilldown",
  "label": "View Compa-Ratio Distribution",
  "sortOrder": 1
}
```

---

## 7. Reusable Components from Metric Market

These Metric Market components can be imported or replicated in AnyComp for consistent UI/UX:

### 7.1 CardWrapper Component

Metric Market's `CardWrapper` dynamically renders any chart type given a bundle definition + data payload. AnyComp could use this for inline previews of how metrics will appear in Metric Market.

**Pattern:** Import the bundle definition JSON from Metric Market's API, pass it to a lightweight renderer.

### 7.2 Color Palette

Both apps should use the shared palette for consistency:
- Primary: `#0f69ff`
- Light accent: `#e0f0ff`
- Dark text: `#232a31`
- Secondary text: `#5b636a`
- Border/muted: `#e0e4e9`
- Chart greys: `#a3adb8`, `#e0e4e9`

### 7.3 Sparkline Component

Metric Market's sparkline rows component renders compact trend lines. AnyComp can use the same pattern for inline metric trends in its configuration panels.

---

## 8. Hub Integration

Both AnyComp and Metric Market are registered spokes in the People Analytics Hub. The hub can coordinate data flow between them:

1. **Hub Directive:** Hub sends a directive to AnyComp saying "push latest compensation metrics to Metric Market"
2. **AnyComp processes:** Computes metrics from latest configuration, pushes to Metric Market API
3. **AnyComp reports:** Marks directive as completed, reports metrics to hub
4. **Metric Market receives:** Card data updated, refresh timestamps set, dashboard reflects new data

This creates a fully automated pipeline:
```
Hub Directive → AnyComp Compute → Metric Market Render
```

---

## 9. Summary: Who Does What

| Task | AnyComp | Metric Market |
|------|---------|---------------|
| Accept HRIS data upload | Yes | No |
| Map HRIS fields to canonical | Yes (Field Exchange) | No |
| Accept market survey data | Yes | No |
| Interactive range configuration | Yes (build it) | No |
| Compute compa-ratio, range penetration, etc. | Yes (compute engine) | No |
| AI configuration recommendations | Yes (OpenAI) | No |
| Push computed metrics as card data | Yes (API client) | Yes (receives via API) |
| Define metric definitions | Registers in MM | Stores + displays |
| Render charts (box whisker, heatmap, etc.) | No | Yes (20 chart types) |
| Static pay range bar visualization | No | Yes (new bundle) |
| Compa-ratio histogram | No | Yes (new bundle) |
| Card lifecycle management | No | Yes |
| Card drill-down navigation | No | Yes |
| Dashboard consumption (end users) | No | Yes |
| Configuration audit trail | Yes | No |
| Metric trend tracking over time | No | Yes (historical card data) |
