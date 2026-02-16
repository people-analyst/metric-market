# Cut-and-paste handoffs for each Replit app

**How to use this file**: Open this document and copy the **section for each app** (from the dashed line to the next dashed line). Paste that section into the **corresponding Replit project**—e.g. save as `HANDOFF_FROM_META_FACTORY.md` or paste into the project README. Each section contains that app’s instructions and reference locations in plain text (no links to open).

**Meta-factory repo (all URLs below)**: https://github.com/people-analyst/meta-factory  
**Branch**: main. Folder URLs use `/tree/main/...`; file URLs use `/blob/main/...`.

---

## Shared instructions (include with every app)

Copy this block when you paste into any Replit project:

1. **Review the intentions** in the handoff and in the linked meta-factory documentation. Understand the product and technical goals that were set in meta-factory for this capability.
2. **Review the documentation** at the GitHub paths listed in your handoff. Use it to expand your vision or to do what you do better—adopt requirements, specs, and constraints that still apply.
3. **Review the code** at the GitHub folder paths listed. Identify what is **useful** to you: types, utilities, algorithms, or integration patterns. Adopt or port what improves this Replit project; ignore what does not apply.
4. **Align to a single codebase** in this Replit project. Do not maintain a fork of meta-factory inside this app. Bring the useful pieces into this repo, refactor to your stack and standards, and own the code here. We are aiming for the **highest quality standard** in this environment.
5. **Prove it in Replit**. Once this project has absorbed the relevant functionality, documents, and metadata and is running at the desired quality, meta-factory will **dissolve** (remove) that code and those packages from its side for cleanup. Your environment becomes the source of truth for this application.
6. **Shared metadata**: Some reference data (e.g. job structures, canonical segmentation, level codes) may have a **shared need**—meta-factory classifies written materials to jobs; Replit apps use the same structures for HRIS and compensation. We may retain a **single source of truth** for that metadata, with **reconciliation** and **pass-through APIs** so both sides stay aligned. Your handoff will note if your app consumes or contributes to such shared metadata.

---

################################################################################
# SEGMENTATION STUDIO
################################################################################

**Paste the content below into the Segmentation Studio Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_SEGMENTATION_STUDIO.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_SEGMENTATION_STUDIO.md

**Instructions**: Review the intentions (HRIS → canonical fields → dimensions/nodes → Segmentation Pack + Employee Snapshot). Review the documentation and code at the URLs below. Adopt or port what is useful; align to one codebase in this project at the highest quality standard. Shared metadata (job structures, canonical segmentation) may have a source of truth, reconciliation, and pass-through APIs—consume or contribute as agreed. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/segmentation-api  
  https://github.com/people-analyst/meta-factory/tree/main/packages/segmentation-agent  
  https://github.com/people-analyst/meta-factory/tree/main/packages/client-onboarding  
  https://github.com/people-analyst/meta-factory/tree/main/packages/hr_metric_dictionary_chunker  
  https://github.com/people-analyst/meta-factory/tree/main/packages/core  
  https://github.com/people-analyst/meta-factory/tree/main/replit-segmentation-prototype  

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/SEGMENTATION_PROTOTYPE_DOCUMENTATION.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/segmentation-agent/API_DESIGN.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/segmentation-agent/SEGMENTATION_ARCHITECTURE.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/segmentation-agent/AGENT_SETUP.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/segmentation-api/README.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/client-onboarding/README.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/HRIS_FIELD_PRIORITIES.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_DATA_HRIS_SEGMENTATION_MAPPING_REQUIREMENTS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/CANONICAL_STRUCTURES_DECISIVE_FOCUS.md  

**Optional bundle** (from meta-factory repo root): npx ts-node scripts/create-replit-bundle.ts segmentation  → output: replit-bundles/segmentation/bundle/

---

################################################################################
# ANYCOMP
################################################################################

**Paste the content below into the AnyComp Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_ANYCOMP.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_ANYCOMP.md  

