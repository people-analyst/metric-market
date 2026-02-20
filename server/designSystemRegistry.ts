const APP_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
    : "https://metric-market.replit.app";

export interface DesignSystemComponent {
  name: string;
  displayName: string;
  category: "data-display" | "layout" | "feedback" | "navigation" | "utility";
  description: string;
  propsSchema: Record<string, any>;
  dataInterface?: string;
  dependencies: string[];
  usage: string;
  variants?: Record<string, string>;
}

export interface DesignSystemSpec {
  name: string;
  version: string;
  sourceApp: string;
  sourceSlug: string;
  description: string;
  repositoryPath: string;
  apiEndpoint: string;
  lastUpdated: string;
  styleTokens: {
    colors: Record<string, any>;
    spacing: Record<string, string>;
    typography: Record<string, string>;
    borders: Record<string, string>;
    classification: Record<string, { bg: string; text: string; darkBg: string; darkText: string }>;
    status: Record<string, string>;
    trends: Record<string, { normal: string; inverted: string }>;
  };
  unitTypes: {
    supported: string[];
    formatRules: Record<string, string>;
  };
  components: DesignSystemComponent[];
  dataContracts: {
    TrendDelta: Record<string, any>;
    MetricTickerData: Record<string, any>;
    MetricCardData: Record<string, any>;
    IndexGaugeData: Record<string, any>;
    AlertRowData: Record<string, any>;
    SectionHeaderMeta: Record<string, any>;
    OutputCardData: Record<string, any>;
    WorkflowStep: Record<string, any>;
    StatusLevel: Record<string, any>;
  };
  spokeConsumptionGuide: string;
  hubBroadcastPayload: Record<string, any>;
}

