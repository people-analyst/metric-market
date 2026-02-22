# Component Export API for Embeddable Chart Widgets (Card #139)

API that returns embeddable chart widget packages (schemas, example data, integration guide) for specific cards. Used by Conductor or other spokes to embed Metric Market charts.

---

## Endpoints

### GET /api/components

Returns the component registry: all chart and control bundles with key, displayName, category, componentType, tags, integrationTargets, demoUrl.

**Query (optional)**

- `category` — Filter by bundle category
- `componentType` — `chart` or `control`
- `target` — Filter by integration target slug (e.g. `conductor`)

**Response:** `200` — Array of `{ key, displayName, description, version, category, componentType, tags, integrationTargets, demoUrl, lastUpdated }`

---

### GET /api/components/:key

Returns the full export package for one component (bundle key). Use this to get schemas and integration instructions for embedding.

**Response:** `200` — Object with:

- `manifest` — component, displayName, version, exportedAt, sourceApp, sourceSlug, demoUrl
- `schemas` — dataSchema, configSchema, outputSchema
- `defaults`, `exampleData`, `exampleConfig`
- `documentation`, `infrastructureNotes`
- `integrationGuide` — Markdown guide (e.g. how to push data via POST /api/cards/:id/data)
- `integrationTargets` — Conductor, etc.
- `sourceFiles` — Client file paths for the component

**404** — Component not found.

---

### GET /api/export/:key

Same as GET /api/components/:key but returns a downloadable JSON file (`Content-Disposition: attachment`). Filename: `{key}-export.json`.

---

## Embeddable usage

1. Call **GET /api/components** to list available components (or GET /api/bundles for raw bundle list).
2. Call **GET /api/components/:key** (e.g. `range_builder`, `confidence_band`) to get dataSchema, configSchema, exampleData, and integrationGuide.
3. Create a card via **POST /api/cards** with the chosen bundleId (from GET /api/bundles, find bundle where key = :key).
4. Push data via **POST /api/cards/:id/data** with a payload conforming to the component’s dataSchema.
5. Embed the chart in Conductor (or another app) by loading the Metric Market card view or using the demoUrl and passing card id / data.

Acceptance criterion: embeddable chart widget API — satisfied by GET /api/components and GET /api/components/:key (and GET /api/export/:key).
