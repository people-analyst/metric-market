# Range Builder — Developer & Integration Guide

> **Application:** Metric Market (People Analytics Toolbox)
> **File location:** `RANGE_BUILDER_DEVELOPER_GUIDE.md` at project root
> **Last updated:** February 2026
> **GitHub:** [people-analyst/metric-market](https://github.com/people-analyst/metric-market)

---

## Table of Contents

1. [Purpose & Vision](#purpose--vision)
2. [Ecosystem Context](#ecosystem-context)
3. [What Exists Today](#what-exists-today)
4. [Component Architecture](#component-architecture)
5. [Job Structure Data Model](#job-structure-data-model)
6. [Data Flow & Reactivity](#data-flow--reactivity)
7. [KPI System](#kpi-system)
8. [Cross-Application Integration](#cross-application-integration)
9. [Data Contracts & Schemas](#data-contracts--schemas)
10. [Component Export System](#component-export-system)
11. [Design System](#design-system)
12. [File Map](#file-map)
13. [Ecosystem Repository Reference](#ecosystem-repository-reference)
14. [Instructions for Communicating Back](#instructions-for-communicating-back)

---

## Purpose & Vision

The Range Builder is an interactive **compensation range simulation tool** within the People Analytics Toolbox ("Metric Market") ecosystem. It enables compensation analysts to model target pay ranges across a job architecture, visualize how those ranges relate to market data and actual employee pay, and immediately see the downstream impact on cost, peer equity (internal equity), competitiveness, and structural health metrics.

The core interaction paradigm: a user selects a slice of the job architecture (by Super Job Function and Level Type), then clicks individual boxes on a segmented strip to extend or shrink target ranges for each level. Every click triggers a real-time recalculation of KPIs and statistics across all connected data sources.

**Key design principle:** This is not a chart — it is a **Form Control** that produces output signals. In the card bundle taxonomy, it is registered as component type `range_builder` under the `CONTROL_TYPES` category (as opposed to `CHART_TYPES` which are read-only visualizations).

---

## Ecosystem Context

Metric Market operates as a **spoke application** within the People Analytics Toolbox hub-and-spoke ecosystem. The Range Builder is one of its most integration-rich components, with formal data contracts linking it to three other applications.

```
                         ┌────────────────┐
                         │ Metric Engine  │
                         │ (Bidirectional)│
                         └──────┬───┬─────┘
               Definitions ↓   ↑ Computed Values
┌──────────────┐    ┌──────▼───┴──────┐         ┌──────────────┐
│  Conductor   │───►│  Metric Market   │────────►│   AnyComp    │
│  (Producer)  │    │  Range Builder   │ Output  │  (Consumer)  │
│              │    │    Control       │ Events  │              │
└──────────────┘    └─────────────────┘         └──────────────┘
```

| Application | Role | What It Does | GitHub |
|---|---|---|---|
| **Conductor** | Input Producer | Supplies market benchmark data (P50/P75), employee population data, job architecture, and field mediation | [people-analyst/conductor](https://github.com/people-analyst/conductor) |
| **Metric Market** | Processor / UI | Interactive range simulation, KPI computation, visualization | [people-analyst/metric-market](https://github.com/people-analyst/metric-market) |
| **AnyComp** | Output Consumer | Consumes adjusted ranges + KPIs for compensation strategy modeling, scenario comparison, executive dashboards | [people-analyst/anycomp](https://github.com/people-analyst/anycomp) |
| **Metric Engine** | Bidirectional | Supplies canonical metric definitions; receives computed KPI values for benchmarking and trend analysis | [people-analyst/metric-engine-calculus](https://github.com/people-analyst/metric-engine-calculus) |

### Supporting Ecosystem Applications

These applications interact indirectly with Range Builder through shared data pipelines and the Hub:

| Application | Relationship to Range Builder | GitHub |
|---|---|---|
| **Segmentation Studio** | Provides HRIS data onboarding and canonical field normalization that feeds employee population data into Conductor | [people-analyst/segmentation-studio](https://github.com/people-analyst/segmentation-studio) |
| **People Analytics Toolbox (Hub)** | Central registry and spoke coordinator — manages webhook routing, directive processing, and documentation between all applications | [people-analyst/people-analytics-toolbox](https://github.com/people-analyst/people-analytics-toolbox) |
| **Data Anonymizer** | Cross-cutting privacy layer — anonymizes PII in employee compensation data before it reaches Range Builder | [people-analyst/data-anonymizer](https://github.com/people-analyst/data-anonymizer) |
| **VOI Calculator** | Uses KPI deltas from Range Builder to estimate Value of Information for compensation research decisions | [people-analyst/voi-calculator](https://github.com/people-analyst/voi-calculator) |
| **Decision Wizard** | Structured decision-making (Kepner-Tregoe) — can consume Range Builder KPI indices as decision criteria scores | [people-analyst/decision-wizard](https://github.com/people-analyst/decision-wizard) |
| **Kanban** | Central work tracker — manages development cards and deployment packages across all ecosystem applications | [people-analyst/kanban](https://github.com/people-analyst/kanban) |

---

## What Exists Today

### Page: `/range-builder`
**File:** `client/src/pages/RangeBuilderPage.tsx`

The page composes four visual sections (each in a `<Card>`):

1. **Filter Controls** — Super Job Function (R&D, GTM, OPS, G&A) and Level Type (Professional, Manager, Executive, Support) toggle buttons
2. **Range Builder Control** — The interactive segmented strip where users click boxes to define target ranges, plus 4 real-time KPI cards
3. **Target Range Analysis (Bullet Chart)** — A layered bar chart showing market range, target range, and actual employee pay extremes per level
4. **Target Range Statistics Table** — Computed structural metrics: Spread %, Min Overlap %, Max Overlap %, Level Below %, Level Above %, Promo Opp %

All four sections react to the same state — changing a filter or clicking a box updates everything in real time.

---

## Component Architecture

### 1. RangeBuilderControl (Form Control)
**File:** `client/src/components/controls/RangeBuilderControl.tsx`
**Type:** Interactive form control with output signals
**Bundle Key:** `range_builder` (registered in `CONTROL_TYPES`)

**What it does:**
- Renders a horizontal segmented strip for each level in the job structure
- Each strip is divided into clickable boxes, where each box represents a dollar increment (the "step size")
- Blue boxes = active (included in the target range); grey boxes = inactive
- Clicking a box toggles it on/off, extending or shrinking the target range
- Above the strips, 4 KPI cards show real-time impact metrics

**Props (interface `RangeBuilderControlProps`):**
```typescript
interface RangeBuilderControlProps {
  rows: RangeBuilderRow[];          // Level data (label, rangeMin, rangeMax, currentEmployees, avgCurrentPay)
  stepSize?: number;                // Dollar increment per box (default: 10000)
  scaleMin?: number;                // Left edge of the strip in dollars
  scaleMax?: number;                // Right edge of the strip in dollars
  activeColor?: string;             // Color for active boxes (default: "#0f69ff")
  inactiveColor?: string;           // Color for inactive boxes (default: "#e0e4e9")
  segmentHeight?: number;           // Pixel height of each box (default: 24)
  gap?: number;                     // Pixel gap between boxes (default: 2)
  showLabels?: boolean;             // Show level labels on left (default: true)
  showScale?: boolean;              // Show dollar scale above strips (default: true)
  labelWidth?: number;              // Pixel width for label column
  formatValue?: (v: number) => string;  // Dollar formatter
  marketData?: { p50: number; p75: number }[];  // Market reference data per level
  onChange?: (event: RangeBuilderChangeEvent) => void;  // Callback on any change
  autoRecalculate?: boolean;        // Recalculate KPIs on every click (default: true)
}
```

**Output signal (interface `RangeBuilderChangeEvent`):**
```typescript
interface RangeBuilderChangeEvent {
  activeRanges: { label: string; min: number; max: number }[];
  kpis: RangeBuilderKPIs;
  kpiIndices: {
    costImpactIndex: number;      // 0-100 goodness score
    peerEquityIndex: number;      // 0-100 goodness score
    competitivenessIndex: number; // 0-100 goodness score
    peopleImpactIndex: number;    // 0-100 goodness score
  };
}
```

**KPIs computed (interface `RangeBuilderKPIs`):**
```typescript
interface RangeBuilderKPIs {
  totalCostImpact: number;          // Dollar cost change from baseline
  costChangePercent: number;        // % change in annual cost
  peerEquityScore: number;          // 0-1 score (deviation of avg pay from range midpoint)
  peerEquityChange: number;         // Change from baseline peer equity
  competitivenessRatio: number;     // Range midpoint / market P50
  competitivenessChange: number;    // Change from baseline competitiveness
  employeesAffected: number;        // Employees whose pay falls outside new range
  totalEmployees: number;           // Total employee count
}
```

**Terminology note:** "Peer Equity" (also called Internal Equity) measures how well employees at the same level are centered within their pay range. This is explicitly distinct from Gender Pay Equity, Ethnic Pay Equity, or other protected-status equity metrics, which are separate legal constructs with their own defined calculations. Those will be added to the environment separately.

**Granularity toggle:** The page provides a step size selector ($2.5K, $5K, $10K, $15K, $20K) that controls how large each clickable box is. Default is $10K. Changing the step size resets the control and re-initializes box states from the underlying range data.

**Custom Level Structure:** The page includes a Level Structure selector that allows the user to choose between:
- **Standard** — uses the market-defined levels exactly as they exist in the source data (e.g., P1-P6, M1-M6)
- **Custom (2-10)** — partitions the overall compensation range into N evenly-spaced levels with ~15% overlap between adjacent levels

When a custom count is selected:
1. The system finds the overall floor (lowest market P50 minus spread) and ceiling (highest market P75) across all source levels
2. Divides this total span into N equal-width partitions with slight overlap
3. Interpolates market P50/P75 at each partition's fractional position through the source data
4. Distributes total employees and job counts proportionally across the new levels
5. Labels levels as L1 (lowest) through LN (highest), displayed highest-first
6. Resets all Range Builder and KPI state

Changing super function or level type resets level structure back to Standard. The custom level count is independent of step size — both can be combined freely.

### 2. RangeTargetBulletChart (Read-Only Chart)
**File:** `client/src/components/charts/RangeTargetBulletChart.tsx`
**Type:** Read-only SVG visualization

Renders a layered horizontal bar chart per level showing three overlapping ranges plus two point indicators:

| Visual Layer | Meaning | Color |
|---|---|---|
| Full-width light bar | Scale (min to max of all data) | `#e0e4e9` at 50% opacity |
| Medium bar | Market range (P50 minus spread to P75) | `#b8d4f0` at 70% opacity |
| Narrow inner bar | Target range (current or user-modified) | `#0f69ff` at 85% opacity |
| Triangle endpoints | Target range min/max boundaries | Blue if inside market, grey if outside |
| Circle indicators | Actual employee pay min/max | Conditional coloring (see below) |

**Circle indicator color logic (4 states):**
- Solid blue: actual value is inside both target range AND market range
- Blue outline (white fill): actual value is inside target range but OUTSIDE market range
- Dark outline (white fill): actual value is OUTSIDE target range but inside market range
- Solid dark: actual value is outside both ranges

**Triangle indicator logic (2 states):**
- Blue (`#0f69ff`): target endpoint falls within market range
- Grey (`#9ca3af`): target endpoint falls outside market range

**Props:**
```typescript
interface RangeTargetBulletChartProps {
  rows: BulletRangeRow[];
  width?: number;
  rowHeight?: number;        // Default: 28
  rowGap?: number;           // Default: 14
  showLabels?: boolean;      // Default: true
  showScale?: boolean;       // Default: true
  labelWidth?: number;       // Default: 64
  scaleMin?: number;
  scaleMax?: number;
  formatValue?: (v: number) => string;
  marketColor?: string;      // Default: "#b8d4f0"
  targetColor?: string;      // Default: "#0f69ff"
  scaleBarColor?: string;    // Default: "#e0e4e9"
}

interface BulletRangeRow {
  label: string;
  marketMin: number;
  marketMax: number;
  targetMin: number;
  targetMax: number;
  actualMin: number;
  actualMax: number;
}
```

### 3. Target Range Statistics (Computed Table)
**Computed in:** `RangeBuilderPage.tsx` -> `computeTargetRangeStats()`

The table computes structural metrics for each level based on the current (or user-modified) target ranges:

| Metric | Formula | Purpose |
|---|---|---|
| **Spread %** | `(max - min) / min * 100` | Width of the range as a percentage of the minimum |
| **Min Overlap %** | `max(0, belowLevel.max - currentLevel.min) / belowLevel.spread * 100` | How much the bottom of this range overlaps with the range of the level below |
| **Max Overlap %** | `max(0, currentLevel.max - aboveLevel.min) / currentLevel.spread * 100` | How much the top of this range overlaps with the range of the level above |
| **Level Below %** | `-(currentMid - belowMid) / belowMid * 100` | % decrease from current midpoint to the midpoint of the level below |
| **Level Above %** | `(aboveMid - currentMid) / currentMid * 100` | % increase from current midpoint to the midpoint of the level above |
| **Promo Opp %** | `(aboveLevel.min - currentMid) / currentMid * 100` | % increase from current midpoint to the minimum of the level above |

**Display order:** Highest level at the top. "Below" = next lower level; "above" = next higher level.

**Color coding:**
- Amber: overlap percentages > 0 (indicates range overlap between levels)
- Red: negative Promo Opp % (indicates range compression — promotion would not yield a pay increase)

---

## Job Structure Data Model

The system organizes compensation data in a 3-level hierarchy:

```
Super Job Function (4)
  └── Level Type (4)
        └── Individual Levels (varies)
```

### Super Job Functions
| Code | Full Name | Description |
|---|---|---|
| R&D | Research & Development | Engineering, product, design |
| GTM | Go-To-Market | Sales, marketing, customer success |
| OPS | Operations | Operations, supply chain, facilities |
| G&A | General & Administrative | Finance, HR, legal, IT |

### Level Types
| Type | Prefix | Levels | Description |
|---|---|---|---|
| Professional | P | P1-P6 | Individual contributor track |
| Manager | M | M1-M6 | People management track |
| Executive | E | E1-E5 | Senior leadership track |
| Support | S | S1-S4 | Administrative/support track |

### Per-Level Data Fields
Each level in each Super Function x Level Type combination has:

```typescript
interface LevelData {
  rangeMin: number;           // Current target range minimum ($)
  rangeMax: number;           // Current target range maximum ($)
  currentEmployees: number;   // Headcount at this level
  avgCurrentPay: number;      // Average current compensation ($)
  marketP50: number;          // Market 50th percentile ($)
  marketP75: number;          // Market 75th percentile ($)
  actualMin: number;          // Lowest actual employee pay ($)
  actualMax: number;          // Highest actual employee pay ($)
  jobCount: number;           // Number of distinct job titles mapping to this level
}
```

**Market range derivation:** The market range displayed in the bullet chart is derived as:
- Market Min = `P50 - (P75 - P50)` (symmetric below P50)
- Market Max = `P75`

**Current state:** All data is currently hardcoded in `RangeBuilderPage.tsx` as `JOB_STRUCTURE_DATA`. In production, this would be sourced from:
1. **Employee data** (from [Segmentation Studio](https://github.com/people-analyst/segmentation-studio)) — headcount, actual pay, average pay per level
2. **Target range data** — current approved min/max per level from compensation structure
3. **Market range data** (from [Conductor](https://github.com/people-analyst/conductor)) — P50, P75 benchmarks per level from survey data

---

## Data Flow & Reactivity

```
[Filters: Super Function + Level Type]
         │
         ▼
  getLevelDataForSelection()
         │
         ├──► rows, marketData, actuals, jobCounts, scaleMin, scaleMax
         │
         ▼
  ┌─────────────────────────────┐
  │  RangeBuilderControl        │ ◄── stepSize (from granularity toggle)
  │  (clickable boxes)          │
  │                             │
  │  onChange ──► activeRanges   │──► KPIs (cost, equity, comp, affected)
  │              + kpis         │
  └─────────────────────────────┘
         │
         ├──► bulletRows (derived from activeRanges + market + actuals)
         │       │
         │       ▼
         │   RangeTargetBulletChart (visualization)
         │
         ├──► rangeStats (derived from activeRanges)
         │       │
         │       ▼
         │   Target Range Statistics Table
         │
         ├──► AnyComp (via RangeBuilderChangeEvent callback)
         │       Receives: activeRanges + kpis + kpiIndices
         │
         └──► Metric Engine (via MetricComputationEvent)
                 Receives: computed metric values + context
```

**State reset behavior:** Changing the Super Job Function, Level Type, or step size granularity resets all user modifications (clears `lastEvent`) and re-initializes the control from the underlying data.

---

## KPI System

### KPI Index Cards (0-100 Goodness Scores)

Each KPI card displays a bold **Index (0-100)** representing "goodness" — higher is always better. The index is color-coded: green (80+), default (60-79), amber (40-59), red (below 40). Below the index, the card shows the actual calculated measure and a change delta.

| KPI | Index Formula | Perfect Score | Meta Facts Shown |
|---|---|---|---|
| **Cost Impact** | `max(0, 100 - abs(costChange%) * 10)` | 100 = zero cost change | Dollar amount, % annual change |
| **Peer Equity** | `peerEquityScore * 100` | 100 = perfectly centered | Alignment %, change vs baseline |
| **Competitiveness** | `max(0, 100 - abs(ratio - 1.0) * 200)` | 100 = exactly at market | % of market, change vs baseline |
| **People Impact** | `(1 - affectedEmployees/totalEmployees) * 100` | 100 = no employees affected | Count affected, total employees |

### Metric Engine Standardization

These four KPIs are registered in the [Metric Engine](https://github.com/people-analyst/metric-engine-calculus) definition library with canonical keys:

| KPI | Metric Engine Key | Category | Unit | Direction |
|---|---|---|---|---|
| Cost Impact | `cost_impact` | compensation | currency | lower_is_better |
| Peer Equity | `peer_equity` | equity | ratio | higher_is_better |
| Competitiveness | `competitiveness` | market_positioning | ratio | target_is_best |
| People Impact | `people_impact` | workforce | index_0_100 | higher_is_better |

Metric Engine provides canonical formulas, thresholds (critical/warning/target), and version tracking. Computed values from Range Builder sessions are pushed back to Metric Engine for historical benchmarking and trend analysis across the ecosystem.

**Reference:** See `server/componentExport.ts` for the complete bidirectional data contract with Metric Engine, including inbound metric definition schema and outbound computed metric value schema.

---

## Cross-Application Integration

### Conductor -> Metric Market (Input Data)
**Conductor repo:** [people-analyst/conductor](https://github.com/people-analyst/conductor)
**Conductor docs:** See `hub-docs.md` and Conductor's own README for field mediation and tiered metric recipe documentation.

Conductor supplies three categories of data:

#### A. Job Architecture (rows)
Source: HRIS (via [Segmentation Studio](https://github.com/people-analyst/segmentation-studio)) + Job Structure
```json
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
```

#### B. Market Benchmarks (marketData)
Source: Compensation survey data, market pricing tools
```json
{
  "marketData": [
    { "p50": 130000, "p75": 148000 }
  ]
}
```

#### C. Field Mappings (via Field Exchange)
Conductor maps its internal field names to Metric Market's expected schema using the Field Exchange SDK:

| Metric Market Field | Canonical Field | Typical Source |
|---|---|---|
| label | job_level | Job Architecture ([Segmentation Studio](https://github.com/people-analyst/segmentation-studio)) |
| rangeMin | salary_range_minimum | Compensation Structure |
| rangeMax | salary_range_maximum | Compensation Structure |
| currentEmployees | headcount | HRIS Snapshot (Tier 1) |
| avgCurrentPay | base_compensation | HRIS Snapshot (aggregated) |
| p50 | market_p50 | Survey Data / Market Pricing |
| p75 | market_p75 | Survey Data / Market Pricing |

#### Push Data via API
```bash
POST /api/cards/:cardId/data
Content-Type: application/json
X-API-Key: {HUB_API_KEY}

{
  "payload": {
    "rows": [...],
    "marketData": [...]
  }
}
```

### Metric Market -> AnyComp (Output Events)
**AnyComp repo:** [people-analyst/anycomp](https://github.com/people-analyst/anycomp)
**AnyComp docs:** See AnyComp's own README for scenario modeling and 100 Pennies integration.

When a user adjusts ranges, the Range Builder emits a `RangeBuilderChangeEvent`:

```json
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
  },
  "kpiIndices": {
    "costImpactIndex": 88,
    "peerEquityIndex": 82,
    "competitivenessIndex": 94,
    "peopleImpactIndex": 95
  }
}
```

**Integration patterns for AnyComp:**
1. **Scenario Comparison**: Store snapshots of activeRanges + kpis per scenario
2. **Budget Modeling**: Feed totalCostImpact into budget constraint calculations
3. **Executive Prioritization**: Use kpiIndices in weighted scoring for comp strategy decisions
4. **100 Pennies**: Map kpiIndices to penny allocation weights
5. **VOI Analysis**: Use KPI deltas to estimate Value of Information for comp research (via [VOI Calculator](https://github.com/people-analyst/voi-calculator))

### Metric Engine <-> Metric Market (Bidirectional)
**Metric Engine repo:** [people-analyst/metric-engine-calculus](https://github.com/people-analyst/metric-engine-calculus)

#### Inbound: Metric Definitions -> Range Builder
```json
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
    }
  ]
}
```

#### Outbound: Computed Values -> Metric Engine
```json
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
```

**Integration patterns for Metric Engine:**
1. **Definition Sync**: Pull metric definitions on initialization to ensure formula consistency
2. **Version Tracking**: Compare local formula versions vs Metric Engine versions to detect drift
3. **Threshold Updates**: Metric Engine threshold changes propagate to KPI index scoring
4. **Historical Benchmarks**: Computed values feed trend analysis across all spoke apps
5. **Cross-App Standardization**: Same definitions used by AnyComp, Conductor, and other spokes

---

## Data Contracts & Schemas

### Bundle Definition
The Range Builder is registered as a card bundle in `server/bundleDefinitions.ts` with three schemas:

- **dataSchema** — Defines the input data shape (rows + marketData)
- **configSchema** — Defines configurable options (stepSize, colors, display options)
- **outputSchema** — Defines the output signal shape (activeRanges, kpis, kpiIndices)

These schemas are machine-readable JSON Schema and are served via the Component Export API:

```
GET /api/components/range_builder     # Full metadata + schemas + integration guide
GET /api/export/range_builder         # Downloadable export package
```

### Data Privacy
Employee-level compensation data flowing through the Range Builder should be processed through the [Data Anonymizer](https://github.com/people-analyst/data-anonymizer) before reaching client-facing environments. The Range Builder works with aggregated data (averages, counts) rather than individual employee records, but the upstream data pipeline should enforce anonymization at the HRIS ingestion layer.

---

## Component Export System

The Component Export system (`server/componentExport.ts`) packages Range Builder for cross-application consumption:

**Export page:** `/export` in the Metric Market UI
**API endpoints:**

| Method | Path | Purpose |
|---|---|---|
| GET | /api/components | Component registry (discover available components) |
| GET | /api/components/:key | Full component metadata + schemas + integration guide |
| GET | /api/export/:key | Export package (manifest, schemas, defaults, examples, docs) |
| POST | /api/cards/:id/data | Push data payload (Conductor -> Metric Market) |
| GET | /api/bundles/key/:key | Get bundle definition with schemas |
| GET | /api/metric-definitions | Pull metric definitions (Metric Engine -> Metric Market) |
| POST | /api/metric-values | Push computed values (Metric Market -> Metric Engine) |

**Filtering:** The registry supports filtering by:
- `?category=Compensation` — filter by bundle category
- `?type=control` — filter by component type (chart or control)
- `?target=anycomp` — filter by integration target (anycomp, conductor, metric-engine)

---

## Design System

### Color Palette (Yahoo Finance / Google Finance inspired)
| Token | Hex | Usage |
|---|---|---|
| Primary blue | `#0f69ff` | Active boxes, target ranges, selected filters |
| Light blue bg | `#e0f0ff` | Highlights, hover states |
| Dark text | `#232a31` | Primary text, labels |
| Mid grey text | `#5b636a` | Secondary text, scale labels |
| Light grey | `#e0e4e9` | Inactive boxes, borders, scale bars |
| Market blue | `#b8d4f0` | Market range fill |

### Design Principles
- Compact, minimal spacing (`rounded-[3px]`, tight padding)
- Charts are minimal: simple lines, greys, blacks, blues — no gradients or 3D effects
- All SVG rendering (no canvas)
- Responsive width via ResizeObserver — charts auto-measure their container
- All interactive elements have `data-testid` attributes for testing
- "P" branding instead of "Y" icons (Yahoo Finance inspiration without trademark)

---

## File Map

```
client/src/
├── pages/
│   └── RangeBuilderPage.tsx           # Page component, filters, data model, stats computation
│   └── ComponentExportPage.tsx        # Component export browser and detail view
├── components/
│   ├── controls/
│   │   └── RangeBuilderControl.tsx    # Interactive strip control + KPI cards
│   └── charts/
│       ├── RangeTargetBulletChart.tsx  # Layered bullet chart visualization
│       └── RangeStripAlignedChart.tsx  # Related aligned range strip chart
shared/
└── schema.ts                          # Type definitions, CHART_TYPES, CONTROL_TYPES
server/
├── bundleDefinitions.ts               # Card bundle JSON definitions (schemas)
├── componentExport.ts                 # Component registry, export packaging, integration contracts
├── routes.ts                          # API endpoint registration
└── hubSdk.ts                          # Hub-and-spoke communication module
```

---

## Ecosystem Repository Reference

Complete list of People Analytics Toolbox applications with their GitHub repositories and relationship to Range Builder:

| # | Application | GitHub Repository | Relevance to Range Builder |
|---|---|---|---|
| 1 | **Metric Market** (this app) | [people-analyst/metric-market](https://github.com/people-analyst/metric-market) | Home of Range Builder |
| 2 | **AnyComp** | [people-analyst/anycomp](https://github.com/people-analyst/anycomp) | Direct consumer of Range Builder outputs |
| 3 | **Conductor** | [people-analyst/conductor](https://github.com/people-analyst/conductor) | Direct producer of Range Builder inputs |
| 4 | **Metric Engine (Calculus)** | [people-analyst/metric-engine-calculus](https://github.com/people-analyst/metric-engine-calculus) | Bidirectional metric definition exchange |
| 5 | **People Analytics Toolbox (Hub)** | [people-analyst/people-analytics-toolbox](https://github.com/people-analyst/people-analytics-toolbox) | Central registry and spoke coordinator |
| 6 | **Segmentation Studio** | [people-analyst/segmentation-studio](https://github.com/people-analyst/segmentation-studio) | HRIS data onboarding upstream of Conductor |
| 7 | **Data Anonymizer** | [people-analyst/data-anonymizer](https://github.com/people-analyst/data-anonymizer) | Privacy layer for employee compensation data |
| 8 | **VOI Calculator** | [people-analyst/voi-calculator](https://github.com/people-analyst/voi-calculator) | Value of Information using KPI deltas |
| 9 | **Decision Wizard** | [people-analyst/decision-wizard](https://github.com/people-analyst/decision-wizard) | Structured decision-making with KPI criteria |
| 10 | **Kanban** | [people-analyst/kanban](https://github.com/people-analyst/kanban) | Development tracking across ecosystem |
| 11 | **People Analyst** | [people-analyst/people-analyst](https://github.com/people-analyst/people-analyst) | Organizational forecasting platform |
| 12 | **Survey Respondent** | [people-analyst/survey-respondent](https://github.com/people-analyst/survey-respondent) | Employee survey delivery |
| 13 | **Reincarnation** | [people-analyst/reincarnation](https://github.com/people-analyst/reincarnation) | Adaptive diagnostic / survey collection |
| 14 | **Meta Factory** | [people-analyst/meta-factory](https://github.com/people-analyst/meta-factory) | Unstructured knowledge to structured intelligence |

---

## Instructions for Communicating Back

When providing requirements, drawings, or feedback to continue development on this component:

1. **Reference levels by their codes** — Use P1-P6, M1-M6, E1-E5, S1-S4 and the Super Job Function codes (R&D, GTM, OPS, G&A).

2. **Distinguish between the three component types:**
   - "The **control**" = the clickable box strip (RangeBuilderControl)
   - "The **bullet chart**" = the layered visualization (RangeTargetBulletChart)
   - "The **stats table**" = the Target Range Statistics table
   - "The **KPI cards**" = the four summary metrics above the control

3. **When describing calculations**, specify:
   - Which data fields are inputs (e.g., "use marketP50 and marketP75")
   - The formula or business logic (e.g., "compa-ratio = actual pay / range midpoint")
   - How to handle edge cases (e.g., "clamp to 0 if negative", "show as dash if no adjacent level")

4. **When describing visual changes**, specify:
   - Which section of the page it affects
   - Color or style preferences (or "match existing")
   - Whether it replaces existing content or adds new content

5. **For cross-application changes:**
   - Reference the relevant GitHub repo for the target application
   - Specify which data contract fields are affected
   - Note if schema changes are needed (dataSchema, configSchema, or outputSchema)
   - Consider impact on Metric Engine definition versions

6. **For backend/data requirements:**
   - Currently all data is hardcoded client-side. If you need data sourced from the database, specify which tables need to exist and their schema.
   - The three logical data sources are: employee data (from Segmentation Studio), target range data, and market survey data (from Conductor).

7. **For new metrics or KPIs:**
   - Specify the metric name, formula, display format (%, $, ratio), and conditional color rules
   - Specify where it should appear (KPI card, stats table column, chart annotation, or new section)
   - Register in Metric Engine with: metricKey, category, unit, direction, thresholds