**Instructions**: Review the intentions (Decision OS for compensation: strategy → 100 Pennies → Action Library → Optimization → Pay Structures → Metrics). Review the documentation and code at the URLs below. Adopt or port what is useful; replace meta-factory workspace dependencies with API clients or local implementations. Align to one codebase at the highest quality standard. Shared metadata (job structures, canonical segmentation, compensation reference) may have a source of truth, reconciliation, and pass-through APIs—consume those APIs. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/anycomp  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-framework  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-compensation  
  https://github.com/people-analyst/meta-factory/tree/main/packages/compensation-modeling  

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/packages/anycomp/README.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/anycomp/KICKOFF_GUIDE.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/anycomp/QUICK_START.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/anycomp/INTEGRATION_ANALYSIS.md  
  https://github.com/people-analyst/meta-factory/blob/main/packages/anycomp/AGENT_RECONCILIATION.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VALUE_OF_INFORMATION_FRAMEWORK.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VOI_UI_DESIGN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VOI_TECHNICAL_PLAN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/ANYCOMP_REPLIT_HANDOFF.md  

**Optional bundle**: npx ts-node scripts/create-replit-bundle.ts peopleanalyst  → output: replit-bundles/peopleanalyst/bundle/

---

################################################################################
# PEOPLEANALYST
################################################################################

**Paste the content below into the PeopleAnalyst Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_PEOPLE_ANALYST.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_PEOPLE_ANALYST.md  

**Instructions**: Review the intentions (Monte Carlo, VOI/EVPI/EVSI, importance scoring, alignment, survey initiation). Review the documentation and code at the URLs below. Adopt or port what is useful. Align with AnyComp and VOI Calculator so logic is not duplicated—shared APIs or shared libraries as appropriate. Shared metadata (compensation model, job structures, canonical segmentation) may have a source of truth, reconciliation, and pass-through APIs. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-framework  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-compensation  
  https://github.com/people-analyst/meta-factory/tree/main/packages/compensation-modeling  
  https://github.com/people-analyst/meta-factory/tree/main/packages/anycomp  

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VALUE_OF_INFORMATION_FRAMEWORK.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VOI_UI_DESIGN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VOI_TECHNICAL_PLAN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VOI_SUMMARY.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/APPLICATION_REQUIREMENTS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/PRODUCT_REQUIREMENTS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/ENGINEERING_SPECIFICATION.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/CLIENT_ONBOARDING_AND_SEGMENTATION_COORDINATION.md  

**Optional bundle**: npx ts-node scripts/create-replit-bundle.ts peopleanalyst  → output: replit-bundles/peopleanalyst/bundle/

---

################################################################################
# VOI CALCULATOR
################################################################################

**Paste the content below into the VOI Calculator Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_VOI_CALCULATOR.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_VOI_CALCULATOR.md  

**Instructions**: Review the intentions (Value-of-information, EVPI, EVSI for compensation). Review the documentation and code at the URLs below. Align with AnyComp and PeopleAnalyst so VOI is not duplicated. Shared metadata (compensation model, reference data) may be provided via source of truth, reconciliation, and pass-through APIs. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-framework  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-compensation  

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VALUE_OF_INFORMATION_FRAMEWORK.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VOI_UI_DESIGN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VOI_TECHNICAL_PLAN.md  

---

################################################################################
# DECISION WIZARD
################################################################################

**Paste the content below into the Decision Wizard Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_DECISION_WIZARD.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_DECISION_WIZARD.md  

**Instructions**: Review the intentions (decision support for compensation and related decisions). Review the documentation and code at the URLs below. Align with AnyComp and PeopleAnalyst so decision logic and VOI are not duplicated. Shared metadata (job structures, compensation reference, canonical segmentation) may be provided via source of truth, reconciliation, and pass-through APIs. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/anycomp  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-framework  
  https://github.com/people-analyst/meta-factory/tree/main/packages/voi-compensation  
  https://github.com/people-analyst/meta-factory/tree/main/docs/compensation-modeling  

