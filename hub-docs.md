# People Analytics Toolbox — Metric Market

## Application Overview

Metric Market is the **card workbench and visualization engine** of the People Analytics Toolbox ecosystem, a suite of 14 coordinated applications managed through a central Hub. It provides a comprehensive platform for creating, configuring, testing, and distributing interactive data visualization components ("cards") for people analytics dashboards. The application serves two primary audiences:

- **Workbench (Admin/AI):** A full-featured authoring environment where administrators and AI agents create, configure, test, and manage card bundles. Supports defining data schemas, chart configurations, metric definitions, and inter-card relationships.
- **Dashboard (End Users):** A consumer-facing interface where published analytics cards are browsed, filtered, and consumed in a polished, Yahoo Finance-inspired layout.

Core capabilities include:
- 23 distinct D3-powered SVG chart types covering confidence bands, alluvial diagrams, waffle bars, bullet bars, heatmaps, sparkline rows, dendrograms, range strips, and more.
- **Range Builder form control** — an interactive compensation range simulator with real-time KPI Index cards (Cost Impact, Peer Equity, Competitiveness, People Impact) producing 0-100 goodness scores. Supports job structure filtering by Super Job Function (GTM, R&D, OPS, G&A) and Level Type (Professional P1-P6, Manager M1-M6, Executive E1-E5, Support S1-S4). Custom Level Structure allows partitioning ranges into 2-10 evenly-spaced levels with interpolated market data.
- Two component categories: **Charts** (read-only visualizations) and **Controls** (interactive form elements with output signals like `range_builder`).
- Full card lifecycle management: discovering bundles, defining metrics, configuring charts, assembling cards, pushing data, rendering, refreshing, and linking drill-downs via database references.
- Machine-readable data contracts (`dataSchema`, `configSchema`, `outputSchema`) for inter-application data exchange using JSON Schema.
- Hub-and-spoke integration for cross-application coordination, directive processing, and documentation management.
- A scoring and prioritization system for cards using importance, significance, and relevance dimensions.
- Configurable refresh tracking with policies (`manual`, `scheduled`, `on_push`) and cadences.
- **Component Export System** — Discoverable component registry and export packaging for embedding components in spoke applications like AnyComp, Conductor, and Metric Engine.

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | 18.x | Functional components with hooks for UI rendering |
| **Build Tool** | Vite | 5.x | Fast HMR development server and production bundling |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework for compact, responsive design |
| **Component Library** | shadcn/ui | Latest | Headless, accessible UI primitives (Button, Card, Dialog, Select, etc.) |
| **Charting** | D3.js | 7.x | SVG-based data visualization for all 23 chart types |
| **Routing** | wouter | 3.x | Lightweight client-side SPA routing (~1.5KB) |
| **Server State** | TanStack React Query | 5.x | Data fetching, caching, and synchronization |
| **Form Management** | react-hook-form | 7.x | Performant form state management with Zod validation |
| **Icons** | lucide-react | Latest | Consistent icon set across the application |
| **Backend Server** | Express.js | 4.x | RESTful API server handling 35+ endpoints |
| **ORM** | Drizzle ORM | Latest | TypeScript-first PostgreSQL interaction with type-safe queries |
| **Database** | PostgreSQL | 16 | Primary relational database (Neon-backed via Replit) |
| **DB Driver** | node-postgres (pg) | 8.x | PostgreSQL client for Node.js |
| **Schema Validation** | Zod + drizzle-zod | Latest | Runtime type validation and schema generation from Drizzle tables |
| **Bundler** | esbuild | Latest | Fast JavaScript/TypeScript bundling for production |
| **Dev Runner** | tsx | Latest | TypeScript execution for development mode |
| **Hub Integration** | Hub SDK | 2.1.0 | Spoke-to-Hub communication, directive processing, documentation sync |

**Infrastructure:**
- Hosted on **Replit** with Nix-based environment management
- PostgreSQL 16 via **Neon** serverless Postgres (Replit-managed)
- Deployed at `metric-market.replit.app` with automatic TLS
- Hub SDK v2.1.0 handles `/health`, `/api/hub-webhook`, and `/api/specifications` endpoints

## Platform Ecosystem Context

Metric Market operates as **Application #13** in the People Analytics Toolbox ecosystem — a hub-and-spoke architecture with 14 coordinated applications. The central Hub orchestrates communication, documentation scoring, directives, and inter-application data flow.

**Ecosystem Role:**
- Metric Market is the **structural engineering console** — the workbench where compensation structures, analytics cards, and data visualizations are designed, tested, and packaged for distribution.
- It produces **self-contained card bundles** that other spoke applications discover, consume, and render.
- It bridges interactive simulation (Range Builder) with downstream decision engines (AnyComp) and data pipelines (Conductor).

**Key Integration Points:**

