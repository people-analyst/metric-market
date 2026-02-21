import { useMemo, useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export interface GovernanceFlagsChartProps {
  flagsByCategory: Array<{
    category: string;
    severity: string;
    count: number;
    resolvedCount?: number;
  }>;
  resolutionOverTime: {
    dates: string[];
    opened: number[];
    resolved: number[];
  };
  topFlaggedEntities?: Array<{
    name: string;
    type: string;
    flagCount: number;
    criticalCount?: number;
    warningCount?: number;
    resolutionPct?: number;
  }>;
  flagDetails?: Array<{
    flagId: string;
    category: string;
    severity: string;
    employeeId?: string;
    managerId?: string;
    department?: string;
    description?: string;
    status?: string;
    createdAt?: string;
    resolvedAt?: string;
  }>;
  width?: number;
  height?: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export function GovernanceFlagsChart({
  flagsByCategory,
  resolutionOverTime,
  topFlaggedEntities,
  flagDetails,
  width = 600,
  height = 600,
}: GovernanceFlagsChartProps) {
  const barRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGSVGElement>(null);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  if (!flagsByCategory || flagsByCategory.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground" data-testid="governance-flags-empty">
        No governance flag data available
      </div>
    );
  }

  const sortedFlags = useMemo(
    () => [...flagsByCategory].sort((a, b) => b.count - a.count),
    [flagsByCategory]
  );

  const barWidth = width;
  const barHeight = Math.max(160, sortedFlags.length * 28 + 40);
  const margin = { top: 10, right: 60, bottom: 20, left: 150 };

  useEffect(() => {
    if (!barRef.current) return;
    const svg = d3.select(barRef.current);
    svg.selectAll("*").remove();

    const iw = barWidth - margin.left - margin.right;
    const ih = barHeight - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xMax = d3.max(sortedFlags, (d) => d.count) || 1;
    const x = d3.scaleLinear().domain([0, xMax]).range([0, iw]);
    const y = d3.scaleBand().domain(sortedFlags.map((d) => d.category)).range([0, ih]).padding(0.25);

    g.selectAll(".bar-bg")
      .data(sortedFlags)
      .join("rect")
      .attr("class", "bar-bg")
      .attr("x", 0)
      .attr("y", (d) => y(d.category)!)
      .attr("width", (d) => x(d.count))
      .attr("height", y.bandwidth())
      .attr("fill", (d) => SEVERITY_COLORS[d.severity] || "#94a3b8")
      .attr("rx", 3)
      .attr("opacity", 0.85);

    g.selectAll(".bar-resolved")
      .data(sortedFlags)
      .join("rect")
      .attr("class", "bar-resolved")
      .attr("x", 0)
      .attr("y", (d) => y(d.category)! + y.bandwidth() * 0.3)
      .attr("width", (d) => x(d.resolvedCount ?? 0))
      .attr("height", y.bandwidth() * 0.4)
      .attr("fill", "#22c55e")
      .attr("rx", 2)
      .attr("opacity", 0.7);

    g.selectAll(".label")
      .data(sortedFlags)
      .join("text")
      .attr("x", -6)
      .attr("y", (d) => y(d.category)! + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 11)
      .attr("fill", "currentColor")
      .text((d) => d.category);

    g.selectAll(".count-label")
      .data(sortedFlags)
      .join("text")
      .attr("x", (d) => x(d.count) + 4)
      .attr("y", (d) => y(d.category)! + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "currentColor")
      .attr("opacity", 0.7)
      .text((d) => d.count);
  }, [sortedFlags, barWidth, barHeight]);

  const lineWidth = width;
  const lineHeight = 140;
  const lm = { top: 10, right: 20, bottom: 24, left: 40 };

  useEffect(() => {
    if (!lineRef.current || !resolutionOverTime) return;
    const svg = d3.select(lineRef.current);
    svg.selectAll("*").remove();

    const iw = lineWidth - lm.left - lm.right;
    const ih = lineHeight - lm.top - lm.bottom;
    const g = svg.append("g").attr("transform", `translate(${lm.left},${lm.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const dates = resolutionOverTime.dates.map((d) => parseDate(d) || new Date(d));
    const maxVal = d3.max([...resolutionOverTime.opened, ...resolutionOverTime.resolved]) || 1;

    const x = d3.scaleTime().domain(d3.extent(dates) as [Date, Date]).range([0, iw]);
    const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([ih, 0]);

    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(4).tickFormat((d) => d3.timeFormat("%b %d")(d as Date))).selectAll("text").attr("font-size", 9);
    g.append("g").call(d3.axisLeft(y).ticks(4)).selectAll("text").attr("font-size", 9);

    const openedLine = d3.line<number>().x((_, i) => x(dates[i])).y((d) => y(d)).curve(d3.curveMonotoneX);
    const resolvedLine = d3.line<number>().x((_, i) => x(dates[i])).y((d) => y(d)).curve(d3.curveMonotoneX);

    const area = d3.area<number>().x((_, i) => x(dates[i])).y0((d, i) => y(resolutionOverTime.resolved[i])).y1((d) => y(d)).curve(d3.curveMonotoneX);

    g.append("path").datum(resolutionOverTime.opened).attr("d", area).attr("fill", "#fecaca").attr("opacity", 0.3);
    g.append("path").datum(resolutionOverTime.opened).attr("d", openedLine).attr("fill", "none").attr("stroke", "#ef4444").attr("stroke-width", 2);
    g.append("path").datum(resolutionOverTime.resolved).attr("d", resolvedLine).attr("fill", "none").attr("stroke", "#22c55e").attr("stroke-width", 2);

    const legend = g.append("g").attr("transform", `translate(${iw - 120}, 0)`);
    legend.append("line").attr("x1", 0).attr("x2", 14).attr("y1", 0).attr("y2", 0).attr("stroke", "#ef4444").attr("stroke-width", 2);
    legend.append("text").attr("x", 18).attr("y", 0).attr("dominant-baseline", "middle").attr("font-size", 9).attr("fill", "currentColor").text("Opened");
    legend.append("line").attr("x1", 0).attr("x2", 14).attr("y1", 14).attr("y2", 14).attr("stroke", "#22c55e").attr("stroke-width", 2);
    legend.append("text").attr("x", 18).attr("y", 14).attr("dominant-baseline", "middle").attr("font-size", 9).attr("fill", "currentColor").text("Resolved");
  }, [resolutionOverTime, lineWidth, lineHeight]);

  return (
    <div className="space-y-4" data-testid="governance-flags-chart">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-flag-counts">
          Flag Counts by Category
        </h4>
        <svg ref={barRef} width={barWidth} height={barHeight} data-testid="governance-bar-chart" />
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: "#ef4444" }} /> Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: "#f59e0b" }} /> Warning
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: "#3b82f6" }} /> Info
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: "#22c55e" }} /> Resolved
          </span>
        </div>
      </div>

      {resolutionOverTime && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-resolution-timeline">
            Resolution Rate Over Time
          </h4>
          <svg ref={lineRef} width={lineWidth} height={lineHeight} data-testid="governance-line-chart" />
        </div>
      )}

      {topFlaggedEntities && topFlaggedEntities.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-top-flagged">
            Top Flagged Entities
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-testid="governance-entity-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-1 px-2 font-medium text-muted-foreground">Flags</th>
                  <th className="text-right py-1 px-2 font-medium text-muted-foreground">Critical</th>
                  <th className="text-right py-1 px-2 font-medium text-muted-foreground">Warning</th>
                  <th className="text-right py-1 px-2 font-medium text-muted-foreground">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {topFlaggedEntities.map((entity, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30" data-testid={`entity-row-${i}`}>
                    <td className="py-1 px-2 font-medium">{entity.name}</td>
                    <td className="py-1 px-2 text-muted-foreground capitalize">{entity.type}</td>
                    <td className="py-1 px-2 text-right font-mono">{entity.flagCount}</td>
                    <td className="py-1 px-2 text-right font-mono text-red-500">{entity.criticalCount ?? 0}</td>
                    <td className="py-1 px-2 text-right font-mono text-amber-500">{entity.warningCount ?? 0}</td>
                    <td className="py-1 px-2 text-right font-mono text-emerald-500">{entity.resolutionPct != null ? `${entity.resolutionPct}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {flagDetails && flagDetails.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1" data-testid="section-flag-details">
            Flag Details
          </h4>
          <div className="space-y-1">
            {flagDetails.slice(0, 10).map((flag) => (
              <div
                key={flag.flagId}
                className="border border-border/50 rounded px-2 py-1 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedFlag(expandedFlag === flag.flagId ? null : flag.flagId)}
                data-testid={`flag-detail-${flag.flagId}`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLORS[flag.severity] || "#94a3b8" }}
                    />
                    <span className="font-mono text-muted-foreground">{flag.flagId}</span>
                    <span>{flag.category}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${flag.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : flag.status === "waived" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {flag.status || "open"}
                  </span>
                </div>
                {expandedFlag === flag.flagId && (
                  <div className="mt-1 pt-1 border-t border-border/30 text-[10px] text-muted-foreground space-y-0.5">
                    {flag.description && <p>{flag.description}</p>}
                    <div className="flex gap-3">
                      {flag.department && <span>Dept: {flag.department}</span>}
                      {flag.employeeId && <span>EE: {flag.employeeId}</span>}
                      {flag.managerId && <span>Mgr: {flag.managerId}</span>}
                    </div>
                    <div className="flex gap-3">
                      {flag.createdAt && <span>Created: {flag.createdAt}</span>}
                      {flag.resolvedAt && <span>Resolved: {flag.resolvedAt}</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
