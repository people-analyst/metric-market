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
  sectionLabels?: Record<number, string>;
  tileSize?: number;
  gap?: number;
}

export function TileCartogramChart({
  tiles,
  width = 300,
  colorRange = ["#e0e4e9", "#0f69ff"],
  sectionLabels,
  tileSize,
  gap = 2,
}: TileCartogramChartProps) {
  const maxCol = Math.max(...tiles.map((t) => t.col));
  const maxRow = Math.max(...tiles.map((t) => t.row));
  const cols = maxCol + 1;

  const maxCellForWidth = Math.floor((width - gap * (cols - 1)) / cols);
  const cellSize = tileSize ?? Math.min(36, maxCellForWidth);

  const naturalWidth = cols * (cellSize + gap) - gap;
  const actualWidth = Math.min(naturalWidth, width);

  const labelH = 14;
  const labelRows = sectionLabels ? Object.keys(sectionLabels).map(Number).sort((a, b) => a - b) : [];

  const rowY = (row: number) => {
    if (!sectionLabels) return row * (cellSize + gap);
    let offset = 0;
    for (const lr of labelRows) {
      if (lr <= row) offset += labelH;
    }
    return row * (cellSize + gap) + offset;
  };

  const lastRowY = rowY(maxRow) + cellSize;
  const totalHeight = lastRowY;

  const colorScale = useMemo(() => {
    const vals = tiles.map((t) => t.value);
    return d3
      .scaleLinear<string>()
      .domain([d3.min(vals) ?? 0, d3.max(vals) ?? 1])
      .range(colorRange);
  }, [tiles, colorRange]);

  return (
    <svg width={actualWidth} height={totalHeight} className="block" data-testid="chart-tile-cartogram">
      {sectionLabels &&
        Object.entries(sectionLabels).map(([rowStr, label]) => {
          const row = Number(rowStr);
          const y = rowY(row) - labelH + 3;
          return (
            <text
              key={`section-${rowStr}`}
              x={0}
              y={y}
              fontSize={8}
              fontWeight={600}
              fill="#5b636a"
              dominantBaseline="hanging"
            >
              {label}
            </text>
          );
        })}
      {tiles.map((tile) => {
        const x = tile.col * (cellSize + gap);
        const y = rowY(tile.row);
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
