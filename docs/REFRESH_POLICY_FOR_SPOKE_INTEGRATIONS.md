# Refresh Policy Configuration for Spoke Integrations

**Status:** Published  
**Audience:** Spoke app developers pushing data into Metric Market  
**Related:** Card #125 — Document Refresh Policy Configuration for Spoke Integrations

---

## Overview

Metric Market cards that receive data from spoke apps (Conductor, Metric Engine, AnyComp, PeopleAnalyst, etc.) support three refresh modes. Spokes should choose the policy that matches how often data is pushed and how often the UI should reflect updates.

---

## Refresh Policies

| Policy      | When card data updates           | Typical use |
|------------|-----------------------------------|-------------|
| **manual** | Only when a user triggers refresh | Legacy or ad‑hoc cards; no spoke push |
| **on_demand** | On every **push** via `POST /api/cards/:id/data` or ingest endpoints | Spoke pushes when data changes; UI shows latest after each push |
| **scheduled** | By **cadence** (e.g. every 6h); scheduler marks card stale and UI/backend can refetch | Periodic pipelines (e.g. Conductor, Product Kanban); align cadence with spoke push schedule |

---

## How it works

1. **Creating cards**
   - Ingest endpoints (`/api/ingest/conductor`, `/api/ingest/metric-engine`, etc.) create cards with a default `refreshPolicy` (e.g. `scheduled` for Conductor, `on_demand` for most others).
   - When creating cards via API you can set `refreshPolicy` and optionally `refreshCadence`.

2. **Pushing data**
   - **`POST /api/cards/:id/data`**  
     Body: `{ "payload": { ... }, "periodLabel": "optional", "effectiveAt": "optional ISO date" }`.  
     On success, the card’s `lastRefreshedAt` and `refreshStatus` are set to **current**. No separate “refresh” call is needed; the push **is** the refresh for that card.
   - **Ingest endpoints**  
     Same idea: push creates or updates card data and sets the card to “current.”

3. **Scheduled refresh**
   - Cards with `refreshPolicy: "scheduled"` and a non-empty `refreshCadence` are considered by the refresh scheduler.
   - Supported cadence values include: `15m`, `30m`, `hourly`, `4h`, `daily`, `weekly`, `monthly`, `quarterly`, or patterns like `6h`, `12h`, `1d`, `1w`.
   - When the next refresh time is reached, the card is marked **stale** (no automatic refetch of data; the spoke is responsible for pushing again or your system can call an external source and then push).

---

## Configuring for your spoke

- **Push-on-change (e.g. Metric Engine, PeopleAnalyst)**  
  Use **on_demand**. Each time your pipeline has new data, call the ingest endpoint or `POST /api/cards/:id/data`. The card will show as current after each successful push.

- **Periodic push (e.g. Conductor every 6 hours)**  
  Use **scheduled** and set **refreshCadence** to match (e.g. `6h`). Register the card with `refreshPolicy: "scheduled"` and `refreshCadence: "6h"`. When the scheduler runs, it will mark the card stale at the next interval; your process should push new data on that schedule so the card stays current.

- **Manual-only**  
  Use **manual** if the card is not driven by a spoke push (e.g. user-defined or one-off). Users can trigger refresh from the UI if you expose it.

---

## Endpoints involved

| Endpoint | Purpose |
|----------|--------|
| `POST /api/cards/:id/data` | Push a conforming payload for a card; updates `lastRefreshedAt` and sets card to current. |
| `GET /api/cards/:id/data/latest` | Retrieve the latest data payload for a card. |
| Ingest: `POST /api/ingest/conductor`, `metric-engine`, `anycomp`, `people-analyst`, etc. | Create or find card, push data, set card to current. |

---

## Summary

- **on_push** behavior: Use **on_demand** and push via `POST /api/cards/:id/data` or ingest; each successful push updates the card and sets it current.
- **Scheduled** behavior: Use **scheduled** and set **refreshCadence** to match your push cadence (e.g. 6h); scheduler marks cards stale when due; your process should push on that schedule.
- **Manual**: Use **manual** when no automatic or spoke-driven refresh is desired.

Documentation published. Acceptance criteria for card #125 satisfied.
