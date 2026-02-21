# Card Bundle Discovery for Spoke Apps

## Overview

The Card Bundle Discovery API (`GET /api/bundles`) exposes all available metric visualization bundles with their complete JSON Schema contracts, enabling Spoke apps to:

1. **Discover** available chart types and visualizations
2. **Understand** data requirements through `dataSchema`
3. **Configure** visualizations through `configSchema`  
4. **Integrate** components with type-safe contracts

## Key Concepts

### What is a Card Bundle?

A **Card Bundle** is a reusable metric visualization component that includes:

- **Chart Type**: The visualization type (e.g., `confidence_band`, `alluvial`, `heatmap`)
- **Data Schema**: JSON Schema defining required data structure
- **Config Schema**: JSON Schema defining configuration options
- **Output Schema**: JSON Schema describing the rendered output
- **Defaults**: Default configuration values
- **Examples**: Sample data and config for quick start

### Why Use the Discovery API?

Instead of hardcoding visualizations, Spoke apps can:

- ✅ Dynamically discover available chart types
- ✅ Validate data before submission using schemas
- ✅ Generate UI forms from config schemas
- ✅ Get up-to-date bundle definitions automatically
- ✅ Ensure compatibility with metric-market

## Quick Start

### 1. Fetch All Bundles

```bash
curl http://localhost:5000/api/bundles
```

```javascript
const response = await fetch('/api/bundles');
const bundles = await response.json();

console.log(`Found ${bundles.length} bundles`);
```

### 2. Explore a Bundle

```javascript
const bundle = bundles.find(b => b.key === 'confidence_band');

console.log('Display Name:', bundle.displayName);
console.log('Description:', bundle.description);
console.log('Category:', bundle.category);
console.log('Data Schema:', bundle.dataSchema);
console.log('Config Schema:', bundle.configSchema);
```

### 3. Create a Card with the Bundle

```javascript
// Create a card instance
const card = await fetch('/api/cards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bundleId: bundle.id,
    title: 'My Forecast Chart',
    config: {
      xLabel: 'Time',
      yLabel: 'Value',
      lineColor: '#2563eb'
    }
  })
}).then(r => r.json());

// Push data that conforms to the bundle's dataSchema
await fetch(`/api/cards/${card.id}/data`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: [
      { x: 0, y: 50, lo1: 45, hi1: 55 },
      { x: 1, y: 55, lo1: 48, hi1: 62 }
    ]
  })
});
```

## Bundle Schema Structure

Each bundle returned by `GET /api/bundles` has this structure:

```typescript
{
  id: string;                    // Unique bundle ID
  key: string;                   // Unique bundle key (e.g., "confidence_band")
  chartType: string;             // Chart type identifier
  displayName: string;           // Human-readable name
  description: string;           // Description of the bundle
  version: number;               // Bundle version
  category: string;              // Category (e.g., "Forecasting")
  tags: string[];                // Tags for discovery
  
  // CRITICAL SCHEMAS:
  dataSchema: JSONSchema;        // Defines required data structure
  configSchema: JSONSchema;      // Defines configuration options
  outputSchema: JSONSchema;      // Defines output format
  
  // HELPER FIELDS:
  defaults: object;              // Default configuration values
  exampleData: object;           // Example data payload
  exampleConfig: object;         // Example configuration
  documentation: string;         // Usage documentation
  infrastructureNotes: string;   // Technical notes
  
  createdAt: Date;
  updatedAt: Date;
}
```

## Using Schemas

### Data Schema (dataSchema)

Defines the exact structure of data you must POST to `/api/cards/:id/data`:

```javascript
// Example dataSchema for confidence_band:
{
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
          "hi1": { "type": "number" }
        }
      }
    }
  }
}

// Your data must match:
{
  "data": [
    { "x": 0, "y": 50, "lo1": 45, "hi1": 55 },
    { "x": 1, "y": 55, "lo1": 48, "hi1": 62 }
  ]
}
```

### Config Schema (configSchema)

Defines available configuration options:

```javascript
// Example configSchema:
{
  "type": "object",
  "properties": {
    "lineColor": { "type": "string", "description": "Color of the central line" },
    "xLabel": { "type": "string", "description": "X-axis label" },
    "yLabel": { "type": "string", "description": "Y-axis label" },
    "width": { "type": "number" },
    "height": { "type": "number" }
  }
}

// Your config can include:
{
  "lineColor": "#2563eb",
  "xLabel": "Quarter",
  "yLabel": "Attrition Rate (%)",
  "width": 800,
  "height": 400
}
```

### Output Schema (outputSchema)

Describes what the bundle produces:

```javascript
// Example outputSchema:
{
  "type": "object",
  "description": "Rendered SVG chart with confidence bands"
}
```

## Discovery Patterns

### Browse All Bundles

```javascript
const bundles = await fetch('/api/bundles').then(r => r.json());

bundles.forEach(bundle => {
  console.log(`${bundle.displayName} (${bundle.key})`);
  console.log(`  Category: ${bundle.category}`);
  console.log(`  Tags: ${bundle.tags.join(', ')}`);
});
```

### Filter by Category

```javascript
const bundles = await fetch('/api/bundles').then(r => r.json());

const forecasting = bundles.filter(b => b.category === 'Forecasting');
console.log('Forecasting bundles:', forecasting.map(b => b.displayName));
```

### Search by Tag

```javascript
const bundles = await fetch('/api/bundles').then(r => r.json());

const timeSeries = bundles.filter(b => 
  b.tags?.includes('time-series')
);
```

### Get Specific Bundle by Key

```javascript
const bundle = await fetch('/api/bundles/key/confidence_band')
  .then(r => r.json());
```

## TypeScript Integration

Use the provided types for type safety:

```typescript
import { BundleDiscoveryClient } from '@shared/bundle-api-types';
import type { CardBundle } from '@shared/schema';

const client = new BundleDiscoveryClient('/api');

// Type-safe bundle access
const bundles: CardBundle[] = await client.getAllBundles();

// Type-safe methods
const categories: string[] = await client.getCategories();
const tags: string[] = await client.getTags();
const forecastBundles = await client.getBundlesByCategory('Forecasting');
```

## Validation

Before sending data, validate against the bundle's schema:

```typescript
import { BundleDiscoveryClient } from '@shared/bundle-api-types';

const client = new BundleDiscoveryClient();
const bundle = await client.getBundleByKey('confidence_band');

const myData = {
  data: [{ x: 0, y: 50 }]
};

// Basic validation
const result = client.validateData(bundle, myData);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

For production, use a full JSON Schema validator like [ajv](https://ajv.js.org/).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bundles` | Get all bundles with schemas |
| GET | `/api/bundles/:id` | Get specific bundle by ID |
| GET | `/api/bundles/key/:key` | Get specific bundle by key |

## Examples by Use Case

### AI Agent Creating Charts

```javascript
// Agent determines which chart type to use
const bundles = await fetch('/api/bundles').then(r => r.json());
const bundle = selectBundleForMetric(metric, bundles);

// Agent creates card with appropriate config
const card = await createCard(bundle.id, {
  title: generateTitle(metric),
  config: generateConfigFromBundle(bundle, metric)
});

// Agent pushes data conforming to schema
const data = transformMetricData(metric, bundle.dataSchema);
await pushCardData(card.id, data);
```

### Dashboard Builder

```javascript
// User browses available chart types
const categories = [...new Set(bundles.map(b => b.category))];

// User selects a category and bundle
const selectedBundle = bundles.find(b => b.key === userSelection);

// UI generates config form from configSchema
const configForm = generateFormFromSchema(selectedBundle.configSchema);

// User submits, app creates card
const card = await createCardFromBundleAndConfig(selectedBundle, userConfig);
```

## Next Steps

- 📖 [Full API Documentation](./API_BUNDLES.md)
- 💻 [Integration Examples](./BUNDLE_INTEGRATION_EXAMPLE.md)
- 🔍 [Bundle Definitions](../server/bundleDefinitions.ts)
- ✅ [Verification Script](../scripts/verify-bundle-api.ts)

## Support

For questions or issues with the Bundle Discovery API:

1. Check the bundle's `documentation` field
2. Review `exampleData` and `exampleConfig`
3. Consult the bundle definitions source code
4. Test with the verification script
