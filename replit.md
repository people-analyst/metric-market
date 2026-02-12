# People Analytics Toolbox

## Overview
A People Analytics toolbox with reusable form elements inspired by Yahoo Finance and Google Finance designs. Built with React, Express, TypeScript, and Tailwind CSS. Components are designed to be attached to different database elements. Part of a hub-and-spoke ecosystem architecture where this workbench creates reusable UI/UX components shared across spoke applications (MetricMarket, etc.).

## Two Audiences
1. **Workbench (Admin/Superuser + AI Agents)**: Create, configure, and test card/chart types with full control. Define metrics, pair them with chart configurations, and assemble cards. The authoring environment.
2. **Dashboard (End Users)**: Consume pre-packaged cards fed by data from the Metric Calculator and other spoke apps. Read-only, polished experience.

## Card Bundle Architecture
Cards are built from **self-contained bundles** — composable, machine-readable definitions that declare everything needed to render and manage a card type. Each bundle includes:
- **Data Schema**: What data the chart requires (JSON Schema format)
- **Config Schema**: What configuration options are available (colors, labels, dimensions)
- **Output Schema**: What the rendered output represents
- **Defaults**: Default configuration values
- **Example Data + Config**: Working examples for preview and testing
- **Documentation**: Human/AI-readable description of purpose, usage, and data requirements
- **Infrastructure Notes**: What systems/libraries are needed to operate the bundle

Bundles are stored in `card_bundles` table and auto-seeded on server startup from `server/bundleDefinitions.ts`. AI agents can discover bundles via `GET /api/bundles` and inspect schemas via `GET /api/bundles/key/:key`.

### Card Instance Lifecycle
1. **Discover**: Browse available bundles and their data contracts
2. **Define Metric**: Create a metric definition (what is being measured)
3. **Configure Chart**: Create a chart config linked to a bundle (how to display it)
4. **Assemble Card**: Create a card instance linking bundle + metric + chart config
5. **Push Data**: Spoke apps push data payloads via `POST /api/cards/:id/data`
6. **Render**: CardWrapper resolves chartType from bundle/config and renders with latest data
7. **Refresh**: Cards track refresh status; algorithms can score importance/significance/relevance
8. **Drill-down**: Card relations link parent cards to sub-measure cards via `card_relations` table

### No Live Drill-down
Since charts are pre-rendered from stored data, drill-downs are **database references** to other cards (not constructed on the fly). A card can reference sub-measure cards via `card_relations` with `relationType: "drilldown"`. The API at `GET /api/cards/:id/drilldowns` returns linked cards.

## Hub-and-Spoke Integration
This app (slug: `metric-market`) connects to a central Hub for cross-application coordination. The hub-client module (`server/hub-client.ts`) uses environment variables:
- `HUB_URL` — The Hub's base URL
- `HUB_APP_SLUG` — This app's registered slug (`metric-market`)
- `HUB_API_KEY` — Secret API key for authentication (stored in Replit Secrets)

### Standard Hub Endpoints (required by all spoke apps)
- `GET /health` — Health check for hub monitoring (returns status, app slug, timestamp)
- `POST /api/hub-webhook` — Receives real-time directive notifications; auto-acknowledges new directives
- `GET /api/specifications` — Returns replit.md content as plain text for hub documentation pulls

### Hub API Endpoints (proxied through this server)
- `GET /api/hub/status` — Check hub configuration status
- `GET /api/hub/directives?status=pending` — Fetch directives from Hub
- `PATCH /api/hub/directives/:id` — Update directive status (acknowledged/completed/rejected)
- `POST /api/hub/documentation` — Push documentation to Hub
- `GET /api/hub/registry` — Fetch spoke app registry
- `GET /api/hub/architecture` — Fetch ecosystem architecture

