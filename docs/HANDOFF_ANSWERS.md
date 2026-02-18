# Metric Market — Handoff Answers

## Cross-Cutting Questions (from Meta-Factory)

### 1. Blockers
No blockers on Metric Market's side. All 4 spoke ingestion endpoints are built and tested:
- `POST /api/ingest/conductor` — Market compensation data pipeline (auto-creates range_strip, range_strip_aligned, range_target_bullet cards)
- `POST /api/ingest/metric-engine` — Computed HR metrics (auto-discovers bundles, creates metric definitions and cards)
- `POST /api/ingest/anycomp` — Compensation optimization results (creates scenario comparison, recommendation, and score cards)
- `POST /api/ingest/people-analyst` — Monte Carlo forecasts and VOI analyses (creates confidence_band and bubble_scatter cards)

### 2. Dependencies
- **Conductor**: Need Conductor to start pushing market compensation data (P10-P90 percentiles, employee counts, BLS wages). Endpoint ready at `/api/ingest/conductor`.
- **Metric Engine Calculus**: Need computed metric pushes (attrition, compa-ratio, etc.). Endpoint ready at `/api/ingest/metric-engine`.
- **AnyComp**: Need AnyComp to build `POST /api/range-events` receiver for our RangeBuilderChangeEvent. Also need them to push optimization results back. Our receiver endpoint ready at `/api/ingest/anycomp`.
- **PeopleAnalyst**: Need forecast data pushes (Monte Carlo, VOI). Endpoint ready at `/api/ingest/people-analyst`.

### 3. Timeline
- **Now (ready today)**: All ingestion endpoints live. 13 metric definitions seeded. 9 card instances created with sample data proving full lifecycle. 25 card bundles covering 23 chart types + 1 control.
- **When other apps push data**: Cards auto-create, data auto-ingests, dashboards auto-populate. No further Metric Market development needed for basic integration.
- **Phase 3-4 (Month 2-4)**: RangeBuilderChangeEvent emission to AnyComp, forecast dashboard layouts, and dimension filtering from Segmentation Studio.

### 4. Shared Metadata
- Metric Market consumes canonical field mappings from the Hub. Field mappings registered for: compensation.base_salary, compensation.total_compensation, compensation.pay_grade, compensation.compa_ratio, organization.department, organization.job_title, employment.hire_date.
- Metric definitions are available via `GET /api/metric-definitions` for bidirectional sync with Metric Engine.
- Component schemas available via `GET /api/components` for any app to discover visualization capabilities.

### 5. Meta-Factory Code Adoption
- No meta-factory code packages need to be ported to Metric Market. Our visualization/card system is fully implemented in Replit.
- We consume outputs from other apps (Conductor, Metric Engine, AnyComp, PeopleAnalyst) via our ingestion endpoints — we don't need their internal logic.

## Status Summary
| Capability | Status |
|---|---|
| Card bundle API (25 bundles) | Live |
| 23 chart types + 1 control | Live |
| Range Builder with KPI indices | Live |
| Component export system | Live |
| Spoke ingestion endpoints (4) | Live |
| Metric definitions (13) | Live |
| Card instances with data (9) | Live |
| Hub documentation (98/100) | Live |
| Hub webhook receiver | Live |
| Canonical field mappings | Registered |

Last updated: 2026-02-15
