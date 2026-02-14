export interface StripDotRow {
  label: string;
  events: StripDotEvent[];
}

export interface StripDotEvent {
  position: number;
  color?: string;
}

export interface StripDotChartProps {
  rows: StripDotRow[];
  width?: number;
  maxPosition?: number;
  dotSize?: number;
  gap?: number;
  defaultColors?: [string, string];
}

export function StripDotChart({
  rows,
  width = 320,
  maxPosition,
  dotSize = 10,
  gap = 2,
  defaultColors = ["#0f69ff", "#232a31"],
}: StripDotChartProps) {
  const labelWidth = 22;
  const chartWidth = width - labelWidth;
  const rowHeight = dotSize + 10;
  const totalHeight = rows.length * (rowHeight + 8) + 12;

  const maxPos = maxPosition ?? Math.max(...rows.flatMap((r) => r.events.map((e) => e.position)));

  const scale = (pos: number) => labelWidth + (pos / maxPos) * (chartWidth - dotSize);

  return (
    <svg width={width} height={totalHeight} className="block">
      {rows.map((row, ri) => {
        const ry = ri * (rowHeight + 8) + 10;
        return (
          <g key={row.label}>
            <text x={0} y={ry + dotSize / 2} dy="0.35em" fill="#5b636a" fontSize={9} fontWeight={600}>
              {row.label}
            </text>
            <line x1={labelWidth} x2={width} y1={ry + dotSize / 2} y2={ry + dotSize / 2} stroke="#e0e4e9" strokeWidth={0.5} />
            {row.events.map((ev, ei) => (
              <rect
                key={ei}
                x={scale(ev.position)}
                y={ry}
                width={dotSize}
                height={dotSize}
                fill={ev.color || defaultColors[ei % defaultColors.length]}
                rx={2}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
