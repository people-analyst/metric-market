import type { InsertCardBundle } from "@shared/schema";

export const BUNDLE_DEFINITIONS: InsertCardBundle[] = [
  {
    key: "confidence_band",
    chartType: "confidence_band",
    displayName: "Confidence Band Chart",
    description: "Line chart with forecast confidence/uncertainty bands. Shows a central trend line with inner and outer prediction intervals.",
    version: 1,
    category: "Forecasting",
    tags: ["forecast", "uncertainty", "prediction", "time-series"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["x", "y"],
            properties: {
              x: { type: "number", description: "X-axis position (e.g. month index, year)" },
              y: { type: "number", description: "Central value" },
              lo1: { type: "number", description: "Inner band lower bound" },
              hi1: { type: "number", description: "Inner band upper bound" },
              lo2: { type: "number", description: "Outer band lower bound" },
              hi2: { type: "number", description: "Outer band upper bound" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        lineColor: { type: "string", description: "Color of the central line" },
        bandColors: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2, description: "[innerBandColor, outerBandColor]" },
        xLabel: { type: "string", description: "X-axis label" },
        yLabel: { type: "string", description: "Y-axis label" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG chart with confidence bands" },
    defaults: { lineColor: "#5b636a", bandColors: ["#a3adb8", "#e0e4e9"] },
    exampleData: {
      data: [
        { x: 0, y: 50, lo1: 45, hi1: 55, lo2: 40, hi2: 60 },
        { x: 1, y: 55, lo1: 48, hi1: 62, lo2: 42, hi2: 68 },
        { x: 2, y: 58, lo1: 49, hi1: 67, lo2: 43, hi2: 73 },
        { x: 3, y: 62, lo1: 50, hi1: 74, lo2: 44, hi2: 80 },
      ],
    },
    exampleConfig: { xLabel: "Quarter", yLabel: "Attrition Rate (%)" },
    documentation: "Use for metric forecasting with uncertainty. Supply actual + predicted values with confidence intervals. Inner band (lo1/hi1) typically represents 1-sigma, outer band (lo2/hi2) represents 2-sigma. AI agents: POST data with x as time index, y as forecast center, and band bounds.",
    infrastructureNotes: "Requires D3.js for rendering. Data payloads pushed via POST /api/cards/:id/data.",
  },
  {
    key: "alluvial",
    chartType: "alluvial",
    displayName: "Alluvial / Flow Chart",
    description: "Flow/Sankey diagram showing how categories redistribute between two time periods or states.",
    version: 1,
    category: "Flow & Movement",
    tags: ["flow", "sankey", "movement", "redistribution", "transitions"],
    dataSchema: {
      type: "object",
      required: ["flows"],
      properties: {
        flows: {
          type: "array",
          items: {
            type: "object",
            required: ["from", "to", "value"],
            properties: {
              from: { type: "string", description: "Source category" },
              to: { type: "string", description: "Target category" },
              value: { type: "number", description: "Flow magnitude" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        leftLabel: { type: "string", description: "Label for left (source) column" },
        rightLabel: { type: "string", description: "Label for right (target) column" },
        colors: { type: "object", additionalProperties: { type: "string" }, description: "Map of category name to color" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG alluvial diagram" },
    defaults: { leftLabel: "Before", rightLabel: "After" },
    exampleData: {
      flows: [
        { from: "Engineering", to: "Engineering", value: 80 },
        { from: "Engineering", to: "Product", value: 15 },
        { from: "Engineering", to: "Left", value: 5 },
        { from: "Product", to: "Product", value: 60 },
        { from: "Product", to: "Engineering", value: 10 },
      ],
    },
    exampleConfig: { leftLabel: "Q1 2025", rightLabel: "Q1 2026" },
    documentation: "Visualize talent movement, org restructuring, or status transitions. Each flow has a source, target, and magnitude. Colors are auto-assigned by category or can be overridden.",
    infrastructureNotes: "Requires D3.js. No geographic data needed.",
  },
  {
    key: "waffle_bar",
    chartType: "waffle_bar",
    displayName: "Waffle Bar Chart",
    description: "Stacked bars made of countable grid cells showing composition within groups.",
    version: 1,
    category: "Composition",
    tags: ["composition", "breakdown", "proportion", "grid"],
    dataSchema: {
      type: "object",
      required: ["groups"],
      properties: {
        groups: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "segments"],
            properties: {
              label: { type: "string" },
              segments: { type: "array", items: { type: "object", required: ["label", "count"], properties: { label: { type: "string" }, count: { type: "number" }, color: { type: "string" } } } },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        cellSize: { type: "number" },
        cols: { type: "number", description: "Cells per row" },
        defaultColors: { type: "array", items: { type: "string" } },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG waffle bar chart" },
    defaults: { cellSize: 12, cols: 4, defaultColors: ["#0f69ff", "#5b636a", "#a3adb8"] },
    exampleData: {
      groups: [
        { label: "Dept A", segments: [{ label: "Full-time", count: 8 }, { label: "Contract", count: 3 }] },
        { label: "Dept B", segments: [{ label: "Full-time", count: 12 }, { label: "Contract", count: 2 }] },
      ],
    },
    exampleConfig: {},
    documentation: "Shows workforce composition by department or category. Each cell represents one unit. Good for headcount breakdowns where exact counts matter.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "bullet_bar",
    chartType: "bullet_bar",
    displayName: "Bullet Bar Chart",
    description: "Horizontal bars with range backgrounds, value bar, and target marker for goal tracking.",
    version: 1,
    category: "Performance",
    tags: ["target", "goal", "benchmark", "kpi"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "ranges", "value", "marker"],
            properties: {
              label: { type: "string" },
              ranges: { type: "array", items: { type: "number" }, description: "Background range thresholds [poor, satisfactory, good]" },
              value: { type: "number", description: "Actual value" },
              marker: { type: "number", description: "Target/goal marker" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        rangeColors: { type: "array", items: { type: "string" } },
        valueColor: { type: "string" },
        markerColor: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG bullet bar chart" },
    defaults: { rangeColors: ["#e0e4e9", "#a3adb8", "#5b636a"], valueColor: "#5b636a", markerColor: "#232a31" },
    exampleData: {
      data: [
        { label: "Retention", ranges: [60, 80, 100], value: 85, marker: 90 },
        { label: "Engagement", ranges: [40, 70, 100], value: 72, marker: 80 },
      ],
    },
    exampleConfig: {},
    documentation: "Compare actual metric values against targets and qualitative ranges. Ideal for KPI dashboards where you need to show actual vs target vs threshold bands.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "slope_comparison",
    chartType: "slope_comparison",
    displayName: "Slope Comparison Chart",
    description: "Period-over-period growth with filled slope area and percentage change per item.",
    version: 1,
    category: "Comparison",
    tags: ["comparison", "growth", "change", "period-over-period"],
    dataSchema: {
      type: "object",
      required: ["items"],
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "startValue", "endValue"],
            properties: {
              label: { type: "string" },
              startValue: { type: "number" },
              endValue: { type: "number" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        accentColor: { type: "string" },
        startYear: { type: "string" },
        endYear: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG slope comparison chart" },
    defaults: { accentColor: "#0f69ff", startYear: "'20", endYear: "'25" },
    exampleData: {
      items: [
        { label: "Engineering", startValue: 120, endValue: 185 },
        { label: "Sales", startValue: 90, endValue: 75 },
        { label: "Operations", startValue: 60, endValue: 82 },
      ],
    },
    exampleConfig: { startYear: "2024", endYear: "2025" },
    documentation: "Show how metrics changed between two time periods. Each item gets a slope line connecting start to end values with a filled area and computed % change.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "bubble_scatter",
    chartType: "bubble_scatter",
    displayName: "Bubble Scatter Chart",
    description: "Scatter plot with sized/colored bubbles for multi-dimensional comparison.",
    version: 1,
    category: "Distribution",
    tags: ["scatter", "multi-dimensional", "correlation", "bubbles"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["x", "y", "size"],
            properties: {
              x: { type: "number" },
              y: { type: "number" },
              size: { type: "number", description: "Bubble radius multiplier" },
              label: { type: "string" },
              color: { type: "string" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        xLabel: { type: "string" },
        yLabel: { type: "string" },
        maxRadius: { type: "number" },
        defaultColors: { type: "array", items: { type: "string" } },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG bubble scatter chart" },
    defaults: { maxRadius: 22 },
    exampleData: {
      data: [
        { x: 75, y: 85, size: 120, label: "Engineering" },
        { x: 60, y: 90, size: 80, label: "Marketing" },
        { x: 90, y: 70, size: 200, label: "Sales" },
      ],
    },
    exampleConfig: { xLabel: "Engagement Score", yLabel: "Retention Rate %" },
    documentation: "Plot three dimensions: x-axis, y-axis, and bubble size. Each bubble can be labeled and colored. Use for comparing teams/departments across multiple metrics simultaneously.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "box_whisker",
    chartType: "box_whisker",
    displayName: "Box & Whisker Chart",
    description: "Candlestick-style distribution chart showing min, Q1, median, Q3, max spread.",
    version: 1,
    category: "Distribution",
    tags: ["distribution", "statistics", "quartiles", "spread"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "min", "q1", "median", "q3", "max"],
            properties: {
              label: { type: "string" },
              min: { type: "number" },
              q1: { type: "number" },
              median: { type: "number" },
              q3: { type: "number" },
              max: { type: "number" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        boxColor: { type: "string" },
        whiskerColor: { type: "string" },
        medianColor: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG box and whisker chart" },
    defaults: { boxColor: "#0f69ff", whiskerColor: "#232a31", medianColor: "#232a31" },
    exampleData: {
      data: [
        { label: "Dept A", min: 35, q1: 50, median: 65, q3: 80, max: 95 },
        { label: "Dept B", min: 40, q1: 55, median: 70, q3: 82, max: 92 },
      ],
    },
    exampleConfig: {},
    documentation: "Show statistical distribution of a metric across groups. Each box shows the interquartile range with whiskers extending to min/max. Pre-calculate the 5-number summary before pushing data.",
    infrastructureNotes: "Requires D3.js. Data must be pre-aggregated into min/q1/median/q3/max.",
  },
  {
    key: "strip_timeline",
    chartType: "strip_timeline",
    displayName: "Strip Timeline Chart",
    description: "Horizontal strip of cells with highlighted colored blocks showing event patterns over time.",
    version: 1,
    category: "Time Series",
    tags: ["timeline", "events", "patterns", "activity"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "cells"],
            properties: {
              label: { type: "string" },
              cells: { type: "array", items: { type: "object", properties: { color: { type: "string" }, label: { type: "string" } } } },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        cellSize: { type: "number" },
        gap: { type: "number" },
        defaultColor: { type: "string" },
        width: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG strip timeline chart" },
    defaults: { cellSize: 14, gap: 2, defaultColor: "#e0e4e9" },
    exampleData: {
      rows: [
        { label: "Jan", cells: [{ color: "#0f69ff" }, {}, { color: "#5b636a" }, {}, {}] },
        { label: "Feb", cells: [{}, { color: "#0f69ff" }, {}, {}, { color: "#0f69ff" }] },
      ],
    },
    exampleConfig: {},
    documentation: "Visualize event occurrence patterns over time periods. Each cell can be empty (default color) or highlighted. Use for showing hiring activity, incident patterns, or training schedules.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "waffle_percent",
    chartType: "waffle_percent",
    displayName: "Waffle Percent Chart",
    description: "Single 10x10 waffle grid showing a percentage as filled cells.",
    version: 1,
    category: "Proportion",
    tags: ["percentage", "proportion", "single-metric"],
    dataSchema: {
      type: "object",
      required: ["percent"],
      properties: {
        percent: { type: "number", minimum: 0, maximum: 100, description: "Percentage to fill (0-100)" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        rows: { type: "number" },
        cols: { type: "number" },
        cellSize: { type: "number" },
        gap: { type: "number" },
        filledColor: { type: "string" },
        emptyColor: { type: "string" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG waffle percentage grid" },
    defaults: { rows: 10, cols: 10, filledColor: "#0f69ff", emptyColor: "#e0e4e9" },
    exampleData: { percent: 73 },
    exampleConfig: {},
    documentation: "Simple single-metric visualization showing a percentage. Each filled cell represents 1%. Great for engagement scores, completion rates, or representation percentages.",
    infrastructureNotes: "Requires D3.js. Simplest data input of all bundles — just one number.",
  },
  {
    key: "heatmap",
    chartType: "heatmap",
    displayName: "Heatmap Chart",
    description: "Color-intensity matrix for cross-dimensional comparison.",
    version: 1,
    category: "Distribution",
    tags: ["matrix", "correlation", "cross-dimensional", "intensity"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: { type: "array", items: { type: "array", items: { type: "number" } }, description: "2D matrix of values [rows][cols]" },
        rowLabels: { type: "array", items: { type: "string" } },
        colLabels: { type: "array", items: { type: "string" } },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        colorRange: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3, description: "[low, mid, high] colors" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG heatmap" },
    defaults: { colorRange: ["#e0e4e9", "#0f69ff", "#232a31"] },
    exampleData: {
      data: [[85, 72, 90], [60, 88, 75], [92, 68, 80]],
      rowLabels: ["Q1", "Q2", "Q3"],
      colLabels: ["Engagement", "Retention", "Performance"],
    },
    exampleConfig: {},
    documentation: "Display a matrix of values with color intensity encoding. Rows and columns represent two dimensions (e.g., departments x metrics). Value determines color from cool to hot.",
    infrastructureNotes: "Requires D3.js. Data is a 2D number array.",
  },
  {
    key: "strip_dot",
    chartType: "strip_dot",
    displayName: "Strip Dot Chart",
    description: "Scattered colored squares across categorical rows for event positioning.",
    version: 1,
    category: "Events",
    tags: ["events", "categorical", "scatter", "activity"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "events"],
            properties: {
              label: { type: "string" },
              events: { type: "array", items: { type: "object", required: ["position"], properties: { position: { type: "number" }, color: { type: "string" }, label: { type: "string" } } } },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        dotSize: { type: "number" },
        defaultColors: { type: "array", items: { type: "string" } },
        width: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG strip dot chart" },
    defaults: { dotSize: 8 },
    exampleData: {
      rows: [
        { label: "Team A", events: [{ position: 10 }, { position: 30 }, { position: 70 }] },
        { label: "Team B", events: [{ position: 20 }, { position: 50 }] },
      ],
    },
    exampleConfig: {},
    documentation: "Show event occurrences along a continuous axis per category. Each row is a category, each dot is an event positioned by its value. Good for incident timelines, tenure distributions.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "multi_line",
    chartType: "multi_line",
    displayName: "Multi-Line Chart",
    description: "Multiple time series lines with optional reference line and legend.",
    version: 1,
    category: "Time Series",
    tags: ["time-series", "trend", "comparison", "multi-metric"],
    dataSchema: {
      type: "object",
      required: ["series"],
      properties: {
        series: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "values"],
            properties: {
              label: { type: "string" },
              values: { type: "array", items: { type: "number" } },
              color: { type: "string" },
            },
          },
        },
        xLabels: { type: "array", items: { type: "string" } },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        referenceLine: { type: "number", description: "Optional horizontal reference line value" },
        defaultColors: { type: "array", items: { type: "string" } },
        yLabel: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG multi-line chart" },
    defaults: {},
    exampleData: {
      series: [
        { label: "Attrition", values: [12, 14, 11, 13, 15, 12] },
        { label: "Hiring", values: [20, 18, 22, 19, 25, 28] },
      ],
      xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    exampleConfig: { yLabel: "Rate (%)" },
    documentation: "Compare multiple metrics over time. Each series is a named line with sequential values. Optional reference line for targets/benchmarks. X-labels align to value indices.",
    infrastructureNotes: "Requires D3.js. Most versatile time-series chart.",
  },
  {
    key: "tile_cartogram",
    chartType: "tile_cartogram",
    displayName: "Tile Cartogram Chart",
    description: "Geographic tile/cartogram map with color-coded squares positioned by row/col grid.",
    version: 1,
    category: "Geographic",
    tags: ["geographic", "map", "regional", "spatial"],
    dataSchema: {
      type: "object",
      required: ["tiles"],
      properties: {
        tiles: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "label", "value", "row", "col"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              value: { type: "number" },
              row: { type: "number" },
              col: { type: "number" },
            },
          },
        },
        sectionLabels: { type: "object", additionalProperties: { type: "string" }, description: "Map of row number to section header label" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        colorRange: { type: "array", items: { type: "string" } },
        tileSize: { type: "number" },
        gap: { type: "number" },
        width: { type: "number" },
        height: { type: "number" },
        preset: { type: "string", description: "Use a geographic preset: us_states, north_america, south_america, emea, apac, regions" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG tile cartogram" },
    defaults: {},
    exampleData: {
      tiles: [
        { id: "CA", label: "CA", value: 85, row: 4, col: 0 },
        { id: "TX", label: "TX", value: 72, row: 6, col: 3 },
        { id: "NY", label: "NY", value: 90, row: 2, col: 9 },
      ],
    },
    exampleConfig: {},
    documentation: "Display metric values geographically using a grid-based tile map. Pre-staged presets available for US states, N. America, S. America, EMEA, APAC, and macro Regions. Use presets or define custom tile positions.",
    infrastructureNotes: "Requires D3.js. Geographic presets in tilePresets.ts.",
  },
  {
    key: "timeline_milestone",
    chartType: "timeline_milestone",
    displayName: "Timeline Milestone Chart",
    description: "Labeled event markers at varying heights along a horizontal time axis.",
    version: 1,
    category: "Events",
    tags: ["milestones", "events", "timeline", "key-dates"],
    dataSchema: {
      type: "object",
      required: ["milestones"],
      properties: {
        milestones: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "position"],
            properties: {
              label: { type: "string" },
              position: { type: "number", description: "Position along the axis (0-100)" },
              height: { type: "number", description: "Visual height of the marker stem" },
              color: { type: "string" },
            },
          },
        },
        xLabels: { type: "array", items: { type: "string" } },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        defaultColors: { type: "array", items: { type: "string" } },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG timeline milestone chart" },
    defaults: {},
    exampleData: {
      milestones: [
        { label: "Kickoff", position: 10, height: 40 },
        { label: "Review", position: 45, height: 60 },
        { label: "Launch", position: 85, height: 50 },
      ],
      xLabels: ["Jan", "Apr", "Jul", "Oct"],
    },
    exampleConfig: {},
    documentation: "Show key events/milestones along a timeline. Heights can vary to indicate importance or stagger labels. Use for project milestones, policy changes, or program launches.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "control",
    chartType: "control",
    displayName: "Control Chart (SPC)",
    description: "Statistical process control chart with UCL/LCL bands and sigma zones.",
    version: 1,
    category: "Quality",
    tags: ["spc", "quality", "control-limits", "process"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: { type: "array", items: { type: "number" }, description: "Sequential observations" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        lineColor: { type: "string" },
        bandColors: { type: "array", items: { type: "string" }, description: "[sigma1Color, sigma2Color, sigma3Color]" },
        xLabel: { type: "string" },
        yLabel: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG control chart with auto-calculated control limits" },
    defaults: {},
    exampleData: { data: [72, 75, 68, 74, 71, 76, 73, 69, 77, 72, 74, 70] },
    exampleConfig: { xLabel: "Month", yLabel: "Score" },
    documentation: "Monitor metric stability with statistical control limits. Automatically calculates mean, UCL, LCL, and sigma zones. Points outside control limits signal process changes. Supply raw sequential observations.",
    infrastructureNotes: "Requires D3.js. Control limits are computed from the data.",
  },
  {
    key: "dendrogram",
    chartType: "dendrogram",
    displayName: "Dendrogram Chart",
    description: "Hierarchical clustering tree with branching structure.",
    version: 1,
    category: "Hierarchy",
    tags: ["hierarchy", "clustering", "tree", "organizational"],
    dataSchema: {
      type: "object",
      required: ["root"],
      properties: {
        root: {
          type: "object",
          required: ["label"],
          properties: {
            label: { type: "string" },
            value: { type: "number" },
            children: { type: "array", description: "Recursive tree nodes" },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        lineColor: { type: "string" },
        labelColor: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG dendrogram" },
    defaults: { lineColor: "#5b636a", labelColor: "#232a31" },
    exampleData: {
      root: {
        label: "Org",
        children: [
          { label: "Engineering", children: [{ label: "Frontend" }, { label: "Backend" }] },
          { label: "Product", children: [{ label: "Design" }, { label: "PM" }] },
        ],
      },
    },
    exampleConfig: {},
    documentation: "Visualize hierarchical structures: org charts, skill taxonomies, cluster analysis results. Recursive tree structure with label and optional value at each node.",
    infrastructureNotes: "Requires D3.js. Recursive data structure.",
  },
  {
    key: "radial_bar",
    chartType: "radial_bar",
    displayName: "Radial Bar Chart",
    description: "Concentric arc bars for proportional comparison with color-coded legend.",
    version: 1,
    category: "Proportion",
    tags: ["proportion", "comparison", "radial", "gauge"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "value"],
            properties: {
              label: { type: "string" },
              value: { type: "number" },
              color: { type: "string" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        maxValue: { type: "number" },
        defaultColors: { type: "array", items: { type: "string" } },
        trackColor: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG radial bar chart" },
    defaults: { defaultColors: ["#0f69ff", "#5b636a", "#232a31", "#a3adb8"], trackColor: "#e0e4e9" },
    exampleData: {
      data: [
        { label: "Engagement", value: 82 },
        { label: "Retention", value: 91 },
        { label: "Satisfaction", value: 76 },
      ],
    },
    exampleConfig: { maxValue: 100 },
    documentation: "Compare proportional values as concentric arcs. Each bar wraps around the center. Legend below identifies each ring by color. Good for comparing 2-5 related percentages.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "bump",
    chartType: "bump",
    displayName: "Bump Chart",
    description: "Rank change visualization with crossing lines and value circles.",
    version: 1,
    category: "Ranking",
    tags: ["ranking", "rank-change", "competition", "position"],
    dataSchema: {
      type: "object",
      required: ["items"],
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "startRank", "endRank", "startValue", "endValue"],
            properties: {
              label: { type: "string" },
              startRank: { type: "number" },
              endRank: { type: "number" },
              startValue: { type: "number" },
              endValue: { type: "number" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        startYear: { type: "string" },
        endYear: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG bump chart" },
    defaults: { startYear: "'24", endYear: "'25" },
    exampleData: {
      items: [
        { label: "Engineering", startRank: 1, endRank: 2, startValue: 92, endValue: 88 },
        { label: "Sales", startRank: 3, endRank: 1, startValue: 78, endValue: 94 },
        { label: "Marketing", startRank: 2, endRank: 3, startValue: 85, endValue: 82 },
      ],
    },
    exampleConfig: {},
    documentation: "Show rank changes between two periods. Lines cross to show position swaps. Circles show actual values at each endpoint. Good for team performance rankings, metric leaderboards.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "sparkline_rows",
    chartType: "sparkline_rows",
    displayName: "Sparkline Rows Chart",
    description: "Labeled rows with individual sparklines for quick multi-metric comparison.",
    version: 1,
    category: "Time Series",
    tags: ["sparkline", "overview", "multi-metric", "compact"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "value", "data"],
            properties: {
              label: { type: "string" },
              value: { type: "string", description: "Current value displayed as text" },
              data: { type: "array", items: { type: "number" }, description: "Sequential values for the sparkline" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        lineColor: { type: "string" },
        rowHeight: { type: "number" },
        width: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG sparkline rows" },
    defaults: { lineColor: "#5b636a", rowHeight: 48 },
    exampleData: {
      rows: [
        { label: "Attrition", value: "12.3%", data: [12, 14, 11, 13, 15, 12, 12.3] },
        { label: "Engagement", value: "78", data: [72, 75, 73, 76, 77, 78, 78] },
        { label: "Headcount", value: "1,245", data: [1100, 1150, 1180, 1200, 1220, 1240, 1245] },
      ],
    },
    exampleConfig: {},
    documentation: "Compact overview of multiple metrics with trend sparklines. Each row shows a label, current value, and mini line chart. Ideal for dashboard summaries and watchlists.",
    infrastructureNotes: "Requires D3.js. Most compact multi-metric view.",
  },
  {
    key: "stacked_area",
    chartType: "stacked_area",
    displayName: "Stacked Area Chart",
    description: "Layered filled areas showing composition over time.",
    version: 1,
    category: "Composition",
    tags: ["composition", "time-series", "stacked", "trend"],
    dataSchema: {
      type: "object",
      required: ["series"],
      properties: {
        series: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "values"],
            properties: {
              label: { type: "string" },
              values: { type: "array", items: { type: "number" } },
              color: { type: "string" },
            },
          },
        },
        xLabels: { type: "array", items: { type: "string" } },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        defaultColors: { type: "array", items: { type: "string" } },
        xLabel: { type: "string" },
        yLabel: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG stacked area chart" },
    defaults: { defaultColors: ["#232a31", "#5b636a", "#a3adb8", "#0f69ff"] },
    exampleData: {
      series: [
        { label: "Full-time", values: [800, 820, 850, 880, 900, 920] },
        { label: "Contract", values: [120, 130, 125, 140, 150, 145] },
        { label: "Intern", values: [30, 25, 40, 35, 45, 50] },
      ],
      xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    exampleConfig: { yLabel: "Headcount" },
    documentation: "Show how total composition changes over time. Each layer represents a category stacking on previous ones. Use for workforce composition trends, budget allocation over time.",
    infrastructureNotes: "Requires D3.js.",
  },
  {
    key: "range_strip",
    chartType: "range_strip",
    displayName: "Range Strip Chart",
    description: "Sequential rectangular blocks with highlighting to visualize ranges. Blocks represent percentiles, quartiles, or custom slices with highlighted segments forming a contiguous range.",
    version: 1,
    category: "Compensation",
    tags: ["range", "compensation", "percentile", "quartile", "distribution", "pay-structure"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            required: ["label", "segments"],
            properties: {
              label: { type: "string", description: "Row label (e.g., job title, department, grade)" },
              segments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string", description: "Segment label (e.g., P10, Q1, $50K)" },
                    value: { type: "number", description: "Numeric value for the segment" },
                    highlighted: { type: "boolean", description: "Whether this segment is part of the active range" },
                    color: { type: "string", description: "Override color for this segment" },
                    tooltip: { type: "string", description: "Hover tooltip text" },
                  },
                },
                description: "Sequential blocks forming the strip. Highlighted segments define the range.",
              },
              rangeStart: { type: "number", description: "Index of the first highlighted segment (auto-detected if omitted)" },
              rangeEnd: { type: "number", description: "Index of the last highlighted segment (auto-detected if omitted)" },
              markerPosition: { type: "number", description: "Segment index for a reference marker (e.g., current position, MRP)" },
              markerLabel: { type: "string", description: "Label for the reference marker" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        highlightColor: { type: "string", description: "Color for highlighted range segments" },
        baseColor: { type: "string", description: "Color for non-highlighted segments" },
        segmentHeight: { type: "number", description: "Height of each segment block in pixels" },
        gap: { type: "number", description: "Gap between segments in pixels" },
        showLabels: { type: "boolean", description: "Show row labels on the left" },
        showValues: { type: "boolean", description: "Show range fraction on the right" },
        showScale: { type: "boolean", description: "Show dollar scale on top" },
        stepSize: { type: "number", description: "Dollar amount per box (e.g., 10000 for $10K boxes)" },
        scaleMin: { type: "number", description: "Minimum value for the shared scale (auto-detected if omitted)" },
        scaleMax: { type: "number", description: "Maximum value for the shared scale (auto-detected if omitted)" },
        labelWidth: { type: "number", description: "Width allocated for row labels" },
        width: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG range strip chart" },
    defaults: {
      highlightColor: "#0f69ff",
      baseColor: "#e0e4e9",
      segmentHeight: 18,
      gap: 2,
      showLabels: true,
      showValues: true,
      showScale: true,
      stepSize: 10000,
    },
    exampleData: {
      rows: [
        {
          label: "Eng IC",
          segments: [
            { value: 95000, highlighted: false },
            { value: 110000, highlighted: true },
            { value: 125000, highlighted: true },
            { value: 140000, highlighted: true },
            { value: 160000, highlighted: false },
          ],
        },
        {
          label: "Eng Mgr",
          segments: [
            { value: 120000, highlighted: false },
            { value: 155000, highlighted: true },
            { value: 175000, highlighted: true },
            { value: 195000, highlighted: true },
            { value: 210000, highlighted: false },
          ],
        },
        {
          label: "Eng Dir",
          segments: [
            { value: 150000, highlighted: false },
            { value: 180000, highlighted: true },
            { value: 210000, highlighted: true },
            { value: 240000, highlighted: true },
            { value: 270000, highlighted: false },
          ],
        },
      ],
    },
    exampleConfig: { stepSize: 10000 },
    documentation: "Visualize pay ranges on a shared dollar scale. Each row shows discrete boxes where box count is determined by the stepSize (e.g., $10K per box). Highlighted boxes form the active range. Use for pay structure visualization, market positioning, range overlap analysis, and level-over-level comparison. The shared scale enables direct visual comparison across roles.",
    infrastructureNotes: "Designed for compensation range visualization. No D3 dependency.",
  },
  {
    key: "range_strip_aligned",
    chartType: "range_strip_aligned",
    displayName: "Aligned Range Strip",
    description: "Percentile-by-level matrix on a shared dollar scale. Rows represent percentiles (P10, P25, P50, P75, P90) and level markers (P1–P5) are placed inside boxes at their corresponding dollar positions, enabling cross-level comparison at each percentile.",
    version: 2,
    category: "Compensation",
    tags: ["range", "compensation", "percentile", "aligned", "pay-structure", "comparison", "levels"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            required: ["label"],
            properties: {
              label: { type: "string", description: "Percentile row label (e.g., P10, P25, P50)" },
              markers: {
                type: "array",
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: {
                    label: { type: "string", description: "Level label placed inside the box (e.g., P1, P2, L3)" },
                    value: { type: "number", description: "Dollar amount determining which box this level occupies" },
                    color: { type: "string", description: "Optional override color for this marker box" },
                    tooltip: { type: "string", description: "Hover tooltip text" },
                  },
                },
                description: "Level markers placed at dollar positions on the shared scale. Each marker label appears inside the corresponding box.",
              },
            },
          },
        },
        scaleMin: { type: "number", description: "Minimum value for the shared scale (auto-detected if omitted)" },
        scaleMax: { type: "number", description: "Maximum value for the shared scale (auto-detected if omitted)" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        markerColor: { type: "string", description: "Default color for marker boxes" },
        baseColor: { type: "string", description: "Color for empty/unoccupied boxes" },
        segmentHeight: { type: "number", description: "Height of each row strip in pixels" },
        showLabels: { type: "boolean", description: "Show percentile row labels" },
        showScale: { type: "boolean", description: "Show the dollar scale on top" },
        stepSize: { type: "number", description: "Dollar amount per box (e.g., 10000 for $10K boxes)" },
        scaleMin: { type: "number", description: "Minimum value for the shared scale (auto-detected if omitted)" },
        scaleMax: { type: "number", description: "Maximum value for the shared scale (auto-detected if omitted)" },
        width: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG aligned range strip chart with level markers" },
    defaults: {
      markerColor: "#0f69ff",
      baseColor: "#e0e4e9",
      segmentHeight: 20,
      showLabels: true,
      showScale: true,
      stepSize: 25000,
    },
    exampleData: {
      rows: [
        {
          label: "P10",
          markers: [
            { label: "P1", value: 62000 },
            { label: "P2", value: 88000 },
            { label: "P3", value: 115000 },
            { label: "P4", value: 150000 },
            { label: "P5", value: 188000 },
            { label: "P6", value: 240000 },
            { label: "P7", value: 310000 },
          ],
        },
        {
          label: "P50",
          markers: [
            { label: "P1", value: 82000 },
            { label: "P2", value: 112000 },
            { label: "P3", value: 148000 },
            { label: "P4", value: 190000 },
            { label: "P5", value: 238000 },
            { label: "P6", value: 298000 },
            { label: "P7", value: 380000 },
          ],
        },
        {
          label: "P90",
          markers: [
            { label: "P1", value: 105000 },
            { label: "P2", value: 140000 },
            { label: "P3", value: 185000 },
            { label: "P4", value: 238000 },
            { label: "P5", value: 295000 },
            { label: "P6", value: 370000 },
            { label: "P7", value: 462000 },
          ],
        },
      ],
    },
    exampleConfig: { stepSize: 25000, scaleMin: 50000, scaleMax: 475000 },
    documentation: "Percentile-by-level matrix visualization. Rows represent percentiles (P10–P90) and level markers (P1–P5) are placed inside the boxes at their dollar positions on a shared scale. Use for cross-level compensation analysis at each percentile, market benchmarking, and pay structure design. stepSize controls box width (e.g., $10K per box).",
    infrastructureNotes: "No D3 dependency.",
  },
  {
    key: "interactive_range_strip",
    chartType: "interactive_range_strip",
    displayName: "Interactive Range Strip (Legacy)",
    description: "Legacy chart-based interactive range strip. Superseded by range_builder control type. Kept for backwards compatibility.",
    version: 1,
    category: "Compensation",
    tags: ["range", "compensation", "interactive", "legacy"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            required: ["label"],
            properties: {
              label: { type: "string", description: "Row label (e.g., job title)" },
              rangeMin: { type: "number", description: "Dollar value for the start of the initial active range" },
              rangeMax: { type: "number", description: "Dollar value for the end of the initial active range" },
              segments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    active: { type: "boolean" },
                    tooltip: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        stepSize: { type: "number" },
        scaleMin: { type: "number" },
        scaleMax: { type: "number" },
      },
    },
    outputSchema: { type: "object", description: "Rendered interactive SVG range strip chart (legacy)" },
    defaults: { stepSize: 10000 },
    exampleData: {
      rows: [
        { label: "Eng III", rangeMin: 110000, rangeMax: 140000, segments: [] },
      ],
    },
    exampleConfig: { stepSize: 10000 },
    documentation: "Legacy interactive range strip chart. Use range_builder control type instead for KPI-driven compensation range simulation.",
    infrastructureNotes: "Superseded by range_builder control.",
  },
  {
    key: "range_builder",
    chartType: "range_builder",
    displayName: "Range Builder",
    description: "Form control for compensation range simulation. Users adjust ranges interactively and see real-time impact on cost, pay equity, market competitiveness, and affected employee counts. Emits change events with updated ranges and KPI calculations.",
    version: 1,
    category: "Compensation",
    tags: ["range", "compensation", "form-control", "simulator", "kpi", "cost-analysis", "pay-equity", "competitiveness"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          description: "Compensation range rows. Each row represents a job level with its current range and employee population data.",
          items: {
            type: "object",
            required: ["label", "rangeMin", "rangeMax"],
            properties: {
              label: { type: "string", description: "Job level or title label (e.g., 'Eng III')" },
              rangeMin: { type: "number", description: "Current range minimum in dollars" },
              rangeMax: { type: "number", description: "Current range maximum in dollars" },
              currentEmployees: { type: "number", description: "Number of employees in this level. Used for cost impact and KPI calculations." },
              avgCurrentPay: { type: "number", description: "Average current pay for employees in this level. Used to calculate cost impact when range boundaries move." },
            },
          },
        },
        marketData: {
          type: "array",
          description: "Market benchmark data per row, used for competitiveness ratio calculation.",
          items: {
            type: "object",
            properties: {
              p50: { type: "number", description: "Market 50th percentile (median) pay for this level" },
              p75: { type: "number", description: "Market 75th percentile pay for this level" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        stepSize: { type: "number", description: "Dollar amount per box (e.g., 10000 for $10K boxes). Controls granularity of range adjustments." },
        scaleMin: { type: "number", description: "Minimum value for the shared dollar scale" },
        scaleMax: { type: "number", description: "Maximum value for the shared dollar scale" },
        activeColor: { type: "string", description: "Color for active (in-range) segments" },
        inactiveColor: { type: "string", description: "Color for inactive (out-of-range) segments" },
        segmentHeight: { type: "number", description: "Height of each row segment in pixels" },
        gap: { type: "number", description: "Gap between boxes in pixels" },
        showLabels: { type: "boolean", description: "Show row labels on the left" },
        showScale: { type: "boolean", description: "Show dollar scale axis on top" },
        autoRecalculate: { type: "boolean", description: "If true, KPIs recalculate on every box toggle. If false, requires explicit Recalculate button press." },
      },
    },
    outputSchema: {
      type: "object",
      description: "Change event emitted when ranges are modified. Contains updated ranges and computed KPIs.",
      properties: {
        rows: { type: "array", description: "Original row data" },
        activeRanges: {
          type: "array",
          description: "Current active range per row after user adjustments.",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              min: { type: "number", description: "New range minimum in dollars" },
              max: { type: "number", description: "New range maximum in dollars" },
            },
          },
        },
        kpis: {
          type: "object",
          description: "Computed KPI values based on current range configuration.",
          properties: {
            totalCostImpact: { type: "number", description: "Net change in total compensation cost (positive = increase)" },
            costChangePercent: { type: "number", description: "Percentage change in total compensation cost" },
            peerEquityScore: { type: "number", description: "Peer equity (internal equity) score (0-1), measures how centered employees are within their ranges" },
            peerEquityChange: { type: "number", description: "Change in peer equity vs baseline" },
            competitivenessRatio: { type: "number", description: "Ratio of range midpoints to market P50 (1.0 = at market)" },
            competitivenessChange: { type: "number", description: "Change in competitiveness vs baseline" },
            employeesAffected: { type: "number", description: "Number of employees whose pay falls outside the new range boundaries" },
            totalEmployees: { type: "number", description: "Total employee count across all levels" },
          },
        },
      },
    },
    defaults: {
      stepSize: 10000,
      activeColor: "#0f69ff",
      inactiveColor: "#e0e4e9",
      segmentHeight: 24,
      gap: 2,
      showLabels: true,
      showScale: true,
      autoRecalculate: true,
    },
    exampleData: {
      rows: [
        { label: "Eng III", rangeMin: 110000, rangeMax: 150000, currentEmployees: 24, avgCurrentPay: 128000 },
        { label: "Eng IV", rangeMin: 140000, rangeMax: 190000, currentEmployees: 18, avgCurrentPay: 162000 },
        { label: "Eng V", rangeMin: 175000, rangeMax: 235000, currentEmployees: 12, avgCurrentPay: 198000 },
        { label: "Eng VI", rangeMin: 210000, rangeMax: 280000, currentEmployees: 6, avgCurrentPay: 245000 },
      ],
      marketData: [
        { p50: 130000, p75: 148000 },
        { p50: 165000, p75: 185000 },
        { p50: 205000, p75: 230000 },
        { p50: 250000, p75: 275000 },
      ],
    },
    exampleConfig: { stepSize: 10000, scaleMin: 90000, scaleMax: 300000, autoRecalculate: true },
    documentation: `Range Builder is a form control (not a chart) for interactive compensation range simulation. It provides:

**Purpose:** Allow compensation analysts to visually adjust pay ranges and immediately see the downstream impact on key compensation KPIs.

**KPI Cards (top section):**
- Cost Impact: Net change in total compensation cost when employees outside new range boundaries are adjusted
- Peer Equity: How centered employees are within their ranges (0-100%), aka Internal Equity — distinct from Gender/Ethnic Pay Equity
- Competitiveness: Ratio of range midpoints to market P50 benchmarks (100% = at market)
- People Impact: Proportion of employees unaffected by range changes

**How it works:**
1. Each row represents a job level with a compensation range shown as toggleable boxes
2. Click boxes to extend or shrink the range
3. KPIs update in real-time (or on button press if autoRecalculate=false)
4. The onChange callback emits a RangeBuilderChangeEvent with updated ranges and KPIs

**Data wiring:**
- Input: rows[] with label, rangeMin, rangeMax, currentEmployees, avgCurrentPay
- Input: marketData[] with p50, p75 per level (for competitiveness calculation)
- Output: activeRanges[] with adjusted min/max per level
- Output: kpis{} with totalCostImpact, peerEquityScore, competitivenessRatio, employeesAffected

**Integration pattern:**
- Mount as a form control inside a card or standalone page
- Wire onChange to update downstream KPI displays, cost models, or approval workflows
- Use autoRecalculate=true for real-time simulation, false for batch recalculation

**Difference from interactive_range_strip (legacy):**
- range_builder is a form control with KPI outputs, not just a visualization
- Includes employee population data for cost calculations
- Accepts market benchmark data for competitiveness scoring
- Emits structured change events for downstream consumption`,
    infrastructureNotes: "React state management with ResizeObserver for responsive layout. No D3 dependency. KPI calculations are client-side. For production use, connect onChange to server-side cost models and pay equity engines.",
  },
  {
    key: "range_target_bullet",
    chartType: "range_target_bullet",
    displayName: "Range Target Bullet",
    description: "Bullet-graph style chart overlaying market range, target range, and actual employee pay extremes. Circle and triangle indicators change color based on whether values fall inside/outside market and target ranges. Designed to accompany the Range Builder control for visual comparison of proposed ranges against market benchmarks and actual employee data.",
    version: 1,
    category: "Compensation",
    tags: ["bullet", "range", "compensation", "market", "target", "comparison", "actuals"],
    dataSchema: {
      type: "object",
      required: ["rows"],
      properties: {
        rows: {
          type: "array",
          description: "One row per job level. Each row defines market range, target (proposed) range, and actual employee pay min/max.",
          items: {
            type: "object",
            required: ["label", "marketMin", "marketMax", "targetMin", "targetMax", "actualMin", "actualMax"],
            properties: {
              label: { type: "string", description: "Job level label (e.g., 'Eng III')" },
              marketMin: { type: "number", description: "Market range lower bound (e.g., P25 or P50 - spread)" },
              marketMax: { type: "number", description: "Market range upper bound (e.g., P75)" },
              targetMin: { type: "number", description: "Target (proposed) range minimum" },
              targetMax: { type: "number", description: "Target (proposed) range maximum" },
              actualMin: { type: "number", description: "Lowest actual employee pay in this level" },
              actualMax: { type: "number", description: "Highest actual employee pay in this level" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        scaleMin: { type: "number", description: "Minimum value for the shared dollar scale" },
        scaleMax: { type: "number", description: "Maximum value for the shared dollar scale" },
        rowHeight: { type: "number", description: "Height of each bullet row in pixels" },
        rowGap: { type: "number", description: "Vertical gap between rows in pixels" },
        showLabels: { type: "boolean", description: "Show row labels on the left" },
        showScale: { type: "boolean", description: "Show dollar scale axis on top" },
        marketColor: { type: "string", description: "Fill color for market range bar" },
        targetColor: { type: "string", description: "Fill color for target range bar and indicators" },
      },
    },
    outputSchema: {
      type: "object",
      description: "Read-only visualization; no output signals.",
      properties: {},
    },
    exampleData: {
      rows: [
        { label: "Eng III", marketMin: 112000, marketMax: 148000, targetMin: 110000, targetMax: 150000, actualMin: 105000, actualMax: 155000 },
        { label: "Eng IV", marketMin: 147000, marketMax: 185000, targetMin: 140000, targetMax: 190000, actualMin: 138000, actualMax: 195000 },
      ],
    },
    exampleConfig: { scaleMin: 90000, scaleMax: 300000 },
    documentation: `**Range Target Bullet Chart**

A bullet-graph style visualization for compensation range analysis. Each row overlays three layers:

1. **Light Grey Bar** — Full scale background
2. **Light Blue Bar** — Market range (benchmark data)
3. **Dark Blue Bar** — Target range (proposed/adjusted range)

**Indicators:**
- **Circles** mark Actual Employee Min and Max pay values
- **Triangles** mark Target Range endpoints

**Indicator color logic:**
- *Filled blue circle* — actual value inside both Target and Market ranges
- *Open blue circle* — actual value inside Target but outside Market
- *Open black circle* — actual value outside Target but inside Market
- *Filled black circle* — actual value outside both ranges
- *Blue triangle* — target endpoint inside Market range
- *Grey triangle* — target endpoint outside Market range

**Integration:**
- Pair with Range Builder control: target ranges update in real-time as users adjust the Range Builder
- Market data comes from benchmark surveys; actual data from HRIS employee records`,
    infrastructureNotes: "Pure SVG rendering with ResizeObserver for responsive width. No D3 dependency. Designed to pair with the range_builder control for interactive compensation analysis.",
  },
  {
    key: "range_dot_plot",
    chartType: "range_dot_plot",
    displayName: "Range Dot Plot",
    description: "Dot strip chart showing individual employee positions within salary ranges by level. Each level displays a horizontal band representing the pay range (min to max), with dots for each employee color-coded as below range, in range, or above range. Ideal for identifying pay equity issues, mis-leveling, and range penetration at a glance.",
    version: 1,
    category: "Compensation",
    tags: ["compensation", "range", "equity", "dot-plot", "employees", "salary", "levels"],
    dataSchema: {
      type: "object",
      required: ["levels"],
      properties: {
        levels: {
          type: "array",
          items: {
            type: "object",
            required: ["level", "bandMin", "bandMax", "employees"],
            properties: {
              level: { type: "string", description: "Level label (e.g. 'Level 1', 'P3', 'M2')" },
              bandMin: { type: "number", description: "Salary range minimum for this level" },
              bandMax: { type: "number", description: "Salary range maximum for this level" },
              employees: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "salary"],
                  properties: {
                    id: { type: "string", description: "Employee identifier" },
                    salary: { type: "number", description: "Employee base salary" },
                    label: { type: "string", description: "Display label (name or anonymized ID)" },
                  },
                },
              },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        width: { type: "number", description: "Chart width in pixels" },
        height: { type: "number", description: "Chart height in pixels" },
        dotRadius: { type: "number", default: 5, description: "Radius of employee dots" },
        belowColor: { type: "string", default: "#e07020", description: "Color for employees below range" },
        inRangeColor: { type: "string", default: "#9ca3af", description: "Color for employees in range" },
        aboveColor: { type: "string", default: "#0f69ff", description: "Color for employees above range" },
        bandColor: { type: "string", default: "#e8e8e8", description: "Background color for range bands" },
        showLegend: { type: "boolean", default: true },
        showAxis: { type: "boolean", default: true },
      },
    },
    outputSchema: { type: "object", description: "Rendered SVG dot plot with employee positions within salary ranges" },
    defaults: {
      dotRadius: 5,
      belowColor: "#e07020",
      inRangeColor: "#9ca3af",
      aboveColor: "#0f69ff",
      bandColor: "#e8e8e8",
      showLegend: true,
      showAxis: true,
    },
    exampleData: {
      levels: [
        {
          level: "Level 1",
          bandMin: 45000,
          bandMax: 65000,
          employees: [
            { id: "E001", salary: 48000 }, { id: "E002", salary: 52000 }, { id: "E003", salary: 55000 },
            { id: "E004", salary: 58000 }, { id: "E005", salary: 50000 }, { id: "E006", salary: 62000 },
            { id: "E007", salary: 43000 }, { id: "E008", salary: 56000 },
          ],
        },
        {
          level: "Level 2",
          bandMin: 55000,
          bandMax: 80000,
          employees: [
            { id: "E010", salary: 58000 }, { id: "E011", salary: 62000 }, { id: "E012", salary: 65000 },
            { id: "E013", salary: 70000 }, { id: "E014", salary: 72000 }, { id: "E015", salary: 74000 },
            { id: "E016", salary: 68000 }, { id: "E017", salary: 76000 }, { id: "E018", salary: 60000 },
            { id: "E019", salary: 53000 }, { id: "E020", salary: 78000 },
          ],
        },
        {
          level: "Level 3",
          bandMin: 70000,
          bandMax: 100000,
          employees: [
            { id: "E021", salary: 72000 }, { id: "E022", salary: 78000 }, { id: "E023", salary: 82000 },
            { id: "E024", salary: 85000 }, { id: "E025", salary: 88000 }, { id: "E026", salary: 92000 },
            { id: "E027", salary: 95000 }, { id: "E028", salary: 75000 }, { id: "E029", salary: 98000 },
            { id: "E030", salary: 68000 }, { id: "E031", salary: 102000 }, { id: "E032", salary: 80000 },
          ],
        },
        {
          level: "Level 4",
          bandMin: 90000,
          bandMax: 125000,
          employees: [
            { id: "E040", salary: 85000 }, { id: "E041", salary: 88000 }, { id: "E042", salary: 92000 },
            { id: "E043", salary: 95000 }, { id: "E044", salary: 98000 }, { id: "E045", salary: 100000 },
            { id: "E046", salary: 105000 }, { id: "E047", salary: 110000 }, { id: "E048", salary: 87000 },
            { id: "E049", salary: 130000 },
          ],
        },
        {
          level: "Level 5",
          bandMin: 115000,
          bandMax: 160000,
          employees: [
            { id: "E050", salary: 118000 }, { id: "E051", salary: 125000 }, { id: "E052", salary: 132000 },
            { id: "E053", salary: 140000 }, { id: "E054", salary: 145000 }, { id: "E055", salary: 150000 },
            { id: "E056", salary: 155000 }, { id: "E057", salary: 162000 },
          ],
        },
        {
          level: "Level 6",
          bandMin: 145000,
          bandMax: 200000,
          employees: [
            { id: "E060", salary: 150000 }, { id: "E061", salary: 160000 }, { id: "E062", salary: 170000 },
            { id: "E063", salary: 175000 }, { id: "E064", salary: 185000 }, { id: "E065", salary: 190000 },
            { id: "E066", salary: 195000 }, { id: "E067", salary: 205000 },
          ],
        },
      ],
    },
    exampleConfig: {},
    documentation: `**Range Dot Plot**

A dot strip visualization showing individual employee base compensation positions within salary ranges by job level. Inspired by compensation analytics best practices for identifying pay equity issues.

**Visual Elements:**
- **Gray bands** — Salary range (band minimum to band maximum) for each level
- **Orange dots** — Employees paid below the range minimum
- **Gray dots** — Employees within the range
- **Blue dots** — Employees paid above the range maximum

**Use Cases:**
- Identify employees falling outside pay bands for remediation
- Spot levels where employees cluster below midpoint (potential underpayment)
- Detect mis-leveling (employees whose pay doesn't match their assigned level)
- Visualize range penetration distribution across the organization

**Data Sources:**
- Band min/max from compensation structure (market survey or internal ranges)
- Employee salaries from HRIS
- Levels from job architecture / job evaluation

**Integration:**
- Pair with Range Builder control for interactive "what-if" band adjustment
- Filter by Job Function, Department, or Super Job Function
- Link to individual employee detail cards for drill-down`,
    infrastructureNotes: "Pure SVG rendering. Dot collision avoidance via simple jitter algorithm. Supports any level naming convention (Level 1-6, P1-P6, M1-M6, etc.). Color-coding is automatic based on employee salary vs. band min/max.",
  },

  // ════════════════════════════════════════════════════════════════════
  // COMPENSATION CYCLE VISUALIZATION BUNDLES
  // ════════════════════════════════════════════════════════════════════

  {
    key: "comp_cycle_overview",
    chartType: "comp_cycle_overview",
    displayName: "Comp Cycle Overview",
    description: "Executive compensation cycle dashboard with budget utilization gauge, average increase by performance tier, compa-ratio distribution before vs after, merit cost by business unit, and cycle completion stage indicator.",
    version: 1,
    category: "Compensation Cycle",
    tags: ["compensation", "cycle", "budget", "merit", "executive", "dashboard", "compa-ratio", "performance-tier"],
    dataSchema: {
      type: "object",
      required: ["budgetUtilization", "increaseByTier", "compaRatioBuckets", "meritCostByUnit"],
      properties: {
        budgetUtilization: {
          type: "object",
          required: ["allocated", "spent"],
          description: "Budget utilization gauge data",
          properties: {
            allocated: { type: "number", description: "Total allocated budget in dollars" },
            spent: { type: "number", description: "Total spent/committed budget in dollars" },
            currency: { type: "string", description: "Currency code (e.g., USD)" },
            asOfDate: { type: "string", description: "ISO date when budget snapshot was taken" },
          },
        },
        increaseByTier: {
          type: "array",
          description: "Average increase percentage grouped by performance tier",
          items: {
            type: "object",
            required: ["tier", "avgIncreasePct", "headcount"],
            properties: {
              tier: { type: "string", description: "Performance tier label (e.g., Exceeds, Meets, Below)" },
              avgIncreasePct: { type: "number", description: "Average merit increase percentage for this tier" },
              headcount: { type: "number", description: "Number of employees in this tier" },
              targetPct: { type: "number", description: "Target increase percentage from merit matrix" },
            },
          },
        },
        compaRatioBuckets: {
          type: "object",
          required: ["before", "after"],
          description: "Compa-ratio distribution buckets before and after the cycle",
          properties: {
            bucketLabels: {
              type: "array",
              items: { type: "string" },
              description: "Bucket labels (e.g., '<0.80', '0.80-0.90', '0.90-1.00', '1.00-1.10', '1.10-1.20', '>1.20')",
            },
            before: {
              type: "array",
              items: { type: "number" },
              description: "Headcount per bucket before the cycle",
            },
            after: {
              type: "array",
              items: { type: "number" },
              description: "Headcount per bucket after the cycle",
            },
          },
        },
        meritCostByUnit: {
          type: "array",
          description: "Total merit cost by business unit",
          items: {
            type: "object",
            required: ["unit", "totalCost"],
            properties: {
              unit: { type: "string", description: "Business unit name" },
              totalCost: { type: "number", description: "Total merit cost in dollars" },
              headcount: { type: "number", description: "Employees in this unit" },
              avgIncreasePct: { type: "number", description: "Average increase for this unit" },
            },
          },
        },
        cycleStage: {
          type: "object",
          description: "Cycle completion stage indicator",
          properties: {
            currentStage: { type: "string", description: "Current stage (e.g., Planning, Manager Review, Approval, Finalized)" },
            stages: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "status"],
                properties: {
                  name: { type: "string" },
                  status: { type: "string", description: "completed | in_progress | pending" },
                  completedPct: { type: "number", description: "Completion percentage (0-100)" },
                },
              },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        gaugeColors: { type: "array", items: { type: "string" }, description: "[underBudget, onTrack, overBudget] colors" },
        tierColors: { type: "object", additionalProperties: { type: "string" }, description: "Map of tier name to bar color" },
        currency: { type: "string", description: "Display currency symbol" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: {
      type: "object",
      description: "Read-only executive dashboard; no output signals.",
      properties: {},
    },
    defaults: {
      gaugeColors: ["#10b981", "#f59e0b", "#ef4444"],
      currency: "$",
    },
    exampleData: {
      budgetUtilization: { allocated: 5200000, spent: 4680000, currency: "USD", asOfDate: "2026-02-15" },
      increaseByTier: [
        { tier: "Exceeds", avgIncreasePct: 5.2, headcount: 180, targetPct: 5.0 },
        { tier: "Meets", avgIncreasePct: 3.1, headcount: 620, targetPct: 3.0 },
        { tier: "Developing", avgIncreasePct: 1.5, headcount: 140, targetPct: 1.5 },
        { tier: "Below", avgIncreasePct: 0.0, headcount: 60, targetPct: 0.0 },
      ],
      compaRatioBuckets: {
        bucketLabels: ["<0.80", "0.80-0.90", "0.90-1.00", "1.00-1.10", "1.10-1.20", ">1.20"],
        before: [45, 120, 310, 280, 160, 85],
        after: [20, 80, 290, 350, 180, 80],
      },
      meritCostByUnit: [
        { unit: "Engineering", totalCost: 1850000, headcount: 320, avgIncreasePct: 3.8 },
        { unit: "Sales", totalCost: 1200000, headcount: 250, avgIncreasePct: 3.2 },
        { unit: "Operations", totalCost: 980000, headcount: 230, avgIncreasePct: 2.9 },
        { unit: "Corporate", totalCost: 650000, headcount: 200, avgIncreasePct: 3.0 },
      ],
      cycleStage: {
        currentStage: "Manager Review",
        stages: [
          { name: "Planning", status: "completed", completedPct: 100 },
          { name: "Manager Review", status: "in_progress", completedPct: 72 },
          { name: "VP Approval", status: "pending", completedPct: 0 },
          { name: "Finalized", status: "pending", completedPct: 0 },
        ],
      },
    },
    exampleConfig: { currency: "$" },
    documentation: `Comp Cycle Overview is a composite executive dashboard for monitoring an active compensation cycle.

**Sub-visualizations:**
1. **Budget Utilization Gauge** — Radial or linear gauge showing spent vs allocated budget. Color-coded: green (under 90%), amber (90-100%), red (over 100%).
2. **Average Increase by Tier** — Grouped bar chart comparing actual average increase % to matrix target % for each performance tier.
3. **Compa-Ratio Buckets** — Side-by-side histogram showing headcount distribution across compa-ratio ranges before and after the cycle.
4. **Merit Cost by Business Unit** — Horizontal bar chart of total merit cost by BU, sortable by cost or headcount.
5. **Cycle Stage Indicator** — Step progress indicator showing cycle phase (Planning → Manager Review → VP Approval → Finalized).

**Required Data Sources:**
- **Calculus**: Budget totals, per-employee increase calculations, compa-ratio computations
- **Conductor**: Performance tier assignments, business unit mapping
- **MetaFactory**: Cycle stage configuration and status

**Hub SDK Integration:**
Spoke apps push data via POST /api/ingest/metric-engine or POST /api/ingest/conductor with the required fields. Cards auto-populate when data arrives.`,
    infrastructureNotes: "Composite dashboard bundle. Frontend renders 5 sub-charts in a grid layout. Budget gauge uses radial arc or linear bar. Grouped bar and histogram use D3.js. Stage indicator is pure CSS/SVG.",
  },

  {
    key: "merit_matrix_heatmap",
    chartType: "merit_matrix_heatmap",
    displayName: "Merit Matrix Heatmap",
    description: "6×5 heatmap showing actual average increases versus merit matrix targets, with population count overlay per cell and variance highlighting where manager overrides diverged from policy.",
    version: 1,
    category: "Compensation Cycle",
    tags: ["compensation", "merit-matrix", "heatmap", "performance", "compa-ratio", "manager-override", "variance"],
    dataSchema: {
      type: "object",
      required: ["cells", "rowLabels", "colLabels"],
      properties: {
        rowLabels: {
          type: "array",
          items: { type: "string" },
          description: "Performance tier labels for rows (e.g., ['Far Exceeds', 'Exceeds', 'Meets', 'Developing', 'Below'])",
        },
        colLabels: {
          type: "array",
          items: { type: "string" },
          description: "Compa-ratio zone labels for columns (e.g., ['<0.85', '0.85-0.95', '0.95-1.05', '1.05-1.15', '1.15-1.25', '>1.25'])",
        },
        cells: {
          type: "array",
          description: "2D array [row][col] of cell data",
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["targetPct", "actualPct", "population"],
              properties: {
                targetPct: { type: "number", description: "Matrix-prescribed increase percentage" },
                actualPct: { type: "number", description: "Actual average increase delivered" },
                population: { type: "number", description: "Number of employees in this cell" },
                variancePct: { type: "number", description: "Actual minus target (positive = over-delivered)" },
                overrideCount: { type: "number", description: "Number of manager overrides in this cell" },
                employeeIds: { type: "array", items: { type: "string" }, description: "Employee IDs for drill-down" },
              },
            },
          },
        },
        cycleName: { type: "string", description: "Compensation cycle identifier (e.g., '2026 Annual Merit')" },
        asOfDate: { type: "string", description: "ISO date of data snapshot" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        colorScale: {
          type: "object",
          properties: {
            belowTarget: { type: "string", description: "Color for actual < target (under-delivered)" },
            onTarget: { type: "string", description: "Color for actual ≈ target" },
            aboveTarget: { type: "string", description: "Color for actual > target (over-delivered)" },
          },
        },
        varianceThreshold: { type: "number", description: "Percentage points of variance before flagging (default 0.5)" },
        showPopulation: { type: "boolean", description: "Show population count overlay in each cell" },
        showVariance: { type: "boolean", description: "Show variance indicator in each cell" },
        enableDrillDown: { type: "boolean", description: "Enable click-to-drill to employee list" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: {
      type: "object",
      description: "Drill-down event emitted when a cell is clicked.",
      properties: {
        selectedCell: {
          type: "object",
          properties: {
            row: { type: "number" },
            col: { type: "number" },
            performanceTier: { type: "string" },
            compaRatioZone: { type: "string" },
            employeeIds: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    defaults: {
      colorScale: { belowTarget: "#3b82f6", onTarget: "#e5e7eb", aboveTarget: "#ef4444" },
      varianceThreshold: 0.5,
      showPopulation: true,
      showVariance: true,
      enableDrillDown: true,
    },
    exampleData: {
      rowLabels: ["Far Exceeds", "Exceeds", "Meets", "Developing", "Below"],
      colLabels: ["<0.85", "0.85-0.95", "0.95-1.05", "1.05-1.15", "1.15-1.25", ">1.25"],
      cells: [
        [
          { targetPct: 7.0, actualPct: 7.2, population: 5, variancePct: 0.2, overrideCount: 1 },
          { targetPct: 6.5, actualPct: 6.8, population: 12, variancePct: 0.3, overrideCount: 2 },
          { targetPct: 6.0, actualPct: 5.9, population: 18, variancePct: -0.1, overrideCount: 0 },
          { targetPct: 5.0, actualPct: 5.0, population: 10, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 4.0, actualPct: 4.5, population: 3, variancePct: 0.5, overrideCount: 1 },
          { targetPct: 3.0, actualPct: 3.0, population: 2, variancePct: 0.0, overrideCount: 0 },
        ],
        [
          { targetPct: 5.5, actualPct: 5.8, population: 8, variancePct: 0.3, overrideCount: 1 },
          { targetPct: 5.0, actualPct: 5.1, population: 25, variancePct: 0.1, overrideCount: 0 },
          { targetPct: 4.5, actualPct: 4.4, population: 45, variancePct: -0.1, overrideCount: 0 },
          { targetPct: 3.5, actualPct: 3.6, population: 30, variancePct: 0.1, overrideCount: 1 },
          { targetPct: 3.0, actualPct: 3.2, population: 12, variancePct: 0.2, overrideCount: 1 },
          { targetPct: 2.0, actualPct: 2.0, population: 5, variancePct: 0.0, overrideCount: 0 },
        ],
        [
          { targetPct: 4.0, actualPct: 4.0, population: 10, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 3.5, actualPct: 3.5, population: 40, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 3.0, actualPct: 3.1, population: 180, variancePct: 0.1, overrideCount: 3 },
          { targetPct: 2.5, actualPct: 2.5, population: 120, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 2.0, actualPct: 2.3, population: 35, variancePct: 0.3, overrideCount: 2 },
          { targetPct: 1.5, actualPct: 1.5, population: 15, variancePct: 0.0, overrideCount: 0 },
        ],
        [
          { targetPct: 2.0, actualPct: 2.5, population: 3, variancePct: 0.5, overrideCount: 1 },
          { targetPct: 1.5, actualPct: 1.5, population: 15, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 1.0, actualPct: 1.2, population: 45, variancePct: 0.2, overrideCount: 2 },
          { targetPct: 0.5, actualPct: 0.5, population: 38, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 0.0, actualPct: 0.0, population: 20, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 0.0, actualPct: 0.0, population: 8, variancePct: 0.0, overrideCount: 0 },
        ],
        [
          { targetPct: 0.0, actualPct: 0.0, population: 1, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 0.0, actualPct: 0.0, population: 5, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 0.0, actualPct: 0.5, population: 20, variancePct: 0.5, overrideCount: 3 },
          { targetPct: 0.0, actualPct: 0.0, population: 18, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 0.0, actualPct: 0.0, population: 10, variancePct: 0.0, overrideCount: 0 },
          { targetPct: 0.0, actualPct: 0.0, population: 5, variancePct: 0.0, overrideCount: 0 },
        ],
      ],
      cycleName: "2026 Annual Merit",
      asOfDate: "2026-02-15",
    },
    exampleConfig: { varianceThreshold: 0.5, showPopulation: true },
    documentation: `Merit Matrix Heatmap displays actual compensation outcomes vs matrix policy targets.

**Layout:**
- Rows = Performance tiers (Far Exceeds → Below)
- Columns = Compa-ratio zones (<0.85 → >1.25)
- Each cell shows: actual avg increase %, target %, population count, variance

**Color Coding:**
- Blue: actual below target (under-delivered, possible savings)
- Grey/neutral: on target (within threshold)
- Red: actual above target (over-delivered, manager overrides)

**Drill-Down:**
Click any cell to view the list of employees in that performance-tier × compa-ratio-zone intersection, with their individual increases and any override flags.

**Key Metrics per Cell:**
- targetPct: The matrix-prescribed increase for this cell
- actualPct: What managers actually awarded (average)
- variancePct: actualPct - targetPct (positive means over-awarded)
- overrideCount: How many managers deviated from the matrix recommendation
- population: Employee count in this cell

**Required Data Sources:**
- **Calculus**: Per-employee increase calculations, compa-ratio computations
- **Conductor**: Performance ratings, merit matrix policy targets
- **MetaFactory**: Cycle configuration, employee-to-cell mapping

**Hub SDK Integration:**
Spoke apps push data via POST /api/ingest/conductor (performance tiers, matrix targets) or POST /api/ingest/metric-engine (calculated metrics). Cards auto-populate when data arrives.`,
    infrastructureNotes: "D3.js heatmap with SVG text overlays for population counts. Click handler emits drill-down events with employee IDs. Variance threshold is configurable to control sensitivity of color coding.",
  },

  {
    key: "pay_equity_dashboard",
    chartType: "pay_equity_dashboard",
    displayName: "Pay Equity Dashboard",
    description: "Composite dashboard for pay equity analysis: gender pay gap by peer group (lollipop chart), compa-ratio distribution by demographic (box plot), equity flags by category (stacked bar), and before vs after equity metrics comparison.",
    version: 1,
    category: "Compensation Cycle",
    tags: ["pay-equity", "gender", "demographic", "compa-ratio", "compliance", "deia", "dashboard", "compensation"],
    dataSchema: {
      type: "object",
      required: ["gapByPeerGroup", "compaRatioByDemographic", "equityFlags"],
      properties: {
        gapByPeerGroup: {
          type: "array",
          description: "Gender pay gap by peer group as lollipop/dot plot data",
          items: {
            type: "object",
            required: ["peerGroup", "gapPct"],
            properties: {
              peerGroup: { type: "string", description: "Peer group name (e.g., 'Eng IC L4', 'Sales Mgr')" },
              gapPct: { type: "number", description: "Pay gap as percentage (positive = male paid more, negative = female paid more)" },
              femaleAvg: { type: "number", description: "Average female compensation in this peer group" },
              maleAvg: { type: "number", description: "Average male compensation in this peer group" },
              headcount: { type: "number", description: "Total headcount in peer group" },
              significant: { type: "boolean", description: "Whether gap is statistically significant" },
            },
          },
        },
        compaRatioByDemographic: {
          type: "array",
          description: "Compa-ratio distribution by demographic category (rendered as box plots)",
          items: {
            type: "object",
            required: ["category", "min", "q1", "median", "q3", "max"],
            properties: {
              category: { type: "string", description: "Demographic category label (e.g., 'Female', 'Male', 'Non-Binary')" },
              min: { type: "number", description: "Minimum compa-ratio" },
              q1: { type: "number", description: "25th percentile compa-ratio" },
              median: { type: "number", description: "Median compa-ratio" },
              q3: { type: "number", description: "75th percentile compa-ratio" },
              max: { type: "number", description: "Maximum compa-ratio" },
              mean: { type: "number", description: "Mean compa-ratio for this demographic" },
              count: { type: "number", description: "Headcount in this category" },
            },
          },
        },
        equityFlags: {
          type: "object",
          required: ["categories", "critical", "warning", "info"],
          description: "Equity flag counts by category and severity (stacked bar)",
          properties: {
            categories: {
              type: "array",
              items: { type: "string" },
              description: "Flag categories (e.g., ['Gender', 'Ethnicity', 'Age', 'Disability', 'Veteran'])",
            },
            critical: {
              type: "array",
              items: { type: "number" },
              description: "Critical flag counts per category",
            },
            warning: {
              type: "array",
              items: { type: "number" },
              description: "Warning flag counts per category",
            },
            info: {
              type: "array",
              items: { type: "number" },
              description: "Informational flag counts per category",
            },
          },
        },
        beforeAfterMetrics: {
          type: "object",
          description: "Before vs after equity metrics comparison",
          properties: {
            metrics: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "before", "after"],
                properties: {
                  name: { type: "string", description: "Metric name (e.g., 'Adjusted Gender Gap', 'Median CR Ratio F/M')" },
                  before: { type: "number", description: "Value before the compensation cycle" },
                  after: { type: "number", description: "Value after the compensation cycle" },
                  unit: { type: "string", description: "Unit ('%', 'ratio', '$')" },
                  direction: { type: "string", description: "Desired direction: 'lower' or 'higher' or 'neutral'" },
                },
              },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        gapThreshold: { type: "number", description: "Gap percentage threshold for highlighting (default 3.0)" },
        flagColors: {
          type: "object",
          properties: {
            critical: { type: "string" },
            warning: { type: "string" },
            info: { type: "string" },
          },
        },
        showSignificance: { type: "boolean", description: "Show statistical significance markers on gap chart" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: {
      type: "object",
      description: "Read-only equity dashboard; no output signals.",
      properties: {},
    },
    defaults: {
      gapThreshold: 3.0,
      flagColors: { critical: "#ef4444", warning: "#f59e0b", info: "#3b82f6" },
      showSignificance: true,
    },
    exampleData: {
      gapByPeerGroup: [
        { peerGroup: "Eng IC L3-L4", gapPct: 2.1, femaleAvg: 142000, maleAvg: 145000, headcount: 85, significant: false },
        { peerGroup: "Eng IC L5-L6", gapPct: 4.8, femaleAvg: 188000, maleAvg: 197000, headcount: 42, significant: true },
        { peerGroup: "Eng Mgr", gapPct: 1.2, femaleAvg: 205000, maleAvg: 207500, headcount: 28, significant: false },
        { peerGroup: "Sales IC", gapPct: -0.5, femaleAvg: 125000, maleAvg: 124400, headcount: 60, significant: false },
        { peerGroup: "Sales Mgr", gapPct: 5.3, femaleAvg: 168000, maleAvg: 177000, headcount: 18, significant: true },
        { peerGroup: "Ops IC", gapPct: 0.8, femaleAvg: 95000, maleAvg: 95800, headcount: 110, significant: false },
      ],
      compaRatioByDemographic: [
        { category: "Female", min: 0.72, q1: 0.88, median: 0.98, q3: 1.08, max: 1.32, mean: 0.97, count: 420 },
        { category: "Male", min: 0.75, q1: 0.90, median: 1.02, q3: 1.12, max: 1.35, mean: 1.01, count: 480 },
        { category: "Non-Binary", min: 0.80, q1: 0.92, median: 1.00, q3: 1.10, max: 1.25, mean: 1.00, count: 25 },
      ],
      equityFlags: {
        categories: ["Gender", "Ethnicity", "Age", "Disability", "Veteran"],
        critical: [3, 5, 1, 0, 0],
        warning: [8, 12, 4, 2, 1],
        info: [15, 18, 8, 3, 2],
      },
      beforeAfterMetrics: {
        metrics: [
          { name: "Adjusted Gender Gap", before: 3.8, after: 2.4, unit: "%", direction: "lower" },
          { name: "Median CR Ratio F/M", before: 0.96, after: 0.98, unit: "ratio", direction: "higher" },
          { name: "Critical Flags", before: 12, after: 9, unit: "count", direction: "lower" },
          { name: "Equity Index Score", before: 78, after: 84, unit: "score", direction: "higher" },
        ],
      },
    },
    exampleConfig: { gapThreshold: 3.0, showSignificance: true },
    documentation: `Pay Equity Dashboard is a composite visualization for monitoring and reporting on pay equity during compensation cycles.

**Sub-visualizations:**
1. **Gender Pay Gap by Peer Group** — Lollipop/dot chart showing the gap percentage per peer group. Dots marked as "significant" are highlighted. Peer groups are job-function × level intersections for valid statistical comparison.
2. **Compa-Ratio by Demographic** — Box-and-whisker plots showing distribution spread per demographic category. Enables quick visual comparison of median positioning and spread.
3. **Equity Flags** — Stacked horizontal bars showing flag counts by category (Gender, Ethnicity, Age, etc.) with severity breakdown (Critical/Warning/Info).
4. **Before vs After Metrics** — Delta comparison cards showing key equity metrics pre- and post-cycle with directional indicators.

**Required Data Sources:**
- **Calculus**: Compa-ratio calculations, statistical gap analysis, significance testing
- **Conductor**: Demographic data, peer group definitions, equity flag rules
- **MetaFactory**: Protected category definitions, compliance thresholds

**Hub SDK Integration:**
Spoke apps push equity analysis data via POST /api/ingest/conductor (demographic data, flag rules) or POST /api/ingest/metric-engine (computed equity metrics). Cards auto-populate when data arrives.

**Statistical Notes:**
- Pay gaps should be calculated as (maleAvg - femaleAvg) / maleAvg × 100
- Statistical significance is typically assessed via regression controlling for job level, tenure, location, and performance
- Peer groups must have sufficient population (typically n ≥ 10) for valid comparison`,
    infrastructureNotes: "Composite dashboard. Lollipop chart and box plots use D3.js. Stacked bars use D3.js. Before/after cards are pure CSS with delta arrows. Requires careful demographic data handling — ensure no PII in drill-down payloads.",
  },

  {
    key: "governance_flags",
    chartType: "governance_flags",
    displayName: "Governance Flags",
    description: "Compensation governance dashboard showing flag counts by category with severity color-coding, flag resolution rate over time, top flagged departments/managers table, and drill-down to individual flagged employees.",
    version: 1,
    category: "Compensation Cycle",
    tags: ["governance", "compliance", "flags", "risk", "manager", "department", "resolution", "audit"],
    dataSchema: {
      type: "object",
      required: ["flagsByCategory", "resolutionOverTime"],
      properties: {
        flagsByCategory: {
          type: "array",
          description: "Flag counts by category, color-coded by severity (horizontal bar chart)",
          items: {
            type: "object",
            required: ["category", "severity", "count"],
            properties: {
              category: { type: "string", description: "Flag category (e.g., 'Over Matrix', 'Under Matrix', 'Range Violation', 'Equity Gap', 'Budget Exceeded')" },
              severity: { type: "string", description: "Severity level: critical | warning | info" },
              count: { type: "number", description: "Number of flags in this category" },
              resolvedCount: { type: "number", description: "Number already resolved" },
            },
          },
        },
        resolutionOverTime: {
          type: "object",
          required: ["dates", "opened", "resolved"],
          description: "Flag resolution rate tracked over time (line chart)",
          properties: {
            dates: { type: "array", items: { type: "string" }, description: "ISO date labels for x-axis" },
            opened: { type: "array", items: { type: "number" }, description: "Cumulative flags opened by date" },
            resolved: { type: "array", items: { type: "number" }, description: "Cumulative flags resolved by date" },
          },
        },
        topFlaggedEntities: {
          type: "array",
          description: "Top flagged departments or managers table",
          items: {
            type: "object",
            required: ["name", "type", "flagCount"],
            properties: {
              name: { type: "string", description: "Department or manager name" },
              type: { type: "string", description: "'department' or 'manager'" },
              flagCount: { type: "number", description: "Total flags" },
              criticalCount: { type: "number", description: "Critical severity flags" },
              warningCount: { type: "number", description: "Warning severity flags" },
              resolutionPct: { type: "number", description: "Percentage of flags resolved (0-100)" },
            },
          },
        },
        flagDetails: {
          type: "array",
          description: "Individual flag records for drill-down",
          items: {
            type: "object",
            required: ["flagId", "category", "severity"],
            properties: {
              flagId: { type: "string", description: "Unique flag identifier" },
              category: { type: "string" },
              severity: { type: "string" },
              employeeId: { type: "string", description: "Affected employee ID" },
              managerId: { type: "string", description: "Responsible manager ID" },
              department: { type: "string" },
              description: { type: "string", description: "Flag description" },
              status: { type: "string", description: "open | resolved | waived" },
              createdAt: { type: "string", description: "ISO date flag was created" },
              resolvedAt: { type: "string", description: "ISO date flag was resolved (if applicable)" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        severityColors: {
          type: "object",
          properties: {
            critical: { type: "string" },
            warning: { type: "string" },
            info: { type: "string" },
          },
        },
        topN: { type: "number", description: "Number of top flagged entities to show (default 10)" },
        enableDrillDown: { type: "boolean", description: "Enable click-through to individual flag details" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: {
      type: "object",
      description: "Drill-down event when a flag row or entity is clicked.",
      properties: {
        selectedFlag: {
          type: "object",
          properties: {
            flagId: { type: "string" },
            employeeId: { type: "string" },
            category: { type: "string" },
          },
        },
      },
    },
    defaults: {
      severityColors: { critical: "#ef4444", warning: "#f59e0b", info: "#3b82f6" },
      topN: 10,
      enableDrillDown: true,
    },
    exampleData: {
      flagsByCategory: [
        { category: "Over Matrix (+2%)", severity: "warning", count: 45, resolvedCount: 12 },
        { category: "Over Matrix (+5%)", severity: "critical", count: 8, resolvedCount: 3 },
        { category: "Under Matrix", severity: "info", count: 22, resolvedCount: 18 },
        { category: "Range Max Violation", severity: "critical", count: 12, resolvedCount: 5 },
        { category: "Range Min Violation", severity: "warning", count: 6, resolvedCount: 4 },
        { category: "Equity Gap >5%", severity: "critical", count: 5, resolvedCount: 2 },
        { category: "Budget Exceeded", severity: "warning", count: 15, resolvedCount: 8 },
        { category: "Missing Performance Rating", severity: "info", count: 30, resolvedCount: 25 },
      ],
      resolutionOverTime: {
        dates: ["2026-01-15", "2026-01-22", "2026-01-29", "2026-02-05", "2026-02-12", "2026-02-19"],
        opened: [25, 58, 92, 118, 135, 143],
        resolved: [5, 18, 35, 52, 68, 77],
      },
      topFlaggedEntities: [
        { name: "J. Smith (Sales Dir)", type: "manager", flagCount: 12, criticalCount: 3, warningCount: 5, resolutionPct: 25 },
        { name: "Engineering - Platform", type: "department", flagCount: 10, criticalCount: 2, warningCount: 4, resolutionPct: 40 },
        { name: "K. Chen (Eng VP)", type: "manager", flagCount: 8, criticalCount: 1, warningCount: 3, resolutionPct: 50 },
        { name: "Sales - Enterprise", type: "department", flagCount: 7, criticalCount: 2, warningCount: 3, resolutionPct: 29 },
        { name: "Operations - Global", type: "department", flagCount: 6, criticalCount: 0, warningCount: 4, resolutionPct: 67 },
      ],
      flagDetails: [
        { flagId: "FLG-001", category: "Over Matrix (+5%)", severity: "critical", employeeId: "EMP-1234", managerId: "MGR-045", department: "Sales", description: "Manager awarded 8.5% vs 3.5% matrix target", status: "open", createdAt: "2026-02-01" },
        { flagId: "FLG-002", category: "Range Max Violation", severity: "critical", employeeId: "EMP-2345", managerId: "MGR-012", department: "Engineering", description: "Proposed salary exceeds range max by $12,000", status: "resolved", createdAt: "2026-01-28", resolvedAt: "2026-02-10" },
      ],
    },
    exampleConfig: { topN: 10, enableDrillDown: true },
    documentation: `Governance Flags dashboard tracks compliance and risk during compensation cycles.

**Sub-visualizations:**
1. **Flag Count by Category** — Horizontal bar chart, sorted by count descending, color-coded by severity (critical=red, warning=amber, info=blue). Shows resolved vs total for each category.
2. **Resolution Rate Over Time** — Dual line chart showing cumulative flags opened vs resolved over the cycle timeline. Gap between lines = outstanding flags.
3. **Top Flagged Entities** — Table showing departments and managers with highest flag counts, broken down by severity, with resolution percentage.
4. **Flag Details (Drill-Down)** — Expandable detail view for individual flags showing employee, manager, description, and status.

**Flag Categories:**
- Over Matrix: Manager awarded more than matrix-prescribed percentage
- Under Matrix: Manager awarded less than matrix (potential retention risk)
- Range Violations: Proposed salary above max or below min of pay range
- Equity Gaps: Pay gap exceeds threshold for a peer group
- Budget Exceeded: Department or manager exceeded allocated merit budget
- Missing Data: Incomplete performance ratings or other required data

**Required Data Sources:**
- **Conductor**: Governance rules, flag definitions, threshold configurations
- **Calculus**: Per-employee calculations that trigger flags (range checks, matrix variance, equity analysis)
- **MetaFactory**: Organizational hierarchy for department/manager roll-ups

**Hub SDK Integration:**
Spoke apps push governance data via POST /api/ingest/conductor (flags, governance rules, resolution status). Cards auto-populate when data arrives.`,
    infrastructureNotes: "Composite dashboard. Horizontal bars and dual-line chart use D3.js. Table component is pure HTML/CSS with sort capability. Drill-down panel loads on click. Flag data should be pushed via POST /api/ingest/conductor.",
  },

  {
    key: "geo_compensation",
    chartType: "geo_compensation",
    displayName: "Geo Compensation",
    description: "Geographic compensation analysis dashboard: average increase by country, inflation overlay vs merit allocation, FX-normalized cost comparison across geos, and compa-ratio distribution by geo zone.",
    version: 1,
    category: "Compensation Cycle",
    tags: ["geographic", "compensation", "international", "inflation", "fx", "currency", "compa-ratio", "country"],
    dataSchema: {
      type: "object",
      required: ["increaseByCountry"],
      properties: {
        increaseByCountry: {
          type: "array",
          description: "Average merit increase by country (bar chart or map)",
          items: {
            type: "object",
            required: ["country", "countryCode", "avgIncreasePct"],
            properties: {
              country: { type: "string", description: "Country name" },
              countryCode: { type: "string", description: "ISO 3166-1 alpha-2 country code" },
              avgIncreasePct: { type: "number", description: "Average merit increase percentage" },
              headcount: { type: "number", description: "Employee count in this country" },
              budgetAllocated: { type: "number", description: "Merit budget allocated (local currency)" },
              budgetSpent: { type: "number", description: "Merit budget spent (local currency)" },
              localCurrency: { type: "string", description: "ISO 4217 currency code (e.g., USD, EUR, GBP)" },
            },
          },
        },
        inflationOverlay: {
          type: "array",
          description: "Inflation rate vs merit allocation by country for comparison",
          items: {
            type: "object",
            required: ["country", "inflationPct", "meritPct"],
            properties: {
              country: { type: "string" },
              countryCode: { type: "string" },
              inflationPct: { type: "number", description: "Current CPI inflation rate" },
              meritPct: { type: "number", description: "Average merit increase percentage" },
              realIncreasePct: { type: "number", description: "Merit minus inflation (real increase)" },
            },
          },
        },
        fxNormalizedCost: {
          type: "array",
          description: "FX-normalized merit cost comparison across geos (all converted to base currency)",
          items: {
            type: "object",
            required: ["country", "localCost", "normalizedCost"],
            properties: {
              country: { type: "string" },
              countryCode: { type: "string" },
              localCost: { type: "number", description: "Total merit cost in local currency" },
              localCurrency: { type: "string" },
              fxRate: { type: "number", description: "Exchange rate to base currency" },
              normalizedCost: { type: "number", description: "Merit cost converted to base currency" },
              baseCurrency: { type: "string", description: "Base currency code (e.g., USD)" },
              headcount: { type: "number" },
              costPerHead: { type: "number", description: "Normalized cost per employee" },
            },
          },
        },
        compaRatioByGeo: {
          type: "array",
          description: "Compa-ratio distribution by geographic zone (box plot data)",
          items: {
            type: "object",
            required: ["geoZone", "min", "q1", "median", "q3", "max"],
            properties: {
              geoZone: { type: "string", description: "Geographic zone (e.g., 'Americas', 'EMEA', 'APAC')" },
              min: { type: "number" },
              q1: { type: "number" },
              median: { type: "number" },
              q3: { type: "number" },
              max: { type: "number" },
              mean: { type: "number" },
              headcount: { type: "number" },
            },
          },
        },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        baseCurrency: { type: "string", description: "Base currency for FX normalization (default USD)" },
        inflationSource: { type: "string", description: "Source label for inflation data (e.g., 'IMF WEO Oct 2025')" },
        barOrientation: { type: "string", description: "'horizontal' or 'vertical' for country bars" },
        highlightThreshold: { type: "number", description: "Highlight countries where merit < inflation" },
        geoZoneColors: { type: "object", additionalProperties: { type: "string" }, description: "Map of geo zone to color" },
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    outputSchema: {
      type: "object",
      description: "Read-only geographic dashboard; no output signals.",
      properties: {},
    },
    defaults: {
      baseCurrency: "USD",
      barOrientation: "horizontal",
      highlightThreshold: 0,
    },
    exampleData: {
      increaseByCountry: [
        { country: "United States", countryCode: "US", avgIncreasePct: 3.5, headcount: 420, budgetAllocated: 3200000, budgetSpent: 2880000, localCurrency: "USD" },
        { country: "United Kingdom", countryCode: "GB", avgIncreasePct: 3.8, headcount: 85, budgetAllocated: 520000, budgetSpent: 495000, localCurrency: "GBP" },
        { country: "Germany", countryCode: "DE", avgIncreasePct: 4.2, headcount: 60, budgetAllocated: 380000, budgetSpent: 365000, localCurrency: "EUR" },
        { country: "India", countryCode: "IN", avgIncreasePct: 9.5, headcount: 200, budgetAllocated: 45000000, budgetSpent: 42500000, localCurrency: "INR" },
        { country: "Singapore", countryCode: "SG", avgIncreasePct: 4.0, headcount: 45, budgetAllocated: 280000, budgetSpent: 268000, localCurrency: "SGD" },
        { country: "Brazil", countryCode: "BR", avgIncreasePct: 7.2, headcount: 30, budgetAllocated: 1800000, budgetSpent: 1720000, localCurrency: "BRL" },
      ],
      inflationOverlay: [
        { country: "United States", countryCode: "US", inflationPct: 2.8, meritPct: 3.5, realIncreasePct: 0.7 },
        { country: "United Kingdom", countryCode: "GB", inflationPct: 3.2, meritPct: 3.8, realIncreasePct: 0.6 },
        { country: "Germany", countryCode: "DE", inflationPct: 2.5, meritPct: 4.2, realIncreasePct: 1.7 },
        { country: "India", countryCode: "IN", inflationPct: 5.5, meritPct: 9.5, realIncreasePct: 4.0 },
        { country: "Singapore", countryCode: "SG", inflationPct: 3.0, meritPct: 4.0, realIncreasePct: 1.0 },
        { country: "Brazil", countryCode: "BR", inflationPct: 4.8, meritPct: 7.2, realIncreasePct: 2.4 },
      ],
      fxNormalizedCost: [
        { country: "United States", countryCode: "US", localCost: 2880000, localCurrency: "USD", fxRate: 1.0, normalizedCost: 2880000, baseCurrency: "USD", headcount: 420, costPerHead: 6857 },
        { country: "United Kingdom", countryCode: "GB", localCost: 495000, localCurrency: "GBP", fxRate: 1.27, normalizedCost: 628650, baseCurrency: "USD", headcount: 85, costPerHead: 7396 },
        { country: "Germany", countryCode: "DE", localCost: 365000, localCurrency: "EUR", fxRate: 1.08, normalizedCost: 394200, baseCurrency: "USD", headcount: 60, costPerHead: 6570 },
        { country: "India", countryCode: "IN", localCost: 42500000, localCurrency: "INR", fxRate: 0.012, normalizedCost: 510000, baseCurrency: "USD", headcount: 200, costPerHead: 2550 },
        { country: "Singapore", countryCode: "SG", localCost: 268000, localCurrency: "SGD", fxRate: 0.74, normalizedCost: 198320, baseCurrency: "USD", headcount: 45, costPerHead: 4407 },
        { country: "Brazil", countryCode: "BR", localCost: 1720000, localCurrency: "BRL", fxRate: 0.20, normalizedCost: 344000, baseCurrency: "USD", headcount: 30, costPerHead: 11467 },
      ],
      compaRatioByGeo: [
        { geoZone: "Americas", min: 0.70, q1: 0.88, median: 1.00, q3: 1.12, max: 1.40, mean: 1.00, headcount: 450 },
        { geoZone: "EMEA", min: 0.75, q1: 0.90, median: 1.02, q3: 1.14, max: 1.35, mean: 1.02, headcount: 145 },
        { geoZone: "APAC", min: 0.72, q1: 0.85, median: 0.96, q3: 1.08, max: 1.30, mean: 0.96, headcount: 245 },
      ],
    },
    exampleConfig: { baseCurrency: "USD", barOrientation: "horizontal" },
    documentation: `Geo Compensation dashboard provides geographic analysis for multi-country compensation cycles.

**Sub-visualizations:**
1. **Average Increase by Country** — Horizontal bar chart showing merit increase % per country, sorted by headcount or percentage. Optionally rendered as a tile cartogram for geographic context.
2. **Inflation Overlay** — Grouped bar or lollipop chart comparing CPI inflation rate vs merit allocation per country. Countries where merit < inflation are highlighted (negative real increase).
3. **FX-Normalized Cost** — Bar chart comparing total merit cost across geos after currency normalization. Enables apples-to-apples cost comparison. Shows cost-per-head to account for headcount differences.
4. **Compa-Ratio by Geo Zone** — Box-and-whisker plots showing compa-ratio distribution per geographic zone (Americas, EMEA, APAC). Highlights whether zones are systematically above or below market.

**Required Data Sources:**
- **Calculus**: Per-employee increase calculations, compa-ratio computations
- **Conductor**: Country-level budget allocations, inflation data, FX rates
- **MetaFactory**: Country-to-geo-zone mapping, currency configurations, organizational hierarchy

**Hub SDK Integration:**
Spoke apps push geographic compensation data via POST /api/ingest/conductor (country budgets, inflation rates, FX rates). Cards auto-populate when data arrives.

**FX Normalization:**
All costs are converted to a base currency (default USD) using the fxRate provided. The fxRate should represent the conversion factor: localAmount × fxRate = baseCurrencyAmount. FX rates should be snapshotted at cycle open to avoid mid-cycle volatility.

**Inflation Sources:**
Common sources: IMF World Economic Outlook, national CPI indices, Mercer/WTW country guides. The inflationSource config field documents the data provenance.`,
    infrastructureNotes: "Composite dashboard. Bar charts and box plots use D3.js. FX normalization is applied at data ingestion or display time. Country codes follow ISO 3166-1 alpha-2. Inflation data typically pushed from Conductor via POST /api/ingest/conductor.",
  },
  // Card #72: PeopleAnalyst Forecasts bundle — workbench-visible bundle for incoming forecast cards
  {
    key: "people_analyst_forecasts",
    chartType: "confidence_band",
    displayName: "PeopleAnalyst Forecasts",
    description: "Forecast visualization cards from PeopleAnalyst (Monte Carlo, headcount projections, workforce planning). Accepts incoming cards via POST /api/ingest/people-analyst.",
    version: 1,
    category: "PeopleAnalyst Forecasts",
    tags: ["people-analyst", "forecast", "monte-carlo", "workforce-planning"],
    dataSchema: {
      type: "object",
      required: ["data"],
      properties: {
        data: { type: "array", items: { type: "object", required: ["x", "y"], properties: { x: { type: "number" }, y: { type: "number" }, lo1: { type: "number" }, hi1: { type: "number" }, lo2: { type: "number" }, hi2: { type: "number" } } } },
        timeSeries: { type: "array", description: "Raw time series from PeopleAnalyst" },
        results: { type: "object", description: "Forecast results" },
        assumptions: { type: "object", description: "Scenario assumptions" },
      },
    },
    configSchema: { type: "object", properties: { lineColor: { type: "string" }, bandColors: { type: "array", items: { type: "string" } }, xLabel: { type: "string" }, yLabel: { type: "string" }, scenario: { type: "string", description: "Scenario toggle (e.g. base, optimistic, pessimistic)" } } },
    outputSchema: { type: "object", description: "Rendered forecast chart" },
    defaults: { lineColor: "#5b636a", bandColors: ["#a3adb8", "#e0e4e9"] },
    exampleData: { data: [{ x: 0, y: 100, lo1: 95, hi1: 105, lo2: 90, hi2: 110 }] },
    exampleConfig: { xLabel: "Month", yLabel: "Headcount", scenario: "base" },
    documentation: "PeopleAnalyst forecast cards. Use scenario config to toggle between base/optimistic/pessimistic. Data pushed via POST /api/ingest/people-analyst.",
    infrastructureNotes: "Accepts incoming cards from PeopleAnalyst. Scenario toggle in dashboard for headcount and workforce planning views.",
  },
];
