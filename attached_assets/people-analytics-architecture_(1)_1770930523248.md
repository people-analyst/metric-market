# People Analytics Platform - Unified Architecture Document

**Version:** 2026-02-11  
**Platform Status:** Production (6 core apps online, 5 auxiliary apps in development)

---

## 1. Platform Overview

### What is the People Analytics Platform?

The People Analytics Platform is an integrated ecosystem of specialized applications designed to transform workforce data into executive-ready insights and strategic decisions. The platform bridges the gap between raw HRIS data and actionable intelligence by providing a complete analytical pipeline: from data ingestion and normalization through predictive modeling, decision analysis, and survey-based measurement.

### Core Purpose

The platform exists to solve the "last mile" problem in people analytics:

- **For Executives:** Transform uncertainty into confidence through probabilistic forecasting, scenario analysis, and decision support with quantified ROI
- **For Analysts:** Streamline data preparation, field mapping, metric calculation, and survey instrument design with AI-assisted workflows
- **For Organizations:** Enable data-driven talent decisions while maintaining privacy, compliance, and analytical rigor

### Value Proposition

**"From messy HRIS exports to executive-ready predictions in hours, not months"**

- **Speed:** Automated field mapping, segmentation, and metric calculation replace weeks of manual data wrangling
- **Intelligence:** AI-powered assistants suggest variables, estimate priors, generate SQL, and execute directives autonomously
- **Trust:** Field Exchange canonical mapping, data anonymization, audit trails, and psychometric validation ensure analytical integrity
- **Scale:** Hub-and-spoke architecture allows specialized tools to operate independently while sharing data contracts

---

## 2. Ecosystem Architecture

### Hub-and-Spoke Topology

The platform uses a **centralized hub with distributed spokes** pattern. The Platform Hub orchestrates all applications through:

1. **Application Registry:** Central catalog of all ecosystem apps with health monitoring
2. **Directive System:** Automated task distribution with AI-powered execution
3. **Documentation Scoring:** Quality assessment across 9 standardized sections (0-100 points each)
4. **Shared Architecture:** Canonical data contracts, field definitions, and integration patterns
5. **Kanban Coordination:** Development tracking via Product Kanban with card deployment

```
                          ┌─────────────────┐
                          │  Platform Hub   │
                          │  (Orchestrator) │
                          └────────┬────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
   ┌────▼────┐              ┌──────▼──────┐           ┌──────▼──────┐
   │ Segment │              │   People    │           │Reincarnation│
   │ Studio  │◄────────────►│  Analyst    │◄─────────►│  (Surveys)  │
   └────┬────┘              └──────┬──────┘           └──────┬──────┘
        │                          │                          │
        │                    ┌─────▼─────┐                   │
        │                    │ Preference │                   │
        │                    │  Modeler   │◄──────────────────┘
        │                    └─────┬─────┘
        │                          │
   ┌────▼────┐              ┌──────▼──────┐
   │Conductor│              │   AnyComp   │
   │  (BI)   │              │ (Comp Dsgn) │
   └─────────┘              └─────────────┘
```

### Application Categories

| Category | Applications | Role |
|----------|-------------|------|
| **Data Foundation** | Segmentation Studio, Conductor, Data Anonymizer | HRIS ingestion, field mapping, metadata management, PII protection |
| **Analytics Core** | PeopleAnalyst, MetricEngine, VOI Calculator, Decision Wizard | Forecasting, metric calculation, decision analysis, value quantification |
| **Survey Systems** | Reincarnation, Preference Modeler | Adaptive diagnostics, survey delivery, response collection |
| **Compensation** | AnyComp | Strategy design, action library, VOI for comp decisions |
| **Orchestration** | Platform Hub, Product Kanban | Registry, directives, documentation scoring, development tracking |

### Communication Protocols

All spoke applications implement **three standardized hub endpoints**:

1. **`GET /health`** → Returns `{status: "ok", app: "slug", timestamp: "ISO-8601"}`
2. **`POST /api/hub-webhook`** → Receives directive notifications, returns `{received: true}`
3. **`GET /api/specifications`** → Serves `replit.md` markdown for documentation scoring

**Authentication:**
- Hub-to-Spoke: `X-API-Key` header (value from `HUB_API_KEY` secret)
- Card Deployment: `Authorization: Bearer <DEPLOY_SECRET_KEY>` for Kanban card push
- Webhook Signatures: HMAC-SHA256 via `X-Signature-256` header (Segmentation Studio)

**Directive Lifecycle:**
```
pending → acknowledged → in_progress → completed | rejected
```