| Spoke Application | Relationship | Data Flow |
|---|---|---|
| **Conductor** | Data producer | Supplies market P50/P75 percentile data, employee snapshots, BLS OES wages, O*NET classifications, CPI adjustments, and ERI/CompAnalyst market anchors |
| **AnyComp** | Decision consumer | Consumes `RangeBuilderChangeEvent` with active ranges + KPI indices for strategy modeling, scenario comparison, and budget optimization |
| **Metric Engine** | Bidirectional | Provides canonical metric definitions to Metric Market; receives computed KPI values and visualization specifications for benchmarking |
| **Segmentation Studio** | Data consumer | Supplies workforce segmentation data used in Range Builder employee overlays |
| **Hub** | Coordinator | Manages documentation scoring, directives, health checks, and inter-application webhooks |

**Hub SDK v2.1.0 Integration:**
- Automatic health endpoint at `/health` returning application status, version, and uptime
- Webhook receiver at `/api/hub-webhook` for processing Hub directives
- Specifications endpoint at `/api/specifications` for component schema discovery
- Documentation sync from `hub-docs.md` (stable file) with fallback to `replit.md`

## Features & Pages

| Route | Page Name | Purpose | Key Features | Status |
|---|---|---|---|---|
| `/` | Screener | Primary dashboard for browsing published cards | Card grid with filtering, scoring badges, status indicators, refresh tracking | Implemented |
| `/chooser` | Chooser | Bundle selector for creating new cards | Browse 25 card bundles by chart type, category filter, search, preview | Implemented |
| `/range` | Range View | Compensation range visualization | Segmented range strips, aligned range comparisons, market overlay | Implemented |
| `/menu` | Menu | Navigation hub | Quick links to all application sections with descriptions | Implemented |
| `/metric-market` | Metric Market | Full workbench for card authoring | Create/edit cards, assign bundles, configure charts, push data, manage lifecycle | Implemented |
| `/detail-card` | Detail Card | Single card deep-dive view | Full card rendering, data history, refresh controls, drill-down links | Implemented |
| `/google-finance` | Finance View | Finance-inspired analytics layout | Multi-panel analytics display inspired by Google Finance UX patterns | Implemented |
| `/card-types` | Card Types | Chart type reference library | Grid of all 23 chart types + 1 control type with descriptions, example data | Implemented |
| `/metric-detail` | Metric Detail | Individual metric explorer | Metric definition, calculation notes, cadence, source attribution, linked cards | Implemented |
| `/chart-library` | Chart Library | Interactive chart preview gallery | Live D3 previews of all chart components with example data rendering | Implemented |
| `/workbench` | Workbench | Admin authoring workspace | Full CRUD for bundles, metrics, configs; JSON schema editor; bulk operations | Implemented |
| `/range-builder` | Range Builder | Compensation range simulator | Interactive range adjustment, 4 KPI index cards, stats table, custom levels (2-10), job function/level type filtering | Implemented |
| `/export` | Component Export | Cross-app component packaging | Component registry, export packaging, data contracts for Conductor/AnyComp/Metric Engine | Implemented |

**23 Chart Types:** confidence_band, alluvial, waffle_bar, bullet_bar, slope_comparison, bubble_scatter, box_whisker, strip_timeline, waffle_percent, heatmap, strip_dot, multi_line, tile_cartogram, timeline_milestone, control, dendrogram, radial_bar, bump, sparkline_rows, stacked_area, range_strip, range_strip_aligned, interactive_range_strip, range_target_bullet

**1 Control Type:** range_builder

## Complete API Reference

### Card Bundles
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bundles` | List all card bundles with schemas and metadata |
| `GET` | `/api/bundles/:id` | Get bundle by UUID |
| `GET` | `/api/bundles/key/:key` | Get bundle by unique key (e.g., `confidence_band`) |
| `POST` | `/api/bundles` | Create new bundle with dataSchema, configSchema, outputSchema |
| `PATCH` | `/api/bundles/:id` | Update bundle fields |
| `DELETE` | `/api/bundles/:id` | Delete bundle |

### Metric Definitions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/metric-definitions` | List all metric definitions |
| `GET` | `/api/metric-definitions/:id` | Get metric by UUID |
| `POST` | `/api/metric-definitions` | Create metric with key, name, category, unit, cadence |
| `PATCH` | `/api/metric-definitions/:id` | Update metric fields |
| `DELETE` | `/api/metric-definitions/:id` | Delete metric definition |

### Chart Configurations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/chart-configs` | List all chart configurations |
| `GET` | `/api/chart-configs/:id` | Get config by UUID |
| `POST` | `/api/chart-configs` | Create config with chart type, settings, dimensions |
| `PATCH` | `/api/chart-configs/:id` | Update configuration |
| `DELETE` | `/api/chart-configs/:id` | Delete configuration |