**GitHub — key file**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/VALUE_OF_INFORMATION_FRAMEWORK.md  

---

################################################################################
# CONDUCTOR
################################################################################

**Paste the content below into the Conductor Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_CONDUCTOR.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_CONDUCTOR.md  

**Instructions**: Review the intentions (BigQuery metadata, AI SQL/Python, One Model import, People Metrics Workbench). Review the documentation and code at the URLs below. Adopt or port what is useful (HR metrics definitions, types). Call job matching and pay factory via APIs when they exist. Shared metadata (HR metric definitions, job structures, canonical fields) may have a source of truth, reconciliation, and pass-through APIs. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/hr_metric_dictionary_chunker  
  https://github.com/people-analyst/meta-factory/tree/main/packages/client-onboarding  
  https://github.com/people-analyst/meta-factory/tree/main/packages/core  

**GitHub — key files and data**:  
  https://github.com/people-analyst/meta-factory/tree/main/hr_metrics  
  https://github.com/people-analyst/meta-factory/blob/main/docs/HRIS_FIELD_PRIORITIES.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/compensation-modeling/CLIENT_ONBOARDING_AND_SEGMENTATION_COORDINATION.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/api/job-matching-api.yaml  
  https://github.com/people-analyst/meta-factory/blob/main/docs/api/pay-factory-api.yaml  

---

################################################################################
# DATA ANONYMIZER (DATAVAULT)
################################################################################

**Paste the content below into the Data Anonymizer / DataVault Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_DATA_ANONYMIZER.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_DATA_ANONYMIZER.md  

**Instructions**: Review the intentions (PII detection, deterministic anonymization, CSV processing for HRIS, BigQuery, survey data). Review the documentation at the URLs below. Meta-factory may have limited anonymizer-specific code; use docs for field priorities and HRIS/market data shapes so anonymization preserves analytical utility. Shared metadata (canonical field names, segment structures) may have a source of truth, reconciliation, and pass-through APIs. Meta-factory will dissolve any relevant code once proven here.

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/HRIS_FIELD_PRIORITIES.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_DATA_HRIS_SEGMENTATION_MAPPING_REQUIREMENTS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-vision/data-anonymizer-documentation.md  

---

################################################################################
# KANBAN
################################################################################

**Paste the content below into the Kanban Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_KANBAN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_KANBAN.md  

**Instructions**: Review the intentions (task/orchestration in the Hub ecosystem). Review the documentation at the URLs below. Align with the rest of the People Analytics Toolbox. If tasks reference jobs, segments, or metrics, consume source of truth and pass-through APIs for those references. Meta-factory will dissolve any relevant code once proven here.

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-vision/hub-documentation.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-vision/people-analytics-architecture.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-vision/README.md  

---

################################################################################
# METRIC ENGINE / CALCULUS
################################################################################

**Paste the content below into the Metric Engine / Calculus Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_METRIC_ENGINE_CALCULUS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_METRIC_ENGINE_CALCULUS.md  

**Instructions**: Review the intentions (metrics engine, dev kit). Review the documentation and code at the URLs below. HR metrics definitions in meta-factory may inform metric semantics. Shared metadata (metric definitions, formulas, dimensions, tiers) may have a source of truth, reconciliation, and pass-through APIs so Conductor and other apps stay aligned. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/hr_metric_dictionary_chunker  
  https://github.com/people-analyst/meta-factory/tree/main/hr_metrics  
  https://github.com/people-analyst/meta-factory/tree/main/packages/core  

---

################################################################################
# REINCARNATION
################################################################################

**Paste the content below into the Reincarnation Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_REINCARNATION.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_REINCARNATION.md  

**Instructions**: Review the intentions (adaptive diagnostics, RID/SID, IRT, pool tiers, survey collection). Review the documentation and code at the URLs below. Use meta-factory docs for survey design, constructs, or instrument patterns if useful. Shared metadata (survey instruments, segment definitions, pool metadata) may have a source of truth, reconciliation, and pass-through APIs (e.g. Segmentation Packs from Segmentation Studio). Meta-factory will dissolve any relevant code once proven here.

