# Metric Market

## Overview

Metric Market is the **data visualization, dashboard layer, and metrics marketplace** of the People Analytics Toolbox ecosystem — a hub-and-spoke platform with 14 coordinated HR analytics applications. It serves as the primary consumer-facing display surface where outputs from every other app (compensation scenarios, HR metrics, Monte Carlo forecasts, segmentation data, performance analytics) become visible through a card-based visualization system.

The app provides 31 card bundles covering 28 chart types (built with D3.js), 5 compensation cycle dashboard composites, 1 form control (the Range Builder for interactive compensation range simulation), and 1 PA Design Kit component library. It exposes ingestion endpoints so other spoke apps can push data that automatically creates and populates visualization cards. The Range Builder is the most integration-rich component — it emits `RangeBuilderChangeEvent` signals consumed by AnyComp (the compensation decision engine) and receives market data from Conductor.

Key capabilities:
- Card bundle system with auto-discovery and auto-creation of visualization cards
- Interactive Range Builder for compensation range simulation (form control, not a chart)
- 5 compensation cycle dashboard bundles (comp_cycle_overview, merit_matrix_heatmap, pay_equity_dashboard, governance_flags, geo_compensation)
- 4 spoke ingestion endpoints (Conductor, Metric Engine, AnyComp, PeopleAnalyst)
- 23 seeded metric definitions: 13 standard HR metrics + 10 performance cycle metrics (HAVE Standard envelope format with Conductor/Calculus lineage)
- HAVE Standard metric push to Hub for operational, strategic, and performance domains
- Hub integration with documentation scoring (98/100), directives, webhooks, and Field Exchange SDK

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Stack
- **Frontend**: React 18 + TypeScript, bundled by Vite
- **UI Components**: shadcn/ui (New York style) on Radix UI primitives, styled with Tailwind CSS
- **Client Routing**: wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Charting**: D3.js for all 28 chart types
- **Backend**: Express.js on Node.js with TypeScript (via tsx)
- **Database**: PostgreSQL (Neon-hosted) with Drizzle ORM
- **Schema Validation**: Zod (via drizzle-zod)
- **Fonts**: DM Sans, Fira Code, Geist Mono, Architects Daughter (loaded via Google Fonts)

### Project Structure
```
client/               # React frontend
  src/
    components/       # UI components including shadcn/ui
    lib/              # Utility functions
    hooks/            # Custom React hooks
    pages/            # Route-level page components
server/               # Express backend
  index.ts            # Server entry point (Express on port 5000)
  routes.ts           # All REST + Hub + AI endpoints
  storage.ts          # IStorage interface + DatabaseStorage implementation
  hubMetrics.ts       # HAVE Standard metric push (operational, strategic, performance domains)
  performanceMetricDefinitions.ts  # 10 performance cycle metric definitions + HAVE envelope builder
  seedMetrics.ts      # Performance metrics seeder (runs at startup)
  seedBundles.ts      # Card bundle seeder (runs at startup)
  bundleDefinitions.ts # All 31 card bundle definitions with schemas
  aiAgent.ts          # AI agent for processing natural language instructions
  vite.ts             # Vite dev server integration + static file serving
shared/
  schema.ts           # Drizzle table definitions + Zod schemas + TypeScript types
docs/                 # Documentation (Kanbai setup, design system, integration specs)
```

### Route Registration Order (Critical)
API routes MUST be registered BEFORE the Vite catch-all middleware. The `registerRoutes(app)` call must come first, then static file serving / `app.get("*", ...)`. Otherwise Vite's catch-all swallows `/api/*` and `/health` requests and returns HTML instead of JSON.

### Database Schema (Drizzle ORM)
Key tables defined in `shared/schema.ts`:
- **`users`** — Authentication (id UUID PK, username unique, password)
- **`card_bundles`** — Visualization card type registry (id UUID PK, key unique, chartType, displayName, plus additional config columns)
- Additional tables for card instances, metric definitions, and other domain objects

### Card Bundle System
The core data model: a **card bundle** defines a visualization type (one of 31 registered bundles mapping to 28 chart types + 1 control + PA Design Kit components). **Card instances** are created from bundles and populated with data. Cards can be auto-created when spoke apps push data through ingestion endpoints.

Categories:
- **Standard Charts** (23 types): confidence_band, alluvial, waffle_bar, bullet_bar, slope_comparison, bubble_scatter, box_whisker, strip_timeline, waffle_percent, heatmap, strip_dot, multi_line, tile_cartogram, timeline_milestone, dendrogram, radial_bar, bump, sparkline_rows, stacked_area, range_strip, range_strip_aligned, interactive_range_strip, range_target_bullet, range_dot_plot
- **Compensation Cycle Dashboards** (5 types): comp_cycle_overview, merit_matrix_heatmap, pay_equity_dashboard, governance_flags, geo_compensation
- **Controls** (1): range_builder
- **Design Kit** (1): PA Design Kit component library

### Range Builder Architecture
The Range Builder is classified as a **form control** (component type `range_builder`), not a chart. It produces output signals (RangeBuilderChangeEvent) consumed by downstream apps. Users select a slice of job architecture (by Super Job Function and Level Type), then interact with segmented strips to adjust target ranges. It calculates structural measures (spread, overlap, gap, symmetry) and displays 4 KPI index cards (0-100 goodness scores).

### AI Agent
`server/aiAgent.ts` provides a simple natural language instruction processor for managing bundles, cards, and system status. It pattern-matches on keywords (list bundles, create bundle, status, etc.) and delegates to storage operations.

