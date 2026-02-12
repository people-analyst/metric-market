# People Analytics Toolbox

## Overview
This project is a People Analytics toolbox featuring reusable form elements and data visualization components. It's designed to function as a workbench for creating and configuring interactive data cards, inspired by financial dashboard UIs like Yahoo Finance and Google Finance. The primary goal is to provide a platform for developing, testing, and distributing standardized UI/UX components (card bundles) across an ecosystem of spoke applications (e.g., MetricMarket), thereby serving both administrative users/AI agents and end-user dashboards. The project aims to enable efficient analysis and visualization of people analytics metrics.

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

## System Architecture
The application is built with a React frontend (TypeScript, Vite, Tailwind CSS, shadcn/ui) and an Express.js backend (TypeScript). It employs a hub-and-spoke architecture where this application (`metric-market`) acts as a spoke, creating shareable UI/UX components for other spoke applications within the ecosystem.

**Core Design Principles:**
- **Card Bundle Architecture:** Cards are built from self-contained, machine-readable bundles. Each bundle declares data, configuration, and output schemas (JSON Schema), default values, example data, documentation, and infrastructure notes. These bundles are stored in `card_bundles` and are discoverable via API.
- **Card Instance Lifecycle:** The system supports a lifecycle for card instances including discovery, metric definition, chart configuration, card assembly, data pushing, rendering, refresh tracking, and drill-down linking.
- **Data Model:** Key entities include `card_bundles` (chart definitions), `metric_definitions` (what is measured), `chart_configs` (display settings), `cards` (configured instances), `card_relations` (links between cards for drill-downs), and `card_data` (time-series data payloads).
- **UI/UX:** The frontend includes a `CardWrapper` component for dynamic rendering of 20 D3-powered SVG chart components within a standard card frame. A `WorkbenchPage` provides an admin interface for managing bundles, metrics, chart configurations, and cards, including schema inspection and live previews.
- **Data Contracts:** Explicit JSON Schema contracts within each card bundle define the shape of data payloads (`dataSchema`), configurable display options (`configSchema`), and rendered output representation (`outputSchema`).

**Technical Implementations:**
- **Frontend:** React 18, Vite, Tailwind CSS, `shadcn/ui`, `wouter` for routing, `TanStack React Query` for state management.
- **Backend:** Express.js, `esbuild` for server builds.
- **Database:** PostgreSQL managed via Drizzle ORM (`node-postgres`/`pg`).
- **Hub Integration:** A `hub-client` module handles communication with a central Hub for cross-application coordination, including health checks, webhook directives, documentation pushing, and registry/architecture fetching.

## External Dependencies
- **PostgreSQL:** Primary database for all application data, managed by Drizzle ORM.
- **Central Hub:** A proprietary central service for ecosystem coordination, requiring `HUB_URL`, `HUB_APP_SLUG`, and `HUB_API_KEY` for integration.
- **D3.js:** Used for powering the 20 distinct SVG chart components.
- **Tailwind CSS:** For styling the frontend components.
- **shadcn/ui:** Component library utilized for UI elements.
- **Vite:** Frontend build tool.
- **esbuild:** Backend build tool.
- **TanStack React Query:** For data fetching and state management in the frontend.
- **wouter:** Client-side router.