export function formatMetricValue(value: number | null, unitType: string, unitLabel?: string | null): string {
  if (value === null || value === undefined) return "\u2014";
  switch (unitType) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "currency":
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    case "count":
      return value >= 10000
        ? `${(value / 1000).toFixed(1)}k`
        : value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    case "ratio":
      return value.toFixed(2);
    case "score":
      return value.toFixed(1);
    case "days":
      return `${value.toFixed(0)}d`;
    case "custom":
      return unitLabel ? `${value.toFixed(1)} ${unitLabel}` : value.toFixed(2);
    default:
      return value.toFixed(2);
  }
}

export const CLASSIFICATION_STYLES: Record<string, string> = {
  Normal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Watch: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Alert: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};
