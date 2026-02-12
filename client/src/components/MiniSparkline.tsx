export interface MiniSparklineProps {
  seed: string;
  positive?: boolean;
  width?: number;
  height?: number;
}

export function MiniSparkline({ seed, positive, width = 80, height = 32 }: MiniSparklineProps) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  const points: number[] = [];
  for (let i = 0; i < 12; i++) {
    s = (s * 9301 + 49297) % 233280;
    points.push(30 + (s / 233280) * 40);
  }
  const stepX = width / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${i * stepX},${height - (p / 100) * height}`).join(" ");
  const trending = positive !== undefined ? positive : points[points.length - 1] > points[0];
  const color = trending ? "#22c55e" : "#ef4444";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" data-testid="sparkline">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