## Recent Changes
- 2026-02-12: Added standard hub endpoints: /health, /api/hub-webhook, /api/specifications
- 2026-02-12: Integrated hub-client module for Hub-and-Spoke communication (directives, registry, architecture, documentation push)
- 2026-02-12: Built Card Bundle architecture — 20 self-contained bundle definitions with data/config/output schemas, documentation, and example data
- 2026-02-12: Added card_bundles and card_relations tables; extended cards with refresh/scoring fields
- 2026-02-12: Added Bundle Browser to Workbench with schema inspection, documentation, and live preview
- 2026-02-12: Added Card Relations section for drill-down linking between cards
- 2026-02-12: Added convenience endpoint GET /api/cards/:id/full (card + bundle + config + metric + latest data + relations)
- 2026-02-12: Auto-seed 20 bundle definitions on server startup
- 2026-02-12: Built data layer — metric_definitions, chart_configs, cards, card_data tables with full CRUD API
- 2026-02-12: Created CardWrapper component that dynamically renders any of 20 chart types from chartType + payload
- 2026-02-12: Built Workbench admin page for defining metrics, chart configs, and cards with API reference
- 2026-02-12: Built Chart Library with 20 D3-powered SVG chart components

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (client-side), Express (server-side API)
- **State Management**: TanStack React Query
- **Database**: PostgreSQL via Drizzle ORM (node-postgres / pg)
- **Build**: Vite for client, esbuild for server
- **Ecosystem**: Hub-and-spoke architecture; this workbench is the hub creating shared components

## Data Model

### card_bundles
Self-contained chart type definitions. One per chart type. Seeded automatically.
- key, chartType, displayName, description, version
- dataSchema (JSONB), configSchema (JSONB), outputSchema (JSONB)
- defaults (JSONB), exampleData (JSONB), exampleConfig (JSONB)
- documentation, category, tags, infrastructureNotes

### metric_definitions
What metrics exist. Contract between Metric Calculator spoke and this workbench.
- key, name, category, unit, source, cadence, calculationNotes

### chart_configs
Pairs a chart type with display settings. Reusable across cards.
- name, chartType, bundleId (FK → card_bundles), settings (JSONB)

### cards
Configured instances tying bundle + metric + chart config with metadata.
- bundleId (FK), metricId (FK), chartConfigId (FK)
- title, subtitle, tags, sourceAttribution, status, isPublished
- refreshPolicy, refreshCadence, lastRefreshedAt, nextRefreshAt, refreshStatus
- importance, significance, relevance, scoringMetadata (JSONB)

### card_relations
Links between cards for drill-downs and related-card navigation.
- sourceCardId (FK), targetCardId (FK)
- relationType (drilldown | component_of | related | parent)
- label, sortOrder, navigationContext (JSONB)

### card_data
Time-series data payloads pushed by spoke apps.
- cardId (FK), payload (JSONB), periodLabel, effectiveAt

## API Endpoints (24 total)

### Bundles (Chart Type Contracts)
- `GET /api/bundles` — List all bundles
- `GET /api/bundles/:id` — Get bundle by ID
- `GET /api/bundles/key/:key` — Get bundle by key (e.g. multi_line)
- `POST /api/bundles` — Create a custom bundle
- `PATCH /api/bundles/:id` — Update a bundle
- `DELETE /api/bundles/:id` — Delete a bundle

### Metrics
- `GET /api/metric-definitions` — List all metrics
- `POST /api/metric-definitions` — Create a metric
- `PATCH /api/metric-definitions/:id` — Update a metric
- `DELETE /api/metric-definitions/:id` — Delete a metric

### Chart Configs
- `GET /api/chart-configs` — List all chart configurations
- `POST /api/chart-configs` — Create a chart config
- `PATCH /api/chart-configs/:id` — Update a chart config
- `DELETE /api/chart-configs/:id` — Delete a chart config

### Cards
- `GET /api/cards` — List all cards
- `GET /api/cards/:id` — Get a card
- `GET /api/cards/:id/full` — Get card + bundle + config + metric + latest data + relations
- `POST /api/cards` — Create a card
- `PATCH /api/cards/:id` — Update a card (scoring, refresh, metadata)
- `DELETE /api/cards/:id` — Delete a card

### Card Data
- `GET /api/cards/:id/data` — List all data snapshots
- `GET /api/cards/:id/data/latest` — Get latest data payload
- `POST /api/cards/:id/data` — Push new data (auto-updates refresh status)

