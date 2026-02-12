import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  SlidersHorizontal,
  BarChart3,
  Activity,
  Star,
  X,
} from "lucide-react";

interface MetricDefinition {
  key: string;
  label: string;
  category: string;
  unit?: string;
  defaultSelected?: boolean;
}

const METRIC_CATEGORIES: { name: string; icon: string; metrics: MetricDefinition[] }[] = [
  {
    name: "Workforce Composition",
    icon: "WC",
    metrics: [
      { key: "headcount", label: "Headcount", category: "Workforce Composition", unit: "employees", defaultSelected: true },
      { key: "fte_count", label: "FTE Count", category: "Workforce Composition", unit: "FTE" },
      { key: "contractor_ratio", label: "Contractor Ratio", category: "Workforce Composition", unit: "%" },
      { key: "avg_tenure", label: "Avg Tenure", category: "Workforce Composition", unit: "years" },
      { key: "diversity_index", label: "Diversity Index", category: "Workforce Composition", unit: "score" },
      { key: "new_hire_rate", label: "New Hire Rate", category: "Workforce Composition", unit: "%" },
      { key: "span_of_control", label: "Span of Control", category: "Workforce Composition", unit: "ratio" },
      { key: "vacancy_rate", label: "Vacancy Rate", category: "Workforce Composition", unit: "%" },
      { key: "workforce_age_avg", label: "Avg Workforce Age", category: "Workforce Composition", unit: "years" },
    ],
  },
  {
    name: "Compensation & Value",
    icon: "CV",
    metrics: [
      { key: "avg_salary", label: "Avg Salary", category: "Compensation & Value", unit: "$" },
      { key: "compa_ratio", label: "Compa-Ratio", category: "Compensation & Value", unit: "ratio", defaultSelected: true },
      { key: "pay_equity_ratio", label: "Pay Equity Ratio", category: "Compensation & Value", unit: "ratio" },
      { key: "benefits_cost_per_ee", label: "Benefits Cost / Employee", category: "Compensation & Value", unit: "$" },
      { key: "total_rewards", label: "Total Rewards", category: "Compensation & Value", unit: "$" },
      { key: "salary_range_penetration", label: "Salary Range Penetration", category: "Compensation & Value", unit: "%" },
      { key: "bonus_payout_pct", label: "Bonus Payout %", category: "Compensation & Value", unit: "%" },
      { key: "compensation_growth", label: "Compensation Growth", category: "Compensation & Value", unit: "%" },
    ],
  },
  {
    name: "Popular Filters",
    icon: "PF",
    metrics: [
      { key: "turnover_rate", label: "Turnover Rate", category: "Popular Filters", unit: "%", defaultSelected: true },
      { key: "department", label: "Department", category: "Popular Filters" },
      { key: "region", label: "Region", category: "Popular Filters", defaultSelected: true },
      { key: "job_level", label: "Job Level", category: "Popular Filters" },
      { key: "time_to_fill", label: "Time to Fill", category: "Popular Filters", unit: "days" },
      { key: "engagement_score", label: "Engagement Score", category: "Popular Filters", unit: "score", defaultSelected: true },
      { key: "employee_satisfaction", label: "Employee Satisfaction", category: "Popular Filters", unit: "score" },
      { key: "retention_rate", label: "Retention Rate", category: "Popular Filters", unit: "%" },
      { key: "absenteeism_rate", label: "Absenteeism Rate", category: "Popular Filters", unit: "%" },
    ],
  },
  {
    name: "Attrition & Movement",
    icon: "AM",
    metrics: [
      { key: "voluntary_turnover", label: "Voluntary Turnover", category: "Attrition & Movement", unit: "%" },
      { key: "involuntary_turnover", label: "Involuntary Turnover", category: "Attrition & Movement", unit: "%" },
      { key: "internal_mobility_rate", label: "Internal Mobility Rate", category: "Attrition & Movement", unit: "%" },
      { key: "promotion_rate", label: "Promotion Rate", category: "Attrition & Movement", unit: "%", defaultSelected: true },
      { key: "regrettable_attrition", label: "Regrettable Attrition", category: "Attrition & Movement", unit: "%" },
      { key: "flight_risk_pct", label: "Flight Risk %", category: "Attrition & Movement", unit: "%" },
    ],
  },
  {
    name: "Performance & Development",
    icon: "PD",
    metrics: [
      { key: "performance_rating_avg", label: "Avg Performance Rating", category: "Performance & Development", unit: "score" },
      { key: "goal_completion_rate", label: "Goal Completion Rate", category: "Performance & Development", unit: "%" },
      { key: "training_hours_avg", label: "Training Hours (Avg)", category: "Performance & Development", unit: "hrs" },
      { key: "productivity_index", label: "Productivity Index", category: "Performance & Development", unit: "index" },
      { key: "high_performer_pct", label: "High Performer %", category: "Performance & Development", unit: "%" },
      { key: "review_completion_rate", label: "Review Completion Rate", category: "Performance & Development", unit: "%" },
    ],
  },
  {
    name: "Engagement & Culture",
    icon: "EC",
    metrics: [
      { key: "enps", label: "eNPS", category: "Engagement & Culture", unit: "score" },
      { key: "survey_response_rate", label: "Survey Response Rate", category: "Engagement & Culture", unit: "%" },
      { key: "recognition_rate", label: "Recognition Rate", category: "Engagement & Culture", unit: "per 100" },
      { key: "manager_effectiveness", label: "Manager Effectiveness", category: "Engagement & Culture", unit: "score" },
      { key: "dei_index", label: "DEI Index", category: "Engagement & Culture", unit: "score" },
      { key: "culture_alignment", label: "Culture Alignment", category: "Engagement & Culture", unit: "score" },
    ],
  },
];

