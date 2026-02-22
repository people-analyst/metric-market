# Metric Market — Kanbai Notes

## Board sync (2026-02-22)

**.kanbai/KANBAN.md** is auto-generated from Kanbai and currently shows many cards as Backlog/Planned. **Implementation is ahead of the board:** 24 cards are already done in this repo. See **Completed card refs** below and `docs/KANBAI_METRIC_MARKET_STATUS.md` for the canonical list. Recommend marking those card refs as **Done** in Kanbai so the board matches reality.

**Work assignment:** There are no Ready/In Progress cards that need implementation. All high/medium Backlog items in KANBAN.md that are implementable have been implemented. Remaining:
- **#105** — Blocked (do not start until Segmentation Studio segment dimensions are available).
- **#5** — Deferred (Yahoo Finance–style dashboard; 8-week project; keep in backlog unless prioritized).
- **#45** — Planned (Range Builder → AnyComp); #62 is done; remaining work is AnyComp-side + coordination.
- **#62** — Implemented (RangeBuilderChangeEvent publisher); should be marked Done when syncing board.

When Kanbai moves **#45** to Ready: implement AnyComp consumption of RangeBuilderChangeEvent, pay structure config sharing, and 5 sub-index flow per `docs/KANBAI_METRIC_MARKET_STATUS.md` and card description.

---

## Follow-up / Verification (2026-02-22)

**Verification checklist** (from `docs/KANBAI_METRIC_MARKET_STATUS.md`):

| Check | Result |
|-------|--------|
| GET /api/bundles (people_analyst_forecasts) | ✅ 200, bundle present |
| GET /api/specifications/visualization | ✅ 200, chartTypes/bundleKeys |
| POST /api/range-builder/events → 201, GET ?limit=5 → 200 | ✅ |
| POST /api/ingest/decision-wizard → 201 | ✅ |
| POST /api/bundles/from-metric-definition (metric_test_metric) | ✅ 200, key present (idempotent) |
| GET /api/ingest/status includes decision-wizard | ✅ |
| CORS OPTIONS (Origin .replit.app) → 204, Access-Control-Allow-Origin | ✅ |

**Directives:** `POST /api/hub/process-directives` was called; response was `{"error":"Not found"}` (likely Hub returned 404 or route not found). No pending directives processed. When Hub is up and env (HUB_URL, HUB_API_KEY) is set, re-run to clear any pending directives. See `docs/DIRECTIVES.md` and `agent-context.md` (Directives section).

**Optional:** Run `npm run db:push` once if this is a fresh deploy. UI checks for `/forecast-dashboard` and `/ecosystem-health` were not exercised (manual browser check if needed).

---

## Completed card refs (for Kanbai pull)

Use these to update board status. Each is implemented and verified in this repo.