### Relations
- `GET /api/cards/:id/drilldowns` — Get drill-down cards
- `GET /api/cards/:id/relations` — Get all relations
- `POST /api/card-relations` — Create a relation
- `DELETE /api/card-relations/:id` — Delete a relation

### Utility
- `GET /api/chart-types` — List all 20 chart types

## CardWrapper Component
`client/src/components/CardWrapper.tsx` — Dynamically renders any chart inside a standard Card frame. Maps `chartType` string to the correct chart component from CHART_COMPONENT_MAP.

## Workbench Admin Page
`client/src/pages/WorkbenchPage.tsx` — Admin interface with:
- **Bundle Browser**: Browse all 20 bundles, inspect schemas, view documentation, preview with example data
- **Metric Definitions**: Create/manage metric definitions
- **Chart Configurations**: Create/manage configs (linked to bundles)
- **Cards**: Assemble cards with bundle + metric + config, set refresh policy and scoring
- **Card Relations**: Link cards for drill-down navigation
- **API Reference**: All endpoints documented

## Chart Library (20 D3-powered SVG components)
All charts in `client/src/components/charts/`. Strict palette: #0f69ff, #e0f0ff, #232a31, #5b636a, #e0e4e9.

Charts: ConfidenceBandChart, AlluvialChart, WaffleBarChart, BulletBarChart, SlopeComparisonChart, BubbleScatterChart, BoxWhiskerChart, StripTimelineChart, WafflePercentChart, HeatmapChart, StripDotChart, MultiLineChart, TileCartogramChart, TimelineMilestoneChart, ControlChart, DendrogramChart, RadialBarChart, BumpChart, SparklineRowsChart, StackedAreaChart.

## Structure
```
client/           - React frontend
  src/
    components/     - Reusable form components
      charts/       - 20 D3-powered chart components + presets
      ui/           - shadcn/ui base components
      app-sidebar.tsx - Sidebar navigation (Admin + Components groups)
      CardWrapper.tsx - Dynamic chart renderer with metadata frame
    pages/          - Page components
      WorkbenchPage.tsx  - Admin: bundles, metrics, configs, cards, relations, API reference
      ScreenerPage.tsx   - Stock Screener Filters demo
      ChooserPage.tsx    - Filter Chooser demo
      RangePage.tsx      - Range Input demo
      MenuPage.tsx       - Menu component demo
      MetricMarketPage.tsx - Card Viewer dashboard (spoke app)
      ChartLibraryPage.tsx - All 20 charts rendered with sample data
      GoogleFinancePage.tsx - Google Finance-style dashboard
      MetricDetailPage.tsx  - Metric detail page
    lib/            - Utilities and query client
    hooks/          - Custom hooks
server/           - Express backend
  db.ts             - Database connection (pg + drizzle)
  index.ts          - Server entry point (includes bundle seeding)
  routes.ts         - API routes (CRUD for bundles/metrics/configs/cards/data/relations)
  storage.ts        - DatabaseStorage class implementing IStorage
  seedBundles.ts    - Auto-seeds 20 bundle definitions on startup
  bundleDefinitions.ts - All 20 bundle definitions with schemas and documentation
  vite.ts           - Vite dev server integration
shared/           - Shared types/schemas
  schema.ts       - Drizzle schema: users, card_bundles, metric_definitions, chart_configs, cards, card_relations, card_data
```

## User Preferences
- Yahoo Finance inspired design (colors #0f69ff, #e0f0ff, #232a31, #5b636a, #e0e4e9)
- Components should be reusable form elements for People Analytics toolbox
- Elements should be attachable to different database elements
- All buttons should be refined and usable
- "P" branding instead of Yahoo "Y" icons
- Compact, minimal spacing design aesthetic (rounded-[3px], tight padding)
- Charts should be minimal, toned down, use simple lines/greys/blacks/blues
- Two-audience design: admin workbench for superusers/AI, consumer dashboard for end users
- Self-contained card bundles: composable, machine-readable, agent-accessible
- No live drill-down: use database references between cards
