import { useMemo } from "react";
import * as d3 from "d3";

export interface RadialBarDatum {
  label: string;
  value: number;
  color?: string;
}

export interface RadialBarChartProps {
  data: RadialBarDatum[];
  maxValue?: number;
  width?: number;
  height?: number;
  defaultColors?: string[];
  trackColor?: string;
}

export function RadialBarChart({
  data,
  maxValue,
  width = 260,
  height = 260,
  defaultColors = ["#0f69ff", "#5b636a", "#232a31", "#a3adb8"],
  trackColor = "#e0e4e9",
}: RadialBarChartProps) {
  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(cx, cy) - 12;
  const barWidth = Math.min(16, outerR / (data.length + 1));
  const gap = 4;

  const max = maxValue ?? d3.max(data, (d) => d.value) ?? 100;

  const arcs = useMemo(() => {
    return data.map((d, i) => {
      const r = outerR - i * (barWidth + gap);
      const angle = (d.value / max) * (2 * Math.PI * 0.85);
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + angle;
      const trackEnd = startAngle + 2 * Math.PI * 0.85;

      const arcGen = d3.arc<unknown>()
        .innerRadius(r - barWidth)
        .outerRadius(r)
        .cornerRadius(barWidth / 2);

      return {
        label: d.label,
        color: d.color ?? defaultColors[i % defaultColors.length],
        valuePath: arcGen({ startAngle, endAngle, innerRadius: 0, outerRadius: 0 } as any) ?? "",
        trackPath: arcGen({ startAngle, endAngle: trackEnd, innerRadius: 0, outerRadius: 0 } as any) ?? "",
        labelY: -r + barWidth / 2 + 4,
        r,
      };
    });
  }, [data, outerR, barWidth, gap, max, defaultColors]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-radial-bar">
      <g transform={`translate(${cx},${cy})`}>
        {arcs.map((a) => (
          <g key={a.label}>
            <path d={a.trackPath} fill={trackColor} opacity={0.35} />
            <path d={a.valuePath} fill={a.color} />
          </g>
        ))}
        {arcs.map((a, i) => (
          <text
            key={`label-${i}`}
            x={-outerR + barWidth}
            y={a.labelY}
            textAnchor="end"
            fontSize={9}
            fill="#232a31"
            fontWeight={500}
            dominantBaseline="central"
          >
            {a.label}
          </text>
        ))}
      </g>
    </svg>
  );
}
