# People Analytics Toolbox

## Overview
The People Analytics Toolbox is a lightweight hub-and-spoke registry application designed to connect and monitor a suite of People Analytics applications. Its core purpose is to serve as a central registry for the ecosystem, tracking application health, documentation quality, and maintaining a unified architectural document. It also facilitates bi-directional communication with downstream applications through a directive system. The project aims to streamline the management and observability of interconnected People Analytics tools, enhancing efficiency and data governance across the ecosystem.

## User Preferences
Not specified.

## System Architecture
The application employs a modern web stack with **React + Vite**, **Tailwind CSS**, and **Shadcn UI** for the frontend, providing a responsive and aesthetically pleasing user interface. **wouter** is used for routing, and **TanStack Query** manages data fetching and caching. The backend is built with **Express.js + TypeScript**, offering a robust API layer. **PostgreSQL** with **Drizzle ORM** serves as the primary database, ensuring data integrity and efficient querying.

Key architectural patterns and features include:
- **Hub-and-Spoke Model**: A central hub manages and communicates with various spoke applications.
- **Modular Design**: The project structure separates concerns into client, server, and shared components.
- **Authentication**: Each registered application receives an auto-generated API key for secure communication.
- **Webhook Notifications**: The hub sends real-time notifications to spoke applications for events like new directives.
- **Dashboard Alerts**: A centralized alert system notifies users of critical issues like offline applications or pending high-priority directives.
- **Bi-directional Communication**:
    - **Hub → Spoke**: Directives (requirements, instructions, documentation upgrades) are pushed to spoke applications.
    - **Spoke → Hub**: Spoke applications can fetch directives, update their status, and push documentation back to the hub.
- **AI Integration**: Utilizes Anthropic Claude via Replit AI Integrations for architecture compilation and an AI-powered agent.
- **Documentation Governance**: AI-powered documentation quality enforcement with automated auditing, gap analysis, and broadcast directive system to push personalized improvement instructions to all below-threshold apps.
- **Universal Agent Prompt System**: Per-app customized agent prompts and hub-sync-agent.js scripts that spoke applications can use to automate the full hub communication cycle (fetch directives, process changes, update documentation, push back, report completion). Available via API (`GET /api/agent-prompt/:slug`, `GET /api/hub-sync-agent/:slug`), the Dev Kit zip, and the "Agent Prompt" tab on each app's detail page.
- **Dynamic System Prompting**: The AI agent's system prompt is dynamically constructed based on enabled roles and ecosystem context.
- **Development Context Generator**: Auto-introspects the codebase to provide rich development context for AI agents, including tech stack, dependencies, API routes, and DB schema.
- **Kanban Integration**: Proxies a Product Kanban application to track development, integrating Kanban card information into the agent's context.
- **Code Cards & Pipelines**: Each spoke app can publish a machine-readable specification (inputs, outputs, config with JSON schemas) making them callable like functions. Pipelines compose apps into ordered sequences of steps with input bindings and config overrides. A unified metrics stream captures KPIs with tags and metadata, viewable through filtered cards.
  - **App Specs**: `app_specs` table stores JSON-schema-based input/output/config definitions per app. Editable via "Spec" tab on app detail page.
  - **Pipelines**: `pipelines` table with `pipeline_steps` for ordered sequences. Steps reference apps and support inputBindings (mapping previous step outputs) and configOverrides.
  - **Metrics Stream**: `app_metrics` table stores tagged KPI values (metricKey, value, unit, tags, metadata). Filterable by app and searchable by key.
  - **AI-Callable Contract**: `GET /api/registry/:slug/contract` returns full app spec in machine-readable format for agent discovery.
  - **Dashboard**: Card-based overview showing apps with spec badges, active pipeline sidebar, and recent metrics feed.

The UI/UX focuses on clear navigation, separating operational tools from developer tools. The sidebar is structured into "Operations" (Dashboard, Registry, Pipelines, Metrics, Directives, Logs) and "DevOps" for developer-centric functionalities, with future plans for role-based access control.

## External Dependencies
- **PostgreSQL**: Relational database for persistent storage.
- **Anthropic Claude**: AI model accessed via Replit AI Integrations for AI agent functionalities and architecture compilation.
- **Product Kanban (External)**: An external Kanban application (e.g., `https://people-analytics-kanban.replit.app`) is integrated via API proxying for project tracking.

## Canonical Field Library
- **66 canonical fields** with **384 total aliases** covering 10 major HRIS platforms
- Field categories: identification, demographics, employment, organization, compensation, performance, benefits, time_attendance
- HRIS platforms supported: Workday, BambooHR, ADP Workforce Now, SAP SuccessFactors, Oracle HCM Cloud, Rippling, UKG Pro, Paylocity, Gusto, Namely
- **Fuzzy matching algorithm** uses Levenshtein distance + Jaro-Winkler similarity for near-miss detection (e.g., `empl_status` -> `employment_status`)
- Match tiers: exact (100), alias (95), label (90), fuzzy (80-89), partial word (40-80)
- Auto-match algorithm uses shared `normalizeFieldName()` (camelCase-aware) and `matchFieldNames()` helpers in `server/routes.ts`
- Enrichment migration in `server/seed.ts` via `enrichExistingFields()` merges new aliases/sources without data loss
- Hub endpoint: `POST /api/fields/match` and spoke endpoint: `POST /api/hub/app/:slug/fields/match` both use the shared matching logic
- **Field Exchange API** (spoke-facing, authenticated):
  - `GET /api/hub/app/:slug/fields/manifest` — Lightweight version check (field count + alias count + last update timestamp)
  - `POST /api/hub/app/:slug/fields/exchange` — Bulk sync: spoke sends discovered column names + confirmed mappings; hub returns matches, creates mappings, enriches aliases, and logs the exchange
  - Confirmed mappings auto-add source names as aliases to canonical fields (normalized with camelCase awareness)
  - Exchange log viewable in the Field Library UI under the "Exchange" tab