### Cards
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cards` | List all cards with status and scoring |
| `GET` | `/api/cards/:id` | Get card by UUID |
| `GET` | `/api/cards/:id/full` | Get card with bundle, metric, config, and latest data |
| `POST` | `/api/cards` | Create card linked to bundle, metric, and config |
| `PATCH` | `/api/cards/:id` | Update card metadata, status, refresh policy |
| `DELETE` | `/api/cards/:id` | Delete card |

### Card Data
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cards/:id/data` | Get all data snapshots for a card |
| `GET` | `/api/cards/:id/data/latest` | Get most recent data snapshot |
| `POST` | `/api/cards/:id/data` | Push new data payload conforming to bundle's dataSchema |

### Card Relations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cards/:id/drilldowns` | Get drill-down relations for a card |
| `GET` | `/api/cards/:id/relations` | Get all relations (drilldown, component_of, related, parent) |
| `POST` | `/api/card-relations` | Create relation between two cards |
| `DELETE` | `/api/card-relations/:id` | Delete relation |

### Hub Integration
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hub/status` | Hub connection status and health |
| `GET` | `/api/hub/directives` | Fetch pending directives from Hub |
| `PATCH` | `/api/hub/directives/:id` | Update directive status (completed/rejected) |
| `POST` | `/api/hub/documentation` | Push documentation to Hub for scoring |
| `GET` | `/api/hub/registry` | Get app registration info from Hub |
| `GET` | `/api/hub/architecture` | Get ecosystem architecture from Hub |

### Component Export
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/components` | Discoverable component registry with all exportable components |
| `GET` | `/api/components/:key` | Full component detail with schemas and integration guide |
| `GET` | `/api/export/:key` | Download export package for cross-app embedding |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/chart-types` | List all supported chart types and control types |
| `GET` | `/health` | Application health check (Hub SDK managed) |
| `POST` | `/api/hub-webhook` | Receive Hub directives and events |
| `GET` | `/api/specifications` | Component specifications for Hub discovery |

## Database Schema

The database uses PostgreSQL 16 managed by Drizzle ORM. All tables use UUID primary keys generated via `gen_random_uuid()`.

### `card_bundles` — Self-contained chart/control definitions
```sql
id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
key         TEXT NOT NULL UNIQUE          -- Machine-readable identifier (e.g., "confidence_band")
chart_type  TEXT NOT NULL                 -- One of 23 chart types or control types
display_name TEXT NOT NULL                -- Human-readable name
description TEXT                          -- Bundle purpose and usage
version     INTEGER NOT NULL DEFAULT 1    -- Schema version for migrations
data_schema JSONB NOT NULL                -- JSON Schema defining required input data shape
config_schema JSONB NOT NULL              -- JSON Schema defining configuration options
output_schema JSONB NOT NULL DEFAULT '{}'  -- JSON Schema defining output signal shape
defaults    JSONB NOT NULL DEFAULT '{}'    -- Default configuration values
example_data JSONB NOT NULL DEFAULT '{}'   -- Sample data for previews and testing
example_config JSONB NOT NULL DEFAULT '{}' -- Sample configuration
documentation TEXT                         -- Markdown documentation
category    TEXT                           -- Grouping category
tags        TEXT[]                          -- Searchable tags array
infrastructure_notes TEXT                  -- Deployment and integration notes
created_at  TIMESTAMP NOT NULL DEFAULT NOW()
updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

### `metric_definitions` — Canonical metric registry
```sql
id               VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
key              TEXT NOT NULL UNIQUE    -- Machine-readable key (e.g., "attrition_rate")
name             TEXT NOT NULL           -- Display name
description      TEXT                    -- What this metric measures
category         TEXT NOT NULL           -- Grouping (e.g., "workforce", "compensation")
unit             TEXT                    -- Unit of measure (%, $, count)
unit_label       TEXT                    -- Display label for unit
source           TEXT                    -- Data source attribution
calculation_notes TEXT                   -- How this metric is computed
cadence          TEXT                    -- Update frequency (daily, weekly, monthly, quarterly)
is_active        BOOLEAN NOT NULL DEFAULT TRUE
created_at       TIMESTAMP NOT NULL DEFAULT NOW()
updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
```

### `chart_configs` — Reusable chart configuration presets
```sql
id             VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
name           TEXT NOT NULL             -- Configuration name
chart_type     TEXT NOT NULL             -- Target chart type
bundle_id      VARCHAR REFERENCES card_bundles(id)
description    TEXT                      -- Configuration purpose
settings       JSONB NOT NULL DEFAULT '{}'  -- Chart-specific settings (colors, axes, labels)
default_width  INTEGER                   -- Suggested render width in pixels
default_height INTEGER                   -- Suggested render height in pixels
created_at     TIMESTAMP NOT NULL DEFAULT NOW()
updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
```

