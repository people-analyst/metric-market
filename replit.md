# People Analytics Toolbox — Metric Market

## Overview

Metric Market is the **card workbench** of the People Analytics Toolbox ecosystem. It provides a comprehensive platform for creating, configuring, testing, and distributing interactive data visualization components ("cards") for people analytics dashboards. It serves two main audiences: a **Workbench** for administrators and AI agents to author and manage card bundles, and a **Dashboard** for end-users to consume published analytics insights.

The core value proposition lies in **standardized, machine-readable card bundles**. These self-contained definitions declare data schemas, configuration options, output representations, documentation, and example data. This approach ensures consistent UI/UX across the ecosystem and facilitates AI agent discovery and automated card assembly. Each bundle uses JSON Schema contracts, allowing spoke applications to discover data requirements, push conforming payloads, and render visualizations without manual integration.

Key capabilities include:
- 23 distinct D3-powered SVG chart types (including Range Strip, Aligned Range Strip, and Range Target Bullet for compensation range visualization).
- **Range Builder form control** — a dedicated interactive control (not a chart) for compensation range simulation with real-time KPI Index cards (Cost Impact, Peer Equity, Competitiveness, People Impact) each showing a 0-100 goodness index plus supporting metrics. Located at `/range-builder` and registered as `range_builder` control type. Supports job structure filtering by Super Job Function (GTM, R&D, OPS, G&A) and Level Type (Professional P1-P6, Manager M1-M6, Executive E1-E5, Support S1-S4). Includes Target Range Statistics table with Spread %, Min/Max Overlap %, Level Below/Above %, and Promo Opp %. **Custom Level Structure**: users can select Standard (market-defined levels) or custom level count (2-10) which partitions the overall compensation range into N evenly-spaced levels with interpolated market data and proportionally distributed employees.
- Two component categories: **Charts** (read-only visualizations) and **Controls** (interactive form elements with output signals). See `CHART_TYPES` and `CONTROL_TYPES` in `shared/schema.ts`.
- Full card lifecycle management: discovering bundles, defining metrics, configuring charts, assembling cards, pushing data, rendering, refreshing, and linking drill-downs.
- Machine-readable data contracts (`dataSchema`, `configSchema`, `outputSchema`) for inter-application data exchange.
- Hub-and-spoke integration for cross-application coordination, directive processing, and documentation management.
- A scoring and prioritization system for cards.
- Configurable refresh tracking with policies (`manual`, `scheduled`, `on_push`) and cadences.
- **Component Export System** — Discoverable component registry (`GET /api/components`) and export packaging (`GET /api/export/:key`) for cross-app integration. Includes formal data contracts between Conductor (market data producer), AnyComp (KPI output consumer), and Metric Engine (bidirectional metric definition standardization and computed value exchange), with field mappings, example payloads, and integration guides. Frontend at `/export`.
- **PA Design Kit Distribution** — Design System specification API (`GET /api/design-system`) serving the full PA Design Kit v1.1.0 component catalog (15 components), data contracts (9 interfaces), style tokens (brand colors, classification, trends, status, spacing, typography), and spoke consumption guide. Individual components discoverable via `GET /api/design-system/:component`. Hub broadcast directive notifies all 14 spoke apps of design kit updates.

## User Preferences

- Yahoo Finance inspired design (colors `#0f69ff`, `#e0f0ff`, `#232a31`, `#5b636a`, `#e0e4e9`)
- Components should be reusable form elements for People Analytics toolbox
- Elements should be attachable to different database elements
- All buttons should be refined and usable
- "P" branding instead of Yahoo "Y" icons
- Compact, minimal spacing design aesthetic (`rounded-[3px]`, tight padding)
- Charts should be minimal, toned down, use simple lines/greys/blacks/blues
- Two-audience design: admin workbench for superusers/AI, consumer dashboard for end users
- Self-contained card bundles: composable, machine-readable, agent-accessible
- No live drill-down: use database references between cards

## System Architecture

The application is built as a full-stack TypeScript monorepo with shared type definitions.

**Frontend:**
- **UI Framework:** React 18 with functional components and hooks.
- **Styling:** Tailwind CSS 3 for utility-first styling and `shadcn/ui` for headless components.
- **Charting:** D3.js v7 powers all 20 SVG chart components.
- **Routing:** `wouter` for client-side SPA routing.
- **State Management:** `TanStack React Query v5` for server-state, `react-hook-form` with Zod for form state and validation.

**Backend:**
- **Server:** Express.js 4 handling over 30 API endpoints.
- **ORM:** Drizzle ORM for TypeScript-first PostgreSQL interaction.
- **Database Driver:** `node-postgres (pg)`.
- **Validation:** `drizzle-zod` for Zod schema generation from Drizzle table definitions.

**Core Architectural Decisions & Features:**
- **Card Bundles:** Self-contained JSON definitions (`dataSchema`, `configSchema`, `outputSchema`) for each chart type, enabling machine-readable contracts and consistent rendering.
- **Hub-and-Spoke Model:** Metric Market operates as a "spoke" application, integrating with a central "Hub" for coordination, directive processing, and documentation.
- **Two User Interfaces:** A "Workbench" for authoring and an "Dashboard" for consumption.
- **Dynamic Chart Rendering:** `CardWrapper` component dynamically renders charts based on bundle definitions.
- **Data Schemas:** Explicit JSON schemas define data contracts for inter-application data exchange, ensuring data integrity.
- **Card Lifecycle Management:** Comprehensive API for managing the creation, configuration, and data flow of cards.
- **UI/UX Design:** Inspired by Yahoo Finance, emphasizing compact design, refined components, and minimal chart aesthetics.
- **Database Schema:** PostgreSQL 16 managed by Drizzle ORM, with tables for `card_bundles`, `metric_definitions`, `chart_configs`, `cards`, `card_relations`, and `card_data`. These tables define the relationships and store all application data.

## External Dependencies

- **PostgreSQL 16:** Primary relational database (Neon-backed via Replit).
- **Hub SDK v2.1.0:** Unified communication module for hub-and-spoke coordination, handling standard endpoints (`/health`, `/api/hub-webhook`, `/api/specifications`). Documentation is read from `hub-docs.md` (stable) with fallback to `replit.md`.
- **D3.js v7:** JavaScript library for producing dynamic, interactive data visualizations.
- **Vite 5:** Frontend build tool.
- **Tailwind CSS 3:** Utility-first CSS framework.
- **shadcn/ui:** Headless component library.
- **wouter:** Lightweight client-side router.
- **TanStack React Query v5:** Data fetching and caching library.
- **react-hook-form:** Form management library.
- **lucide-react:** Icon library.
- **Express.js 4:** Backend web application framework.
- **Drizzle ORM:** TypeScript ORM for PostgreSQL.
- **node-postgres (pg):** PostgreSQL client for Node.js.
- **drizzle-zod:** Zod schema generation from Drizzle.
- **esbuild:** Fast JavaScript bundler.
- **tsx:** TypeScript execution for development.