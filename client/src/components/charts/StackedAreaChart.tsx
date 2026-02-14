import { useMemo } from "react";
import * as d3 from "d3";

export interface StackedAreaSeries {
  label: string;
  values: number[];
  color?: string;
}

export interface StackedAreaChartProps {
  series: StackedAreaSeries[];
  xLabels?: string[];
  width?: number;
  height?: number;
  defaultColors?: string[];
  xLabel?: string;
  yLabel?: string;
}

export function StackedAreaChart({
  series,
  xLabels,
  width = 320,
  height = 200,
  defaultColors = ["#232a31", "#5b636a", "#a3adb8", "#0f69ff"],
  xLabel,
  yLabel,
}: StackedAreaChartProps) {
  const pad = { t: 12, r: 16, b: 28, l: 40 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;

  const { areas, xScale, yScale, yTicks, xTicks } = useMemo(() => {
    const len = series[0]?.values.length ?? 0;
    const stacked: number[][] = Array.from({ length: len }, () => []);

    for (let xi = 0; xi < len; xi++) {
      let cumulative = 0;
      for (let si = 0; si < series.length; si++) {
        stacked[xi][si] = cumulative;
        cumulative += series[si].values[xi];
      }
      stacked[xi].push(cumulative);
    }

    const maxY = d3.max(stacked, (row) => row[row.length - 1]) ?? 1;

    const xScale = d3.scaleLinear().domain([0, len - 1]).range([0, cw]);
    const yScale = d3.scaleLinear().domain([0, maxY]).nice().range([ch, 0]);

    const areas = series.map((s, si) => {
      const area = d3.area<number>()
        .x((_, i) => xScale(i))
        .y0((_, i) => yScale(stacked[i][si]))
        .y1((_, i) => yScale(stacked[i][si] + s.values[i]))
        .curve(d3.curveMonotoneX);

      return {
        label: s.label,
        color: s.color ?? defaultColors[si % defaultColors.length],
        path: area(s.values) ?? "",
      };
    });

    return {
      areas: areas.reverse(),
      xScale,
      yScale,
      yTicks: yScale.ticks(5),
      xTicks: xScale.ticks(6),
    };
  }, [series, cw, ch, defaultColors]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-stacked-area">
      <g transform={`translate(${pad.l},${pad.t})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} y1={yScale(t)} x2={cw} y2={yScale(t)} stroke="currentColor" strokeOpacity={0.06} />
            <text x={-4} y={yScale(t) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.35}>
              {t}
            </text>
          </g>
        ))}
        {areas.map((a) => (
          <path key={a.label} d={a.path} fill={a.color} opacity={0.85} />
        ))}
        {xTicks.map((t) => (
          <text
            key={t}
            x={xScale(t)}
            y={ch + 14}
            textAnchor="middle"
            fontSize={8}
            fill="currentColor"
            opacity={0.35}
          >
            {xLabels ? xLabels[Math.round(t)] ?? Math.round(t) : Math.round(t)}
          </text>
        ))}
        {xLabel && (
          <text x={cw / 2} y={ch + 24} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.4}>
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text x={-pad.l + 6} y={-4} fontSize={8} fill="currentColor" opacity={0.4}>
            {yLabel}
          </text>
        )}
      </g>
    </svg>
  );
}