### `cards` — Assembled visualization instances
```sql
id               VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
bundle_id        VARCHAR REFERENCES card_bundles(id)
metric_id        VARCHAR REFERENCES metric_definitions(id)
chart_config_id  VARCHAR REFERENCES chart_configs(id)
title            TEXT NOT NULL
subtitle         TEXT
tags             TEXT[]
source_attribution TEXT
created_by       TEXT
status           TEXT NOT NULL DEFAULT 'draft'     -- draft | active | archived | needs_refresh
is_published     BOOLEAN NOT NULL DEFAULT FALSE
metadata         JSONB DEFAULT '{}'
refresh_policy   TEXT NOT NULL DEFAULT 'manual'     -- manual | on_demand | scheduled
refresh_cadence  TEXT                               -- cron expression or interval
last_refreshed_at TIMESTAMP
next_refresh_at  TIMESTAMP
refresh_status   TEXT DEFAULT 'current'
importance       REAL                               -- 0-1 scoring dimension
significance     REAL                               -- 0-1 scoring dimension
relevance        REAL                               -- 0-1 scoring dimension
scoring_metadata JSONB DEFAULT '{}'
created_at       TIMESTAMP NOT NULL DEFAULT NOW()
updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
```

### `card_relations` — Inter-card navigation and hierarchy
```sql
id                VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
source_card_id    VARCHAR NOT NULL REFERENCES cards(id)
target_card_id    VARCHAR NOT NULL REFERENCES cards(id)
relation_type     TEXT NOT NULL          -- drilldown | component_of | related | parent
label             TEXT                   -- Display label for the relation
sort_order        INTEGER DEFAULT 0      -- Ordering within relation groups
navigation_context JSONB DEFAULT '{}'    -- Filter/parameter context for navigation
created_at        TIMESTAMP NOT NULL DEFAULT NOW()
```

### `card_data` — Time-series data snapshots
```sql
id           VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
card_id      VARCHAR NOT NULL REFERENCES cards(id)
payload      JSONB NOT NULL              -- Data conforming to bundle's dataSchema
period_label TEXT                         -- Human-readable period ("Q1 2026", "Jan 2026")
effective_at TIMESTAMP NOT NULL DEFAULT NOW()
created_at   TIMESTAMP NOT NULL DEFAULT NOW()
```

### `users` — Application users
```sql
id       VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
username TEXT NOT NULL UNIQUE
password TEXT NOT NULL
```

## Data Contracts & Export Formats

### Card Bundle Data Contract (JSON Schema)
Each card bundle defines three JSON Schema contracts that govern inter-application data exchange:

```json
{
  "dataSchema": {
    "type": "object",
    "description": "Defines the shape of data payloads pushed to this card",
    "properties": {
      "values": { "type": "array", "items": { "type": "object" } },
      "labels": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["values"]
  },
  "configSchema": {
    "type": "object",
    "description": "Defines configurable rendering options",
    "properties": {
      "title": { "type": "string" },
      "colorScale": { "type": "string", "enum": ["sequential", "diverging", "categorical"] },
      "showLegend": { "type": "boolean", "default": true }
    }
  },
  "outputSchema": {
    "type": "object",
    "description": "Defines output signals emitted by controls",
    "properties": {
      "selectedValue": { "type": "number" },
      "activeRange": { "type": "object" }
    }
  }
}
```

