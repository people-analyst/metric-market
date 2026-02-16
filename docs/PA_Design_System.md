# PA Design System v1 — "Finance-Style" UI Specification

**Version:** 1.0  
**Date:** 2026-02-15  
**Scope:** All People Analytics Toolbox applications (Hub + Spoke ecosystem)

---

## 1. Design Philosophy

The PA ecosystem adopts a **Google Finance / Yahoo Finance** visual language: information-dense, scannable, and consistent across all 13+ applications. Every app should feel like a tab in the same product, not a separate tool.

### Core Principles

| Principle | Description |
|---|---|
| **Density over decoration** | Compact layouts that maximize data per viewport. No hero sections, no oversized cards. |
| **Ticker-first** | Metrics are displayed in compact ticker rows: label → value → delta% → sparkline. Not big stat cards. |
| **Consistent hierarchy** | Three text levels (primary, secondary, tertiary) applied uniformly. |
| **Delta awareness** | Every numeric value should show directional change when available (green up, red down). |
| **Section taxonomy** | Content organized into titled sections with icon + count badge headers. |
| **Dark/light parity** | All colors use semantic tokens that adapt automatically. |

---

## 2. Color System

Use the existing CSS custom properties from `index.css`. **Never use hardcoded hex values** for backgrounds, borders, or text.

### Semantic Tokens

| Token | Usage |
|---|---|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` / `--card-foreground` | Card surfaces |
| `--muted` / `--muted-foreground` | Secondary/tertiary text and subtle backgrounds |
| `--primary` / `--primary-foreground` | Brand accent, links, active states |
| `--destructive` | Errors, offline states |

### Signal Colors (Metric Classification)

These are the only cases where direct color classes are acceptable:

| Classification | Light Mode | Dark Mode |
|---|---|---|
| **Normal** | `bg-emerald-100 text-emerald-800` | `bg-emerald-900/30 text-emerald-400` |
| **Watch** | `bg-amber-100 text-amber-800` | `bg-amber-900/30 text-amber-400` |
| **Alert** | `bg-orange-100 text-orange-800` | `bg-orange-900/30 text-orange-400` |
| **Critical** | `bg-red-100 text-red-800` | `bg-red-900/30 text-red-400` |

Use `CLASSIFICATION_STYLES` from the design kit to apply these consistently.

### Trend Colors

| Direction | Color |
|---|---|
| Up (positive) | `text-emerald-600` / `dark:text-emerald-400` |
| Down (negative) | `text-red-600` / `dark:text-red-400` |
| Flat | `text-muted-foreground` |

For **risk metrics** (where up = bad), invert: up → red, down → green.

---

## 3. Typography

| Level | Class | Usage |
|---|---|---|
| Page title | `text-xl font-semibold` or `text-lg font-semibold` | One per page |
| Section header | `text-sm font-medium` | Section titles |
| Metric label | `text-xs font-medium` | Ticker labels |
| Metric value | `text-sm font-semibold tabular-nums` | All numeric values |
| Supporting text | `text-xs text-muted-foreground` | Descriptions, timestamps, metadata |
| Badge text | `text-xs` | Status badges, classification labels |

**Key rule:** Always use `tabular-nums` on numeric values so columns align properly.

---

## 4. Spacing & Density

### Tailwind Density Guardrails

| Element | Padding | Gap |
|---|---|---|
| Page container | `p-4` or `p-6` | `space-y-4` or `space-y-6` |
| Card content | `p-3` | — |
| Ticker row | `px-2 py-1.5` | `gap-2` |
| Metric card | `p-2` | `gap-1` |
| Grid items | — | `gap-1.5` (tight) or `gap-3` (sections) |
| Section header | — | `gap-2` |

### Grid Patterns

| Pattern | Classes | Use Case |
|---|---|---|
| Summary strip | `grid grid-cols-2 lg:grid-cols-4 gap-2` | Top-level KPI tickers |
| Metric grid | `grid grid-cols-1 md:grid-cols-2 gap-1.5` | Section metric tiles |
| Index gauges | `grid grid-cols-1 sm:grid-cols-3 gap-3` | Ecosystem indices |
| Alert grid | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5` | Alert rows |