---

## 3. Application Registry

### Core Ecosystem Applications

| Application | Slug | URL | Status | Doc Score | Role |
|-------------|------|-----|--------|-----------|------|
| **Platform Hub** | `hub` | https://people-analytics-toolbox.replit.app | Online | — | Central orchestrator, registry, directives, doc scoring |
| **Conductor** | `conductor` | https://data-model-explorer.replit.app | Online | 89% | Data intelligence platform, BigQuery metadata, semantic profiles, Tier 1 metrics |
| **Segmentation Studio** | `segmentation-studio` | https://segmentation-builder.replit.app | Online | 93% | HRIS normalization, canonical field mapping, segmentation pack publishing |
| **Reincarnation** | `reincarnation` | https://reincarnation-engine.replit.app | Online | 91% | Adaptive diagnostic surveys, RID/SID architecture, pool-based optimization |
| **Preference Modeler** | `preference-modeler` | https://preference-modeler.replit.app | Online | 100% | Survey delivery, 15 question types, MaxDiff, conjoint, dual-slider |
| **PeopleAnalyst** | `people-analyst` | https://performix.replit.app | Online | 87% | Executive forecasting, Monte Carlo simulation, VOI analysis, MaxDiff |
| **Data Anonymizer** | `data-anonymizer` | https://data-vault-anonymizer.replit.app | Online | 96% | PII detection, anonymization, Field Exchange SDK (66 fields, 385+ aliases) |
| **AnyComp** | `anycomp` | https://anycomp.replit.app | Offline | 96% | Compensation strategy, 100 Pennies, action library, AI narratives, VOI |
| **MetricEngine** | `metric-engine` | https://metric-engine-calculus.replit.app | Offline | 98% | 210 HR metrics, Bayesian aggregation, statistical enrichment, prioritization |
| **VOI Calculator** | `voi-calculator` | https://voi-calculator.replit.app | Offline | 100% | Value of Information analysis, 6 distributions, EVPI/EVSI, sensitivity |
| **Decision Wizard** | `decision-wizard` | https://decision-wizard.replit.app | Offline | 100% | Kepner-Tregoe decision analysis, must/want criteria, VOI integration |
| **Product Kanban** | `kanban` | https://people-analytics-kanban.replit.app | Online | 98% | Development tracker, AI assistant, export packages, Hub sync |

### Auxiliary & Planned Applications

| Application | Slug | Status | Purpose |
|-------------|------|--------|---------|
| **MetricMarket** | `metric-market` | Planned | Market benchmarking data |
| **InsightPlayer** | `insight-player` | Planned | Insight delivery and consumption |

---

## 4. Data Flow & Integration

### Primary Data Pipelines

#### 1. HRIS to Analytics Pipeline

```
CSV/Excel Upload
    │
    ▼
Segmentation Studio
├─ Canonical Field Mapping (30 fields)
├─ Dimension/Node Builder (hierarchical trees)
├─ Membership Assignment (multi-membership)
└─ Segmentation Pack Export (v0.2)
    │
    ├──► PeopleAnalyst (forecasting segments)
    ├──► Reincarnation (survey targeting)
    ├──► Preference Modeler (respondent pools)
    └──► Conductor (HRIS snapshot for Tier 1)
```

#### 2. Survey Collection Pipeline

```
PeopleAnalyst (define constructs/measures)
    │
    ▼
Reincarnation (adaptive item pool)
├─ RID (universal items)
├─ SID (study instances)
└─ Survey Design Contract
    │
    ▼
Preference Modeler (delivery)
├─ 15 question types
├─ Token-based access
└─ Auto-save responses
    │
    ▼
Reincarnation (response sync)
└─ Psychometric analysis
    │
    ▼
PeopleAnalyst (Bayesian aggregation)
```

#### 3. Compensation Planning Pipeline

```
Executive Priorities
    │
    ▼
AnyComp (strategy builder)
├─ Business Context
├─ Governance Philosophy
├─ Market Targets
└─ Budget Constraints
    │
    ▼
100 Pennies Allocation
    │
    ▼
Action Library Selection
    │
    ▼
Scenario Modeling
├─ AI Narrative (gpt-5-mini)
├─ Cost Projection
└─ VOI Analysis (EVPI/EVSI)
```

#### 4. Data Anonymization Pipeline

