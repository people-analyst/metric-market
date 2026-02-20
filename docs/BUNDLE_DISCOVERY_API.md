# Card Bundle Discovery API for Spoke Apps

## Overview
The Bundle Discovery API exposes all available card bundles with their complete JSON Schema contracts, enabling Spoke apps to dynamically discover and integrate chart types.

## Acceptance Criteria Status
✅ **GET /api/bundles returns all bundle schemas** - IMPLEMENTED

## API Endpoint

### GET /api/bundles
Returns all available card bundles with complete schema definitions.

**URL**: `/api/bundles`  
**Method**: `GET`  
**Auth Required**: No  
**Permissions**: Public

#### Success Response

**Code**: `200 OK`  
**Content**: Array of CardBundle objects

```json
[
  {
    "id": "uuid",
    "key": "confidence_band",
    "chartType": "confidence_band",
    "displayName": "Confidence Band Chart",
    "description": "Line chart with forecast confidence/uncertainty bands...",
    "version": 1,
    "category": "Forecasting",
    "tags": ["forecast", "uncertainty", "prediction", "time-series"],
    "dataSchema": { /* JSON Schema for input data */ },
    "configSchema": { /* JSON Schema for configuration */ },
    "outputSchema": { /* JSON Schema for output format */ },
    "defaults": { /* Default config values */ },
    "exampleData": { /* Sample data */ },
    "exampleConfig": { /* Sample config */ },
    "documentation": "Usage documentation...",
    "infrastructureNotes": "Technical requirements...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Schema Contracts

Each bundle includes three critical JSON Schema contracts:

### 1. dataSchema
Defines the structure of data required by the chart component.
- Validates input data before rendering
- Documents required/optional fields
- Specifies data types and constraints

**Example** (Confidence Band):
```json
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
          "x": { "type": "number", "description": "X-axis position" },
          "y": { "type": "number", "description": "Central value" },
          "lo1": { "type": "number", "description": "Inner band lower" },
          "hi1": { "type": "number", "description": "Inner band upper" },
          "lo2": { "type": "number", "description": "Outer band lower" },
          "hi2": { "type": "number", "description": "Outer band upper" }
        }
      }
    }
  }
}
```

### 2. configSchema
Defines configuration options for chart appearance and behavior.
- Customizable styling properties
- Layout options (width, height)
- Labels and annotations

**Example** (Confidence Band):
```json
{
  "type": "object",
  "properties": {
    "lineColor": { "type": "string", "description": "Color of central line" },
    "bandColors": { 
      "type": "array", 
      "items": { "type": "string" }, 
      "minItems": 2, 
      "maxItems": 2,
      "description": "[innerBandColor, outerBandColor]"
    },
    "xLabel": { "type": "string", "description": "X-axis label" },
    "yLabel": { "type": "string", "description": "Y-axis label" },
    "width": { "type": "number" },
    "height": { "type": "number" }
  }
}
```

### 3. outputSchema
Defines the structure of the rendered output.
- Describes what the chart produces
- Used for documentation and type generation

**Example**:
```json
{
  "type": "object",
  "description": "Rendered SVG chart with confidence bands"
}
```

## Available Bundles

The API currently exposes the following chart bundles:

| Key | Display Name | Category | Description |
|-----|--------------|----------|-------------|
| `confidence_band` | Confidence Band Chart | Forecasting | Line chart with confidence/uncertainty bands |
| `alluvial` | Alluvial / Flow Chart | Flow & Movement | Sankey diagram for category redistribution |
| `waffle_bar` | Waffle Bar Chart | Composition | Stacked bars with countable grid cells |
| `bullet_bar` | Bullet Bar Chart | Performance | Goal tracking with range backgrounds |
| `slope_comparison` | Slope Comparison Chart | Comparison | Period-over-period growth visualization |
| ... | ... | ... | *Additional bundles in database* |

## Usage for Spoke Apps

### 1. Discovery
Fetch all available bundles at startup:
```javascript
const response = await fetch('/api/bundles');
const bundles = await response.json();
```

### 2. Schema Validation
Use the schemas to validate data before submission:
```javascript
import Ajv from 'ajv';
const ajv = new Ajv();

