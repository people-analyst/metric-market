import { useMemo } from "react";

export interface WaffleBarSegment {
  label: string;
  value: number;
  color?: string;
}

export interface WaffleBarGroup {
  label: string;
  segments: WaffleBarSegment[];
}

export interface WaffleBarChartProps {
  groups: WaffleBarGroup[];
  width?: number;
  height?: number;
  cellSize?: number;
  cellGap?: number;
  cols?: number;
  defaultColors?: string[];
}

const PALETTE = ["#0f69ff", "#5b636a", "#a3adb8"];

export function WaffleBarChart({
  groups,
  width = 320,
  height = 180,
  cellSize = 12,
  cellGap = 2,
  cols = 4,
  defaultColors = PALETTE,
}: WaffleBarChartProps) {
  const pad = { t: 8, b: 20, l: 16, r: 16 };

  const bars = useMemo(() => {
    const total = Math.max(...groups.map((g) => g.segments.reduce((s, seg) => s + seg.value, 0)));
    const maxCells = Math.ceil(total);
    const barW = cols * (cellSize + cellGap) - cellGap;
    const groupSpacing = (width - pad.l - pad.r - barW * groups.length) / (groups.length + 1);

    return groups.map((g, gi) => {
      const cells: { row: number; col: number; color: string }[] = [];
      let ci = 0;
      g.segments.forEach((seg, si) => {
        const count = Math.round(seg.value);
        const color = seg.color ?? defaultColors[si % defaultColors.length];
        for (let i = 0; i < count; i++) {
          const col = ci % cols;
          const row = Math.floor(ci / cols);
          cells.push({ row, col, color });
          ci++;
        }
      });
      const x = pad.l + groupSpacing * (gi + 1) + barW * gi;
      const totalRows = Math.ceil(ci / cols);
      return { label: g.label, x, cells, totalRows };
    });
  }, [groups, width, cellSize, cellGap, cols, defaultColors, pad.l, pad.r]);

  const maxRows = Math.max(...bars.map((b) => b.totalRows));
  const chartHeight = maxRows * (cellSize + cellGap) - cellGap;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-waffle-bar">
      <g transform={`translate(0,${pad.t})`}>
        {bars.map((bar) => (
          <g key={bar.label} transform={`translate(${bar.x},0)`}>
            {bar.cells.map((cell, ci) => {
              const x = cell.col * (cellSize + cellGap);
              const y = chartHeight - (cell.row + 1) * (cellSize + cellGap) + cellGap;
              return <rect key={ci} x={x} y={y} width={cellSize} height={cellSize} rx={1} fill={cell.color} />;
            })}
            <text
              x={(cols * (cellSize + cellGap) - cellGap) / 2}
              y={chartHeight + 14}
              textAnchor="middle"
              fontSize={8}
              fill="currentColor"
              opacity={0.4}
            >
              {bar.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
