# Kanbai Metric Market — Status Report

**Generated:** 2026-02-22  
**Scope:** 27 Kanbai cards (Backlog + Planned) for Metric Market  
**Purpose:** Single source of truth for completed work, open items, and handoff to local agent.

---

## Summary

| Category | Count |
|----------|--------|
| **Completed** | 24 |
| **Open (blocked or deferred)** | 3 |
| **Planned (larger project)** | 2 |

---

## Completed Items

| Card | Title | Implementation Notes |
|------|--------|----------------------|
| **#50** | Metric Market Dashboard Push (Dev Ops) | Product Kanban ingest: 4 cards (velocity, app health, burndown, sprint health gauge), `refreshCadence: "6h"`, tags `development-ops`. `server/ingest.ts`. |
| **#62** | RangeBuilderChangeEvent Publisher | `POST /api/range-builder/events`, `GET /api/range-builder/events?limit=N`. In-memory store. Range Builder page publishes on change. `server/routes.ts`, `client/src/pages/RangeBuilderPage.tsx`. |
| **#72** | Forecast Card Bundle Registration | Bundle `people_analyst_forecasts` in `server/bundleDefinitions.ts`. People-analyst ingest uses it. |
| **#83** | Build Market Data Ingestion from Conductor | `POST /api/ingest/conductor` — already present. `server/ingest.ts`. |
| **#85** | Wire Range Builder to Live Conductor Data | `GET /api/range-builder/market-data`. Range Builder overlay by key/index; fallback when Conductor unavailable. `server/routes.ts`, `client/src/pages/RangeBuilderPage.tsx`. |
| **#86** | Create Initial Compensation Card Instances from Conductor | Conductor ingest creates range_strip, range_strip_aligned, range_target_bullet. `server/ingest.ts`. |
| **#88** | Map Conductor Fields to Hub Canonical | Doc: `docs/CONDUCTOR_FIELD_MAPPING_TO_HUB.md`. |
| **#89** | Build Metric Push Ingestion from Metric Engine | `POST /api/ingest/metric-engine` — already present. `server/ingest.ts`. |
| **#90** | Auto-Create Cards from Incoming Metrics | Metric Engine ingest uses `inferChartType` + `findOrCreateCard`. `server/ingest.ts`. |
| **#91** | Bidirectional Metric Definition Sync | `GET /api/metric-definitions` — already present. `server/routes.ts`. |
| **#92** | Push Visualization Specs to Metric Engine | `GET /api/specifications/visualization` (chartTypes, chartTypeToBundleKeys, bundleKeys, schemas). `server/routes.ts`. |
| **#101** | Build PeopleAnalyst Ingestion Endpoint | `POST /api/ingest/people-analyst` — already present. `server/ingest.ts`. |
| **#102** | Create Forecast Dashboard Layout | Page `/forecast-dashboard`, scenario toggle, PeopleAnalyst cards. `client/src/pages/ForecastDashboardPage.tsx`, route + sidebar. |
| **#103** | Wire VOI Analysis to Bubble Scatter | People-analyst ingest maps `voiAnalysis` to bubble_scatter. `server/ingest.ts`. |
| **#106** | Build Ecosystem Health Dashboard | Page `/ecosystem-health`, Product Kanban cards. `client/src/pages/EcosystemHealthPage.tsx`, route + sidebar. |
| **#107** | Create ROI Analysis Cards | VOI Calculator ingest: bullet_bar, confidence_band. Card doc updated. `server/ingest.ts`. |
| **#123** | Expose Card Bundle Discovery API | `GET /api/bundles` — already present. `server/routes.ts`. |
| **#124** | Expose Card Data Push Endpoint | `POST /api/cards/:id/data` — already present; updates lastRefreshedAt, refreshStatus. `server/routes.ts`. |
| **#125** | Document Refresh Policy | `docs/REFRESH_POLICY_FOR_SPOKE_INTEGRATIONS.md`. Card doc: `docs/cards/document_refresh_policy_configuration_for_spoke_integrations.md`. |
| **#137** | Expose Card Bundle Creation API from Metric Definitions | `POST /api/bundles/from-metric-definition` (key, name, category, unit, etc.; infers chart type). `server/routes.ts`, `server/ingest.ts` (export inferChartType). |
| **#138** | Enable CORS for Conductor | CORS middleware for `.replit.app` / `.replit.dev`. `server/index.ts`. |
| **#139** | Expose Component Export API | `GET /api/components`, `GET /api/components/:key`, `GET /api/export/:key` — documented in `docs/COMPONENT_EXPORT_API.md`. |
| **#181** | Accept Decision Tracking Cards via API | `POST /api/ingest/decision-wizard`. `server/ingest.ts`; listed in `/api/ingest/status`. |
| **#206** | Expose Card Bundle Creation API Schema | `docs/BUNDLE_CREATION_API_SCHEMA.md` (request/response, chart types, survey usage). |

