import { useMemo } from "react";
import * as d3 from "d3";

export interface SparklineRow {
  label: string;
  value: number;
  data: number[];
  color?: string;
}

export interface SparklineRowsChartProps {
  rows: SparklineRow[];
  width?: number;
  rowHeight?: number;
  lineColor?: string;
  labelColor?: string;
  dividerColor?: string;
}

export function SparklineRowsChart({
  rows,
  width = 320,
  rowHeight = 48,
  lineColor = "#5b636a",
  labelColor = "#232a31",
  dividerColor = "#e0e4e9",
}: SparklineRowsChartProps) {
  const pad = { l: 80, r: 50 };
  const sparkW = width - pad.l - pad.r;
  const totalH = rows.length * rowHeight;
  const sparkH = rowHeight * 0.55;

  const paths = useMemo(() => {
    return rows.map((row) => {
      const xScale = d3.scaleLinear().domain([0, row.data.length - 1]).range([0, sparkW]);
      const ext = d3.extent(row.data) as [number, number];
      const yScale = d3.scaleLinear().domain(ext).range([sparkH, 0]);
      const line = d3.line<number>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d))
        .curve(d3.curveMonotoneX);
      return {
        path: line(row.data) ?? "",
        firstX: xScale(0),
        firstY: yScale(row.data[0]),
        lastX: xScale(row.data.length - 1),
        lastY: yScale(row.data[row.data.length - 1]),
        firstVal: row.data[0],
        lastVal: row.data[row.data.length - 1],
      };
    });
  }, [rows, sparkW, sparkH]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${totalH}`} data-testid="chart-sparkline-rows">
      {rows.map((row, i) => {
        const y = i * rowHeight;
        const color = row.color ?? lineColor;
        const p = paths[i];
        return (
          <g key={i} transform={`translate(0,${y})`}>
            {i > 0 && (
              <line x1={0} y1={0} x2={width} y2={0} stroke={dividerColor} strokeWidth={0.5} />
            )}
            <text
              x={32}
              y={rowHeight / 2 + 1}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={11}
              fill={labelColor}
              fontWeight={700}
            >
              {row.label}
            </text>
            <text
              x={68}
              y={rowHeight / 2 + 1}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={11}
              fill="#5b636a"
            >
              {p.firstVal}
            </text>
            <g transform={`translate(${pad.l},${(rowHeight - sparkH) / 2})`}>
              <path d={p.path} fill="none" stroke={color} strokeWidth={1.5} />
              <circle cx={p.firstX} cy={p.firstY} r={2.5} fill={color} />
              <circle cx={p.lastX} cy={p.lastY} r={2.5} fill={color} />
            </g>
            <text
              x={pad.l + sparkW + 10}
              y={rowHeight / 2 + 1}
              textAnchor="start"
              dominantBaseline="central"
              fontSize={11}
              fill={labelColor}
              fontWeight={700}
            >
              {p.lastVal}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
