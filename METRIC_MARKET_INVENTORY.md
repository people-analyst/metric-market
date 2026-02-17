# Metric Market — Codebase Inventory

**Application:** Metric Market (People Analytics Toolbox)  
**Version:** Current as of February 2026  
**Source:** `metric-market.replit.app`  
**Stack:** TypeScript, React, Express, PostgreSQL (Neon), Drizzle ORM, D3.js, Vite

---

## Table of Contents

1. [Database Tables](#1-database-tables)
2. [Enums & Constants](#2-enums--constants)
3. [API Endpoints](#3-api-endpoints)
4. [Chart Types (25)](#4-chart-types)
5. [Control Types (1)](#5-control-types)
6. [PA Design Kit Components (15)](#6-pa-design-kit-components)
7. [Data Contracts](#7-data-contracts)
8. [Ingest Endpoints & Integration Targets](#8-ingest-endpoints--integration-targets)
9. [Domain Constants — Compensation](#9-domain-constants--compensation)
10. [Tile Cartogram Geographic Presets](#10-tile-cartogram-geographic-presets)
11. [Design System Style Tokens](#11-design-system-style-tokens)
12. [Frontend Pages & Routes](#12-frontend-pages--routes)
13. [Integration Architecture](#13-integration-architecture)
14. [Metric-to-Chart Inference Rules](#14-metric-to-chart-inference-rules)
15. [File Manifest](#15-file-manifest)

---

## 1. Database Tables

**Schema file:** `shared/schema.ts`  
**ORM:** Drizzle (PostgreSQL)

### 1.1 `users`

| Column   | Type    | Constraints                |
|----------|---------|----------------------------|
| id       | varchar | PK, default `gen_random_uuid()` |
| username | text    | NOT NULL, UNIQUE           |
| password | text    | NOT NULL                   |

### 1.2 `card_bundles`

| Column              | Type      | Constraints / Notes                         |
|---------------------|-----------|---------------------------------------------|
| id                  | varchar   | PK, default `gen_random_uuid()`             |
| key                 | text      | NOT NULL, UNIQUE — bundle identifier        |
| chartType           | text      | NOT NULL                                    |
| displayName         | text      | NOT NULL                                    |
| description         | text      |                                             |
| version             | integer   | NOT NULL, default 1                         |
| dataSchema          | jsonb     | NOT NULL — JSON Schema for input data       |
| configSchema        | jsonb     | NOT NULL — JSON Schema for config options   |
| outputSchema        | jsonb     | NOT NULL, default `{}`                      |
| defaults            | jsonb     | NOT NULL, default `{}`                      |
| exampleData         | jsonb     | NOT NULL, default `{}`                      |
| exampleConfig       | jsonb     | NOT NULL, default `{}`                      |
| documentation       | text      |                                             |
| category            | text      |                                             |
| tags                | text[]    |                                             |
| infrastructureNotes | text      |                                             |
| createdAt           | timestamp | NOT NULL, default now()                     |
| updatedAt           | timestamp | NOT NULL, default now()                     |

### 1.3 `metric_definitions`

| Column           | Type      | Constraints / Notes             |
|------------------|-----------|----------------------------------|
| id               | varchar   | PK, default `gen_random_uuid()` |
| key              | text      | NOT NULL, UNIQUE                |
| name             | text      | NOT NULL                        |
| description      | text      |                                 |
| category         | text      | NOT NULL                        |
| unit             | text      |                                 |
| unitLabel        | text      |                                 |
| source           | text      |                                 |
| calculationNotes | text      |                                 |
| cadence          | text      |                                 |
| isActive         | boolean   | NOT NULL, default true          |
| createdAt        | timestamp | NOT NULL, default now()         |
| updatedAt        | timestamp | NOT NULL, default now()         |

### 1.4 `chart_configs`

| Column        | Type      | Constraints / Notes             |
|---------------|-----------|----------------------------------|
| id            | varchar   | PK, default `gen_random_uuid()` |
| name          | text      | NOT NULL                        |
| chartType     | text      | NOT NULL                        |
| bundleId      | varchar   | FK → `card_bundles.id`          |
| description   | text      |                                 |
| settings      | jsonb     | NOT NULL, default `{}`          |
| defaultWidth  | integer   |                                 |
| defaultHeight | integer   |                                 |
| createdAt     | timestamp | NOT NULL, default now()         |
| updatedAt     | timestamp | NOT NULL, default now()         |

### 1.5 `cards`

| Column           | Type      | Constraints / Notes             |
|------------------|-----------|----------------------------------|
| id               | varchar   | PK, default `gen_random_uuid()` |
| bundleId         | varchar   | FK → `card_bundles.id`          |
| metricId         | varchar   | FK → `metric_definitions.id`    |
| chartConfigId    | varchar   | FK → `chart_configs.id`         |
| title            | text      | NOT NULL                        |
| subtitle         | text      |                                 |
| tags             | text[]    |                                 |
| sourceAttribution| text      |                                 |
| createdBy        | text      |                                 |
| status           | text      | NOT NULL, default "draft"       |
| isPublished      | boolean   | NOT NULL, default false         |
| metadata         | jsonb     | default `{}`                    |
| refreshPolicy    | text      | NOT NULL, default "manual"      |
| refreshCadence   | text      |                                 |
| lastRefreshedAt  | timestamp |                                 |
| nextRefreshAt    | timestamp |                                 |
| refreshStatus    | text      | default "current"               |
| importance       | real      |                                 |
| significance     | real      |                                 |
| relevance        | real      |                                 |
| scoringMetadata  | jsonb     | default `{}`                    |
| createdAt        | timestamp | NOT NULL, default now()         |
| updatedAt        | timestamp | NOT NULL, default now()         |

### 1.6 `card_relations`

| Column            | Type      | Constraints / Notes             |
|-------------------|-----------|----------------------------------|
| id                | varchar   | PK, default `gen_random_uuid()` |
| sourceCardId      | varchar   | NOT NULL, FK → `cards.id`       |
| targetCardId      | varchar   | NOT NULL, FK → `cards.id`       |
| relationType      | text      | NOT NULL                        |
| label             | text      |                                 |
| sortOrder         | integer   | default 0                       |
| navigationContext | jsonb     | default `{}`                    |
| createdAt         | timestamp | NOT NULL, default now()         |

### 1.7 `card_data`

| Column      | Type      | Constraints / Notes             |
|-------------|-----------|----------------------------------|
| id          | varchar   | PK, default `gen_random_uuid()` |
| cardId      | varchar   | NOT NULL, FK → `cards.id`       |
| payload     | jsonb     | NOT NULL                        |
| periodLabel | text      |                                 |
| effectiveAt | timestamp | NOT NULL, default now()         |
| createdAt   | timestamp | NOT NULL, default now()         |

---

## 2. Enums & Constants

### 2.1 `CHART_TYPES` (25 values)

```
confidence_band, alluvial, waffle_bar, bullet_bar, slope_comparison,
bubble_scatter, box_whisker, strip_timeline, waffle_percent, heatmap,
strip_dot, multi_line, tile_cartogram, timeline_milestone, control,
dendrogram, radial_bar, bump, sparkline_rows, stacked_area,
range_strip, range_strip_aligned, interactive_range_strip,
range_target_bullet, range_dot_plot
```

**Type:** `ChartType = (typeof CHART_TYPES)[number]`

### 2.2 `CONTROL_TYPES` (1 value)

```
range_builder
```

**Type:** `ControlType = (typeof CONTROL_TYPES)[number]`  
**Union type:** `ComponentType = ChartType | ControlType`

### 2.3 `CARD_STATUSES` (4 values)

```
draft, active, archived, needs_refresh
```

### 2.4 `REFRESH_POLICIES` (3 values)

```
manual, on_demand, scheduled
```

### 2.5 `RELATION_TYPES` (4 values)

```
drilldown, component_of, related, parent
```

### 2.6 `CLASSIFICATION_STYLES` (4 tiers)

| Tier     | Light Mode BG     | Light Mode Text     | Dark Mode BG          | Dark Mode Text      |
|----------|-------------------|---------------------|-----------------------|---------------------|
| Normal   | emerald-100       | emerald-800         | emerald-900/30        | emerald-400         |
| Watch    | amber-100         | amber-800           | amber-900/30          | amber-400           |
| Alert    | orange-100        | orange-800          | orange-900/30         | orange-400          |
| Critical | red-100           | red-800             | red-900/30            | red-400             |

### 2.7 `StatusLevel` (5 values)

```
healthy, degraded, critical, offline, unknown
```

### 2.8 Unit Types (7 supported)

```
percent, currency, count, ratio, score, days, custom
```

**Formatting rules** (`formatMetricValue`):

| Unit Type | Format Example | Rule |
|-----------|---------------|------|
| percent   | `14.2%`       | 1 decimal + `%` |
| currency  | `$97,240`     | `$` + comma-separated, 0 decimals |
| count     | `12.8k`       | ≥10,000 → `Xk`; otherwise comma-separated |
| ratio     | `0.72`        | 2 decimals |
| score     | `3.8`         | 1 decimal |
| days      | `38d`         | 0 decimals + `d` |
| custom    | `14.2 units`  | 1 decimal + unitLabel suffix |

---

## 3. API Endpoints

### 3.1 Bundles (Card Bundle CRUD)

| Method  | Path                     | Description                    |
|---------|--------------------------|--------------------------------|
| GET     | `/api/bundles`           | List all bundles               |
| GET     | `/api/bundles/:id`       | Get bundle by ID               |
| GET     | `/api/bundles/key/:key`  | Get bundle by key              |
| POST    | `/api/bundles`           | Create bundle                  |
| PATCH   | `/api/bundles/:id`       | Update bundle                  |
| DELETE  | `/api/bundles/:id`       | Delete bundle                  |

### 3.2 Metric Definitions

| Method  | Path                          | Description                    |
|---------|-------------------------------|--------------------------------|
| GET     | `/api/metric-definitions`     | List all metric definitions    |
| GET     | `/api/metric-definitions/:id` | Get metric definition by ID    |
| POST    | `/api/metric-definitions`     | Create metric definition       |
| PATCH   | `/api/metric-definitions/:id` | Update metric definition       |
| DELETE  | `/api/metric-definitions/:id` | Delete metric definition       |

### 3.3 Chart Configs

| Method  | Path                      | Description                    |
|---------|---------------------------|--------------------------------|
| GET     | `/api/chart-configs`      | List all chart configs         |
| GET     | `/api/chart-configs/:id`  | Get chart config by ID         |
| POST    | `/api/chart-configs`      | Create chart config            |
| PATCH   | `/api/chart-configs/:id`  | Update chart config            |
| DELETE  | `/api/chart-configs/:id`  | Delete chart config            |

### 3.4 Cards

| Method  | Path                        | Description                           |
|---------|-----------------------------|---------------------------------------|
| GET     | `/api/cards`                | List all cards                        |
| GET     | `/api/cards/:id`            | Get card by ID                        |
| GET     | `/api/cards/:id/full`       | Get card with latest data snapshot    |
| POST    | `/api/cards`                | Create card                           |
| PATCH   | `/api/cards/:id`            | Update card                           |
| DELETE  | `/api/cards/:id`            | Delete card                           |

### 3.5 Card Data

| Method  | Path                          | Description                        |
|---------|-------------------------------|------------------------------------|
| GET     | `/api/cards/:id/data`         | List all data snapshots for card   |
| GET     | `/api/cards/:id/data/latest`  | Get latest data snapshot           |
| POST    | `/api/cards/:id/data`         | Push new data snapshot             |

### 3.6 Card Relations & Navigation

| Method  | Path                          | Description                    |
|---------|-------------------------------|--------------------------------|
| GET     | `/api/cards/:id/drilldowns`   | Get drilldown cards            |
| GET     | `/api/cards/:id/relations`    | List card relations            |
| POST    | `/api/card-relations`         | Create card relation           |
| DELETE  | `/api/card-relations/:id`     | Delete card relation           |

### 3.7 Reference

| Method  | Path                | Description                    |
|---------|---------------------|--------------------------------|
| GET     | `/api/chart-types`  | List all chart type constants  |

### 3.8 Hub Communication

| Method  | Path                      | Description                           |
|---------|---------------------------|---------------------------------------|
| GET     | `/api/hub/status`         | Hub connection status                 |
| GET     | `/api/hub/directives`     | Fetch directives (optional ?status=)  |
| PATCH   | `/api/hub/directives/:id` | Update directive status/response      |
| POST    | `/api/hub/documentation`  | Push documentation to Hub             |
| GET     | `/api/hub/registry`       | Fetch ecosystem registry from Hub     |
| GET     | `/api/hub/architecture`   | Fetch architecture from Hub           |

### 3.9 Component Registry & Export

| Method  | Path                   | Description                                  |
|---------|------------------------|----------------------------------------------|
| GET     | `/api/components`      | List registry (filters: ?category, ?type, ?target) |
| GET     | `/api/components/:key` | Get component export package                 |
| GET     | `/api/export/:key`     | Download component export as JSON attachment |

### 3.10 Design System

| Method  | Path                             | Description                       |
|---------|----------------------------------|-----------------------------------|
| GET     | `/api/design-system`             | Full design system specification  |
| GET     | `/api/design-system/:component`  | Single component spec             |

### 3.11 AI Agent

| Method  | Path              | Description                    |
|---------|-------------------|--------------------------------|
| POST    | `/api/ai/agent`   | Process agent instruction      |

### 3.12 Kanbai Integration

| Method  | Path                     | Description                           |
|---------|--------------------------|---------------------------------------|
| GET     | `/api/kanbai/cards`      | List Kanbai cards (?source, ?status)  |
| POST    | `/api/kanbai/cards`      | Create Kanbai card                    |
| PATCH   | `/api/kanbai/cards/:id`  | Update Kanbai card                    |

### 3.13 Ingest Endpoints (6)

| Method | Path                          | Source           | Description                         |
|--------|-------------------------------|------------------|-------------------------------------|
| POST   | `/api/ingest/conductor`       | Conductor        | Market compensation data ingest     |
| POST   | `/api/ingest/metric-engine`   | Metric Engine    | Metric values with auto chart type  |
| POST   | `/api/ingest/anycomp`         | AnyComp          | Scenario comparisons & recommendations |
| POST   | `/api/ingest/people-analyst`  | PeopleAnalyst    | Monte Carlo forecasts & VOI analysis |
| POST   | `/api/ingest/voi-calculator`  | VOI Calculator   | ROI analysis & investment projections |
| POST   | `/api/ingest/product-kanban`  | Product Kanban   | Velocity, burndown, app health      |

### 3.14 GitHub Sync (Internal, requires `X-Internal-Token`)

| Method  | Path                              | Description              |
|---------|------------------------------------|--------------------------|
| GET     | `/api/github/status`              | Sync status              |
| POST    | `/api/github/push`                | Push to GitHub           |
| POST    | `/api/github/auto-sync/start`     | Start auto-sync          |
| POST    | `/api/github/auto-sync/stop`      | Stop auto-sync           |

---

## 4. Chart Types

26 bundle definitions are registered in `server/bundleDefinitions.ts`. Each includes `dataSchema`, `configSchema`, `defaults`, `exampleData`, and `documentation`.

| # | Key                    | Display Name               | Category       | Tags (primary)                          |
|---|------------------------|----------------------------|----------------|-----------------------------------------|
| 1 | confidence_band        | Confidence Band Chart      | Forecasting    | forecast, uncertainty, prediction       |
| 2 | alluvial               | Alluvial / Flow Chart      | Flow & Movement| flow, sankey, transitions               |
| 3 | waffle_bar             | Waffle Bar Chart           | Composition    | composition, proportion, grid           |
| 4 | bullet_bar             | Bullet Bar Chart           | Performance    | target, goal, benchmark, kpi            |
| 5 | slope_comparison       | Slope Comparison Chart     | Comparison     | growth, change, period-over-period      |
| 6 | bubble_scatter         | Bubble Scatter Chart       | Distribution   | scatter, multi-dimensional, correlation |
| 7 | box_whisker            | Box & Whisker Chart        | Distribution   | statistics, quartiles, spread           |
| 8 | strip_timeline         | Strip Timeline Chart       | Time Series    | timeline, events, patterns              |
| 9 | waffle_percent         | Waffle Percent Chart       | Proportion     | percentage, single-metric               |
| 10| heatmap                | Heatmap Chart              | Distribution   | matrix, correlation, intensity          |
| 11| strip_dot              | Strip Dot Chart            | Events         | events, categorical, scatter            |
| 12| multi_line             | Multi-Line Chart           | Time Series    | time-series, trend, multi-metric        |
| 13| tile_cartogram         | Tile Cartogram Chart       | Geographic     | geographic, map, regional               |
| 14| timeline_milestone     | Timeline Milestone Chart   | Events         | milestones, key-dates                   |
| 15| control                | Control Chart (SPC)        | Quality        | spc, quality, control-limits            |
| 16| dendrogram             | Dendrogram Chart           | Hierarchy      | hierarchy, clustering, tree             |
| 17| radial_bar             | Radial Bar Chart           | Proportion     | proportion, comparison, gauge           |
| 18| bump                   | Bump Chart                 | Ranking        | ranking, rank-change, position          |
| 19| sparkline_rows         | Sparkline Rows Chart       | Time Series    | sparkline, multi-metric, compact        |
| 20| stacked_area           | Stacked Area Chart         | Composition    | composition, time-series, stacked       |
| 21| range_strip            | Range Strip Chart          | Compensation   | range, percentile, pay-structure        |
| 22| range_strip_aligned    | Aligned Range Strip        | Compensation   | range, aligned, levels, comparison      |
| 23| interactive_range_strip| Interactive Range Strip    | Compensation   | range, interactive, legacy              |
| 24| range_target_bullet    | Range Target Bullet        | Compensation   | bullet, market, target, actuals         |
| 25| range_dot_plot         | Range Dot Plot             | Compensation   | equity, dot-plot, employees, salary     |

**Infrastructure:** All charts require D3.js except `range_strip`, `range_strip_aligned`, `interactive_range_strip`, `range_target_bullet`, `range_dot_plot` (pure SVG/React).

---

## 5. Control Types

### 5.1 `range_builder` — Range Builder

**Category:** Compensation  
**Component type:** Form control (not a chart)  
**Purpose:** Interactive compensation range simulator with real-time KPI feedback

**Input data:**
- `rows[]`: label, rangeMin, rangeMax, currentEmployees, avgCurrentPay
- `marketData[]`: p50, p75 per level

**Output event (`RangeBuilderChangeEvent`):**
- `activeRanges[]`: { label, min, max } per level
- `kpis`: totalCostImpact, costChangePercent, peerEquityScore, peerEquityChange, competitivenessRatio, competitivenessChange, employeesAffected, totalEmployees

**KPI Cards:**
1. Cost Impact — net dollar change in total compensation cost
2. Peer Equity — how centered employees are within ranges (0-1)
3. Competitiveness — ratio of midpoints to market P50 (1.0 = at market)
4. People Impact — proportion of employees unaffected by changes

**Config options:** stepSize, scaleMin, scaleMax, activeColor, inactiveColor, segmentHeight, gap, showLabels, showScale, autoRecalculate

---

## 6. PA Design Kit Components

**Source:** `client/src/components/pa-design-kit/`  
**Registry:** `server/designSystemRegistry.ts`

| # | Name             | Category       | Data Interface      | Dependencies                                |
|---|------------------|----------------|---------------------|---------------------------------------------|
| 1 | MetricTicker     | data-display   | MetricTickerData    | MiniSparkline, TrendIndicator, formatMetricValue |
| 2 | MetricCard       | data-display   | MetricCardData      | MiniSparkline, TrendIndicator, TrendIcon, formatMetricValue |
| 3 | MetricGrid       | layout         | —                   | MetricTicker, MetricCard                    |
| 4 | TrendIndicator   | data-display   | TrendDelta          | —                                           |
| 5 | TrendIcon        | data-display   | —                   | —                                           |
| 6 | SectionHeader    | layout         | SectionHeaderMeta   | —                                           |
| 7 | OutputCard       | data-display   | OutputCardData      | —                                           |
| 8 | ResultsGrid      | layout         | —                   | OutputCard, ResultsFilters                  |
| 9 | ResultsFilters   | layout         | —                   | —                                           |
| 10| IndexGauge       | data-display   | IndexGaugeData      | MiniSparkline                               |
| 11| AlertRow         | feedback       | AlertRowData        | MiniSparkline, formatMetricValue            |
| 12| StatusDot        | feedback       | —                   | —                                           |
| 13| MiniSparkline    | data-display   | —                   | —                                           |
| 14| WorkflowSteps    | navigation     | WorkflowStep        | —                                           |
| 15| formatMetricValue| utility        | —                   | — (pure function)                           |

---

## 7. Data Contracts

### 7.1 `TrendDelta`

| Field     | Type                    | Required | Description                    |
|-----------|-------------------------|----------|--------------------------------|
| value     | number \| null          | no       | Absolute change amount         |
| percent   | number \| null          | no       | Percentage change              |
| direction | "up" \| "down" \| "flat"| yes      | Direction of change            |

### 7.2 `MetricTickerData`

| Field          | Type                    | Required | Description                    |
|----------------|-------------------------|----------|--------------------------------|
| key            | string                  | yes      | Unique metric identifier       |
| label          | string                  | yes      | Human-readable name            |
| value          | number \| null          | yes      | Current metric value           |
| unitType       | UnitType enum           | yes      | Formatting type                |
| unitLabel      | string \| null          | no       | Custom unit suffix             |
| delta          | TrendDelta              | no       | Trend change data              |
| sparkline      | number[] \| null        | no       | Historical values              |
| classification | "Normal" \| "Watch" \| "Alert" \| "Critical" | no | Health tier |
| confidence     | number                  | no       | 0-1 data quality score         |

### 7.3 `MetricCardData`

Extends `MetricTickerData` with:

| Field            | Type              | Description                          |
|------------------|-------------------|--------------------------------------|
| description      | string \| null    | Metric description (shown on expand) |
| domain           | string            | Business domain                      |
| category         | string            | Metric category for grouping         |
| sampleSize       | number \| null    | Number of data points                |
| dataQualityScore | number \| null    | 0-100 data quality indicator         |
| reasons          | string[] \| null  | Contributing factors                 |
| tags             | string[] \| null  | Categorization tags                  |

### 7.4 `IndexGaugeData`

| Field     | Type              | Required | Description                    |
|-----------|-------------------|----------|--------------------------------|
| key       | string            | yes      | Gauge identifier               |
| value     | number            | yes      | Current value (0-100)          |
| label     | string            | yes      | Display label                  |
| delta     | number \| null    | no       | Change from previous period    |
| sparkline | number[] \| null  | no       | Historical values              |

### 7.5 `AlertRowData`

| Field          | Type                       | Required | Description            |
|----------------|----------------------------|----------|------------------------|
| key            | string                     | yes      | Alert identifier       |
| label          | string                     | yes      | Metric label           |
| value          | number \| null             | yes      | Current value          |
| unitType       | string                     | yes      | Unit type for formatting |
| classification | "Alert" \| "Critical"      | yes      | Severity level         |
| delta          | TrendDelta                 | no       |                        |
| sparkline      | number[] \| null           | no       |                        |

### 7.6 `SectionHeaderMeta`

| Field       | Type               | Required | Description                    |
|-------------|--------------------|-----------|-----------------------------|
| id          | string             | yes      | Section identifier             |
| label       | string             | yes      | Section title                  |
| icon        | ReactElementType   | yes      | Lucide icon component          |
| color       | string             | yes      | Tailwind text color class      |
| metricCount | number             | yes      | Count displayed in badge       |
| alertCount  | number             | no       | Alert count badge              |

### 7.7 `OutputCardData`

| Field         | Type                   | Required | Description                    |
|---------------|------------------------|----------|--------------------------------|
| id            | string \| number       | yes      | Unique identifier              |
| title         | string                 | yes      | Card title                     |
| subtitle      | string \| null         | no       | Secondary title                |
| description   | string \| null         | no       | Body text                      |
| status        | string \| null         | no       | Status badge text              |
| statusVariant | "default" \| "secondary" \| "outline" \| "destructive" | no | Badge variant |
| tags          | string[]               | no       | Tag chips                      |
| metadata      | { label, value }[]     | no       | Key-value pairs                |
| timestamp     | string \| Date \| null | no       | ISO timestamp                  |
| icon          | ReactElementType       | no       | Lucide icon                    |
| onClick       | function               | no       | Click handler                  |

### 7.8 `WorkflowStep`

| Field  | Type                                                    | Required | Description          |
|--------|---------------------------------------------------------|----------|----------------------|
| id     | string                                                  | no       | Step identifier      |
| label  | string                                                  | yes      | Step label           |
| status | "complete" \| "active" \| "pending" \| "skipped" \| "error" | yes | Current step state   |
| icon   | ReactElementType                                        | no       | Custom icon          |

### 7.9 `RangeBuilderChangeEvent`

| Field        | Type                                        | Description                    |
|--------------|---------------------------------------------|--------------------------------|
| rows         | RangeBuilderRow[]                           | Original row data              |
| activeRanges | { label: string, min: number, max: number }[] | User-adjusted ranges         |
| kpis         | RangeBuilderKPIs                            | Computed KPI values            |

### 7.10 `RangeBuilderKPIs`

| Field               | Type   | Description                                    |
|---------------------|--------|------------------------------------------------|
| totalCostImpact     | number | Net dollar change in compensation cost         |
| costChangePercent   | number | % change in total cost                         |
| peerEquityScore     | number | Internal equity score (0-1)                    |
| peerEquityChange    | number | Delta vs baseline equity                       |
| competitivenessRatio| number | Midpoints-to-market-P50 ratio (1.0 = at market)|
| competitivenessChange| number| Delta vs baseline competitiveness              |
| employeesAffected   | number | Employees outside new range boundaries         |
| totalEmployees      | number | Total headcount                                |

---

## 8. Ingest Endpoints & Integration Targets

### 8.1 Conductor Ingest (`POST /api/ingest/conductor`)

**Payload schema (`conductorPayloadSchema`):**

```
{
  payload: {
    dataType: string (default "market_compensation"),
    effectiveDate: string?,
    marketData: [{
      label: string,
      p10?: number, p25?: number, p50?: number, p75?: number, p90?: number,
      employees?: number, blsWage?: number
    }]?
  },
  periodLabel?: string,
  effectiveAt?: string
}
```

**Target bundles:** `range_strip`, `range_strip_aligned`, `range_target_bullet`

### 8.2 Metric Engine Ingest (`POST /api/ingest/metric-engine`)

**Payload schema (`metricEnginePayloadSchema`):**

```
{
  payload: {
    metricKey: string (required),
    metricName?: string,
    value?: number,
    unit?: string,
    category?: string,
    description?: string,
    period?: string,
    dimensions?: Record<string, unknown>,
    trend?: { periods: [{ label: string, value: number }]? }
  },
  periodLabel?: string,
  effectiveAt?: string
}
```

**Behavior:** Auto-creates metric definitions if not found. Infers chart type via `METRIC_TO_CHART_MAP`.

### 8.3 AnyComp Ingest (`POST /api/ingest/anycomp`)

**Payload schema (`anycompPayloadSchema`):**

```
{
  payload: {
    scenarioId?: string,
    scenarioName?: string,
    scenarioComparison?: unknown,
    recommendations?: unknown[],
    optimizationResults?: unknown
  },
  periodLabel?: string,
  effectiveAt?: string
}
```

**Target bundles:** `bullet_bar` (comparisons), `slope_comparison` (recommendations), `radial_bar` (scores)

### 8.4 PeopleAnalyst Ingest (`POST /api/ingest/people-analyst`)

**Payload schema (`peopleAnalystPayloadSchema`):**

```
{
  payload: {
    forecastType?: string,
    scenario?: string,
    simulations?: number,
    horizon?: string,
    timeSeries?: unknown[],
    results?: unknown,
    assumptions?: unknown,
    voiAnalysis?: { decisionImpact?: string, ...passthrough }
  },
  periodLabel?: string,
  effectiveAt?: string
}
```

**Target bundles:** `confidence_band` (forecasts), `bubble_scatter` (VOI analysis)

### 8.5 VOI Calculator Ingest (`POST /api/ingest/voi-calculator`)

**Payload schema (inline):**

```
{
  payload: {
    analysisType?: string,
    title?: string,
    investmentName?: string,
    roi?: number,
    npv?: number,
    paybackMonths?: number,
    scenarios?: [{ name: string, probability?: number, value?: number }],
    sensitivityData?: unknown[],
    timeSeriesProjection?: unknown[]
  },
  periodLabel?: string,
  effectiveAt?: string
}
```

**Target bundles:** `bullet_bar` (ROI scenarios), `confidence_band` (projections)

### 8.6 Product Kanban Ingest (`POST /api/ingest/product-kanban`)

**Payload schema (inline):**

```
{
  payload: {
    sprintName?: string,
    velocity?: [{ sprint: string, planned?: number, completed?: number }],
    burndown?: [{ day: string|number, remaining: number, ideal?: number }],
    appHealth?: [{ app: string, score?: number, status?: string, docScore?: number }],
    summary?: { totalCards?: number, completed?: number, inProgress?: number, blocked?: number }
  },
  periodLabel?: string,
  effectiveAt?: string
}
```

**Target bundles:** `multi_line` (velocity), `heatmap` (app health), `stacked_area` (burndown)

---

## 9. Domain Constants — Compensation

### 9.1 Super Job Functions (4)

| Code | Full Name              |
|------|------------------------|
| R&D  | Research & Development |
| GTM  | Go To Market           |
| OPS  | Operations             |
| G&A  | General & Administrative |

### 9.2 Level Types (4) with Level Counts

| Level Type   | Prefix | Levels           | Count |
|--------------|--------|------------------|-------|
| Professional | P      | P1–P6            | 6     |
| Manager      | M      | M1–M6            | 6     |
| Executive    | E      | E1–E5            | 5     |
| Support      | S      | S1–S4            | 4     |

### 9.3 Level Data Shape (per level per function)

```typescript
interface LevelData {
  rangeMin: number;       // Comp range floor
  rangeMax: number;       // Comp range ceiling
  currentEmployees: number;
  avgCurrentPay: number;
  marketP50: number;      // Market median
  marketP75: number;      // Market 75th percentile
  actualMin: number;      // Lowest actual pay
  actualMax: number;      // Highest actual pay
  jobCount: number;       // Number of job codes at this level
}
```

**Total level matrix:** 4 functions × 4 level types × variable levels = ~84 level entries in `JOB_STRUCTURE_DATA`

---

## 10. Tile Cartogram Geographic Presets

**Source:** `client/src/components/charts/tilePresets.ts`

| # | Key           | Label        | Tile Count | Section Labels                                          |
|---|---------------|--------------|------------|--------------------------------------------------------|
| 1 | us_states     | US States    | 51         | (no sections)                                          |
| 2 | na            | N. America   | 16         | North, Central America, Caribbean                      |
| 3 | sa            | S. America   | 12         | Andean, Southern Cone, Atlantic                        |
| 4 | emea          | EMEA         | 26         | Western Europe, Northern Europe, Eastern Europe, Middle East, Africa |
| 5 | apac          | APAC         | 18         | East Asia, Southeast Asia, South Asia, Oceania         |
| 6 | regions       | Regions      | 4          | (single row: NA, LATAM, EMEA, APAC)                   |

**Tile interface:** `{ id: string, label: string, value: number, row: number, col: number }`

---

## 11. Design System Style Tokens

### 11.1 Brand Colors

| Token        | Value     | Description                                |
|--------------|-----------|--------------------------------------------|
| primary      | `#0f69ff` | Brand blue                                 |
| primaryLight | `#e0f0ff` | Light blue accent                          |
| foreground   | `#232a31` | Primary text                               |
| muted        | `#5b636a` | Secondary text                             |
| border       | `#e0e4e9` | Default borders                            |

**Palette inspiration:** Yahoo Finance

### 11.2 Trend Colors

| Direction | Normal                             | Inverted                           |
|-----------|------------------------------------|------------------------------------|
| up        | emerald-600 / emerald-400 (dark)   | red-600 / red-400 (dark)           |
| down      | red-600 / red-400 (dark)           | emerald-600 / emerald-400 (dark)   |
| flat      | muted-foreground                   | muted-foreground                   |

### 11.3 Status Colors

| Status   | Color                |
|----------|----------------------|
| healthy  | emerald-500          |
| degraded | amber-500            |
| critical | red-500              |
| offline  | muted-foreground     |
| unknown  | muted-foreground/50  |

### 11.4 Spacing Principle

| Level    | Values                        | Usage                                   |
|----------|-------------------------------|-----------------------------------------|
| compact  | gap-1, gap-1.5, p-2          | Tickers, cards, dense grids             |
| standard | gap-2, gap-3, p-3, p-4       | Sections, panels                        |
| relaxed  | gap-4, gap-6, p-6            | Page-level layout, hero areas           |

**Rounding:** `rounded-[3px]` on custom elements, `rounded-md` on shadcn components.

### 11.5 Typography Hierarchy

| Role           | Classes                           |
|----------------|-----------------------------------|
| Metric labels  | `text-xs font-medium truncate`    |
| Metric values  | `text-sm font-semibold tabular-nums` |
| Section headers| `text-sm font-medium`             |
| Body text      | `text-xs text-muted-foreground`   |
| Trend values   | `text-xs tabular-nums`           |

### 11.6 Border Conventions

| Context  | Classes                             |
|----------|-------------------------------------|
| Cards    | `border border-border/50 rounded-md`|
| Sections | `border-b border-border`            |

**Principle:** Subtle, low-opacity borders (`/50` opacity on card borders).

---

## 12. Frontend Pages & Routes

| Route             | Component           | Description                                    |
|-------------------|---------------------|------------------------------------------------|
| `/`               | ScreenerPage        | Stock/metric screener with filters             |
| `/chooser`        | ChooserPage         | Filter chooser interface                       |
| `/range`          | RangePage           | Range visualization page                       |
| `/menu`           | MenuPage            | Navigation menu                                |
| `/metric-market`  | MetricMarketPage    | Main metric market dashboard                   |
| `/detail-card`    | DetailCardPage      | Card detail view                               |
| `/google-finance` | GoogleFinancePage   | Google Finance-style layout                    |
| `/card-types`     | CardTypesPage       | Bundle/card type browser                       |
| `/metric-detail`  | MetricDetailPage    | Individual metric deep-dive                    |
| `/chart-library`  | ChartLibraryPage    | Visual catalog of all 23+ chart types          |
| `/workbench`      | WorkbenchPage       | Development workbench                          |
| `/range-builder`  | RangeBuilderPage    | Full compensation range builder with job architecture |
| `/export`         | ComponentExportPage | Component registry and export interface        |

---

## 13. Integration Architecture

### 13.1 Data Flow

```
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
```

### 13.2 Integration Targets by Component

| Component            | Conductor (Producer)           | AnyComp (Consumer)                  | Metric Engine (Bidirectional)   |
|----------------------|-------------------------------|-------------------------------------|---------------------------------|
| range_builder        | HRIS, job arch, market data   | Receives ranges + KPIs + indices    | Definitions ↔ computed values   |
| range_target_bullet  | —                             | Renders market vs target vs actual  | —                               |
| range_dot_plot       | Employee salary records       | Employee position-in-range viz      | —                               |

### 13.3 Conductor Field Mappings

| Metric Market Field | Canonical Field            | Source                              |
|---------------------|----------------------------|-------------------------------------|
| label               | job_level                  | Job Architecture / Segmentation Studio |
| rangeMin            | salary_range_minimum       | Compensation Structure              |
| rangeMax            | salary_range_maximum       | Compensation Structure              |
| currentEmployees    | headcount                  | HRIS Snapshot (Tier 1)              |
| avgCurrentPay       | base_compensation          | HRIS Snapshot (aggregated)          |
| p50                 | market_p50                 | Survey Data / Market Pricing        |
| p75                 | market_p75                 | Survey Data / Market Pricing        |

### 13.4 AnyComp KPI Indices Consumed

| Index                 | Range | Meaning                                 |
|-----------------------|-------|-----------------------------------------|
| costImpactIndex       | 0-100 | Higher = less cost impact (better)      |
| peerEquityIndex       | 0-100 | Higher = better internal equity         |
| competitivenessIndex  | 0-100 | Higher = closer to market               |
| peopleImpactIndex     | 0-100 | Higher = fewer affected employees       |

### 13.5 Additional Ingest Sources

| Source         | Role     | Target Bundles                                |
|----------------|----------|-----------------------------------------------|
| PeopleAnalyst  | Producer | confidence_band, bubble_scatter               |
| VOI Calculator | Producer | bullet_bar, confidence_band                   |
| Product Kanban | Producer | multi_line, heatmap, stacked_area             |
| Kanbai         | External | Cards API (list/create/update)                |

---

## 14. Metric-to-Chart Inference Rules

**Source:** `METRIC_TO_CHART_MAP` in `server/ingest.ts`

### 14.1 Category-Based Mapping

| Category     | Inferred Chart Type  |
|--------------|----------------------|
| rate         | multi_line           |
| ratio        | bullet_bar           |
| count        | sparkline_rows       |
| percentage   | waffle_percent       |
| score        | radial_bar           |
| index        | radial_bar           |
| currency     | range_strip          |
| duration     | strip_timeline       |
| distribution | box_whisker          |
| trend        | multi_line           |
| comparison   | slope_comparison     |
| composition  | stacked_area         |
| forecast     | confidence_band      |

### 14.2 Fallback Unit-Based Rules

| Condition                      | Inferred Chart Type |
|--------------------------------|---------------------|
| unit = "%" or "rate"           | multi_line          |
| unit = "$" or "currency"       | bullet_bar          |
| metricKey contains "ratio"     | bullet_bar          |
| metricKey contains "rate"      | multi_line          |
| metricKey contains "score"     | radial_bar          |
| metricKey contains "count"     | sparkline_rows      |
| metricKey contains "distribution" | box_whisker      |
| Default fallback               | multi_line          |

---

## 15. File Manifest

### Server

| File                              | Purpose                                      |
|-----------------------------------|----------------------------------------------|
| `server/routes.ts`               | All API route registrations                  |
| `server/storage.ts`              | Storage interface (IStorage) + Drizzle impl  |
| `server/bundleDefinitions.ts`    | 26 bundle definitions with schemas           |
| `server/componentExport.ts`      | Component registry, export packages, integration targets |
| `server/designSystemRegistry.ts` | PA Design Kit spec, style tokens, component registry |
| `server/ingest.ts`               | 6 ingest endpoints + metric-to-chart inference |
| `server/hub-client.ts`           | Hub communication client                     |
| `server/githubSync.ts`           | GitHub push/auto-sync                        |
| `server/aiAgent.ts`              | AI agent instruction processor               |
| `server/kanbaiClient.ts`         | Kanbai card management client                |

### Shared

| File                   | Purpose                                    |
|------------------------|--------------------------------------------|
| `shared/schema.ts`    | Drizzle tables, enums, Zod schemas, types  |

### Client — Charts (25 components)

| File                                    | Chart Type             |
|-----------------------------------------|------------------------|
| `client/src/components/charts/ConfidenceBandChart.tsx` | confidence_band |
| `client/src/components/charts/AlluvialChart.tsx`       | alluvial        |
| `client/src/components/charts/WaffleBarChart.tsx`      | waffle_bar      |
| `client/src/components/charts/BulletBarChart.tsx`      | bullet_bar      |
| `client/src/components/charts/SlopeComparisonChart.tsx`| slope_comparison |
| `client/src/components/charts/BubbleScatterChart.tsx`  | bubble_scatter  |
| `client/src/components/charts/BoxWhiskerChart.tsx`     | box_whisker     |
| `client/src/components/charts/StripTimelineChart.tsx`  | strip_timeline  |
| `client/src/components/charts/WafflePercentChart.tsx`  | waffle_percent  |
| `client/src/components/charts/HeatmapChart.tsx`        | heatmap         |
| `client/src/components/charts/StripDotChart.tsx`       | strip_dot       |
| `client/src/components/charts/MultiLineChart.tsx`      | multi_line      |
| `client/src/components/charts/TileCartogramChart.tsx`  | tile_cartogram  |
| `client/src/components/charts/TimelineMilestoneChart.tsx` | timeline_milestone |
| `client/src/components/charts/ControlChart.tsx`        | control         |
| `client/src/components/charts/DendrogramChart.tsx`     | dendrogram      |
| `client/src/components/charts/RadialBarChart.tsx`      | radial_bar      |
| `client/src/components/charts/BumpChart.tsx`           | bump            |
| `client/src/components/charts/SparklineRowsChart.tsx`  | sparkline_rows  |
| `client/src/components/charts/StackedAreaChart.tsx`    | stacked_area    |
| `client/src/components/charts/RangeStripChart.tsx`     | range_strip     |
| `client/src/components/charts/RangeStripAlignedChart.tsx` | range_strip_aligned |
| `client/src/components/charts/InteractiveRangeStripChart.tsx` | interactive_range_strip |
| `client/src/components/charts/RangeTargetBulletChart.tsx` | range_target_bullet |
| `client/src/components/charts/RangeDotPlotChart.tsx`   | range_dot_plot  |

### Client — Controls

| File                                              | Control Type    |
|---------------------------------------------------|-----------------|
| `client/src/components/controls/RangeBuilderControl.tsx` | range_builder |

### Client — PA Design Kit (15 components)

| File                                                    | Component          |
|---------------------------------------------------------|--------------------|
| `client/src/components/pa-design-kit/metric-ticker.tsx` | MetricTicker       |
| `client/src/components/pa-design-kit/metric-card.tsx`   | MetricCard         |
| `client/src/components/pa-design-kit/metric-grid.tsx`   | MetricGrid         |
| `client/src/components/pa-design-kit/trend-indicator.tsx`| TrendIndicator, TrendIcon |
| `client/src/components/pa-design-kit/section-header.tsx`| SectionHeader      |
| `client/src/components/pa-design-kit/output-card.tsx`   | OutputCard         |
| `client/src/components/pa-design-kit/results-grid.tsx`  | ResultsGrid, ResultsFilters |
| `client/src/components/pa-design-kit/index-gauge.tsx`   | IndexGauge         |
| `client/src/components/pa-design-kit/alert-row.tsx`     | AlertRow           |
| `client/src/components/pa-design-kit/status-dot.tsx`    | StatusDot          |
| `client/src/components/pa-design-kit/mini-sparkline.tsx`| MiniSparkline      |
| `client/src/components/pa-design-kit/workflow-steps.tsx`| WorkflowSteps      |
| `client/src/components/pa-design-kit/format-value.ts`   | formatMetricValue, CLASSIFICATION_STYLES |
| `client/src/components/pa-design-kit/index.ts`          | Barrel exports     |
| `client/src/components/charts/tilePresets.ts`           | TILE_PRESETS (6 presets) |

### Client — Pages (13 routes)

| File                                         | Route            |
|----------------------------------------------|------------------|
| `client/src/pages/ScreenerPage.tsx`          | `/`              |
| `client/src/pages/ChooserPage.tsx`           | `/chooser`       |
| `client/src/pages/RangePage.tsx`             | `/range`         |
| `client/src/pages/MenuPage.tsx`              | `/menu`          |
| `client/src/pages/MetricMarketPage.tsx`      | `/metric-market` |
| `client/src/pages/DetailCardPage.tsx`        | `/detail-card`   |
| `client/src/pages/GoogleFinancePage.tsx`     | `/google-finance`|
| `client/src/pages/CardTypesPage.tsx`         | `/card-types`    |
| `client/src/pages/MetricDetailPage.tsx`      | `/metric-detail` |
| `client/src/pages/ChartLibraryPage.tsx`      | `/chart-library` |
| `client/src/pages/WorkbenchPage.tsx`         | `/workbench`     |
| `client/src/pages/RangeBuilderPage.tsx`      | `/range-builder` |
| `client/src/pages/ComponentExportPage.tsx`   | `/export`        |

---

*End of Inventory*
