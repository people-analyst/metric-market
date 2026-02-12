import { useMemo } from "react";
import * as d3 from "d3";

export interface ControlChartProps {
  data: number[];
  width?: number;
  height?: number;
  lineColor?: string;
  bandColors?: [string, string, string];
  xLabel?: string;
  yLabel?: string;
}

export function ControlChart({
  data,
  width = 320,
  height = 180,
  lineColor = "#5b636a",
  bandColors = ["#e0e4e9", "#a3adb8", "#5b636a"],
  xLabel,
  yLabel,
}: ControlChartProps) {
  const pad = { t: 14, r: 44, b: 28, l: 36 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;

  const stats = useMemo(() => {
    const mean = d3.mean(data) ?? 0;
    const std = d3.deviation(data) ?? 1;
    return { mean, std };
  }, [data]);

  const { xScale, yScale, linePath, xTicks } = useMemo(() => {
    const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, cw]);
    const { mean, std } = stats;
    const lo = mean - 3.5 * std;
    const hi = mean + 3.5 * std;
    const yScale = d3.scaleLinear().domain([lo, hi]).range([ch, 0]);

    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    return {
      xScale,
      yScale,
      linePath: line(data) ?? "",
      xTicks: xScale.ticks(5),
    };
  }, [data, cw, ch, stats]);

  const { mean, std } = stats;
  const sigmaLines = [
    { label: "+3UCL", val: mean + 3 * std },
    { label: "+2", val: mean + 2 * std },
    { label: "+1", val: mean + 1 * std },
    { label: "Average", val: mean },
    { label: "-1", val: mean - 1 * std },
    { label: "-2", val: mean - 2 * std },
    { label: "-3LCL", val: mean - 3 * std },
  ];

  const bands = [
    { y0: mean - std, y1: mean + std, fill: bandColors[0] },
    { y0: mean - 2 * std, y1: mean - std, fill: bandColors[1] },
    { y0: mean + std, y1: mean + 2 * std, fill: bandColors[1] },
    { y0: mean - 3 * std, y1: mean - 2 * std, fill: bandColors[2] },
    { y0: mean + 2 * std, y1: mean + 3 * std, fill: bandColors[2] },
  ];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-control">
      <g transform={`translate(${pad.l},${pad.t})`}>
        {bands.map((b, i) => (
          <rect
            key={i}
            x={0}
            y={yScale(b.y1)}
            width={cw}
            height={yScale(b.y0) - yScale(b.y1)}
            fill={b.fill}
            opacity={0.12}
          />
        ))}
        {sigmaLines.map((s) => (
          <g key={s.label}>
            <line
              x1={0}
              y1={yScale(s.val)}
              x2={cw}
              y2={yScale(s.val)}
              stroke={s.label === "Average" ? "#5b636a" : "#e0e4e9"}
              strokeWidth={s.label === "Average" ? 1 : 0.5}
              strokeDasharray={s.label === "Average" ? "4 2" : "2 2"}
            />
            <text
              x={cw + 4}
              y={yScale(s.val) + 3}
              fontSize={7}
              fill="#5b636a"
            >
              {s.label}
            </text>
          </g>
        ))}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={1.5} />
        {data.map((d, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d)} r={2} fill={lineColor} />
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
            {Math.round(t)}
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
