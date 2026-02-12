# People Analytics Toolbox

## Overview
A People Analytics toolbox with reusable form elements inspired by Yahoo Finance and Google Finance designs. Built with React, Express, TypeScript, and Tailwind CSS. Components are designed to be attached to different database elements. Part of a hub-and-spoke ecosystem architecture where this workbench creates reusable UI/UX components shared across spoke applications (MetricMarket, etc.).

## Two Audiences
1. **Workbench (Admin/Superuser + AI Agents)**: Create, configure, and test card/chart types with full control. Define metrics, pair them with chart configurations, and assemble cards. The authoring environment.
2. **Dashboard (End Users)**: Consume pre-packaged cards fed by data from the Metric Calculator and other spoke apps. Read-only, polished experience.

## Recent Changes
- 2026-02-12: Built data layer — metric_definitions, chart_configs, cards, card_data tables with full CRUD API
- 2026-02-12: Created CardWrapper component that dynamically renders any of 20 chart types from chartType + payload
- 2026-02-12: Built Workbench admin page for defining metrics, chart configs, and cards with API reference
- 2026-02-12: Removed ABC labels from RadialBarChart, color-coded legend handles identification
- 2026-02-12: Added sectionLabels support to TileCartogramChart for sub-regional grouped grids
- 2026-02-12: Rebuilt non-US presets as organized sub-regional grids (N. America, S. America, EMEA, APAC)
- 2026-02-12: Built Chart Library with 20 D3-powered SVG chart components
- 2026-02-12: Added MetricMarket dashboard page (ticker cards, sparklines, screener panel, watchlist) from bundle
- 2026-02-12: Added sidebar navigation with wouter routing to toggle between component pages
- 2025-02-12: Built three reusable form components from Figma designs (StockScreenerFilters, FilterChooser, RangeInputFilter)
- 2025-02-12: Initial Figma import and migration to Replit environment

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (client-side), Express (server-side API)
- **State Management**: TanStack React Query
- **Database**: PostgreSQL via Drizzle ORM (node-postgres / pg)
- **Build**: Vite for client, esbuild for server
- **Ecosystem**: Hub-and-spoke architecture; this workbench is the hub creating shared components

## Data Model (Hub API)
- **metric_definitions** — What metrics exist (key, name, category, unit, source, cadence, calculation notes). The contract between the Metric Calculator spoke and this workbench.
- **chart_configs** — Pairs a chart type (one of 20) with display settings stored as JSONB (colors, axis labels, dimensions). Reusable across cards.
- **cards** — A configured instance tying a metric to a chart config, with metadata (title, tags, source attribution, status, isPublished). The unit of content.
- **card_data** — Time-series data payloads (JSONB) pushed by spoke apps. Each record has effectiveAt + periodLabel. Latest payload feeds the card's chart.

## API Endpoints (for spoke apps)
- `GET /api/metric-definitions` — List all metrics
- `POST /api/metric-definitions` — Create a metric definition
- `PATCH /api/metric-definitions/:id` — Update a metric
- `DELETE /api/metric-definitions/:id` — Delete a metric
- `GET /api/chart-configs` — List all chart configurations
- `POST /api/chart-configs` — Create a chart config (chartType + settings JSONB)
- `PATCH /api/chart-configs/:id` — Update a chart config
- `DELETE /api/chart-configs/:id` — Delete a chart config
- `GET /api/cards` — List all cards
- `POST /api/cards` — Create a card (links metric + chart config)
- `PATCH /api/cards/:id` — Update a card
- `DELETE /api/cards/:id` — Delete a card
- `GET /api/cards/:id/data` — List all data snapshots for a card
- `GET /api/cards/:id/data/latest` — Get latest data payload
- `POST /api/cards/:id/data` — Push new data payload (spoke apps call this)
- `GET /api/chart-types` — List all 20 available chart types

## CardWrapper Component
`client/src/components/CardWrapper.tsx` — Dynamically renders any chart inside a standard Card frame. Maps `chartType` string to the correct chart component from the library. Props: title, subtitle, chartType, chartProps (JSONB payload), tags, sourceAttribution, periodLabel.

## Workbench Admin Page
`client/src/pages/WorkbenchPage.tsx` — Admin interface for:
- Creating/managing metric definitions
- Creating/managing chart configurations (selecting from 20 chart types)
- Assembling cards (linking metrics to chart configs)
- API reference section showing all endpoints for spoke app integration

## Reusable Components
- **StockScreenerFilters** (`client/src/components/StockScreenerFilters.tsx`) - Interactive filter form with badge, toggle, input, and add filter types.
- **FilterChooser** (`client/src/components/FilterChooser.tsx`) - Checkbox-based filter picker organized by categories with search.
- **RangeInputFilter** (`client/src/components/RangeInputFilter.tsx`) - Standalone range input with condition dropdown.
- **DetailCard** (`client/src/components/DetailCard.tsx`) - Fact-sheet card with tags, key-value rows, and footer.
- **OrgMetricCard** (`client/src/components/OrgMetricCard.tsx`) - Organization metric card with ticker badge and trend arrow.
- **ResearchCard** (`client/src/components/ResearchCard.tsx`) - Peer-reviewed research card with citation and tags.
- **AnalysisSummaryCard** (`client/src/components/AnalysisSummaryCard.tsx`) - Analysis summary with risk-level indicator.
- **ActionPlanCard** (`client/src/components/ActionPlanCard.tsx`) - Action plan with checklist and progress bar.
- **CompetitiveIntelCard** (`client/src/components/CompetitiveIntelCard.tsx`) - Competitive intelligence card with benchmark data.

## Chart Library (20 D3-powered SVG components)
All charts in `client/src/components/charts/`. Each accepts typed props and renders from data. Strict palette: #0f69ff, #e0f0ff, #232a31, #5b636a, #e0e4e9.

Charts: ConfidenceBandChart, AlluvialChart, WaffleBarChart, BulletBarChart, SlopeComparisonChart, BubbleScatterChart, BoxWhiskerChart, StripTimelineChart, WafflePercentChart, HeatmapChart, StripDotChart, MultiLineChart, TileCartogramChart, TimelineMilestoneChart, ControlChart, DendrogramChart, RadialBarChart, BumpChart, SparklineRowsChart, StackedAreaChart.

Geographic presets: `tilePresets.ts` — N. America, S. America, EMEA, APAC (sub-regional grids with sectionLabels), Regions (macro squares).

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
      WorkbenchPage.tsx  - Admin: metrics, chart configs, cards, API reference
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
  db.ts           - Database connection (pg + drizzle)
  index.ts        - Server entry point
  routes.ts       - API routes (CRUD for metrics/configs/cards/data)
  storage.ts      - DatabaseStorage class implementing IStorage
  vite.ts         - Vite dev server integration
shared/           - Shared types/schemas
  schema.ts       - Drizzle schema: users, metric_definitions, chart_configs, cards, card_data
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
