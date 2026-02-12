import { useMemo } from "react";
import * as d3 from "d3";

export interface MultiLineSeries {
  label: string;
  values: number[];
  color?: string;
}

export interface MultiLineChartProps {
  series: MultiLineSeries[];
  xLabels?: string[];
  width?: number;
  height?: number;
  referenceLine?: number;
  defaultColors?: string[];
  yLabel?: string;
}

const PALETTE = ["#0f69ff", "#5b636a", "#a3adb8", "#232a31", "#e0e4e9"];

export function MultiLineChart({
  series,
  xLabels,
  width = 340,
  height = 180,
  referenceLine,
  defaultColors = PALETTE,
  yLabel,
}: MultiLineChartProps) {
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const { xScale, yScale, lines } = useMemo(() => {
    const maxLen = Math.max(...series.map((s) => s.values.length));
    const allVals = series.flatMap((s) => s.values);
    if (referenceLine !== undefined) allVals.push(referenceLine);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(allVals) as [number, number])
      .nice()
      .range([ih, 0]);

    const xScale = d3
      .scaleLinear()
      .domain([0, maxLen - 1])
      .range([0, iw]);

    const lineGen = d3
      .line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    const lines = series.map((s, si) => ({
      path: lineGen(s.values) ?? "",
      color: s.color || defaultColors[si % defaultColors.length],
      label: s.label,
    }));

    return { xScale, yScale, lines };
  }, [series, iw, ih, referenceLine, defaultColors]);

  const yTicks = yScale.ticks(5);
  const maxLen = Math.max(...series.map((s) => s.values.length));
  const xTickCount = Math.min(maxLen, 8);
  const xTicks = d3.range(0, maxLen, Math.max(1, Math.floor(maxLen / xTickCount)));

  return (
    <svg width={width} height={height} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} x2={iw} y1={yScale(t)} y2={yScale(t)} stroke="#e0e4e9" strokeWidth={0.5} />
            <text x={-6} y={yScale(t)} dy="0.35em" textAnchor="end" fill="#5b636a" fontSize={8}>
              {t}
            </text>
          </g>
        ))}

        {yLabel && (
          <text
            transform={`translate(-30,${ih / 2}) rotate(-90)`}
            textAnchor="middle"
            fill="#5b636a"
            fontSize={8}
          >
            {yLabel}
          </text>
        )}

        {referenceLine !== undefined && (
          <line
            x1={0}
            x2={iw}
            y1={yScale(referenceLine)}
            y2={yScale(referenceLine)}
            stroke="#232a31"
            strokeWidth={1}
          />
        )}

        {lines.map((l) => (
          <path key={l.label} d={l.path} fill="none" stroke={l.color} strokeWidth={1.5} />
        ))}

        {xTicks.map((t) => (
          <text
            key={t}
            x={xScale(t)}
            y={ih + 16}
            textAnchor="middle"
            fill="#5b636a"
            fontSize={7}
          >
            {xLabels ? xLabels[t] ?? t : t}
          </text>
        ))}

        <g transform={`translate(${iw - lines.length * 50},${-4})`}>
          {lines.map((l, i) => (
            <g key={l.label} transform={`translate(${i * 55},0)`}>
              <line x1={0} x2={12} y1={0} y2={0} stroke={l.color} strokeWidth={2} />
              <text x={15} y={0} dy="0.35em" fill="#5b636a" fontSize={7}>
                {l.label}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
