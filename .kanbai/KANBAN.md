# metric-market — Kanban Manifest

**Generated:** 2026-02-22T18:09:47.428Z
**Source:** Kanbai

---

## Summary

| Status | Count |
|--------|-------|
| Backlog | 25 |
| Planned | 2 |

| Priority | Count |
|-----------|-------|
| high | 11 |
| medium | 14 |
| low | 2 |

---

## Backlog

### #83 — Build Market Data Ingestion Endpoint from Conductor

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

Implement POST /api/ingest/conductor that accepts Conductor's market compensation payload (P50/P75 percentiles, BLS OES wages, employee counts) and maps it to Range Builder and card data formats.

**Acceptance Criteria**

- POST /api/ingest/conductor endpoint implemented
- Maps P50/P75 percentiles to Range Builder format
- Handles BLS OES wage data

**Tags:** metric-market, conductor, ingestion, phase1

---

### #85 — Wire Range Builder to Live Conductor Data

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

Replace simulated market data in Range Builder with live data from Conductor's market compensation pipeline.

**Acceptance Criteria**

- Range Builder uses live Conductor data
- Simulated data replaced
- Graceful fallback if Conductor unavailable

**Tags:** metric-market, conductor, range-builder, phase1

---

### #86 — Create Initial Compensation Card Instances from Conductor

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

Auto-create range_strip, range_strip_aligned, and range_target_bullet card instances from Conductor market compensation data.

**Acceptance Criteria**

- Auto-create 3 card types from Conductor data

**Tags:** metric-market, conductor, cards, phase1

---

### #89 — Build Metric Push Ingestion Endpoint from Metric Engine

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

Implement POST /api/ingest/metric-engine that accepts computed metric payloads (value, trend, statistics, segments) and auto-discovers matching card bundles.

**Acceptance Criteria**

- POST /api/ingest/metric-engine endpoint
- Auto-discovers matching card bundles

**Tags:** metric-market, metric-engine, ingestion, phase2

---

### #90 — Auto-Create Cards from Incoming Metrics

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

When a new metric arrives with no matching card, automatically create a card instance using best-fit chart type (multi_line, confidence_band, sparkline_rows).

**Acceptance Criteria**

- Auto-create cards for unmatched metrics
- Best-fit chart type selection

**Tags:** metric-market, metric-engine, auto-create, phase2

---

### #123 — Expose Card Bundle Discovery API for Spoke Apps

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

Ensure GET /api/bundles returns all available bundles with dataSchema, configSchema, and outputSchema JSON contracts.

**Acceptance Criteria**

- GET /api/bundles returns all bundle schemas

**Tags:** metric-market, api, bundles, phase1

---

### #124 — Expose Card Data Push Endpoint for Spoke Apps

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

Provide POST /api/cards/:id/data endpoint where spokes can push conforming metric payloads that populate card data stores and trigger auto-refresh.

**Acceptance Criteria**

- POST /api/cards/:id/data endpoint
- Auto-refresh on push

**Tags:** metric-market, api, push, phase1

---

### #125 — Document Refresh Policy Configuration for Spoke Integrations

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | small |
| Type | task |

**Description**

Document how spokes should configure on_push vs scheduled vs manual refresh cadence for cards receiving pushed data.

**Acceptance Criteria**

- Refresh policy documentation published

**Tags:** metric-market, documentation, refresh, phase1

---

### #5 — MetricMarket (Yahoo Finance-Style Dashboard)

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | high |
| Estimated Effort | 8 weeks |
| Type | project |

**Description**

# MetricMarket

## Project Overview
Executive-facing analytics dashboard modeled after Yahoo Finance, presenting HR metrics like stock tickers, indices, and analyst reports.

## Key Capabilities
- **Ticker Grid**: Real-time metric values with sparklines and color-coded change indicators
- **Interactive Charts**: Time-series visualizations with zoom, pan, and annotation support
- **Watchlists**: Customizable metric watchlists with threshold-based alerts
- **Metric Detail Pages**: Deep-dive pages for individual metrics with historical trends
- **Mobile-Responsive**: Full functionality on mobile and tablet devices

## Design System
- Yahoo Finance / Google Finance aesthetic
- High information density with clean typography
- Color-coded indicators: green (positive), red (negative), gray (neutral)
- Dark mode support with finance-grade readability

**Acceptance Criteria**

