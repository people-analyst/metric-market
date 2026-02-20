# REQ: Metric Market (Range Builder) → AnyComp Integration

**Type:** project | **Priority:** high | **Status:** planned

**Application:** metric-market

## Description

# REQ: Metric Market (Range Builder) → AnyComp Integration

Range Builder is the structural engineering console (lives in Metric Market) where compensation ranges are designed. AnyComp is the downstream strategic decision engine that evaluates those designs against business strategy, compares scenarios, applies budgets, and drives approval workflows.

## Key Requirements
- **RangeBuilderChangeEvent consumption**: capture range adjustment events as scenario snapshots (job_family_id, grade, range_min/mid/max, spread, midpoint_progression, effective_date, change_reason)
- **Pay Structure Config sharing**: import complete pay structure configurations for strategic evaluation
- **5 Sub-Index computation flow**: Market Alignment (MRP proximity), Cost Discipline (budget adherence), Internal Equity (compa-ratio variance), Workforce Placement (in-range %), Range Hygiene (overlap/spread)
- **Feature responsibility boundary**: Range Builder owns range construction; AnyComp owns strategic evaluation, scenario comparison, and approval workflows
- **AnyComp enriches** Range Builder output but never replaces it

## Priority Phase
Priority 1 (MVP)

## References
- Full Requirements Doc: requirements/REQ-metric-market.md
- VISION.md Reference: Sections 3, 4, 8.6, 8.7

## Acceptance Criteria

- [ ] RangeBuilderChangeEvent consumption as scenario snapshots
- [ ] Pay Structure Config sharing for strategic evaluation
- [ ] 5 Sub-Index computation flow (Market Alignment, Cost Discipline, Internal Equity, Workforce Placement, Range Hygiene)
- [ ] Feature responsibility boundary enforced between Range Builder and AnyComp
- [ ] AnyComp enriches Range Builder output without replacing it

**Tags:** integration, anycomp, metric-market, range-builder, mvp

---
*Created: Sat Feb 14 2026 22:39:58 GMT+0000 (Coordinated Universal Time) | Updated: Sat Feb 14 2026 22:39:58 GMT+0000 (Coordinated Universal Time)*