---

## 5. Component Library (PA Design Kit)

### Installation in Spoke Apps

Copy the entire `client/src/components/pa-design-kit/` directory into your spoke application. The kit depends on:

- `@/components/ui/card` (Shadcn Card)
- `@/components/ui/badge` (Shadcn Badge)
- `@/components/ui/tooltip` (Shadcn Tooltip)
- `@/lib/utils` (cn utility)
- `lucide-react` icons

### Component Catalog

#### MetricTicker

The primary replacement for generic "stat cards." Compact single-line display.

```tsx
import { MetricTicker, type MetricTickerData } from "@/components/pa-design-kit";

const metric: MetricTickerData = {
  key: "turnover-rate",
  label: "Turnover Rate",
  value: 12.3,
  unitType: "percent",
  delta: { value: 1.2, percent: 10.8, direction: "up" },
  sparkline: [11.0, 11.2, 11.5, 12.0, 12.3],
  classification: "Watch",
};

<MetricTicker metric={metric} />
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `metric` | `MetricTickerData` | required | Metric data |
| `showClassification` | `boolean` | `true` | Show classification badge |
| `showSparkline` | `boolean` | `true` | Show inline sparkline |
| `invertTrend` | `boolean` | `false` | Invert trend colors (for risk metrics) |
| `onClick` | `() => void` | — | Click handler |

#### MetricCard

Expandable metric tile with more detail. Used in sectioned grids.

```tsx
import { MetricCard, type MetricCardData } from "@/components/pa-design-kit";

const metric: MetricCardData = {
  key: "engagement-score",
  label: "Engagement Score",
  value: 7.8,
  unitType: "score",
  delta: { value: 0.3, percent: 4.0, direction: "up" },
  sparkline: [7.2, 7.4, 7.5, 7.6, 7.8],
  classification: "Normal",
  confidence: 0.92,
  description: "Aggregate engagement index from Q4 pulse survey",
  domain: "survey",
  category: "engagement",
  sampleSize: 2400,
};

<MetricCard metric={metric} expandable />
```

#### MetricGrid

Container that lays out MetricTickers or MetricCards in a responsive grid.

```tsx
import { MetricGrid } from "@/components/pa-design-kit";

<MetricGrid
  metrics={metricsArray}
  variant="ticker"
  columns={2}
  maxVisible={6}
/>
```

#### MiniSparkline

Inline SVG sparkline. Use `currentColor` for color inheritance.

```tsx
import { MiniSparkline } from "@/components/pa-design-kit";

<MiniSparkline data={[10, 12, 11, 14, 13, 15]} width={48} height={14} />
```

#### TrendIndicator

Delta display with directional arrow and color coding.

```tsx
import { TrendIndicator } from "@/components/pa-design-kit";

<TrendIndicator
  delta={{ value: 2.5, percent: 8.3, direction: "up" }}
  showPercent
/>
```

#### IndexGauge

Ring progress gauge for ecosystem-level indices.

```tsx
import { IndexGauge, type IndexGaugeData } from "@/components/pa-design-kit";

const data: IndexGaugeData = {
  key: "ecosystem_health_index",
  value: 78,
  label: "Stable",
  delta: 2.3,
  sparkline: [72, 74, 75, 77, 78],
};

<IndexGauge data={data} />
```

#### SectionHeader

Consistent section headers with icon, title, and count badges.

```tsx
import { SectionHeader, type SectionHeaderMeta } from "@/components/pa-design-kit";
import { Users } from "lucide-react";

const section: SectionHeaderMeta = {
  id: "workforce",
  label: "Workforce Signals",
  icon: Users,
  color: "text-blue-500",
  metricCount: 12,
  alertCount: 2,
};

