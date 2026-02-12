import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ConfidenceBandChart,
  AlluvialChart,
  WaffleBarChart,
  BulletBarChart,
  SlopeComparisonChart,
  BubbleScatterChart,
  BoxWhiskerChart,
  StripTimelineChart,
  WafflePercentChart,
  HeatmapChart,
  StripDotChart,
  MultiLineChart,
  TileCartogramChart,
  TimelineMilestoneChart,
  ControlChart,
  DendrogramChart,
  RadialBarChart,
  BumpChart,
  SparklineRowsChart,
  StackedAreaChart,
  TILE_PRESETS,
} from "@/components/charts";
import type { TilePreset } from "@/components/charts";
import type {
  ConfidenceBandDatum,
  AlluvialFlow,
  WaffleBarGroup,
  BulletBarDatum,
  SlopeItem,
  BubbleDatum,
  BoxWhiskerDatum,
  StripTimelineRow,
  StripDotRow,
  MultiLineSeries,
  TileCartogramDatum,
  TimelineMilestone,
  DendrogramNode,
  RadialBarDatum,
  BumpChartItem,
  SparklineRow,
  StackedAreaSeries,
} from "@/components/charts";

const CONFIDENCE_DATA: ConfidenceBandDatum[] = (() => {
  const d: ConfidenceBandDatum[] = [];
  let y = 280;
  for (let x = 1; x <= 12; x++) {
    y += (Math.sin(x * 0.7) + 0.6) * 40;
    const isForecast = x > 7;
    d.push({
      x,
      y: Math.round(y),
      ...(isForecast
        ? {
            lo1: Math.round(y - 30 * (x - 7)),
            hi1: Math.round(y + 40 * (x - 7)),
            lo2: Math.round(y - 50 * (x - 7)),
            hi2: Math.round(y + 65 * (x - 7)),
          }
        : {}),
    });
  }
  return d;
})();

const ALLUVIAL_FLOWS: AlluvialFlow[] = [
  { from: "Engineering", to: "Engineering", value: 120 },
  { from: "Engineering", to: "Product", value: 15 },
  { from: "Engineering", to: "Management", value: 8 },
  { from: "Sales", to: "Sales", value: 80 },
  { from: "Sales", to: "Marketing", value: 12 },
  { from: "Sales", to: "Management", value: 5 },
  { from: "Marketing", to: "Marketing", value: 45 },
  { from: "Marketing", to: "Product", value: 8 },
  { from: "Product", to: "Product", value: 35 },
  { from: "Product", to: "Engineering", value: 6 },
];

const ALLUVIAL_COLORS: Record<string, string> = {
  Engineering: "#0f69ff",
  Sales: "#5b636a",
  Marketing: "#a3adb8",
  Product: "#232a31",
  Management: "#e0e4e9",
};

const WAFFLE_GROUPS: WaffleBarGroup[] = [
  {
    label: "2020",
    segments: [
      { label: "Tech", value: 8, color: "#0f69ff" },
      { label: "Ops", value: 5, color: "#5b636a" },
      { label: "Sales", value: 3, color: "#a3adb8" },
    ],
  },
  {
    label: "2025",
    segments: [
      { label: "Tech", value: 12, color: "#0f69ff" },
      { label: "Ops", value: 7, color: "#5b636a" },
      { label: "Sales", value: 5, color: "#a3adb8" },
    ],
  },
];

const BULLET_DATA: BulletBarDatum[] = [
  { label: "J. Haraldsson", ranges: [50, 35, 20], value: 32, marker: 40 },
  { label: "D. Sigurdsdottir", ranges: [50, 35, 20], value: 28, marker: 35 },
  { label: "E. Eriksson", ranges: [50, 35, 20], value: 38, marker: 30 },
  { label: "K. Bjornsdottir", ranges: [50, 35, 20], value: 22, marker: 25 },
  { label: "A. Magnusson", ranges: [50, 35, 20], value: 41, marker: 38 },
];

const SLOPE_ITEMS: SlopeItem[] = [
  { label: "Engineering", startValue: 4, endValue: 10 },
  { label: "Sales", startValue: 13, endValue: 15 },
  { label: "Marketing", startValue: 5, endValue: 8 },
];

