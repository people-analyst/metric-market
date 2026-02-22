# Conductor Field Mapping to Hub Canonical (Card #88)

Map Conductor internal fields to Hub canonical names.

**Compensation:** p50/p75 -> market_p50/market_p75; label -> job_level_label; blsWage -> bls_oes_wage; employees -> employee_count; effectiveDate -> effective_date.

**Organization:** jobFunction/superFunction -> job_family_id/super_job_function; levelType -> level_type; level/grade -> grade; department -> department; location/country -> country/geo_zone.

Use when normalizing Conductor payloads for Hub or Range Builder.
