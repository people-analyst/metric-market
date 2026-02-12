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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function RadialBarChart({
  data,
  maxValue,
  width = 260,
  height = 260,
  defaultColors = ["#0f69ff", "#5b636a", "#232a31", "#a3adb8"],
  trackColor = "#e0e4e9",
}: RadialBarChartProps) {
  const legendH = data.length * 14 + 4;
  const totalH = height + legendH;
  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(cx, cy) - 8;
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
        letter: LETTERS[i] ?? String(i + 1),
        label: d.label,
        color: d.color ?? defaultColors[i % defaultColors.length],
        valuePath: arcGen({ startAngle, endAngle, innerRadius: 0, outerRadius: 0 } as any) ?? "",
        trackPath: arcGen({ startAngle, endAngle: trackEnd, innerRadius: 0, outerRadius: 0 } as any) ?? "",
        r,
        value: d.value,
      };
    });
  }, [data, outerR, barWidth, gap, max, defaultColors]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${totalH}`} data-testid="chart-radial-bar">
      <g transform={`translate(${cx},${cy})`}>
        {arcs.map((a) => (
          <g key={a.letter}>
            <path d={a.trackPath} fill={trackColor} opacity={0.35} />
            <path d={a.valuePath} fill={a.color} />
          </g>
        ))}
        {arcs.map((a, i) => {
          const indicatorSize = barWidth * 0.42;
          const spacing = indicatorSize * 2.6;
          const totalW = arcs.length * spacing;
          const ix = -totalW / 2 + i * spacing + spacing / 2;
          const iy = -arcs[0].r + barWidth + indicatorSize + 6;
          return (
            <g key={`ind-${a.letter}`}>
              <circle cx={ix} cy={iy} r={indicatorSize} fill={a.color} />
              <text
                x={ix}
                y={iy}
                dy="0.35em"
                textAnchor="middle"
                fontSize={7}
                fontWeight={700}
                fill="#e0e4e9"
              >
                {a.letter}
              </text>
            </g>
          );
        })}
      </g>
      <g transform={`translate(8,${height + 2})`}>
        {arcs.map((a, i) => (
          <g key={a.letter} transform={`translate(0,${i * 14})`}>
            <circle cx={5} cy={5} r={4} fill={a.color} />
            <text x={13} y={5} dy="0.35em" fontSize={8} fill="#5b636a" fontWeight={500}>
              {a.letter}
            </text>
            <text x={23} y={5} dy="0.35em" fontSize={8} fill="#5b636a">
              {a.label} ({a.value})
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
