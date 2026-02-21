import { useMemo } from "react";
import * as d3 from "d3";

export interface PayEquityDashboardChartProps {
  gapByPeerGroup: Array<{
    peerGroup: string;
    gapPct: number;
    femaleAvg?: number;
    maleAvg?: number;
    headcount?: number;
    significant?: boolean;
  }>;
  compaRatioByDemographic: Array<{
    category: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean?: number;
    count?: number;
  }>;
  equityFlags: {
    categories: string[];
    critical: number[];
    warning: number[];
    info: number[];
  };
  beforeAfterMetrics?: {
    metrics: Array<{
      name: string;
      before: number;
      after: number;
      unit?: string;
      direction?: string;
    }>;
  };
  width?: number;
  height?: number;
}

export function PayEquityDashboardChart({
  gapByPeerGroup,
  compaRatioByDemographic,
  equityFlags,
  beforeAfterMetrics,
  width = 600,
  height = 500,
}: PayEquityDashboardChartProps) {
  if (!gapByPeerGroup || !compaRatioByDemographic || !equityFlags) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4" style={{ width, minHeight: height }}>
      {/* Gender Pay Gap by Peer Group */}
      <div className="border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Gender Pay Gap by Peer Group</h4>
        <GapLollipopChart data={gapByPeerGroup} />
      </div>

      {/* Compa-Ratio by Demographic */}
      <div className="border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Compa-Ratio Distribution</h4>
        <BoxPlotChart data={compaRatioByDemographic} />
      </div>

      {/* Equity Flags */}
      <div className="border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Equity Flags by Category</h4>
        <EquityFlagsChart data={equityFlags} />
      </div>

      {/* Before/After Metrics */}
      {beforeAfterMetrics && (
        <div className="border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Before vs After Metrics</h4>
          <BeforeAfterMetrics data={beforeAfterMetrics.metrics} />
        </div>
      )}
    </div>
  );
}

