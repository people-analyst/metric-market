export interface TrendDelta {
  value: number | null;
  percent: number | null;
  direction: "up" | "down" | "flat";
}

export interface MetricTickerData {
  key: string;
  label: string;
  value: number | null;
  unitType: "percent" | "currency" | "count" | "ratio" | "score" | "days" | "custom";
  unitLabel?: string | null;
  delta?: TrendDelta;
  sparkline?: number[] | null;
  classification?: "Normal" | "Watch" | "Alert" | "Critical";
  confidence?: number;
}

export interface MetricCardData extends MetricTickerData {
  description?: string | null;
  domain?: string;
  category?: string;
  sampleSize?: number | null;
  dataQualityScore?: number | null;
  reasons?: string[] | null;
  tags?: string[] | null;
}

export interface IndexGaugeData {
  key: string;
  value: number;
  label: string;
  delta?: number | null;
  sparkline?: number[] | null;
}

export interface AlertRowData {
  key: string;
  label: string;
  value: number | null;
  unitType: string;
  classification: "Alert" | "Critical";
  delta?: TrendDelta;
  sparkline?: number[] | null;
}

export interface SectionHeaderMeta {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  metricCount: number;
  alertCount?: number;
}

export type StatusLevel = "healthy" | "degraded" | "critical" | "offline" | "unknown";
