import { useState, useCallback } from "react";

export interface InteractiveSegment {
  value?: number;
  active?: boolean;
  color?: string;
  tooltip?: string;
}

export interface InteractiveRangeRow {
  label: string;
  segments: InteractiveSegment[];
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
  labelWidth?: number;
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
  labelWidth: labelWidthProp,
  onChange,
}: InteractiveRangeStripChartProps) {
  const [rows, setRows] = useState<InteractiveRangeRow[]>(initialRows);

  const labelWidth = labelWidthProp ?? (showLabels ? 60 : 0);
  const costWidth = showCost ? 40 : 0;
  const stripWidth = width - labelWidth - costWidth;

  const rowSpacing = 6;
  const rowTotalHeight = segmentHeight + rowSpacing;
  const totalHeight = rows.length * rowTotalHeight + 4;

  const toggleSegment = useCallback((ri: number, si: number) => {
    setRows((prev) => {
      const next = prev.map((row, r) => {
        if (r !== ri) return row;
        return {
          ...row,
          segments: row.segments.map((seg, s) => {
            if (s !== si) return seg;
            return { ...seg, active: !seg.active };
          }),
        };
      });
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  return (
    <svg width={width} height={totalHeight} className="block" data-testid="chart-interactive-range-strip">
      {rows.map((row, ri) => {
        const ry = ri * rowTotalHeight + 2;
        const segCount = row.segments.length;
        const segWidth = Math.max(1, (stripWidth - (segCount - 1) * gap) / segCount);

        const activeCount = row.segments.filter((s) => s.active).length;

        const firstActive = row.segments.findIndex((s) => s.active);
        const lastActiveRev = [...row.segments].reverse().findIndex((s) => s.active);
        const lastActive = lastActiveRev >= 0 ? segCount - 1 - lastActiveRev : -1;
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
                x={labelWidth + firstActive * (segWidth + gap) - 1}
                y={ry - 1}
                width={(lastActive - firstActive) * (segWidth + gap) + segWidth + 2}
                height={segmentHeight + 2}
                fill="none"
                stroke={activeColor}
                strokeWidth={0.5}
                strokeOpacity={0.25}
                rx={3}
              />
            )}

            {row.segments.map((seg, si) => {
              const sx = labelWidth + si * (segWidth + gap);
              const isActive = seg.active ?? false;
              const fill = seg.color ? (isActive ? seg.color : inactiveColor) : (isActive ? activeColor : inactiveColor);

              const isFirst = si === 0;
              const isLast = si === segCount - 1;
              const rx = isFirst || isLast ? 2 : 0;

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
                    width={segWidth}
                    height={segmentHeight}
                    fill={fill}
                    rx={rx}
                    stroke={isActive ? "rgba(255,255,255,0.3)" : "none"}
                    strokeWidth={isActive ? 0.5 : 0}
                  >
                    {seg.tooltip && <title>{seg.tooltip}</title>}
                  </rect>
                  <rect
                    x={sx}
                    y={ry}
                    width={segWidth}
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
                {activeCount}/{segCount}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