```
Raw HRIS CSV/Excel
    │
    ▼
Data Anonymizer
├─ Column Analysis (21 PII patterns)
├─ Canonical Field Matching (191 fields)
├─ Strategy Selection
│  ├─ deterministic_id (FK-preserving SHA-256)
│  ├─ fake_* (Faker.js)
│  ├─ generalize (banding)
│  └─ hash/redact
└─ Anonymized Export
    │
    ├──► Conductor (safe BigQuery upload)
    ├──► Segmentation Studio (privacy-safe analysis)
    └──► PeopleAnalyst (masked forecasting inputs)
```

### Field Exchange System

**Purpose:** Canonical HRIS field library with cross-platform alias mapping

**Canonical Fields:** 66 core fields (employee_identifier, base_compensation, department, etc.)  
**Aliases:** 385+ platform-specific field names mapped to canonical (Workday, SAP, ADP, BambooHR, Oracle HCM, UKG, Paycom, Paylocity, Ceridian, Namely)  
**Sync Protocol:** Bidirectional sync with Hub via `POST /api/field-exchange/sync`  

**Active in:** Data Anonymizer (191 fields), AnyComp (66 fields with validation), Conductor (field registry), Segmentation Studio (30 canonical fields)

### Webhook Event System

**Segmentation Studio Webhooks:**
- **Event:** `export.ready`
- **Payload:** `{event, timestamp, workspace_id, data: {manifest_id, pack_id, download_urls}}`
- **Signature:** HMAC-SHA256 via `X-Signature-256` header
- **Consumers:** PeopleAnalyst, Reincarnation, Preference Modeler

**Hub Directive Webhooks:**
- **Event:** `directive.created`
- **Payload:** `{event, directive: {id, title, type, priority}}`
- **Recipients:** All registered spokes via `POST /api/hub-webhook`

---

## 5. Shared Concepts

### Canonical Data Contracts

#### Segmentation Pack (v0.2)

**Producer:** Segmentation Studio  
**Consumers:** PeopleAnalyst, Reincarnation, Preference Modeler, Conductor

```json
{
  "schemaVersion": "0.2",
  "dimensions": [{
    "id": "uuid",
    "name": "Business Unit",
    "slug": "business_unit",
    "isMultiMembership": true,
    "values": [{"id": "uuid", "value": "engineering", "label": "Engineering"}]
  }],
  "segments": [{
    "id": "uuid",
    "name": "Senior Engineers",
    "criteria": {"include": [{"dimensionId": "uuid", "operator": "in", "values": ["engineering"]}]},
    "memberCount": 45
  }],
  "memberships": [{
    "employeeId": "uuid-v5",
    "segmentId": "uuid",
    "dimensionId": "uuid",
    "membershipType": "primary"
  }]
}
```

#### Employee Snapshot

**Producer:** Segmentation Studio  
**Consumers:** Reincarnation, Preference Modeler

```json
{
  "version": "2026.02.01.1234",
  "employees": [{
    "platform_employee_id": "uuid-v5",
    "employee_id": "EMP001",
    "first_name": "Jane",
    "last_name": "Smith",
    "department": "Engineering",
    "segments": [{"dimension_key": "business_unit", "node_key": "engineering"}]
  }]
}
```

#### VOI Analysis Results

**Producers:** AnyComp, VOI Calculator, PeopleAnalyst  
**Contract:** EVPI/EVSI with recommendation

```json
{
  "baselineValue": 150000,
  "perfectInfoValue": 185000,
  "evpiTotal": 35000,
  "evpiPerVariable": {"engagement": 15000, "retention": 20000},
  "informationGap": 23.3,
  "recommendation": "Measure retention (EVPI: $20K) before engagement"
}
```

#### Kanban Card Deployment

**Producer:** Product Kanban  
**Consumers:** All spokes via `POST /api/receive-cards`

```json
{
  "cards": [{
    "title": "Implement retention analysis",
    "type": "feature",
    "status": "backlog",
    "priority": "high",
    "appTarget": "people-analyst",
    "acceptanceCriteria": ["Model accuracy > 80%"],
    "tags": ["analytics", "retention"]
  }],
  "metadata": {"source": "kanban", "pushedAt": "2026-02-10T..."}
}
```

### Common Patterns

#### 1. Distribution Types

**Supported Across:** VOI Calculator, PeopleAnalyst, Decision Wizard, AnyComp

```typescript
type Distribution =
  | { type: "triangular"; min: number; mode: number; max: number }
  | { type: "normal"; mean: number; std: number }
  | { type: "uniform"; min: number; max: number }
  | { type: "beta"; alpha: number; beta: number }
  | { type: "lognormal"; mu: number; sigma: number }
  | { type: "empirical"; values: number[]; weights?: number[] };
```

#### 2. Survey Question Types

