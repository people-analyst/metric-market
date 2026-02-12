import { useMemo } from "react";
import * as d3 from "d3";

export interface BoxWhiskerDatum {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface BoxWhiskerChartProps {
  data: BoxWhiskerDatum[];
  width?: number;
  height?: number;
  boxColor?: string;
  whiskerColor?: string;
  medianColor?: string;
}

export function BoxWhiskerChart({
  data,
  width = 320,
  height = 200,
  boxColor = "#0f69ff",
  whiskerColor = "#232a31",
  medianColor = "#232a31",
}: BoxWhiskerChartProps) {
  const margin = { top: 12, right: 12, bottom: 28, left: 38 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const { xScale, yScale } = useMemo(() => {
    const allVals = data.flatMap((d) => [d.min, d.max]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(allVals) ?? 100])
      .nice()
      .range([ih, 0]);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, iw])
      .padding(0.35);

    return { xScale, yScale };
  }, [data, iw, ih]);

  const yTicks = yScale.ticks(5);
  const bw = xScale.bandwidth();

  return (
    <svg width={width} height={height} className="block">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={0} x2={iw} y1={yScale(t)} y2={yScale(t)} stroke="#e0e4e9" strokeWidth={0.5} />
            <text x={-6} y={yScale(t)} dy="0.35em" textAnchor="end" fill="#5b636a" fontSize={8}>
              {t}
            </text>
          </g>
        ))}

        {data.map((d) => {
          const cx = (xScale(d.label) ?? 0) + bw / 2;
          const x0 = xScale(d.label) ?? 0;
          return (
            <g key={d.label}>
              <line x1={cx} x2={cx} y1={yScale(d.max)} y2={yScale(d.q3)} stroke={whiskerColor} strokeWidth={1} />
              <line x1={cx} x2={cx} y1={yScale(d.q1)} y2={yScale(d.min)} stroke={whiskerColor} strokeWidth={1} />

              <line x1={x0 + bw * 0.25} x2={x0 + bw * 0.75} y1={yScale(d.max)} y2={yScale(d.max)} stroke={whiskerColor} strokeWidth={1} />
              <line x1={x0 + bw * 0.25} x2={x0 + bw * 0.75} y1={yScale(d.min)} y2={yScale(d.min)} stroke={whiskerColor} strokeWidth={1} />

              <rect
                x={x0}
                y={yScale(d.q3)}
                width={bw}
                height={yScale(d.q1) - yScale(d.q3)}
                fill={boxColor}
                rx={1}
              />

              <line x1={x0} x2={x0 + bw} y1={yScale(d.median)} y2={yScale(d.median)} stroke={medianColor} strokeWidth={1.5} />
            </g>
          );
        })}

        {data.map((d) => (
          <text
            key={d.label}
            x={(xScale(d.label) ?? 0) + bw / 2}
            y={ih + 16}
            textAnchor="middle"
            fill="#5b636a"
            fontSize={9}
          >
            {d.label}
          </text>
        ))}
      </g>
    </svg>
  );
}