<SectionHeader section={section} />
```

#### AlertRow

Compact alert display with severity icon and inline sparkline.

```tsx
import { AlertRow, type AlertRowData } from "@/components/pa-design-kit";

const alert: AlertRowData = {
  key: "high-turnover",
  label: "Voluntary Turnover Spike",
  value: 18.5,
  unitType: "percent",
  classification: "Critical",
  delta: { value: 5.2, percent: 39.0, direction: "up" },
  sparkline: [13.0, 14.2, 15.8, 17.1, 18.5],
};

<AlertRow alert={alert} />
```

#### StatusDot

Standardized health/status indicator dot.

```tsx
import { StatusDot } from "@/components/pa-design-kit";

<StatusDot status="healthy" showLabel />
<StatusDot status="degraded" pulse />
<StatusDot status="critical" />
```

Status levels: `healthy` | `degraded` | `critical` | `offline` | `unknown`

#### formatMetricValue

Utility function for consistent value formatting across all apps.

```tsx
import { formatMetricValue } from "@/components/pa-design-kit";

formatMetricValue(12.3, "percent");   // "12.3%"
formatMetricValue(85000, "currency"); // "$85,000"
formatMetricValue(1234, "count");     // "1,234"
formatMetricValue(15200, "count");    // "15.2k"
formatMetricValue(0.85, "ratio");     // "0.85"
formatMetricValue(7.8, "score");      // "7.8"
formatMetricValue(45, "days");        // "45d"
formatMetricValue(null, "percent");   // "—"
```

---

## 6. Shared Type Interfaces

These types are the canonical data shapes for metric display across the ecosystem:

```typescript
interface TrendDelta {
  value: number | null;
  percent: number | null;
  direction: "up" | "down" | "flat";
}

interface MetricTickerData {
  key: string;
  label: string;
  value: number | null;
  unitType: "percent" | "currency" | "count" | "ratio" | "score" | "days" | "custom";
  unitLabel?: string | null;
  delta?: TrendDelta;
  sparkline?: number[] | null;
  classification?: "Normal" | "Watch" | "Alert" | "Critical";
  confidence?: number;
}

interface MetricCardData extends MetricTickerData {
  description?: string | null;
  domain?: string;
  category?: string;
  sampleSize?: number | null;
  dataQualityScore?: number | null;
  reasons?: string[] | null;
  tags?: string[] | null;
}

type StatusLevel = "healthy" | "degraded" | "critical" | "offline" | "unknown";
```

---

## 7. Page Layout Patterns

### Pattern A: Dashboard (Hub or Spoke Landing)

```
┌─────────────────────────────────────────────────────┐
│ Page Title                              [Actions]   │
├─────────────────────────────────────────────────────┤
│ [Alerts Panel - only if alerts exist]               │
├──────────┬──────────┬──────────┬──────────┤
│  Ticker  │  Ticker  │  Ticker  │  Ticker  │  ← Summary strip
├──────────┴──────────┴──────────┴──────────┤
│                                                     │
│  Main Content Grid                                  │
│  (App cards, metric sections, etc.)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Pattern B: Analytical Cockpit (Hub-Level)

```
┌─────────────────────────────────────────────────────┐
│ Page Title  [badges]              [Filter] [Actions]│
├──────────────┬──────────────┬──────────────┤
│  Index Gauge │  Index Gauge │  Index Gauge │  ← EHI/ERI/CAAI
├──────────────┴──────────────┴──────────────┤
│ [Top Alerts Panel]                                  │
├─────────────────────┬───────────────────────┤
│  Section Card       │  Section Card         │  ← 2-col grid
│  ┌─────┬─────┐      │  ┌─────┬─────┐        │
│  │Tile │Tile │      │  │Tile │Tile │        │
│  ├─────┼─────┤      │  ├─────┼─────┤        │
│  │Tile │Tile │      │  │Tile │Tile │        │
│  └─────┴─────┘      │  └─────┴─────┘        │
├─────────────────────┼───────────────────────┤
│  Section Card       │  Section Card         │
└─────────────────────┴───────────────────────┘
```