- **Field Exchange Client SDK** (`server/sdk/field-exchange-client.ts`):
  - Zero-dependency TypeScript client that spoke apps drop into their codebase
  - Methods: `getManifest()`, `exchange()`, `getAllFields()`, `matchNames()`, `sync()`, `autoMatch()`
  - Downloadable via `GET /api/sdk/field-exchange-client.ts`
  - Integration Dev Kit UI in the Exchange tab with step-by-step guide, code snippets, and download button
- **Field Exchange Feature Module** (Dev Kit):
  - Included as a selectable feature module in the Dev Kit zip generator alongside Documentation and Dev Context Generator modules
  - Bundles: SDK (`field-exchange-client.ts`), Express routes (`field-exchange-routes.js`), React page (`FieldExchange.tsx`), README
  - Routes provide local field mapping CRUD + hub sync endpoints (`/api/field-mappings`, `/api/field-exchange/sync`, `/api/field-exchange/manifest`)
  - React page provides tabbed UI for managing mappings and syncing with hub
- **Field Alignment Dashboard** (`/field-alignment`):
  - Per-app coverage cards showing total/confirmed/unconfirmed mappings and review queue depth
  - Review queue for unmatched/low-confidence fields across all spoke applications
  - Actions: confirm match (select canonical field + auto-add alias), create new canonical field, dismiss
  - Auto-populated from exchange endpoint when spokes send unmatched discoveredNames
  - Re-match button re-analyzes pending items against latest canonical field library (useful after alias enrichment)
  - `field_review_queue` table stores pending items with suggestedMatches (top 3 candidates with confidence + matchType)
  - API endpoints: `GET /api/field-alignment/coverage`, `GET /api/field-alignment/review`, `POST /api/field-alignment/confirm`, `POST /api/field-alignment/dismiss`, `POST /api/field-alignment/new-field`, `POST /api/field-alignment/re-match`
- **Data Profiling System**:
  - `field_data_profiles` table stores statistical profiles per field per app (no raw PII)
  - Profile attributes: patternType, nullRate, uniqueCount/Rate, min/maxLength, sampleFormats, topValues (categorical), numericMin/Max/Mean, formatPattern, detectedDataType
  - Pattern types detected: email, phone, date, datetime, currency, percentage, boolean, integer, decimal, uuid, url, categorical, free_text, identifier
  - **Profile-enhanced matching**: data type similarity boosts/penalizes confidence scores (+10 exact type match, +5 same group, -5 mismatch)
  - Hub API: `GET /api/data-profiles?appSlug=X`, `GET /api/data-profiles/all`, `GET /api/data-profiles/field/:canonicalFieldId`
  - Spoke API: `POST /api/hub/app/:slug/fields/profiles` (authenticated, bulk submit profiles)
  - SDK methods: `profileColumn()`, `profileColumns()`, `submitProfiles()`, `profileAndSubmit()`
  - Data Profiles tab on Field Alignment Dashboard shows profiles grouped by app with pattern badges, null rates, unique counts, top values
  - Exchange endpoint auto-loads existing profiles to boost matching confidence
- **MetricMarket** (`/metric-market`):
  - Yahoo Finance-style HR metrics dashboard with ticker grid, sparklines, and color-coded change indicators
  - Screener dialog with categorized checkbox filters (Workforce Composition, Compensation & Value, Popular Filters, Attrition & Movement, Performance & Development, Engagement & Culture)
  - Search/filter within screener, 3-column layout matching Yahoo Finance stock screener pattern
  - Watchlist feature for starring important metrics
  - Pre-selected default metrics (headcount, compa-ratio, turnover rate, region, engagement score, promotion rate)
  - Integrates with existing app_metrics table for live data when available
- **Role-Based Input Collection**:
  - Token-based secure forms for collecting configuration inputs from stakeholders without requiring login
  - `stakeholder_contacts`, `input_requests`, `input_responses` tables
  - Admin page at `/input-requests` with filtering, creation dialog, status tracking
  - Public standalone collect form at `/collect/:token` (rendered outside sidebar)
  - Server-side required field validation on form submission
  - API: `GET/POST /api/input-requests`, `POST /api/input-requests/:id/send`, `POST /api/input-requests/:id/expire`, `GET/POST /api/collect/:token`
- **Workbench** (`/workbench`):
  - "Bell Labs" for the People Analytics ecosystem — browse, preview, and download reusable code bundles
  - **Code Bundle Registry**: 6 bundles across 4 categories (UI Components, SDKs, Feature Modules, Integrations)
    - Bundles: MetricMarket Dashboard, Field Exchange SDK, Hub Sync Agent, Documentation Quality Engine, Development Context Generator, Role-Based Input Collector
    - Each bundle includes: name, description, category, version, files list, dependencies, tags
    - Preview: view source code of any bundle's main files
    - Download: zip archives with source code, README, and integration routes
  - **Development Context Package**: generates comprehensive ecosystem context document for new Replit development environments
    - Dynamically queries: registered apps, canonical fields, pipelines, app specs, available bundles
    - Produces ~11KB markdown document covering: architecture, apps, bundles, field library, pipelines, API patterns, code conventions, integration guide
    - Copy-to-clipboard for pasting into new project's replit.md
    - Solves the "context gap" problem when spinning up new spoke app environments
  - API: `GET /api/workbench/bundles`, `GET /api/workbench/bundles/:id/preview`, `GET /api/workbench/bundles/:id/download`, `GET /api/workbench/context-package`