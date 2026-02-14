# Integration Requirements: Metric Market (Range Builder) → AnyComp

**Document ID:** REQ-METRICMARKET-ANYCOMP-001
**Date:** February 14, 2026
**From:** AnyComp (Compensation Decision Engine)
**To:** Metric Market / Range Builder Team
**Priority:** Priority 1 (MVP) — RangeBuilderChangeEvent Consumption
**Status:** Requirements Defined — MVP Integration

---

## 1. Executive Summary

AnyComp is the compensation decision engine in the People Analytics Toolbox ecosystem (14 applications coordinated through a central Hub). It transforms executive priorities, structural engineering outputs, market data from Conductor, and workforce snapshots from Segmentation Studio into optimized, auditable compensation decisions using a Strategy Fit Index (weighted composite of 5 sub-indexes via 100 Pennies allocation), AI-powered scenario comparison, and Value of Information analysis.

Metric Market's Range Builder is the **structural engineering console** where compensation ranges are interactively designed and simulated. AnyComp is where those designs are **evaluated against business strategy, compared across scenarios, budgeted, and approved**.

The primary integration point is the **RangeBuilderChangeEvent** — the event emitted by Range Builder whenever a user adjusts ranges, which AnyComp captures as a scenario snapshot for strategic evaluation.

**The key architectural boundary:** Range Builder = structural engineering workbench (lives in Metric Market). AnyComp = strategic decision engine (downstream consumer). AnyComp enriches Range Builder's output but never replaces it.

---

## 2. Related Documentation