### Pattern C: Spoke App Metrics Panel

Replace generic stat cards with a ticker strip + metric grid:

```
┌─────────────────────────────────────────────────────┐
│ [App Name] Metrics                                  │
├──────────┬──────────┬──────────┬──────────┤
│  Ticker  │  Ticker  │  Ticker  │  Ticker  │
├──────────┴──────────┴──────────┴──────────┤
│                                                     │
│  ┌──────────────┬──────────────┐                    │
│  │ MetricCard   │ MetricCard   │                    │
│  ├──────────────┼──────────────┤                    │
│  │ MetricCard   │ MetricCard   │                    │
│  └──────────────┴──────────────┘                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 8. Migration Checklist for Spoke Apps

### Quick Start (15 minutes)

1. **Copy the kit:** Copy `client/src/components/pa-design-kit/` into your app
2. **Verify dependencies:** Ensure you have Shadcn Card, Badge, Tooltip components and lucide-react
3. **Replace stat cards:** Swap your `<StatCard>` or similar large KPI cards with `<MetricTicker>`
4. **Add ticker strip:** Wrap your top-level metrics in a `grid grid-cols-2 lg:grid-cols-4 gap-2`
5. **Use formatMetricValue:** Replace custom number formatting with the shared utility

### Full Adoption (1-2 hours)

6. **Replace metric lists:** Use `<MetricGrid variant="ticker">` for metric collections
7. **Use SectionHeader:** Standardize section headings with icon + count pattern
8. **Add StatusDot:** Replace custom status indicators with the shared component
9. **Add sparklines:** If your app tracks time-series values, include sparkline data in metric displays
10. **Add classification badges:** Apply `CLASSIFICATION_STYLES` from the kit to severity/status badges

### Spoke-to-Hub Metric Emission

When your spoke app emits metrics to the Hub via HAVE:

```typescript
const envelope = {
  schema_version: "1.0",
  emitted_at: new Date().toISOString(),
  source_app: "your-app-slug",
  domain: "workforce",
  metrics: [{
    metric_id: "voluntary_turnover_rate",
    metric_key: "voluntary_turnover_rate",
    label: "Voluntary Turnover Rate",
    category: "retention",
    unit_type: "percent",
    current_value: 12.3,
    prior_value: 11.1,
    trend_direction: "up",
    sparkline_data: [10.5, 11.0, 11.1, 12.0, 12.3],
    classification: "Watch",
    confidence_score: 0.95,
    tags: ["workforce", "retention", "monthly"],
  }],
};

