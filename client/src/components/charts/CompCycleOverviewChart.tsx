import { useMemo } from "react";
import * as d3 from "d3";

export interface CompCycleOverviewChartProps {
  budgetUtilization: {
    allocated: number;
    spent: number;
    currency?: string;
    asOfDate?: string;
  };
  increaseByTier: Array<{
    tier: string;
    avgIncreasePct: number;
    headcount: number;
    targetPct?: number;
  }>;
  compaRatioBuckets: {
    bucketLabels?: string[];
    before: number[];
    after: number[];
  };
  meritCostByUnit: Array<{
    unit: string;
    totalCost: number;
    headcount?: number;
    avgIncreasePct?: number;
  }>;
  cycleStage?: {
    currentStage: string;
    stages: Array<{
      name: string;
      status: string;
      completedPct?: number;
    }>;
  };
  width?: number;
  height?: number;
}

export function CompCycleOverviewChart({
  budgetUtilization,
  increaseByTier,
  compaRatioBuckets,
  meritCostByUnit,
  cycleStage,
  width = 600,
  height = 500,
}: CompCycleOverviewChartProps) {
  if (!budgetUtilization || !increaseByTier || !compaRatioBuckets || !meritCostByUnit) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  const utilizationPct = (budgetUtilization.spent / budgetUtilization.allocated) * 100;
  const currency = budgetUtilization.currency || "USD";

  return (
    <div className="grid grid-cols-2 gap-4" style={{ width, minHeight: height }}>
      {/* Budget Utilization Gauge */}
      <div className="border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Budget Utilization</h4>
        <BudgetGauge utilizationPct={utilizationPct} allocated={budgetUtilization.allocated} spent={budgetUtilization.spent} currency={currency} />
      </div>

      {/* Average Increase by Performance Tier */}
      <div className="border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Avg Increase by Performance Tier</h4>
        <TierBarChart data={increaseByTier} />
      </div>

      {/* Compa-Ratio Before/After */}
      <div className="border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Compa-Ratio Distribution</h4>
        <CompaRatioHistogram data={compaRatioBuckets} />
      </div>

      {/* Merit Cost by Business Unit */}
      <div className="border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2">Merit Cost by Business Unit</h4>
        <MeritCostTable data={meritCostByUnit} currency={currency} />
      </div>

      {/* Optional Cycle Stage Indicator */}
      {cycleStage && (
        <div className="col-span-2 border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Cycle Progress</h4>
          <CycleStageIndicator cycleStage={cycleStage} />
        </div>
      )}
    </div>
  );
}

function BudgetGauge({ utilizationPct, allocated, spent, currency }: { utilizationPct: number; allocated: number; spent: number; currency: string }) {
  const color = utilizationPct < 90 ? "text-emerald-500" : utilizationPct <= 100 ? "text-amber-500" : "text-red-500";
  const arcWidth = 200;
  const arcHeight = 120;
  const radius = 80;
  const strokeWidth = 16;

  const angle = Math.min(utilizationPct / 100, 1) * Math.PI;
  const startAngle = -Math.PI;
  const endAngle = startAngle + angle;

  const arc = d3.arc()
    .innerRadius(radius - strokeWidth / 2)
    .outerRadius(radius + strokeWidth / 2)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .cornerRadius(8);

  const backgroundArc = d3.arc()
    .innerRadius(radius - strokeWidth / 2)
    .outerRadius(radius + strokeWidth / 2)
    .startAngle(-Math.PI)
    .endAngle(0)
    .cornerRadius(8);

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 });

  return (
    <div className="flex flex-col items-center">
      <svg width={arcWidth} height={arcHeight} className="block">
        <g transform={`translate(${arcWidth / 2},${arcHeight - 10})`}>
          <path d={backgroundArc(null as any) || ""} fill="currentColor" className="text-gray-200" />
          <path d={arc(null as any) || ""} fill="currentColor" className={color} />
          <text textAnchor="middle" y={-radius + 40} className="text-2xl font-bold fill-current text-foreground">
            {utilizationPct.toFixed(1)}%
          </text>
          <text textAnchor="middle" y={-radius + 58} className="text-xs fill-current text-muted-foreground">
            Utilized
          </text>
        </g>
      </svg>
      <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
        <div>Allocated: {formatter.format(allocated)}</div>
        <div>Spent: {formatter.format(spent)}</div>
      </div>
    </div>
  );
}

