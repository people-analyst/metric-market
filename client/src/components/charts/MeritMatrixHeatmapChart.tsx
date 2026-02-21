import { useMemo } from "react";
import * as d3 from "d3";

export interface MeritMatrixHeatmapChartProps {
  rowLabels: string[];
  colLabels: string[];
  cells: Array<Array<{
    targetPct: number;
    actualPct: number;
    population: number;
    variancePct?: number;
    overrideCount?: number;
    employeeIds?: string[];
  }>>;
  cycleName?: string;
  asOfDate?: string;
  width?: number;
  height?: number;
}

export function MeritMatrixHeatmapChart({
  rowLabels,
  colLabels,
  cells,
  cycleName,
  width = 600,
  height = 500,
}: MeritMatrixHeatmapChartProps) {
  if (!cells || cells.length === 0 || !rowLabels || !colLabels) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  const margin = { top: 40, right: 12, bottom: 30, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const rows = cells.length;
  const cols = cells[0]?.length || 0;
  const cellWidth = innerWidth / cols;
  const cellHeight = innerHeight / rows;

  // Color scale based on variance
  const colorScale = useMemo(() => {
    return (variancePct: number) => {
      if (variancePct < -0.5) return "#3b82f6"; // Blue - under target
      if (variancePct > 0.5) return "#ef4444"; // Red - over target
      return "#e5e7eb"; // Gray - on target
    };
  }, []);

  return (
    <div className="space-y-2">
      {cycleName && (
        <div className="text-xs font-medium text-muted-foreground">
          {cycleName}
        </div>
      )}
      <svg width={width} height={height} className="block">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Column labels */}
          {colLabels.map((label, ci) => (
            <text
              key={ci}
              x={ci * cellWidth + cellWidth / 2}
              y={-12}
              textAnchor="middle"
              className="text-[9px] font-semibold fill-current text-foreground"
            >
              {label}
            </text>
          ))}

          {/* Row labels and cells */}
          {cells.map((row, ri) => (
            <g key={ri}>
              <text
                x={-12}
                y={ri * cellHeight + cellHeight / 2}
                dy="0.35em"
                textAnchor="end"
                className="text-[9px] font-semibold fill-current text-foreground"
              >
                {rowLabels[ri]}
              </text>
              {row.map((cell, ci) => {
                const variancePct = cell.variancePct ?? (cell.actualPct - cell.targetPct);
                const fillColor = colorScale(variancePct);
                
                return (
                  <g key={ci}>
                    {/* Cell background */}
                    <rect
                      x={ci * cellWidth + 2}
                      y={ri * cellHeight + 2}
                      width={cellWidth - 4}
                      height={cellHeight - 4}
                      fill={fillColor}
                      rx={3}
                      className="stroke-gray-300"
                      strokeWidth={0.5}
                    />
                    
                    {/* Target percentage (small, top) */}
                    <text
                      x={ci * cellWidth + cellWidth / 2}
                      y={ri * cellHeight + cellHeight * 0.28}
                      textAnchor="middle"
                      className="text-[8px] fill-current text-gray-600"
                    >
                      Target: {cell.targetPct.toFixed(1)}%
                    </text>
                    
                    {/* Actual percentage (large, center) */}
                    <text
                      x={ci * cellWidth + cellWidth / 2}
                      y={ri * cellHeight + cellHeight * 0.52}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-current text-gray-900"
                    >
                      {cell.actualPct.toFixed(1)}%
                    </text>
                    
                    {/* Population count (bottom) */}
                    <text
                      x={ci * cellWidth + cellWidth / 2}
                      y={ri * cellHeight + cellHeight * 0.72}
                      textAnchor="middle"
                      className="text-[8px] fill-current text-gray-700"
                    >
                      n={cell.population}
                    </text>
                    
                    {/* Variance indicator */}
                    {Math.abs(variancePct) > 0.5 && (
                      <text
                        x={ci * cellWidth + cellWidth / 2}
                        y={ri * cellHeight + cellHeight * 0.88}
                        textAnchor="middle"
                        className={`text-[7px] font-semibold fill-current ${
                          variancePct > 0 ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        {variancePct > 0 ? '↑' : '↓'} {Math.abs(variancePct).toFixed(1)}pp
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={innerWidth / 2}
            y={-28}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-current text-foreground"
          >
            Compa-Ratio Zone →
          </text>
          <text
            x={-70}
            y={innerHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${-70}, ${innerHeight / 2})`}
            className="text-[10px] font-semibold fill-current text-foreground"
          >
            ← Performance Tier
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
          <span>Under Target</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#e5e7eb" }} />
          <span>On Target</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444" }} />
          <span>Over Target</span>
        </div>
      </div>
    </div>
  );
}
