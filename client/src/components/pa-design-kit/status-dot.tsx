import { cn } from "@/lib/utils";
import type { StatusLevel } from "./types";

const DOT_COLORS: Record<StatusLevel, string> = {
  healthy: "bg-emerald-500",
  degraded: "bg-amber-500",
  critical: "bg-red-500",
  offline: "bg-muted-foreground",
  unknown: "bg-muted-foreground/50",
};

const DOT_LABELS: Record<StatusLevel, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  critical: "Critical",
  offline: "Offline",
  unknown: "Unknown",
};

interface StatusDotProps {
  status: StatusLevel;
  size?: "sm" | "md";
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ status, size = "sm", showLabel = false, pulse = false, className }: StatusDotProps) {
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";
  const color = DOT_COLORS[status] || DOT_COLORS.unknown;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} data-testid={`status-dot-${status}`}>
      <span className={cn("rounded-full flex-shrink-0", dotSize, color, pulse && status !== "offline" && "animate-pulse")} />
      {showLabel && <span className="text-xs text-muted-foreground">{DOT_LABELS[status]}</span>}
    </span>
  );
}
