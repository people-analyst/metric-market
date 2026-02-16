# Market Compensation Data Pipeline — Context by Replit App

**Purpose**: Copy the section for each app below and paste it into that Replit project. This supplements the general handoff with BigQuery pipeline context: where the data lives, what you consume, and what you own.

**Source**: Meta-factory. A Claude agent built the BigQuery pipeline; data and views are in `pa-market-data-2026`. Full pipeline documentation: `scripts/bigquery/PIPELINE-DOCUMENTATION.md` in the meta-factory repo.

**Meta-factory repo**: https://github.com/people-analyst/meta-factory  
**Pipeline doc (GitHub)**: https://github.com/people-analyst/meta-factory/blob/main/scripts/bigquery/PIPELINE-DOCUMENTATION.md

---

################################################################################
# ANYCOMP — Copy this section and paste into the AnyComp Replit project
################################################################################

## Market Compensation Data Pipeline — Context for AnyComp

**Your role**: Pay range modeling from regression results, job pricing engine, client-facing compensation outputs.

### BigQuery project and datasets

- **Project**: `pa-market-data-2026`
- **Analysis dataset**: `analysis`
- **Key views for you**:
  - `analysis.regression_ready` — 1.49M rows with all required dimensions (level, function, geography); median base $125K; use for pay range modeling and regression
  - `analysis.pay_by_function_level` — Cross-tabulation of pay by function × level × region
  - `analysis.all_sources_canonized` — Full 5M rows (Radford + CompAnalyst + Mercer); use if you need unfiltered data

### Canonical structure you must align to

- **Levels** (23 codes): S1–S5 (Support), P1–P6 (Professional), M1–M6 (Manager), E1–E6 (Executive)
- **Super functions** (18): Software & Technology, IT, Engineering, Data Science, Sales, Marketing, Product, Finance, HR, Legal, Operations, QA, R&D, Customer Success, Professional Services, Healthcare, Executive & Leadership, Other
- **Geography**: Country → State → Region (Northeast, South, Midwest, West)

### What you need to do

1. **Connect to BigQuery** project `pa-market-data-2026` (or consume via an API if one is provided).
2. **Use `analysis.regression_ready`** as the primary input for pay range modeling and job pricing.
3. **Port or replace** logic from `packages/compensation-modeling` — market data modeling, pay range generation, variable classification. Meta-factory will remove that package once you have proven it here.
4. **Consume shared metadata** — job structures, canonical segmentation, variableizer reference — from the agreed source of truth (API or published JSON). Do not duplicate canonical reference data.

### Meta-factory packages to adopt or replace

| Package | Purpose |
|---------|---------|
| compensation-modeling | Market data modeling, pay range generation, variable classification |
| voi-framework, voi-compensation | Value-of-information; align with PeopleAnalyst and VOI Calculator |

### Status of the data

- **Working**: 5M rows loaded; Radford + Mercer fully mapped to canonical; regression-ready subset validated (S1 $42K → E6 $651K).
- **In progress**: CompAnalyst has no native level/function; ~3,400 job codes need job title matching. Mercer has 133 functions (61K rows) mapped to "Other" — may need review.

---

################################################################################
# CONDUCTOR — Copy this section and paste into the Conductor Replit project
################################################################################

## Market Compensation Data Pipeline — Context for Conductor

**Your role**: BigQuery query interface, dashboards for reviewing mapping tables, validation and approval workflows. You are the data intelligence layer for executives and analysts.

### BigQuery project and datasets

- **Project**: `pa-market-data-2026`
- **Datasets**: `pipeline`, `mapping`, `analysis`

### Tables and views you should expose

| Dataset | Objects | Purpose |
|---------|---------|---------|
| **pipeline** | `raw_pay_reloaded`, `raw_pay_companalyst`, `raw_pay_mercer` | Raw market pay data (Radford, CompAnalyst, Mercer) |
| **pipeline** | `radford_canonized`, `companalyst_canonized`, `mercer_canonized` | Per-source canonized views |
| **mapping** | `radford_jobs`, `companalyst_jobs`, `mercer_jobs` | Discovery: all job codes with counts and pay stats |
| **mapping** | `radford_segments`, `companalyst_segments`, `mercer_segments` | Discovery: distinct dimension values |
| **mapping** | `radford_level_to_canonical`, `radford_function_to_canonical`, `radford_geo_to_canonical`, etc. | Canonical mapping views (will become explicit tables) |
| **analysis** | `all_sources_canonized`, `regression_ready`, `pay_by_function_level` | Unified and analysis-ready views |

### What you need to do

1. **Connect to BigQuery** project `pa-market-data-2026`.
2. **Provide a query interface** — AI SQL/Python or manual — so users can explore `pipeline`, `mapping`, and `analysis` datasets.
3. **Build dashboards** for reviewing canonical mappings (level, function, geography). These views will later become explicit, editable mapping tables; you may need approval workflows.
4. **Integrate** with your existing BigQuery metadata and One Model import flows. HR metrics and job structures should align with canonical segmentation.

### Related meta-factory assets

- HR metric definitions: `packages/hr_metric_dictionary_chunker`, `hr_metrics/`
- Job matching API spec: `docs/api/job-matching-api.yaml`
- Pay factory API spec: `docs/api/pay-factory-api.yaml`

### Status of the pipeline

