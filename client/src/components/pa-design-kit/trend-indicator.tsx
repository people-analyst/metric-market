import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { TrendDelta } from "./types";

interface TrendIndicatorProps {
  delta: TrendDelta;
  size?: "sm" | "md";
  invertColor?: boolean;
  showPercent?: boolean;
  showValue?: boolean;
}

const TREND_COLORS = {
  up: { normal: "text-emerald-600 dark:text-emerald-400", inverted: "text-red-600 dark:text-red-400" },
  down: { normal: "text-red-600 dark:text-red-400", inverted: "text-emerald-600 dark:text-emerald-400" },
  flat: { normal: "text-muted-foreground", inverted: "text-muted-foreground" },
};

export function TrendIndicator({ delta, size = "sm", invertColor = false, showPercent = true, showValue = false }: TrendIndicatorProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const colorKey = invertColor ? "inverted" : "normal";
  const color = TREND_COLORS[delta.direction][colorKey];

  const Icon = delta.direction === "up" ? ArrowUpRight
    : delta.direction === "down" ? ArrowDownRight
    : Minus;

  return (
    <span className={`inline-flex items-center gap-0.5 ${textSize} ${color} tabular-nums`} data-testid="trend-indicator">
      <Icon className={iconSize} />
      {showPercent && delta.percent !== null && (
        <span>{delta.percent > 0 ? "+" : ""}{delta.percent.toFixed(1)}%</span>
      )}
      {showValue && delta.value !== null && (
        <span>{delta.value > 0 ? "+" : ""}{delta.value.toFixed(1)}</span>
      )}
    </span>
  );
}

export function TrendIcon({ direction, className = "h-3.5 w-3.5" }: { direction: string; className?: string }) {
  if (direction === "up") return <TrendingUp className={`${className} text-emerald-500`} />;
  if (direction === "down") return <TrendingDown className={`${className} text-red-500`} />;
  return <Minus className={`${className} text-muted-foreground`} />;
}
