# Questions for Replit Agents — Relay and Bring Back Answers

**Purpose**: Copy the questions below and relay them to the corresponding Replit agent. Bring their answers back so we can update status, resolve gaps, and drive closure on the compensation migration.

---

## For AnyComp

1. **BigQuery access**: Do you have (or can you obtain) access to the BigQuery project `pa-market-data-2026`? Do you need a service account, credentials, or an API layer instead of direct BQ access?

2. **Consumption model**: Will you query `analysis.regression_ready` and `analysis.pay_by_function_level` directly from BigQuery, or do you expect a separate API (e.g. from Market Data Backend) to serve pay ranges and job pricing?

3. **compensation-modeling package**: Have you reviewed `packages/compensation-modeling` in meta-factory? What have you adopted or ported? What (if anything) do you still need from that package?

4. **VOI integration**: How does your Value-of-Information flow (EVPI, EVSI) integrate with market pay data? Does it run against regression results, or against user-entered pay ranges?

5. **Readiness**: When do you expect to be able to say “we have what we need and we’re running” for pay range modeling and job pricing? What blockers exist?

---

## For Conductor

1. **BigQuery access**: Do you have (or can you obtain) access to the BigQuery project `pa-market-data-2026`? Is your current BQ integration set up for this project?

2. **Query interface**: Do you already expose `pipeline`, `mapping`, and `analysis` datasets, or is that on your roadmap? What is the timeline?

3. **Mapping table dashboards**: The pipeline uses CASE-based mapping views today; these will become explicit, editable tables. Are you planning (or able) to build dashboards for reviewing and approving those mappings? Who would own the approval workflow?

4. **HR metrics + job structures**: How do your HR metrics and job structure definitions align with the canonical structure in the pipeline (23 levels, 18 super functions, geography hierarchy)? Any conflicts or gaps?

5. **Readiness**: When do you expect to be able to say “we have what we need and we’re running” for the BQ query interface and mapping review? What blockers exist?

---

## For Market Data Backend (when this project exists)

1. **Existence**: Is there an active Replit project or GitHub repo for the Market Data Backend? If not, when do you expect to stand it up?

2. **Loader ownership**: Are you ready to take ownership of `scripts/bigquery/` (Python loader, TypeScript loaders, SQL view definitions)? Where would that code live — this project, or a separate repo?

3. **Mapping tables**: The pipeline doc says to replace CASE views with explicit mapping tables (~1,176 values). Who will build those? Do you need Conductor’s approval workflow first, or can you proceed in parallel?

4. **CompAnalyst job matching**: ~3,400 CompAnalyst job codes need level/function mapping via job title. Does `packages/job-matching-factory` cover this, or is new logic needed?

5. **Shared metadata API**: When will job structures, canonical-segmentation, and variableizer reference be published as a shared API or JSON? Who consumes them today (meta-factory, AnyComp, Conductor, Segmentation Studio)?

---

## For PeopleAnalyst

1. **Market data consumption**: Do you consume market pay data for Monte Carlo or VOI? If yes, from where (BigQuery, AnyComp, other)?

2. **Alignment with AnyComp / VOI Calculator**: Have you coordinated so VOI logic is not duplicated? Is there a shared library or API?

---

## For VOI Calculator

1. **Market data consumption**: Do you consume regression results or pay ranges for EVPI/EVSI? From BigQuery, AnyComp, or another source?

2. **Alignment**: Have you coordinated with AnyComp and PeopleAnalyst on VOI so there is a single implementation?

---

## For Segmentation Studio

1. **Canonical alignment**: Does your canonical field library and Segmentation Pack align with the pipeline’s structure (S1–E6 levels, 18 super functions, geography)? Any conflicts?

2. **Shared metadata**: Are you consuming or contributing to a shared canonical-segmentation reference? Where does it live?

---

## Cross-cutting (for any agent)

1. **Blockers**: What is blocking you from absorbing your part of the compensation/market-data work from meta-factory?

2. **Dependencies**: What do you need from another Replit app or from meta-factory before you can proceed?

3. **Timeline**: What is your best estimate for “we have what we need and we’re running”?

---

**How to use**: Copy the section for each app, paste into that Replit project (or chat), and capture the answers. Bring them back to update `COMPENSATION_MIGRATION_STATUS_AND_OWNERSHIP.md` and unblock next steps.
