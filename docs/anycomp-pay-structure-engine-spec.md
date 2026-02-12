# AnyComp Pay Structure Configuration Engine — Design Specification

**Version:** 1.0.0
**Date:** 2026-02-12
**Source:** Metric Market (metric-market) for AnyComp (anycomp)
**Audience:** AnyComp development team / AI agent

---

## 1. Purpose

This specification defines a **Pay Structure Configuration Engine** for AnyComp — an interactive system where users (or AI) adjust compensation design assumptions and see all downstream metrics recalculate in real time. The engine covers the full Milkovich Pay Framework: Internal Equity, External Equity, Employee Equity, and Administration.

The engine does NOT produce static charts. It produces **interactive configuration instruments** — visual controls where changing one parameter cascades through all derived compensation metrics.

---

## 2. Conceptual Framework (Milkovich)

The Milkovich Pay Framework organizes compensation decisions into four dimensions, each flowing through processes to organizational outcomes:

| Dimension | Processes | Outcomes |
|-----------|-----------|----------|
| **Internal Equity** | Job Analysis, Job Description, Job Evaluation | Organization Capability |
| **External Equity** | Market Definition, Surveys, Policy Lines, Pay Structures | Organization Performance |
| **Employee Equity** | Tenure Differential, Performance Evaluation, Increase Guidelines | Control Labor Costs |
| **Administration** | Planning, Budgeting, Monitoring, Evaluating | Influence Behavior (Attract, Activation, Attrition) |
| | | Comply with Regulations |

**Implementation:** Use this as the top-level navigation structure. Each dimension becomes a section/tab in the Pay Structure Configuration Engine. When a user enters the engine, they see these four dimensions and can drill into each one's configuration parameters.

---

## 3. Job Architecture Model

The engine needs a hierarchical job classification model for mapping HRIS employees to market survey jobs:

```
Job Function (top)
  └─ Occupation
       └─ Job (firm-specific)
            └─ Position (person in job)
                 └─ Tasks
                      └─ Task Elements / Behaviors
                           └─ Employee Attributes (KSAs)
```

**Implementation:**
- Store as a tree structure in a `job_architecture` table with `parent_id` self-reference
- Each node has: `id`, `parent_id`, `level` (function/occupation/job/position/task/element/attribute), `code`, `title`, `description`
- The Job level is where market matching happens — one internal Job maps to one or more market survey job codes
- Support importing job architecture from HRIS datasets via Field Exchange canonical mapping

### Job Architecture Table Schema

