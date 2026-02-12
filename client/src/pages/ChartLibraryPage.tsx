import { Card, CardContent } from "@/components/ui/card";
import {
  ConfidenceBandChart,
  AlluvialChart,
  WaffleBarChart,
  BulletBarChart,
  SlopeComparisonChart,
  BubbleScatterChart,
} from "@/components/charts";
import type {
  ConfidenceBandDatum,
  AlluvialFlow,
  WaffleBarGroup,
  BulletBarDatum,
  SlopeItem,
  BubbleDatum,
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
          <Card key={chart.title} data-testid={`chart-card-${chart.title.toLowerCase().replace(/[\s/]+/g, "-")}`}>
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
