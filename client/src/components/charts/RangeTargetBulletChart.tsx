import { useMemo, useRef, useState, useEffect } from "react";

export interface BulletRangeRow {
  label: string;
  marketMin: number;
  marketMax: number;
  targetMin: number;
  targetMax: number;
  actualMin: number;
  actualMax: number;
}

export interface RangeTargetBulletChartProps {
  rows: BulletRangeRow[];
  width?: number;
  rowHeight?: number;
  rowGap?: number;
  showLabels?: boolean;
  showScale?: boolean;
  labelWidth?: number;
  scaleMin?: number;
  scaleMax?: number;
  formatValue?: (v: number) => string;
  marketColor?: string;
  targetColor?: string;
  scaleBarColor?: string;
}

export function RangeTargetBulletChart({
  rows,
  width: widthProp,
  rowHeight = 28,
  rowGap = 14,
  showLabels = true,
  showScale = true,
  labelWidth: labelWidthProp,
  scaleMin: scaleMinProp,
  scaleMax: scaleMaxProp,
  formatValue = (v) => `$${Math.round(v / 1000)}k`,
  marketColor = "#b8d4f0",
  targetColor = "#0f69ff",
  scaleBarColor = "#e0e4e9",
}: RangeTargetBulletChartProps) {
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
  const labelWidth = labelWidthProp ?? (showLabels ? 64 : 0);
  const rightPad = 8;
  const barAreaWidth = width - labelWidth - rightPad;

  const { sMin, sMax } = useMemo(() => {
    if (scaleMinProp !== undefined && scaleMaxProp !== undefined) {
      return { sMin: scaleMinProp, sMax: scaleMaxProp };
    }
    let lo = Infinity, hi = -Infinity;
    for (const r of rows) {
      lo = Math.min(lo, r.marketMin, r.targetMin, r.actualMin);
      hi = Math.max(hi, r.marketMax, r.targetMax, r.actualMax);
    }
    if (!isFinite(lo)) { lo = 0; hi = 100000; }
    const pad = (hi - lo) * 0.08;
    return { sMin: scaleMinProp ?? lo - pad, sMax: scaleMaxProp ?? hi + pad };
  }, [rows, scaleMinProp, scaleMaxProp]);

  const x = (val: number) => {
    const pct = (val - sMin) / (sMax - sMin);
    return labelWidth + pct * barAreaWidth;
  };

  const scaleHeight = showScale ? 22 : 0;
  const svgHeight = scaleHeight + rows.length * (rowHeight + rowGap) + 4;

  const ticks = useMemo(() => {
    const range = sMax - sMin;
    const approxTickCount = Math.max(3, Math.floor(barAreaWidth / 70));
    const rawStep = range / approxTickCount;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceSteps = [1, 2, 5, 10];
    let step = mag;
    for (const ns of niceSteps) {
      if (ns * mag >= rawStep) { step = ns * mag; break; }
    }
    const result: number[] = [];
    let v = Math.ceil(sMin / step) * step;
    while (v <= sMax) {
      result.push(v);
      v += step;
    }
    return result;
  }, [sMin, sMax, barAreaWidth]);

  const barH = rowHeight * 0.55;
  const targetBarH = rowHeight * 0.3;
  const circleR = 5;
  const triSize = 5;

  function isInRange(val: number, lo: number, hi: number) {
    return val >= lo && val <= hi;
  }

  function circleStyle(val: number, row: BulletRangeRow): { fill: string; stroke: string; strokeWidth: number } {
    const inTarget = isInRange(val, row.targetMin, row.targetMax);
    const inMarket = isInRange(val, row.marketMin, row.marketMax);
    if (inTarget && inMarket) return { fill: targetColor, stroke: targetColor, strokeWidth: 0 };
    if (inTarget && !inMarket) return { fill: "white", stroke: targetColor, strokeWidth: 1.5 };
    if (!inTarget && inMarket) return { fill: "white", stroke: "#232a31", strokeWidth: 1.5 };
    return { fill: "#232a31", stroke: "#232a31", strokeWidth: 0 };
  }

  function triangleStyle(endpoint: "min" | "max", row: BulletRangeRow): { fill: string; stroke: string; strokeWidth: number } {
    const val = endpoint === "min" ? row.targetMin : row.targetMax;
    const inMarket = isInRange(val, row.marketMin, row.marketMax);
    if (inMarket) {
      return { fill: targetColor, stroke: targetColor, strokeWidth: 0 };
    }
    return { fill: "#9ca3af", stroke: "#9ca3af", strokeWidth: 0 };
  }

  function leftTriangle(cx: number, cy: number, size: number) {
    return `${cx + size},${cy - size} ${cx - size},${cy} ${cx + size},${cy + size}`;
  }

  function rightTriangle(cx: number, cy: number, size: number) {
    return `${cx - size},${cy - size} ${cx + size},${cy} ${cx - size},${cy + size}`;
  }

  return (
    <div ref={containerRef} className="w-full" data-testid="bullet-chart-container">
      <svg width={width} height={svgHeight} className="block max-w-full" data-testid="bullet-chart-svg">
        {showScale && (
          <g>
            <line
              x1={labelWidth}
              y1={scaleHeight - 4}
              x2={labelWidth + barAreaWidth}
              y2={scaleHeight - 4}
              stroke={scaleBarColor}
              strokeWidth={0.5}
            />
            {ticks.map((t) => {
              const tx = x(t);
              return (
                <g key={t}>
                  <line x1={tx} y1={scaleHeight - 6} x2={tx} y2={scaleHeight - 2} stroke={scaleBarColor} strokeWidth={0.5} />
                  <text x={tx} y={scaleHeight - 9} textAnchor="middle" fontSize={8} fill="#5b636a">
                    {formatValue(t)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {rows.map((row, ri) => {
          const ry = scaleHeight + ri * (rowHeight + rowGap) + rowGap / 2;
          const cy = ry + rowHeight / 2;

          const scaleBarY = cy - barH / 2;
          const marketBarX = x(row.marketMin);
          const marketBarW = x(row.marketMax) - marketBarX;
          const targetBarX = x(row.targetMin);
          const targetBarW = x(row.targetMax) - targetBarX;
          const targetBarY = cy - targetBarH / 2;

          const actualMinX = x(row.actualMin);
          const actualMaxX = x(row.actualMax);
          const minStyle = circleStyle(row.actualMin, row);
          const maxStyle = circleStyle(row.actualMax, row);
          const triMinStyle = triangleStyle("min", row);
          const triMaxStyle = triangleStyle("max", row);

          return (
            <g key={`bullet-${ri}`} data-testid={`bullet-row-${ri}`}>
              {showLabels && (
                <text
                  x={labelWidth - 6}
                  y={cy}
                  dy="0.35em"
                  textAnchor="end"
                  fill="#232a31"
                  fontSize={10}
                  fontWeight={600}
                  data-testid={`bullet-label-${ri}`}
                >
                  {row.label}
                </text>
              )}

              <rect
                x={labelWidth}
                y={scaleBarY}
                width={barAreaWidth}
                height={barH}
                fill={scaleBarColor}
                fillOpacity={0.5}
                rx={2}
                data-testid={`bullet-scale-bar-${ri}`}
              />

              <rect
                x={marketBarX}
                y={scaleBarY}
                width={Math.max(0, marketBarW)}
                height={barH}
                fill={marketColor}
                fillOpacity={0.7}
                rx={2}
                data-testid={`bullet-market-bar-${ri}`}
              >
                <title>Market: {formatValue(row.marketMin)} - {formatValue(row.marketMax)}</title>
              </rect>

              <rect
                x={targetBarX}
                y={targetBarY}
                width={Math.max(0, targetBarW)}
                height={targetBarH}
                fill={targetColor}
                fillOpacity={0.85}
                rx={1.5}
                data-testid={`bullet-target-bar-${ri}`}
              >
                <title>Target: {formatValue(row.targetMin)} - {formatValue(row.targetMax)}</title>
              </rect>

              <polygon
                points={leftTriangle(targetBarX, cy, triSize)}
                fill={triMinStyle.fill}
                stroke={triMinStyle.stroke}
                strokeWidth={triMinStyle.strokeWidth}
                data-testid={`bullet-tri-min-${ri}`}
              >
                <title>Target Min: {formatValue(row.targetMin)}</title>
              </polygon>
              <polygon
                points={rightTriangle(targetBarX + Math.max(0, targetBarW), cy, triSize)}
                fill={triMaxStyle.fill}
                stroke={triMaxStyle.stroke}
                strokeWidth={triMaxStyle.strokeWidth}
                data-testid={`bullet-tri-max-${ri}`}
              >
                <title>Target Max: {formatValue(row.targetMax)}</title>
              </polygon>

              <circle
                cx={actualMinX}
                cy={cy}
                r={circleR}
                fill={minStyle.fill}
                stroke={minStyle.stroke}
                strokeWidth={minStyle.strokeWidth}
                data-testid={`bullet-actual-min-${ri}`}
              >
                <title>Actual Min: {formatValue(row.actualMin)}</title>
              </circle>
              <circle
                cx={actualMaxX}
                cy={cy}
                r={circleR}
                fill={maxStyle.fill}
                stroke={maxStyle.stroke}
                strokeWidth={maxStyle.strokeWidth}
                data-testid={`bullet-actual-max-${ri}`}
              >
                <title>Actual Max: {formatValue(row.actualMax)}</title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
