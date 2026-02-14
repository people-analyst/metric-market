# Range Builder — Developer Documentation

## Purpose & Vision

The Range Builder is an interactive **compensation range simulation tool** within the People Analytics Toolbox ("Metric Market") ecosystem. It enables compensation analysts to model target pay ranges across a job architecture, visualize how those ranges relate to market data and actual employee pay, and immediately see the downstream impact on cost, peer equity (internal equity), competitiveness, and structural health metrics.

The core interaction paradigm: a user selects a slice of the job architecture (by Super Job Function and Level Type), then clicks individual boxes on a segmented strip to extend or shrink target ranges for each level. Every click triggers a real-time recalculation of KPIs and statistics across all connected data sources.

**Key design principle:** This is not a chart — it is a **Form Control** that produces output signals. In the card bundle taxonomy, it is registered as component type `range_builder` under the `CONTROL_TYPES` category (as opposed to `CHART_TYPES` which are read-only visualizations).

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

**What it does:**
- Renders a horizontal segmented strip for each level in the job structure
- Each strip is divided into clickable boxes, where each box represents a dollar increment (the "step size")
- Blue boxes = active (included in the target range); grey boxes = inactive
- Clicking a box toggles it on/off, extending or shrinking the target range
- Above the strips, 4 KPI cards show real-time impact metrics

**Props (interface `RangeBuilderControlProps`):**
```typescript
interface RangeBuilderControlProps {
  rows: RangeBuilderRow[];          // Level data (label, rangeMin, rangeMax, employees, avgPay)
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
  rows: RangeBuilderRow[];
  activeRanges: { label: string; min: number; max: number }[];
  kpis: RangeBuilderKPIs;
}
```

**KPIs computed (interface `RangeBuilderKPIs`):**
```typescript
interface RangeBuilderKPIs {
  totalCostImpact: number;          // Dollar cost change from baseline
  costChangePercent: number;        // % change in annual cost
  peerEquityScore: number;          // 0-1 score (deviation of avg pay from range midpoint) — "Peer Equity" aka Internal Equity, distinct from Gender/Ethnic Pay Equity
  peerEquityChange: number;         // Change from baseline peer equity
  competitivenessRatio: number;     // Range midpoint / market P50
  competitivenessChange: number;    // Change from baseline competitiveness
  employeesAffected: number;        // Employees whose pay falls outside new range
  totalEmployees: number;           // Total employee count
}
```

**Terminology note:** "Peer Equity" (also called Internal Equity) measures how well employees at the same level are centered within their pay range. This is explicitly distinct from Gender Pay Equity, Ethnic Pay Equity, or other protected-status equity metrics, which are separate legal constructs with their own defined calculations. Those will be added to the environment separately.

**KPI Index system:** Each KPI card displays a bold **Index (0-100)** representing "goodness" — higher is always better. The index is color-coded: green (80+), default (60-79), amber (40-59), red (below 40). Below the index, the card shows the actual calculated measure and a change delta.

| KPI | Index Formula | Meta Facts Shown |
|---|---|---|
| **Cost Impact** | `100 - abs(costChange%) * 10` — perfect score at zero cost change, degrades as cost impact grows | Dollar amount, % annual change |
| **Peer Equity** | `peerEquityScore * 100` — direct mapping from the 0-1 alignment score | Alignment %, change vs baseline |
| **Competitiveness** | `100 - abs(ratio - 1.0) * 200` — perfect at 100% of market, degrades symmetrically above/below | % of market, change vs baseline |
| **People Impact** | `(1 - affectedEmployees/totalEmployees) * 100` — perfect when no employees are affected by range changes | Count affected, total employees |

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

**What it does:**
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

