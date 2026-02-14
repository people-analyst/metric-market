import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RangeBuilderControl, RangeBuilderChangeEvent, RangeBuilderRow } from "@/components/controls/RangeBuilderControl";
import { RangeTargetBulletChart, BulletRangeRow } from "@/components/charts/RangeTargetBulletChart";

const SAMPLE_ROWS: RangeBuilderRow[] = [
  { label: "Eng III", rangeMin: 110000, rangeMax: 150000, currentEmployees: 24, avgCurrentPay: 128000 },
  { label: "Eng IV", rangeMin: 140000, rangeMax: 190000, currentEmployees: 18, avgCurrentPay: 162000 },
  { label: "Eng V", rangeMin: 175000, rangeMax: 235000, currentEmployees: 12, avgCurrentPay: 198000 },
  { label: "Eng VI", rangeMin: 210000, rangeMax: 280000, currentEmployees: 6, avgCurrentPay: 245000 },
];

const SAMPLE_MARKET_DATA = [
  { p50: 130000, p75: 148000 },
  { p50: 165000, p75: 185000 },
  { p50: 205000, p75: 230000 },
  { p50: 250000, p75: 275000 },
];

const SAMPLE_ACTUALS = [
  { actualMin: 105000, actualMax: 155000 },
  { actualMin: 138000, actualMax: 195000 },
  { actualMin: 180000, actualMax: 242000 },
  { actualMin: 215000, actualMax: 285000 },
];

export function RangeBuilderPage() {
  const [lastEvent, setLastEvent] = useState<RangeBuilderChangeEvent | null>(null);

  const handleChange = useCallback((event: RangeBuilderChangeEvent) => {
    setLastEvent(event);
  }, []);

  const bulletRows: BulletRangeRow[] = useMemo(() => {
    return SAMPLE_ROWS.map((row, i) => {
      const market = SAMPLE_MARKET_DATA[i];
      const actuals = SAMPLE_ACTUALS[i];
      const activeRange = lastEvent?.activeRanges[i];

      return {
        label: row.label,
        marketMin: market.p50 - (market.p75 - market.p50),
        marketMax: market.p75,
        targetMin: activeRange?.min ?? row.rangeMin,
        targetMax: activeRange?.max ?? row.rangeMax,
        actualMin: actuals.actualMin,
        actualMax: actuals.actualMax,
      };
    });
  }, [lastEvent]);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4" data-testid="page-range-builder">
      <div>
        <h1 className="text-lg font-bold text-foreground" data-testid="text-page-title">Range Builder</h1>
        <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-page-description">
          Adjust compensation ranges and see real-time impact on cost, pay equity, competitiveness, and affected employees
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1 pt-3 px-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground" data-testid="text-section-title">Engineering Pay Ranges</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Click boxes to extend or shrink compensation ranges</p>
          </div>
          <Badge variant="secondary" className="text-[10px]" data-testid="badge-control-type">Form Control</Badge>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-1">
          <RangeBuilderControl
            rows={SAMPLE_ROWS}
            stepSize={10000}
            scaleMin={90000}
            scaleMax={300000}
            marketData={SAMPLE_MARKET_DATA}
            onChange={handleChange}
            autoRecalculate
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1 pt-3 px-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground" data-testid="text-bullet-title">Target Range Analysis</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Market range, target range, and actual employee pay extremes</p>
          </div>
          <Badge variant="secondary" className="text-[10px]" data-testid="badge-chart-type">Bullet Chart</Badge>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <RangeTargetBulletChart
            rows={bulletRows}
            scaleMin={90000}
            scaleMax={300000}
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground" data-testid="bullet-chart-legend">
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-2 rounded-sm" style={{ backgroundColor: "#e0e4e9", opacity: 0.5 }} />
              Scale
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-2 rounded-sm" style={{ backgroundColor: "#b8d4f0", opacity: 0.7 }} />
              Market Range
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-2 rounded-sm" style={{ backgroundColor: "#0f69ff", opacity: 0.85 }} />
              Target Range
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#0f69ff" /></svg>
              Actual (in Target + Market)
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="white" stroke="#0f69ff" strokeWidth="1.5" /></svg>
              Actual (in Target only)
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="white" stroke="#232a31" strokeWidth="1.5" /></svg>
              Actual (in Market only)
            </span>
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#232a31" /></svg>
              Actual (outside both)
            </span>
          </div>
        </CardContent>
      </Card>

      {lastEvent && (
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <h3 className="text-sm font-semibold text-foreground" data-testid="text-ranges-title">Active Ranges</h3>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            <div className="space-y-1" data-testid="range-summary-list">
              {lastEvent.activeRanges.map((r) => (
                <div key={r.label} className="flex items-center gap-2 text-xs" data-testid={`range-summary-${r.label}`}>
                  <span className="font-medium text-foreground w-16">{r.label}</span>
                  <span className="text-muted-foreground">
                    ${(r.min / 1000).toFixed(0)}k — ${(r.max / 1000).toFixed(0)}k
                  </span>
                  <span className="text-muted-foreground">
                    (spread: ${((r.max - r.min) / 1000).toFixed(0)}k)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