const COMPONENTS: DesignSystemComponent[] = [
  {
    name: "MetricTicker",
    displayName: "Metric Ticker",
    category: "data-display",
    description: "Compact inline metric display with label, formatted value, trend indicator, sparkline, and optional classification badge. Designed for dense metric strips and ticker rows.",
    propsSchema: {
      type: "object",
      required: ["metric"],
      properties: {
        metric: { $ref: "#/dataContracts/MetricTickerData" },
        showClassification: { type: "boolean", default: true },
        showSparkline: { type: "boolean", default: true },
        invertTrend: { type: "boolean", default: false },
        onClick: { type: "function", description: "Optional click handler" },
        className: { type: "string", default: "" },
      },
    },
    dataInterface: "MetricTickerData",
    dependencies: ["MiniSparkline", "TrendIndicator", "formatMetricValue"],
    usage: `<MetricTicker metric={{ key: "hc", label: "Headcount", value: 12847, unitType: "count", delta: { value: 72, percent: 0.56, direction: "up" } }} />`,
    variants: { compact: "showClassification={false} showSparkline={false}", full: "default — shows all elements" },
  },
  {
    name: "MetricCard",
    displayName: "Metric Card",
    category: "data-display",
    description: "Expandable metric card with trend icon, formatted value, sparkline, classification, and expandable detail section showing description, tags, confidence, and data quality. Used in metric grids and detail panels.",
    propsSchema: {
      type: "object",
      required: ["metric"],
      properties: {
        metric: { $ref: "#/dataContracts/MetricCardData" },
        expandable: { type: "boolean", default: true },
        invertTrend: { type: "boolean", default: false },
        className: { type: "string", default: "" },
      },
    },
    dataInterface: "MetricCardData",
    dependencies: ["MiniSparkline", "TrendIndicator", "TrendIcon", "formatMetricValue"],
    usage: `<MetricCard metric={{ key: "turn", label: "Turnover Rate", value: 14.2, unitType: "percent", delta: { value: -1.6, percent: -1.13, direction: "down" }, description: "Voluntary separation rate" }} />`,
  },
  {
    name: "MetricGrid",
    displayName: "Metric Grid",
    category: "layout",
    description: "Responsive grid layout for MetricTicker or MetricCard components. Supports configurable columns (1-4), max visible items with 'show more' count, and per-metric click handlers.",
    propsSchema: {
      type: "object",
      required: ["metrics"],
      properties: {
        metrics: { type: "array", items: { oneOf: [{ $ref: "#/dataContracts/MetricTickerData" }, { $ref: "#/dataContracts/MetricCardData" }] } },
        variant: { type: "string", enum: ["ticker", "card"], default: "ticker" },
        columns: { type: "number", enum: [1, 2, 3, 4], default: 2 },
        maxVisible: { type: "number", description: "Limit visible items; remainder shown as '+N more'" },
        showMore: { type: "boolean", default: true },
        invertTrend: { type: "boolean", default: false },
        onMetricClick: { type: "function", description: "Callback with metric key" },
        className: { type: "string", default: "" },
      },
    },
    dependencies: ["MetricTicker", "MetricCard"],
    usage: `<MetricGrid metrics={metricsArray} variant="card" columns={3} maxVisible={6} />`,
  },
  {
    name: "TrendIndicator",
    displayName: "Trend Indicator",
    category: "data-display",
    description: "Directional trend display with arrow icon, percentage change, and optional absolute value. Color-coded: emerald for positive, red for negative, muted for flat. Supports inverted coloring for metrics where down is good (e.g., turnover).",
    propsSchema: {
      type: "object",
      required: ["delta"],
      properties: {
        delta: { $ref: "#/dataContracts/TrendDelta" },
        size: { type: "string", enum: ["sm", "md"], default: "sm" },
        invertColor: { type: "boolean", default: false },
        showPercent: { type: "boolean", default: true },
        showValue: { type: "boolean", default: false },
      },
    },
    dataInterface: "TrendDelta",
    dependencies: [],
    usage: `<TrendIndicator delta={{ value: 72, percent: 0.56, direction: "up" }} />`,
    variants: { sm: "Compact — text-xs, 12px icons", md: "Standard — text-sm, 14px icons" },
  },
  {
    name: "TrendIcon",
    displayName: "Trend Icon",
    category: "data-display",
    description: "Standalone directional arrow icon (ArrowUpRight, ArrowDownRight, or Minus) with trend-appropriate coloring.",
    propsSchema: {
      type: "object",
      required: ["direction"],
      properties: {
        direction: { type: "string", enum: ["up", "down", "flat"] },
        className: { type: "string" },
      },
    },
    dependencies: [],
    usage: `<TrendIcon direction="up" className="h-4 w-4" />`,
  },
  {
    name: "SectionHeader",
    displayName: "Section Header",
    category: "layout",
    description: "Standardized section header with icon, label, metric count badge, optional alert count badge, and action slot. Used to introduce data sections consistently across all pages.",
    propsSchema: {
      type: "object",
      required: ["section"],
      properties: {
        section: { $ref: "#/dataContracts/SectionHeaderMeta" },
        actions: { type: "ReactNode", description: "Right-aligned action buttons or controls" },
        className: { type: "string", default: "" },
      },
    },
    dataInterface: "SectionHeaderMeta",
    dependencies: [],
    usage: `<SectionHeader section={{ id: "metrics", label: "Key Metrics", icon: BarChart3, color: "text-primary", metricCount: 12 }} />`,
  },
  {
    name: "OutputCard",
    displayName: "Output Card",
    category: "data-display",
    description: "General-purpose result card with title, subtitle, description, status badge, tags, metadata key-value pairs, timestamp, and icon. Used in search results, export listings, and component registries.",
    propsSchema: {
      type: "object",
      required: ["item"],
      properties: {
        item: { $ref: "#/dataContracts/OutputCardData" },
        compact: { type: "boolean", default: false },
        className: { type: "string" },
      },
    },
    dataInterface: "OutputCardData",
    dependencies: [],
    usage: `<OutputCard item={{ id: "rb", title: "Range Builder", description: "Interactive compensation range simulator", status: "Control", tags: ["conductor", "anycomp"] }} />`,
  },
  {
    name: "ResultsGrid",
    displayName: "Results Grid",
    category: "layout",
    description: "Paginated, searchable, filterable grid of OutputCards. Includes built-in search input, tag filter chips, sort controls, pagination, and empty state. Handles full results lifecycle.",
    propsSchema: {
      type: "object",
      required: ["items"],
      properties: {
        items: { type: "array", items: { $ref: "#/dataContracts/OutputCardData" } },
        searchValue: { type: "string" },
        onSearchChange: { type: "function" },
        activeTags: { type: "array", items: { type: "string" } },
        onTagToggle: { type: "function" },
        availableTags: { type: "array", items: { type: "string" } },
        pageSize: { type: "number", default: 12 },
        columns: { type: "number", enum: [1, 2, 3], default: 2 },
        className: { type: "string" },
      },
    },
    dependencies: ["OutputCard", "ResultsFilters"],
    usage: `<ResultsGrid items={results} searchValue={search} onSearchChange={setSearch} columns={2} pageSize={10} />`,
  },
  {
    name: "ResultsFilters",
    displayName: "Results Filters",
    category: "layout",
    description: "Standalone filter bar with search input, tag chips, and result count. Can be used independently from ResultsGrid for custom layouts.",
    propsSchema: {
      type: "object",
      required: ["searchValue", "onSearchChange"],
      properties: {
        searchValue: { type: "string" },
        onSearchChange: { type: "function" },
        activeTags: { type: "array", items: { type: "string" } },
        onTagToggle: { type: "function" },
        availableTags: { type: "array", items: { type: "string" } },
        resultCount: { type: "number" },
        className: { type: "string" },
      },
    },
    dependencies: [],
    usage: `<ResultsFilters searchValue={q} onSearchChange={setQ} availableTags={["comp", "equity"]} activeTags={active} onTagToggle={toggle} resultCount={42} />`,
  },
  {
    name: "IndexGauge",
    displayName: "Index Gauge",
    category: "data-display",
    description: "Circular SVG gauge for 0-100 index scores with animated ring, delta indicator, and optional sparkline. Pre-configured for Ecosystem Health Index (EHI), Ecosystem Risk Index (ERI), and Cross-App Anomaly Index (CAAI).",
    propsSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: { $ref: "#/dataContracts/IndexGaugeData" },
        size: { type: "string", enum: ["sm", "md"], default: "md" },
        className: { type: "string", default: "" },
      },
    },
    dataInterface: "IndexGaugeData",
    dependencies: ["MiniSparkline"],
    usage: `<IndexGauge data={{ key: "ecosystem_health_index", value: 87, label: "Ecosystem Health", delta: 2.3 }} />`,
  },
  {
    name: "AlertRow",
    displayName: "Alert Row",
    category: "feedback",
    description: "Compact alert display for metrics in Alert or Critical classification. Shows warning icon, label, classification badge, formatted value with trend delta, and sparkline.",
    propsSchema: {
      type: "object",
      required: ["alert"],
      properties: {
        alert: { $ref: "#/dataContracts/AlertRowData" },
        className: { type: "string", default: "" },
      },
    },
    dataInterface: "AlertRowData",
    dependencies: ["MiniSparkline", "formatMetricValue"],
    usage: `<AlertRow alert={{ key: "turn_rate", label: "Turnover Rate", value: 18.5, unitType: "percent", classification: "Alert" }} />`,
  },
  {
    name: "StatusDot",
    displayName: "Status Dot",
    category: "feedback",
    description: "Color-coded status indicator dot with optional label and pulse animation. Supports five status levels: healthy (green), degraded (amber), critical (red), offline (gray), unknown (dim gray).",
    propsSchema: {
      type: "object",
      required: ["status"],
      properties: {
        status: { type: "string", enum: ["healthy", "degraded", "critical", "offline", "unknown"] },
        size: { type: "string", enum: ["sm", "md"], default: "sm" },
        showLabel: { type: "boolean", default: false },
        pulse: { type: "boolean", default: false },
        className: { type: "string" },
      },
    },
    dependencies: [],
    usage: `<StatusDot status="healthy" showLabel pulse />`,
    variants: { sm: "8px dot", md: "10px dot" },
  },
  {
    name: "MiniSparkline",
    displayName: "Mini Sparkline",
    category: "data-display",
    description: "Tiny inline SVG sparkline for embedding in tickers, cards, and alert rows. Renders a simple polyline from an array of numbers.",
    propsSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: { type: "array", items: { type: "number" } },
        width: { type: "number", default: 48 },
        height: { type: "number", default: 16 },
        className: { type: "string" },
      },
    },
    dependencies: [],
    usage: `<MiniSparkline data={[10, 12, 9, 14, 13, 15]} width={60} height={20} />`,
  },
  {
    name: "WorkflowSteps",
    displayName: "Workflow Steps",
    category: "navigation",
    description: "Horizontal or vertical step indicator for multi-step workflows. Each step has a status (complete, active, pending, skipped, error) with color-coded dots and connecting lines.",
    propsSchema: {
      type: "object",
      required: ["steps"],
      properties: {
        steps: { type: "array", items: { $ref: "#/dataContracts/WorkflowStep" } },
        compact: { type: "boolean", default: false },
        size: { type: "string", enum: ["sm", "md"], default: "md" },
        className: { type: "string" },
      },
    },
    dataInterface: "WorkflowStep",
    dependencies: [],
    usage: `<WorkflowSteps steps={[{ label: "Define", status: "complete" }, { label: "Configure", status: "active" }, { label: "Deploy", status: "pending" }]} />`,
  },
  {
    name: "formatMetricValue",
    displayName: "Format Metric Value",
    category: "utility",
    description: "Pure function that formats numeric values by unit type. Returns formatted string: currency ($1,234), percent (12.3%), count (12.8k), ratio (0.72), score (3.8), days (38d), custom (with unitLabel).",
    propsSchema: {
      type: "function",
      parameters: {
        value: { type: "number | null" },
        unitType: { type: "string", enum: ["percent", "currency", "count", "ratio", "score", "days", "custom"] },
        unitLabel: { type: "string | null", description: "Custom unit suffix for unitType='custom'" },
      },
      returns: { type: "string" },
    },
    dependencies: [],
    usage: `formatMetricValue(97240, "currency") // "$97,240"\nformatMetricValue(14.2, "percent") // "14.2%"\nformatMetricValue(12847, "count") // "12.8k"`,
  },
];

