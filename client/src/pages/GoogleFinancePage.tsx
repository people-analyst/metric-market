import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  PlusCircle,
  BarChart3,
  Calendar,
  Eye,
} from "lucide-react";
import { OrgMetricCard } from "@/components/OrgMetricCard";
import { ResearchCard } from "@/components/ResearchCard";
import { AnalysisSummaryCard } from "@/components/AnalysisSummaryCard";
import { ActionPlanCard } from "@/components/ActionPlanCard";
import { CompetitiveIntelCard } from "@/components/CompetitiveIntelCard";
import { MetricTicker, TrendIndicator, SectionHeader, formatMetricValue, MetricCard } from "@/components/pa-design-kit";
import type { MetricTickerData, MetricCardData } from "@/components/pa-design-kit";

function seeded(key: string) {
  let s = 0;
  for (let i = 0; i < key.length; i++) s += key.charCodeAt(i);
  return (min: number, max: number) => {
    s = (s * 9301 + 49297) % 233280;
    return min + (s / 233280) * (max - min);
  };
}

const MARKET_TABS = ["All", "Workforce", "Compensation", "Performance", "Attrition", "Engagement"];

const INDEX_TICKERS: MetricTickerData[] = [
  { key: "headcount", label: "Headcount", value: 12847, unitType: "count", delta: { value: 72, percent: 0.56, direction: "up" } },
  { key: "turnover", label: "Turnover", value: 14.2, unitType: "percent", delta: { value: -1.6, percent: -1.13, direction: "down" } },
  { key: "engagement", label: "Engagement", value: 78.5, unitType: "score", delta: { value: 0.87, percent: 1.11, direction: "up" } },
  { key: "enps", label: "eNPS", value: 32, unitType: "score", delta: { value: -0.02, percent: -0.07, direction: "down" } },
  { key: "compa-ratio", label: "Compa-Ratio", value: 0.98, unitType: "ratio", delta: { value: -0.002, percent: -0.20, direction: "down" } },
];

interface SuggestedMetric {
  ticker: string;
  color: string;
  name: string;
  numericValue: number;
  unitType: "percent" | "currency" | "count" | "ratio" | "score" | "days" | "custom";
  delta: { value: number | null; percent: number | null; direction: "up" | "down" | "flat" };
}

const SUGGESTED_METRICS: SuggestedMetric[] = [
  { ticker: "HC", color: "bg-blue-600", name: "Headcount (Global)", numericValue: 12847, unitType: "count", delta: { value: 72, percent: 0.56, direction: "up" } },
  { ticker: "TURN", color: "bg-red-500", name: "Turnover Rate", numericValue: 14.2, unitType: "percent", delta: { value: -1.6, percent: -1.13, direction: "down" } },
  { ticker: "COMP", color: "bg-amber-500", name: "Avg Compensation", numericValue: 97240, unitType: "currency", delta: { value: -800, percent: 0.82, direction: "up" } },
  { ticker: "PERF", color: "bg-green-600", name: "Performance Rating (Avg)", numericValue: 3.84, unitType: "score", delta: { value: 0.12, percent: 0.62, direction: "up" } },
  { ticker: "DIV", color: "bg-purple-600", name: "Diversity Index", numericValue: 0.72, unitType: "ratio", delta: { value: 0.01, percent: 0.52, direction: "up" } },
  { ticker: "FILL", color: "bg-cyan-600", name: "Time to Fill", numericValue: 38, unitType: "days", delta: { value: -2, percent: 0.40, direction: "up" } },
];

const TREND_TABS = ["Most active", "Gainers", "Losers"];

interface TrendItem {
  ticker: string;
  color: string;
  name: string;
  description?: string;
  source?: string;
  value: string;
  changePct: string;
  positive: boolean;
}

