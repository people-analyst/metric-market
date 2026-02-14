import { useMemo } from "react";

export interface DendrogramNode {
  label?: string;
  children?: DendrogramNode[];
  height?: number;
}

export interface DendrogramChartProps {
  root: DendrogramNode;
  width?: number;
  height?: number;
  lineColor?: string;
  labelColor?: string;
}

interface LayoutNode {
  x: number;
  y: number;
  label?: string;
  children?: LayoutNode[];
}

function assignLeafX(node: DendrogramNode, state: { idx: number }, spacing: number): number {
  if (!node.children || node.children.length === 0) {
    const x = state.idx * spacing;
    state.idx++;
    return x;
  }
  const childXs = node.children.map((c) => assignLeafX(c, state, spacing));
  return (childXs[0] + childXs[childXs.length - 1]) / 2;
}

function layoutTree(
  node: DendrogramNode,
  state: { idx: number },
  spacing: number,
  yScale: (h: number) => number,
): LayoutNode {
  if (!node.children || node.children.length === 0) {
    const x = state.idx * spacing;
    state.idx++;
    return { x, y: yScale(0), label: node.label };
  }
  const children = node.children.map((c) => layoutTree(c, state, spacing, yScale));
  const x = (children[0].x + children[children.length - 1].x) / 2;
  const y = yScale(node.height ?? 1);
  return { x, y, label: node.label, children };
}

function countLeaves(node: DendrogramNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}

function maxHeight(node: DendrogramNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return Math.max(node.height ?? 1, ...node.children.map(maxHeight));
}

function renderLinks(node: LayoutNode, color: string): JSX.Element[] {
  const els: JSX.Element[] = [];
  if (node.children) {
    for (const child of node.children) {
      els.push(
        <path
          key={`${node.x}-${node.y}-${child.x}-${child.y}`}
          d={`M${child.x},${child.y} L${child.x},${node.y} L${node.x},${node.y}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />,
      );
      els.push(...renderLinks(child, color));
    }
  }
  return els;
}

export function DendrogramChart({
  root,
  width = 320,
  height = 200,
  lineColor = "#5b636a",
  labelColor = "#232a31",
}: DendrogramChartProps) {
  const pad = { t: 16, r: 20, b: 24, l: 20 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;

  const layoutRoot = useMemo(() => {
    const leaves = countLeaves(root);
    const mh = maxHeight(root);
    const spacing = cw / Math.max(leaves - 1, 1);
    const yScale = (h: number) => pad.t + ch - (h / Math.max(mh, 1)) * ch;
    const state = { idx: 0 };
    return layoutTree(root, state, spacing, yScale);
  }, [root, cw, ch]);

  const labels: { x: number; y: number; text: string }[] = [];
  function collectLabels(node: LayoutNode) {
    if (node.label && (!node.children || node.children.length === 0)) {
      labels.push({ x: node.x, y: node.y, text: node.label });
    }
    node.children?.forEach(collectLabels);
  }
  collectLabels(layoutRoot);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} data-testid="chart-dendrogram">
      <g transform={`translate(${pad.l},0)`}>
        {renderLinks(layoutRoot, lineColor)}
        {labels.map((l) => (
          <text
            key={l.text}
            x={l.x}
            y={l.y + 14}
            textAnchor="middle"
            fontSize={9}
            fill={labelColor}
            fontWeight={600}
          >
            {l.text}
          </text>
        ))}
      </g>
    </svg>
  );
}
