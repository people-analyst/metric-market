import { useMemo } from "react";
import * as d3 from "d3";

export interface TileCartogramDatum {
  id: string;
  label: string;
  value: number;
  row: number;
  col: number;
}

export interface TileCartogramChartProps {
  tiles: TileCartogramDatum[];
  width?: number;
  colorRange?: [string, string];
}

export function TileCartogramChart({
  tiles,
  width = 300,
  colorRange = ["#e0e4e9", "#0f69ff"],
}: TileCartogramChartProps) {
  const maxCol = Math.max(...tiles.map((t) => t.col));
  const maxRow = Math.max(...tiles.map((t) => t.row));
  const cols = maxCol + 1;
  const rows = maxRow + 1;
  const gap = 2;
  const cellSize = Math.floor((width - gap * (cols - 1)) / cols);
  const totalHeight = rows * (cellSize + gap) - gap;

  const colorScale = useMemo(() => {
    const vals = tiles.map((t) => t.value);
    return d3
      .scaleLinear<string>()
      .domain([d3.min(vals) ?? 0, d3.max(vals) ?? 1])
      .range(colorRange);
  }, [tiles, colorRange]);

  return (
    <svg width={width} height={totalHeight} className="block">
      {tiles.map((tile) => {
        const x = tile.col * (cellSize + gap);
        const y = tile.row * (cellSize + gap);
        return (
          <g key={tile.id}>
            <rect
              x={x}
              y={y}
              width={cellSize}
              height={cellSize}
              fill={colorScale(tile.value)}
              rx={2}
            />
            <text
              x={x + cellSize / 2}
              y={y + cellSize / 2}
              dy="0.35em"
              textAnchor="middle"
              fill="#e0e4e9"
              fontSize={Math.max(7, cellSize * 0.28)}
              fontWeight={600}
            >
              {tile.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