**Standard Across:** Reincarnation, Preference Modeler

```typescript
type QuestionType =
  | "likert_5" | "likert_7" | "nps" | "multiple_choice" | "multi_select"
  | "text_short" | "text_long" | "numeric" | "date" | "rating"
  | "dual_slider" | "maxdiff" | "penny_allocation" | "paired_comparison"
  | "conjoint" | "list_selection";
```

#### 3. UUID Generation

**Platform Standard:** UUID v5 for deterministic employee IDs

```typescript
import { v5 as uuidv5 } from "uuid";
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // Platform namespace
const platformEmployeeId = uuidv5(`${workspaceId}:${employeeId}`, NAMESPACE);
```

#### 4. Audit Trail Pattern

**Implemented in:** AnyComp, Conductor

```typescript
interface AuditEvent {
  entity_type: "strategy" | "scenario" | "action" | "dataset";
  entity_id: number;
  event_type: "create" | "update" | "ai_narrative" | "validate";
  actor: "user" | "system" | "ai" | "hub";
  details: Record<string, any>;
  timestamp: string;
}
```

---

## 6. Technical Stack

### Frontend Technologies (Standardized)

| Technology | Version | Usage | Applications |
|-----------|---------|-------|--------------|
| **React** | 18 | UI framework | All 11 apps |
| **TypeScript** | 5.x | Type safety | All 11 apps |
| **Vite** | 5.x | Build tool, HMR | All 11 apps |
| **Tailwind CSS** | 3.x | Utility-first styling | All 11 apps |
| **shadcn/ui** | Latest | Component library (Radix UI primitives) | All 11 apps |
| **wouter** | 3.x | Lightweight routing | 9 apps (some use React Router) |
| **TanStack Query** | v5 | Server state management | All 11 apps |
| **Zod** | 3.x | Schema validation | All 11 apps |
| **Recharts** | 2.x | Data visualization | 5 apps |
| **Lucide React** | Latest | Iconography | All 11 apps |

### Backend Technologies (Standardized)

| Technology | Version | Usage | Applications |
|-----------|---------|-------|--------------|
| **Node.js** | 20 | Runtime | All 11 apps |
| **Express.js** | 5.x | REST API server | All 11 apps |
| **TypeScript** | 5.x | Type safety | All 11 apps |
| **tsx** | Latest | Development runtime | All 11 apps |
| **Drizzle ORM** | Latest | Type-safe database queries | 9 apps |
| **PostgreSQL** | 16+ (Neon) | Persistent database | 9 apps |
| **drizzle-zod** | Latest | Schema-to-validation | All 11 apps |

### AI Integration

| Service | Model | Applications |
|---------|-------|--------------|
| **Replit AI Integrations** | GPT-4o (OpenAI), GPT-5-mini, Claude Sonnet 4 | 7 apps |
| **Anthropic Claude** | `claude-sonnet-4-20250514` | 5 apps (via `@anthropic-ai/sdk`) |

**AI Capabilities:**
- Narrative generation (AnyComp, PeopleAnalyst)
- SQL/Python code generation (Conductor)
- Field mapping suggestions (Segmentation Studio, Data Anonymizer)
- Directive execution (Hub, Kanban, Reincarnation, Segmentation Studio)
- Documentation generation (all apps)
- Research priors (VOI Calculator, PeopleAnalyst)

### Infrastructure & Hosting

| Component | Technology | Details |
|-----------|-----------|---------|
| **Hosting** | Replit | Auto-deploy on commit |
| **Database** | PostgreSQL (Neon) | Serverless, connection pooling |
| **Secrets** | Replit Secrets | `HUB_API_KEY`, `DEPLOY_SECRET`, `SESSION_SECRET`, `ANTHROPIC_API_KEY` |
| **Port Architecture** | Single-port (5000) | Vite frontend + Express API |
| **Build Output** | `dist/index.cjs` (backend), `dist/public/` (frontend) | esbuild + Vite |

---

## 7. Links & References

### Application Documentation

