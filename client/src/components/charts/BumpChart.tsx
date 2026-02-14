import { useMemo } from "react";

export interface BumpChartItem {
  label: string;
  startRank: number;
  endRank: number;
  startValue: number;
  endValue: number;
  startColor?: string;
  endColor?: string;
}

export interface BumpChartProps {
  items: BumpChartItem[];
  startYear: string | number;
  endYear: string | number;
  width?: number;
  height?: number;
  defaultStartColor?: string;
  defaultEndColor?: string;
}

export function BumpChart({
  items,
  startYear,
  endYear,
  width = 320,
  height = 220,
  defaultStartColor = "#0f69ff",
  defaultEndColor = "#5b636a",
}: BumpChartProps) {
  const pad = { t: 30, r: 80, b: 16, l: 40 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;

  const layout = useMemo(() => {
    const n = items.length;
    const rowH = ch / Math.max(n, 1);
    const x0 = 28;
    const x1 = cw - 28;
    const r = Math.min(14, rowH * 0.35);

    return items.map((item) => {
      const sy = (item.startRank - 1) * rowH + rowH / 2;
      const ey = (item.endRank - 1) * rowH + rowH / 2;
      return {
        ...item,
        sx: x0,
        sy,
        ex: x1,
        ey,
        r,
        sc: item.startColor ?? defaultStartColor,
        ec: item.endColor ?? defaultEndColor,
      };
    });
  }, [items, cw, ch, defaultStartColor, defaultEndColor]);

  const rowH = ch / Math.max(items.length, 1);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-bump">
      <g transform={`translate(${pad.l},${pad.t})`}>
        <text x={layout[0]?.sx ?? 28} y={-12} textAnchor="middle" fontSize={11} fill="#5b636a" fontWeight={700}>
          {startYear}
        </text>
        <text x={layout[0]?.ex ?? cw - 28} y={-12} textAnchor="middle" fontSize={11} fill="#5b636a" fontWeight={700}>
          {endYear}
        </text>

        {layout.map((it, i) => {
          const lineColor = it.sy <= it.ey ? it.sc : it.ec;
          return (
            <g key={i}>
              <text x={-4} y={it.sy + 4} textAnchor="end" fontSize={10} fill="#5b636a" fontWeight={700}>
                {it.startRank}
              </text>

              <line
                x1={it.sx}
                y1={it.sy}
                x2={it.ex}
                y2={it.ey}
                stroke={lineColor}
                strokeWidth={1.5}
              />

              <circle cx={it.sx} cy={it.sy} r={it.r} fill={it.sc} />
              <text x={it.sx} y={it.sy + 4} textAnchor="middle" fontSize={8} fill="#e0e4e9" fontWeight={600}>
                {it.startValue}
              </text>

              <circle cx={it.ex} cy={it.ey} r={it.r} fill={it.ec} />
              <text x={it.ex} y={it.ey + 4} textAnchor="middle" fontSize={8} fill="#e0e4e9" fontWeight={600}>
                {it.endValue}
              </text>

              <text
                x={it.ex + it.r + 6}
                y={it.ey + 4}
                fontSize={10}
                fill="#232a31"
                fontWeight={700}
              >
                {it.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
