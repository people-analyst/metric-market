import { cn } from "@/lib/utils";
import { Check, Circle, AlertTriangle } from "lucide-react";

export interface WorkflowStep {
  id?: string;
  label: string;
  status: "complete" | "active" | "pending" | "skipped" | "error";
  icon?: any;
}

interface WorkflowStepsProps {
  steps: WorkflowStep[];
  compact?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const statusStyles: Record<WorkflowStep["status"], { dot: string; line: string; text: string }> = {
  complete: {
    dot: "bg-emerald-500 text-white dark:bg-emerald-600",
    line: "bg-emerald-500 dark:bg-emerald-600",
    text: "text-foreground",
  },
  active: {
    dot: "bg-primary text-primary-foreground ring-2 ring-primary/30",
    line: "bg-muted",
    text: "text-foreground font-semibold",
  },
  pending: {
    dot: "bg-muted text-muted-foreground",
    line: "bg-muted",
    text: "text-muted-foreground",
  },
  skipped: {
    dot: "bg-muted/50 text-muted-foreground/50",
    line: "bg-muted/50",
    text: "text-muted-foreground/50 line-through",
  },
  error: {
    dot: "bg-destructive text-destructive-foreground",
    line: "bg-destructive/40",
    text: "text-destructive",
  },
};

export function WorkflowSteps({ steps, compact = false, size = "md", className }: WorkflowStepsProps) {
  const isSmall = size === "sm" || compact;

  return (
    <div className={cn("flex items-center gap-0", className)} data-testid="workflow-steps">
      {steps.map((step, i) => {
        const styles = statusStyles[step.status];
        const IconComp = step.icon;
        const isLast = i === steps.length - 1;
        const stepKey = step.id || `step-${i}`;

        const firstNonComplete = steps.findIndex(
          (s) => s.status !== "complete"
        );
        const lineCompleted = firstNonComplete === -1 || i < firstNonComplete;

        return (
          <div key={stepKey} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  isSmall ? "w-5 h-5" : "w-6 h-6",
                  styles.dot,
                )}
                data-testid={`workflow-step-dot-${i}`}
              >
                {step.status === "complete" ? (
                  <Check className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
                ) : step.status === "error" ? (
                  <AlertTriangle className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
                ) : IconComp ? (
                  <IconComp className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
                ) : (
                  <Circle className={isSmall ? "h-2 w-2" : "h-2.5 w-2.5"} />
                )}
              </div>
              {!isSmall && (
                <span className={cn("text-xs whitespace-nowrap", styles.text)}>
                  {step.label}
                </span>
              )}
              {isSmall && (
                <span className={cn("text-[10px] whitespace-nowrap leading-tight", styles.text)}>
                  {step.label}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 transition-colors",
                  isSmall ? "w-4 mx-0.5" : "w-8 mx-1",
                  lineCompleted ? statusStyles.complete.line : statusStyles.pending.line,
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
