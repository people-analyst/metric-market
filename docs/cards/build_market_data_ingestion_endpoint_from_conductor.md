# Build Market Data Ingestion Endpoint from Conductor

**Type:** feature | **Priority:** high | **Status:** backlog

**Application:** metric-market

## Description

Implement POST /api/ingest/conductor that accepts Conductor's market compensation payload (P50/P75 percentiles, BLS OES wages, employee counts) and maps it to Range Builder and card data formats.

## Acceptance Criteria

- [ ] POST /api/ingest/conductor endpoint implemented
- [ ] Maps P50/P75 percentiles to Range Builder format
- [ ] Handles BLS OES wage data

**Tags:** metric-market, conductor, ingestion, phase1

---
*Created: Sat Feb 14 2026 23:49:05 GMT+0000 (Coordinated Universal Time) | Updated: Tue Feb 17 2026 14:53:44 GMT+0000 (Coordinated Universal Time)*
