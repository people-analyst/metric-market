# Chart Library — Portable Code & Documentation

This document contains the **code and supporting documentation** for the People Analytics Toolbox Chart Library so you can copy-paste it into another application and render the same graph library elsewhere.

---

## 1. Overview

- **Purpose:** Data visualization components for a card ecosystem. Connect to any metric and render on cards.
- **Stack:** React 18, TypeScript, D3.js (d3), SVG.
- **Location in repo:** `client/src/components/charts/` and `client/src/pages/ChartLibraryPage.tsx`.

### Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "d3": "^7.9.0"
}
```

TypeScript types are exported from each component; use `"strict": true` and the types below.

---

## 2. Chart Index (all components)

| Key | Component | Description |
|-----|-----------|-------------|
| confidence_band | ConfidenceBandChart | Forecast with uncertainty bands |
| alluvial | AlluvialChart | Flow between categories over time |
| waffle_bar | WaffleBarChart | Composition breakdown with grid cells |
| bullet_bar | BulletBarChart | Performance against ranges and targets |
| slope_comparison | SlopeComparisonChart | Period-over-period growth with % change |
| bubble_scatter | BubbleScatterChart | Multi-dimensional comparison (position, size, color) |
| box_whisker | BoxWhiskerChart | Distribution with quartiles and median |
| strip_timeline | StripTimelineChart | Sequential blocks with events per row |
| waffle_percent | WafflePercentChart | Single metric as filled grid proportion |
| heatmap | HeatmapChart | Color-intensity matrix |
| strip_dot | StripDotChart | Categorical event positions per row |
| multi_line | MultiLineChart | Multiple time series with optional reference line |
| tile_cartogram | TileCartogramChart | Geographic tile map with values per region |
| timeline_milestone | TimelineMilestoneChart | Event markers along time axis |
| control | ControlChart | Statistical process control (UCL/LCL, sigma zones) |
| dendrogram | DendrogramChart | Hierarchical clustering tree |
| radial_bar | RadialBarChart | Concentric arc bars |
| bump | BumpChart | Rank changes between two periods |
| sparkline_rows | SparklineRowsChart | Rows with sparklines |
| stacked_area | StackedAreaChart | Layered filled areas over time |
| range_strip | RangeStripChart | Dollar-scale compensation ranges |
| range_strip_aligned | RangeStripAlignedChart | Percentile rows with level markers |
| range_target_bullet | RangeTargetBulletChart | Market/target/actual bullet overlay |

---

## 3. Component exports (barrel)

Create a file `charts/index.ts` that re-exports all chart components and their types. Example structure (adjust paths to your app):

```ts
export { ConfidenceBandChart } from "./ConfidenceBandChart";
export type { ConfidenceBandDatum, ConfidenceBandChartProps } from "./ConfidenceBandChart";
export { AlluvialChart } from "./AlluvialChart";
export type { AlluvialFlow, AlluvialChartProps } from "./AlluvialChart";
export { WaffleBarChart } from "./WaffleBarChart";
export type { WaffleBarSegment, WaffleBarGroup, WaffleBarChartProps } from "./WaffleBarChart";
export { BulletBarChart } from "./BulletBarChart";
export type { BulletBarDatum, BulletBarChartProps } from "./BulletBarChart";
export { SlopeComparisonChart } from "./SlopeComparisonChart";
export type { SlopeItem, SlopeComparisonChartProps } from "./SlopeComparisonChart";
export { BubbleScatterChart } from "./BubbleScatterChart";
export type { BubbleDatum, BubbleScatterChartProps } from "./BubbleScatterChart";
// ... (add same pattern for BoxWhisker, StripTimeline, WafflePercent, Heatmap, StripDot,
//      MultiLine, TileCartogram, TimelineMilestone, ControlChart, Dendrogram, RadialBar,
//      BumpChart, SparklineRows, StackedArea, RangeStrip, RangeStripAligned, RangeTargetBullet)
```

---

## 4. Chart component source code

Below is the full source for each chart. Copy each block into a file with the same name (e.g. `ConfidenceBandChart.tsx`).

### 4.1 ConfidenceBandChart.tsx

```tsx
import { useMemo } from "react";
import * as d3 from "d3";

