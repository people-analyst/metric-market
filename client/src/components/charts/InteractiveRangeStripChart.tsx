import { useState, useCallback, useMemo, useEffect } from "react";

export interface InteractiveSegment {
  value?: number;
  active?: boolean;
  color?: string;
  tooltip?: string;
}

export interface InteractiveRangeRow {
  label: string;
  segments: InteractiveSegment[];
  rangeMin?: number;
  rangeMax?: number;
}

export interface InteractiveRangeStripChartProps {
  rows: InteractiveRangeRow[];
  width?: number;
  segmentHeight?: number;
  gap?: number;
  activeColor?: string;
  inactiveColor?: string;
  showLabels?: boolean;
  showCost?: boolean;
  showScale?: boolean;
  labelWidth?: number;
  stepSize?: number;
  scaleMin?: number;
  scaleMax?: number;
  formatValue?: (v: number) => string;
  onChange?: (rows: InteractiveRangeRow[]) => void;
}

export function InteractiveRangeStripChart({
  rows: initialRows,
  width = 320,
  segmentHeight = 22,
  gap = 2,
  activeColor = "#0f69ff",
  inactiveColor = "#e0e4e9",
  showLabels = true,
  showCost = true,
  showScale = true,
  labelWidth: labelWidthProp,
  stepSize = 10000,
  scaleMin: scaleMinProp,
  scaleMax: scaleMaxProp,
  formatValue = (v) => `$${Math.round(v / 1000)}k`,
  onChange,
}: InteractiveRangeStripChartProps) {
  const { scaleMin, scaleMax } = useMemo(() => {
    if (scaleMinProp !== undefined && scaleMaxProp !== undefined) {
      return { scaleMin: scaleMinProp, scaleMax: scaleMaxProp };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const row of initialRows) {
      if (row.rangeMin !== undefined && row.rangeMin < min) min = row.rangeMin;
      if (row.rangeMax !== undefined && row.rangeMax > max) max = row.rangeMax;
      for (const seg of row.segments) {
        if (seg.value !== undefined) {
          if (seg.value < min) min = seg.value;
          if (seg.value > max) max = seg.value;
        }
      }
    }
    if (!isFinite(min)) { min = 0; max = 100000; }
    return {
      scaleMin: scaleMinProp ?? Math.floor(min / stepSize) * stepSize,
      scaleMax: scaleMaxProp ?? Math.ceil(max / stepSize) * stepSize,
    };
  }, [initialRows, scaleMinProp, scaleMaxProp, stepSize]);

  const boxCount = Math.max(1, Math.ceil((scaleMax - scaleMin) / stepSize));

  const buildActiveState = useCallback((inputRows: InteractiveRangeRow[]) => {
    return inputRows.map((row) => {
      if (row.segments.length === boxCount) {
        return row.segments.map((s) => s.active ?? false);
      }
      const actives: boolean[] = new Array(boxCount).fill(false);
      if (row.rangeMin !== undefined && row.rangeMax !== undefined) {
        for (let i = 0; i < boxCount; i++) {
          const boxMid = scaleMin + i * stepSize + stepSize / 2;
          actives[i] = boxMid >= row.rangeMin && boxMid <= row.rangeMax;
        }
      } else {
        for (let i = 0; i < Math.min(row.segments.length, boxCount); i++) {
          actives[i] = row.segments[i].active ?? false;
        }
      }
      return actives;
    });
  }, [boxCount, scaleMin, stepSize]);

  const [activeState, setActiveState] = useState<boolean[][]>(() => buildActiveState(initialRows));

  useEffect(() => {
    setActiveState(buildActiveState(initialRows));
  }, [initialRows, buildActiveState]);

  const labelWidth = labelWidthProp ?? (showLabels ? 60 : 0);
  const costWidth = showCost ? 40 : 0;
  const stripWidth = width - labelWidth - costWidth;
  const boxWidth = Math.max(1, (stripWidth - (boxCount - 1) * gap) / boxCount);

  const rowSpacing = 6;
  const scaleHeight = showScale ? 18 : 0;
  const rowTotalHeight = segmentHeight + rowSpacing;
  const totalHeight = scaleHeight + initialRows.length * rowTotalHeight + 4;

  const ticks = useMemo(() => {
    const result: { value: number; boxIndex: number }[] = [];
    const tickStep = stepSize <= 10000 ? 20000 : stepSize <= 25000 ? 50000 : 100000;
    let v = Math.ceil(scaleMin / tickStep) * tickStep;
    while (v <= scaleMax) {
      const idx = (v - scaleMin) / stepSize;
      result.push({ value: v, boxIndex: idx });
      v += tickStep;
    }
    return result;
  }, [scaleMin, scaleMax, stepSize]);

  const toggleSegment = useCallback((ri: number, si: number) => {
    setActiveState((prev) => {
      const next = prev.map((row, r) => {
        if (r !== ri) return row;
        return row.map((val, s) => (s === si ? !val : val));
      });
      if (onChange) {
        const updatedRows = initialRows.map((row, r) => ({
          ...row,
          segments: next[r].map((active, s) => ({
            ...(row.segments[s] || {}),
            active,
          })),
        }));
        onChange(updatedRows);
      }
      return next;
    });
  }, [onChange, initialRows]);

  return (
    <svg width={width} height={totalHeight} className="block" data-testid="chart-interactive-range-strip">
      {showScale && (
        <g>
          <line
            x1={labelWidth}
            y1={scaleHeight - 4}
            x2={labelWidth + stripWidth}
            y2={scaleHeight - 4}
            stroke="#e0e4e9"
            strokeWidth={0.5}
          />
          {ticks.map((t) => {
            const tx = labelWidth + t.boxIndex * (boxWidth + gap);
            return (
              <g key={t.value}>
                <line
                  x1={tx}
                  y1={scaleHeight - 6}
                  x2={tx}
                  y2={scaleHeight - 2}
                  stroke="#e0e4e9"
                  strokeWidth={0.5}
                />
                <text
                  x={tx}
                  y={scaleHeight - 8}
                  textAnchor="middle"
                  fontSize={7}
                  fill="#5b636a"
                >
                  {formatValue(t.value)}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {initialRows.map((row, ri) => {
        const ry = scaleHeight + ri * rowTotalHeight + 2;
        const actives = activeState[ri] || [];
        const activeCount = actives.filter(Boolean).length;

        const firstActive = actives.indexOf(true);
        const lastActive = actives.lastIndexOf(true);
        const hasActive = firstActive >= 0 && lastActive >= 0;

        return (
          <g key={`row-${ri}`} data-testid={`interactive-strip-row-${ri}`}>
            {showLabels && (
              <text
                x={labelWidth - 6}
                y={ry + segmentHeight / 2}
                dy="0.35em"
                textAnchor="end"
                fill="#5b636a"
                fontSize={9}
                fontWeight={600}
                data-testid={`interactive-strip-label-${ri}`}
              >
                {row.label}
              </text>
            )}

            {hasActive && (
              <rect
                x={labelWidth + firstActive * (boxWidth + gap) - 1}
                y={ry - 1}
                width={(lastActive - firstActive) * (boxWidth + gap) + boxWidth + 2}
                height={segmentHeight + 2}
                fill="none"
                stroke={activeColor}
                strokeWidth={0.5}
                strokeOpacity={0.25}
                rx={3}
              />
            )}

            {Array.from({ length: boxCount }, (_, si) => {
              const sx = labelWidth + si * (boxWidth + gap);
              const isActive = actives[si] ?? false;
              const fill = isActive ? activeColor : inactiveColor;
              const isFirst = si === 0;
              const isLast = si === boxCount - 1;
              const rx = isFirst || isLast ? 2 : 0;
              const boxStart = scaleMin + si * stepSize;
              const boxEnd = boxStart + stepSize;
              const tooltip = `${formatValue(boxStart)} - ${formatValue(boxEnd)}`;

              return (
                <g
                  key={si}
                  data-testid={`interactive-strip-seg-${ri}-${si}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleSegment(ri, si)}
                >
                  <rect
                    x={sx}
                    y={ry}
                    width={boxWidth}
                    height={segmentHeight}
                    fill={fill}
                    rx={rx}
                    stroke={isActive ? "rgba(255,255,255,0.3)" : "none"}
                    strokeWidth={isActive ? 0.5 : 0}
                  >
                    <title>{tooltip}</title>
                  </rect>
                  <rect
                    x={sx}
                    y={ry}
                    width={boxWidth}
                    height={segmentHeight}
                    fill="transparent"
                    rx={rx}
                    className="hover:fill-[rgba(255,255,255,0.1)]"
                  />
                </g>
              );
            })}

            {showCost && (
              <text
                x={width - 2}
                y={ry + segmentHeight / 2}
                dy="0.35em"
                textAnchor="end"
                fill={activeCount > 0 ? "#232a31" : "#a3adb8"}
                fontSize={8}
                fontWeight={600}
                data-testid={`interactive-strip-cost-${ri}`}
              >
                {activeCount}/{boxCount}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
