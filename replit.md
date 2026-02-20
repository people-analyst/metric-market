# Metric Market

## Overview

Metric Market is the **data visualization and dashboard layer** of the People Analytics Toolbox ecosystem — a hub-and-spoke platform with 13+ specialized HR analytics applications. It serves as the primary consumer-facing display surface where outputs from every other app (compensation scenarios, HR metrics, Monte Carlo forecasts, segmentation data) become visible through a card-based visualization system.

The app provides 25 card bundles covering 23 chart types (built with D3.js), 1 form control (the Range Builder for interactive compensation range simulation), and 1 PA Design Kit component library. It exposes ingestion endpoints so other spoke apps can push data that automatically creates and populates visualization cards. The Range Builder is the most integration-rich component — it emits `RangeBuilderChangeEvent` signals consumed by AnyComp (the compensation decision engine) and receives market data from Conductor.

Key capabilities:
- Card bundle system with auto-discovery and auto-creation of visualization cards
- Interactive Range Builder for compensation range simulation (form control, not a chart)
- 4 spoke ingestion endpoints (Conductor, Metric Engine, AnyComp, PeopleAnalyst)
- 13 seeded metric definitions with bidirectional sync to Metric Engine
- Hub integration with documentation scoring (98/100), directives, webhooks, and Field Exchange SDK

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Stack
- **Frontend**: React 18 + TypeScript, bundled by Vite
- **UI Components**: shadcn/ui (New York style) on Radix UI primitives, styled with Tailwind CSS
- **Client Routing**: wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Charting**: D3.js for all 23 chart types
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
The core data model: a **card bundle** defines a visualization type (one of 25 registered bundles mapping to 23 chart types + 1 control + PA Design Kit components). **Card instances** are created from bundles and populated with data. Cards can be auto-created when spoke apps push data through ingestion endpoints.

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
- **Conductor**: Pushes market compensation data (percentiles, employee counts, BLS wages)
- **Metric Engine Calculus**: Pushes computed HR metrics (attrition, compa-ratio, etc.)
- **PeopleAnalyst**: Pushes Monte Carlo forecasts and VOI analyses

### AI Services
- **Anthropic Claude**: Used by the Kanbai agent runner for autonomous task execution (requires `ANTHROPIC_API_KEY`)

### UI Libraries
- **shadcn/ui**: Component library (New York style, Tailwind CSS, Radix UI primitives)
- **D3.js**: All chart rendering (23 chart types)
- **TanStack Query v5**: Server state management
- **wouter**: Client-side routing

### Environment Variables (Secrets)
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `HUB_API_KEY` | Authentication with People Analytics Hub |
| `DEPLOY_SECRET_KEY` | Kanbai ecosystem shared key |
| `ANTHROPIC_API_KEY` | Claude API for AI agent tasks |