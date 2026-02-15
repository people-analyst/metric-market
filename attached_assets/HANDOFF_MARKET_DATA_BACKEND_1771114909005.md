# Handoff for Market Data Backend — paste into this Replit project (or future backend repo)

**Source repo**: https://github.com/people-analyst/meta-factory  
**Target**: New or existing Replit project (or separate backend repo) for pay factory, variableizer, job-matching, compensation-modeling, total-rewarder, BLS.

---

## Your instructions

1. **Review the intentions**: Market data normalization, pay ranges, job matching, compensation model, BLS integration—backend services that Replit apps call via API. Align to a single codebase in this project at the highest quality standard; meta-factory will dissolve this code once proven here.

2. **Review the documentation** and **code** at the GitHub paths below. This is the largest cluster; use the decisive-focus docs (market compensation datasets, canonical structures) to understand pipelines and canons.

3. **Shared metadata**: Job structures, canonical segmentation mappings, and variableizer reference are **source of truth** for both this backend and (for classification) meta-factory. Establish **reconciliation** and **pass-through APIs** so job/segment reference data has one home and both sides consume it.

---

## GitHub — folders (browse or clone)

| Purpose | URL |
|--------|-----|
| Pay factory | https://github.com/people-analyst/meta-factory/tree/main/packages/pay_factory |
| Compensation modeling | https://github.com/people-analyst/meta-factory/tree/main/packages/compensation-modeling |
| Job matching factory | https://github.com/people-analyst/meta-factory/tree/main/packages/job-matching-factory |
| Job family agent | https://github.com/people-analyst/meta-factory/tree/main/packages/job_family_agent |
| Total-rewarder | https://github.com/people-analyst/meta-factory/tree/main/packages/total-rewarder |
| Core | https://github.com/people-analyst/meta-factory/tree/main/packages/core |
| Variableizer (dir) | https://github.com/people-analyst/meta-factory/tree/main/packages/variableizer |
| BLS labor metrics | https://github.com/people-analyst/meta-factory/tree/main/packages/bls-labor-metrics |
| Data consolidator (design) | https://github.com/people-analyst/meta-factory/tree/main/packages/data-consolidator |

---

## GitHub — key docs

| Doc | URL |
|-----|-----|
| Market compensation datasets (decisive focus) | https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_COMPENSATION_DATASETS_DECISIVE_FOCUS.md |
| Canonical structures (decisive focus) | https://github.com/people-analyst/meta-factory/blob/main/docs/CANONICAL_STRUCTURES_DECISIVE_FOCUS.md |
| Market data processing workflow | https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_DATA_PROCESSING_WORKFLOW.md |
| Market data documentation index | https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_DATA_DOCUMENTATION_INDEX.md |
| Variableizer system design | https://github.com/people-analyst/meta-factory/blob/main/docs/VARIABLEIZER_SYSTEM_DESIGN.md |
| BLS labor metrics system design | https://github.com/people-analyst/meta-factory/blob/main/docs/BLS_LABOR_METRICS_SYSTEM_DESIGN.md |
| Total rewarder system design | https://github.com/people-analyst/meta-factory/blob/main/docs/TOTAL_REWARDER_SYSTEM_DESIGN.md |
| Pay factory API spec | https://github.com/people-analyst/meta-factory/blob/main/docs/api/pay-factory-api.yaml |
| Job matching API spec | https://github.com/people-analyst/meta-factory/blob/main/docs/api/job-matching-api.yaml |

---

## Optional — generate a bundle

From meta-factory repo root:  
`npx ts-node scripts/create-replit-bundle.ts market-data-backend`  
Output: `replit-bundles/market-data-backend/bundle/`.

---

**Migration agent note**: When the market data backend has absorbed the above and is proven, meta-factory can remove pay_factory, compensation-modeling, job-matching-factory, job_family_agent, total-rewarder, variableizer, bls-labor-metrics, data-consolidator per [SPLINTER_EXIT_PLAN.md](../SPLINTER_EXIT_PLAN.md). Keep or publish shared JSON (job structures, canonical-segmentation-mappings, variableizer reference) for MF’s classification of written materials to jobs.
