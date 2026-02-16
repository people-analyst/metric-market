import { useMemo, useRef, useState, useEffect } from "react";

export interface RangeDotPlotEmployee {
  id: string;
  salary: number;
  label?: string;
}

export interface RangeDotPlotLevel {
  level: string;
  bandMin: number;
  bandMax: number;
  employees: RangeDotPlotEmployee[];
}

export interface RangeDotPlotChartProps {
  levels: RangeDotPlotLevel[];
  width?: number;
  height?: number;
  rowHeight?: number;
  dotRadius?: number;
  belowColor?: string;
  inRangeColor?: string;
  aboveColor?: string;
  bandColor?: string;
  showLegend?: boolean;
  showAxis?: boolean;
  formatValue?: (v: number) => string;
}

export function RangeDotPlotChart({
  levels,
  width: widthProp,
  height: heightProp,
  rowHeight = 32,
  dotRadius = 4,
  belowColor = "#e07020",
  inRangeColor = "#9ca3af",
  aboveColor = "#0f69ff",
  bandColor = "#e0e4e9",
  showLegend = true,
  showAxis = true,
  formatValue = (v) => `$${Math.round(v / 1000)}k`,
}: RangeDotPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(widthProp ?? 500);

  useEffect(() => {
    if (widthProp) return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMeasuredWidth(entry.contentRect.width);
      }
    });
    obs.observe(el);
    setMeasuredWidth(el.clientWidth);
    return () => obs.disconnect();
  }, [widthProp]);

  const width = widthProp ?? measuredWidth;
  const labelWidth = 56;
  const rightPad = 12;
  const barAreaWidth = width - labelWidth - rightPad;
  const rowGap = 6;
  const axisHeight = showAxis ? 24 : 0;
  const legendHeight = showLegend ? 20 : 0;
  const topPad = 6;

  const sortedLevels = useMemo(
    () => [...levels].sort((a, b) => {
      const numA = parseInt(a.level.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.level.replace(/\D/g, "")) || 0;
      return numA - numB;
    }),
    [levels]
  );

  const { scaleMin, scaleMax } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const lvl of sortedLevels) {
      min = Math.min(min, lvl.bandMin);
      max = Math.max(max, lvl.bandMax);
      for (const emp of lvl.employees) {
        min = Math.min(min, emp.salary);
        max = Math.max(max, emp.salary);
      }
    }
    if (!isFinite(min)) { min = 0; max = 200000; }
    const pad = (max - min) * 0.06;
    const step = 5000;
    return {
      scaleMin: Math.floor((min - pad) / step) * step,
      scaleMax: Math.ceil((max + pad) / step) * step,
    };
  }, [sortedLevels]);

  const computedHeight = topPad + legendHeight + sortedLevels.length * (rowHeight + rowGap) + axisHeight + 4;
  const totalHeight = heightProp ?? computedHeight;

  const xScale = (val: number) => {
    const range = scaleMax - scaleMin;
    if (range <= 0) return labelWidth + barAreaWidth / 2;
    const ratio = (val - scaleMin) / range;
    return labelWidth + ratio * barAreaWidth;
  };

  const ticks = useMemo(() => {
    const range = scaleMax - scaleMin;
    if (range <= 0) return [scaleMin];
    const approxCount = Math.max(3, Math.floor(barAreaWidth / 80));
    const rawStep = range / approxCount;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceSteps = [1, 2, 5, 10];
    let step = mag;
    for (const ns of niceSteps) {
      if (ns * mag >= rawStep) { step = ns * mag; break; }
    }
    const result: number[] = [];
    let v = Math.ceil(scaleMin / step) * step;
    while (v <= scaleMax) {
      result.push(v);
      v += step;
    }
    return result;
  }, [scaleMin, scaleMax, barAreaWidth]);

  const classify = (salary: number, bandMin: number, bandMax: number) => {
    if (salary < bandMin) return "below";
    if (salary > bandMax) return "above";
    return "in_range";
  };

  const jitterDots = (employees: RangeDotPlotEmployee[], bandMin: number, bandMax: number, centerY: number) => {
    const sorted = [...employees].sort((a, b) => a.salary - b.salary);
    const placed: { x: number; y: number; emp: RangeDotPlotEmployee; status: string }[] = [];
    const diameter = dotRadius * 2 + 1;
    const maxJitter = rowHeight / 2 - dotRadius - 1;

    for (const emp of sorted) {
      const x = xScale(emp.salary);
      const status = classify(emp.salary, bandMin, bandMax);
      let y = centerY;
      let attempts = 0;
      while (attempts < 16) {
        const collision = placed.some(
          (p) => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < diameter
        );
        if (!collision) break;
        attempts++;
        const offset = (attempts % 2 === 0 ? 1 : -1) * Math.ceil(attempts / 2) * (dotRadius * 1.4);
        y = centerY + Math.max(-maxJitter, Math.min(maxJitter, offset));
      }
      placed.push({ x, y, emp, status });
    }
    return placed;
  };

  const contentTop = topPad + legendHeight;

  return (
    <div ref={containerRef} className="w-full" data-testid="dot-plot-container">
      <svg
        width={width}
        height={totalHeight}
        className="block max-w-full"
        data-testid="chart-range-dot-plot"
      >
        {showLegend && (
          <g data-testid="range-dot-plot-legend">
            {[
              { color: belowColor, label: "Below Range" },
              { color: inRangeColor, label: "In Range" },
              { color: aboveColor, label: "Above Range" },
            ].reduce<{ elements: JSX.Element[]; cx: number }>((acc, item) => {
              const dotCx = acc.cx;
              const textX = dotCx + 8;
              acc.elements.push(
                <g key={item.label}>
                  <circle cx={dotCx} cy={topPad + 6} r={3.5} fill={item.color} />
                  <text x={textX} y={topPad + 6} dy="0.35em" fontSize={9} fill="#5b636a">{item.label}</text>
                </g>
              );
              acc.cx = textX + item.label.length * 5.2 + 14;
              return acc;
            }, { elements: [], cx: labelWidth }).elements}
          </g>
        )}

        {showAxis && (
          <g data-testid="range-dot-plot-axis">
            <line
              x1={labelWidth}
              x2={labelWidth + barAreaWidth}
              y1={contentTop + sortedLevels.length * (rowHeight + rowGap) + 2}
              y2={contentTop + sortedLevels.length * (rowHeight + rowGap) + 2}
              stroke="#e0e4e9"
              strokeWidth={0.5}
            />
            {ticks.map((t) => {
              const tx = xScale(t);
              const tickY = contentTop + sortedLevels.length * (rowHeight + rowGap) + 2;
              return (
                <g key={t}>
                  <line x1={tx} x2={tx} y1={tickY} y2={tickY + 4} stroke="#ccc" strokeWidth={0.5} />
                  <text x={tx} y={tickY + 14} textAnchor="middle" fontSize={8} fill="#5b636a">
                    {formatValue(t)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {sortedLevels.map((lvl, i) => {
          const reversedIndex = sortedLevels.length - 1 - i;
          const rowY = contentTop + reversedIndex * (rowHeight + rowGap);
          const centerY = rowY + rowHeight / 2;
          const bandX1 = xScale(lvl.bandMin);
          const bandX2 = xScale(lvl.bandMax);
          const bandW = Math.max(0, bandX2 - bandX1);
          const dots = jitterDots(lvl.employees, lvl.bandMin, lvl.bandMax, centerY);

          return (
            <g key={lvl.level} data-testid={`range-dot-plot-level-${lvl.level}`}>
              <line
                x1={labelWidth}
                x2={labelWidth + barAreaWidth}
                y1={centerY}
                y2={centerY}
                stroke="#e0e4e9"
                strokeWidth={0.5}
                strokeDasharray="2,4"
                opacity={0.6}
              />

              <rect
                x={bandX1}
                y={rowY + 3}
                width={bandW}
                height={rowHeight - 6}
                fill={bandColor}
                rx={2}
                opacity={0.45}
              >
                <title>Range: {formatValue(lvl.bandMin)} - {formatValue(lvl.bandMax)}</title>
              </rect>

              <line x1={bandX1} x2={bandX1} y1={rowY + 3} y2={rowY + rowHeight - 3} stroke="#c0c4c9" strokeWidth={0.5} />
              <line x1={bandX2} x2={bandX2} y1={rowY + 3} y2={rowY + rowHeight - 3} stroke="#c0c4c9" strokeWidth={0.5} />

              <text
                x={labelWidth - 8}
                y={centerY}
                dy="0.35em"
                textAnchor="end"
                fontSize={10}
                fontWeight={600}
                fill="#232a31"
                data-testid={`range-dot-plot-label-${lvl.level}`}
              >
                {lvl.level}
              </text>

              {dots.map((dot, di) => {
                const fill =
                  dot.status === "below" ? belowColor :
                  dot.status === "above" ? aboveColor :
                  inRangeColor;
                return (
                  <circle
                    key={dot.emp.id || di}
                    cx={dot.x}
                    cy={dot.y}
                    r={dotRadius}
                    fill={fill}
                    opacity={0.8}
                    stroke="white"
                    strokeWidth={0.5}
                    data-testid={`range-dot-${lvl.level}-${di}`}
                  >
                    <title>
                      {dot.emp.label || dot.emp.id}: {formatValue(dot.emp.salary)} ({dot.status === "below" ? "Below Range" : dot.status === "above" ? "Above Range" : "In Range"})
                    </title>
                  </circle>
                );
              })}

              <text
                x={labelWidth + barAreaWidth + 2}
                y={centerY}
                dy="0.35em"
                fontSize={7}
                fill="#9ca3af"
                className="select-none"
                data-testid={`range-dot-count-${lvl.level}`}
              >
                {dots.length}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