### Hub-and-Spoke Integration
Metric Market is a **spoke application** in the People Analytics Toolbox ecosystem:
- **Hub SDK**: `hub-sdk.js` (or `.cjs`) in project root handles all hub communication
- **Authentication**: `X-API-Key` header with `pat_...` format key (stored as `HUB_API_KEY` secret)
- **Endpoints registered with hub**: `GET /health`, `POST /api/hub-webhook`, `GET /api/specifications`
- **Documentation sync**: `hub-docs.md` is the stable documentation file pushed to the hub (NOT `replit.md` which is volatile)
- **Directives**: Fetched from hub, acknowledged, and completed via Hub SDK
- **Field Exchange**: Canonical field mappings registered for compensation fields

### Kanbai Integration
The app integrates with the Kanbai kanban system for automated task processing:
- Unified bundle file `kanbai-metric-market.js` provides connector + AI agent runner
- Mounted with `require("./kanbai-metric-market").mount(app)`
- Requires `DEPLOY_SECRET_KEY` and `ANTHROPIC_API_KEY` secrets
- Claude-powered agent loop: poll tasks → claim → implement → verify → complete

### Ingestion Architecture
Four spoke-specific ingestion endpoints accept pushed data from other ecosystem apps:
| Endpoint | Source App | Auto-creates |
|----------|-----------|-------------|
| `POST /api/ingest/conductor` | Conductor | range_strip, range_strip_aligned, range_target_bullet cards |
| `POST /api/ingest/metric-engine` | Metric Engine Calculus | Auto-discovered metric bundles and cards |
| `POST /api/ingest/anycomp` | AnyComp | Scenario comparison, recommendation, score cards |
| `POST /api/ingest/people-analyst` | PeopleAnalyst | confidence_band and bubble_scatter cards |

### Design System
The PA Design System follows a **Google Finance / Yahoo Finance** visual language: information-dense, compact ticker rows, delta-aware metrics (green up / red down), semantic CSS custom properties for colors (never hardcoded hex), and dark/light mode parity. Signal colors for metric classification: Normal (emerald), Watch (amber), Alert (orange), Critical (red).

## External Dependencies

### Infrastructure
- **PostgreSQL (Neon)**: Primary database, accessed via Drizzle ORM with `pg` connection pool
- **Vite**: Frontend bundler for dev and production builds

### Ecosystem Services
- **People Analytics Toolbox Hub**: Central coordinator at configurable URL (see `hub-config.json`). Handles registration, directives, documentation scoring, Field Exchange, and webhook notifications
- **Kanbai (Product Kanban)**: Task management and AI agent task distribution at `https://people-analytics-kanban.replit.app`
- **AnyComp**: Downstream consumer of RangeBuilderChangeEvent; pushes optimization results back
- **Conductor**: Pushes market compensation data (percentiles, employee counts, BLS wages), performance tier assignments, governance rules, country-level budget data
- **Metric Engine Calculus**: Pushes computed HR metrics (attrition, compa-ratio, etc.) and performance cycle analytics
- **Calculus**: Computes per-employee increase calculations, compa-ratio, chi-square tests, Cramer's V, harshness indices, flight risk scores
- **MetaFactory**: Provides cycle configuration, org hierarchy, country/geo-zone mappings, protected category definitions
- **PeopleAnalyst**: Pushes Monte Carlo forecasts and VOI analyses

### AI Services
- **Anthropic Claude**: Used by the Kanbai agent runner for autonomous task execution (requires `ANTHROPIC_API_KEY`)

### UI Libraries
- **shadcn/ui**: Component library (New York style, Tailwind CSS, Radix UI primitives)
- **D3.js**: All chart rendering (28 chart types)
- **TanStack Query v5**: Server state management
- **wouter**: Client-side routing

### GitHub Sync (Spoke GitHub Sync Standard v2.0)
Bidirectional git-based sync with `people-analyst/metric-market` on GitHub. Uses the Replit GitHub connector for authentication (access token injected into git remote URL). All operations use git CLI with stash safety (stash uncommitted → pull/push → pop stash).

**Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/github/status` | GET | Git branch, uncommitted changes, last commit, IDE detection |
| `/api/github/sync-status` | GET | Full sync metadata (push/pull history, auto-sync state) |
| `/api/github/pull` | POST | Pull latest from GitHub (stash-safe). Body: `{branch?, source?, trigger?}` |
| `/api/github/push` | POST | Push local changes to GitHub with IDE tagging. Body: `{branch?, ide?, message?}` |
| `/api/github/auto-sync/start` | POST | Enable periodic auto-push (every 300s) |
| `/api/github/auto-sync/stop` | POST | Disable periodic auto-push |

**Auth:** Same-origin requests pass through. External requests require `Authorization: Bearer <DEPLOY_SECRET_KEY>`.

**IDE Detection:** Automatically tags commits with the IDE/tool that made the change (replit, cursor, windsurf, claude-agent, etc.) via environment variable detection. Hub receives sync events for unified activity timeline.

**Startup:** Auto-pull on server boot (non-fatal if it fails). Auto-sync (periodic push) enabled by default.

**Key file:** `server/githubSync.ts` — all sync logic, auth helper, IDE detection.

### Environment Variables (Secrets)
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `HUB_API_KEY` | Authentication with People Analytics Hub |
| `DEPLOY_SECRET_KEY` | Kanbai ecosystem shared key + GitHub sync auth |
| `ANTHROPIC_API_KEY` | Claude API for AI agent tasks |
| `APP_SLUG` | App identifier for Hub sync events (default: `metric-market`) |
| `HUB_URL` | Hub URL for sync event notifications (default: `https://pa-toolbox.replit.app`) |
| `GIT_BRANCH` | Default branch for pull/push (default: `main`) |
| `IDE_SOURCE` | Override IDE detection (e.g., `cursor`, `windsurf`) |