- **Working**: 5M rows in BigQuery; discovery and canonical mapping views; regression-ready subset.
- **What needs work**: Replace CASE-based mapping views with explicit tables; CompAnalyst job matching; Mercer function cleanup. Conductor can support the review/approval process for those mappings.

---

################################################################################
# MARKET DATA BACKEND — Copy this section when you stand up this project
################################################################################

## Market Compensation Data Pipeline — Context for Market Data Backend

**Your role**: Loader scripts, SQL view definitions, canonical mapping table definitions, job-matching and variableizer logic. You own the pipeline that feeds BigQuery.

### What exists in meta-factory (to migrate here)

| Asset | Location in meta-factory | Purpose |
|-------|--------------------------|---------|
| Core loader | `scripts/bigquery/reload-raw-pay-data.py` | Parses Radford/CompAnalyst/Mercer CSVs, loads to BigQuery |
| Loaders | `scripts/bigquery/load-market-data.ts`, `load-canonical-tables.ts`, `reload-missing.ts` | TypeScript loaders and utilities |
| SQL views | `scripts/bigquery/sql/` — 22 files (stage1–stage6) | Discovery, cleanup, mapping, canonized, unified, regression-ready |
| Canonical data | `data/compensation/market/canonical-segmentation-mappings.json` | 896 mappings (mostly levels) |
| Job structure | `data/compensation/market/job-structure-alignment.json` | 2,568 Radford job hierarchy entries |
| Variableizer | `data/compensation/market/variableizer-master.csv` | Radford variable decoder |
| Packages | compensation-modeling, variableizer, job-matching-factory, shared/canonical-segmentation | Logic to port or expose via API |

### BigQuery project

- **Project**: `pa-market-data-2026`
- **Raw tables**: `pipeline.raw_pay_reloaded`, `raw_pay_companalyst`, `raw_pay_mercer`

### What you need to do

1. **Migrate** `scripts/bigquery/` (Python + TypeScript, SQL) to this repo or a dedicated GitHub repo.
2. **Build explicit canonical mapping tables** in BigQuery (replace CASE views). ~1,176 distinct values to map.
3. **CompAnalyst job matching**: Map ~3,400 job codes to canonical level/function via job title matching.
4. **Mercer function cleanup**: Review 133 functions (61K rows) currently mapped to "Other".
5. **Industry/Company Size**: Canonicalize industry and company size taxonomies (currently passed through as-is).
6. **Publish shared metadata**: Job structures, canonical-segmentation reference, variableizer reference — so meta-factory (classification) and Replit apps can consume from one source.

### Conductor and AnyComp depend on you

- Conductor: Query interface and mapping review dashboards.
- AnyComp: Regression results and pay ranges.

---

################################################################################
# PEOPLEANALYST — Copy this section and paste into the PeopleAnalyst Replit project
################################################################################

## Market Compensation Data Pipeline — Context for PeopleAnalyst

**Your role**: Monte Carlo, VOI/EVPI/EVSI, importance scoring, alignment, survey initiation. You consume compensation model outputs and may query market data for forecasting.

### BigQuery project and datasets

- **Project**: `pa-market-data-2026`
- **Relevant views**: `analysis.regression_ready`, `analysis.pay_by_function_level`

If you need market pay distributions for VOI or Monte Carlo, consume from `analysis.regression_ready` (1.49M rows, canonical structure) or coordinate with AnyComp for aggregated ranges.

**Align with AnyComp and VOI Calculator** so VOI logic is not duplicated. Shared metadata (compensation model, job structures) may be provided via source of truth and pass-through APIs.

---

################################################################################
# VOI CALCULATOR — Copy this section and paste into the VOI Calculator Replit project
################################################################################

## Market Compensation Data Pipeline — Context for VOI Calculator

**Your role**: Value-of-information, EVPI, EVSI for compensation decisions.

Market pay data is in BigQuery (`pa-market-data-2026`, `analysis.regression_ready`). You may consume regression results or aggregated pay ranges via AnyComp or a shared API. Align with AnyComp and PeopleAnalyst so VOI is not duplicated.

---

################################################################################
# DECISION WIZARD — Copy this section and paste into the Decision Wizard Replit project
################################################################################

## Market Compensation Data Pipeline — Context for Decision Wizard

**Your role**: Structured decision support (e.g. Kepner-Tregoe) for compensation and related decisions.

Market pay data is in BigQuery; pay ranges and job pricing flow from AnyComp. Consume segment definitions and compensation reference via shared metadata APIs. Align with AnyComp and PeopleAnalyst so decision logic is not duplicated.

---

################################################################################
# SEGMENTATION STUDIO — Copy this section and paste into the Segmentation Studio project
################################################################################

## Market Compensation Data Pipeline — Context for Segmentation Studio

**Your role**: HRIS → canonical fields → dimensions/nodes → Segmentation Pack + Employee Snapshot.

The market data pipeline uses **canonical segmentation** (levels, super functions, geography). Your canonical field library and Segmentation Packs should align with:
- Levels: S1–S5, P1–P6, M1–M6, E1–E6
- Super functions: 18 (see PIPELINE-DOCUMENTATION.md)
- Geography: Country → State → Region

Shared metadata (canonical segmentation reference) may have one source of truth. Consume or contribute as agreed so Conductor, AnyComp, and market data stay aligned.

---

**End of per-app sections.** Use together with the general handoffs in HANDOFF_*.md and PASTE_INTO_EACH_APP.md.