| card_ref | Title | Where |
|----------|--------|--------|
| #50 | Metric Market Dashboard Push (Dev Ops) | server/ingest.ts (product-kanban 6h, 4 cards) |
| #62 | RangeBuilderChangeEvent Publisher | server/routes.ts (POST/GET /api/range-builder/events), RangeBuilderPage.tsx |
| #72 | Forecast Card Bundle Registration | server/bundleDefinitions.ts (people_analyst_forecasts) |
| #83 | Build Market Data Ingestion from Conductor | server/ingest.ts POST /api/ingest/conductor |
| #85 | Wire Range Builder to Live Conductor Data | server/routes.ts GET /api/range-builder/market-data, RangeBuilderPage.tsx |
| #86 | Create Initial Compensation Card Instances from Conductor | server/ingest.ts (range_strip, range_strip_aligned, range_target_bullet) |
| #88 | Map Conductor Canonical Fields to Metric Market Schema | docs/CONDUCTOR_FIELD_MAPPING_TO_HUB.md |
| #89 | Build Metric Push Ingestion from Metric Engine | server/ingest.ts POST /api/ingest/metric-engine |
| #90 | Auto-Create Cards from Incoming Metrics | server/ingest.ts inferChartType + findOrCreateCard |
| #91 | Bidirectional Metric Definition Sync | server/routes.ts GET /api/metric-definitions |
| #92 | Push Visualization Specs to Metric Engine | server/routes.ts GET /api/specifications/visualization |
| #101 | Build PeopleAnalyst Ingestion Endpoint | server/ingest.ts POST /api/ingest/people-analyst |
| #102 | Create Forecast Dashboard Layout | client ForecastDashboardPage.tsx, /forecast-dashboard |
| #103 | Wire VOI Analysis to Bubble Scatter | server/ingest.ts voiAnalysis → bubble_scatter |
| #106 | Build Ecosystem Health Dashboard | client EcosystemHealthPage.tsx, /ecosystem-health |
| #107 | Create ROI Analysis Cards | server/ingest.ts bullet_bar, confidence_band (VOI Calculator) |
| #123 | Expose Card Bundle Discovery API | server/routes.ts GET /api/bundles |
| #124 | Expose Card Data Push Endpoint | server/routes.ts POST /api/cards/:id/data |
| #125 | Document Refresh Policy | docs/REFRESH_POLICY_FOR_SPOKE_INTEGRATIONS.md, docs/cards/... |
| #137 | Expose Card Bundle Creation API from Metric Definitions | server/routes.ts POST /api/bundles/from-metric-definition |
| #138 | Enable CORS for Conductor | server/index.ts CORS .replit.app / .replit.dev |
| #139 | Expose Component Export API | server/routes.ts GET /api/components, /api/export/:key, docs/COMPONENT_EXPORT_API.md |
| #181 | Accept Decision Tracking Cards via API | server/ingest.ts POST /api/ingest/decision-wizard |
| #206 | Expose Card Bundle Creation API Schema | docs/BUNDLE_CREATION_API_SCHEMA.md |

---

## Integration Status

- Pull API (`GET /api/pull/board/:slug`) implemented and auth-protected
- Receive-cards webhook (`POST /api/receive-cards`) implemented with upsert logic
- Local kanban DB stores cards with `sourceCardId` linking back to central Kanbai IDs
- DEPLOY_SECRET_KEY shared with Kanbai for mutual auth

## Card Inventory

- 24 Kanbai cards completed (see Completed card refs above); KANBAN.md not yet synced to Done
- 3 open items: #105 (blocked), #5 (deferred), #45 (planned)

## Open / blocked refs (for Kanbai pull)

| card_ref | Status | Note |
|----------|--------|------|
| #105 | blocked | Do not start until Segmentation Studio exposes population dimensions (department, location, tenure). |
| #5 | deferred | Yahoo Finance–style dashboard; 8-week scope; keep in backlog unless prioritized. |
| #45 | planned | Range Builder → AnyComp. #62 done. Remaining: AnyComp scenario snapshots, pay structure config, 5 sub-index flow, approval workflows. |

## Epic Management (Remote Kanbai API)

The Metric Market agent can create and manage epics on the central Kanbai instance:

| Function | Description |
|----------|-------------|
| `listKanbaiEpics()` | List all epics on Kanbai |
| `createKanbaiEpic({name, description?, status?})` | Create a new epic (default status: `not_started`) |
| `updateKanbaiEpic(epicId, {name?, description?, status?})` | Update epic fields |
| `deleteKanbaiEpic(epicId)` | Delete an epic (cards lose their `epicId`) |
| `assignCardToEpic(cardId, epicId)` | Assign a card to an epic (pass `null` to remove) |
| `findOrCreateEpic(name, description?)` | Find by name or create if not found |

**Remote API base:** `KANBAI_URL` env var or `https://people-analytics-kanban.replit.app`

### Typical Agent Flow

1. Read `.kanbai/KANBAN.md` to get card IDs
2. `listKanbaiEpics()` to see existing epics
3. `findOrCreateEpic("Theme Name", "description")` to get/create an epic
4. `assignCardToEpic(cardId, epic.id)` for each related card

## Agent Capabilities

- Kanbai agent runner (`server/kanbai-agent-runner.js`) can poll and execute tasks autonomously
- Claude-powered agent loop: poll → claim → implement → verify → complete
- Budget: 25 iterations per task (may need increase for complex multi-component work)

## Key Decisions

- Cards use local auto-increment IDs; `sourceCardId` tracks the original Kanbai card ID
- Board pull groups cards into 5 columns; unknown statuses fall into `backlog`
- Receive-cards webhook does upsert: matches by `sourceCardId` or `title` to avoid duplicates
