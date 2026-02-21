import { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";

export interface GeoCompensationChartProps {
  increaseByCountry: Array<{
    country: string;
    countryCode: string;
    avgIncreasePct: number;
    headcount?: number;
    budgetAllocated?: number;
    budgetSpent?: number;
    localCurrency?: string;
  }>;
  inflationOverlay?: Array<{
    country: string;
    countryCode?: string;
    inflationPct: number;
    meritPct: number;
    realIncreasePct?: number;
  }>;
  fxNormalizedCost?: Array<{
    country: string;
    countryCode?: string;
    localCost: number;
    localCurrency?: string;
    fxRate?: number;
    normalizedCost: number;
    baseCurrency?: string;
    headcount?: number;
    costPerHead?: number;
  }>;
  compaRatioByGeo?: Array<{
    geoZone: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean?: number;
    headcount?: number;
  }>;
  width?: number;
  height?: number;
}

const GEO_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

export function GeoCompensationChart({
  increaseByCountry,
  inflationOverlay,
  fxNormalizedCost,
  compaRatioByGeo,
  width = 600,
  height = 600,
}: GeoCompensationChartProps) {
  const barRef = useRef<SVGSVGElement>(null);
  const inflationRef = useRef<SVGSVGElement>(null);
  const fxRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<SVGSVGElement>(null);

  if (!increaseByCountry || increaseByCountry.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground" data-testid="geo-comp-empty">
        No geographic compensation data available
      </div>
    );
  }

  const sortedCountries = useMemo(
    () => [...increaseByCountry].sort((a, b) => b.avgIncreasePct - a.avgIncreasePct),
    [increaseByCountry]
  );

  const barWidth = width;
  const barHeight = Math.max(120, sortedCountries.length * 28 + 40);
  const bm = { top: 10, right: 50, bottom: 20, left: 120 };

  useEffect(() => {
    if (!barRef.current) return;
    const svg = d3.select(barRef.current);
    svg.selectAll("*").remove();

    const iw = barWidth - bm.left - bm.right;
    const ih = barHeight - bm.top - bm.bottom;
    const g = svg.append("g").attr("transform", `translate(${bm.left},${bm.top})`);

    const xMax = d3.max(sortedCountries, (d) => d.avgIncreasePct) || 1;
    const x = d3.scaleLinear().domain([0, xMax * 1.15]).range([0, iw]);
    const y = d3.scaleBand().domain(sortedCountries.map((d) => d.country)).range([0, ih]).padding(0.3);

    g.selectAll(".bar")
      .data(sortedCountries)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.country)!)
      .attr("width", (d) => x(d.avgIncreasePct))
      .attr("height", y.bandwidth())
      .attr("fill", (_, i) => GEO_COLORS[i % GEO_COLORS.length])
      .attr("rx", 3)
      .attr("opacity", 0.85);

    g.selectAll(".label")
      .data(sortedCountries)
      .join("text")
      .attr("x", -6)
      .attr("y", (d) => y(d.country)! + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 11)
      .attr("fill", "currentColor")
      .text((d) => d.country);

    g.selectAll(".pct-label")
      .data(sortedCountries)
      .join("text")
      .attr("x", (d) => x(d.avgIncreasePct) + 4)
      .attr("y", (d) => y(d.country)! + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .attr("opacity", 0.7)
      .text((d) => `${d.avgIncreasePct.toFixed(1)}%`);
  }, [sortedCountries, barWidth, barHeight]);

  const inflHeight = 160;
  const im = { top: 10, right: 20, bottom: 30, left: 100 };

  useEffect(() => {
    if (!inflationRef.current || !inflationOverlay || inflationOverlay.length === 0) return;
    const svg = d3.select(inflationRef.current);
    svg.selectAll("*").remove();

    const iw = width - im.left - im.right;
    const ih = inflHeight - im.top - im.bottom;
    const g = svg.append("g").attr("transform", `translate(${im.left},${im.top})`);

    const countries = inflationOverlay.map((d) => d.country);
    const maxVal = d3.max(inflationOverlay, (d) => Math.max(d.inflationPct, d.meritPct)) || 1;

    const y = d3.scaleBand().domain(countries).range([0, ih]).padding(0.35);
    const x = d3.scaleLinear().domain([0, maxVal * 1.2]).range([0, iw]);

    const subBand = y.bandwidth() / 2;

    g.selectAll(".inflation-bar")
      .data(inflationOverlay)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.country)!)
      .attr("width", (d) => x(d.inflationPct))
      .attr("height", subBand - 1)
      .attr("fill", "#ef4444")
      .attr("rx", 2)
      .attr("opacity", 0.7);

    g.selectAll(".merit-bar")
      .data(inflationOverlay)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.country)! + subBand + 1)
      .attr("width", (d) => x(d.meritPct))
      .attr("height", subBand - 1)
      .attr("fill", "#22c55e")
      .attr("rx", 2)
      .attr("opacity", 0.7);

    g.selectAll(".country-label")
      .data(inflationOverlay)
      .join("text")
      .attr("x", -6)
      .attr("y", (d) => y(d.country)! + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .text((d) => d.country);

    const legend = g.append("g").attr("transform", `translate(${iw - 140}, -4)`);
    legend.append("rect").attr("width", 10).attr("height", 8).attr("fill", "#ef4444").attr("opacity", 0.7).attr("rx", 1);
    legend.append("text").attr("x", 14).attr("y", 7).attr("font-size", 9).attr("fill", "currentColor").text("CPI Inflation");
    legend.append("rect").attr("x", 80).attr("width", 10).attr("height", 8).attr("fill", "#22c55e").attr("opacity", 0.7).attr("rx", 1);
    legend.append("text").attr("x", 94).attr("y", 7).attr("font-size", 9).attr("fill", "currentColor").text("Merit");
  }, [inflationOverlay, width]);

  const fxHeight = 140;
  const fm = { top: 10, right: 50, bottom: 20, left: 120 };

  useEffect(() => {
    if (!fxRef.current || !fxNormalizedCost || fxNormalizedCost.length === 0) return;
    const svg = d3.select(fxRef.current);
    svg.selectAll("*").remove();

    const sorted = [...fxNormalizedCost].sort((a, b) => b.normalizedCost - a.normalizedCost);
    const iw = width - fm.left - fm.right;
    const ih = fxHeight - fm.top - fm.bottom;
    const g = svg.append("g").attr("transform", `translate(${fm.left},${fm.top})`);

    const xMax = d3.max(sorted, (d) => d.normalizedCost) || 1;
    const x = d3.scaleLinear().domain([0, xMax * 1.1]).range([0, iw]);
    const y = d3.scaleBand().domain(sorted.map((d) => d.country)).range([0, ih]).padding(0.3);

    g.selectAll(".fx-bar")
      .data(sorted)
      .join("rect")
      .attr("x", 0)
      .attr("y", (d) => y(d.country)!)
      .attr("width", (d) => x(d.normalizedCost))
      .attr("height", y.bandwidth())
      .attr("fill", "#6366f1")
      .attr("rx", 3)
      .attr("opacity", 0.8);

    g.selectAll(".fx-label")
      .data(sorted)
      .join("text")
      .attr("x", -6)
      .attr("y", (d) => y(d.country)! + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .text((d) => d.country);

    g.selectAll(".fx-amount")
      .data(sorted)
      .join("text")
      .attr("x", (d) => x(d.normalizedCost) + 4)
      .attr("y", (d) => y(d.country)! + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", 9)
      .attr("fill", "currentColor")
      .attr("opacity", 0.7)
      .text((d) => {
        const base = d.baseCurrency || "USD";
        return `${base} ${d3.format(",.0f")(d.normalizedCost)}`;
      });
  }, [fxNormalizedCost, width]);

  const boxHeight = 140;
  const boxM = { top: 10, right: 20, bottom: 20, left: 80 };

  useEffect(() => {
    if (!boxRef.current || !compaRatioByGeo || compaRatioByGeo.length === 0) return;
    const svg = d3.select(boxRef.current);
    svg.selectAll("*").remove();

    const iw = width - boxM.left - boxM.right;
    const ih = boxHeight - boxM.top - boxM.bottom;
    const g = svg.append("g").attr("transform", `translate(${boxM.left},${boxM.top})`);

    const zones = compaRatioByGeo.map((d) => d.geoZone);
    const allVals = compaRatioByGeo.flatMap((d) => [d.min, d.max]);
    const xMin = d3.min(allVals) || 0;
    const xMax = d3.max(allVals) || 2;

    const x = d3.scaleLinear().domain([xMin - 0.05, xMax + 0.05]).range([0, iw]);
    const y = d3.scaleBand().domain(zones).range([0, ih]).padding(0.4);

    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(5).tickFormat((d) => d3.format(".2f")(d as number))).selectAll("text").attr("font-size", 9);

    g.append("line").attr("x1", x(1.0)).attr("x2", x(1.0)).attr("y1", 0).attr("y2", ih).attr("stroke", "currentColor").attr("stroke-dasharray", "3,3").attr("opacity", 0.3);

    const boxColors = ["#3b82f6", "#8b5cf6", "#06b6d4"];

    compaRatioByGeo.forEach((d, i) => {
      const cy = y(d.geoZone)! + y.bandwidth() / 2;
      const bh = y.bandwidth();
      const color = boxColors[i % boxColors.length];

      g.append("line").attr("x1", x(d.min)).attr("x2", x(d.q1)).attr("y1", cy).attr("y2", cy).attr("stroke", color).attr("stroke-width", 1.5);
      g.append("line").attr("x1", x(d.q3)).attr("x2", x(d.max)).attr("y1", cy).attr("y2", cy).attr("stroke", color).attr("stroke-width", 1.5);
      g.append("rect").attr("x", x(d.q1)).attr("y", cy - bh / 2).attr("width", x(d.q3) - x(d.q1)).attr("height", bh).attr("fill", color).attr("opacity", 0.25).attr("stroke", color).attr("stroke-width", 1).attr("rx", 2);
      g.append("line").attr("x1", x(d.median)).attr("x2", x(d.median)).attr("y1", cy - bh / 2).attr("y2", cy + bh / 2).attr("stroke", color).attr("stroke-width", 2);
      g.append("line").attr("x1", x(d.min)).attr("x2", x(d.min)).attr("y1", cy - bh / 4).attr("y2", cy + bh / 4).attr("stroke", color).attr("stroke-width", 1.5);
      g.append("line").attr("x1", x(d.max)).attr("x2", x(d.max)).attr("y1", cy - bh / 4).attr("y2", cy + bh / 4).attr("stroke", color).attr("stroke-width", 1.5);

      g.append("text").attr("x", -6).attr("y", cy).attr("text-anchor", "end").attr("dominant-baseline", "middle").attr("font-size", 10).attr("fill", "currentColor").text(d.geoZone);
    });
  }, [compaRatioByGeo, width]);

  return (
    <div className="space-y-4" data-testid="geo-compensation-chart">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-increase-by-country">
          Average Merit Increase by Country
        </h4>
        <svg ref={barRef} width={barWidth} height={barHeight} data-testid="geo-country-bar-chart" />
      </div>

      {inflationOverlay && inflationOverlay.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-inflation-overlay">
            Inflation vs Merit Allocation
          </h4>
          <svg ref={inflationRef} width={width} height={inflHeight} data-testid="geo-inflation-chart" />
        </div>
      )}

      {fxNormalizedCost && fxNormalizedCost.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-fx-cost">
            FX-Normalized Merit Cost
          </h4>
          <svg ref={fxRef} width={width} height={fxHeight} data-testid="geo-fx-chart" />
        </div>
      )}

      {compaRatioByGeo && compaRatioByGeo.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-compa-by-geo">
            Compa-Ratio Distribution by Geo Zone
          </h4>
          <svg ref={boxRef} width={width} height={boxHeight} data-testid="geo-box-chart" />
        </div>
      )}
    </div>
  );
}