| Application | Documentation | API Specs | Live URL |
|-------------|--------------|-----------|----------|
| **Platform Hub** | Internal registry | — | https://people-analytics-toolbox.replit.app |
| **Conductor** | [Conductor Docs](#conductor) | `GET /api/specifications` | https://data-model-explorer.replit.app |
| **Segmentation Studio** | [Studio Docs](#segmentation-studio) | `GET /api/specifications` | https://segmentation-builder.replit.app |
| **Reincarnation** | [Reincarnation Docs](#reincarnation) | `GET /api/specifications` | https://reincarnation-engine.replit.app |
| **Preference Modeler** | [Modeler Docs](#preference-modeler) | `GET /api/specifications` | https://preference-modeler.replit.app |
| **PeopleAnalyst** | [Analyst Docs](#peopleanalyst) | `GET /api/specifications` | https://performix.replit.app |
| **Data Anonymizer** | [Anonymizer Docs](#data-anonymizer) | `GET /api/specifications` | https://data-vault-anonymizer.replit.app |
| **AnyComp** | [AnyComp Docs](#anycomp) | `GET /api/specifications` | https://anycomp.replit.app |
| **MetricEngine** | [MetricEngine Docs](#metric-engine-calculus) | `GET /api/specifications` | https://metric-engine-calculus.replit.app |
| **VOI Calculator** | [VOI Docs](#voi-calculator) | `GET /api/specifications` | https://voi-calculator.replit.app |
| **Decision Wizard** | [Wizard Docs](#decision-wizard) | `GET /api/specifications` | https://decision-wizard.replit.app |
| **Product Kanban** | [Kanban Docs](#product-kanban) | `GET /api/specifications` | https://people-analytics-kanban.replit.app |

### Shared Repositories & Modules

| Module | Location | Purpose |
|--------|----------|---------|
| **Field Exchange SDK** | Data Anonymizer (`server/field-exchange-client.ts`) | 66 canonical fields, 385+ aliases, 10 HRIS platforms |
| **VOI Framework** | VOI Calculator (`shared/voi-types.ts`) | EVPI/EVSI calculation, 6 distributions, sensitivity analysis |
| **Segmentation Trees** | Segmentation Studio (absorbed from Meta-Factory) | 5 hierarchical trees (Geography, Job, Financial, Demographic, Leadership) |
| **Meta-Factory Metrics** | MetricEngine (`server/import-metrics.ts`) | 566 HR metric dictionary, 210 active |
| **Documentation Scoring** | Platform Hub | 9-section quality assessment (0-100 points each) |

### Integration Endpoints

**Hub Endpoints:**
- Health: `GET {HUB_URL}/health`
- Registry: `GET {HUB_URL}/api/apps`
- Directives: `GET {HUB_URL}/api/hub/app/{slug}/directives`
- Doc Push: `POST {HUB_URL}/api/hub/app/{slug}/documentation`
- Architecture: `GET {HUB_URL}/api/hub/architecture`

**Spoke Standard Endpoints:**
- Health: `GET /health` → `{status: "ok", app: "{slug}"}`
- Webhook: `POST /api/hub-webhook` → `{received: true}`
- Specs: `GET /api/specifications` → `replit.md` (plain text)

---

## Appendix: Feature Module Registry

### Self-Documentation Module

**Included In:** Conductor, Reincarnation, Preference Modeler, Segmentation Studio  
**Purpose:** Quality scoring of `replit.md` documentation across 9 sections

**Scoring Criteria (per section, 100 points total):**
- Heading present: 20 points
- Word count 50+: up to 40 points
- Bullet lists or tables: 20 points
- Code snippets or technical terms: 20 points

**Endpoints:**
- `GET /api/self-docs` → Returns quality score report
- `GET /api/self-docs/export` → Download markdown report

### Dev Context Generator

**Included In:** Conductor, Preference Modeler, Segmentation Studio  
**Purpose:** Auto-introspect codebase for AI agent handoffs

**Generated Sections:**
- File manifest with LOC counts
- Database schema summary
- API endpoint catalog
- Environment variable inventory
- Technology stack analysis

**Endpoints:**
- `GET /api/context` → Returns context report
- `POST /api/context/generate` → Trigger regeneration
- `GET /api/context/export` → Download JSON export

### Field Exchange

**Included In:** Data Anonymizer, Conductor, Preference Modeler  
**Purpose:** HRIS field mapping with canonical library and Hub sync

**Capabilities:**
- Canonical field library (66 fields in Data Anonymizer)
- Platform-specific alias mapping (385+ aliases across 10 HRIS platforms)
- Bidirectional Hub sync for shared field definitions
- Field validation and profiling

**Endpoints:**
- `GET /api/field-mappings` → List field mappings
- `POST /api/field-exchange/sync` → Sync with Hub
- `GET /api/field-exchange/manifest` → Field manifest
- `GET /api/field-exchange/profiles` → Field profiles

---

**Document Maintained By:** Platform Hub Documentation Scoring System  
**Last Updated:** 2026-02-11  
**Next Review:** Automatic on next directive cycle (6-hour interval)