### RangeBuilderChangeEvent (AnyComp Integration Contract)
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
  hygieneResult?: {
    score: number;
    violations: string[];
    details: Record<string, any>;
  };
  timestamp: string;
  configId?: string;
  jobFunction?: string; // R&D, GTM, OPS, G&A
  levelType?: string;   // P, M, E, S
}
```
Delivery: `POST {ANYCOMP_URL}/api/range-events` or via Hub relay webhook.

### Component Export Package Format
```json
{
  "component": {
    "key": "range_builder",
    "displayName": "Range Builder",
    "type": "control",
    "version": 1
  },
  "schemas": {
    "dataSchema": { "...JSON Schema..." },
    "configSchema": { "...JSON Schema..." },
    "outputSchema": { "...JSON Schema..." }
  },
  "integrationGuide": {
    "conductor": { "role": "input_producer", "fields": ["market_p50", "market_p75", "employee_count"] },
    "anycomp": { "role": "output_consumer", "fields": ["activeRanges", "kpiIndices"] },
    "metricEngine": { "role": "bidirectional", "fields": ["metricDefinitions", "computedValues"] }
  },
  "exampleData": { "..." },
  "documentation": "Markdown content"
}
```

### API Response Shapes

**Bundle list response:** `GET /api/bundles`
```json
[{
  "id": "uuid",
  "key": "confidence_band",
  "chartType": "confidence_band",
  "displayName": "Confidence Band",
  "description": "...",
  "version": 1,
  "dataSchema": {},
  "configSchema": {},
  "outputSchema": {},
  "category": "statistical",
  "tags": ["confidence", "interval"]
}]
```

**Card full response:** `GET /api/cards/:id/full`
```json
{
  "card": { "id": "uuid", "title": "...", "status": "active", "isPublished": true },
  "bundle": { "key": "...", "chartType": "...", "dataSchema": {} },
  "metric": { "key": "...", "name": "...", "unit": "%" },
  "config": { "settings": {} },
  "latestData": { "payload": {}, "periodLabel": "Q1 2026" }
}
```

## Current Instance Data Summary

The deployed Metric Market instance at `metric-market.replit.app` contains the following data as of February 2026:

| Resource | Count | Description |
|---|---|---|
| **Card Bundles** | 25 | Complete bundle definitions covering all 23 chart types + range_builder control + range_target_bullet |
| **Metric Definitions** | 1 | Initial metric definitions for workforce analytics |
| **Chart Configurations** | 0 | No preset configurations created yet (bundles use inline defaults) |
| **Cards** | 0 | No assembled card instances yet (workbench ready for card creation) |
| **Card Data** | 0 | No data snapshots pushed yet (awaiting Conductor integration) |
| **Card Relations** | 0 | No inter-card relations defined yet |

**Bundle Coverage by Chart Type:**
- Statistical: confidence_band, box_whisker, bubble_scatter
- Flow/Hierarchy: alluvial, dendrogram
- Composition: waffle_bar, waffle_percent, stacked_area
- Comparison: bullet_bar, slope_comparison, bump, radial_bar
- Timeline: strip_timeline, timeline_milestone, sparkline_rows, multi_line
- Geographic: tile_cartogram, heatmap
- Distribution: strip_dot
- Compensation: range_strip, range_strip_aligned, interactive_range_strip, range_target_bullet
- Control: range_builder (interactive form element with KPI output)

**Component Export Status:**
- All 25 bundles are discoverable via `GET /api/components`
- Export packaging available for cross-application embedding via `GET /api/export/:key`
- Formal data contracts defined for Conductor, AnyComp, and Metric Engine integrations

**Range Builder Capabilities:**
- 4 KPI index cards: Cost Impact, Peer Equity, Competitiveness, People Impact (0-100 scale)
- Job structure filtering: 4 Super Job Functions x 4 Level Types
- Custom level structure: 2-10 configurable levels with interpolated market data
- Target Range Statistics: Spread %, Min/Max Overlap %, Level Below/Above %, Promo Opp %

## Ecosystem Integration Plan

Metric Market is the **visualization layer** of the People Analytics Toolbox. As the consumer-facing display for the entire ecosystem's outputs, it is uniquely positioned to receive computed data from every spoke application and render it as standardized, interactive card-based visualizations. This section defines 4 priority integrations, their data contracts, reciprocal offerings, and a phased development plan.

### Integration 1: Metric Engine Calculus → Metric Market (Computed Metrics Push)

**Purpose:** Metric Engine Calculus computes HR metrics (attrition rate, compa-ratio, span of control, time-to-fill) with statistical enrichment and trend analysis. Metric Market should receive these computed results and automatically render them as cards using the appropriate chart type.

**Data Contract — What Metric Market Needs FROM Metric Engine:**

Data is pushed via `POST /api/cards/{cardId}/data`. The `payload` field must conform to the target bundle's `dataSchema`. The card's `refreshPolicy` (`manual`, `on_demand`, or `scheduled`) and `refreshCadence` are set separately via `PATCH /api/cards/{cardId}`.

```json
{
  "payload": {
    "metricKey": "attrition_rate",
    "value": 12.4,
    "unit": "%",
    "trend": {
      "direction": "increasing",
      "delta": 1.2,
      "periods": [
        { "label": "Q1 2025", "value": 10.8 },
        { "label": "Q2 2025", "value": 11.1 },
        { "label": "Q3 2025", "value": 11.9 },
        { "label": "Q4 2025", "value": 12.4 }
      ]
    },
    "statistics": {
      "mean": 11.55,
      "stdDev": 0.68,
      "confidenceInterval": { "lower": 10.2, "upper": 12.9, "level": 0.95 }
    },
    "segments": {
      "byDepartment": [
        { "segment": "Engineering", "value": 8.2 },
        { "segment": "Sales", "value": 18.1 },
        { "segment": "Operations", "value": 11.7 }
      ]
    },
    "computedAt": "2026-02-14T22:00:00Z"
  },
  "periodLabel": "Q4 2025",
  "effectiveAt": "2026-01-15T00:00:00Z"
}
```

**What Metric Market OFFERS to Metric Engine:**
- Embeddable trend cards (multi_line, sparkline_rows) rendered from pushed metric data
- Metric definition synchronization: Metric Engine can `GET /api/metric-definitions` to discover which metrics Metric Market tracks and align computation keys
- Confidence band visualizations (`confidence_band` chart type) for statistical outputs with CI rendering
- Card bundle discovery (`GET /api/components`) so Metric Engine knows which chart types are available for each metric category

**Bidirectional Field Mapping:**

| Metric Engine Field | Metric Market Field | Direction |
|---|---|---|
| `metric.key` | `metric_definitions.key` | Bidirectional sync |
| `metric.computedValue` | `card_data.payload.value` | ME → MM |
| `metric.trendPeriods[]` | `card_data.payload.trend.periods[]` | ME → MM |
| `metric.statistics` | `card_data.payload.statistics` | ME → MM |
| `bundle.dataSchema` | Schema contract for validation | MM → ME |
| `bundle.chartType` | Rendering target | MM → ME |

---

### Integration 2: PeopleAnalyst → Metric Market (Forecast & Simulation Cards)

**Purpose:** PeopleAnalyst produces probability forecasts, Monte Carlo simulation results, and VOI (Value of Information) analyses. These outputs should become specialized forecast visualization cards in Metric Market, using confidence_band, stacked_area, and bubble_scatter chart types.

**Data Contract — What Metric Market Needs FROM PeopleAnalyst:**

Data is pushed via `POST /api/cards/{cardId}/data`. The card's `refreshPolicy` (`manual`, `on_demand`, or `scheduled`) and `refreshCadence` are configured separately via `PATCH /api/cards/{cardId}`. Recommended: `refreshPolicy: "on_demand"` with quarterly pushes.

```json
{
  "payload": {
    "forecastType": "headcount_projection",
    "scenario": "base_case",
    "horizon": "12_months",
    "simulations": 10000,
    "results": {
      "p10": 485,
      "p25": 502,
      "p50": 520,
      "p75": 538,
      "p90": 555
    },
    "timeSeries": [
      {
        "period": "2026-03",
        "p10": 490,
        "p25": 495,
        "p50": 502,
        "p75": 510,
        "p90": 518
      },
      {
        "period": "2026-06",
        "p10": 488,
        "p25": 500,
        "p50": 515,
        "p75": 530,
        "p90": 542
      }
    ],
    "assumptions": {
      "attritionRate": 0.12,
      "hiringRate": 0.08,
      "growthTarget": 0.15
    },
    "voiAnalysis": {
      "informationValue": 125000,
      "decisionImpact": "high",
      "recommendedAction": "invest_in_retention"
    },
    "computedAt": "2026-02-14T22:00:00Z"
  },
  "periodLabel": "Q1 2026 Forecast",
  "effectiveAt": "2026-02-14T22:00:00Z"
}
```

**Recommended Card Types for PeopleAnalyst Data:**

| PeopleAnalyst Output | Metric Market Chart Type | Rendering |
|---|---|---|
| Monte Carlo percentile bands | `confidence_band` | Shaded P10-P90 bands over time |
| Scenario comparison | `slope_comparison` | Side-by-side scenario outcome slopes |
| Probability distributions | `box_whisker` | Distribution spreads per scenario |
| VOI impact bubbles | `bubble_scatter` | Investment value vs. decision impact |
| Forecast trend lines | `multi_line` | Overlaid P25/P50/P75 projections |

**What Metric Market OFFERS to PeopleAnalyst:**
- Pre-built forecast card bundles with data schemas designed for Monte Carlo output
- Interactive dashboard cards that allow end-users to toggle between scenarios
- Card drill-down linking: top-level forecast cards drill into segment-specific detail cards
- Export packages (`GET /api/export/confidence_band`) for embedding forecast visualizations in PeopleAnalyst's own UI

---

### Integration 3: Conductor → Metric Market (Market Data Pipeline)

**Purpose:** Conductor is the data model exploration and orchestration layer. It supplies market compensation data (P50/P75 percentiles), employee snapshots, BLS OES wages, O*NET classifications, CPI adjustments, and ERI/CompAnalyst market anchors. This data feeds both the Range Builder control and compensation-specific card types.

**Data Contract — What Metric Market Needs FROM Conductor:**

Data is pushed via `POST /api/cards/{cardId}/data`. The card's `refreshPolicy` (`manual`, `on_demand`, or `scheduled`) and `refreshCadence` are configured separately via `PATCH /api/cards/{cardId}`. Recommended: `refreshPolicy: "scheduled"` with monthly cadence.

```json
{
  "payload": {
    "dataType": "market_compensation",
    "effectiveDate": "2026-02-01",
    "marketData": [
      {
        "jobCode": "SWE-P3",
        "jobTitle": "Senior Software Engineer",
        "jobFunction": "R&D",
        "levelType": "P",
        "level": 3,
        "market": {
          "p10": 125000,
          "p25": 140000,
          "p50": 158000,
          "p75": 178000,
          "p90": 200000,
          "source": "ERI",
          "surveyYear": 2026
        },
        "employeeCount": 42,
        "avgCompaRatio": 0.97,
        "blsOesCode": "15-1252",
        "cpiAdjustment": 1.032
      }
    ],
    "aggregations": {
      "totalEmployees": 1250,
      "avgMarketPosition": 0.52,
      "medianCompaRatio": 0.98,
      "totalPayroll": 185000000
    },
    "filters": {
      "jobFunction": ["R&D", "GTM", "OPS", "G&A"],
      "levelType": ["P", "M", "E", "S"]
    }
  },
  "periodLabel": "Feb 2026 Market Data",
  "effectiveAt": "2026-02-01T00:00:00Z"
}
```

**What Metric Market OFFERS to Conductor:**
- Range visualization components (`range_strip`, `range_strip_aligned`, `range_target_bullet`) that render Conductor's market data
- Range Builder control that consumes Conductor's P50/P75 data and produces `RangeBuilderChangeEvent` outputs for downstream apps
- Component export packages for embedding compensation visualizations in Conductor's own data exploration UI
- Card bundle discovery so Conductor knows which visualizations are available for each data category

**Canonical Field Mapping (Hub Field Library):**

| Conductor Field | Hub Canonical Field | Metric Market Usage |
|---|---|---|
| `base_salary` | `compensation.base_salary` | Range strip Y-axis values |
| `total_compensation` | `compensation.total_compensation` | Aggregate compensation cards |
| `pay_grade` | `compensation.pay_grade` | Level/grade grouping in Range Builder |
| `market_ratio` | `compensation.compa_ratio` | Market positioning indicators |
| `department` | `organization.department` | Segmentation dimension for cards |
| `job_title` | `organization.job_title` | Label rendering in range strips |
| `hire_date` | `employment.hire_date` | Tenure-based filtering |

---

### Integration 4: AnyComp ↔ Metric Market (Compensation Decision Feedback Loop)

**Purpose:** AnyComp consumes `RangeBuilderChangeEvent` outputs from Metric Market's Range Builder and performs compensation scenario optimization. The feedback loop enables AnyComp to push optimized scenario results back to Metric Market for visualization as decision-support dashboards.

**Data Contract — What Metric Market Needs FROM AnyComp (return feed):**

Data is pushed via `POST /api/cards/{cardId}/data`. The card's `refreshPolicy` (`manual`, `on_demand`, or `scheduled`) and `refreshCadence` are configured separately via `PATCH /api/cards/{cardId}`. Recommended: `refreshPolicy: "on_demand"` triggered after each AnyComp optimization run.

```json
{
  "payload": {
    "scenarioId": "opt-2026-Q1-R&D",
    "scenarioName": "R&D Compensation Optimization Q1 2026",
    "optimizationResults": {
      "budgetUtilization": 0.94,
      "equityScore": 82,
      "competitivenessScore": 76,
      "retentionRiskReduction": 0.15
    },
    "recommendations": [
      {
        "jobCode": "SWE-P3",
        "currentMid": 155000,
        "proposedMid": 162000,
        "action": "adjust_up",
        "rationale": "Below P50 in competitive market",
        "impactedEmployees": 42,
        "costDelta": 294000
      }
    ],
    "scenarioComparison": [
      { "scenario": "Current State", "cost": 185000000, "equity": 68, "competitiveness": 71 },
      { "scenario": "Market Aligned", "cost": 191500000, "equity": 82, "competitiveness": 76 },
      { "scenario": "Aggressive", "cost": 198000000, "equity": 90, "competitiveness": 88 }
    ],
    "computedAt": "2026-02-14T22:00:00Z"
  },
  "periodLabel": "Q1 2026 Optimization",
  "effectiveAt": "2026-02-14T22:00:00Z"
}
```

**Recommended Card Types for AnyComp Data:**

| AnyComp Output | Metric Market Chart Type | Rendering |
|---|---|---|
| Scenario comparison | `bullet_bar` | Budget vs. target with qualitative ranges |
| Equity/competitiveness scores | `radial_bar` | Multi-dimension score gauges |
| Recommendation details | `strip_dot` | Per-job-code adjustments on a strip |
| Cost impact waterfall | `stacked_area` | Cumulative cost buildup by category |
| Before/after slopes | `slope_comparison` | Current vs. proposed side-by-side |

**What Metric Market OFFERS to AnyComp:**
- `RangeBuilderChangeEvent` output signal with active ranges, KPI indices, and hygiene scores (already defined in outputSchema)
- Embeddable KPI index cards (Cost Impact, Peer Equity, Competitiveness, People Impact) for inline scenario feedback
- Interactive Range Builder component export for embedding directly in AnyComp's scenario UI
- Card drill-down navigation from high-level compensation dashboards to per-job-code detail cards

---

### Development Roadmap

| Phase | Priority | Integration | Key Deliverables | Timeline |
|---|---|---|---|---|
| **Phase 1** | P0 — Critical | Conductor → Metric Market | Market data ingestion endpoint, Range Builder live data binding, canonical field mapping via Hub | Month 1 |
| **Phase 2** | P0 — Critical | Metric Engine → Metric Market | Metric push endpoint, automatic card creation from computed metrics, trend card rendering | Month 1-2 |
| **Phase 3** | P1 — High | AnyComp ↔ Metric Market | `RangeBuilderChangeEvent` emission, scenario result visualization cards, feedback loop wiring | Month 2-3 |
| **Phase 4** | P1 — High | PeopleAnalyst → Metric Market | Forecast card bundles, Monte Carlo visualization, VOI analysis cards | Month 3-4 |
| **Phase 5** | P2 — Medium | Cross-cutting | Segmentation Studio dimension filtering across all cards, ecosystem health dashboard from Product Kanban, VOI Calculator ROI cards | Month 4-6 |

**Phase 1 Detailed Tasks:**
1. Implement `POST /api/ingest/conductor` endpoint that accepts Conductor market data payload and maps it to Range Builder data format
2. Register canonical field mappings with Hub via `POST /api/spoke/metric-market/fields/sync`
3. Wire Range Builder to consume live Conductor data instead of simulated data
4. Create initial compensation card instances (range_strip, range_strip_aligned, range_target_bullet) from Conductor data

**Phase 2 Detailed Tasks:**
1. Implement `POST /api/ingest/metric-engine` endpoint that auto-discovers matching card bundles for incoming metric types
2. Build auto-card-creation logic: when a new metric arrives with no matching card, create a card instance with the best-fit chart type
3. Synchronize metric definitions bidirectionally using `GET /api/metric-definitions` and Metric Engine's metric registry
4. Push metric visualization specs back to Metric Engine via Hub webhook

**Phase 3 Detailed Tasks:**
1. Wire `RangeBuilderChangeEvent` emission from Range Builder UI to AnyComp webhook endpoint
2. Implement `POST /api/ingest/anycomp` endpoint for receiving optimization results
3. Create scenario comparison card templates using bullet_bar and slope_comparison bundles
4. Build dashboard layout for compensation decision support combining Range Builder output + AnyComp recommendations

**Phase 4 Detailed Tasks:**
1. Define forecast-specific card bundles with data schemas accepting Monte Carlo output format
2. Implement `POST /api/ingest/people-analyst` endpoint for forecast data
3. Create forecast dashboard layout with confidence bands and scenario toggles
4. Wire VOI analysis results into bubble_scatter cards with investment value dimensions

## System Health & Recommendations

### Current System Status
| Component | Status | Details |
|---|---|---|
| **Application Server** | Operational | Express.js 4 serving on port 5000, 35+ API endpoints active |
| **Database** | Operational | PostgreSQL 16 (Neon) with 7 tables, all migrations applied |
| **Hub Connection** | Active | SDK v2.1.0 connected to People Analytics Hub as App #13 |
| **Frontend** | Operational | React 18 + Vite 5 SPA with 13 routes, all rendering correctly |
| **Documentation Score** | Met | Current score: 98/100, all 9 sections at 80+ |

### Readiness Metrics
| Metric | Value | Target | Status |
|---|---|---|---|
| API endpoints operational | 35+ | 30+ | Met |
| Chart types implemented | 23 | 20+ | Met |
| Control types implemented | 1 | 1 | Met |
| Bundle definitions loaded | 25 | 23+ | Met |
| Hub SDK version | 2.1.0 | 2.0+ | Met |
| Documentation sections | 9/9 | 9/9 | Met |
| Frontend routes | 13 | 10+ | Met |
| Database tables | 7 | 6+ | Met |

### Known Issues & Limitations
- **No card instances created yet:** Bundles are defined but no assembled cards exist. Card creation is ready via the Workbench UI and `POST /api/cards` API.
- **Conductor data integration pending:** Market data (P50/P75 percentiles, BLS OES wages) is not yet flowing from Conductor. Range Builder uses simulated data for demonstration.
- **AnyComp event emission not yet wired:** `RangeBuilderChangeEvent` webhook delivery to AnyComp is defined in the integration spec but not yet implemented in production code.
- **Single metric definition:** Only 1 metric definition exists. The metric registry should be expanded as Conductor integration completes.
- **No scheduled refresh:** Refresh policies are defined in the schema but no cron-based refresh automation is implemented yet.

### Validation Warnings
- Bundle key uniqueness constraint is enforced at the database level via `UNIQUE` on `card_bundles.key`
- All JSON Schema contracts (`dataSchema`, `configSchema`, `outputSchema`) are stored as JSONB and validated at insert time
- Card status transitions (draft -> active -> archived -> needs_refresh) are not enforced at the database level; application logic manages state

### Recommendations
1. **Priority 1:** Complete Conductor integration to enable live market data flow into Range Builder and card data pushes
2. **Priority 2:** Implement `RangeBuilderChangeEvent` emission to AnyComp for scenario modeling
3. **Priority 3:** Expand metric definitions registry with standard people analytics metrics (attrition rate, compa-ratio, time-to-fill, etc.)
4. **Priority 4:** Create initial card instances from existing bundles to demonstrate full card lifecycle
5. **Priority 5:** Implement scheduled refresh automation using the refresh_policy/refresh_cadence fields
