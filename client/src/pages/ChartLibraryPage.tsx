import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/charts";
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
];

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
              <div className="border border-border rounded-md p-2 bg-background">
                {chart.component}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