- Ticker grid display with sparklines and color-coded indicators
- Interactive time-series charts (D3.js or Recharts)
- Metric watchlist with threshold alerts
- Mobile-responsive design
- Integration with MetricEngine API

**Dependencies:** MetricEngine (Calculus), Metric Prioritization Algorithm

**Tags:** ui, dashboard, executive-facing

---

### #50 — Metric Market Dashboard Push

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Push velocity and ecosystem health metrics as a Development Ops card bundle to Metric Market. Schedule metric push every 6 hours aligned with Hub sync cadence. Package as 4 pre-configured chart cards: velocity trend, cards by status, activity heatmap, sprint health gauge.

**Acceptance Criteria**

- Register Development Ops card bundle in Metric Market
- Push velocity metrics on 6-hour schedule
- 4 chart card types: multi-line, stacked bar, heatmap, gauge
- Automatic refresh on schedule

**Tags:** kanban, metric-market, dashboard, p2

---

### #88 — Map Conductor Canonical Fields to Metric Market Schema

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | task |

**Description**

Align Conductor's internal field names to Hub canonical field library for compensation, organization, and employment categories.

**Acceptance Criteria**

- Field names aligned to Hub canonical library

**Tags:** conductor, metric-market, field-exchange, phase1

---

### #91 — Bidirectional Metric Definition Sync with Metric Engine

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Expose GET /api/metric-definitions for Metric Engine to discover tracked metrics, and pull Metric Engine's registry to align keys.

**Acceptance Criteria**

- GET /api/metric-definitions endpoint
- Key alignment with Metric Engine

**Tags:** metric-market, metric-engine, sync, phase2

---

### #92 — Push Visualization Specs to Metric Engine

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | task |

**Description**

Send available chart type mappings and bundle schemas to Metric Engine via Hub webhook.

**Acceptance Criteria**

- Chart type mappings sent via Hub webhook

**Tags:** metric-market, metric-engine, visualization, phase2

---

### #101 — Build PeopleAnalyst Ingestion Endpoint in Metric Market

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Implement POST /api/ingest/people-analyst that accepts forecast data and maps to confidence_band, box_whisker, and bubble_scatter card types.

**Acceptance Criteria**

- POST /api/ingest/people-analyst endpoint

**Tags:** metric-market, people-analyst, ingestion, phase4

---

### #102 — Create Forecast Dashboard Layout in Metric Market

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Build dashboard with confidence band cards and scenario toggle controls for headcount projections and workforce planning.

**Acceptance Criteria**

- Dashboard with confidence band cards
- Scenario toggle controls

**Tags:** metric-market, people-analyst, dashboard, phase4

---

### #103 — Wire VOI Analysis to Bubble Scatter Cards

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Map PeopleAnalyst's Value of Information results (information value, decision impact) into bubble_scatter card data format.

**Acceptance Criteria**

- VOI results mapped to bubble_scatter

**Tags:** metric-market, people-analyst, voi, phase4

---

### #105 — Add Segment Dimension Filtering Across Cards

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Integrate Segmentation Studio's population dimensions to enable segment-filtered views (department, location, tenure) across all card types.

**Acceptance Criteria**

- Segment-filtered card views

**Tags:** metric-market, segmentation-studio, filtering, phase5

---

### #106 — Build Ecosystem Health Dashboard in Metric Market

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Create dashboard consuming Product Kanban's velocity and burndown data to display ecosystem development progress.

**Acceptance Criteria**

- Dashboard consuming Kanban velocity data

**Tags:** metric-market, kanban, ecosystem, phase5

---

### #107 — Create ROI Analysis Cards in Metric Market

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Build card templates for VOI Calculator's investment return analyses using bullet_bar and stacked_area chart types.

**Acceptance Criteria**

- bullet_bar and stacked_area templates for ROI

**Tags:** metric-market, voi-calculator, roi, phase5

---

### #137 — Expose Card Bundle Creation API for External Metric Sources

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

API endpoint accepting metric definition payloads and auto-generating card bundles with appropriate chart type defaults.

**Acceptance Criteria**

- Metric definition to card bundle creation

**Tags:** metric-market, conductor, api, phase2

---

### #138 — Enable CORS for Conductor Cross-Origin Calls (Metric Market)

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | task |

**Description**

Enable CORS on Metric Market API for .replit.app and .replit.dev origins.

