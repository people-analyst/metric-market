import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  PlusCircle,
  BarChart3,
  Calendar,
  Users,
  Eye,
} from "lucide-react";
import { OrgMetricCard } from "@/components/OrgMetricCard";
import { ResearchCard } from "@/components/ResearchCard";
import { AnalysisSummaryCard } from "@/components/AnalysisSummaryCard";
import { ActionPlanCard } from "@/components/ActionPlanCard";
import { CompetitiveIntelCard } from "@/components/CompetitiveIntelCard";

function seeded(key: string) {
  let s = 0;
  for (let i = 0; i < key.length; i++) s += key.charCodeAt(i);
  return (min: number, max: number) => {
    s = (s * 9301 + 49297) % 233280;
    return min + (s / 233280) * (max - min);
  };
}

const MARKET_TABS = ["All", "Workforce", "Compensation", "Performance", "Attrition", "Engagement"];

interface IndexTicker {
  label: string;
  value: string;
  change: string;
  changeAbs: string;
  positive: boolean;
}

const INDEX_TICKERS: IndexTicker[] = [
  { label: "Headcount", value: "12,847", change: "+0.56%", changeAbs: "+72", positive: true },
  { label: "Turnover", value: "14.2%", change: "-1.13%", changeAbs: "-1.6", positive: false },
  { label: "Engagement", value: "78.5", change: "+1.11%", changeAbs: "+0.87", positive: true },
  { label: "eNPS", value: "32", change: "-0.07%", changeAbs: "-0.02", positive: false },
  { label: "Compa-Ratio", value: "0.98", change: "-0.20%", changeAbs: "-0.002", positive: false },
];

interface SuggestedMetric {
  ticker: string;
  color: string;
  name: string;
  value: string;
  changeAbs: string;
  changePct: string;
  positive: boolean;
}

const SUGGESTED_METRICS: SuggestedMetric[] = [
  { ticker: "HC", color: "bg-blue-600", name: "Headcount (Global)", value: "12,847", changeAbs: "+72", changePct: "+0.56%", positive: true },
  { ticker: "TURN", color: "bg-red-500", name: "Turnover Rate", value: "14.2%", changeAbs: "-1.6pp", changePct: "-1.13%", positive: false },
  { ticker: "COMP", color: "bg-amber-500", name: "Avg Compensation", value: "$97,240", changeAbs: "-$800", changePct: "+0.82%", positive: true },
  { ticker: "PERF", color: "bg-green-600", name: "Performance Rating (Avg)", value: "3.84", changeAbs: "+0.12", changePct: "+0.62%", positive: true },
  { ticker: "DIV", color: "bg-purple-600", name: "Diversity Index", value: "0.72", changeAbs: "+0.01", changePct: "+0.52%", positive: true },
  { ticker: "FILL", color: "bg-cyan-600", name: "Time to Fill", value: "38d", changeAbs: "-2d", changePct: "+0.40%", positive: true },
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

interface DiscoverCard {
  ticker: string;
  color: string;
  label: string;
  name: string;
  value: string;
  changePct: string;
  positive: boolean;
}

const DISCOVER_CARDS: DiscoverCard[] = [
  { ticker: "INDEX", color: "bg-blue-700", label: "INDEX", name: "Workforce Health Index", value: "84.2", changePct: "-1.30%", positive: false },
  { ticker: "INDEX", color: "bg-blue-700", label: "INDEX", name: "Talent Pipeline Score", value: "71.8", changePct: "-1.30%", positive: false },
  { ticker: "COMP", color: "bg-amber-500", label: "COMP", name: "Total Rewards Value", value: "$128,500", changePct: "+4.51%", positive: true },
  { ticker: "INDEX", color: "bg-blue-700", label: "INDEX", name: "Culture Alignment", value: "76.4", changePct: "-1.30%", positive: false },
  { ticker: "PERF", color: "bg-green-600", label: "PERF", name: "Productivity Index", value: "92.1", changePct: "+4.51%", positive: true },
  { ticker: "HC", color: "bg-blue-600", label: "HC", name: "Contractor Ratio", value: "18.3%", changePct: "-1.30%", positive: false },
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
          <div
            key={t.label}
            className="flex items-center gap-2 shrink-0 px-3 py-2 border rounded-md bg-card"
            data-testid={`index-ticker-${t.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className={`flex items-center justify-center h-5 w-5 rounded-full ${t.positive ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
              {t.positive ? (
                <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{t.label}</span>
                <span className={`text-xs font-medium ${t.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {t.change}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">{t.value}</span>
                <span className={`text-xs tabular-nums ${t.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {t.changeAbs}
                </span>
              </div>
            </div>
          </div>
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
            <h2 className="text-sm font-semibold mb-3">You may be interested in</h2>
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
                    <span className="text-sm font-medium tabular-nums">{m.value}</span>
                    <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">{m.changeAbs}</span>
                    <span
                      className={`text-xs font-medium tabular-nums w-16 text-right ${
                        m.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {m.positive ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                      {m.changePct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-testid="section-feed">
            <h2 className="text-sm font-semibold mb-3">Today's people analytics feed</h2>
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-xs font-medium tabular-nums ${
                          item.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {item.positive ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                        {item.changePct}
                      </span>
                      <PlusCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div data-testid="section-market-trends-full">
        <h2 className="text-lg font-semibold mb-3">Metric trends</h2>
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
                <span
                  className={`text-xs font-medium tabular-nums w-16 text-right ${
                    item.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {item.positive ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                  {item.changePct}
                </span>
                <PlusCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div data-testid="section-discover-more">
        <h2 className="text-lg font-semibold mb-1">Discover more</h2>
        <p className="text-xs text-muted-foreground mb-3">You may be interested in</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {DISCOVER_CARDS.map((card, i) => (
            <Card
              key={card.name + i}
              className="shrink-0 w-[160px] hover-elevate cursor-pointer"
              data-testid={`discover-card-${i}`}
            >
              <CardContent className="p-3">
                <TickerBadge ticker={card.label} color={card.color} />
                <p className="text-xs font-medium mt-2 mb-1 leading-tight">{card.name}</p>
                <p className="text-sm font-bold tabular-nums">{card.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      card.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {card.positive ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                    {card.changePct}
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
  );
}
