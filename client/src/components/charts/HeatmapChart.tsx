import { useMemo } from "react";
import * as d3 from "d3";

export interface HeatmapChartProps {
  data: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  width?: number;
  height?: number;
  colorRange?: [string, string, string];
}

export function HeatmapChart({
  data,
  rowLabels,
  colLabels,
  width = 260,
  height = 220,
  colorRange = ["#e0e4e9", "#0f69ff", "#232a31"],
}: HeatmapChartProps) {
  const margin = { top: 22, right: 8, bottom: 8, left: 22 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const cellW = iw / cols;
  const cellH = ih / rows;
  const gap = 1.5;

  const colorScale = useMemo(() => {
    const flat = data.flat();
    const lo = d3.min(flat) ?? 0;
    const hi = d3.max(flat) ?? 1;
    const mid = (lo + hi) / 2;
    return d3.scaleLinear<string>().domain([lo, mid, hi]).range(colorRange);
  }, [data, colorRange]);

  const rLabels = rowLabels ?? data.map((_, i) => String(rows - i));
  const cLabels = colLabels ?? data[0]?.map((_, i) => String.fromCharCode(65 + i)) ?? [];

  return (
    <svg width={width} height={height} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {cLabels.map((l, ci) => (
          <text
            key={ci}
            x={ci * cellW + cellW / 2}
            y={-8}
            textAnchor="middle"
            fill="#5b636a"
            fontSize={9}
            fontWeight={600}
          >
            {l}
          </text>
        ))}

        {data.map((row, ri) => (
          <g key={ri}>
            <text
              x={-8}
              y={ri * cellH + cellH / 2}
              dy="0.35em"
              textAnchor="end"
              fill="#5b636a"
              fontSize={8}
            >
              {rLabels[ri]}
            </text>
            {row.map((val, ci) => (
              <rect
                key={ci}
                x={ci * cellW + gap / 2}
                y={ri * cellH + gap / 2}
                width={cellW - gap}
                height={cellH - gap}
                fill={colorScale(val)}
                rx={2}
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
