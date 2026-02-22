# Card Bundle Creation API Schema (Cards #137, #206)

API for creating card bundles from metric definitions (external metric sources, survey data). Supported chart types and request/response schema.

---

## POST /api/bundles/from-metric-definition

Creates a card bundle from a metric definition payload. Chart type is inferred from `unit`, `category`, and `key`.

**Request body**

| Field       | Type   | Required | Description |
|------------|--------|----------|-------------|
| `key`      | string | Yes      | Metric key (e.g. `attrition_rate`, `compa_ratio`) |
| `name`     | string | Yes      | Display name for the bundle |
| `category` | string | No       | Metric category (used to infer chart type) |
| `unit`     | string | No       | Unit (%, $, rate, ratio, count, etc.) |
| `description` | string | No    | Description |
| `source`   | string | No       | Data source label |

**Chart type inference**

- `unit` / `category` mapping: `rate` → multi_line, `ratio` → bullet_bar, `count` → sparkline_rows, `percentage` → waffle_percent, `score` / `index` → radial_bar, `currency` → range_strip, `forecast` → confidence_band, `distribution` → box_whisker, `trend` → multi_line, `composition` → stacked_area, `correlation` → bubble_scatter, etc.
- Fallbacks from `key`: contains `ratio` → bullet_bar, `rate` → multi_line, `score` → radial_bar, `count` → sparkline_rows, `distribution` → box_whisker; default → multi_line.

**Response**

- `201`: Created bundle (full bundle object).
- `200`: Bundle already exists for this metric key (returns existing bundle).
- `400`: Missing `key`/`name`, or inferred chart type not supported.
- `500`: Server error.

---

## Supported chart types

Use `GET /api/specifications/visualization` for the full list. Summary of types used by bundle-from-metric-definition:

- **multi_line** — Time series, rates, trends
- **bullet_bar** — Ratios, single-value comparison
- **sparkline_rows** — Counts, scorecards
- **waffle_percent** — Percentages
- **radial_bar** — Scores, indices
- **range_strip** — Currency bands
- **confidence_band** — Forecasts
- **box_whisker** — Distributions
- **stacked_area** — Composition
- **bubble_scatter** — Correlation
- **slope_comparison** — Comparison
- **strip_timeline** — Duration
- **strip_dot** — Z-scores
- **heatmap** — Test results

---

## Survey data / external sources

For survey or external metric sources:

1. Call `POST /api/bundles/from-metric-definition` with `key`, `name`, and optional `unit`/`category`/`description`.
2. Use the returned bundle `id` or `key` to create cards via `POST /api/cards` (linking `bundleId`).
3. Push data via `POST /api/cards/:id/data` with a payload that conforms to the bundle’s `dataSchema`.

Schema and chart type list are also exposed via `GET /api/specifications/visualization` and `GET /api/bundles`.
