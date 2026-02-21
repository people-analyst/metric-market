# Bundle Discovery Integration Example

This guide demonstrates how Spoke apps can integrate with the Card Bundle Discovery API.

## Quick Start

### 1. Install the Types (TypeScript projects)

```typescript
import { BundleDiscoveryClient, createBundleClient } from '@shared/bundle-api-types';
import type { CardBundle } from '@shared/schema';
```

### 2. Initialize the Client

```typescript
const bundleClient = createBundleClient('/api');
```

### 3. Discover Available Bundles

```typescript
// Get all bundles
const bundles = await bundleClient.getAllBundles();

console.log(`Found ${bundles.length} bundles`);
bundles.forEach(bundle => {
  console.log(`- ${bundle.displayName} (${bundle.key})`);
});
```

## Complete Integration Example

### Scenario: Building a Dashboard with Forecasting Charts

```typescript
import { createBundleClient } from '@shared/bundle-api-types';

async function createForecastCard() {
  const client = createBundleClient();
  
  // 1. Discover bundles in the "Forecasting" category
  const forecastBundles = await client.getBundlesByCategory('Forecasting');
  console.log('Available forecast bundles:', forecastBundles.map(b => b.displayName));
  
  // 2. Select the Confidence Band bundle
  const confidenceBandBundle = await client.getBundleByKey('confidence_band');
  
  // 3. Examine the schema to understand what data is needed
  console.log('Data Schema:', JSON.stringify(confidenceBandBundle.dataSchema, null, 2));
  console.log('Config Schema:', JSON.stringify(confidenceBandBundle.configSchema, null, 2));
  
  // 4. Prepare configuration (merge with defaults)
  const config = {
    ...confidenceBandBundle.defaults,
    xLabel: 'Quarter',
    yLabel: 'Attrition Rate (%)',
    lineColor: '#2563eb',
    width: 800,
    height: 400
  };
  
  // 5. Create the card
  const cardResponse = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bundleId: confidenceBandBundle.id,
      title: 'Q1 2024 Attrition Forecast',
      subtitle: 'Engineering Department',
      config,
      tags: ['forecast', 'attrition', 'engineering']
    })
  });
  
  const card = await cardResponse.json();
  console.log('Created card:', card.id);
  
  // 6. Generate or fetch forecast data
  const forecastData = {
    data: [
      { x: 0, y: 12.5, lo1: 11.0, hi1: 14.0, lo2: 9.5, hi2: 15.5 },
      { x: 1, y: 13.2, lo1: 11.5, hi1: 14.9, lo2: 10.0, hi2: 16.4 },
      { x: 2, y: 14.1, lo1: 12.0, hi1: 16.2, lo2: 10.5, hi2: 17.7 },
      { x: 3, y: 15.0, lo1: 12.5, hi1: 17.5, lo2: 11.0, hi2: 19.0 }
    ]
  };
  
  // 7. Validate data against schema (optional but recommended)
  const validation = client.validateData(confidenceBandBundle, forecastData);
  if (!validation.valid) {
    throw new Error(`Data validation failed: ${validation.errors?.join(', ')}`);
  }
  
  // 8. Push data to the card
  const dataResponse = await fetch(`/api/cards/${card.id}/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forecastData)
  });
  
  const cardData = await dataResponse.json();
  console.log('Pushed data:', cardData.id);
  
  return card;
}
```

## Discovery Patterns

### Pattern 1: Browse by Category

```typescript
const client = createBundleClient();

// Get all categories
const categories = await client.getCategories();
console.log('Categories:', categories);

// Get bundles for each category
for (const category of categories) {
  const bundles = await client.getBundlesByCategory(category);
  console.log(`\n${category}:`);
  bundles.forEach(b => {
    console.log(`  - ${b.displayName}: ${b.description}`);
  });
}
```

### Pattern 2: Search by Tag

```typescript
const client = createBundleClient();

// Find all bundles related to forecasting
const forecastBundles = await client.getBundlesByTag('forecast');

// Find all time-series visualization bundles
const timeSeriesBundles = await client.getBundlesByTag('time-series');
```

### Pattern 3: Direct Key Lookup

```typescript
const client = createBundleClient();

// If you know the exact bundle you need
const bundle = await client.getBundleByKey('confidence_band');
```

## Working with Schemas

### Understanding dataSchema

The `dataSchema` defines what data structure you must provide:

```typescript
const bundle = await client.getBundleByKey('confidence_band');

// dataSchema will be a JSON Schema like:
{
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["x", "y"],
        properties: {
          x: { type: "number", description: "X-axis position" },
          y: { type: "number", description: "Central value" },
          lo1: { type: "number", description: "Inner band lower" },
          hi1: { type: "number", description: "Inner band upper" }
        }
      }
    }
  }
}
```

### Understanding configSchema

The `configSchema` defines customization options:

```typescript
// configSchema example:
{
  type: "object",
  properties: {
    lineColor: { type: "string" },
    xLabel: { type: "string" },
    yLabel: { type: "string" },
    width: { type: "number" },
    height: { type: "number" }
  }
}

// Use defaults as a starting point
const config = {
  ...bundle.defaults,
  xLabel: 'Custom X Label',
  width: 1000
};
```

### Understanding outputSchema

The `outputSchema` describes what the bundle produces (typically an SVG chart):

```typescript
// outputSchema example:
{
  type: "object",
  description: "Rendered SVG chart with confidence bands"
}
```

## Error Handling

```typescript
const client = createBundleClient();

try {
  // Try to get a bundle
  const bundle = await client.getBundleByKey('nonexistent_key');
} catch (error) {
  console.error('Bundle not found:', error);
}

// Validate before sending
const validation = client.validateData(bundle, myData);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  // Handle validation errors appropriately
}
```

## React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { createBundleClient } from '@shared/bundle-api-types';
import type { CardBundle } from '@shared/schema';

function useBundles() {
  const [bundles, setBundles] = useState<CardBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const client = createBundleClient();
    client.getAllBundles()
      .then(setBundles)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { bundles, loading, error };
}

function BundlePicker() {
  const { bundles, loading, error } = useBundles();

  if (loading) return <div>Loading bundles...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Available Card Bundles</h2>
      {bundles.map(bundle => (
        <div key={bundle.id}>
          <h3>{bundle.displayName}</h3>
          <p>{bundle.description}</p>
          <span>Category: {bundle.category}</span>
        </div>
      ))}
    </div>
  );
}
```

## AI Agent Integration

When building AI agents that create metric cards:

```typescript
async function aiAgentCreateCard(
  intent: string,
  metricData: any[]
) {
  const client = createBundleClient();
  
  // 1. Let AI determine appropriate bundle based on intent
  const bundles = await client.getAllBundles();
  
  // AI logic to select bundle
  const selectedBundle = selectBundleForIntent(intent, bundles);
  
  // 2. AI transforms data to match bundle's dataSchema
  const transformedData = transformDataForSchema(
    metricData,
    selectedBundle.dataSchema
  );
  
  // 3. AI generates appropriate config
  const config = generateConfigForBundle(
    selectedBundle,
    intent
  );
  
  // 4. Create and populate card
  // ... (same as above examples)
}
```

## Next Steps

- Review the [full API documentation](./API_BUNDLES.md)
- Explore bundle definitions in `server/bundleDefinitions.ts`
- Check example data in each bundle's `exampleData` field
- Use the `/api/bundles` endpoint in your application
