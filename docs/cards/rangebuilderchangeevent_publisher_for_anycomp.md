# RangeBuilderChangeEvent Publisher for AnyComp

**Type:** feature | **Priority:** high | **Status:** planned

**Application:** metric-market

## Description

Metric Market (Range Builder) must publish RangeBuilderChangeEvent payloads when range adjustments occur, for AnyComp to capture as scenario snapshots. Fields: job_family_id, grade, range_min/mid/max, spread, midpoint_progression, effective_date, change_reason.

## Acceptance Criteria

- [ ] Publish change events on range adjustments
- [ ] Payload includes all required fields
- [ ] Event format consumable by AnyComp
- [ ] Historical events queryable

**Tags:** metric-market, anycomp, range-builder, mvp

---
*Created: Sat Feb 14 2026 23:36:28 GMT+0000 (Coordinated Universal Time) | Updated: Sat Feb 14 2026 23:36:28 GMT+0000 (Coordinated Universal Time)*