const TREND_DATA: Record<string, TrendItem[]> = {
  "Most active": [
    { ticker: "HC", color: "bg-blue-600", name: "Headcount (Global)", description: "Total workforce grew 2.3% this quarter driven by engineering and sales hires", source: "HRIS", value: "12,847", changePct: "+2.30%", positive: true },
    { ticker: "TURN", color: "bg-red-500", name: "Turnover Rate", description: "Voluntary turnover decreased following retention initiatives launched in Q3", source: "Analytics", value: "14.2%", changePct: "-1.13%", positive: false },
    { ticker: "COMP", color: "bg-amber-500", name: "Avg Compensation", description: "Market adjustment cycle completed, median compa-ratio now at target", source: "Comp Team", value: "$97,240", changePct: "+3.19%", positive: true },
    { ticker: "ENG", color: "bg-green-600", name: "Engagement Score", description: "Pulse survey results show improvement in manager effectiveness scores", source: "Survey", value: "78.5", changePct: "+6.14%", positive: true },
    { ticker: "FILL", color: "bg-cyan-600", name: "Time to Fill", description: "Recruiting efficiency improved with new ATS workflow automation", source: "Talent Acq", value: "38d", changePct: "-1.30%", positive: false },
    { ticker: "DEI", color: "bg-purple-600", name: "DEI Index", description: "Diversity representation increased across leadership levels", source: "DEI Office", value: "0.72", changePct: "+4.51%", positive: true },
  ],
  "Gainers": [
    { ticker: "PROMO", color: "bg-green-600", name: "Promotion Rate", value: "18.2%", changePct: "+14.26%", positive: true },
    { ticker: "TRAIN", color: "bg-teal-600", name: "Training Hours (Avg)", value: "32.5h", changePct: "+13.19%", positive: true },
    { ticker: "MOBIL", color: "bg-blue-600", name: "Internal Mobility Rate", value: "11.4%", changePct: "+6.14%", positive: true },
    { ticker: "RET", color: "bg-emerald-600", name: "Retention Rate", value: "89.1%", changePct: "+4.51%", positive: true },
  ],
  "Losers": [
    { ticker: "FLIGHT", color: "bg-red-500", name: "Flight Risk %", value: "22.1%", changePct: "+8.40%", positive: false },
    { ticker: "ABS", color: "bg-orange-500", name: "Absenteeism Rate", value: "4.8%", changePct: "+3.20%", positive: false },
    { ticker: "FILL", color: "bg-amber-600", name: "Time to Fill (Sales)", value: "52d", changePct: "+12.30%", positive: false },
    { ticker: "SAT", color: "bg-rose-500", name: "Employee Satisfaction", value: "68.2", changePct: "-2.10%", positive: false },
  ],
};

const MOST_FOLLOWED = [
  { ticker: "HC", color: "bg-blue-600", name: "Headcount", followers: "3.71K tracking", changePct: "-0.40%", positive: false },
  { ticker: "TURN", color: "bg-red-500", name: "Turnover Rate", followers: "2.16K tracking", changePct: "-1.40%", positive: false },
  { ticker: "COMP", color: "bg-amber-500", name: "Avg Compensation", followers: "1.84K tracking", changePct: "-0.42%", positive: false },
  { ticker: "ENG", color: "bg-green-600", name: "Engagement Score", followers: "1.74K tracking", changePct: "+0.82%", positive: true },
  { ticker: "PERF", color: "bg-purple-600", name: "Performance Avg", followers: "1.58K tracking", changePct: "+1.06%", positive: true },
  { ticker: "FILL", color: "bg-cyan-600", name: "Time to Fill", followers: "1.49K tracking", changePct: "-1.37%", positive: false },
];

type FeedCardType = "metric" | "research" | "analysis" | "action" | "competitive";

interface FeedCard {
  type: FeedCardType;
  source: string;
  time: string;
  headline: string;
  ticker?: string;
  tickerColor?: string;
  value?: string;
  changePct?: string;
  positive?: boolean;
  tags?: string[];
  rows?: { label: string; value: string }[];
  actions?: string[];
  citation?: string;
  riskLevel?: "low" | "medium" | "high";
  score?: number;
}

const FEED_TABS = ["All", "Metrics", "Research", "Analysis", "Actions", "Intel"];