**Acceptance Criteria**

- CORS enabled for .replit.app/.replit.dev

**Tags:** metric-market, conductor, cors, phase2

---

### #181 — Accept Decision Tracking Cards via API in Metric Market

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Build endpoint to receive decision summaries from Decision Wizard as dashboard tracking cards.

**Acceptance Criteria**

- Accept decision summaries

**Tags:** metric-market, decision-wizard, api

---

### #206 — Expose Card Bundle Creation API Schema in Metric Market

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | medium |
| Type | feature |

**Description**

Expose card bundle creation API schema and supported chart types for survey data.

**Acceptance Criteria**

- API schema documented

**Tags:** metric-market, preference-modeler, api

---

### #72 — Forecast Card Bundle Registration in Metric Market

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | low |
| Type | task |

**Description**

Register a 'PeopleAnalyst Forecasts' card bundle in Metric Market's workbench to house incoming forecast visualization cards from PeopleAnalyst.

**Acceptance Criteria**

- PeopleAnalyst Forecasts bundle registered
- Bundle visible in workbench
- Accepts incoming cards from PeopleAnalyst

**Tags:** metric-market, people-analyst, bundle, phase2

---

### #139 — Expose Component Export API for Embeddable Chart Widgets

| Field | Value |
|-------|-------|
| Status | Backlog |
| Priority | low |
| Type | feature |

**Description**

API returning embeddable chart widget packages (HTML/SVG/JS) for specific cards for Conductor embedding.

**Acceptance Criteria**

- Embeddable chart widget API

**Tags:** metric-market, conductor, embed, phase3

---

## Planned

### #45 — REQ: Metric Market (Range Builder) → AnyComp Integration

| Field | Value |
|-------|-------|
| Status | Planned |
| Priority | high |
| Estimated Effort | large |
| Type | project |

**Description**

# REQ: Metric Market (Range Builder) → AnyComp Integration

Range Builder is the structural engineering console (lives in Metric Market) where compensation ranges are designed. AnyComp is the downstream strategic decision engine that evaluates those designs against business strategy, compares scenarios, applies budgets, and drives approval workflows.

## Key Requirements
- **RangeBuilderChangeEvent consumption**: capture range adjustment events as scenario snapshots (job_family_id, grade, range_min/mid/max, spread, midpoint_progression, effective_date, change_reason)
- **Pay Structure Config sharing**: import complete pay structure configurations for strategic evaluation
- **5 Sub-Index computation flow**: Market Alignment (MRP proximity), Cost Discipline (budget adherence), Internal Equity (compa-ratio variance), Workforce Placement (in-range %), Range Hygiene (overlap/spread)
- **Feature responsibility boundary**: Range Builder owns range construction; AnyComp owns strategic evaluation, scenario comparison, and approval workflows
- **AnyComp enriches** Range Builder output but never replaces it

## Priority Phase
Priority 1 (MVP)

## References
- Full Requirements Doc: requirements/REQ-metric-market.md
- VISION.md Reference: Sections 3, 4, 8.6, 8.7

**Acceptance Criteria**

- RangeBuilderChangeEvent consumption as scenario snapshots
- Pay Structure Config sharing for strategic evaluation
- 5 Sub-Index computation flow (Market Alignment, Cost Discipline, Internal Equity, Workforce Placement, Range Hygiene)
- Feature responsibility boundary enforced between Range Builder and AnyComp
- AnyComp enriches Range Builder output without replacing it

**Tags:** integration, anycomp, metric-market, range-builder, mvp

---

### #62 — RangeBuilderChangeEvent Publisher for AnyComp

| Field | Value |
|-------|-------|
| Status | Planned |
| Priority | high |
| Estimated Effort | medium |
| Type | feature |

**Description**

Metric Market (Range Builder) must publish RangeBuilderChangeEvent payloads when range adjustments occur, for AnyComp to capture as scenario snapshots. Fields: job_family_id, grade, range_min/mid/max, spread, midpoint_progression, effective_date, change_reason.

**Acceptance Criteria**

- Publish change events on range adjustments
- Payload includes all required fields
- Event format consumable by AnyComp
- Historical events queryable

**Tags:** metric-market, anycomp, range-builder, mvp

---

---

*This file is auto-generated from the Kanbai board. Do not edit it directly.*
*Generated at 2026-02-22T18:09:47.428Z.*