const ALL_METRICS = METRIC_CATEGORIES.flatMap((c) => c.metrics);
const DEFAULT_SELECTED = new Set(ALL_METRICS.filter((m) => m.defaultSelected).map((m) => m.key));

function generateMockValue(key: string): { value: number; change: number; unit: string } {
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed += key.charCodeAt(i);
  const rand = (min: number, max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };

  const def = ALL_METRICS.find((m) => m.key === key);
  const unit = def?.unit || "";

  if (unit === "%") return { value: Math.round(rand(5, 95) * 10) / 10, change: Math.round(rand(-5, 5) * 10) / 10, unit };
  if (unit === "$") return { value: Math.round(rand(40000, 150000)), change: Math.round(rand(-3, 8) * 10) / 10, unit };
  if (unit === "score") return { value: Math.round(rand(20, 95) * 10) / 10, change: Math.round(rand(-8, 8) * 10) / 10, unit };
  if (unit === "ratio") return { value: Math.round(rand(0.7, 1.3) * 100) / 100, change: Math.round(rand(-5, 5) * 100) / 100, unit };
  if (unit === "employees") return { value: Math.round(rand(500, 15000)), change: Math.round(rand(-2, 5) * 10) / 10, unit };
  if (unit === "days") return { value: Math.round(rand(15, 90)), change: Math.round(rand(-10, 10) * 10) / 10, unit };
  if (unit === "years") return { value: Math.round(rand(2, 15) * 10) / 10, change: Math.round(rand(-1, 1) * 10) / 10, unit };
  if (unit === "hrs") return { value: Math.round(rand(10, 60) * 10) / 10, change: Math.round(rand(-5, 10) * 10) / 10, unit };
  if (unit === "index") return { value: Math.round(rand(60, 110) * 10) / 10, change: Math.round(rand(-3, 3) * 10) / 10, unit };
  if (unit === "FTE") return { value: Math.round(rand(400, 12000)), change: Math.round(rand(-2, 4) * 10) / 10, unit };
  if (unit === "per 100") return { value: Math.round(rand(5, 40) * 10) / 10, change: Math.round(rand(-3, 6) * 10) / 10, unit };
  return { value: Math.round(rand(10, 1000)), change: Math.round(rand(-5, 5) * 10) / 10, unit };
}