function GapLollipopChart({ data }: { data: PayEquityDashboardChartProps['gapByPeerGroup'] }) {
  const w = 260;
  const h = 180;
  const margin = { top: 10, right: 40, bottom: 20, left: 100 };
  const innerWidth = w - margin.left - margin.right;
  const innerHeight = h - margin.top - margin.bottom;

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.peerGroup))
    .range([0, innerHeight])
    .padding(0.3);

  const maxGap = d3.max(data, d => Math.abs(d.gapPct)) || 10;
  const xScale = d3.scaleLinear()
    .domain([-maxGap * 1.1, maxGap * 1.1])
    .range([0, innerWidth]);

  const zeroX = xScale(0);

  return (
    <svg width={w} height={h} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Zero line */}
        <line
          x1={zeroX}
          x2={zeroX}
          y1={0}
          y2={innerHeight}
          stroke="currentColor"
          strokeWidth={1}
          className="text-gray-400"
          strokeDasharray="2,2"
        />

        {data.map((d, i) => {
          const y = (yScale(d.peerGroup) || 0) + yScale.bandwidth() / 2;
          const x = xScale(d.gapPct);
          const isSignificant = d.significant ?? false;

          return (
            <g key={i}>
              <text
                x={-8}
                y={y}
                dy="0.35em"
                textAnchor="end"
                className="text-[8px] fill-current text-muted-foreground"
              >
                {d.peerGroup}
              </text>
              {/* Lollipop stick */}
              <line
                x1={zeroX}
                x2={x}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeWidth={1.5}
                className={d.gapPct > 0 ? "text-red-400" : "text-emerald-400"}
              />
              {/* Lollipop dot */}
              <circle
                cx={x}
                cy={y}
                r={isSignificant ? 5 : 3.5}
                fill="currentColor"
                className={d.gapPct > 0 ? "text-red-500" : "text-emerald-500"}
                strokeWidth={isSignificant ? 2 : 0}
                stroke="#fff"
              />
              {/* Label */}
              <text
                x={x + (d.gapPct > 0 ? 8 : -8)}
                y={y}
                dy="0.35em"
                textAnchor={d.gapPct > 0 ? "start" : "end"}
                className="text-[8px] font-semibold fill-current text-foreground"
              >
                {d.gapPct.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Axis label */}
        <text
          x={innerWidth / 2}
          y={innerHeight + 15}
          textAnchor="middle"
          className="text-[9px] fill-current text-muted-foreground"
        >
          Pay Gap % (+ = male higher)
        </text>
      </g>
    </svg>
  );
}

function BoxPlotChart({ data }: { data: PayEquityDashboardChartProps['compaRatioByDemographic'] }) {
  const w = 260;
  const h = 180;
  const margin = { top: 10, right: 20, bottom: 30, left: 50 };
  const innerWidth = w - margin.left - margin.right;
  const innerHeight = h - margin.top - margin.bottom;

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, innerWidth])
    .padding(0.3);

  const allValues = data.flatMap(d => [d.min, d.max]);
  const yScale = d3.scaleLinear()
    .domain([d3.min(allValues) || 0.7, d3.max(allValues) || 1.4])
    .range([innerHeight, 0])
    .nice();

  const boxWidth = xScale.bandwidth();

  return (
    <svg width={w} height={h} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((d, i) => {
          const x = xScale(d.category) || 0;
          const centerX = x + boxWidth / 2;

          return (
            <g key={i}>
              {/* Min-Max line */}
              <line
                x1={centerX}
                x2={centerX}
                y1={yScale(d.min)}
                y2={yScale(d.max)}
                stroke="currentColor"
                strokeWidth={1}
                className="text-gray-400"
              />
              {/* Q1-Q3 box */}
              <rect
                x={x + boxWidth * 0.2}
                y={yScale(d.q3)}
                width={boxWidth * 0.6}
                height={yScale(d.q1) - yScale(d.q3)}
                fill="currentColor"
                className="text-blue-200"
                stroke="currentColor"
                strokeWidth={1}
              />
              {/* Median line */}
              <line
                x1={x + boxWidth * 0.2}
                x2={x + boxWidth * 0.8}
                y1={yScale(d.median)}
                y2={yScale(d.median)}
                stroke="currentColor"
                strokeWidth={2}
                className="text-blue-700"
              />
              {/* Category label */}
              <text
                x={centerX}
                y={innerHeight + 12}
                textAnchor="middle"
                className="text-[9px] fill-current text-muted-foreground"
              >
                {d.category}
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x={-30}
          y={innerHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${-30}, ${innerHeight / 2})`}
          className="text-[9px] fill-current text-muted-foreground"
        >
          Compa-Ratio
        </text>
      </g>
    </svg>
  );
}

function EquityFlagsChart({ data }: { data: PayEquityDashboardChartProps['equityFlags'] }) {
  const w = 260;
  const h = 180;
  const margin = { top: 10, right: 40, bottom: 20, left: 80 };
  const innerWidth = w - margin.left - margin.right;
  const innerHeight = h - margin.top - margin.bottom;

  const yScale = d3.scaleBand()
    .domain(data.categories)
    .range([0, innerHeight])
    .padding(0.2);

  const maxTotal = d3.max(data.categories.map((_, i) => 
    data.critical[i] + data.warning[i] + data.info[i]
  )) || 100;

  const xScale = d3.scaleLinear()
    .domain([0, maxTotal * 1.1])
    .range([0, innerWidth]);

  return (
    <svg width={w} height={h} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.categories.map((category, i) => {
          const y = yScale(category) || 0;
          const critical = data.critical[i];
          const warning = data.warning[i];
          const info = data.info[i];

          return (
            <g key={i}>
              <text
                x={-8}
                y={y + yScale.bandwidth() / 2}
                dy="0.35em"
                textAnchor="end"
                className="text-[8px] fill-current text-muted-foreground"
              >
                {category}
              </text>
              {/* Critical segment */}
              <rect
                x={0}
                y={y}
                width={xScale(critical)}
                height={yScale.bandwidth()}
                fill="currentColor"
                className="text-red-500"
              />
              {/* Warning segment */}
              <rect
                x={xScale(critical)}
                y={y}
                width={xScale(warning)}
                height={yScale.bandwidth()}
                fill="currentColor"
                className="text-amber-500"
              />
              {/* Info segment */}
              <rect
                x={xScale(critical + warning)}
                y={y}
                width={xScale(info)}
                height={yScale.bandwidth()}
                fill="currentColor"
                className="text-blue-500"
              />
              {/* Total label */}
              <text
                x={xScale(critical + warning + info) + 4}
                y={y + yScale.bandwidth() / 2}
                dy="0.35em"
                className="text-[8px] font-semibold fill-current text-foreground"
              >
                {critical + warning + info}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${innerWidth - 100}, ${innerHeight + 8})`}>
          <rect x={0} y={0} width={8} height={6} fill="currentColor" className="text-red-500" />
          <text x={10} y={5} className="text-[7px] fill-current text-muted-foreground">Critical</text>
          <rect x={40} y={0} width={8} height={6} fill="currentColor" className="text-amber-500" />
          <text x={50} y={5} className="text-[7px] fill-current text-muted-foreground">Warning</text>
          <rect x={80} y={0} width={8} height={6} fill="currentColor" className="text-blue-500" />
          <text x={90} y={5} className="text-[7px] fill-current text-muted-foreground">Info</text>
        </g>
      </g>
    </svg>
  );
}

function BeforeAfterMetrics({ data }: { data: NonNullable<PayEquityDashboardChartProps['beforeAfterMetrics']>['metrics'] }) {
  return (
    <div className="space-y-2">
      {data.map((metric, i) => {
        const delta = metric.after - metric.before;
        const isImprovement = 
          (metric.direction === 'lower' && delta < 0) ||
          (metric.direction === 'higher' && delta > 0);
        
        return (
          <div key={i} className="flex items-center justify-between text-[9px] border-b border-border/50 pb-1">
            <span className="text-muted-foreground">{metric.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{metric.before.toFixed(1)}</span>
              <span className={`font-semibold ${isImprovement ? 'text-emerald-600' : 'text-red-500'}`}>
                {isImprovement ? '↑' : '↓'}
              </span>
              <span className={`font-semibold ${isImprovement ? 'text-emerald-600' : 'text-red-500'}`}>
                {metric.after.toFixed(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