const bundle = bundles.find(b => b.key === 'confidence_band');
const validate = ajv.compile(bundle.dataSchema);
const valid = validate(myData);

if (!valid) {
  console.error('Validation errors:', validate.errors);
}
```

### 3. Dynamic UI Generation
Generate form fields from configSchema:
```javascript
// Extract config properties for UI generation
const configProps = bundle.configSchema.properties;
Object.entries(configProps).forEach(([key, schema]) => {
  // Create input field based on schema type
  renderConfigField(key, schema);
});
```

### 4. Type Generation
Generate TypeScript types from schemas:
```bash
# Using json-schema-to-typescript
json2ts bundle.dataSchema > types/BundleData.ts
```

## Related Endpoints

- `GET /api/bundles/:id` - Get specific bundle by ID
- `GET /api/bundles/key/:key` - Get bundle by key (e.g., "confidence_band")
- `POST /api/cards` - Create card instance with bundle
- `POST /api/cards/:id/data` - Push data to card

## Implementation Details

### Backend (server/routes.ts)
```typescript
app.get("/api/bundles", async (_req, res) => {
  const bundles = await storage.listCardBundles();
  res.json(bundles);
});
```

### Storage Layer (server/storage.ts)
```typescript
async listCardBundles(): Promise<CardBundle[]> {
  return db.select()
    .from(cardBundles)
    .orderBy(cardBundles.category, cardBundles.displayName);
}
```

### Database Schema (shared/schema.ts)
```typescript
export const cardBundles = pgTable("card_bundles", {
  id: varchar("id").primaryKey(),
  key: text("key").notNull().unique(),
  chartType: text("chart_type").notNull(),
  displayName: text("display_name").notNull(),
  dataSchema: jsonb("data_schema").notNull(),
  configSchema: jsonb("config_schema").notNull(),
  outputSchema: jsonb("output_schema").notNull(),
  // ... other fields
});
```

### Bundle Definitions (server/bundleDefinitions.ts)
All bundles are defined in `BUNDLE_DEFINITIONS` array and seeded on startup via `seedBundles()`.

## UI Integration

### Workbench Display
The `/workbench` page displays all three schemas for each bundle:
- **Data Schema** - Shows required data structure
- **Config Schema** - Shows configuration options  
- **Output Schema** - Shows output format
- **Example Data** - Demonstrates valid data
- **Example Config** - Shows sample configuration
- **Preview** - Renders chart with example data

### Test Selectors
- `data-testid="bundle-data-schema"` - Data schema display
- `data-testid="bundle-config-schema"` - Config schema display
- `data-testid="bundle-output-schema"` - Output schema display

## Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Navigate to http://localhost:5000/api/bundles
3. Verify response includes all bundles with dataSchema, configSchema, and outputSchema

### API Testing
```bash
# Test bundle list
curl http://localhost:5000/api/bundles | jq '.[0] | {key, dataSchema, configSchema, outputSchema}'

# Test specific bundle by key
curl http://localhost:5000/api/bundles/key/confidence_band | jq '{dataSchema, configSchema, outputSchema}'
```

### UI Testing
1. Navigate to http://localhost:5000/workbench
2. Expand "Card Bundles" section
3. Click on any bundle
4. Verify all three schemas are displayed

## Compliance

✅ **Phase 1 Requirement**: Expose bundle discovery API  
✅ **JSON Schema Contracts**: All schemas included  
✅ **Spoke App Integration**: Ready for consumption  
✅ **Documentation**: Complete with examples  

## Next Steps

For Spoke apps consuming this API:
1. Implement periodic polling or webhook for bundle updates
2. Cache bundle schemas locally for performance
3. Use schemas for runtime validation
4. Generate TypeScript types from schemas
5. Build dynamic UI based on configSchema properties

## Support

For issues or questions:
- Check bundle definitions in `server/bundleDefinitions.ts`
- Review schema structure in `shared/schema.ts`
- Test via workbench UI at `/workbench`
