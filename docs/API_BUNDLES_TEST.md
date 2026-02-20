# Bundle Discovery API Test Documentation

## Endpoint: GET /api/bundles

### Purpose
Returns all available card bundle schemas for Spoke apps to discover chart types and their contracts.

### Response Structure
Each bundle in the response includes:
- `id`: Unique identifier
- `key`: Machine-readable key (e.g., "confidence_band")
- `chartType`: Chart type identifier
- `displayName`: Human-readable name
- `description`: Bundle description
- `version`: Schema version number
- `category`: Category grouping
- `tags`: Array of searchable tags
- **`dataSchema`**: JSON Schema defining required data structure
- **`configSchema`**: JSON Schema defining configuration options
- **`outputSchema`**: JSON Schema defining output format
- `defaults`: Default configuration values
- `exampleData`: Sample data for testing
- `exampleConfig`: Sample configuration
- `documentation`: Usage documentation
- `infrastructureNotes`: Technical requirements
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Example Request
```bash
curl http://localhost:5000/api/bundles
```

### Example Response (abbreviated)
```json
[
  {
    "id": "uuid-here",
    "key": "confidence_band",
    "chartType": "confidence_band",
    "displayName": "Confidence Band Chart",
    "description": "Line chart with forecast confidence/uncertainty bands...",
    "version": 1,
    "category": "Forecasting",
    "tags": ["forecast", "uncertainty", "prediction", "time-series"],
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
              "x": { "type": "number", "description": "X-axis position" },
              "y": { "type": "number", "description": "Central value" },
              "lo1": { "type": "number", "description": "Inner band lower bound" },
              "hi1": { "type": "number", "description": "Inner band upper bound" },
              "lo2": { "type": "number", "description": "Outer band lower bound" },
              "hi2": { "type": "number", "description": "Outer band upper bound" }
            }
          }
        }
      }
    },
    "configSchema": {
      "type": "object",
      "properties": {
        "lineColor": { "type": "string", "description": "Color of the central line" },
        "bandColors": { "type": "array", "items": { "type": "string" }, "minItems": 2, "maxItems": 2 },
        "xLabel": { "type": "string", "description": "X-axis label" },
        "yLabel": { "type": "string", "description": "Y-axis label" },
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
    "exampleData": {
      "data": [
        { "x": 0, "y": 50, "lo1": 45, "hi1": 55, "lo2": 40, "hi2": 60 },
        { "x": 1, "y": 55, "lo1": 48, "hi1": 62, "lo2": 42, "hi2": 68 }
      ]
    },
    "exampleConfig": {
      "xLabel": "Quarter",
      "yLabel": "Attrition Rate (%)"
    },
    "documentation": "Use for metric forecasting with uncertainty...",
    "infrastructureNotes": "Requires D3.js for rendering...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Related Endpoints
- `GET /api/bundles/:id` - Get specific bundle by ID
- `GET /api/bundles/key/:key` - Get specific bundle by key

### Testing
The endpoint can be tested via:
1. Browser: Navigate to http://localhost:5000/api/bundles
2. Frontend: Visit `/workbench` page and expand "Card Bundles" section
3. curl: `curl http://localhost:5000/api/bundles | jq`

### Schema Validation
All three schemas (dataSchema, configSchema, outputSchema) are returned as JSON Schema objects that can be used for:
- Client-side validation before submission
- API documentation generation
- Type inference for TypeScript/other languages
- Runtime data validation

### Status
✅ **IMPLEMENTED** - Endpoint is live and returning all bundle schemas with dataSchema, configSchema, and outputSchema.
