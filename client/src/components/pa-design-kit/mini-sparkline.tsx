interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export function MiniSparkline({ data, width = 64, height = 20, className = "", color }: MiniSparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className={className} data-testid="sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={color || "currentColor"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