await fetch("https://hub.example.com/api/have/ingest/workforce", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
  body: JSON.stringify(envelope),
});
```

---

## 9. Section Taxonomy (Hub Cockpit)

When emitting metrics to the Hub, use these tag values to route metrics to the correct cockpit section:

| Section | Tag | Section ID | Icon |
|---|---|---|---|
| Workforce Signals | `workforce` | `workforce_signals` | Users |
| Compensation Signals | `compensation` | `compensation_signals` | DollarSign |
| Performance Signals | `performance` | `performance_signals` | BarChart3 |
| Survey & Sentiment | `survey` | `survey_sentiment` | MessageSquare |
| Data Health | `data_quality` | `data_health` | Database |
| Pipeline Health | `pipeline` | `pipeline_health` | GitBranch |
| Model Health | `model` | `model_health` | Cpu |

---

## 10. Anti-Patterns

| Anti-Pattern | Correct Approach |
|---|---|
| Large stat cards with `text-2xl` values | Use `MetricTicker` with `text-sm font-semibold` |
| Custom number formatting per app | Use `formatMetricValue()` from the kit |
| Hardcoded colors for metrics | Use `CLASSIFICATION_STYLES` map |
| Oversized padding (`p-6`, `p-8`) on cards | Use `p-3` for card content, `p-2` for tiles |
| Missing `tabular-nums` on numbers | Always apply for proper alignment |
| Hero sections or splash screens | Go straight to data. Finance-style = data-first. |
| Custom status dots per app | Use `StatusDot` component |
| Sparklines only in special views | Include sparklines inline everywhere values are shown |

---

## 11. File Structure

```
client/src/components/pa-design-kit/
├── index.ts              # Barrel export (import everything from here)
├── types.ts              # Shared TypeScript interfaces
├── format-value.ts       # formatMetricValue() + CLASSIFICATION_STYLES
├── mini-sparkline.tsx     # Inline SVG sparkline
├── trend-indicator.tsx    # Delta arrow + percent display
├── status-dot.tsx         # Health/status dot indicator
├── metric-ticker.tsx      # Compact single-line metric (primary component)
├── metric-card.tsx        # Expandable metric tile
├── metric-grid.tsx        # Grid container for tickers/cards
├── section-header.tsx     # Section header with icon + badges
├── index-gauge.tsx        # Ring progress gauge for indices
└── alert-row.tsx          # Compact alert display
```

---

## 12. Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-02-15 | Initial release: core components, design principles, migration guide |
| 1.1 | 2026-02-15 | Added OutputCard, ResultsGrid, WorkflowSteps, cross-app embedding patterns |

---

## 13. New Components (v1.1)

### OutputCard

Compact card for displaying analytical outputs, results, or list items with metadata, tags, and timestamps.

```tsx
import { OutputCard, type OutputCardData } from "@/components/pa-design-kit";

const item: OutputCardData = {
  id: 1,
  title: "Attrition Rate",
  subtitle: "Engineering",
  status: "12.4%",
  statusVariant: "secondary",
  tags: ["retention", "engineering"],
  metadata: [{ label: "Source", value: "Workday" }],
  timestamp: "2026-02-15T10:00:00Z",
  icon: Activity,
};

<OutputCard item={item} compact onClick={(item) => navigate(`/detail/${item.id}`)} />
```

**Props:** `item: OutputCardData`, `compact?: boolean`, `onClick?: (item) => void`

### ResultsGrid

Infinite-scroll list with built-in search, tag filtering, and empty states. Wraps OutputCard items.

```tsx
import { ResultsGrid, type OutputCardData } from "@/components/pa-design-kit";

<ResultsGrid
  items={items}
  searchable
  filterable
  emptyMessage="No results found"
  onItemClick={(item) => navigate(`/detail/${item.id}`)}
/>
```

**Props:** `items: OutputCardData[]`, `searchable?: boolean`, `filterable?: boolean`, `emptyMessage?: string`, `onItemClick?: (item) => void`, `pageSize?: number`

### WorkflowSteps

Iconic workflow position indicators with status dots. Shows an app's position in a lifecycle or pipeline.

```tsx
import { WorkflowSteps, type WorkflowStep } from "@/components/pa-design-kit";

const steps: WorkflowStep[] = [
  { label: "Registered", status: "complete", icon: CheckCircle2 },
  { label: "Docs Synced", status: "complete", icon: FileText },
  { label: "Spec Defined", status: "active", icon: Code2 },
  { label: "Health OK", status: "pending", icon: HeartPulse },
  { label: "Production", status: "pending", icon: Zap },
];