function MiniSparkline({ seed }: { seed: string }) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  const points: number[] = [];
  for (let i = 0; i < 12; i++) {
    s = (s * 9301 + 49297) % 233280;
    points.push(30 + (s / 233280) * 40);
  }
  const w = 80;
  const h = 32;
  const stepX = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${i * stepX},${h - (p / 100) * h}`).join(" ");
  const trending = points[points.length - 1] > points[0];
  const color = trending ? "#22c55e" : "#ef4444";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function formatValue(value: number, unit: string): string {
  if (unit === "$") return `$${value.toLocaleString()}`;
  if (unit === "%") return `${value}%`;
  if (unit === "employees" || unit === "FTE") return value.toLocaleString();
  return String(value);
}

function TickerCard({ metricKey }: { metricKey: string }) {
  const def = ALL_METRICS.find((m) => m.key === metricKey);
  const { value, change, unit } = generateMockValue(metricKey);
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card className="hover-elevate" data-testid={`ticker-card-${metricKey}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate" data-testid={`ticker-label-${metricKey}`}>
              {def?.label || metricKey}
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1" data-testid={`ticker-value-${metricKey}`}>
              {formatValue(value, unit)}
            </p>
          </div>
          <MiniSparkline seed={metricKey} />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-0.5 text-sm font-medium tabular-nums ${
              isPositive ? "text-green-600 dark:text-green-400" : isNegative ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
            }`}
            data-testid={`ticker-change-${metricKey}`}
          >
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : isNegative ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            <span>{isPositive ? "+" : ""}{change}%</span>
          </div>
          <span className="text-xs text-muted-foreground">vs prior period</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ScreenerPanel({
  selected,
  onToggle,
  onClose,
}: {
  selected: Set<string>;
  onToggle: (key: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return METRIC_CATEGORIES;
    const q = search.toLowerCase();
    return METRIC_CATEGORIES.map((cat) => ({
      ...cat,
      metrics: cat.metrics.filter(
        (m) => m.label.toLowerCase().includes(q) || m.key.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.metrics.length > 0);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-lg font-semibold" data-testid="text-screener-title">
          Choose filters to screen Metrics
        </p>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Find Filters"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-screener-search"
          />
        </div>
      </div>

      {filteredCategories.map((cat) => (
        <div key={cat.name} data-testid={`screener-category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}>
          <div className="flex items-center gap-2 mb-3">
            <p className="font-semibold text-sm">{cat.name}</p>
            <Badge variant="secondary" className="text-xs">{cat.icon}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {cat.metrics.map((metric) => (
              <label
                key={metric.key}
                className="flex items-center gap-2 py-1 cursor-pointer"
                data-testid={`screener-item-${metric.key}`}
              >
                <Checkbox
                  checked={selected.has(metric.key)}
                  onCheckedChange={() => onToggle(metric.key)}
                  data-testid={`checkbox-metric-${metric.key}`}
                />
                <span className="text-sm">{metric.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-2">
        <Button onClick={onClose} data-testid="button-screener-close">Close</Button>
      </div>
    </div>
  );
}

export function MetricMarketPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED));
  const [screenerOpen, setScreenerOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleWatchlist = (key: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedKeys = Array.from(selected);
  const watchlistKeys = selectedKeys.filter((k) => watchlist.has(k));

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold tracking-tight" data-testid="text-metric-market-title">
            MetricMarket
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Yahoo Finance-style HR metrics dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Activity className="h-3 w-3" />
            {selectedKeys.length} selected
          </Badge>
          <Dialog open={screenerOpen} onOpenChange={setScreenerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-open-screener">
                <SlidersHorizontal className="h-4 w-4" />
                Screener
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="sr-only">Metric Screener</DialogTitle>
                <DialogDescription className="sr-only">Choose which HR metrics to display on your dashboard</DialogDescription>
              </DialogHeader>
              <ScreenerPanel
                selected={selected}
                onToggle={toggle}
                onClose={() => setScreenerOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {watchlistKeys.length > 0 && (
        <div data-testid="section-watchlist">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-yellow-500" />
            <h2 className="text-sm font-semibold">Watchlist</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {watchlistKeys.map((key) => (
              <TickerCard key={key} metricKey={key} />
            ))}
          </div>
        </div>
      )}

      {selectedKeys.length === 0 ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No metrics selected. Open the screener to choose metrics to track.
            </p>
            <Button variant="outline" onClick={() => setScreenerOpen(true)} data-testid="button-empty-open-screener">
              Open Screener
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="text-sm font-semibold text-muted-foreground">
              All Metrics ({selectedKeys.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {selectedKeys.map((key) => {
              const isWatched = watchlist.has(key);
              return (
                <div key={key} className="relative group">
                  <TickerCard metricKey={key} />
                  <div
                    className="absolute top-1 right-1 flex items-center gap-0.5 group-hover:visible"
                    style={{ visibility: isWatched ? "visible" : "hidden" }}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleWatchlist(key)}
                      data-testid={`button-watchlist-${key}`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          isWatched ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggle(key)}
                      data-testid={`button-remove-${key}`}
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