**Props (interface `RangeTargetBulletChartProps`):**
```typescript
interface RangeTargetBulletChartProps {
  rows: BulletRangeRow[];           // Data per level
  width?: number;                   // Auto-measured if not provided
  rowHeight?: number;               // Default: 28
  rowGap?: number;                  // Default: 14
  showLabels?: boolean;             // Default: true
  showScale?: boolean;              // Default: true
  labelWidth?: number;              // Default: 64
  scaleMin?: number;                // Auto-calculated if not provided
  scaleMax?: number;                // Auto-calculated if not provided
  formatValue?: (v: number) => string;
  marketColor?: string;             // Default: "#b8d4f0"
  targetColor?: string;             // Default: "#0f69ff"
  scaleBarColor?: string;           // Default: "#e0e4e9"
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
**Computed in:** `RangeBuilderPage.tsx` → `computeTargetRangeStats()`

The table computes structural metrics for each level based on the current (or user-modified) target ranges:

| Metric | Formula | Purpose |
|---|---|---|
| **Spread %** | `(max - min) / min * 100` | Width of the range as a percentage of the minimum |
| **Min Overlap %** | `max(0, belowLevel.max - currentLevel.min) / belowLevel.spread * 100` | How much the bottom of this range overlaps with the range of the level below, as % of the below range's spread. Clamped to 0. |
| **Max Overlap %** | `max(0, currentLevel.max - aboveLevel.min) / currentLevel.spread * 100` | How much the top of this range overlaps with the range of the level above, as % of this range's spread. Clamped to 0. |
| **Level Below %** | `-(currentMid - belowMid) / belowMid * 100` | % decrease from current midpoint to the midpoint of the level below (displayed as negative) |
| **Level Above %** | `(aboveMid - currentMid) / currentMid * 100` | % increase from current midpoint to the midpoint of the level above |
| **Promo Opp %** | `(aboveLevel.min - currentMid) / currentMid * 100` | % increase from current midpoint to the minimum of the level above. Red if negative (range compression). |

**Display order:** Highest level at the top (e.g., P6 first, P1 last). "Below" always refers to the next lower level in the hierarchy; "above" refers to the next higher level.

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

**Current state:** All data is currently hardcoded in `RangeBuilderPage.tsx` as `JOB_STRUCTURE_DATA`. In production, this would be sourced from three joined data tables:
1. **Employee data** — headcount, actual pay, average pay per level
2. **Target range data** — current approved min/max per level
3. **Market range data** — P50, P75 benchmarks per level

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
         └──► rangeStats (derived from activeRanges)
                 │
                 ▼
             Target Range Statistics Table
```

**State reset behavior:** Changing the Super Job Function, Level Type, or step size granularity resets all user modifications (clears `lastEvent`) and re-initializes the control from the underlying data.

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
│   └── RangeBuilderPage.tsx         # Page component, filters, data model, stats computation
├── components/
│   ├── controls/
│   │   └── RangeBuilderControl.tsx   # Interactive strip control + KPI cards
│   └── charts/
│       ├── RangeTargetBulletChart.tsx # Layered bullet chart visualization
│       └── RangeStripAlignedChart.tsx # Related aligned range strip chart
shared/
└── schema.ts                        # Type definitions, CHART_TYPES, CONTROL_TYPES
server/
└── bundleDefinitions.ts             # Card bundle JSON definitions (dataSchema, configSchema, outputSchema)
```

---

## Instructions for Communicating Back

When providing requirements, drawings, or feedback to continue development on this component, the most effective format is:

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

5. **When providing drawings/mockups:**
   - Annotate which parts are the control vs. the chart vs. the table
   - Call out any new data fields that would need to be added to the `LevelData` interface
   - Note if new calculations require data not currently available (e.g., incumbent counts by quartile, geographic differentials)

6. **For backend/data requirements:**
   - Currently all data is hardcoded client-side. If you need data sourced from the database, specify which tables need to exist and their schema.
   - The three logical data sources are: employee data, target range data, and market survey data. These could be modeled as separate tables or a single denormalized calculation view.

7. **For new metrics or KPIs:**
   - Specify the metric name, formula, display format (%, $, ratio), and conditional color rules
   - Specify where it should appear (KPI card, stats table column, chart annotation, or new section)