```typescript
export const jobArchitecture = pgTable("job_architecture", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => jobArchitecture.id),
  level: text("level").notNull(), // function, occupation, job, position, task, element, attribute
  code: text("code").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  marketSurveyCode: text("market_survey_code"), // for job-level: linked market survey job code
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 4. Core Design Decisions (Interactive Configuration Parameters)

Each of the following represents a user-adjustable parameter in the engine. When any parameter changes, all downstream metrics recalculate in real time.

### 4.1 Market Reference Point (MRP) Anchor

**What it controls:** Where on the market distribution the company anchors its internal pay midpoint.

**Parameter:** `marketReferencePointPercentile` — integer from 10 to 90
**Default:** 50

**Visual:** Horizontal range bar showing the full market distribution (10P through 90P) with a draggable marker for the MRP. Below the market bar, the internal range bar repositions in real time as the MRP moves.

**Impact on downstream metrics:**
- Compa-Ratio = Employee Pay / Internal Midpoint (where midpoint = market value at MRP)
- % of MRP = Employee Pay / Market Value at MRP
- Cost to Market = sum of (Employee Pay - Market Value at MRP) across population
- Market Position = where internal midpoint sits relative to market distribution

**UI Component:** `MarketAnchorConfigurator`
- Top bar: Market range (10P-90P) shown as a gradient/shaded bar with labeled percentile markers
- Draggable MRP indicator on the market bar
- Below: Internal range bar that shifts position based on MRP
- Side panel: Live-updating metrics (Compa-Ratio avg, Cost to Market, % above/below MRP)

### 4.2 Internal Range Spread

**What it controls:** How wide the internal pay range is around the midpoint.

**Parameter:** `rangeSpreadPercent` — number, typically 5 to 50
**Default:** 20

**Visual:** Three comparison bars showing the same midpoint with different spreads (+/-5%, +/-10%, +/-20%). A distribution curve above shows the expected pay distribution shape narrowing or widening.

**Derived values:**
- Range Minimum = Midpoint × (1 - spreadPercent/100)
- Range Maximum = Midpoint × (1 + spreadPercent/100)
- Range Spread = (Max - Min) / Min × 100

**Impact on downstream metrics:**
- Range Penetration = (Employee Pay - Range Min) / (Range Max - Range Min) × 100
- Quartile placement shifts as range width changes
- Number of employees above/below range changes

**UI Component:** `RangeSpreadConfigurator`
- Slider for spread percentage (5% to 50%)
- Visual bar showing midpoint with range expanding/contracting in real time
- Distribution curve above the bar
- Side panel: Population distribution across quartiles, % in-range, % above/below range

### 4.3 Number of Range Levels (Grade Structure)

**What it controls:** How many internal pay grades subdivide a single broad market range.

**Parameter:** `numberOfLevels` — integer from 1 to 10
**Default:** 3

**Visual:** Top bar shows the full market range. Below, sub-ranges appear for each level, distributed across the market range. Each level gets its own distribution curve.

**Derived values per level:**
- Level Midpoint = distributed across market range based on level count
- Level Min/Max = Midpoint +/- spread (per level or inherited from global spread)
- Level can have its own spread override

**Impact on downstream metrics:**
- Grade assignment for each employee changes
- Promotion cost estimates change (gap between level midpoints)
- Compression analysis between adjacent levels

**UI Component:** `GradeLevelConfigurator`
- Numeric input or stepper for level count (1-10)
- Visual stacked bars showing how the market range subdivides
- Each level labeled with its midpoint, min, max
- Option to assign per-level spread overrides

### 4.4 Range Level Overlap

**What it controls:** How much adjacent pay grade ranges overlap.

**Parameter:** `overlapPercent` — number from 0 to 50
**Parameter:** `overlapType` — enum: `none`, `left`, `right`, `mixed`
**Default:** 10, `mixed`

**Visual:** Three-level stack showing overlap zones highlighted in blue. Different overlap types show where the overlap appears.

**Overlap types explained:**
- `none` (0%): Clean breaks between levels, no overlap
- `left`: Lower part of upper level overlaps upper part of lower level
- `right`: Upper part of lower level extends into lower part of upper level
- `mixed`: Both sides overlap symmetrically

**Impact on downstream metrics:**
- Employees in overlap zones could be in either grade
- Promotion impact analysis (larger overlap = smaller promotion increase needed)
- Compression risk indicators

**UI Component:** `OverlapConfigurator`
- Slider for overlap percentage
- Dropdown for overlap type
- Visual stacked bars with blue overlap zones
- Side panel: Number of employees in overlap zones, promotion cost impact

---

## 5. Downstream Computed Metrics

When any configuration parameter changes, the following metrics recalculate for every employee (or for summary views by job/department/level):

### 5.1 Core Position Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| **Compa-Ratio** | Employee Pay / Range Midpoint | 1.0 = at midpoint, >1.0 = above, <1.0 = below |
| **% of MRP** | Employee Pay / Market Reference Point Value | Position relative to market anchor |
| **Range Penetration** | (Pay - Range Min) / (Range Max - Range Min) × 100 | 0% = at min, 100% = at max |
| **Range Quartile** | Which 25% segment of the range the employee falls in | Q1 (learning), Q2 (developing), Q3 (proficient), Q4 (expert) |
| **Market Position** | Internal Midpoint Percentile in Market Distribution | Where your midpoint sits in the market |

### 5.2 Cost & Gap Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| **Cost to Market** | Σ (Employee Pay - Market Value at MRP) | Total over/under-spend vs market |
| **Cost to Midpoint** | Σ (Employee Pay - Internal Midpoint) | Total variance from target |
| **Cost to Bring to Min** | Σ max(0, Range Min - Employee Pay) | Cost to bring all employees to range minimum |
| **Cost to Bring to Midpoint** | Σ max(0, Internal Midpoint - Employee Pay) for below-mid employees | Cost to bring below-midpoint employees up |
| **Promotion Cost Estimate** | (Next Level Midpoint - Current Level Midpoint) × eligible count | Cost if all eligible promote |

### 5.3 Distribution & Equity Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| **% Above Range** | Count(Pay > Range Max) / Total | Employees above range maximum |
| **% Below Range** | Count(Pay < Range Min) / Total | Employees below range minimum |
| **% In Range** | Count(Range Min ≤ Pay ≤ Range Max) / Total | Employees within range |
| **Pay Equity Ratio** | Median Pay (Group A) / Median Pay (Group B) | Gender, ethnicity, etc. pay gaps |
| **Compression Ratio** | Min Compa-Ratio in Level N+1 / Max Compa-Ratio in Level N | <1.0 indicates compression |
| **Range Overlap %** | Actual overlap zone / Total range span | How much adjacent ranges overlap |

### 5.4 Aggregation Dimensions

All metrics should be computable at these levels:
- **Individual employee**
- **By Job** (all employees in a specific job)
- **By Department / Org Unit**
- **By Grade Level**
- **By Location / Geography**
- **By Industry** (if market data supports it)
- **By Company Size** (if market data supports it)
- **Overall organization**

---

## 6. Data Requirements

### 6.1 HRIS Employee Data (via Field Exchange)

Required canonical fields from employee dataset:

| Canonical Field | Purpose |
|----------------|---------|
| `employee_identifier` | Unique ID |
| `base_compensation` | Current base pay |
| `total_cash_compensation` | Base + variable |
| `job_title` | For job matching |
| `job_code` | For market survey matching |
| `department` | Aggregation dimension |
| `hire_date` | Tenure calculations |
| `work_location` | Geographic pay differentials |
| `performance_rating` | Employee equity analysis |
| `gender` | Pay equity analysis |
| `ethnicity` | Pay equity analysis |
| `flsa_status` | Exempt/non-exempt |
| `pay_grade` | Current grade assignment (if exists) |

### 6.2 Market Survey Data

Required fields from market survey dataset:

| Field | Purpose |
|-------|---------|
| `job_code` | Match key to internal jobs |
| `job_title` | Descriptive |
| `industry` | Market cut dimension |
| `company_size` | Market cut dimension |
| `location` | Geographic market cut |
| `base_pay_p10` | 10th percentile base pay |
| `base_pay_p25` | 25th percentile base pay |
| `base_pay_p50` | 50th percentile (median) base pay |
| `base_pay_p75` | 75th percentile base pay |
| `base_pay_p90` | 90th percentile base pay |
| `total_cash_p25` | 25th percentile total cash |
| `total_cash_p50` | 50th percentile total cash |
| `total_cash_p75` | 75th percentile total cash |
| `total_rewards_p50` | 50th percentile total rewards |
| `n_companies` | Number of companies in cut |
| `n_incumbents` | Number of incumbents in cut |
| `effective_date` | Survey effective date |
| `aging_factor` | Annual market movement % |

---

## 7. Database Schema Additions for AnyComp

### 7.1 Pay Structure Configuration

```typescript
export const payStructureConfigs = pgTable("pay_structure_configs", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").references(() => compensationStrategies.id),
  name: text("name").notNull(),
  status: text("status").default("draft"), // draft, active, archived
  
  // Core configuration parameters
  marketReferencePointPercentile: integer("market_reference_point_percentile").default(50),
  rangeSpreadPercent: real("range_spread_percent").default(20),
  numberOfLevels: integer("number_of_levels").default(3),
  overlapPercent: real("overlap_percent").default(10),
  overlapType: text("overlap_type").default("mixed"), // none, left, right, mixed
  
  // Market scope filters
  industryCuts: jsonb("industry_cuts").default([]),      // which industries to include
  companySizeCuts: jsonb("company_size_cuts").default([]), // which company sizes
  locationCuts: jsonb("location_cuts").default([]),        // which geographies
  
  // Aging/trending
  agingFactor: real("aging_factor").default(3.0),          // annual market movement %
  agingReferenceDate: timestamp("aging_reference_date"),
  
  // Computed snapshot (recalculated on config change)
  computedMetrics: jsonb("computed_metrics").default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 7.2 Pay Structure Levels (per configuration)

```typescript
export const payStructureLevels = pgTable("pay_structure_levels", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").references(() => payStructureConfigs.id).notNull(),
  levelNumber: integer("level_number").notNull(),
  label: text("label"),                        // e.g., "Level 1", "Junior", "Senior"
  midpoint: real("midpoint"),                  // computed from market data + config
  rangeMin: real("range_min"),                 // midpoint * (1 - spread/100)
  rangeMax: real("range_max"),                 // midpoint * (1 + spread/100)
  spreadOverride: real("spread_override"),     // per-level spread override (null = use global)
  sortOrder: integer("sort_order").default(0),
});
```

### 7.3 Market Survey Data

```typescript
export const marketSurveyData = pgTable("market_survey_data", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").references(() => datasets.id),
  jobCode: text("job_code").notNull(),
  jobTitle: text("job_title"),
  industry: text("industry"),
  companySize: text("company_size"),
  location: text("location"),
  basePay10: real("base_pay_p10"),
  basePay25: real("base_pay_p25"),
  basePay50: real("base_pay_p50"),
  basePay75: real("base_pay_p75"),
  basePay90: real("base_pay_p90"),
  totalCash25: real("total_cash_p25"),
  totalCash50: real("total_cash_p50"),
  totalCash75: real("total_cash_p75"),
  totalRewards50: real("total_rewards_p50"),
  nCompanies: integer("n_companies"),
  nIncumbents: integer("n_incumbents"),
  effectiveDate: timestamp("effective_date"),
  agingFactor: real("aging_factor"),
});
```

### 7.4 Employee Compensation Snapshot

```typescript
export const employeeCompSnapshots = pgTable("employee_comp_snapshots", {
  id: serial("id").primaryKey(),
  datasetId: integer("dataset_id").references(() => datasets.id),
  employeeId: text("employee_id").notNull(),
  jobCode: text("job_code"),
  jobTitle: text("job_title"),
  department: text("department"),
  location: text("location"),
  basePay: real("base_pay"),
  totalCash: real("total_cash"),
  hireDate: timestamp("hire_date"),
  performanceRating: text("performance_rating"),
  gender: text("gender"),
  ethnicity: text("ethnicity"),
  payGrade: text("pay_grade"),
  flsaStatus: text("flsa_status"),
});
```

---

## 8. UI Architecture

### 8.1 Page Structure

Add a new page: `/pay-structure` with these sections:

```
┌─────────────────────────────────────────────────────────────┐
│ Pay Structure Configuration Engine                          │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Config      │   Active Decision Panel                      │
│  Sidebar     │   (changes based on selected dimension)      │
│              │                                              │
│  ┌────────┐  │   ┌──────────────────────────────────────┐   │
│  │Internal│  │   │  Interactive Range Bar Visualization  │   │
│  │Equity  │  │   │  (responds to parameter changes)     │   │
│  ├────────┤  │   └──────────────────────────────────────┘   │
│  │External│  │                                              │
│  │Equity  │  │   ┌──────────────────────────────────────┐   │
│  ├────────┤  │   │  Parameter Controls                   │   │
│  │Employee│  │   │  (sliders, dropdowns, numeric inputs) │   │
│  │Equity  │  │   └──────────────────────────────────────┘   │
│  ├────────┤  │                                              │
│  │Admin   │  │   ┌──────────────────────────────────────┐   │
│  └────────┘  │   │  Live Metrics Summary Panel           │   │
│              │   │  (recalculates on every change)       │   │
│  Config      │   └──────────────────────────────────────┘   │
│  Presets     │                                              │
│              │                                              │
│  Strategy    │                                              │
│  Link        │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 8.2 Real-Time Calculation Flow

```
User adjusts parameter (e.g., MRP slider)
    │
    ▼
Client-side recalculation engine
├─ Recompute range min/max for all levels
├─ Recompute all employee position metrics
├─ Recompute aggregated metrics by dimension
└─ Update all visual components
    │
    ▼
Visual update (no server round-trip for parameter changes)
├─ Range bar visualization repositions
├─ Metrics summary panel updates
├─ Distribution curves reshape
└─ Employee position dots shift

User clicks "Save Configuration"
    │
    ▼
POST /api/pay-structure-configs
├─ Persist parameters
├─ Store computed metrics snapshot
└─ Create audit_event
```

### 8.3 Interactive Range Bar Component

This is the primary reusable visual component. It renders:

1. **Market Range Bar** (background, full width, grey gradient)
   - Labeled percentile markers: 10P, 25P, 50P, 75P, 90P
   - Values displayed above markers in dollars

2. **Internal Range Bar** (foreground, positioned based on MRP)
   - Min marker (left edge)
   - Midpoint marker (center line)
   - Max marker (right edge)
   - Blue fill for the range body
   - Blue overlap zones when showing multi-level

3. **Employee Position Dots** (optional overlay)
   - Each employee as a small dot positioned by their pay
   - Color-coded by quartile or equity group
   - Tooltip on hover showing employee details

4. **Distribution Curve** (optional overlay)
   - Bell-like curve above the range showing population distribution
   - Reshapes as range parameters change

**Component API:**

```typescript
interface RangeBarProps {
  marketData: {
    p10: number; p25: number; p50: number; p75: number; p90: number;
  };
  internalRange: {
    min: number; midpoint: number; max: number;
  };
  mrpPercentile: number;
  levels?: Array<{
    label: string; min: number; midpoint: number; max: number;
    overlapZone?: { start: number; end: number };
  }>;
  employees?: Array<{
    id: string; pay: number; label: string; group?: string;
  }>;
  showDistribution?: boolean;
  onMrpChange?: (percentile: number) => void;
  interactive?: boolean;
}
```

---

## 9. AI Integration Points

### 9.1 AI-Assisted Configuration

The AI (OpenAI gpt-5-mini) can adjust configuration parameters based on natural language goals:

**User says:** "I want to be aggressive on senior engineering talent but conservative on admin roles"

**AI action:**
- Set MRP = 75P for engineering job family
- Set MRP = 50P for admin job family
- Adjust spreads accordingly (wider for engineering to attract/retain)

### 9.2 AI Scenario Narration

When a configuration changes, AI generates a narrative summary:

> "Moving the Market Reference Point from P50 to P75 for Engineering roles increases your cost to market by $2.3M annually. 34 employees currently below the new range minimum would require immediate adjustments totaling $890K. Compa-ratios drop from an average of 1.05 to 0.87, indicating the organization is now positioned below its target."

### 9.3 AI Recommendation Engine

AI can analyze current employee data and suggest optimal configurations:

> "Based on your 18% attrition rate in engineering and 4% in operations, I recommend: Engineering MRP at P65 with +/-25% spread (competitive but not excessive), Operations MRP at P50 with +/-15% spread (market-matching with tight controls)."

---

## 10. Metric Market Integration

After configurations are finalized in AnyComp, computed metrics should be pushed to Metric Market for visualization and tracking. See the companion document: `metric-market-anycomp-integration-spec.md`

**Push pattern:** AnyComp POSTs computed metric snapshots to Metric Market's card data endpoints. Metric Market renders them using its existing card bundle library (box & whisker for distributions, bullet bars for targets, heatmaps for cross-dimensional comparisons, etc.).

**Key data flows:**
1. AnyComp computes compa-ratio distributions by department → push to Metric Market box_whisker card
2. AnyComp computes cost-to-market by job family → push to Metric Market bullet_bar card
3. AnyComp computes pay equity ratios → push to Metric Market heatmap card
4. AnyComp computes range penetration distributions → push to Metric Market sparkline_rows card

---

## 11. Implementation Priority

### Phase 1: Foundation
1. Job Architecture table + import from HRIS
2. Market Survey Data table + import
3. Employee Compensation Snapshot table + import
4. Pay Structure Config table + CRUD API
5. Basic range calculation engine (client-side)

### Phase 2: Interactive Configuration
6. Market Anchor Configurator (MRP slider + range bar)
7. Range Spread Configurator (spread slider + visual)
8. Grade Level Configurator (level count + visual)
9. Overlap Configurator (overlap % + type + visual)
10. Live metrics summary panel

### Phase 3: Analysis & AI
11. Full metric computation engine (all 15+ metrics)
12. AI-assisted configuration recommendations
13. AI scenario narratives for configuration changes
14. Pay equity analysis overlays
15. Metric Market integration (push computed metrics)

### Phase 4: Administration
16. Configuration presets (save/load named configurations)
17. Configuration comparison (side-by-side two configs)
18. Audit trail for all configuration changes
19. Export/report generation

---

## 12. Future Scope (Not in V1)

The following are common compensation analytics needs that are intentionally deferred from the initial implementation. They should be added in subsequent phases:

- **Variable / Incentive Pay Separation:** Analysis of base pay vs. bonus vs. long-term incentives separately. V1 focuses on base pay ranges.
- **Geographic / COLA Adjustments:** Location-based pay differentials and cost-of-living adjustments applied to ranges.
- **Merit Matrix / Pay Progression:** Performance-rating × compa-ratio matrices that determine increase percentages.
- **Aging / Market Movement:** Projecting survey data forward using aging factors to account for time lag between survey effective date and planning date.

---

## 13. Important Notes for Implementation

### Push Cadence to Metric Market

Interactive slider changes should NOT trigger Metric Market pushes on every change. The real-time recalculation is client-side only. Data is pushed to Metric Market only when:
1. The user explicitly clicks "Save Configuration"
2. A scheduled sync runs (if configured)
3. A Hub directive requests a push

This avoids flooding Metric Market with noisy intermediate states during interactive modeling.

### New Bundle Registration

When Metric Market adds the two new compensation-specific bundles (`pay_range_bar`, `compa_distribution`), it must also:
1. Add the new chart type keys to `CHART_TYPES` in `shared/schema.ts`
2. Create the corresponding D3 chart rendering components
3. Register them in the chart component index so `CardWrapper` can render them