const FEED_CARDS: FeedCard[] = [
  {
    type: "metric",
    source: "HRIS",
    time: "2 hours ago",
    headline: "Engineering headcount growth outpaces budget by 2.3%",
    ticker: "HC",
    tickerColor: "bg-blue-600",
    value: "12,847",
    changePct: "+2.30%",
    positive: true,
    rows: [
      { label: "Eng Headcount", value: "3,241" },
      { label: "Budget Target", value: "3,168" },
      { label: "Variance", value: "+73 (+2.3%)" },
    ],
  },
  {
    type: "research",
    source: "Journal of Applied Psychology",
    time: "Published 2025",
    headline: "Manager quality accounts for 70% of variance in team engagement scores",
    citation: "Buckingham & Goodall, 2025. J. Applied Psychology, 110(4), pp. 412-429.",
    tags: ["Peer Reviewed", "Engagement", "Management"],
    rows: [
      { label: "Sample Size", value: "n = 48,000" },
      { label: "Effect Size", value: "r = 0.71" },
      { label: "Confidence", value: "95% CI" },
    ],
  },
  {
    type: "analysis",
    source: "People Analytics",
    time: "4 hours ago",
    headline: "Q1 Attrition Risk Analysis: Sales org showing elevated voluntary turnover signals",
    ticker: "TURN",
    tickerColor: "bg-red-500",
    riskLevel: "high",
    rows: [
      { label: "Sales Turnover", value: "22.4% (vs 14.2% co. avg)" },
      { label: "Flight Risk Flags", value: "47 employees" },
      { label: "Est. Replacement Cost", value: "$3.2M" },
      { label: "Key Driver", value: "Comp below P50 market" },
    ],
  },
  {
    type: "action",
    source: "Retention Task Force",
    time: "6 hours ago",
    headline: "Action Plan: Sales Retention Initiative Q2",
    tags: ["In Progress", "High Priority"],
    actions: [
      "Market adjustment for 23 below-band roles",
      "Launch stay interviews for top performers",
      "Redesign Sales IC career ladder",
      "Manager coaching program enrollment",
    ],
    score: 35,
  },
  {
    type: "competitive",
    source: "Competitive Intelligence",
    time: "1 day ago",
    headline: "Industry benchmark: Tech sector median turnover dropped to 13.8%",
    tags: ["Benchmark", "Tech Sector"],
    rows: [
      { label: "Industry Median", value: "13.8%" },
      { label: "Our Rate", value: "14.2%" },
      { label: "Gap", value: "+0.4pp above median" },
      { label: "Peer Range", value: "11.2% - 18.7%" },
    ],
  },
  {
    type: "metric",
    source: "Compensation",
    time: "8 hours ago",
    headline: "Market salary data shows 3.2% increase in median SWE pay",
    ticker: "COMP",
    tickerColor: "bg-amber-500",
    value: "$97,240",
    changePct: "+3.19%",
    positive: true,
    rows: [
      { label: "Median Base (SWE)", value: "$142,000" },
      { label: "Compa-Ratio", value: "0.98" },
      { label: "Below Band", value: "12% of population" },
    ],
  },
  {
    type: "research",
    source: "Harvard Business Review",
    time: "Published Jan 2026",
    headline: "Remote-first companies report 23% lower voluntary turnover than hybrid peers",
    citation: "Bloom, Davis & Zheng, 2026. HBR Research, pp. 84-91.",
    tags: ["Peer Reviewed", "Remote Work", "Retention"],
    rows: [
      { label: "Remote Turnover", value: "9.8%" },
      { label: "Hybrid Turnover", value: "12.1%" },
      { label: "Onsite Turnover", value: "15.3%" },
    ],
  },
  {
    type: "analysis",
    source: "Workforce Planning",
    time: "1 day ago",
    headline: "DEI pipeline analysis: Leadership representation on track for 2026 targets",
    ticker: "DEI",
    tickerColor: "bg-purple-600",
    riskLevel: "low",
    rows: [
      { label: "Current Index", value: "0.72" },
      { label: "Target", value: "0.75 by Q4" },
      { label: "Trend", value: "+0.04 YoY" },
    ],
  },
  {
    type: "competitive",
    source: "Market Intelligence",
    time: "2 days ago",
    headline: "Competitor X announced 15% workforce reduction, talent pool expanding",
    tags: ["Alert", "Talent Market"],
    rows: [
      { label: "Competitor Size", value: "~8,200 employees" },
      { label: "Reduction", value: "~1,230 roles" },
      { label: "Relevant Roles", value: "340 eng, 180 product" },
      { label: "Opportunity", value: "High (skill overlap 78%)" },
    ],
  },
  {
    type: "action",
    source: "Learning & Development",
    time: "1 day ago",
    headline: "Action Plan: New Manager Training Cohort 2 Launch",
    tags: ["Scheduled", "Development"],
    actions: [
      "Enroll 45 newly promoted managers",
      "Assign executive mentors",
      "Schedule 360 feedback baseline",
      "Set 90-day check-in cadence",
    ],
    score: 72,
  },
];

