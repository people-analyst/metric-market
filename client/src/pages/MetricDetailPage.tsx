import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  Plus,
  Share2,
  Users,
  Calendar,
  MapPin,
  Globe,
  Briefcase,
} from "lucide-react";

function seeded(key: string) {
  let s = 0;
  for (let i = 0; i < key.length; i++) s += key.charCodeAt(i);
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateChartPoints(seed: string, count: number) {
  const rand = seeded(seed);
  const points: number[] = [];
  let val = 50 + rand() * 50;
  for (let i = 0; i < count; i++) {
    val += (rand() - 0.48) * 6;
    val = Math.max(10, Math.min(100, val));
    points.push(val);
  }
  return points;
}

const TIME_TABS = ["1M", "3M", "6M", "YTD", "1Y", "3Y", "MAX"];
const MONTH_LABELS = ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Jan"];

function LargeChart({ seed, positive }: { seed: string; positive: boolean }) {
  const points = generateChartPoints(seed, 60);
  const w = 600;
  const h = 200;
  const padT = 10;
  const padB = 25;
  const chartH = h - padT - padB;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = padT + chartH - ((p - min) / range) * chartH;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const color = positive ? "#22c55e" : "#ef4444";

  const yTicks = 5;
  const yLabels: string[] = [];
  for (let i = 0; i <= yTicks; i++) {
    yLabels.push((min + (range / yTicks) * i).toFixed(1));
  }

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="w-full" data-testid="chart-large">
      {yLabels.map((label, i) => {
        const y = padT + chartH - (i / yTicks) * chartH;
        return (
          <g key={i}>
            <line x1={0} y1={y} x2={w} y2={y} stroke="currentColor" strokeOpacity={0.08} />
            <text x={w - 2} y={y - 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.4}>
              {label}
            </text>
          </g>
        );
      })}
      {MONTH_LABELS.map((label, i) => {
        const x = (i / (MONTH_LABELS.length - 1)) * w;
        return (
          <text key={i} x={x} y={h - 4} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}>
            {label}
          </text>
        );
      })}
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

const FACT_SHEET_TAGS = ["Most tracked", "Workforce", "US operations", "Enterprise"];

const FACT_ROWS = [
  { label: "PREVIOUS PERIOD", value: "14.8%" },
  { label: "PERIOD RANGE", value: "12.1% - 16.3%" },
  { label: "YEAR RANGE", value: "11.4% - 18.7%" },
  { label: "TOTAL HEADCOUNT", value: "12,847" },
  { label: "AVG TENURE", value: "3.2 years" },
  { label: "MEDIAN COMP", value: "$97,240" },
  { label: "COST PER HIRE", value: "$4,129" },
  { label: "PRIMARY SOURCE", value: "HRIS" },
];

const TIMELINE_EVENTS = [
  { source: "People Analytics", date: "Jan 15, 2026", headline: "Voluntary turnover spikes after annual review cycle completion", changePct: "+2.1%", positive: false },
  { source: "Talent Acq", date: "Nov 8, 2025", headline: "New referral bonus program launches, turnover stabilizes temporarily", changePct: "-1.4%", positive: true },
  { source: "Compensation", date: "Sep 22, 2025", headline: "Market adjustment cycle misses Q3 target, departures accelerate", changePct: "+3.8%", positive: false },
];

const FINANCIAL_ROWS = [
  { label: "Total Separations", value: "1,824", change: "+0.96%", positive: false },
  { label: "Voluntary Exits", value: "1,289", change: "+10.24%", positive: false },
  { label: "Involuntary Exits", value: "535", change: "-34.00%", positive: true },
  { label: "Regrettable Loss", value: "412", change: "-34.64%", positive: true },
  { label: "Avg Tenure at Exit", value: "2.8 yrs", change: "-31.57%", positive: false },
  { label: "Replacement Cost", value: "$7.52M", change: "-11.70%", positive: true },
  { label: "Time to Backfill", value: "42 days", change: "+8.30%", positive: false },
];

const RELATED_METRICS = [
  { ticker: "RET", color: "bg-emerald-600", name: "Retention Rate", value: "85.8%", changePct: "-1.30%", positive: false },
  { ticker: "FILL", color: "bg-cyan-600", name: "Time to Fill", value: "38 days", changePct: "+4.51%", positive: true },
  { ticker: "ENG", color: "bg-green-600", name: "Engagement Score", value: "78.5", changePct: "-1.30%", positive: false },
  { ticker: "COMP", color: "bg-amber-500", name: "Compa-Ratio", value: "0.98", changePct: "+4.51%", positive: true },
  { ticker: "FLIGHT", color: "bg-red-500", name: "Flight Risk %", value: "22.1%", changePct: "-1.30%", positive: false },
  { ticker: "HIRE", color: "bg-blue-600", name: "New Hire Rate", value: "8.4%", changePct: "+2.10%", positive: true },
];

const ALSO_TRACKED = [
  { ticker: "HC", color: "bg-blue-600", name: "Headcount", value: "12,847", changePct: "-0.82%", positive: false },
  { ticker: "PERF", color: "bg-purple-600", name: "Performance Avg", value: "3.84", changePct: "-0.41%", positive: false },
  { ticker: "PROMO", color: "bg-green-600", name: "Promotion Rate", value: "18.2%", changePct: "-0.42%", positive: false },
  { ticker: "TRAIN", color: "bg-teal-600", name: "Training Hours", value: "32.5h", changePct: "+1.37%", positive: true },
  { ticker: "ABS", color: "bg-orange-500", name: "Absenteeism", value: "4.8%", changePct: "-0.46%", positive: false },
  { ticker: "DEI", color: "bg-violet-600", name: "DEI Index", value: "0.72", changePct: "+0.40%", positive: true },
];

function TickerBadge({ ticker, color }: { ticker: string; color: string }) {
  return (
    <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 inline-block`}>
      {ticker}
    </span>
  );
}

export function MetricDetailPage() {
  const [activeTimeTab, setActiveTimeTab] = useState("1Y");
  const [finTab, setFinTab] = useState<"quarterly" | "annual">("quarterly");
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const [showCashFlow, setShowCashFlow] = useState(false);

  return (
    <div className="p-5 space-y-6" data-testid="page-metric-detail">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="cursor-pointer text-[#0f69ff]" data-testid="breadcrumb-home">HOME</span>
        <ChevronRight className="h-3 w-3" />
        <span className="cursor-pointer text-[#0f69ff]">TURN</span>
        <ChevronRight className="h-3 w-3" />
        <span>HRIS</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold" data-testid="text-metric-name">Turnover Rate (Voluntary)</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-follow">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Follow
          </Button>
          <Button variant="outline" size="sm" data-testid="button-share">
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 min-w-0 space-y-6">
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-bold tabular-nums" data-testid="text-big-value">14.2%</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums flex items-center gap-0.5">
                <TrendingDown className="h-3.5 w-3.5" />
                -1.13%
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">-1.6pp</span>
              <span className="text-sm text-muted-foreground">1Y</span>
            </div>
            <p className="text-xs text-muted-foreground">
              As of Feb 12, 2026 &middot; HRIS &middot; Monthly
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-3">
              {TIME_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTimeTab(tab)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    activeTimeTab === tab
                      ? "bg-[#e0f0ff] text-[#0f69ff] font-medium dark:bg-blue-900 dark:text-blue-300"
                      : "text-muted-foreground"
                  }`}
                  data-testid={`tab-time-${tab.toLowerCase()}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <LargeChart seed="turnover-rate-vol" positive={false} />
          </div>

          <div data-testid="section-timeline-events">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {TIMELINE_EVENTS.map((evt, i) => (
                <Card key={i} className="shrink-0 w-[220px] hover-elevate cursor-pointer" data-testid={`timeline-card-${i}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-muted-foreground">{evt.source}</span>
                      <span className="text-[10px] text-muted-foreground">{evt.date}</span>
                    </div>
                    <p className="text-xs font-medium leading-snug mb-2 line-clamp-3">{evt.headline}</p>
                    <span className={`text-xs font-medium tabular-nums flex items-center gap-0.5 ${
                      evt.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      {evt.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {evt.changePct} on that day
                    </span>
                  </CardContent>
                </Card>
              ))}
              <div className="shrink-0 flex items-center px-2">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div data-testid="section-financials">
            <h2 className="text-lg font-semibold mb-3">Metric Breakdown</h2>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm font-semibold">Attrition Details</h3>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setFinTab("quarterly")}
                    className={`text-xs pb-1 border-b-2 transition-colors ${
                      finTab === "quarterly"
                        ? "border-[#0f69ff] text-[#0f69ff] font-medium"
                        : "border-transparent text-muted-foreground"
                    }`}
                    data-testid="tab-fin-quarterly"
                  >
                    Quarterly
                  </button>
                  <button
                    onClick={() => setFinTab("annual")}
                    className={`text-xs pb-1 border-b-2 transition-colors ${
                      finTab === "annual"
                        ? "border-[#0f69ff] text-[#0f69ff] font-medium"
                        : "border-transparent text-muted-foreground"
                    }`}
                    data-testid="tab-fin-annual"
                  >
                    Annual
                  </button>
                </div>

                <div className="mb-4">
                  <BarChart seed={finTab === "quarterly" ? "q-attrition" : "a-attrition"} />
                </div>

                <div className="border-t border-border">
                  <div className="flex items-center justify-between gap-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="flex-1">Metric</span>
                    <span className="w-20 text-right">Q4 2025</span>
                    <span className="w-24 text-right">Y/Y Change</span>
                  </div>
                  {FINANCIAL_ROWS.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 py-2.5 border-t border-border"
                      data-testid={`fin-row-${row.label.toLowerCase().replace(/[\s/]+/g, "-")}`}
                    >
                      <span className="text-xs flex-1">{row.label}</span>
                      <span className="text-xs font-medium tabular-nums w-20 text-right">{row.value}</span>
                      <span className={`text-xs font-medium tabular-nums w-24 text-right flex items-center justify-end gap-0.5 ${
                        row.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}>
                        {row.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {row.change}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowBalanceSheet(!showBalanceSheet)}
                  className="flex items-center justify-between w-full py-3 border-t border-border mt-2"
                  data-testid="toggle-retention-drivers"
                >
                  <span className="text-sm font-medium">Retention Drivers</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showBalanceSheet ? "rotate-180" : ""}`} />
                </button>
                {showBalanceSheet && (
                  <div className="pb-3 space-y-0">
                    {[
                      { label: "Manager Quality Score", value: "3.9 / 5", change: "+4.20%", positive: true },
                      { label: "Career Development Rating", value: "3.5 / 5", change: "-8.11%", positive: false },
                      { label: "Compensation Competitiveness", value: "0.96", change: "+2.10%", positive: true },
                      { label: "Workload Balance", value: "3.2 / 5", change: "-5.40%", positive: false },
                      { label: "Team Cohesion Index", value: "78.4", change: "+1.30%", positive: true },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-4 py-2.5 border-t border-border">
                        <span className="text-xs flex-1">{row.label}</span>
                        <span className="text-xs font-medium tabular-nums w-20 text-right">{row.value}</span>
                        <span className={`text-xs font-medium tabular-nums w-24 text-right flex items-center justify-end gap-0.5 ${
                          row.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}>
                          {row.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {row.change}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowCashFlow(!showCashFlow)}
                  className="flex items-center justify-between w-full py-3 border-t border-border"
                  data-testid="toggle-exit-analysis"
                >
                  <span className="text-sm font-medium">Exit Analysis</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showCashFlow ? "rotate-180" : ""}`} />
                </button>
                {showCashFlow && (
                  <div className="pb-3 space-y-0">
                    {[
                      { label: "Top Reason: Better Opportunity", value: "34.2%", change: "+6.10%", positive: false },
                      { label: "Top Reason: Compensation", value: "28.1%", change: "+3.40%", positive: false },
                      { label: "Top Reason: Management", value: "18.5%", change: "-2.20%", positive: true },
                      { label: "90-Day New Hire Attrition", value: "8.4%", change: "+1.80%", positive: false },
                      { label: "High Performer Loss Rate", value: "6.2%", change: "+0.90%", positive: false },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-4 py-2.5 border-t border-border">
                        <span className="text-xs flex-1">{row.label}</span>
                        <span className="text-xs font-medium tabular-nums w-20 text-right">{row.value}</span>
                        <span className={`text-xs font-medium tabular-nums w-24 text-right flex items-center justify-end gap-0.5 ${
                          row.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}>
                          {row.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {row.change}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div data-testid="section-discover-more">
            <h2 className="text-lg font-semibold mb-1">Discover more</h2>
            <p className="text-xs text-muted-foreground mb-3">You may be interested in</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {RELATED_METRICS.map((m, i) => (
                <Card key={m.ticker + i} className="shrink-0 w-[150px] hover-elevate cursor-pointer" data-testid={`discover-card-${i}`}>
                  <CardContent className="p-3">
                    <TickerBadge ticker={m.ticker} color={m.color} />
                    <p className="text-xs font-medium mt-2 mb-1 leading-tight">{m.name}</p>
                    <p className="text-sm font-bold tabular-nums">{m.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs font-medium tabular-nums ${m.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {m.positive ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                        {m.changePct}
                      </span>
                      <PlusCircle className="h-3.5 w-3.5 text-muted-foreground ml-auto cursor-pointer" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="shrink-0 flex items-center px-2">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div data-testid="section-also-tracked">
            <h2 className="text-sm font-semibold mb-3">People also track</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {ALSO_TRACKED.map((m, i) => (
                <Card key={m.ticker + i} className="shrink-0 w-[150px] hover-elevate cursor-pointer" data-testid={`also-card-${i}`}>
                  <CardContent className="p-3">
                    <TickerBadge ticker={m.ticker} color={m.color} />
                    <p className="text-xs font-medium mt-2 mb-1 leading-tight">{m.name}</p>
                    <p className="text-sm font-bold tabular-nums">{m.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs font-medium tabular-nums ${m.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {m.positive ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                        {m.changePct}
                      </span>
                      <PlusCircle className="h-3.5 w-3.5 text-muted-foreground ml-auto cursor-pointer" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="shrink-0 flex items-center px-2">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <Card data-testid="section-fact-sheet">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                {FACT_SHEET_TAGS.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
              <div className="space-y-0">
                {FACT_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2 py-2.5 border-b border-border last:border-b-0"
                    data-testid={`fact-${row.label.toLowerCase().replace(/[\s/]+/g, "-")}`}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-semibold tabular-nums text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="section-about">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">About</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Voluntary turnover rate measures the percentage of employees who choose to leave
                the organization during a given period. It is a critical workforce health indicator
                that reflects employee satisfaction, compensation competitiveness, career development
                opportunities, and overall organizational culture. High voluntary turnover often signals
                systemic issues in management quality, compensation alignment, or growth pathways.
                This metric excludes involuntary separations (layoffs, terminations) and focuses on
                resignations and retirements. Industry benchmarks typically range from 10-15% for
                technology companies.
              </p>
              <div className="space-y-0 border-t border-border">
                <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Owner</span>
                  </div>
                  <span className="text-xs font-medium text-[#0f69ff]">People Analytics Team</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Tracking Since</span>
                  </div>
                  <span className="text-xs font-medium">Jan 2019</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Scope</span>
                  </div>
                  <span className="text-xs font-medium text-right">Global, All BUs</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Source</span>
                  </div>
                  <span className="text-xs font-medium text-[#0f69ff]">HRIS</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Population</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">12,847</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BarChart({ seed }: { seed: string }) {
  const rand = seeded(seed);
  const periods = seed.startsWith("q") ? ["Q1 '24", "Q2 '24", "Q3 '24", "Q4 '24", "Q1 '25"] : ["2021", "2022", "2023", "2024", "2025"];
  const w = 500;
  const h = 120;
  const padB = 20;
  const chartH = h - padB - 5;
  const barW = 24;
  const gap = w / periods.length;

  const data = periods.map(() => ({
    primary: 40 + rand() * 50,
    secondary: 10 + rand() * 25,
  }));
  const maxVal = Math.max(...data.map((d) => d.primary));

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="w-full" data-testid="chart-bar">
      {data.map((d, i) => {
        const x = gap * i + gap / 2;
        const h1 = (d.primary / maxVal) * chartH;
        const h2 = (d.secondary / maxVal) * chartH;
        return (
          <g key={i}>
            <rect x={x - barW / 2 - 2} y={5 + chartH - h1} width={barW / 2} height={h1} rx={2} fill="#0f69ff" />
            <rect x={x + 2} y={5 + chartH - h2} width={barW / 2} height={h2} rx={2} fill="#f59e0b" />
            <text x={x} y={h - 4} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.5}>
              {periods[i]}
            </text>
          </g>
        );
      })}
      <g>
        <rect x={w - 100} y={2} width={8} height={8} rx={2} fill="#0f69ff" />
        <text x={w - 88} y={9} fontSize={8} fill="currentColor" opacity={0.5}>Voluntary</text>
        <rect x={w - 48} y={2} width={8} height={8} rx={2} fill="#f59e0b" />
        <text x={w - 36} y={9} fontSize={8} fill="currentColor" opacity={0.5}>Involuntary</text>
      </g>
    </svg>
  );
}
