import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, Scale, Target, Users } from "lucide-react";

export interface RangeBuilderRow {
  label: string;
  rangeMin: number;
  rangeMax: number;
  currentEmployees?: number;
  avgCurrentPay?: number;
  segments?: { active?: boolean }[];
}

export interface RangeBuilderKPIs {
  totalCostImpact: number;
  costChangePercent: number;
  peerEquityScore: number;
  peerEquityChange: number;
  competitivenessRatio: number;
  competitivenessChange: number;
  employeesAffected: number;
  totalEmployees: number;
}

export interface RangeBuilderChangeEvent {
  rows: RangeBuilderRow[];
  activeRanges: { label: string; min: number; max: number }[];
  kpis: RangeBuilderKPIs;
}

export interface RangeBuilderControlProps {
  rows: RangeBuilderRow[];
  stepSize?: number;
  scaleMin?: number;
  scaleMax?: number;
  activeColor?: string;
  inactiveColor?: string;
  segmentHeight?: number;
  gap?: number;
  showLabels?: boolean;
  showScale?: boolean;
  labelWidth?: number;
  formatValue?: (v: number) => string;
  marketData?: { p50: number; p75: number }[];
  onChange?: (event: RangeBuilderChangeEvent) => void;
  autoRecalculate?: boolean;
}

function computeEquityForRange(avgPay: number, rangeMin: number, rangeMax: number): number {
  const spread = rangeMax - rangeMin;
  if (spread <= 0) return 1;
  const midpoint = (rangeMin + rangeMax) / 2;
  const deviation = Math.abs(avgPay - midpoint) / (spread / 2);
  return Math.max(0, 1 - deviation);
}

function computeCompForRange(rangeMin: number, rangeMax: number, mkt?: { p50: number; p75: number }): number {
  if (!mkt || mkt.p50 <= 0) return 1.0;
  const midpoint = (rangeMin + rangeMax) / 2;
  return midpoint / mkt.p50;
}

function computeKPIs(
  originalRows: RangeBuilderRow[],
  activeState: boolean[][],
  scaleMin: number,
  stepSize: number,
  boxCount: number,
  marketData?: { p50: number; p75: number }[],
): RangeBuilderKPIs {
  let baselineCost = 0;
  let newCost = 0;
  let totalEmployees = 0;
  let affectedEmployees = 0;

  let baselineEquityNum = 0;
  let baselineEquityDen = 0;
  let newEquityNum = 0;
  let newEquityDen = 0;

  let baselineCompNum = 0;
  let baselineCompDen = 0;
  let newCompNum = 0;
  let newCompDen = 0;

  originalRows.forEach((row, ri) => {
    const emp = row.currentEmployees ?? 10;
    const avgPay = row.avgCurrentPay ?? (row.rangeMin + row.rangeMax) / 2;
    totalEmployees += emp;
    const mkt = ri < (marketData?.length ?? 0) ? marketData![ri] : undefined;

    let baselineAdjustedPay = avgPay;
    if (avgPay < row.rangeMin) baselineAdjustedPay = row.rangeMin;
    else if (avgPay > row.rangeMax) baselineAdjustedPay = row.rangeMax;
    baselineCost += baselineAdjustedPay * emp;

    baselineEquityNum += computeEquityForRange(avgPay, row.rangeMin, row.rangeMax) * emp;
    baselineEquityDen += emp;
    baselineCompNum += computeCompForRange(row.rangeMin, row.rangeMax, mkt) * emp;
    baselineCompDen += emp;

    const actives = activeState[ri] || [];
    const activeIndices = actives.reduce<number[]>((acc, v, i) => { if (v) acc.push(i); return acc; }, []);

    if (activeIndices.length === 0) {
      newCost += baselineAdjustedPay * emp;
      newEquityNum += computeEquityForRange(avgPay, row.rangeMin, row.rangeMax) * emp;
      newEquityDen += emp;
      newCompNum += computeCompForRange(row.rangeMin, row.rangeMax, mkt) * emp;
      newCompDen += emp;
      return;
    }

    const newMin = scaleMin + activeIndices[0] * stepSize;
    const newMax = scaleMin + (activeIndices[activeIndices.length - 1] + 1) * stepSize;

    let adjustedPay = avgPay;
    if (avgPay < newMin) {
      adjustedPay = newMin;
      affectedEmployees += emp;
    } else if (avgPay > newMax) {
      adjustedPay = newMax;
      affectedEmployees += emp;
    }
    newCost += adjustedPay * emp;

    newEquityNum += computeEquityForRange(avgPay, newMin, newMax) * emp;
    newEquityDen += emp;
    newCompNum += computeCompForRange(newMin, newMax, mkt) * emp;
    newCompDen += emp;
  });

  const costImpact = newCost - baselineCost;
  const costChangePct = baselineCost > 0 ? (costImpact / baselineCost) * 100 : 0;

  const baselineEquity = baselineEquityDen > 0 ? baselineEquityNum / baselineEquityDen : 0;
  const newEquity = newEquityDen > 0 ? newEquityNum / newEquityDen : baselineEquity;
  const equityChange = newEquity - baselineEquity;

  const baselineComp = baselineCompDen > 0 ? baselineCompNum / baselineCompDen : 1.0;
  const newComp = newCompDen > 0 ? newCompNum / newCompDen : baselineComp;
  const compChange = newComp - baselineComp;

  return {
    totalCostImpact: costImpact,
    costChangePercent: costChangePct,
    peerEquityScore: newEquity,
    peerEquityChange: equityChange,
    competitivenessRatio: newComp,
    competitivenessChange: compChange,
    employeesAffected: affectedEmployees,
    totalEmployees,
  };
}