export interface ConfidenceBandDatum {
  x: number;
  y: number;
  lo1?: number;
  hi1?: number;
  lo2?: number;
  hi2?: number;
}

export interface ConfidenceBandChartProps {
  data: ConfidenceBandDatum[];
  width?: number;
  height?: number;
  lineColor?: string;
  bandColors?: [string, string];
  xLabel?: string;
  yLabel?: string;
}

export function ConfidenceBandChart({
  data,
  width = 320,
  height = 180,
  lineColor = "#5b636a",
  bandColors = ["#a3adb8", "#e0e4e9"],
  xLabel,
  yLabel,
}: ConfidenceBandChartProps) {
  const pad = { t: 12, r: 16, b: 28, l: 36 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;

  const { xScale, yScale, linePath, band1, band2, xTicks, yTicks } = useMemo(() => {
    const xExt = d3.extent(data, (d) => d.x) as [number, number];
    const allY = data.flatMap((d) => [d.y, d.lo1, d.hi1, d.lo2, d.hi2].filter((v): v is number => v != null));
    const yExt = d3.extent(allY) as [number, number];

    const xScale = d3.scaleLinear().domain(xExt).range([0, cw]);
    const yScale = d3.scaleLinear().domain(yExt).nice().range([ch, 0]);

    const line = d3.line<ConfidenceBandDatum>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    const area1 = d3.area<ConfidenceBandDatum>()
      .x((d) => xScale(d.x))
      .y0((d) => yScale(d.lo1 ?? d.y))
      .y1((d) => yScale(d.hi1 ?? d.y))
      .curve(d3.curveMonotoneX);

    const area2 = d3.area<ConfidenceBandDatum>()
      .x((d) => xScale(d.x))
      .y0((d) => yScale(d.lo2 ?? d.lo1 ?? d.y))
      .y1((d) => yScale(d.hi2 ?? d.hi1 ?? d.y))
      .curve(d3.curveMonotoneX);

    const bandData = data.filter((d) => d.lo1 != null);

    return {
      xScale,
      yScale,
      linePath: line(data) ?? "",
      band1: area1(bandData) ?? "",
      band2: area2(bandData) ?? "",
      xTicks: xScale.ticks(5),
      yTicks: yScale.ticks(4),
    };
  }, [data, cw, ch]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-confidence-band">
      <g transform={`translate(${pad.l},${pad.t})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} y1={yScale(t)} x2={cw} y2={yScale(t)} stroke="currentColor" strokeOpacity={0.08} />
            <text x={-4} y={yScale(t) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.35}>{t}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={xScale(t)} y={ch + 14} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.35}>{t}</text>
        ))}
        <path d={band2} fill={bandColors[1]} opacity={0.25} />
        <path d={band1} fill={bandColors[0]} opacity={0.3} />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={1.5} />
        {xLabel && <text x={cw / 2} y={ch + 24} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4}>{xLabel}</text>}
        {yLabel && <text x={-pad.l + 6} y={-4} fontSize={8} fill="currentColor" opacity={0.4}>{yLabel}</text>}
      </g>
    </svg>
  );
}
```

### 4.2 AlluvialChart.tsx

```tsx
import { useMemo } from "react";

export interface AlluvialFlow {
  from: string;
  to: string;
  value: number;
}

export interface AlluvialChartProps {
  flows: AlluvialFlow[];
  leftLabel?: string;
  rightLabel?: string;
  width?: number;
  height?: number;
  colors?: Record<string, string>;
}

const DEFAULT_COLORS: Record<string, string> = {
  A: "#0f69ff",
  B: "#5b636a",
  C: "#a3adb8",
  D: "#232a31",
  E: "#e0e4e9",
};

export function AlluvialChart({
  flows,
  leftLabel = "Before",
  rightLabel = "After",
  width = 320,
  height = 180,
  colors = DEFAULT_COLORS,
}: AlluvialChartProps) {
  const pad = { t: 20, b: 8, l: 8, r: 8 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;
  const nodeW = 2;
  const gap = 3;

  const { leftNodes, rightNodes, links } = useMemo(() => {
    const leftMap = new Map<string, number>();
    const rightMap = new Map<string, number>();
    for (const f of flows) {
      leftMap.set(f.from, (leftMap.get(f.from) ?? 0) + f.value);
      rightMap.set(f.to, (rightMap.get(f.to) ?? 0) + f.value);
    }

    const leftTotal = Array.from(leftMap.values()).reduce((a, b) => a + b, 0);
    const rightTotal = Array.from(rightMap.values()).reduce((a, b) => a + b, 0);
    const totalGapL = gap * (leftMap.size - 1);
    const totalGapR = gap * (rightMap.size - 1);

    let yL = 0;
    const leftNodes: { key: string; y: number; h: number; val: number }[] = [];
    Array.from(leftMap.entries()).forEach(([key, val]) => {
      const h = (val / leftTotal) * (ch - totalGapL);
      leftNodes.push({ key, y: yL, h, val });
      yL += h + gap;
    });

    let yR = 0;
    const rightNodes: { key: string; y: number; h: number; val: number }[] = [];
    Array.from(rightMap.entries()).forEach(([key, val]) => {
      const h = (val / rightTotal) * (ch - totalGapR);
      rightNodes.push({ key, y: yR, h, val });
      yR += h + gap;
    });

    const leftOffsets = new Map<string, number>();
    const rightOffsets = new Map<string, number>();
    for (const n of leftNodes) leftOffsets.set(n.key, n.y);
    for (const n of rightNodes) rightOffsets.set(n.key, n.y);

    const links = flows.map((f) => {
      const lNode = leftNodes.find((n) => n.key === f.from)!;
      const rNode = rightNodes.find((n) => n.key === f.to)!;
      const lh = (f.value / lNode.val) * lNode.h;
      const rh = (f.value / rNode.val) * rNode.h;
      const ly = leftOffsets.get(f.from)!;
      const ry = rightOffsets.get(f.to)!;
      leftOffsets.set(f.from, ly + lh);
      rightOffsets.set(f.to, ry + rh);
      return { from: f.from, ly, lh, ry, rh };
    });

    return { leftNodes, rightNodes, links };
  }, [flows, ch]);

  const x0 = pad.l + nodeW;
  const x1 = width - pad.r - nodeW;
  const mx = (x0 + x1) / 2;

  function getColor(key: string) {
    return colors[key] ?? "#5b636a";
  }

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-alluvial">
      <text x={x0} y={12} fontSize={9} fill="currentColor" opacity={0.4}>{leftLabel}</text>
      <text x={x1} y={12} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.4}>{rightLabel}</text>
      <g transform={`translate(0,${pad.t})`}>
        {links.map((lnk, i) => {
          const d = `M${x0},${lnk.ly} C${mx},${lnk.ly} ${mx},${lnk.ry} ${x1},${lnk.ry} L${x1},${lnk.ry + lnk.rh} C${mx},${lnk.ry + lnk.rh} ${mx},${lnk.ly + lnk.lh} ${x0},${lnk.ly + lnk.lh} Z`;
          return <path key={i} d={d} fill={getColor(lnk.from)} opacity={0.55} />;
        })}
        {leftNodes.map((n) => (
          <g key={`l-${n.key}`}>
            <rect x={pad.l} y={n.y} width={nodeW} height={n.h} fill={getColor(n.key)} />
            <text x={x0 + 4} y={n.y + n.h / 2 + 3} fontSize={8} fontWeight={600} fill="currentColor" opacity={0.7}>{n.key}</text>
            <text x={pad.l - 3} y={n.y + n.h / 2 + 3} textAnchor="end" fontSize={7} fill="currentColor" opacity={0.35}>{n.val}</text>
          </g>
        ))}
        {rightNodes.map((n) => (
          <g key={`r-${n.key}`}>
            <rect x={x1} y={n.y} width={nodeW} height={n.h} fill={getColor(n.key)} />
            <text x={x1 - 4} y={n.y + n.h / 2 + 3} textAnchor="end" fontSize={8} fontWeight={600} fill="currentColor" opacity={0.7}>{n.key}</text>
            <text x={x1 + nodeW + 3} y={n.y + n.h / 2 + 3} fontSize={7} fill="currentColor" opacity={0.35}>{n.val}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
```

### 4.3 WaffleBarChart.tsx

```tsx
import { useMemo } from "react";

export interface WaffleBarSegment {
  label: string;
  value: number;
  color?: string;
}

export interface WaffleBarGroup {
  label: string;
  segments: WaffleBarSegment[];
}

export interface WaffleBarChartProps {
  groups: WaffleBarGroup[];
  width?: number;
  height?: number;
  cellSize?: number;
  cellGap?: number;
  cols?: number;
  defaultColors?: string[];
}

const PALETTE = ["#0f69ff", "#5b636a", "#a3adb8"];

export function WaffleBarChart({
  groups,
  width = 320,
  height = 180,
  cellSize = 12,
  cellGap = 2,
  cols = 4,
  defaultColors = PALETTE,
}: WaffleBarChartProps) {
  const pad = { t: 8, b: 20, l: 16, r: 16 };

  const bars = useMemo(() => {
    const total = Math.max(...groups.map((g) => g.segments.reduce((s, seg) => s + seg.value, 0)));
    const maxCells = Math.ceil(total);
    const barW = cols * (cellSize + cellGap) - cellGap;
    const groupSpacing = (width - pad.l - pad.r - barW * groups.length) / (groups.length + 1);

    return groups.map((g, gi) => {
      const cells: { row: number; col: number; color: string }[] = [];
      let ci = 0;
      g.segments.forEach((seg, si) => {
        const count = Math.round(seg.value);
        const color = seg.color ?? defaultColors[si % defaultColors.length];
        for (let i = 0; i < count; i++) {
          const col = ci % cols;
          const row = Math.floor(ci / cols);
          cells.push({ row, col, color });
          ci++;
        }
      });
      const x = pad.l + groupSpacing * (gi + 1) + barW * gi;
      const totalRows = Math.ceil(ci / cols);
      return { label: g.label, x, cells, totalRows };
    });
  }, [groups, width, cellSize, cellGap, cols, defaultColors, pad.l, pad.r]);

  const maxRows = Math.max(...bars.map((b) => b.totalRows));
  const chartHeight = maxRows * (cellSize + cellGap) - cellGap;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-waffle-bar">
      <g transform={`translate(0,${pad.t})`}>
        {bars.map((bar) => (
          <g key={bar.label} transform={`translate(${bar.x},0)`}>
            {bar.cells.map((cell, ci) => {
              const x = cell.col * (cellSize + cellGap);
              const y = chartHeight - (cell.row + 1) * (cellSize + cellGap) + cellGap;
              return <rect key={ci} x={x} y={y} width={cellSize} height={cellSize} rx={1} fill={cell.color} />;
            })}
            <text
              x={(cols * (cellSize + cellGap) - cellGap) / 2}
              y={chartHeight + 14}
              textAnchor="middle"
              fontSize={8}
              fill="currentColor"
              opacity={0.4}
            >
              {bar.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
```

### 4.4 BulletBarChart.tsx

```tsx
import { useMemo } from "react";
import * as d3 from "d3";

export interface BulletBarDatum {
  label: string;
  ranges: number[];
  value: number;
  marker?: number;
}

export interface BulletBarChartProps {
  data: BulletBarDatum[];
  width?: number;
  height?: number;
  rangeColors?: string[];
  valueColor?: string;
  markerColor?: string;
}

const RANGE_COLORS = ["#e0e4e9", "#a3adb8", "#5b636a"];

export function BulletBarChart({
  data,
  width = 320,
  height = 180,
  rangeColors = RANGE_COLORS,
  valueColor = "#5b636a",
  markerColor = "#232a31",
}: BulletBarChartProps) {
  const pad = { t: 8, r: 16, b: 8, l: 100 };
  const cw = width - pad.l - pad.r;
  const rowH = Math.min(28, (height - pad.t - pad.b) / data.length);
  const barH = rowH * 0.5;
  const rangeH = rowH * 0.7;

  const maxVal = useMemo(() => {
    return Math.max(...data.flatMap((d) => [...d.ranges, d.value, d.marker ?? 0]));
  }, [data]);

  const xScale = d3.scaleLinear().domain([0, maxVal]).range([0, cw]);
  const xTicks = xScale.ticks(5);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-bullet-bar">
      <g transform={`translate(${pad.l},${pad.t})`}>
        {xTicks.map((t) => (
          <g key={t}>
            <line x1={xScale(t)} y1={0} x2={xScale(t)} y2={data.length * rowH} stroke="currentColor" strokeOpacity={0.06} />
            <text x={xScale(t)} y={data.length * rowH + 12} textAnchor="middle" fontSize={7} fill="currentColor" opacity={0.3}>{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cy = i * rowH + rowH / 2;
          const sortedRanges = [...d.ranges].sort((a, b) => b - a);
          return (
            <g key={d.label} data-testid={`bullet-row-${i}`}>
              <text x={-6} y={cy + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.6}>{d.label}</text>
              {sortedRanges.map((r, ri) => (
                <rect
                  key={ri}
                  x={0}
                  y={cy - rangeH / 2}
                  width={xScale(r)}
                  height={rangeH}
                  fill={rangeColors[ri % rangeColors.length]}
                  rx={1}
                />
              ))}
              <rect x={0} y={cy - barH / 2} width={xScale(d.value)} height={barH} fill={valueColor} rx={1} />
              {d.marker != null && (
                <line
                  x1={xScale(d.marker)}
                  y1={cy - rangeH / 2 - 2}
                  x2={xScale(d.marker)}
                  y2={cy + rangeH / 2 + 2}
                  stroke={markerColor}
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
```

### 4.5 SlopeComparisonChart.tsx

```tsx
import { useMemo } from "react";

export interface SlopeItem {
  label: string;
  startValue: number;
  endValue: number;
  startLabel?: string;
  endLabel?: string;
}

export interface SlopeComparisonChartProps {
  items: SlopeItem[];
  width?: number;
  height?: number;
  accentColor?: string;
  startYear?: string;
  endYear?: string;
}

export function SlopeComparisonChart({
  items,
  width = 320,
  height = 180,
  accentColor = "#0f69ff",
  startYear = "'20",
  endYear = "'25",
}: SlopeComparisonChartProps) {
  const pad = { t: 16, b: 28, l: 8, r: 8 };
  const itemW = (width - pad.l - pad.r) / items.length;
  const ch = height - pad.t - pad.b;

  const maxVal = useMemo(() => Math.max(...items.flatMap((it) => [it.startValue, it.endValue])), [items]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-slope-comparison">
      {items.map((item, i) => {
        const x0 = pad.l + i * itemW;
        const cx = x0 + itemW / 2;
        const iw = itemW * 0.7;
        const left = cx - iw / 2;
        const right = cx + iw / 2;

        const sy = pad.t + ch - (item.startValue / maxVal) * ch;
        const ey = pad.t + ch - (item.endValue / maxVal) * ch;

        const pct = ((item.endValue - item.startValue) / item.startValue * 100).toFixed(1);
        const positive = item.endValue >= item.startValue;

        const gradId = `slope-grad-${i}`;
        const triPath = `M${left},${sy} L${right},${ey} L${right},${pad.t + ch} L${left},${pad.t + ch} Z`;

        return (
          <g key={item.label}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <path d={triPath} fill={`url(#${gradId})`} />
            <line x1={left} y1={sy} x2={right} y2={ey} stroke={accentColor} strokeWidth={1.5} />
            <text x={left} y={sy - 4} fontSize={8} fill="currentColor" opacity={0.4}>{item.startValue}</text>
            <text x={right} y={ey - 4} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.4}>{item.endValue}</text>
            <text x={cx} y={sy + (pad.t + ch - sy) / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={accentColor}>
              {positive ? "+" : ""}{pct}%
            </text>
            <text x={left} y={height - pad.b + 12} fontSize={7} fill="currentColor" opacity={0.35}>{startYear}</text>
            <text x={right} y={height - pad.b + 12} textAnchor="end" fontSize={7} fill="currentColor" opacity={0.35}>{endYear}</text>
            <text x={cx} y={height - 2} textAnchor="middle" fontSize={8} fontWeight={500} fill="currentColor" opacity={0.6}>{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
```

### 4.6 BubbleScatterChart.tsx

```tsx
import { useMemo } from "react";
import * as d3 from "d3";

export interface BubbleDatum {
  x: number;
  y: number;
  size: number;
  label?: string;
  color?: string;
}

export interface BubbleScatterChartProps {
  data: BubbleDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  defaultColors?: string[];
  maxRadius?: number;
}

const PALETTE = ["#0f69ff", "#232a31", "#5b636a", "#a3adb8", "#e0e4e9"];

export function BubbleScatterChart({
  data,
  width = 320,
  height = 200,
  xLabel,
  yLabel,
  defaultColors = PALETTE,
  maxRadius = 22,
}: BubbleScatterChartProps) {
  const pad = { t: 12, r: 16, b: 28, l: 32 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;

  const { xScale, yScale, rScale, xTicks, yTicks } = useMemo(() => {
    const xExt = d3.extent(data, (d) => d.x) as [number, number];
    const yExt = d3.extent(data, (d) => d.y) as [number, number];
    const sExt = d3.extent(data, (d) => d.size) as [number, number];

    const xPad = (xExt[1] - xExt[0]) * 0.1 || 1;
    const yPad = (yExt[1] - yExt[0]) * 0.1 || 1;

    const xScale = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, cw]);
    const yScale = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([ch, 0]);
    const rScale = d3.scaleSqrt().domain(sExt).range([4, maxRadius]);

    return {
      xScale,
      yScale,
      rScale,
      xTicks: xScale.ticks(5),
      yTicks: yScale.ticks(4),
    };
  }, [data, cw, ch, maxRadius]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-bubble-scatter">
      <g transform={`translate(${pad.l},${pad.t})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} y1={yScale(t)} x2={cw} y2={yScale(t)} stroke="currentColor" strokeOpacity={0.06} />
            <text x={-4} y={yScale(t) + 3} textAnchor="end" fontSize={7} fill="currentColor" opacity={0.3}>{t}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={t}>
            <line x1={xScale(t)} y1={0} x2={xScale(t)} y2={ch} stroke="currentColor" strokeOpacity={0.06} />
            <text x={xScale(t)} y={ch + 12} textAnchor="middle" fontSize={7} fill="currentColor" opacity={0.3}>{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = xScale(d.x);
          const cy = yScale(d.y);
          const r = rScale(d.size);
          const fill = d.color ?? defaultColors[i % defaultColors.length];
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill={fill} opacity={0.7} stroke={fill} strokeWidth={1.5} strokeOpacity={0.9} />
              {d.label && (
                <text x={cx} y={cy + r + 10} textAnchor="middle" fontSize={7} fontWeight={500} fill="currentColor" opacity={0.5}>
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
        {xLabel && <text x={cw / 2} y={ch + 24} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4}>{xLabel}</text>}
        {yLabel && <text x={-pad.l + 6} y={-4} fontSize={8} fill="currentColor" opacity={0.4}>{yLabel}</text>}
      </g>
    </svg>
  );
}
```

---

## 5. Remaining chart components (source paths)

Copy the following files from the Metric Market repo into your project. Paths are relative to the repo root.

| File | Path |
|------|------|
| BoxWhiskerChart | `client/src/components/charts/BoxWhiskerChart.tsx` |
| StripTimelineChart | `client/src/components/charts/StripTimelineChart.tsx` |
| WafflePercentChart | `client/src/components/charts/WafflePercentChart.tsx` |
| HeatmapChart | `client/src/components/charts/HeatmapChart.tsx` |
| StripDotChart | `client/src/components/charts/StripDotChart.tsx` |
| MultiLineChart | `client/src/components/charts/MultiLineChart.tsx` |
| TileCartogramChart | `client/src/components/charts/TileCartogramChart.tsx` |
| tilePresets | `client/src/components/charts/tilePresets.ts` |
| TimelineMilestoneChart | `client/src/components/charts/TimelineMilestoneChart.tsx` |
| ControlChart | `client/src/components/charts/ControlChart.tsx` |
| DendrogramChart | `client/src/components/charts/DendrogramChart.tsx` |
| RadialBarChart | `client/src/components/charts/RadialBarChart.tsx` |
| BumpChart | `client/src/components/charts/BumpChart.tsx` |
| SparklineRowsChart | `client/src/components/charts/SparklineRowsChart.tsx` |
| StackedAreaChart | `client/src/components/charts/StackedAreaChart.tsx` |
| RangeStripChart | `client/src/components/charts/RangeStripChart.tsx` |
| RangeStripAlignedChart | `client/src/components/charts/RangeStripAlignedChart.tsx` |
| RangeTargetBulletChart | `client/src/components/charts/RangeTargetBulletChart.tsx` |

Composite dashboards (optional; depend on multiple sub-charts and D3):  
`CompCycleOverviewChart.tsx`, `MeritMatrixHeatmapChart.tsx`, `PayEquityDashboardChart.tsx`, `GovernanceFlagsChart.tsx`, `GeoCompensationChart.tsx`.

---

## 6. Chart Library page (grid UI)

Use this structure to render a Chart Library page like the original app. Replace the `CHARTS` array with your own entries; each needs `title`, `description`, and `component` (React node).

```tsx
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
  MultiLineChart,
  TimelineMilestoneChart,
  ControlChart,
  DendrogramChart,
  RadialBarChart,
  BumpChart,
  SparklineRowsChart,
  StackedAreaChart,
  RangeStripChart,
  RangeStripAlignedChart,
  RangeTargetBulletChart,
} from "@/components/charts";
// Import your types (ConfidenceBandDatum, AlluvialFlow, WaffleBarGroup, etc.)

// Example sample data (shortened; expand as needed):
const CONFIDENCE_DATA = [
  { x: 1, y: 350 }, { x: 2, y: 380 }, { x: 3, y: 420 }, { x: 4, y: 450 },
  { x: 5, y: 480 }, { x: 6, y: 520 }, { x: 7, y: 550, lo1: 520, hi1: 580, lo2: 500, hi2: 600 },
  { x: 8, y: 590, lo1: 550, hi1: 630 }, { x: 9, y: 620 }, { x: 10, y: 650 }, { x: 11, y: 680 }, { x: 12, y: 720 },
];
const ALLUVIAL_FLOWS = [
  { from: "Engineering", to: "Engineering", value: 120 },
  { from: "Engineering", to: "Product", value: 15 },
  { from: "Sales", to: "Sales", value: 80 },
  { from: "Marketing", to: "Marketing", value: 45 },
];
const ALLUVIAL_COLORS = { Engineering: "#0f69ff", Sales: "#5b636a", Marketing: "#a3adb8", Product: "#232a31", Management: "#e0e4e9" };
const WAFFLE_GROUPS = [
  { label: "2020", segments: [{ label: "Tech", value: 8, color: "#0f69ff" }, { label: "Ops", value: 5, color: "#5b636a" }, { label: "Sales", value: 3, color: "#a3adb8" }] },
  { label: "2025", segments: [{ label: "Tech", value: 12, color: "#0f69ff" }, { label: "Ops", value: 7, color: "#5b636a" }, { label: "Sales", value: 5, color: "#a3adb8" }] },
];
const BULLET_DATA = [
  { label: "J. Haraldsson", ranges: [50, 35, 20], value: 32, marker: 40 },
  { label: "D. Sigurdsdottir", ranges: [50, 35, 20], value: 28, marker: 35 },
  { label: "E. Eriksson", ranges: [50, 35, 20], value: 38, marker: 30 },
];
const SLOPE_ITEMS = [
  { label: "Engineering", startValue: 4, endValue: 10 },
  { label: "Sales", startValue: 13, endValue: 15 },
  { label: "Marketing", startValue: 5, endValue: 8 },
];
const BUBBLE_DATA = [
  { x: 3, y: 9, size: 35, label: "Eng", color: "#232a31" },
  { x: 5, y: 10, size: 62, label: "Sales", color: "#5b636a" },
  { x: 7, y: 11, size: 28, label: "Ops", color: "#a3adb8" },
  { x: 14, y: 13, size: 97, label: "Exec", color: "#0f69ff" },
];

const CHARTS = [
  { title: "Confidence Band", description: "Forecast with uncertainty bands showing predicted range", component: <ConfidenceBandChart data={CONFIDENCE_DATA} xLabel="Month" yLabel="Headcount" /> },
  { title: "Alluvial Flow", description: "How employees flow between departments over time", component: <AlluvialChart flows={ALLUVIAL_FLOWS} colors={ALLUVIAL_COLORS} leftLabel="2020" rightLabel="2025" /> },
  { title: "Waffle Grid Bar", description: "Composition breakdown with countable grid cells", component: <WaffleBarChart groups={WAFFLE_GROUPS} /> },
  { title: "Bullet / Range Bar", description: "Individual performance against ranges and targets", component: <BulletBarChart data={BULLET_DATA} /> },
  { title: "Slope Comparison", description: "Period-over-period growth with percentage change", component: <SlopeComparisonChart items={SLOPE_ITEMS} startYear="'20" endYear="'25" /> },
  { title: "Bubble Scatter", description: "Multi-dimensional comparison by position, size, and color", component: <BubbleScatterChart data={BUBBLE_DATA} xLabel="Tenure (years)" yLabel="Engagement" /> },
  // Add more entries for BoxWhisker, StripTimeline, WafflePercent, Heatmap, StripDot, MultiLine,
  // TileCartogram, TimelineMilestone, ControlChart, Dendrogram, RadialBar, BumpChart, SparklineRows,
  // RangeStrip, RangeStripAligned, RangeTargetBullet, StackedArea (each with sample data and component).
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
          <Card key={chart.title}>
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
```

---

## 7. Supporting documentation

### Component Export API (embedding in other apps)

- **GET /api/components** — List all chart/control bundles (key, displayName, category, componentType, tags, demoUrl).
- **GET /api/components/:key** — Full export package for one component: manifest, dataSchema, configSchema, outputSchema, exampleData, exampleConfig, documentation, integrationGuide.
- **GET /api/export/:key** — Download the same as JSON.

To embed a chart in another app:

1. Call **GET /api/components** (or GET /api/bundles) to discover components.
2. Call **GET /api/components/:key** (e.g. `confidence_band`, `bullet_bar`) to get dataSchema, exampleData, and integrationGuide.
3. Create a card (if your backend has cards) with the chosen bundle, then push data via **POST /api/cards/:id/data** with a payload that conforms to the component’s dataSchema.
4. Render the chart in your app by using the component code from this document and passing the same data shape.

### Data contracts (summary)

- **Confidence Band:** `data: Array<{ x, y, lo1?, hi1?, lo2?, hi2? }>`.
- **Alluvial:** `flows: Array<{ from, to, value }>`, optional `colors: Record<string, string>`.
- **Waffle Bar:** `groups: Array<{ label, segments: Array<{ label, value, color? }> }>`.
- **Bullet Bar:** `data: Array<{ label, ranges: number[], value, marker? }>`.
- **Slope Comparison:** `items: Array<{ label, startValue, endValue }>`.
- **Bubble Scatter:** `data: Array<{ x, y, size, label?, color? }>`.

Full JSON Schema for each chart is available from **GET /api/components/:key** or **GET /api/bundles** in the Metric Market API. See also **docs/COMPONENT_EXPORT_API.md** in this repo for the full API description.

### Getting the rest of the code

- The **full source** for every chart (BoxWhisker, StripTimeline, WafflePercent, Heatmap, StripDot, MultiLine, TileCartogram, TimelineMilestone, ControlChart, Dendrogram, RadialBar, BumpChart, SparklineRows, StackedArea, RangeStrip, RangeStripAligned, RangeTargetBullet, tilePresets, and composite dashboards) lives in **client/src/components/charts/** in the Metric Market repo. Copy those files into your project and fix imports (e.g. `@/components/charts` or your own path). The six charts in **Section 4** above are included in full so you can paste them without opening the repo; the table in **Section 5** lists the exact paths for the remaining components.

---

**Document version:** 1.0  
**Source repo:** People Analytics Toolbox — Metric Market  
**Last updated:** 2026-02-22
