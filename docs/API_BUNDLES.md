# Card Bundle Discovery API

## Overview
The Card Bundle Discovery API exposes all available card bundles with their complete JSON schemas, enabling Spoke apps to discover and integrate metric visualization components.

## Endpoint

### GET /api/bundles

Returns all available card bundles with their complete schema definitions.

**Request:**
```http
GET /api/bundles
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "key": "confidence_band",
    "chartType": "confidence_band",
    "displayName": "Confidence Band Chart",
    "description": "Line chart with forecast confidence/uncertainty bands...",
    "version": 1,
    "dataSchema": {
      "type": "object",
      "required": ["data"],
      "properties": {
        "data": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["x", "y"],
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" },
              "lo1": { "type": "number" },
              "hi1": { "type": "number" },
              "lo2": { "type": "number" },
              "hi2": { "type": "number" }
            }
          }
        }
      }
    },
    "configSchema": {
      "type": "object",
      "properties": {
        "lineColor": { "type": "string" },
        "bandColors": { "type": "array" },
        "xLabel": { "type": "string" },
        "yLabel": { "type": "string" },
        "width": { "type": "number" },
        "height": { "type": "number" }
      }
    },
    "outputSchema": {
      "type": "object",
      "description": "Rendered SVG chart with confidence bands"
    },
    "defaults": {
      "lineColor": "#5b636a",
      "bandColors": ["#a3adb8", "#e0e4e9"]
    },
    "exampleData": { ... },
    "exampleConfig": { ... },
    "documentation": "...",
    "category": "Forecasting",
    "tags": ["forecast", "uncertainty", "prediction", "time-series"],
    "infrastructureNotes": "Requires D3.js for rendering...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Schema Contracts

Each bundle includes three critical JSON Schema contracts:

### 1. dataSchema
Defines the structure of data that must be POSTed to `/api/cards/:id/data` to populate the card.

### 2. configSchema
Defines the configuration options for customizing the visualization appearance and behavior.

### 3. outputSchema
Defines the structure of the rendered output (typically describes the SVG chart or interactive control).

## Usage for Spoke Apps

1. **Discovery**: Call `GET /api/bundles` to get all available bundles
2. **Selection**: Choose a bundle based on `key`, `category`, or `tags`
3. **Integration**: Use the schemas to:
   - Validate data before submission
   - Generate UI for configuration options
   - Understand the output format
4. **Implementation**: 
   - Create a card: `POST /api/cards` with `bundleId`
   - Push data: `POST /api/cards/:id/data` conforming to `dataSchema`
   - Configure: Include config in card creation that conforms to `configSchema`

## Example Integration Flow

```javascript
// 1. Discover bundles
const response = await fetch('/api/bundles');
const bundles = await response.json();

// 2. Find the bundle you need
const confidenceBandBundle = bundles.find(b => b.key === 'confidence_band');

// 3. Create a card with this bundle
const card = await fetch('/api/cards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bundleId: confidenceBandBundle.id,
    title: 'Q1 Attrition Forecast',
    config: {
      xLabel: 'Quarter',
      yLabel: 'Attrition Rate (%)',
      lineColor: '#2563eb'
    }
  })
}).then(r => r.json());

// 4. Push data conforming to dataSchema
await fetch(`/api/cards/${card.id}/data`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: [
      { x: 0, y: 50, lo1: 45, hi1: 55, lo2: 40, hi2: 60 },
      { x: 1, y: 55, lo1: 48, hi1: 62, lo2: 42, hi2: 68 },
      // ... more data points
    ]
  })
});
```

## Related Endpoints

- `GET /api/bundles/:id` - Get a specific bundle by ID
- `GET /api/bundles/key/:key` - Get a bundle by its unique key
- `POST /api/cards` - Create a card using a bundle
- `POST /api/cards/:id/data` - Push data to a card

## Notes

- All bundles include `exampleData` and `exampleConfig` for reference
- The `documentation` field provides usage guidance for each bundle
- Bundles are versioned; version increments trigger automatic updates during seeding
