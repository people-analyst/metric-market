import { useMemo } from "react";

export interface AlluvialFlow {
  from: string;
  to: string;
  value: number;
}

export interface AlluvialChartProps {
  flows: AlluvialFlow[];
  leftLabel?: string;
  rightLabel?: string;
  width?: number;
  height?: number;
  colors?: Record<string, string>;
}

const DEFAULT_COLORS: Record<string, string> = {
  A: "#0f69ff",
  B: "#5b636a",
  C: "#a3adb8",
  D: "#232a31",
  E: "#e0e4e9",
};

export function AlluvialChart({
  flows,
  leftLabel = "Before",
  rightLabel = "After",
  width = 320,
  height = 180,
  colors = DEFAULT_COLORS,
}: AlluvialChartProps) {
  const pad = { t: 20, b: 8, l: 8, r: 8 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;
  const nodeW = 2;
  const gap = 3;

  const { leftNodes, rightNodes, links } = useMemo(() => {
    const leftMap = new Map<string, number>();
    const rightMap = new Map<string, number>();
    for (const f of flows) {
      leftMap.set(f.from, (leftMap.get(f.from) ?? 0) + f.value);
      rightMap.set(f.to, (rightMap.get(f.to) ?? 0) + f.value);
    }

    const leftTotal = Array.from(leftMap.values()).reduce((a, b) => a + b, 0);
    const rightTotal = Array.from(rightMap.values()).reduce((a, b) => a + b, 0);
    const totalGapL = gap * (leftMap.size - 1);
    const totalGapR = gap * (rightMap.size - 1);

    let yL = 0;
    const leftNodes: { key: string; y: number; h: number; val: number }[] = [];
    Array.from(leftMap.entries()).forEach(([key, val]) => {
      const h = (val / leftTotal) * (ch - totalGapL);
      leftNodes.push({ key, y: yL, h, val });
      yL += h + gap;
    });

    let yR = 0;
    const rightNodes: { key: string; y: number; h: number; val: number }[] = [];
    Array.from(rightMap.entries()).forEach(([key, val]) => {
      const h = (val / rightTotal) * (ch - totalGapR);
      rightNodes.push({ key, y: yR, h, val });
      yR += h + gap;
    });

    const leftOffsets = new Map<string, number>();
    const rightOffsets = new Map<string, number>();
    for (const n of leftNodes) leftOffsets.set(n.key, n.y);
    for (const n of rightNodes) rightOffsets.set(n.key, n.y);

    const links = flows.map((f) => {
      const lNode = leftNodes.find((n) => n.key === f.from)!;
      const rNode = rightNodes.find((n) => n.key === f.to)!;
      const lh = (f.value / lNode.val) * lNode.h;
      const rh = (f.value / rNode.val) * rNode.h;
      const ly = leftOffsets.get(f.from)!;
      const ry = rightOffsets.get(f.to)!;
      leftOffsets.set(f.from, ly + lh);
      rightOffsets.set(f.to, ry + rh);
      return { from: f.from, ly, lh, ry, rh };
    });

    return { leftNodes, rightNodes, links };
  }, [flows, ch]);

  const x0 = pad.l + nodeW;
  const x1 = width - pad.r - nodeW;
  const mx = (x0 + x1) / 2;

  function getColor(key: string) {
    return colors[key] ?? "#5b636a";
  }

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-alluvial">
      <text x={x0} y={12} fontSize={9} fill="currentColor" opacity={0.4}>{leftLabel}</text>
      <text x={x1} y={12} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.4}>{rightLabel}</text>
      <g transform={`translate(0,${pad.t})`}>
        {links.map((lnk, i) => {
          const d = `M${x0},${lnk.ly} C${mx},${lnk.ly} ${mx},${lnk.ry} ${x1},${lnk.ry} L${x1},${lnk.ry + lnk.rh} C${mx},${lnk.ry + lnk.rh} ${mx},${lnk.ly + lnk.lh} ${x0},${lnk.ly + lnk.lh} Z`;
          return <path key={i} d={d} fill={getColor(lnk.from)} opacity={0.55} />;
        })}
        {leftNodes.map((n) => (
          <g key={`l-${n.key}`}>
            <rect x={pad.l} y={n.y} width={nodeW} height={n.h} fill={getColor(n.key)} />
            <text x={x0 + 4} y={n.y + n.h / 2 + 3} fontSize={8} fontWeight={600} fill="currentColor" opacity={0.7}>{n.key}</text>
            <text x={pad.l - 3} y={n.y + n.h / 2 + 3} textAnchor="end" fontSize={7} fill="currentColor" opacity={0.35}>{n.val}</text>
          </g>
        ))}
        {rightNodes.map((n) => (
          <g key={`r-${n.key}`}>
            <rect x={x1} y={n.y} width={nodeW} height={n.h} fill={getColor(n.key)} />
            <text x={x1 - 4} y={n.y + n.h / 2 + 3} textAnchor="end" fontSize={8} fontWeight={600} fill="currentColor" opacity={0.7}>{n.key}</text>
            <text x={x1 + nodeW + 3} y={n.y + n.h / 2 + 3} fontSize={7} fill="currentColor" opacity={0.35}>{n.val}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