**GitHub — folders and files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-vision/reincarnation-spec-2026-02-08.md  
  https://github.com/people-analyst/meta-factory/tree/main/packages/survey_factory_agent  
  https://github.com/people-analyst/meta-factory/tree/main/docs/research  
  https://github.com/people-analyst/meta-factory/blob/main/docs/SEGMENTATION_PROTOTYPE_DOCUMENTATION.md  

---

################################################################################
# SURVEY RESPONDENT
################################################################################

**Paste the content below into the Survey Respondent Replit project** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_SURVEY_RESPONDENT.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_SURVEY_RESPONDENT.md  

**Instructions**: Review the intentions (survey response/collection; consumption of Segmentation Packs and employee snapshots from Segmentation Studio). Review the documentation at the URLs below. Use Segmentation Pack and canonical field docs so this app aligns with the rest of the Toolbox. Shared metadata (Segmentation Packs, canonical field library, segment definitions) may have a source of truth, reconciliation, and pass-through APIs. Meta-factory will dissolve any relevant code once proven here.

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/SEGMENTATION_PROTOTYPE_DOCUMENTATION.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/HRIS_FIELD_PRIORITIES.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/CANONICAL_STRUCTURES_DECISIVE_FOCUS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-vision/README.md  

---

################################################################################
# MARKET DATA BACKEND (future project)
################################################################################

**Paste the content below into the Market Data Backend Replit project or backend repo** (e.g. as HANDOFF_FROM_META_FACTORY.md or into the project README).

**Reference — handoff file in meta-factory**:  
  docs/replit-handoffs/HANDOFF_MARKET_DATA_BACKEND.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/replit-handoffs/HANDOFF_MARKET_DATA_BACKEND.md  

**Instructions**: Review the intentions (market data normalization, pay ranges, job matching, compensation model, BLS—backend services for Replit apps). Review the documentation and code at the URLs below. Establish shared metadata (job structures, canonical segmentation, variableizer reference) with a single source of truth, reconciliation, and pass-through APIs so meta-factory (classification of written materials to jobs) and this backend stay aligned. Meta-factory will dissolve this code once proven here.

**GitHub — folders**:  
  https://github.com/people-analyst/meta-factory/tree/main/packages/pay_factory  
  https://github.com/people-analyst/meta-factory/tree/main/packages/compensation-modeling  
  https://github.com/people-analyst/meta-factory/tree/main/packages/job-matching-factory  
  https://github.com/people-analyst/meta-factory/tree/main/packages/job_family_agent  
  https://github.com/people-analyst/meta-factory/tree/main/packages/total-rewarder  
  https://github.com/people-analyst/meta-factory/tree/main/packages/core  
  https://github.com/people-analyst/meta-factory/tree/main/packages/variableizer  
  https://github.com/people-analyst/meta-factory/tree/main/packages/bls-labor-metrics  
  https://github.com/people-analyst/meta-factory/tree/main/packages/data-consolidator  

**GitHub — key files**:  
  https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_COMPENSATION_DATASETS_DECISIVE_FOCUS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/CANONICAL_STRUCTURES_DECISIVE_FOCUS.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_DATA_PROCESSING_WORKFLOW.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/MARKET_DATA_DOCUMENTATION_INDEX.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/VARIABLEIZER_SYSTEM_DESIGN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/BLS_LABOR_METRICS_SYSTEM_DESIGN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/TOTAL_REWARDER_SYSTEM_DESIGN.md  
  https://github.com/people-analyst/meta-factory/blob/main/docs/api/pay-factory-api.yaml  
  https://github.com/people-analyst/meta-factory/blob/main/docs/api/job-matching-api.yaml  

**Optional bundle**: npx ts-node scripts/create-replit-bundle.ts market-data-backend  → output: replit-bundles/market-data-backend/bundle/

---

**End of paste sections.** Use the "Shared instructions" block at the top together with each app section when pasting into that app.