---

## Open Items (with notes)

| Card | Title | Notes |
|------|--------|--------|
| **#105** | Add Segment Dimension Filtering Across Cards | **Blocked / dependency:** Requires Segmentation Studio population dimensions (department, location, tenure) and frontend filter state shared across card views. Unblock when segment API/source is defined. |
| **#5** | MetricMarket (Yahoo Finance–Style Dashboard) | **Deferred / scope:** Large project (ticker grid, watchlists, mobile, etc.). Only scoped; not started. Use as program backlog. |
| **#45** | REQ: Range Builder → AnyComp Integration | **Planned project:** #62 (event publisher) is done. Remaining: scenario snapshots in AnyComp, pay structure config sharing, 5 sub-index flow, approval workflows, responsibility boundary. Requires AnyComp + Metric Market coordination. |

---

## Key Files Touched

- **Server:** `server/index.ts` (CORS), `server/routes.ts` (visualization spec, range-builder events, bundle-from-metric-definition), `server/ingest.ts` (decision-wizard, product-kanban 6h + sprint health, people_analyst_forecasts bundle key, inferChartType export), `server/bundleDefinitions.ts` (people_analyst_forecasts bundle).
- **Client:** `client/src/App.tsx` (forecast-dashboard, ecosystem-health routes), `client/src/pages/RangeBuilderPage.tsx` (Conductor overlay, event publish), `client/src/pages/ForecastDashboardPage.tsx` (new), `client/src/pages/EcosystemHealthPage.tsx` (new), `client/src/components/app-sidebar.tsx` (Forecast Dashboard, Ecosystem Health links).
- **Docs:** `docs/REFRESH_POLICY_FOR_SPOKE_INTEGRATIONS.md`, `docs/CONDUCTOR_FIELD_MAPPING_TO_HUB.md`, `docs/BUNDLE_CREATION_API_SCHEMA.md`, `docs/COMPONENT_EXPORT_API.md`, `docs/KANBAI_METRIC_MARKET_STATUS.md` (this file), and multiple `docs/cards/*.md` acceptance criteria updated.

---

## What the Local Agent Should Do to Close Out

1. **Run the app and smoke-test**
   - `npm run dev`, then run the test prompt from `docs/REPORT_BACK_PROMPT.md` (or the verification steps in this doc) to confirm CORS, ingest endpoints, range-builder market data, range-builder events, decision-wizard ingest, bundle-from-metric-definition, visualization spec, forecast dashboard, ecosystem health dashboard.

2. **Optional: update Kanbai**
   - Mark completed cards as Done in the Kanbai board if your workflow tracks them there (card numbers and titles are in the Completed table above).

3. **Optional: one-time DB**
   - If this is a fresh deploy, run `npm run db:push` so schema (including any existing card/bundle tables) is in sync.

4. **No schema or dependency changes**
   - No new tables or package.json edits were made; no migration or install required beyond existing setup.

5. **Open items**
   - Do not start #105 until segment dimensions source is available. #5 and #45 are program-level; treat as backlog unless prioritized.

---

## Verification Checklist (for local agent)

- [ ] `GET /api/bundles` returns array with `people_analyst_forecasts`.
- [ ] `GET /api/specifications/visualization` returns chartTypes, bundleKeys, schemas.
- [ ] `POST /api/range-builder/events` with body `[{ "job_family_id": "R&D", "grade": "P6", "range_min": 100000, "range_max": 150000, "range_mid": 125000, "spread": 50, "effective_date": "2026-02-22", "change_reason": "user_adjustment" }]` returns 201; `GET /api/range-builder/events?limit=5` returns array.
- [ ] `POST /api/ingest/decision-wizard` with body `{ "payload": { "decisionId": "d1", "decisionTitle": "Test", "summary": "Ok" } }` returns 201.
- [ ] `POST /api/bundles/from-metric-definition` with body `{ "key": "test_metric", "name": "Test Metric", "unit": "rate" }` returns 201 with bundle key `metric_test_metric`.
- [ ] `GET /api/ingest/status` includes `decision-wizard` in endpoints.
- [ ] CORS: OPTIONS request from origin `https://something.replit.app` returns 204 with Access-Control-Allow-Origin.
- [ ] UI: `/forecast-dashboard` and `/ecosystem-health` load without error (may show empty state if no cards).

---

**Status doc version:** 1.0  
**Last updated:** 2026-02-22
