import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { ComponentType as AppComponentType, CardBundle } from "@shared/schema";
import {
  ConfidenceBandChart,
  AlluvialChart,
  WaffleBarChart,
  BulletBarChart,
  SlopeComparisonChart,
  BubbleScatterChart,
  BoxWhiskerChart,
  StripTimelineChart,
  WafflePercentChart,
  HeatmapChart,
  StripDotChart,
  MultiLineChart,
  TileCartogramChart,
  TimelineMilestoneChart,
  ControlChart,
  DendrogramChart,
  RadialBarChart,
  BumpChart,
  SparklineRowsChart,
  StackedAreaChart,
  RangeStripChart,
  RangeStripAlignedChart,
  InteractiveRangeStripChart,
} from "@/components/charts";
import { RangeBuilderControl } from "@/components/controls/RangeBuilderControl";
import { RangeTargetBulletChart } from "@/components/charts/RangeTargetBulletChart";

const CHART_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  confidence_band: ConfidenceBandChart,
  alluvial: AlluvialChart,
  waffle_bar: WaffleBarChart,
  bullet_bar: BulletBarChart,
  slope_comparison: SlopeComparisonChart,
  bubble_scatter: BubbleScatterChart,
  box_whisker: BoxWhiskerChart,
  strip_timeline: StripTimelineChart,
  waffle_percent: WafflePercentChart,
  heatmap: HeatmapChart,
  strip_dot: StripDotChart,
  multi_line: MultiLineChart,
  tile_cartogram: TileCartogramChart,
  timeline_milestone: TimelineMilestoneChart,
  control: ControlChart,
  dendrogram: DendrogramChart,
  radial_bar: RadialBarChart,
  bump: BumpChart,
  sparkline_rows: SparklineRowsChart,
  stacked_area: StackedAreaChart,
  range_strip: RangeStripChart,
  range_strip_aligned: RangeStripAlignedChart,
  interactive_range_strip: InteractiveRangeStripChart,
  range_target_bullet: RangeTargetBulletChart,
  range_builder: RangeBuilderControl,
};

export interface CardWrapperProps {
  title: string;
  subtitle?: string;
  chartType?: AppComponentType;
  bundleId?: string;
  chartProps?: Record<string, any>;
  tags?: string[];
  sourceAttribution?: string;
  periodLabel?: string;
  refreshStatus?: string;
  importance?: number | null;
  significance?: number | null;
  relevance?: number | null;
  className?: string;
}

export function CardWrapper({
  title,
  subtitle,
  chartType,
  bundleId,
  chartProps,
  tags,
  sourceAttribution,
  periodLabel,
  refreshStatus,
  importance,
  significance,
  relevance,
  className,
}: CardWrapperProps) {
  const { data: bundles = [] } = useQuery<CardBundle[]>({
    queryKey: ["/api/bundles"],
    enabled: !!bundleId && !chartType,
  });

  const resolvedChartType = chartType || (bundleId ? bundles.find((b) => b.id === bundleId)?.chartType as AppComponentType : undefined);
  const bundle = bundleId ? bundles.find((b) => b.id === bundleId) : undefined;
  const resolvedProps = chartProps || (bundle?.exampleData as Record<string, any>) || {};

  if (!resolvedChartType) {
    return (
      <Card className={className} data-testid="card-wrapper-error">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {bundleId ? "Loading bundle..." : "No chart type specified"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = CHART_COMPONENT_MAP[resolvedChartType];

  if (!ChartComponent) {
    return (
      <Card className={className} data-testid="card-wrapper-error">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Unknown chart type: {resolvedChartType}</p>
        </CardContent>
      </Card>
    );
  }

  const hasScoring = importance != null || significance != null || relevance != null;

  return (
    <Card className={className} data-testid={`card-wrapper-${resolvedChartType}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-1 pt-3 px-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-tight truncate" data-testid="card-title">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate" data-testid="card-subtitle">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {refreshStatus && refreshStatus !== "current" && (
            <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-800" data-testid="card-refresh-status">
              {refreshStatus}
            </Badge>
          )}
          {periodLabel && (
            <Badge variant="secondary" className="text-[10px]" data-testid="card-period">
              {periodLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-1">
        <div data-testid="card-chart-area">
          <ChartComponent {...resolvedProps} />
        </div>
        {(tags?.length || sourceAttribution || hasScoring) && (
          <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-border">
            {tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]" data-testid={`card-tag-${tag}`}>
                {tag}
              </Badge>
            ))}
            {hasScoring && (
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground" data-testid="card-scoring">
                {importance != null && <span title="Importance">I:{importance}</span>}
                {significance != null && <span title="Significance">S:{significance}</span>}
                {relevance != null && <span title="Relevance">R:{relevance}</span>}
              </div>
            )}
            {sourceAttribution && (
              <span className="text-[10px] text-muted-foreground ml-auto" data-testid="card-source">
                {sourceAttribution}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { CHART_COMPONENT_MAP };
