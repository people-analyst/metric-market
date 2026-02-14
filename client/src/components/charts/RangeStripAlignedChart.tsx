import { useMemo } from "react";

export interface AlignedRangePoint {
  label?: string;
  value: number;
  highlighted?: boolean;
  color?: string;
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
  formatValue?: (v: number) => string;
}

export function RangeStripAlignedChart({
  rows,
  width = 320,
  segmentHeight = 18,
  gap = 1,
  highlightColor = "#0f69ff",
  baseColor = "#e0e4e9",
  showLabels = true,
  showScale = true,
  labelWidth: labelWidthProp,
  scaleMin: scaleMinProp,
  scaleMax: scaleMaxProp,
  formatValue = (v) => `${Math.round(v / 1000)}k`,
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
    const pad = (max - min) * 0.05;
    return {
      scaleMin: scaleMinProp ?? Math.floor((min - pad) / 5000) * 5000,
      scaleMax: scaleMaxProp ?? Math.ceil((max + pad) / 5000) * 5000,
    };
  }, [rows, scaleMinProp, scaleMaxProp]);

  const toX = (v: number) => {
    const frac = (v - scaleMin) / (scaleMax - scaleMin);
    return labelWidth + frac * stripWidth;
  };

  const rowSpacing = 6;
  const scaleHeight = showScale ? 16 : 0;
  const rowTotalHeight = segmentHeight + rowSpacing;
  const totalHeight = scaleHeight + rows.length * rowTotalHeight + 4;

  const ticks = useMemo(() => {
    const range = scaleMax - scaleMin;
    const step = range <= 50000 ? 10000 : range <= 200000 ? 25000 : 50000;
    const result: number[] = [];
    let v = Math.ceil(scaleMin / step) * step;
    while (v <= scaleMax) {
      result.push(v);
      v += step;
    }
    return result;
  }, [scaleMin, scaleMax]);

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
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={toX(t)}
                y1={scaleHeight - 6}
                x2={toX(t)}
                y2={scaleHeight - 2}
                stroke="#e0e4e9"
                strokeWidth={0.5}
              />
              <text
                x={toX(t)}
                y={scaleHeight - 8}
                textAnchor="middle"
                fontSize={7}
                fill="#5b636a"
              >
                {formatValue(t)}
              </text>
            </g>
          ))}
        </g>
      )}

      {rows.map((row, ri) => {
        const ry = scaleHeight + ri * rowTotalHeight + 2;
        const sorted = [...row.points].sort((a, b) => a.value - b.value);

        const highlightedPts = sorted.filter((p) => p.highlighted);
        const hasHighlighted = highlightedPts.length > 0;

        const fullMinX = toX(sorted[0].value);
        const fullMaxX = toX(sorted[sorted.length - 1].value);

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

            <rect
              x={fullMinX}
              y={ry}
              width={Math.max(1, fullMaxX - fullMinX)}
              height={segmentHeight}
              fill={baseColor}
              rx={2}
            />

            {hasHighlighted && (() => {
              const hMin = toX(highlightedPts[0].value);
              const hMax = toX(highlightedPts[highlightedPts.length - 1].value);
              return (
                <rect
                  x={hMin}
                  y={ry}
                  width={Math.max(1, hMax - hMin)}
                  height={segmentHeight}
                  fill={highlightColor}
                  rx={2}
                  data-testid={`aligned-strip-highlight-${ri}`}
                />
              );
            })()}

            {sorted.map((pt, pi) => {
              const px = toX(pt.value);
              const tooltipText = pt.tooltip || (pt.label ? `${pt.label}: ${formatValue(pt.value)}` : formatValue(pt.value));

              return (
                <g key={pi}>
                  <line
                    x1={px}
                    y1={ry}
                    x2={px}
                    y2={ry + segmentHeight}
                    stroke={pt.highlighted ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.08)"}
                    strokeWidth={0.5}
                  />
                  <rect
                    x={px - 3}
                    y={ry}
                    width={6}
                    height={segmentHeight}
                    fill="transparent"
                  >
                    <title>{tooltipText}</title>
                  </rect>
                  {pt.label && (
                    <text
                      x={px}
                      y={ry + segmentHeight + 8}
                      textAnchor="middle"
                      fontSize={6}
                      fill="#5b636a"
                    >
                      {pt.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