export function RangeBuilderControl({
  rows: initialRows,
  stepSize = 10000,
  scaleMin: scaleMinProp,
  scaleMax: scaleMaxProp,
  activeColor = "#0f69ff",
  inactiveColor = "#e0e4e9",
  segmentHeight = 24,
  gap = 2,
  showLabels = true,
  showScale = true,
  labelWidth: labelWidthProp,
  formatValue = (v) => `$${Math.round(v / 1000)}k`,
  marketData,
  onChange,
  autoRecalculate = true,
}: RangeBuilderControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(500);

  useEffect(() => {
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
  }, []);

  const { scaleMin, scaleMax } = useMemo(() => {
    if (scaleMinProp !== undefined && scaleMaxProp !== undefined) {
      return { scaleMin: scaleMinProp, scaleMax: scaleMaxProp };
    }
    let min = Infinity, max = -Infinity;
    for (const row of initialRows) {
      if (row.rangeMin < min) min = row.rangeMin;
      if (row.rangeMax > max) max = row.rangeMax;
    }
    if (!isFinite(min)) { min = 0; max = 100000; }
    return {
      scaleMin: scaleMinProp ?? Math.floor(min / stepSize) * stepSize - stepSize * 2,
      scaleMax: scaleMaxProp ?? Math.ceil(max / stepSize) * stepSize + stepSize * 2,
    };
  }, [initialRows, scaleMinProp, scaleMaxProp, stepSize]);

  const boxCount = Math.max(1, Math.ceil((scaleMax - scaleMin) / stepSize));

  const buildActiveState = useCallback((inputRows: RangeBuilderRow[]) => {
    return inputRows.map((row) => {
      const actives: boolean[] = new Array(boxCount).fill(false);
      for (let i = 0; i < boxCount; i++) {
        const boxMid = scaleMin + i * stepSize + stepSize / 2;
        actives[i] = boxMid >= row.rangeMin && boxMid <= row.rangeMax;
      }
      return actives;
    });
  }, [boxCount, scaleMin, stepSize]);

  const [activeState, setActiveState] = useState<boolean[][]>(() => buildActiveState(initialRows));

  useEffect(() => {
    setActiveState(buildActiveState(initialRows));
  }, [initialRows, buildActiveState]);

  const kpis = useMemo(() =>
    computeKPIs(initialRows, activeState, scaleMin, stepSize, boxCount, marketData),
    [initialRows, activeState, scaleMin, stepSize, boxCount, marketData]
  );

  const width = measuredWidth;
  const labelWidth = labelWidthProp ?? (showLabels ? 64 : 0);
  const costColWidth = 48;
  const stripWidth = width - labelWidth - costColWidth - 8;
  const boxWidth = Math.max(1, (stripWidth - (boxCount - 1) * gap) / boxCount);

  const rowSpacing = 6;
  const scaleHeight = showScale ? 20 : 0;
  const rowTotalHeight = segmentHeight + rowSpacing;
  const svgHeight = scaleHeight + initialRows.length * rowTotalHeight + 4;

  const ticks = useMemo(() => {
    const result: { value: number; boxIndex: number }[] = [];
    const pixelsPerBox = stripWidth / Math.max(1, boxCount);
    const minTickPixels = 50;
    const boxesPerTick = Math.max(1, Math.ceil(minTickPixels / pixelsPerBox));
    const tickStep = stepSize * boxesPerTick;
    let v = Math.ceil(scaleMin / tickStep) * tickStep;
    while (v <= scaleMax) {
      const idx = (v - scaleMin) / stepSize;
      result.push({ value: v, boxIndex: idx });
      v += tickStep;
    }
    return result;
  }, [scaleMin, scaleMax, stepSize, stripWidth, boxCount]);

  const toggleSegment = useCallback((ri: number, si: number) => {
    setActiveState((prev) => {
      const next = prev.map((row, r) => {
        if (r !== ri) return row;
        return row.map((val, s) => (s === si ? !val : val));
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!autoRecalculate || !onChange) return;
    const activeRanges = initialRows.map((row, ri) => {
      const actives = activeState[ri] || [];
      const first = actives.indexOf(true);
      const last = actives.lastIndexOf(true);
      return {
        label: row.label,
        min: first >= 0 ? scaleMin + first * stepSize : row.rangeMin,
        max: last >= 0 ? scaleMin + (last + 1) * stepSize : row.rangeMax,
      };
    });
    onChange({ rows: initialRows, activeRanges, kpis });
  }, [activeState, kpis, autoRecalculate, onChange, initialRows, scaleMin, stepSize]);

  const handleRecalculate = useCallback(() => {
    if (!onChange) return;
    const activeRanges = initialRows.map((row, ri) => {
      const actives = activeState[ri] || [];
      const first = actives.indexOf(true);
      const last = actives.lastIndexOf(true);
      return {
        label: row.label,
        min: first >= 0 ? scaleMin + first * stepSize : row.rangeMin,
        max: last >= 0 ? scaleMin + (last + 1) * stepSize : row.rangeMax,
      };
    });
    onChange({ rows: initialRows, activeRanges, kpis });
  }, [onChange, initialRows, activeState, scaleMin, stepSize, kpis]);

  const formatCurrency = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1000000) return `${v < 0 ? "-" : ""}$${(abs / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${v < 0 ? "-" : ""}$${(abs / 1000).toFixed(0)}k`;
    return `$${v.toFixed(0)}`;
  };

  const formatPct = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;

  const costIndex = Math.round(Math.max(0, Math.min(100, 100 - Math.abs(kpis.costChangePercent) * 10)));
  const peerEquityIndex = Math.round(kpis.peerEquityScore * 100);
  const compIndex = Math.round(Math.max(0, Math.min(100, 100 - Math.abs(kpis.competitivenessRatio - 1) * 200)));
  const affectedPct = kpis.totalEmployees > 0 ? kpis.employeesAffected / kpis.totalEmployees : 0;
  const stabilityIndex = Math.round(Math.max(0, Math.min(100, (1 - affectedPct) * 100)));

  const indexColor = (idx: number) => {
    if (idx >= 80) return "text-green-600";
    if (idx >= 60) return "text-foreground";
    if (idx >= 40) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-3" data-testid="range-builder-control">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2" data-testid="range-builder-kpis">
        <Card data-testid="kpi-cost-impact">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cost Impact</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold leading-none ${indexColor(costIndex)}`} data-testid="kpi-cost-index">{costIndex}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <div className="text-xs font-medium text-foreground" data-testid="kpi-cost-value">{formatCurrency(kpis.totalCostImpact)}</div>
              <div className={`text-[10px] font-medium ${kpis.costChangePercent >= 0 ? "text-red-600" : "text-green-600"}`} data-testid="kpi-cost-change">
                {kpis.costChangePercent >= 0 ? "+" : ""}{kpis.costChangePercent.toFixed(1)}% annual
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-peer-equity">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Scale className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Peer Equity</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold leading-none ${indexColor(peerEquityIndex)}`} data-testid="kpi-equity-index">{peerEquityIndex}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <div className="text-xs font-medium text-foreground" data-testid="kpi-equity-value">{(kpis.peerEquityScore * 100).toFixed(1)}% alignment</div>
              <div className={`text-[10px] font-medium ${kpis.peerEquityChange >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="kpi-equity-change">
                {formatPct(kpis.peerEquityChange)} vs baseline
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-competitiveness">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Competitiveness</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold leading-none ${indexColor(compIndex)}`} data-testid="kpi-comp-index">{compIndex}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <div className="text-xs font-medium text-foreground" data-testid="kpi-comp-value">{(kpis.competitivenessRatio * 100).toFixed(0)}% of market</div>
              <div className={`text-[10px] font-medium ${kpis.competitivenessChange >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="kpi-comp-change">
                {formatPct(kpis.competitivenessChange)} vs baseline
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="kpi-stability">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Stability</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold leading-none ${indexColor(stabilityIndex)}`} data-testid="kpi-stability-index">{stabilityIndex}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
            <div className="mt-1.5 space-y-0.5">
              <div className="text-xs font-medium text-foreground" data-testid="kpi-affected-value">{kpis.employeesAffected} affected</div>
              <div className="text-[10px] font-medium text-muted-foreground" data-testid="kpi-affected-total">
                of {kpis.totalEmployees} employees
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={containerRef} className="w-full" data-testid="range-builder-strip-area">
        <svg width={width} height={svgHeight} className="block max-w-full" data-testid="range-builder-svg">
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
                    <line x1={tx} y1={scaleHeight - 6} x2={tx} y2={scaleHeight - 2} stroke="#e0e4e9" strokeWidth={0.5} />
                    <text x={tx} y={scaleHeight - 8} textAnchor="middle" fontSize={8} fill="#5b636a">
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
            const firstActive = actives.indexOf(true);
            const lastActive = actives.lastIndexOf(true);
            const hasActive = firstActive >= 0;

            const activeMin = hasActive ? scaleMin + firstActive * stepSize : 0;
            const activeMax = hasActive ? scaleMin + (lastActive + 1) * stepSize : 0;

            return (
              <g key={`row-${ri}`} data-testid={`range-builder-row-${ri}`}>
                {showLabels && (
                  <text
                    x={labelWidth - 6}
                    y={ry + segmentHeight / 2}
                    dy="0.35em"
                    textAnchor="end"
                    fill="#232a31"
                    fontSize={10}
                    fontWeight={600}
                    data-testid={`range-builder-label-${ri}`}
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
                    strokeOpacity={0.2}
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

                  return (
                    <g
                      key={si}
                      data-testid={`range-builder-seg-${ri}-${si}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSegment(ri, si)}
                    >
                      <rect
                        x={sx}
                        y={ry}
                        width={boxWidth}
                        height={segmentHeight}
                        fill={fill}
                        fillOpacity={isActive ? 1 : 0.35}
                        rx={rx}
                        stroke={isActive ? "rgba(255,255,255,0.3)" : "none"}
                        strokeWidth={isActive ? 0.5 : 0}
                      >
                        <title>{formatValue(boxStart)} - {formatValue(boxEnd)}</title>
                      </rect>
                      <rect
                        x={sx}
                        y={ry}
                        width={boxWidth}
                        height={segmentHeight}
                        fill="transparent"
                        rx={rx}
                        className="hover:fill-[rgba(255,255,255,0.12)]"
                      />
                    </g>
                  );
                })}

                <text
                  x={labelWidth + stripWidth + 6}
                  y={ry + segmentHeight / 2}
                  dy="0.35em"
                  textAnchor="start"
                  fill={hasActive ? "#232a31" : "#a3adb8"}
                  fontSize={8}
                  fontWeight={500}
                  data-testid={`range-builder-range-summary-${ri}`}
                >
                  {hasActive ? `${formatValue(activeMin)}-${formatValue(activeMax)}` : "---"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {!autoRecalculate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={handleRecalculate} data-testid="button-recalculate">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Recalculate
          </Button>
        </div>
      )}
    </div>
  );
}
