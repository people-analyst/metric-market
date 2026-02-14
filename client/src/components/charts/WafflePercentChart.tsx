export interface WafflePercentChartProps {
  percent: number;
  rows?: number;
  cols?: number;
  cellSize?: number;
  gap?: number;
  filledColor?: string;
  emptyColor?: string;
}

export function WafflePercentChart({
  percent,
  rows = 10,
  cols = 10,
  cellSize = 14,
  gap = 2,
  filledColor = "#0f69ff",
  emptyColor = "#e0e4e9",
}: WafflePercentChartProps) {
  const total = rows * cols;
  const filledCount = Math.round((percent / 100) * total);

  const width = cols * (cellSize + gap) - gap;
  const height = rows * (cellSize + gap) - gap + 18;

  const cells: { row: number; col: number; filled: boolean }[] = [];
  let count = 0;
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) {
      cells.push({ row: r, col: c, filled: count < filledCount });
      count++;
    }
  }

  return (
    <svg width={width + 50} height={height} className="block">
      {cells.map(({ row, col, filled }, i) => (
        <rect
          key={i}
          x={col * (cellSize + gap)}
          y={row * (cellSize + gap)}
          width={cellSize}
          height={cellSize}
          fill={filled ? filledColor : emptyColor}
          rx={2}
        />
      ))}
      <text
        x={width + 6}
        y={(rows - 1) * (cellSize + gap) + cellSize / 2}
        dy="0.35em"
        fill="#232a31"
        fontSize={13}
        fontWeight={700}
      >
        {percent}%
      </text>
    </svg>
  );
}