| Document | Location |
|---|---|
| AnyComp Vision & Engineering Plan | [VISION.md](https://github.com/people-analyst/anycomp/blob/main/VISION.md) — Sections 3, 4, 5.1, 8.6, 8.7 |
| Metric Market Application | [metric-market.replit.app](https://metric-market.replit.app) |
| Metric Market Repository | [github.com/people-analyst/metric-market](https://github.com/people-analyst/metric-market) |
| AnyComp Repository | [github.com/people-analyst/anycomp](https://github.com/people-analyst/anycomp) |
| AnyComp comp-engine.ts | [client/src/lib/comp-engine.ts](https://github.com/people-analyst/anycomp/blob/main/client/src/lib/comp-engine.ts) |
| Hub Documentation | [github.com/people-analyst/people-analytics-toolbox](https://github.com/people-analyst/people-analytics-toolbox) |

---

## 3. Feature Responsibility Matrix

This table defines what lives where. Both teams should treat this as the definitive boundary:

### 3.1 Structural Engineering (Range Builder Owns)

| Feature | Status | Description |
|---|---|---|
| Interactive range endpoint manipulation | Implemented | Clickable segmented strips for adjusting min/max |
| Structural measures (spread, overlap, gap, symmetry) | Implemented | Raw engineering calculations |
| Bullet chart visualization | Implemented | Layered market/target/actual visualization |
| Stats table (structural metrics per level) | Implemented | Spread %, overlap %, promo opp %, etc. |
| KPI index cards (4 indexes) | Implemented | Real-time 0-100 goodness scores |
| Job structure filtering | Implemented | Super Function x Level Type matrix |
| Custom level structure (2-10 levels) | Implemented | Repartitioning compensation span |
| Range Hygiene Index | Planned | Architecture health scoring with violation rules engine |
| Anchor/progression/rounding rules | Planned | Advanced structural controls |

### 3.2 Decision Science (AnyComp Owns)

| Feature | Description |
|---|---|
| Strategy Builder | Business context, governance philosophy, market targets, constraints |
| 100 Pennies allocation | Executive priority weighting across outcome dimensions |
| Strategy Fit Index | Weighted composite of 5 sub-indexes using penny allocations |
| Scenario comparison | Side-by-side evaluation of multiple range configurations |
| AI narrative generation | GPT-powered scenario analysis and recommendations |
| VOI analysis (EVPI/EVSI) | Value of Information decision science |
| Merit matrices | Performance x position matrix for increase recommendations |
| Budget modeling | Total cost projections, constraint enforcement |
| Pay equity analysis | Gender/ethnicity/protected-class pay equity |
| Audit trail | Complete decision history |

### 3.3 Shared / Bridged

| Feature | Primary | Secondary | Connection |
|---|---|---|---|
| Pay Structure Configuration | AnyComp (persists configs) | Range Builder (interactive simulation) | Range Builder emits change events → AnyComp saves as named configurations |
| Index Framework (5 sub-indexes) | Range Builder (computes) | AnyComp (consumes + weights via Strategy Fit) | Range Builder produces raw indexes; AnyComp applies strategy weights |
| Market data filtering | AnyComp (persists filter prefs) | Range Builder (applies filters) | Both consume Conductor data; AnyComp stores industry/size/location cuts |
| Employee overlay metrics | AnyComp (comp-engine.ts) | Range Builder (workforce impact) | Both compute employee-vs-range metrics at different granularity |

---

## 4. What AnyComp Needs from Range Builder

### 4.1 RangeBuilderChangeEvent (Priority 1 — MVP)

**Purpose:** This is the primary integration point. Every time a user adjusts ranges in Range Builder, AnyComp needs to capture the resulting structure as a scenario snapshot.

**Required Event Shape:**
```typescript
interface RangeBuilderChangeEvent {
  activeRanges: Array<{
    label: string;      // Level label (e.g., "P1", "P2", "M3")
    min: number;        // Range minimum ($)
    max: number;        // Range maximum ($)
    midpoint?: number;  // Calculated midpoint
  }>;
  kpis: Record<string, number>;           // Raw KPI values
  kpiIndices: Record<string, number>;     // Normalized 0-100 scores
  hygieneResult?: {                       // Range Hygiene assessment
    score: number;
    violations: string[];
    details: Record<string, any>;
  };
  timestamp: string;
  configId?: string;    // If from a saved configuration
  jobFunction?: string; // Which job function (R&D, GTM, OPS, G&A)
  levelType?: string;   // P (professional), M (management), E (executive), S (support)
}
```

**Delivery Method:**
```
POST {ANYCOMP_URL}/api/range-events
```

Or via Hub relay:
```
POST {HUB_URL}/api/hub-webhook
Body: { type: "range-builder-change", payload: <RangeBuilderChangeEvent> }
```

**AnyComp's Processing Flow:**
1. Receive `RangeBuilderChangeEvent`
2. Map `activeRanges[].label` to AnyComp's `job_architecture` records via the `code` field
3. Retrieve matching `employee_comp_snapshots` for those job codes
4. Use incoming min/max as the range (overriding AnyComp's own computed range)
5. Run `computeEmployeeMetrics()` per employee against those ranges
6. Store incoming `kpiIndices` as-is for the 5 sub-index values
7. Independently compute additional metrics (gender equity, full quartile distribution, compression ratio)
8. Save as scenario snapshot
9. Log event to audit trail

### 4.2 Data Granularity Translation (Critical Design Note)

**Range Builder operates at the job-level** (P1, P2, M3) with aggregated data (headcount, avg pay, P50/P75).
**AnyComp operates at the employee-level** with full P10-P90 percentile distributions.

When AnyComp receives a RangeBuilderChangeEvent:
- Range Builder provides `activeRanges` (label + min + max) but NOT individual employee records
- Range Builder uses P50/P75 market data; AnyComp has P10-P90

**Translation approach:** AnyComp enriches the Range Builder signal — it doesn't replace it. AnyComp maps incoming ranges to its own employee data and computes its additional metrics on top of Range Builder's indexes.

### 4.3 Component Export (Future — Priority 3)

**Purpose:** Range Builder's Component Export system can package the Range Builder UI for embedding in AnyComp.

**Available Endpoints:**
```
GET {METRIC_MARKET_URL}/api/components/range_builder     — Discover component
GET {METRIC_MARKET_URL}/api/export/range_builder          — Download export package
```

**Integration Options (in order of preference for MVP):**
1. **Event consumption** (MVP — recommended): AnyComp receives `RangeBuilderChangeEvent` via webhook
2. **Link with context**: AnyComp links to Range Builder in Metric Market with pre-filled parameters
3. **Embed as iframe/component**: AnyComp embeds Range Builder UI directly (future enhancement)

### 4.4 Compensation Metric Reconciliation

AnyComp's `comp-engine.ts` and Range Builder's KPI engine overlap. The reconciliation is:

| Function | comp-engine.ts (AnyComp) | Range Builder | Recommendation |
|---|---|---|---|
| Market value interpolation | Linear interpolation P10-P90 | P50/P75 only | AnyComp's is richer — Range Builder can optionally consume pre-interpolated values |
| Range computation | From MRP + symmetric spread | User-driven box clicks | Different paradigms — both valid |
| Level construction | Algorithmic | Standard or custom (2-10) | Complementary |
| Per-employee metrics | Compa-ratio, range penetration, quartile | Affected count, severity, gap | AnyComp's is richer — covers more dimensions |
| Aggregated metrics | 15+ metrics | 4 KPI indexes + structural stats | Complementary — AnyComp for comprehensive reporting; Range Builder for real-time simulation |

**Key principle:** AnyComp's comp-engine.ts remains the authoritative calculation engine for comprehensive compensation metrics. Range Builder's engine remains optimized for interactive simulation responsiveness. Neither replaces the other.

---

## 5. What Metric Market / Range Builder Can Expect from AnyComp

### 5.1 Saved Pay Structure Configurations

AnyComp persists named pay structure configurations. Range Builder can read these to pre-load saved structures:

```
GET {ANYCOMP_URL}/api/pay-structure-configs
Response: Array of saved configurations with ranges, filters, and strategy context
```

### 5.2 Strategy Context for Range Builder Sessions

AnyComp can provide strategy context (which strategy is active, what the penny allocations are, which sub-indexes are most important) so Range Builder can highlight the most strategically relevant KPIs during interactive sessions.

---

## 6. The Five Sub-Indexes (Computed by Range Builder, Consumed by AnyComp)

| Index | What It Answers | Key Inputs | Score Range |
|---|---|---|---|
| **Cost Discipline** | How financially stable is this structure? | Cost impact %, out-of-range %, inversions, promo compression | 0-100 |
| **Internal Equity** | How consistently does pay align to structure? | Compa-ratio dispersion, in-range %, overlap extremity, compression | 0-100 |
| **Market Competitiveness** | How aligned are ranges to external market? | Weighted midpoint/P50, drift across levels | 0-100 |
| **Workforce Placement** | How well do incumbents fit inside this design? | In-range %, severity of deviations | 0-100 |
| **Range Hygiene** | Is the ladder structurally sound? | Inversions, crossovers, compression, overlap/gap, smoothness, symmetry | 0-100 |

AnyComp adds the **Strategy Fit Index** — a weighted composite of these 5 using the 100 Pennies allocation:
```
Strategy Fit = Sum(penny_weight_i * sub_index_i) / 100
```

---

## 7. Conductor Data Sources Relevant to Both Applications

Both Metric Market and AnyComp consume data from Conductor's BigQuery pipeline. For reference, these 7 sources flow through Conductor and serve both applications:

| Data Source | Range Builder Usage | AnyComp Usage |
|---|---|---|
| O\*NET | Job family classification for range grouping | Job matching validation; occupational hierarchy |
| BLS OES Wages | P10-P90 percentile anchors for range construction | Market Competitiveness Index; regional analysis |
| BLS CPI | Geographic cost-of-living multipliers | Geo Pay Tier modeling |
| US Minimum Wage (Symmetry) | Compliance floor in range minimums | Strategy constraint enforcement |
| International Statutory Wages | Global range floor/ceiling enforcement | International strategy modeling |
| ERI Market Data | Primary market anchor for range construction | Blended market positioning |
| CompAnalyst Market Data | Complementary market anchor | Blended market positioning |
| Universal JD Catalog | Job family hierarchy for range architecture | Strategy-level job family grouping |

See [REQ-CONDUCTOR-ANYCOMP-001](./REQ-conductor.md) for complete Conductor integration requirements.

---

## 8. Integration Timeline

| Phase | Milestone | Target |
|---|---|---|
| MVP (Phase 1-3) | RangeBuilderChangeEvent consumption | First integration milestone |
| MVP (Phase 1-3) | Saved pay structure configuration sharing | First integration milestone |
| V2.0 (Phase 6+) | Component embedding or deep linking | Future enhancement |

---

## 9. Open Questions for Metric Market Team

1. **Event emission:** Does Range Builder currently emit `RangeBuilderChangeEvent` via webhook/API, or only internally? If internal only, what is needed to enable external emission to AnyComp's endpoint?
2. **Range Hygiene Index:** When is the Range Hygiene Index (the 5th sub-index) expected to be implemented? AnyComp needs all 5 sub-indexes for the Strategy Fit composite.
3. **Job function context:** Does the event payload include the current job function filter (R&D, GTM, OPS, G&A) and level type (P, M, E, S)?
4. **Multi-function scenarios:** Can Range Builder emit events for multiple job functions in sequence, or does AnyComp need to request each function separately?
5. **Component Export stability:** Is the Component Export API (`/api/components/range_builder`) stable for integration, or is it still evolving?
6. **Market data source:** What market data does Range Builder currently use for its P50/P75 anchors? Is it from Conductor, or its own data?

---

*This document defines AnyComp's integration requirements for Metric Market / Range Builder. For complete technical context, see [VISION.md Sections 3, 4, 8.6, 8.7](https://github.com/people-analyst/anycomp/blob/main/VISION.md).*
