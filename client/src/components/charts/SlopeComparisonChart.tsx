import { useMemo } from "react";

export interface SlopeItem {
  label: string;
  startValue: number;
  endValue: number;
  startLabel?: string;
  endLabel?: string;
}

export interface SlopeComparisonChartProps {
  items: SlopeItem[];
  width?: number;
  height?: number;
  accentColor?: string;
  startYear?: string;
  endYear?: string;
}

export function SlopeComparisonChart({
  items,
  width = 320,
  height = 180,
  accentColor = "#0f69ff",
  startYear = "'20",
  endYear = "'25",
}: SlopeComparisonChartProps) {
  const pad = { t: 16, b: 28, l: 8, r: 8 };
  const itemW = (width - pad.l - pad.r) / items.length;
  const ch = height - pad.t - pad.b;

  const maxVal = useMemo(() => Math.max(...items.flatMap((it) => [it.startValue, it.endValue])), [items]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-slope-comparison">
      {items.map((item, i) => {
        const x0 = pad.l + i * itemW;
        const cx = x0 + itemW / 2;
        const iw = itemW * 0.7;
        const left = cx - iw / 2;
        const right = cx + iw / 2;

        const sy = pad.t + ch - (item.startValue / maxVal) * ch;
        const ey = pad.t + ch - (item.endValue / maxVal) * ch;

        const pct = ((item.endValue - item.startValue) / item.startValue * 100).toFixed(1);
        const positive = item.endValue >= item.startValue;

        const gradId = `slope-grad-${i}`;
        const triPath = `M${left},${sy} L${right},${ey} L${right},${pad.t + ch} L${left},${pad.t + ch} Z`;

        return (
          <g key={item.label}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <path d={triPath} fill={`url(#${gradId})`} />
            <line x1={left} y1={sy} x2={right} y2={ey} stroke={accentColor} strokeWidth={1.5} />
            <text x={left} y={sy - 4} fontSize={8} fill="currentColor" opacity={0.4}>{item.startValue}</text>
            <text x={right} y={ey - 4} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.4}>{item.endValue}</text>
            <text x={cx} y={sy + (pad.t + ch - sy) / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={accentColor}>
              {positive ? "+" : ""}{pct}%
            </text>
            <text x={left} y={height - pad.b + 12} fontSize={7} fill="currentColor" opacity={0.35}>{startYear}</text>
            <text x={right} y={height - pad.b + 12} textAnchor="end" fontSize={7} fill="currentColor" opacity={0.35}>{endYear}</text>
            <text x={cx} y={height - 2} textAnchor="middle" fontSize={8} fontWeight={500} fill="currentColor" opacity={0.6}>{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