const DATA_CONTRACTS = {
  TrendDelta: {
    type: "object",
    description: "Directional change descriptor for metric values",
    required: ["direction"],
    properties: {
      value: { type: ["number", "null"], description: "Absolute change amount" },
      percent: { type: ["number", "null"], description: "Percentage change (actual % change = change/value * 100)" },
      direction: { type: "string", enum: ["up", "down", "flat"], description: "Direction of change" },
    },
  },
  MetricTickerData: {
    type: "object",
    description: "Data contract for MetricTicker component — compact inline metric display",
    required: ["key", "label", "value", "unitType"],
    properties: {
      key: { type: "string", description: "Unique metric identifier" },
      label: { type: "string", description: "Human-readable metric name" },
      value: { type: ["number", "null"], description: "Current metric value" },
      unitType: { type: "string", enum: ["percent", "currency", "count", "ratio", "score", "days", "custom"], description: "Determines formatting via formatMetricValue" },
      unitLabel: { type: ["string", "null"], description: "Custom unit suffix when unitType='custom'" },
      delta: { $ref: "#/TrendDelta", description: "Optional trend change data" },
      sparkline: { type: ["array", "null"], items: { type: "number" }, description: "Historical values for sparkline rendering" },
      classification: { type: "string", enum: ["Normal", "Watch", "Alert", "Critical"], description: "Health classification for badge styling" },
      confidence: { type: "number", description: "0-1 confidence score for data quality" },
    },
  },
  MetricCardData: {
    type: "object",
    description: "Extended metric data for MetricCard — includes all MetricTickerData fields plus detail fields",
    allOf: [{ $ref: "#/MetricTickerData" }],
    properties: {
      description: { type: ["string", "null"], description: "Metric description shown on expand" },
      domain: { type: "string", description: "Business domain (e.g., 'Compensation', 'Talent')" },
      category: { type: "string", description: "Metric category for grouping" },
      sampleSize: { type: ["number", "null"], description: "Number of data points" },
      dataQualityScore: { type: ["number", "null"], description: "0-100 data quality indicator" },
      reasons: { type: ["array", "null"], items: { type: "string" }, description: "Contributing factors or explanations" },
      tags: { type: ["array", "null"], items: { type: "string" }, description: "Categorization tags" },
    },
  },
  IndexGaugeData: {
    type: "object",
    description: "Data contract for IndexGauge — circular 0-100 gauge display",
    required: ["key", "value", "label"],
    properties: {
      key: { type: "string", description: "Gauge identifier (e.g., 'ecosystem_health_index')" },
      value: { type: "number", description: "Current index value (0-100)" },
      label: { type: "string", description: "Display label" },
      delta: { type: ["number", "null"], description: "Change from previous period" },
      sparkline: { type: ["array", "null"], items: { type: "number" }, description: "Historical values" },
    },
  },
  AlertRowData: {
    type: "object",
    description: "Data contract for AlertRow — compact metric alert display",
    required: ["key", "label", "value", "unitType", "classification"],
    properties: {
      key: { type: "string", description: "Alert identifier" },
      label: { type: "string", description: "Metric label" },
      value: { type: ["number", "null"], description: "Current value" },
      unitType: { type: "string", description: "Unit type for formatting" },
      classification: { type: "string", enum: ["Alert", "Critical"], description: "Severity level" },
      delta: { $ref: "#/TrendDelta" },
      sparkline: { type: ["array", "null"], items: { type: "number" } },
    },
  },
  SectionHeaderMeta: {
    type: "object",
    description: "Data contract for SectionHeader — section title with icon and counts",
    required: ["id", "label", "icon", "color", "metricCount"],
    properties: {
      id: { type: "string", description: "Section identifier for data-testid" },
      label: { type: "string", description: "Section title" },
      icon: { type: "ReactElementType", description: "Lucide icon component (e.g., BarChart3, Activity)" },
      color: { type: "string", description: "Tailwind text color class for icon (e.g., 'text-primary')" },
      metricCount: { type: "number", description: "Count displayed in badge" },
      alertCount: { type: "number", description: "Optional alert count for secondary badge" },
    },
  },
  OutputCardData: {
    type: "object",
    description: "Data contract for OutputCard — general-purpose result card",
    required: ["id", "title"],
    properties: {
      id: { type: ["string", "number"], description: "Unique identifier" },
      title: { type: "string", description: "Card title" },
      subtitle: { type: ["string", "null"], description: "Secondary title line" },
      description: { type: ["string", "null"], description: "Body text" },
      status: { type: ["string", "null"], description: "Status badge text" },
      statusVariant: { type: "string", enum: ["default", "secondary", "outline", "destructive"], description: "Badge variant" },
      tags: { type: "array", items: { type: "string" }, description: "Tag chips" },
      metadata: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } }, description: "Key-value metadata pairs" },
      timestamp: { type: ["string", "Date", "null"], description: "ISO timestamp for 'time ago' display" },
      icon: { type: "ReactElementType", description: "Lucide icon component" },
      onClick: { type: "function", description: "Click handler" },
    },
  },
  WorkflowStep: {
    type: "object",
    description: "Data contract for WorkflowSteps — individual step definition",
    required: ["label", "status"],
    properties: {
      id: { type: "string", description: "Optional step identifier" },
      label: { type: "string", description: "Step label" },
      status: { type: "string", enum: ["complete", "active", "pending", "skipped", "error"], description: "Current step state" },
      icon: { type: "ReactElementType", description: "Optional custom icon" },
    },
  },
  StatusLevel: {
    type: "string",
    enum: ["healthy", "degraded", "critical", "offline", "unknown"],
    description: "System/component health status levels used by StatusDot",
  },
};

