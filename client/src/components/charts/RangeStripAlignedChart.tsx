import { useMemo } from "react";

export interface AlignedRangeMarker {
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

export interface AlignedRangeRow {
  label: string;
  markers?: AlignedRangeMarker[];
  points?: AlignedRangeMarker[];
}

export interface RangeStripAlignedChartProps {
  rows: AlignedRangeRow[];
  width?: number;
  segmentHeight?: number;
  gap?: number;
  markerColor?: string;
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
  width = 360,
  segmentHeight = 20,
  gap = 2,
  markerColor = "#0f69ff",
  baseColor = "#e0e4e9",
  showLabels = true,
  showScale = true,
  labelWidth: labelWidthProp,
  scaleMin: scaleMinProp,
  scaleMax: scaleMaxProp,
  stepSize = 10000,
  formatValue = (v) => `$${Math.round(v / 1000)}k`,
}: RangeStripAlignedChartProps) {
  const labelWidth = labelWidthProp ?? (showLabels ? 40 : 0);
  const stripWidth = width - labelWidth - 4;

  const { scaleMin, scaleMax } = useMemo(() => {
    if (scaleMinProp !== undefined && scaleMaxProp !== undefined) {
      return { scaleMin: scaleMinProp, scaleMax: scaleMaxProp };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const row of rows) {
      const ms = row.markers ?? row.points ?? [];
      for (const m of ms) {
        if (m.value < min) min = m.value;
        if (m.value > max) max = m.value;
      }
    }
    if (!isFinite(min)) { min = 0; max = 100000; }
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

  const markerColors = ["#0f69ff", "#1a8cff", "#4da3ff", "#7fbfff", "#b3d9ff"];

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

        const rowMarkers = row.markers ?? row.points ?? [];
        const range = scaleMax - scaleMin;
        const boxMap = new Map<number, { markers: AlignedRangeMarker[]; indices: number[] }>();
        rowMarkers.forEach((m, mi) => {
          const idx = range > 0
            ? Math.min(boxCount - 1, Math.max(0, Math.floor((m.value - scaleMin) / stepSize)))
            : 0;
          if (!boxMap.has(idx)) boxMap.set(idx, { markers: [], indices: [] });
          boxMap.get(idx)!.markers.push(m);
          boxMap.get(idx)!.indices.push(mi);
        });

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

            {Array.from({ length: boxCount }).map((_, i) => {
              const sx = labelWidth + i * (boxWidth + gap);
              const boxStart = scaleMin + i * stepSize;
              const boxEnd = boxStart + stepSize;
              const entry = boxMap.get(i);
              const isOccupied = !!entry;
              const isFirst = i === 0 || !boxMap.has(i - 1);
              const isLast = i === boxCount - 1 || !boxMap.has(i + 1);

              if (!isOccupied) {
                return (
                  <g key={i} data-testid={`aligned-strip-box-${ri}-${i}`}>
                    <rect
                      x={sx}
                      y={ry}
                      width={boxWidth}
                      height={segmentHeight}
                      fill={baseColor}
                      fillOpacity={0.3}
                      rx={0}
                    >
                      <title>{formatValue(boxStart)} - {formatValue(boxEnd)}</title>
                    </rect>
                  </g>
                );
              }

              const firstIdx = entry.indices[0];
              const fill = entry.markers[0].color ?? markerColor ?? markerColors[firstIdx % markerColors.length];
              const combinedLabel = entry.markers.map((m) => m.label).join("/");
              const tooltip = entry.markers.map((m) => `${m.label}: ${formatValue(m.value)}`).join(", ");
              const rx = isFirst || isLast ? 2 : 0;

              return (
                <g key={i} data-testid={`aligned-strip-box-${ri}-${i}`}>
                  <rect
                    x={sx}
                    y={ry}
                    width={boxWidth}
                    height={segmentHeight}
                    fill={fill}
                    rx={rx}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={0.5}
                  >
                    <title>{tooltip}</title>
                  </rect>
                  {boxWidth >= 12 && (
                    <text
                      x={sx + boxWidth / 2}
                      y={ry + segmentHeight / 2}
                      dy="0.35em"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={Math.min(8, boxWidth * 0.5)}
                      fontWeight={700}
                      data-testid={`aligned-strip-marker-${ri}-${firstIdx}`}
                    >
                      {combinedLabel}
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
