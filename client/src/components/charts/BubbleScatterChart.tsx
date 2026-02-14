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
