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