const BUBBLE_DATA: BubbleDatum[] = [
  { x: 3, y: 9, size: 35, label: "Eng", color: "#232a31" },
  { x: 5, y: 10, size: 62, label: "Sales", color: "#5b636a" },
  { x: 7, y: 11, size: 28, label: "Ops", color: "#a3adb8" },
  { x: 14, y: 13, size: 97, label: "Exec", color: "#0f69ff" },
  { x: 16, y: 14, size: 42, label: "HR", color: "#e0e4e9" },
];

const BOX_WHISKER_DATA: BoxWhiskerDatum[] = [
  { label: "Mon", min: 120, q1: 320, median: 520, q3: 680, max: 920 },
  { label: "Tue", min: 180, q1: 380, median: 480, q3: 620, max: 780 },
  { label: "Wed", min: 100, q1: 280, median: 420, q3: 560, max: 700 },
  { label: "Thu", min: 150, q1: 300, median: 460, q3: 580, max: 820 },
  { label: "Fri", min: 90, q1: 260, median: 380, q3: 520, max: 680 },
];

const STRIP_TIMELINE_ROWS: StripTimelineRow[] = [
  {
    label: "NO",
    cells: [
      {}, {}, {}, {}, {},
      { value: 3, color: "#0f69ff" },
      { value: 5, color: "#0f69ff" },
      { value: 7, color: "#0f69ff" },
      {}, {}, {}, {}, {}, {}, {}, {},
    ],
  },
  {
    label: "DK",
    cells: [
      {}, {},
      { value: 1, color: "#5b636a" },
      {},
      { value: 4, color: "#5b636a" },
      { value: 5, color: "#5b636a" },
      {},
      { value: 8, color: "#5b636a" },
      { value: 12, color: "#5b636a" },
      { value: 9, color: "#5b636a" },
      {}, {}, {}, {}, {}, {},
    ],
  },
  {
    label: "SE",
    cells: [
      {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
      { value: 4, color: "#a3adb8" },
      { value: 6, color: "#a3adb8" },
      {}, {},
    ],
  },
];

const HEATMAP_DATA = [
  [6, 3, 7, 5],
  [8, 2, 6, 4],
  [5, 9, 5, 3],
  [4, 7, 4, 2],
  [3, 5, 3, 8],
  [7, 4, 6, 1],
  [9, 6, 2, 7],
  [2, 8, 5, 4],
];

const STRIP_DOT_ROWS: StripDotRow[] = [
  {
    label: "A",
    events: [
      { position: 2, color: "#232a31" }, { position: 3, color: "#232a31" },
      { position: 8, color: "#0f69ff" }, { position: 9, color: "#0f69ff" },
      { position: 14, color: "#232a31" }, { position: 15, color: "#232a31" },
      { position: 16, color: "#232a31" }, { position: 17, color: "#232a31" },
      { position: 22, color: "#0f69ff" }, { position: 23, color: "#0f69ff" },
    ],
  },
  {
    label: "B",
    events: [
      { position: 1, color: "#232a31" }, { position: 2, color: "#232a31" },
      { position: 6, color: "#0f69ff" }, { position: 7, color: "#0f69ff" },
      { position: 12, color: "#232a31" },
      { position: 18, color: "#0f69ff" },
      { position: 24, color: "#232a31" }, { position: 25, color: "#232a31" },
    ],
  },
  {
    label: "C",
    events: [
      { position: 3, color: "#0f69ff" }, { position: 4, color: "#0f69ff" },
      { position: 9, color: "#232a31" }, { position: 10, color: "#232a31" },
      { position: 15, color: "#0f69ff" },
      { position: 20, color: "#232a31" }, { position: 21, color: "#232a31" },
    ],
  },
  {
    label: "D",
    events: [
      { position: 5, color: "#232a31" },
      { position: 10, color: "#0f69ff" }, { position: 11, color: "#0f69ff" },
      { position: 16, color: "#232a31" },
      { position: 22, color: "#0f69ff" }, { position: 23, color: "#0f69ff" },
    ],
  },
];

const MULTI_LINE_SERIES: MultiLineSeries[] = (() => {
  const gen = (seed: number, len: number) => {
    const vals: number[] = [];
    let v = seed;
    for (let i = 0; i < len; i++) {
      v += (Math.sin(i * 0.4 + seed) * 0.04) + (Math.random() - 0.52) * 0.02;
      vals.push(parseFloat(v.toFixed(3)));
    }
    return vals;
  };
  return [
    { label: "Eng", values: gen(0.45, 50), color: "#0f69ff" },
    { label: "Sales", values: gen(0.35, 50), color: "#5b636a" },
    { label: "Ops", values: gen(0.30, 50), color: "#a3adb8" },
  ];
})();

const MULTI_LINE_LABELS = (() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Array.from({ length: 50 }, (_, i) => months[i % 12]);
})();