<WorkflowSteps steps={steps} size="sm" />
```

**Status values:** `"complete"` | `"active"` | `"pending"` | `"error"`
**Size values:** `"sm"` | `"md"` (default: `"md"`)

### Updated File Structure

```
client/src/components/pa-design-kit/
├── index.ts
├── types.ts
├── format-value.ts
├── mini-sparkline.tsx
├── trend-indicator.tsx
├── status-dot.tsx
├── metric-ticker.tsx
├── metric-card.tsx
├── metric-grid.tsx
├── section-header.tsx
├── index-gauge.tsx
├── alert-row.tsx
├── output-card.tsx          # NEW: Compact output/result item card
├── results-grid.tsx         # NEW: Searchable/filterable infinite list
└── workflow-steps.tsx       # NEW: Iconic workflow position indicators
```

---

## 14. Cross-App Embedding Patterns

Every spoke application should embed three consistent capabilities to maintain ecosystem cohesion. These are not separate apps — they are patterns that each spoke implements using shared conventions.

### 14.1 Kanban Integration

Each spoke should proxy its work items through the hub's Kanban system or maintain its own board with the same status taxonomy.

**Status taxonomy (shared across all apps):**
- `backlog` → `planned` → `in_progress` → `review` → `done`

**Implementation pattern:**
```tsx
// Spoke app: fetch cards filtered to this app
const { data: cards } = useQuery({
  queryKey: ["/api/kanban/cards", { appId: MY_APP_ID }],
});

// Push card updates back to hub
await apiRequest("PATCH", `/api/kanban/cards/${id}`, { status: "done" });
```

**UI requirement:** Every spoke should have a "Work" or "Tasks" tab/section showing its Kanban cards using the OutputCard + ResultsGrid pattern.

### 14.2 AI Agent Pattern

Each spoke should embed a contextual AI chat panel that:
1. Receives a system prompt from the hub via `GET /api/agent-prompt/:appId`
2. Includes app-specific context (its data, metrics, documentation)
3. Uses the same chat UI pattern (message list + input)

**Hub-sync script pattern:**
```bash
# Spoke apps can auto-fetch their agent prompt
curl -H "X-API-Key: $HUB_API_KEY" \
  $HUB_URL/api/agent-prompt/$APP_SLUG > .agent-prompt.md
```

**UI requirement:** Every spoke should have an "AI" or "Agent" section in its sidebar/navigation that opens a chat panel.

### 14.3 Documentation Governance

Each spoke must maintain documentation that the hub can sync and audit:

**Required sections (enforced by hub directives):**
- `overview`, `architecture`, `data_model`, `api`, `deployment`, `monitoring`, `changelog`

**Sync pattern:**
```tsx
// Hub pulls docs from spoke
GET /api/apps/:id/docs → { sections, lastSyncedAt, qualityScore }

// Spoke pushes doc updates
POST /api/apps/:id/sync → triggers doc quality re-evaluation
```

**UI requirement:** Every spoke should display its doc quality score (using `QualityBadge`) and provide an inline documentation editor.

### 14.4 Metrics Emission

Every spoke should emit standardized metric envelopes to the hub's metrics stream:

```json
{
  "metricKey": "attrition_rate",
  "value": 12.4,
  "unit": "%",
  "tags": ["engineering", "q1_2026"],
  "dimensions": { "department": "Engineering", "period": "Q1" }
}
```

**API:** `POST /api/metrics` with `X-API-Key` header

**UI requirement:** Spokes should display their own metrics using `MetricTicker` and `MetricCard` from the PA Design Kit.

---

## 15. Sidebar Navigation Taxonomy

All apps in the ecosystem should organize navigation by **purpose**, not by feature type:

| Group | Purpose | Example Items |
|---|---|---|
| **Analytics** | Data viewing and insight | Dashboard, Cockpit, MetricMarket, Metrics Stream |
| **Execution** | Active work and task management | Kanban, Pipelines, Directives, Input Requests |
| **Registry** | Canonical data management | App Registry, Field Library, Field Alignment |
| **Intelligence** | AI-powered capabilities | AI Agent, Documentation, Architecture |
| **Admin & Tools** | Configuration and development | Dev Context, Workbench, Settings, Logs |

Spokes should map their features into these categories for consistent cross-app navigation.