const STYLE_TOKENS = {
  colors: {
    brand: {
      primary: "#0f69ff",
      primaryLight: "#e0f0ff",
      foreground: "#232a31",
      muted: "#5b636a",
      border: "#e0e4e9",
      description: "Yahoo Finance-inspired palette — used across all PA Toolbox apps for visual consistency",
    },
    classification: {
      Normal: { bg: "emerald-100", text: "emerald-800", darkBg: "emerald-900/30", darkText: "emerald-400" },
      Watch: { bg: "amber-100", text: "amber-800", darkBg: "amber-900/30", darkText: "amber-400" },
      Alert: { bg: "orange-100", text: "orange-800", darkBg: "orange-900/30", darkText: "orange-400" },
      Critical: { bg: "red-100", text: "red-800", darkBg: "red-900/30", darkText: "red-400" },
    },
    trends: {
      up: { normal: "emerald-600 / emerald-400 (dark)", inverted: "red-600 / red-400 (dark)" },
      down: { normal: "red-600 / red-400 (dark)", inverted: "emerald-600 / emerald-400 (dark)" },
      flat: { normal: "muted-foreground", inverted: "muted-foreground" },
    },
    status: {
      healthy: "emerald-500",
      degraded: "amber-500",
      critical: "red-500",
      offline: "muted-foreground",
      unknown: "muted-foreground/50",
    },
  },
  spacing: {
    compact: "gap-1, gap-1.5, p-2 — used in tickers, cards, dense grids",
    standard: "gap-2, gap-3, p-3, p-4 — used in sections, panels",
    relaxed: "gap-4, gap-6, p-6 — used in page-level layout, hero areas",
    principle: "Compact, minimal spacing aesthetic throughout. rounded-[3px] on custom elements, rounded-md on shadcn components.",
  },
  typography: {
    metricLabels: "text-xs font-medium truncate",
    metricValues: "text-sm font-semibold tabular-nums",
    sectionHeaders: "text-sm font-medium",
    bodyText: "text-xs text-muted-foreground",
    trendValues: "text-xs tabular-nums",
    principle: "Small, dense type hierarchy. Labels are xs, values are sm semibold, headers are sm medium.",
  },
  borders: {
    cards: "border border-border/50 rounded-md",
    sections: "border-b border-border",
    principle: "Subtle, low-opacity borders. /50 opacity on card borders. No heavy outlines.",
  },
};

