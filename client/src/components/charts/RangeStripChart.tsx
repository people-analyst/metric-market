import { useMemo } from "react";

export interface RangeStripSegment {
  label?: string;
  value?: number;
  highlighted?: boolean;
  color?: string;
  tooltip?: string;
}

export interface RangeStripRow {
  label: string;
  segments: RangeStripSegment[];
  rangeStart?: number;
  rangeEnd?: number;
  markerPosition?: number;
  markerLabel?: string;
}

export interface RangeStripChartProps {
  rows: RangeStripRow[];
  width?: number;
  segmentHeight?: number;
  gap?: number;
  highlightColor?: string;
  baseColor?: string;
  markerColor?: string;
  showLabels?: boolean;
  showValues?: boolean;
  labelWidth?: number;
}

export function RangeStripChart({
  rows,
  width = 320,
  segmentHeight = 18,
  gap = 1,
  highlightColor = "#0f69ff",
  baseColor = "#e0e4e9",
  markerColor = "#232a31",
  showLabels = true,
  showValues = true,
  labelWidth: labelWidthProp,
}: RangeStripChartProps) {
  const labelWidth = labelWidthProp ?? (showLabels ? 60 : 0);
  const valueWidth = showValues ? 36 : 0;
  const stripWidth = width - labelWidth - valueWidth;

  const rowSpacing = 6;
  const rowTotalHeight = segmentHeight + rowSpacing;
  const totalHeight = rows.length * rowTotalHeight + 4;

  return (
    <svg width={width} height={totalHeight} className="block" data-testid="chart-range-strip">
      {rows.map((row, ri) => {
        const ry = ri * rowTotalHeight + 2;
        const segCount = row.segments.length;
        const actualSegWidth = Math.max(1, (stripWidth - (segCount - 1) * gap) / segCount);

        const rangeStart = row.rangeStart ?? row.segments.findIndex((s) => s.highlighted);
        const rangeEnd = row.rangeEnd ?? (() => {
          const last = [...row.segments].reverse().findIndex((s) => s.highlighted);
          return last >= 0 ? segCount - 1 - last : -1;
        })();
        const hasRange = rangeStart >= 0 && rangeEnd >= 0 && rangeStart <= rangeEnd;

        const highlightedCount = row.segments.filter((s) => s.highlighted).length;
        const totalSegments = row.segments.length;

        return (
          <g key={`row-${ri}`} data-testid={`range-strip-row-${ri}`}>
            {showLabels && (
              <text
                x={labelWidth - 6}
                y={ry + segmentHeight / 2}
                dy="0.35em"
                textAnchor="end"
                fill="#5b636a"
                fontSize={9}
                fontWeight={600}
                data-testid={`range-strip-label-${ri}`}
              >
                {row.label}
              </text>
            )}

            {hasRange && (
              <rect
                x={labelWidth + rangeStart * (actualSegWidth + gap) - 1}
                y={ry - 1}
                width={(rangeEnd - rangeStart) * (actualSegWidth + gap) + actualSegWidth + 2}
                height={segmentHeight + 2}
                fill="none"
                stroke={highlightColor}
                strokeWidth={0.5}
                strokeOpacity={0.3}
                rx={3}
                data-testid={`range-strip-band-${ri}`}
              />
            )}

            {row.segments.map((seg, si) => {
              const sx = labelWidth + si * (actualSegWidth + gap);
              const isHighlighted = seg.highlighted ?? false;
              const fill = seg.color || (isHighlighted ? highlightColor : baseColor);

              const isRangeStart = hasRange && si === rangeStart;
              const isRangeEnd = hasRange && si === rangeEnd;
              const isFirst = si === 0;
              const isLast = si === segCount - 1;

              const rx = 2;
              const topLeftR = isFirst || isRangeStart ? rx : 0;
              const topRightR = isLast || isRangeEnd ? rx : 0;
              const botLeftR = isFirst || isRangeStart ? rx : 0;
              const botRightR = isLast || isRangeEnd ? rx : 0;

              const rectPath = roundedRectPath(sx, ry, actualSegWidth, segmentHeight, topLeftR, topRightR, botRightR, botLeftR);

              const tooltipText = seg.tooltip || (seg.label && seg.value !== undefined ? `${seg.label}: ${seg.value}` : seg.label);

              return (
                <g key={si} data-testid={`range-strip-seg-${ri}-${si}`}>
                  <path d={rectPath} fill={fill}>
                    {tooltipText && <title>{tooltipText}</title>}
                  </path>
                  {seg.label && isHighlighted && (
                    <text
                      x={sx + actualSegWidth / 2}
                      y={ry + segmentHeight / 2}
                      dy="0.35em"
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={Math.min(7, actualSegWidth * 0.6)}
                      fontWeight={600}
                    >
                      {seg.label}
                    </text>
                  )}
                  {seg.label && !isHighlighted && actualSegWidth > 14 && (
                    <text
                      x={sx + actualSegWidth / 2}
                      y={ry + segmentHeight / 2}
                      dy="0.35em"
                      textAnchor="middle"
                      fill="#5b636a"
                      fontSize={Math.min(7, actualSegWidth * 0.6)}
                      fontWeight={500}
                    >
                      {seg.label}
                    </text>
                  )}
                </g>
              );
            })}

            {showValues && hasRange && (
              <text
                x={width - 2}
                y={ry + segmentHeight / 2}
                dy="0.35em"
                textAnchor="end"
                fill="#5b636a"
                fontSize={8}
                fontWeight={600}
                data-testid={`range-strip-value-${ri}`}
              >
                {highlightedCount}/{totalSegments}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function roundedRectPath(
  x: number, y: number, w: number, h: number,
  tl: number, tr: number, br: number, bl: number
): string {
  return [
    `M${x + tl},${y}`,
    `L${x + w - tr},${y}`,
    tr > 0 ? `Q${x + w},${y} ${x + w},${y + tr}` : `L${x + w},${y}`,
    `L${x + w},${y + h - br}`,
    br > 0 ? `Q${x + w},${y + h} ${x + w - br},${y + h}` : `L${x + w},${y + h}`,
    `L${x + bl},${y + h}`,
    bl > 0 ? `Q${x},${y + h} ${x},${y + h - bl}` : `L${x},${y + h}`,
    `L${x},${y + tl}`,
    tl > 0 ? `Q${x},${y} ${x + tl},${y}` : `L${x},${y}`,
    "Z",
  ].join(" ");
}
