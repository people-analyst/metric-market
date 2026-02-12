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
