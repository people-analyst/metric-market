import { useMemo } from "react";

export interface AlignedRangePoint {
  label?: string;
  value: number;
  highlighted?: boolean;
  tooltip?: string;
}

export interface AlignedRangeRow {
  label: string;
  points: AlignedRangePoint[];
}

export interface RangeStripAlignedChartProps {
  rows: AlignedRangeRow[];
  width?: number;
  segmentHeight?: number;
  gap?: number;
  highlightColor?: string;
  baseColor?: string;
  showLabels?: boolean;
  showScale?: boolean;
  labelWidth?: number;
  scaleMin?: number;
  scaleMax?: number;
  stepSize?: number;
  formatValue?: (v: number) => string;
}

export function RangeStripAlignedChart({
  rows,
  width = 320,
  segmentHeight = 18,
  gap = 2,
  highlightColor = "#0f69ff",
  baseColor = "#e0e4e9",
  showLabels = true,
  showScale = true,
  labelWidth: labelWidthProp,
  scaleMin: scaleMinProp,
  scaleMax: scaleMaxProp,
  stepSize = 10000,
  formatValue = (v) => `$${Math.round(v / 1000)}k`,
}: RangeStripAlignedChartProps) {
  const labelWidth = labelWidthProp ?? (showLabels ? 60 : 0);
  const stripWidth = width - labelWidth - 4;

  const { scaleMin, scaleMax } = useMemo(() => {
    if (scaleMinProp !== undefined && scaleMaxProp !== undefined) {
      return { scaleMin: scaleMinProp, scaleMax: scaleMaxProp };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const row of rows) {
      for (const pt of row.points) {
        if (pt.value < min) min = pt.value;
        if (pt.value > max) max = pt.value;
      }
    }
    return {
      scaleMin: scaleMinProp ?? Math.floor(min / stepSize) * stepSize,
      scaleMax: scaleMaxProp ?? Math.ceil(max / stepSize) * stepSize,
    };
  }, [rows, scaleMinProp, scaleMaxProp, stepSize]);

  const boxCount = Math.max(1, Math.ceil((scaleMax - scaleMin) / stepSize));
  const boxWidth = Math.max(1, (stripWidth - (boxCount - 1) * gap) / boxCount);

  const rowSpacing = 6;
  const scaleHeight = showScale ? 18 : 0;
  const rowTotalHeight = segmentHeight + rowSpacing;
  const totalHeight = scaleHeight + rows.length * rowTotalHeight + 4;

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

  return (
    <svg width={width} height={totalHeight} className="block" data-testid="chart-range-strip-aligned">
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

      {rows.map((row, ri) => {
        const ry = scaleHeight + ri * rowTotalHeight + 2;
        const sorted = [...row.points].sort((a, b) => a.value - b.value);
        const highlightedPts = sorted.filter((p) => p.highlighted);
        const hlMin = highlightedPts.length > 0 ? highlightedPts[0].value : null;
        const hlMax = highlightedPts.length > 0 ? highlightedPts[highlightedPts.length - 1].value : null;

        const fullMin = sorted[0].value;
        const fullMax = sorted[sorted.length - 1].value;

        const boxes = [];
        for (let i = 0; i < boxCount; i++) {
          const boxStart = scaleMin + i * stepSize;
          const boxEnd = boxStart + stepSize;
          const boxMid = boxStart + stepSize / 2;

          const inFullRange = boxMid >= fullMin && boxMid <= fullMax;
          const inHighlightRange = hlMin !== null && hlMax !== null && boxMid >= hlMin && boxMid <= hlMax;

          boxes.push({ index: i, boxStart, boxEnd, inFullRange, inHighlightRange });
        }

        const firstInRange = boxes.findIndex((b) => b.inFullRange);
        const lastInRangeRev = [...boxes].reverse().findIndex((b) => b.inFullRange);
        const lastInRange = lastInRangeRev >= 0 ? boxes.length - 1 - lastInRangeRev : -1;

        const firstHL = boxes.findIndex((b) => b.inHighlightRange);
        const lastHLRev = [...boxes].reverse().findIndex((b) => b.inHighlightRange);
        const lastHL = lastHLRev >= 0 ? boxes.length - 1 - lastHLRev : -1;
        const hasHL = firstHL >= 0 && lastHL >= 0;

        return (
          <g key={`row-${ri}`} data-testid={`aligned-strip-row-${ri}`}>
            {showLabels && (
              <text
                x={labelWidth - 6}
                y={ry + segmentHeight / 2}
                dy="0.35em"
                textAnchor="end"
                fill="#5b636a"
                fontSize={9}
                fontWeight={600}
                data-testid={`aligned-strip-label-${ri}`}
              >
                {row.label}
              </text>
            )}

            {hasHL && (
              <rect
                x={labelWidth + firstHL * (boxWidth + gap) - 1}
                y={ry - 1}
                width={(lastHL - firstHL) * (boxWidth + gap) + boxWidth + 2}
                height={segmentHeight + 2}
                fill="none"
                stroke={highlightColor}
                strokeWidth={0.5}
                strokeOpacity={0.25}
                rx={3}
                data-testid={`aligned-strip-highlight-${ri}`}
              />
            )}

            {boxes.map((box) => {
              if (!box.inFullRange) return null;
              const sx = labelWidth + box.index * (boxWidth + gap);
              const fill = box.inHighlightRange ? highlightColor : baseColor;
              const isFirst = box.index === firstInRange;
              const isLast = box.index === lastInRange;
              const rx = isFirst || isLast ? 2 : 0;
              const tooltip = `${formatValue(box.boxStart)} - ${formatValue(box.boxEnd)}`;

              return (
                <g key={box.index} data-testid={`aligned-strip-box-${ri}-${box.index}`}>
                  <rect
                    x={sx}
                    y={ry}
                    width={boxWidth}
                    height={segmentHeight}
                    fill={fill}
                    rx={rx}
                    stroke={box.inHighlightRange ? "rgba(255,255,255,0.3)" : "none"}
                    strokeWidth={box.inHighlightRange ? 0.5 : 0}
                  >
                    <title>{tooltip}</title>
                  </rect>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