const US_TILES: TileCartogramDatum[] = [
  { id: "AK", label: "AK", value: 12, row: 7, col: 0 },
  { id: "HI", label: "HI", value: 8, row: 7, col: 1 },
  { id: "WA", label: "WA", value: 45, row: 1, col: 1 },
  { id: "OR", label: "OR", value: 32, row: 2, col: 1 },
  { id: "CA", label: "CA", value: 78, row: 3, col: 1 },
  { id: "NV", label: "NV", value: 22, row: 3, col: 2 },
  { id: "ID", label: "ID", value: 18, row: 2, col: 2 },
  { id: "MT", label: "MT", value: 15, row: 1, col: 2 },
  { id: "WY", label: "WY", value: 10, row: 2, col: 3 },
  { id: "UT", label: "UT", value: 25, row: 3, col: 3 },
  { id: "AZ", label: "AZ", value: 35, row: 4, col: 2 },
  { id: "CO", label: "CO", value: 42, row: 3, col: 4 },
  { id: "NM", label: "NM", value: 20, row: 4, col: 3 },
  { id: "ND", label: "ND", value: 8, row: 1, col: 3 },
  { id: "SD", label: "SD", value: 9, row: 2, col: 4 },
  { id: "NE", label: "NE", value: 14, row: 2, col: 5 },
  { id: "KS", label: "KS", value: 16, row: 3, col: 5 },
  { id: "OK", label: "OK", value: 19, row: 4, col: 4 },
  { id: "TX", label: "TX", value: 65, row: 5, col: 3 },
  { id: "MN", label: "MN", value: 38, row: 1, col: 4 },
  { id: "IA", label: "IA", value: 20, row: 2, col: 6 },
  { id: "MO", label: "MO", value: 28, row: 3, col: 6 },
  { id: "AR", label: "AR", value: 15, row: 4, col: 5 },
  { id: "LA", label: "LA", value: 22, row: 5, col: 5 },
  { id: "WI", label: "WI", value: 30, row: 1, col: 5 },
  { id: "IL", label: "IL", value: 55, row: 2, col: 7 },
  { id: "IN", label: "IN", value: 32, row: 2, col: 8 },
  { id: "MI", label: "MI", value: 40, row: 1, col: 7 },
  { id: "OH", label: "OH", value: 48, row: 2, col: 9 },
  { id: "KY", label: "KY", value: 22, row: 3, col: 7 },
  { id: "TN", label: "TN", value: 30, row: 3, col: 8 },
  { id: "MS", label: "MS", value: 12, row: 4, col: 6 },
  { id: "AL", label: "AL", value: 18, row: 4, col: 7 },
  { id: "GA", label: "GA", value: 42, row: 4, col: 8 },
  { id: "FL", label: "FL", value: 60, row: 5, col: 9 },
  { id: "SC", label: "SC", value: 20, row: 4, col: 9 },
  { id: "NC", label: "NC", value: 35, row: 3, col: 9 },
  { id: "VA", label: "VA", value: 40, row: 2, col: 10 },
  { id: "WV", label: "WV", value: 10, row: 3, col: 10 },
  { id: "PA", label: "PA", value: 52, row: 1, col: 9 },
  { id: "NY", label: "NY", value: 72, row: 1, col: 8 },
  { id: "NJ", label: "NJ", value: 45, row: 2, col: 11 },
  { id: "DE", label: "DE", value: 8, row: 3, col: 11 },
  { id: "MD", label: "MD", value: 30, row: 4, col: 10 },
  { id: "CT", label: "CT", value: 22, row: 1, col: 10 },
  { id: "RI", label: "RI", value: 5, row: 1, col: 11 },
  { id: "MA", label: "MA", value: 38, row: 0, col: 11 },
  { id: "VT", label: "VT", value: 6, row: 0, col: 9 },
  { id: "NH", label: "NH", value: 8, row: 0, col: 10 },
  { id: "ME", label: "ME", value: 10, row: 0, col: 12 },
];

const TIMELINE_MILESTONES: TimelineMilestone[] = [
  { label: "A", position: 2018, height: 2, color: "#a3adb8" },
  { label: "B", position: 2019, height: 4, color: "#0f69ff" },
  { label: "C", position: 2020, height: 2, color: "#a3adb8" },
  { label: "D", position: 2020.5, height: 6, color: "#5b636a" },
  { label: "E", position: 2021, height: 5, color: "#232a31" },
  { label: "F", position: 2023, height: 1, color: "#a3adb8" },
];

