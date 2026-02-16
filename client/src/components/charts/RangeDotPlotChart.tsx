import { useMemo } from "react";

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
  width = 420,
  height: heightProp,
  dotRadius = 5,
  belowColor = "#e07020",
  inRangeColor = "#9ca3af",
  aboveColor = "#0f69ff",
  bandColor = "#e8e8e8",
  showLegend = true,
  showAxis = true,
  formatValue = (v) => `$${Math.round(v / 1000)}k`,
}: RangeDotPlotChartProps) {
  const labelWidth = 56;
  const legendHeight = showLegend ? 24 : 0;
  const axisHeight = showAxis ? 22 : 0;
  const rowHeight = 36;
  const padding = { top: 8, right: 16, bottom: 4 };
  const chartWidth = width - labelWidth - padding.right;

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
      if (lvl.bandMin < min) min = lvl.bandMin;
      if (lvl.bandMax > max) max = lvl.bandMax;
      for (const emp of lvl.employees) {
        if (emp.salary < min) min = emp.salary;
        if (emp.salary > max) max = emp.salary;
      }
    }
    if (!isFinite(min)) { min = 0; max = 200000; }
    const step = 10000;
    return {
      scaleMin: Math.floor(min / step) * step - step,
      scaleMax: Math.ceil(max / step) * step + step,
    };
  }, [sortedLevels]);

  const totalHeight = heightProp ?? (
    padding.top + legendHeight + sortedLevels.length * rowHeight + axisHeight + padding.bottom
  );

  const xScale = (val: number) => {
    const ratio = (val - scaleMin) / (scaleMax - scaleMin);
    return labelWidth + ratio * chartWidth;
  };

  const ticks = useMemo(() => {
    const range = scaleMax - scaleMin;
    let step = 20000;
    if (range > 300000) step = 50000;
    else if (range > 150000) step = 25000;
    else if (range < 60000) step = 10000;
    const result: number[] = [];
    let v = Math.ceil(scaleMin / step) * step;
    while (v <= scaleMax) {
      result.push(v);
      v += step;
    }
    return result;
  }, [scaleMin, scaleMax]);

  const classifyEmployee = (salary: number, bandMin: number, bandMax: number) => {
    if (salary < bandMin) return "below";
    if (salary > bandMax) return "above";
    return "in_range";
  };

  const jitterDots = (employees: RangeDotPlotEmployee[], bandMin: number, bandMax: number, centerY: number) => {
    const sorted = [...employees].sort((a, b) => a.salary - b.salary);
    const placed: { x: number; y: number; emp: RangeDotPlotEmployee; status: string }[] = [];
    const diameter = dotRadius * 2 + 1;

    for (const emp of sorted) {
      const x = xScale(emp.salary);
      const status = classifyEmployee(emp.salary, bandMin, bandMax);
      let y = centerY;
      let attempts = 0;
      while (attempts < 20) {
        const collision = placed.some(
          (p) => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < diameter
        );
        if (!collision) break;
        attempts++;
        y = centerY + (attempts % 2 === 0 ? 1 : -1) * Math.ceil(attempts / 2) * (dotRadius * 1.5);
      }
      placed.push({ x, y, emp, status });
    }
    return placed;
  };

  const contentTop = padding.top + legendHeight;

  return (
    <svg
      width={width}
      height={totalHeight}
      className="block"
      data-testid="chart-range-dot-plot"
    >
      {showLegend && (() => {
        const itemGap = 12;
        const dotTextGap = 7;
        const items = [
          { color: belowColor, label: "Below Range" },
          { color: inRangeColor, label: "In Range" },
          { color: aboveColor, label: "Above Range" },
        ];
        const charWidth = 4.5;
        const totalLegendWidth = items.reduce((acc, item, i) =>
          acc + 4 + dotTextGap + item.label.length * charWidth + (i < items.length - 1 ? itemGap : 0), 0);
        let lx = width - totalLegendWidth - padding.right;
        if (lx < labelWidth) lx = labelWidth;
        const ly = padding.top + 7;
        let cx = lx;
        return (
          <g data-testid="range-dot-plot-legend">
            {items.map((item, i) => {
              const dotCx = cx + 4;
              const textX = dotCx + dotTextGap;
              const el = (
                <g key={item.label}>
                  <circle cx={dotCx} cy={ly} r={4} fill={item.color} />
                  <text x={textX} y={ly} dy="0.35em" fontSize={8} fill="#5b636a">{item.label}</text>
                </g>
              );
              cx = textX + item.label.length * charWidth + itemGap;
              return el;
            })}
          </g>
        );
      })()}

      {sortedLevels.map((lvl, i) => {
        const reversedIndex = sortedLevels.length - 1 - i;
        const rowY = contentTop + reversedIndex * rowHeight;
        const centerY = rowY + rowHeight / 2;
        const bandX1 = xScale(lvl.bandMin);
        const bandX2 = xScale(lvl.bandMax);
        const dots = jitterDots(lvl.employees, lvl.bandMin, lvl.bandMax, centerY);

        return (
          <g key={lvl.level} data-testid={`range-dot-plot-level-${lvl.level}`}>
            <rect
              x={bandX1}
              y={rowY + 4}
              width={Math.max(0, bandX2 - bandX1)}
              height={rowHeight - 8}
              fill={bandColor}
              rx={3}
              opacity={0.7}
            />

            <text
              x={labelWidth - 8}
              y={centerY}
              dy="0.35em"
              textAnchor="end"
              fontSize={9}
              fontWeight={600}
              fill="#5b636a"
              data-testid={`range-dot-plot-label-${lvl.level}`}
            >
              {lvl.level}
            </text>

            <line
              x1={labelWidth}
              x2={width - padding.right}
              y1={centerY}
              y2={centerY}
              stroke="#e0e4e9"
              strokeWidth={0.3}
              strokeDasharray="2,3"
            />

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
                  opacity={0.85}
                  data-testid={`range-dot-${lvl.level}-${di}`}
                >
                  <title>
                    {dot.emp.label || dot.emp.id}: {formatValue(dot.emp.salary)} ({dot.status === "below" ? "Below Range" : dot.status === "above" ? "Above Range" : "In Range"})
                  </title>
                </circle>
              );
            })}
          </g>
        );
      })}

      {showAxis && (
        <g data-testid="range-dot-plot-axis">
          <line
            x1={labelWidth}
            x2={width - padding.right}
            y1={contentTop + sortedLevels.length * rowHeight + 2}
            y2={contentTop + sortedLevels.length * rowHeight + 2}
            stroke="#ccc"
            strokeWidth={0.5}
          />
          {ticks.map((t) => {
            const tx = xScale(t);
            const tickY = contentTop + sortedLevels.length * rowHeight + 2;
            return (
              <g key={t}>
                <line x1={tx} x2={tx} y1={tickY} y2={tickY + 4} stroke="#ccc" strokeWidth={0.5} />
                <text x={tx} y={tickY + 14} textAnchor="middle" fontSize={7} fill="#5b636a">
                  {formatValue(t)}
                </text>
              </g>
            );
          })}
          <text
            x={labelWidth + chartWidth / 2}
            y={contentTop + sortedLevels.length * rowHeight + axisHeight}
            textAnchor="middle"
            fontSize={8}
            fill="#9ca3af"
          >
            Salary
          </text>
        </g>
      )}
    </svg>
  );
}