const DISCOVER_CARDS: MetricCardData[] = [
  { key: "whi", label: "Workforce Health Index", value: 84.2, unitType: "score", delta: { value: null, percent: -1.30, direction: "down" } },
  { key: "tps", label: "Talent Pipeline Score", value: 71.8, unitType: "score", delta: { value: null, percent: -1.30, direction: "down" } },
  { key: "trv", label: "Total Rewards Value", value: 128500, unitType: "currency", delta: { value: null, percent: 4.51, direction: "up" } },
  { key: "ca", label: "Culture Alignment", value: 76.4, unitType: "score", delta: { value: null, percent: -1.30, direction: "down" } },
  { key: "pi", label: "Productivity Index", value: 92.1, unitType: "score", delta: { value: null, percent: 4.51, direction: "up" } },
  { key: "cr", label: "Contractor Ratio", value: 18.3, unitType: "percent", delta: { value: null, percent: -1.30, direction: "down" } },
];

function TickerBadge({ ticker, color }: { ticker: string; color: string }) {
  return (
    <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 inline-block`}>
      {ticker}
    </span>
  );
}

function FeedCardRenderer({ card }: { card: FeedCard }) {
  switch (card.type) {
    case "metric":
      return (
        <OrgMetricCard
          ticker={card.ticker!}
          tickerColor={card.tickerColor!}
          title={card.headline}
          value={card.value!}
          changePct={card.changePct!}
          positive={card.positive!}
          source={card.source}
          time={card.time}
          rows={card.rows}
        />
      );
    case "research":
      return (
        <ResearchCard
          title={card.headline}
          source={card.source}
          time={card.time}
          citation={card.citation!}
          tags={card.tags}
          rows={card.rows}
        />
      );
    case "analysis":
      return (
        <AnalysisSummaryCard
          title={card.headline}
          source={card.source}
          time={card.time}
          ticker={card.ticker}
          tickerColor={card.tickerColor}
          riskLevel={card.riskLevel!}
          rows={card.rows}
        />
      );
    case "action":
      return (
        <ActionPlanCard
          title={card.headline}
          source={card.source}
          time={card.time}
          tags={card.tags}
          actions={card.actions!.map((label, i) => ({
            label,
            completed: card.score ? i < Math.floor((card.score / 100) * card.actions!.length) : false,
          }))}
          progressPct={card.score}
        />
      );
    case "competitive":
      return (
        <CompetitiveIntelCard
          title={card.headline}
          source={card.source}
          time={card.time}
          tags={card.tags}
          rows={card.rows}
        />
      );
  }
}

export function GoogleFinancePage() {
  const [activeMarketTab, setActiveMarketTab] = useState("All");
  const [activeFeedTab, setActiveFeedTab] = useState("All");
  const [activeTrendTab, setActiveTrendTab] = useState("Most active");

  const currentTrends = TREND_DATA[activeTrendTab] || [];

  const FEED_TAB_TYPE_MAP: Record<string, FeedCardType | undefined> = {
    "All": undefined,
    "Metrics": "metric",
    "Research": "research",
    "Analysis": "analysis",
    "Actions": "action",
    "Intel": "competitive",
  };
  const filteredFeed = activeFeedTab === "All"
    ? FEED_CARDS
    : FEED_CARDS.filter((c) => c.type === FEED_TAB_TYPE_MAP[activeFeedTab]);

  return (
    <div className="p-5 space-y-6" data-testid="page-google-finance">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none" data-testid="section-market-tabs">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">Compare Metrics</span>
        {MARKET_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMarketTab(tab)}
            className={`text-sm px-1 pb-1 shrink-0 border-b-2 transition-colors ${
              activeMarketTab === tab
                ? "border-[#0f69ff] text-[#0f69ff] font-medium"
                : "border-transparent text-muted-foreground"
            }`}
            data-testid={`tab-market-${tab.toLowerCase()}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none" data-testid="section-index-tickers">
        {INDEX_TICKERS.map((t) => (
          <MetricTicker key={t.key} metric={t} showClassification={false} showSparkline={false} />
        ))}
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Eye className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium">Build a watchlist</p>
            <p className="text-xs text-muted-foreground">Sign in to track metrics you care about</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 min-w-0 space-y-6">
          <div data-testid="section-suggested-metrics">
            <SectionHeader section={{ id: "suggested", label: "You may be interested in", icon: Eye, color: "text-muted-foreground", metricCount: SUGGESTED_METRICS.length }} className="mb-3" />
            <div className="space-y-0">
              {SUGGESTED_METRICS.map((m) => (
                <div
                  key={m.ticker + m.name}
                  className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0"
                  data-testid={`suggested-metric-${m.ticker.toLowerCase()}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TickerBadge ticker={m.ticker} color={m.color} />
                    <span className="text-sm truncate">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium tabular-nums">{formatMetricValue(m.numericValue, m.unitType)}</span>
                    <TrendIndicator delta={m.delta} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-testid="section-feed">
            <SectionHeader section={{ id: "feed", label: "Today's people analytics feed", icon: BarChart3, color: "text-muted-foreground", metricCount: filteredFeed.length }} className="mb-3" />
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {FEED_TABS.map((tab) => (
                <Badge
                  key={tab}
                  variant={activeFeedTab === tab ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setActiveFeedTab(tab)}
                  data-testid={`tab-feed-${tab.toLowerCase()}`}
                >
                  {tab}
                </Badge>
              ))}
            </div>
            <div className="space-y-3">
              {filteredFeed.map((card, i) => (
                <FeedCardRenderer key={i} card={card} />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <Card data-testid="section-market-trends-sidebar">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Metric trends</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: "Market indexes", icon: BarChart3 },
                  { label: "Most active", icon: TrendingUp },
                  { label: "Gainers", icon: TrendingUp },
                  { label: "Losers", icon: TrendingDown },
                ].map((item) => (
                  <Badge key={item.label} variant="outline" className="text-[10px] gap-1 cursor-pointer">
                    <item.icon className="h-2.5 w-2.5" />
                    {item.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="section-calendar">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-1">Events calendar</h3>
              <p className="text-xs text-muted-foreground mb-3">Based on tracked metrics</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>No events in the next 14 days</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="section-most-followed">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3">Most tracked metrics</h3>
              <div className="space-y-3">
                {MOST_FOLLOWED.map((item) => (
                  <div
                    key={item.ticker + item.name}
                    className="flex items-center justify-between gap-2"
                    data-testid={`most-followed-${item.ticker.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TickerBadge ticker={item.ticker} color={item.color} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.followers}</p>
                      </div>
                    </div>
                    <TrendIndicator
                      delta={{ value: null, percent: parseFloat(item.changePct), direction: item.positive ? "up" : "down" }}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div data-testid="section-market-trends-full">
        <SectionHeader section={{ id: "trends", label: "Metric trends", icon: BarChart3, color: "text-muted-foreground", metricCount: currentTrends.length }} className="mb-3" />
        <div className="flex items-center gap-2 mb-4">
          {TREND_TABS.map((tab) => (
            <Badge
              key={tab}
              variant={activeTrendTab === tab ? "default" : "outline"}
              className="cursor-pointer text-xs gap-1"
              onClick={() => setActiveTrendTab(tab)}
              data-testid={`tab-trend-${tab.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {tab === "Most active" && <BarChart3 className="h-3 w-3" />}
              {tab === "Gainers" && <TrendingUp className="h-3 w-3" />}
              {tab === "Losers" && <TrendingDown className="h-3 w-3" />}
              {tab}
            </Badge>
          ))}
          <span className="ml-auto text-xs text-[#0f69ff] font-medium cursor-pointer" data-testid="link-more-trends">More</span>
        </div>
        <div className="space-y-0">
          {currentTrends.map((item) => (
            <div
              key={item.ticker + item.name}
              className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0"
              data-testid={`trend-item-${item.ticker.toLowerCase()}`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <TickerBadge ticker={item.ticker} color={item.color} />
                <div className="min-w-0">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  )}
                  {item.source && (
                    <p className="text-[10px] text-muted-foreground">{item.source}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium tabular-nums">{item.value}</span>
                <TrendIndicator
                  delta={{ value: null, percent: parseFloat(item.changePct), direction: item.positive ? "up" : "down" }}
                  size="sm"
                />
                <PlusCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div data-testid="section-discover-more">
        <SectionHeader section={{ id: "discover", label: "Discover more", icon: PlusCircle, color: "text-muted-foreground", metricCount: DISCOVER_CARDS.length }} className="mb-1" />
        <p className="text-xs text-muted-foreground mb-3">You may be interested in</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {DISCOVER_CARDS.map((card, i) => (
            <div key={card.key + i} className="shrink-0 w-[160px]">
              <MetricCard metric={card} expandable={false} />
            </div>
          ))}
          <div className="shrink-0 flex items-center px-2">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