const CONTROL_DATA = [150, 172, 148, 195, 180, 165, 140, 155, 170, 160];

const DENDROGRAM_ROOT: DendrogramNode = {
  height: 5,
  children: [
    {
      height: 4,
      children: [
        {
          height: 2,
          children: [
            { label: "A", height: 0 },
            { label: "B", height: 0 },
          ],
        },
        { label: "C", height: 0 },
      ],
    },
    {
      height: 3.5,
      children: [
        {
          height: 2.5,
          children: [
            { label: "D", height: 0 },
            { label: "E", height: 0 },
          ],
        },
        {
          height: 3,
          children: [
            { label: "F", height: 0 },
            {
              height: 1.5,
              children: [
                { label: "G", height: 0 },
                { label: "H", height: 0 },
                { label: "I", height: 0 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const RADIAL_DATA: RadialBarDatum[] = [
  { label: "Engineering", value: 82, color: "#0f69ff" },
  { label: "Sales", value: 68, color: "#5b636a" },
  { label: "Operations", value: 45, color: "#232a31" },
];

const BUMP_ITEMS: BumpChartItem[] = [
  { label: "Engineering", startRank: 1, endRank: 3, startValue: 1, endValue: 3, startColor: "#0f69ff", endColor: "#0f69ff" },
  { label: "Sales", startRank: 2, endRank: 1, startValue: 5, endValue: 10, startColor: "#5b636a", endColor: "#5b636a" },
  { label: "Operations", startRank: 3, endRank: 2, startValue: 4, endValue: 8, startColor: "#232a31", endColor: "#a3adb8" },
];

const SPARKLINE_ROWS: SparklineRow[] = [
  { label: "A", value: 240, data: [180, 200, 210, 230, 260, 280, 270, 250, 240, 235, 240] },
  { label: "B", value: 135, data: [120, 125, 128, 130, 132, 140, 145, 142, 138, 135, 135] },
  { label: "C", value: 90, data: [80, 82, 88, 92, 95, 98, 96, 93, 90, 88, 90] },
  { label: "D", value: 85, data: [82, 83, 84, 84, 85, 86, 88, 90, 89, 87, 85] },
];

const STACKED_AREA: StackedAreaSeries[] = [
  { label: "Engineering", values: [120, 130, 110, 140, 100, 80, 150, 120, 180, 140, 100, 130], color: "#232a31" },
  { label: "Sales", values: [80, 100, 120, 90, 110, 130, 100, 120, 80, 110, 100, 90], color: "#5b636a" },
  { label: "Marketing", values: [60, 80, 100, 120, 90, 80, 70, 100, 110, 90, 80, 70], color: "#a3adb8" },
  { label: "Operations", values: [40, 50, 60, 80, 70, 60, 80, 90, 100, 70, 60, 50], color: "#0f69ff" },
];

const CHARTS = [
  {
    title: "Confidence Band",
    description: "Forecast with uncertainty bands showing predicted range",
    component: (
      <ConfidenceBandChart data={CONFIDENCE_DATA} xLabel="Month" yLabel="Headcount" />
    ),
  },
  {
    title: "Alluvial Flow",
    description: "How employees flow between departments over time",
    component: (
      <AlluvialChart
        flows={ALLUVIAL_FLOWS}
        colors={ALLUVIAL_COLORS}
        leftLabel="2020"
        rightLabel="2025"
      />
    ),
  },
  {
    title: "Waffle Grid Bar",
    description: "Composition breakdown with countable grid cells",
    component: <WaffleBarChart groups={WAFFLE_GROUPS} />,
  },
  {
    title: "Bullet / Range Bar",
    description: "Individual performance against ranges and targets",
    component: <BulletBarChart data={BULLET_DATA} />,
  },
  {
    title: "Slope Comparison",
    description: "Period-over-period growth with percentage change",
    component: (
      <SlopeComparisonChart items={SLOPE_ITEMS} startYear="'20" endYear="'25" />
    ),
  },
  {
    title: "Bubble Scatter",
    description: "Multi-dimensional comparison by position, size, and color",
    component: (
      <BubbleScatterChart data={BUBBLE_DATA} xLabel="Tenure (years)" yLabel="Engagement" />
    ),
  },
  {
    title: "Box & Whisker",
    description: "Distribution spread with quartiles, median, and outlier range",
    component: <BoxWhiskerChart data={BOX_WHISKER_DATA} />,
  },
  {
    title: "Strip Timeline",
    description: "Sequential blocks with highlighted events and counts per row",
    component: <StripTimelineChart rows={STRIP_TIMELINE_ROWS} />,
  },
  {
    title: "Waffle Percentage",
    description: "Single metric as filled grid cells for intuitive proportions",
    component: <WafflePercentChart percent={32} />,
  },
  {
    title: "Heatmap",
    description: "Color-intensity matrix for cross-dimensional comparison",
    component: <HeatmapChart data={HEATMAP_DATA} />,
  },
  {
    title: "Strip Dot Plot",
    description: "Categorical event positions across rows with color coding",
    component: <StripDotChart rows={STRIP_DOT_ROWS} />,
  },
  {
    title: "Multi-Line Series",
    description: "Multiple time series lines with reference line for comparison",
    component: (
      <MultiLineChart
        series={MULTI_LINE_SERIES}
        xLabels={MULTI_LINE_LABELS}
        referenceLine={0.35}
        yLabel="Retention"
      />
    ),
  },
  {
    title: "Tile Cartogram",
    description: "Geographic tile map with color-coded values per region",
    component: null,
    render: () => <TileCartogramTabbed />,
  },
  {
    title: "Timeline Milestones",
    description: "Event markers at varying heights along a time axis",
    component: <TimelineMilestoneChart milestones={TIMELINE_MILESTONES} />,
  },
  {
    title: "Control / SPC",
    description: "Statistical process control with UCL/LCL bands and sigma zones",
    component: <ControlChart data={CONTROL_DATA} />,
  },
  {
    title: "Dendrogram",
    description: "Hierarchical clustering tree with branching structure",
    component: <DendrogramChart root={DENDROGRAM_ROOT} />,
  },
  {
    title: "Radial Bar",
    description: "Concentric arc bars for proportional comparison",
    component: <RadialBarChart data={RADIAL_DATA} maxValue={100} />,
  },
  {
    title: "Bump / Rank",
    description: "Rank changes between two periods with crossing lines",
    component: <BumpChart items={BUMP_ITEMS} startYear={2020} endYear={2025} />,
  },
  {
    title: "Sparkline Rows",
    description: "Labeled rows with individual sparklines for quick comparison",
    component: <SparklineRowsChart rows={SPARKLINE_ROWS} />,
  },
  {
    title: "Stacked Area",
    description: "Layered filled areas showing composition over time",
    component: <StackedAreaChart series={STACKED_AREA} />,
  },
];

function TileCartogramTabbed() {
  const allPresets = [
    { key: "us", label: "US States", tiles: US_TILES } as TilePreset,
    ...TILE_PRESETS,
  ];
  const [active, setActive] = useState("us");
  const preset = allPresets.find((p) => p.key === active) ?? allPresets[0];

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {allPresets.map((p) => (
          <Badge
            key={p.key}
            data-testid={`tile-tab-${p.key}`}
            onClick={() => setActive(p.key)}
            variant={active === p.key ? "default" : "secondary"}
            className={`cursor-pointer text-[10px] ${active === p.key ? "bg-[#0f69ff]" : ""}`}
          >
            {p.label}
          </Badge>
        ))}
      </div>
      <div className="border border-border rounded-md p-2 bg-background" data-testid="tile-cartogram-display">
        <TileCartogramChart tiles={preset.tiles} sectionLabels={preset.sectionLabels} />
      </div>
    </div>
  );
}

export function ChartLibraryPage() {
  return (
    <div className="p-5 space-y-6" data-testid="page-chart-library">
      <div>
        <h1 className="text-lg font-semibold mb-1">Chart Library</h1>
        <p className="text-xs text-muted-foreground">
          Data visualization components for the card ecosystem. Connect to any metric and render on cards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHARTS.map((chart) => (
          <Card key={chart.title} data-testid={`chart-card-${chart.title.toLowerCase().replace(/[\s/&]+/g, "-")}`}>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-0.5">{chart.title}</h3>
              <p className="text-[10px] text-muted-foreground mb-3">{chart.description}</p>
              {"render" in chart && chart.render ? (
                chart.render()
              ) : (
                <div className="border border-border rounded-md p-2 bg-background">
                  {chart.component}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
