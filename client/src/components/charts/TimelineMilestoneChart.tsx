import { useMemo } from "react";
import * as d3 from "d3";

export interface TimelineMilestone {
  label: string;
  position: number;
  height: number;
  color?: string;
}

export interface TimelineMilestoneChartProps {
  milestones: TimelineMilestone[];
  width?: number;
  chartHeight?: number;
  xLabels?: string[];
  defaultColors?: string[];
}

const PALETTE = ["#0f69ff", "#232a31", "#5b636a", "#a3adb8", "#e0e4e9"];

export function TimelineMilestoneChart({
  milestones,
  width = 300,
  chartHeight = 180,
  xLabels,
  defaultColors = PALETTE,
}: TimelineMilestoneChartProps) {
  const margin = { top: 16, right: 16, bottom: 28, left: 16 };
  const iw = width - margin.left - margin.right;
  const ih = chartHeight - margin.top - margin.bottom;
  const axisY = ih - 10;

  const { xScale, maxH } = useMemo(() => {
    const positions = milestones.map((m) => m.position);
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(positions)! - 1, d3.max(positions)! + 1])
      .range([0, iw]);
    const maxH = Math.max(...milestones.map((m) => m.height));
    return { xScale, maxH };
  }, [milestones, iw]);

  const heightScale = (h: number) => axisY - 20 - ((h / maxH) * (axisY - 30));

  const positions = milestones.map((m) => m.position);
  const minP = d3.min(positions)!;
  const maxP = d3.max(positions)!;
  const tickStep = Math.max(1, Math.round((maxP - minP) / 4));
  const ticks: number[] = [];
  for (let t = Math.ceil(minP / tickStep) * tickStep; t <= maxP; t += tickStep) {
    ticks.push(t);
  }

  const boxW = 28;
  const boxH = 18;

  return (
    <svg width={width} height={chartHeight} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        <line x1={0} x2={iw} y1={axisY} y2={axisY} stroke="#232a31" strokeWidth={1.5} />
        <polygon
          points={`${iw - 1},${axisY - 4} ${iw + 6},${axisY} ${iw - 1},${axisY + 4}`}
          fill="#232a31"
        />

        {ticks.map((t) => (
          <text
            key={t}
            x={xScale(t)}
            y={axisY + 16}
            textAnchor="middle"
            fill="#5b636a"
            fontSize={8}
          >
            {xLabels ? xLabels[ticks.indexOf(t)] ?? t : t}
          </text>
        ))}

        {milestones.map((m, i) => {
          const cx = xScale(m.position);
          const top = heightScale(m.height);
          const color = m.color || defaultColors[i % defaultColors.length];
          return (
            <g key={m.label}>
              <line x1={cx} x2={cx} y1={top + boxH} y2={axisY} stroke="#a3adb8" strokeWidth={1} />
              <circle cx={cx} cy={axisY} r={3} fill="#232a31" />
              <rect
                x={cx - boxW / 2}
                y={top}
                width={boxW}
                height={boxH}
                fill={color}
                rx={3}
              />
              <polygon
                points={`${cx - 4},${top + boxH} ${cx},${top + boxH + 5} ${cx + 4},${top + boxH}`}
                fill={color}
              />
              <text
                x={cx}
                y={top + boxH / 2}
                dy="0.35em"
                textAnchor="middle"
                fill="#e0e4e9"
                fontSize={8}
                fontWeight={600}
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
