import { useMemo } from "react";

export interface StripTimelineRow {
  label: string;
  cells: StripTimelineCell[];
}

export interface StripTimelineCell {
  value?: number | string;
  color?: string;
}

export interface StripTimelineChartProps {
  rows: StripTimelineRow[];
  width?: number;
  cellSize?: number;
  gap?: number;
  defaultColor?: string;
}

export function StripTimelineChart({
  rows,
  width = 320,
  cellSize = 14,
  gap = 2,
  defaultColor = "#e0e4e9",
}: StripTimelineChartProps) {
  const labelWidth = 28;
  const maxCells = useMemo(() => Math.max(...rows.map((r) => r.cells.length)), [rows]);

  const actualWidth = Math.min(width, labelWidth + maxCells * (cellSize + gap));
  const rowHeight = cellSize + gap;
  const totalHeight = rows.length * (rowHeight + 12) + 8;

  return (
    <svg width={actualWidth} height={totalHeight} className="block">
      {rows.map((row, ri) => {
        const ry = ri * (rowHeight + 12) + 8;

        const coloredIndices = row.cells
          .map((c, i) => (c.color ? i : -1))
          .filter((i) => i >= 0);
        const lastColored = coloredIndices.length > 0 ? Math.max(...coloredIndices) : -1;
        const firstColored = coloredIndices.length > 0 ? Math.min(...coloredIndices) : -1;
        const coloredCount = coloredIndices.length;

        return (
          <g key={row.label}>
            <text x={0} y={ry + cellSize / 2} dy="0.35em" fill="#5b636a" fontSize={9} fontWeight={600}>
              {row.label}
            </text>

            {row.cells.map((cell, ci) => {
              const cx = labelWidth + ci * (cellSize + gap);
              const fill = cell.color || defaultColor;
              return (
                <g key={ci}>
                  <rect x={cx} y={ry} width={cellSize} height={cellSize} fill={fill} rx={2} />
                  {cell.value !== undefined && cell.color && (
                    <text
                      x={cx + cellSize / 2}
                      y={ry + cellSize / 2}
                      dy="0.35em"
                      textAnchor="middle"
                      fill="#e0e4e9"
                      fontSize={7}
                      fontWeight={600}
                    >
                      {cell.value}
                    </text>
                  )}
                </g>
              );
            })}

            {coloredCount > 0 && (
              <text
                x={labelWidth + (lastColored + 1) * (cellSize + gap) + 3}
                y={ry - 2}
                fill="#5b636a"
                fontSize={7}
                fontWeight={600}
              >
                +{coloredCount}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