const SPOKE_CONSUMPTION_GUIDE = `# PA Design Kit — Spoke Consumption Guide

## Overview

The PA Design Kit is the shared UI component library for all People Analytics Toolbox applications. It is authored and maintained in Metric Market (App #13) and distributed via a machine-readable specification API that any spoke app can consume.

## Discovery

### Step 1: Fetch the Design System Specification
\`\`\`bash
GET ${APP_URL}/api/design-system
Accept: application/json
\`\`\`

Returns the full specification including all component definitions, data contracts, style tokens, and usage examples.

### Step 2: Fetch Individual Component Details
\`\`\`bash
GET ${APP_URL}/api/design-system/MetricTicker
GET ${APP_URL}/api/design-system/MetricCard
GET ${APP_URL}/api/design-system/OutputCard
\`\`\`

Returns focused component spec with props schema, data interface, dependencies, and usage example.

## Implementation Approaches

### Approach A: Copy Component Source (Recommended for v1)
1. Fetch the design system spec from \`GET /api/design-system\`
2. Copy the PA Design Kit component source files into your spoke app's \`components/pa-design-kit/\` directory
3. Ensure your spoke uses the same base dependencies: React 18, Tailwind CSS 3, shadcn/ui, lucide-react
4. Import and use components following the data contracts specified in the spec

### Approach B: Shared NPM Package (Future)
Once the PA Design Kit stabilizes (v2.0+), it will be published as \`@pa-toolbox/design-kit\` on the PA Toolbox internal registry. Spoke apps will install it as a dependency and receive updates automatically.

### Approach C: Hub-Mediated Sync (AI Agent Workflow)
AI agents building spoke apps can:
1. Query the Hub for the design system spec via \`GET /api/specifications\` (includes \`designSystem\` metadata)
2. Fetch the full PA Design Kit spec from Metric Market's \`GET /api/design-system\`
3. Generate conforming components in the target spoke app using the data contracts and style tokens

## Style Compliance Checklist

When implementing PA Design Kit components in a spoke app, verify:

- [ ] Brand colors match: primary (#0f69ff), primaryLight (#e0f0ff), foreground (#232a31)
- [ ] Classification badges use the standard 4-tier color scheme (Normal/Watch/Alert/Critical)
- [ ] Trend indicators use emerald for positive, red for negative
- [ ] Unit types are formatted via \`formatMetricValue()\` with standard rules
- [ ] Spacing follows compact aesthetic: gap-1.5 in cards, gap-2 between sections
- [ ] Typography uses text-xs for labels, text-sm font-semibold for values
- [ ] Borders use /50 opacity on card containers
- [ ] Dark mode uses paired light/dark color tokens (e.g., emerald-100 / emerald-900/30)
- [ ] data-testid attributes follow naming convention: \`{component}-{key}\`

## Version Compatibility

| PA Design Kit Version | Required React | Required Tailwind | shadcn/ui |
|---|---|---|---|
| 1.1.0 (current) | 18.x | 3.x | Latest |
| 2.0.0 (planned) | 18.x+ | 3.x or 4.x | Latest |

## Data Contract Validation

All components accept data conforming to JSON Schema contracts. Spoke apps should validate their data payloads against these schemas before rendering to ensure consistent behavior:

\`\`\`typescript
// Example: Validate MetricTickerData before rendering
const isValid = (data: unknown): data is MetricTickerData => {
  return typeof data === 'object' && data !== null
    && 'key' in data && 'label' in data
    && 'value' in data && 'unitType' in data;
};
\`\`\`

## Hub Broadcast

When the design system is updated, a Hub directive is broadcast to all spokes:

\`\`\`json
{
  "type": "design_system_update",
  "source": "metric-market",
  "version": "1.1.0",
  "specEndpoint": "${APP_URL}/api/design-system",
  "changelog": "Added WorkflowSteps component, updated MetricCard expand behavior",
  "action": "fetch_updated_spec"
}
\`\`\`

Spoke apps that implement the Hub SDK webhook handler (\`POST /api/hub-webhook\`) will receive this directive automatically and can trigger a spec re-fetch.
`;

