import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChartType } from "@shared/schema";
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
} from "@/components/charts";

const CHART_COMPONENT_MAP: Record<ChartType, React.ComponentType<any>> = {
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
};

export interface CardWrapperProps {
  title: string;
  subtitle?: string;
  chartType: ChartType;
  chartProps: Record<string, any>;
  tags?: string[];
  sourceAttribution?: string;
  periodLabel?: string;
  className?: string;
}

export function CardWrapper({
  title,
  subtitle,
  chartType,
  chartProps,
  tags,
  sourceAttribution,
  periodLabel,
  className,
}: CardWrapperProps) {
  const ChartComponent = CHART_COMPONENT_MAP[chartType];

  if (!ChartComponent) {
    return (
      <Card className={className} data-testid="card-wrapper-error">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Unknown chart type: {chartType}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid={`card-wrapper-${chartType}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-1 pt-3 px-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground leading-tight truncate" data-testid="card-title">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate" data-testid="card-subtitle">{subtitle}</p>
          )}
        </div>
        {periodLabel && (
          <Badge variant="secondary" className="text-[10px] shrink-0" data-testid="card-period">
            {periodLabel}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-1">
        <div data-testid="card-chart-area">
          <ChartComponent {...chartProps} />
        </div>
        {(tags?.length || sourceAttribution) && (
          <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-border">
            {tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]" data-testid={`card-tag-${tag}`}>
                {tag}
              </Badge>
            ))}
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