function TierBarChart({ data }: { data: CompCycleOverviewChartProps['increaseByTier'] }) {
  const w = 260;
  const h = 140;
  const margin = { top: 10, right: 30, bottom: 30, left: 80 };
  const innerWidth = w - margin.left - margin.right;
  const innerHeight = h - margin.top - margin.bottom;

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.tier))
    .range([0, innerHeight])
    .padding(0.3);

  const maxVal = d3.max(data, d => Math.max(d.avgIncreasePct, d.targetPct || 0)) || 10;
  const xScale = d3.scaleLinear()
    .domain([0, maxVal * 1.1])
    .range([0, innerWidth]);

  return (
    <svg width={w} height={h} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((d, i) => (
          <g key={i}>
            <text x={-8} y={(yScale(d.tier) || 0) + yScale.bandwidth() / 2} dy="0.35em" textAnchor="end" className="text-[9px] fill-current text-muted-foreground">
              {d.tier}
            </text>
            {/* Target line if available */}
            {d.targetPct !== undefined && (
              <line
                x1={xScale(d.targetPct)}
                x2={xScale(d.targetPct)}
                y1={(yScale(d.tier) || 0)}
                y2={(yScale(d.tier) || 0) + yScale.bandwidth()}
                stroke="currentColor"
                strokeWidth={2}
                className="text-gray-400"
                strokeDasharray="3,3"
              />
            )}
            {/* Actual bar */}
            <rect
              x={0}
              y={yScale(d.tier) || 0}
              width={xScale(d.avgIncreasePct)}
              height={yScale.bandwidth()}
              fill="currentColor"
              className={d.avgIncreasePct > (d.targetPct || 0) ? "text-amber-500" : "text-blue-500"}
              rx={2}
            />
            <text
              x={xScale(d.avgIncreasePct) + 4}
              y={(yScale(d.tier) || 0) + yScale.bandwidth() / 2}
              dy="0.35em"
              className="text-[9px] font-semibold fill-current text-foreground"
            >
              {d.avgIncreasePct.toFixed(1)}%
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function CompaRatioHistogram({ data }: { data: CompCycleOverviewChartProps['compaRatioBuckets'] }) {
  const w = 260;
  const h = 140;
  const margin = { top: 10, right: 10, bottom: 30, left: 30 };
  const innerWidth = w - margin.left - margin.right;
  const innerHeight = h - margin.top - margin.bottom;

  const labels = data.bucketLabels || data.before.map((_, i) => `B${i + 1}`);
  const maxCount = d3.max([...data.before, ...data.after]) || 100;

  const xScale = d3.scaleBand()
    .domain(labels)
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, maxCount * 1.1])
    .range([innerHeight, 0]);

  const barWidth = xScale.bandwidth() / 2;

  return (
    <svg width={w} height={h} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {labels.map((label, i) => (
          <g key={i}>
            {/* Before bar */}
            <rect
              x={(xScale(label) || 0)}
              y={yScale(data.before[i])}
              width={barWidth}
              height={innerHeight - yScale(data.before[i])}
              fill="currentColor"
              className="text-gray-300"
              rx={1}
            />
            {/* After bar */}
            <rect
              x={(xScale(label) || 0) + barWidth}
              y={yScale(data.after[i])}
              width={barWidth}
              height={innerHeight - yScale(data.after[i])}
              fill="currentColor"
              className="text-blue-500"
              rx={1}
            />
            <text
              x={(xScale(label) || 0) + xScale.bandwidth() / 2}
              y={innerHeight + 8}
              textAnchor="middle"
              className="text-[8px] fill-current text-muted-foreground"
            >
              {label}
            </text>
          </g>
        ))}
        {/* Legend */}
        <g transform={`translate(${innerWidth - 80}, -5)`}>
          <rect x={0} y={0} width={12} height={6} fill="currentColor" className="text-gray-300" rx={1} />
          <text x={16} y={5} className="text-[8px] fill-current text-muted-foreground">Before</text>
          <rect x={45} y={0} width={12} height={6} fill="currentColor" className="text-blue-500" rx={1} />
          <text x={61} y={5} className="text-[8px] fill-current text-muted-foreground">After</text>
        </g>
      </g>
    </svg>
  );
}

function MeritCostTable({ data, currency }: { data: CompCycleOverviewChartProps['meritCostByUnit']; currency: string }) {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 });
  const sorted = [...data].sort((a, b) => b.totalCost - a.totalCost);

  return (
    <div className="overflow-auto max-h-32">
      <table className="w-full text-[9px]">
        <thead className="text-left border-b border-border">
          <tr>
            <th className="pb-1 font-semibold text-muted-foreground">Unit</th>
            <th className="pb-1 font-semibold text-muted-foreground text-right">Cost</th>
            <th className="pb-1 font-semibold text-muted-foreground text-right">HC</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-1 text-foreground">{row.unit}</td>
              <td className="py-1 text-foreground text-right">{formatter.format(row.totalCost)}</td>
              <td className="py-1 text-muted-foreground text-right">{row.headcount || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CycleStageIndicator({ cycleStage }: { cycleStage: NonNullable<CompCycleOverviewChartProps['cycleStage']> }) {
  return (
    <div className="flex items-center gap-2">
      {cycleStage.stages.map((stage, i) => (
        <div key={i} className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <div
              className={`w-3 h-3 rounded-full ${
                stage.status === 'completed' ? 'bg-emerald-500' :
                stage.status === 'in_progress' ? 'bg-amber-500' :
                'bg-gray-300'
              }`}
            />
            <span className="text-[9px] font-medium text-foreground">{stage.name}</span>
          </div>
          {stage.completedPct !== undefined && (
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${stage.completedPct}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