const HUB_BROADCAST_PAYLOAD = {
  type: "design_system_update",
  source: "metric-market",
  sourceSlug: "metric-market",
  version: "1.1.0",
  specEndpoint: `${APP_URL}/api/design-system`,
  componentCount: COMPONENTS.length,
  dataContractCount: Object.keys(DATA_CONTRACTS).length,
  categories: ["data-display", "layout", "feedback", "navigation", "utility"],
  action: "fetch_updated_spec",
  description: "PA Design Kit v1.1.0 — 15 shared UI components for consistent People Analytics Toolbox interfaces. Includes MetricTicker, MetricCard, MetricGrid, TrendIndicator, SectionHeader, OutputCard, ResultsGrid, IndexGauge, AlertRow, StatusDot, MiniSparkline, WorkflowSteps, and formatMetricValue utility.",
};

export function getDesignSystemSpec(): DesignSystemSpec {
  return {
    name: "PA Design Kit",
    version: "1.1.0",
    sourceApp: "Metric Market",
    sourceSlug: "metric-market",
    description: "Shared UI component library for the People Analytics Toolbox ecosystem. Provides 15 standardized components for consistent metric display, trend visualization, status indication, and layout patterns across all 14 spoke applications.",
    repositoryPath: "client/src/components/pa-design-kit/",
    apiEndpoint: `${APP_URL}/api/design-system`,
    lastUpdated: new Date().toISOString().split("T")[0],
    styleTokens: STYLE_TOKENS as any,
    unitTypes: {
      supported: ["percent", "currency", "count", "ratio", "score", "days", "custom"],
      formatRules: {
        percent: "value.toFixed(1) + '%' → '14.2%'",
        currency: "'$' + value.toLocaleString() → '$97,240'",
        count: "value >= 10k: (value/1000).toFixed(1) + 'k' → '12.8k', else: toLocaleString()",
        ratio: "value.toFixed(2) → '0.72'",
        score: "value.toFixed(1) → '3.8'",
        days: "value.toFixed(0) + 'd' → '38d'",
        custom: "value.toFixed(1) + ' ' + unitLabel → '2.3 FTE'",
      },
    },
    components: COMPONENTS,
    dataContracts: DATA_CONTRACTS as any,
    spokeConsumptionGuide: SPOKE_CONSUMPTION_GUIDE,
    hubBroadcastPayload: HUB_BROADCAST_PAYLOAD,
  };
}

export function getDesignSystemComponent(name: string): DesignSystemComponent | null {
  return COMPONENTS.find((c) => c.name === name || c.name.toLowerCase() === name.toLowerCase()) || null;
}
