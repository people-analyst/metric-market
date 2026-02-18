import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  BarChart3,
  Target,
  Heart,
  Shield,
  Plus,
  Lock,
} from "lucide-react";

function seededRand(key: string) {
  let s = 0;
  for (let i = 0; i < key.length; i++) s += key.charCodeAt(i);
  return (min: number, max: number) => {
    s = (s * 9301 + 49297) % 233280;
    return min + (s / 233280) * (max - min);
  };
}

interface TickerItem {
  label: string;
  value: number;
  change: number;
  unit: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { label: "Headcount", value: 12847, change: 0.56, unit: "" },
  { label: "Turnover", value: 14.2, change: -1.13, unit: "%" },
  { label: "Engagement", value: 78.5, change: 0.35, unit: "score" },
  { label: "Time to Fill", value: 42, change: -0.09, unit: "days" },
  { label: "Compa-Ratio", value: 0.98, change: -1.16, unit: "ratio" },
  { label: "eNPS", value: 32, change: 2.4, unit: "score" },
];

function MiniSparkline({ seed }: { seed: string }) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  const points: number[] = [];
  for (let i = 0; i < 12; i++) {
    s = (s * 9301 + 49297) % 233280;
    points.push(30 + (s / 233280) * 40);
  }
  const w = 48;
  const h = 20;
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

function formatTickerValue(item: TickerItem): string {
  if (item.unit === "%") return `${item.value}%`;
  if (item.unit === "ratio") return String(item.value);
  if (item.unit === "days") return `${item.value}d`;
  if (item.value >= 1000) return item.value.toLocaleString();
  return String(item.value);
}

function TickerTape() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div className="relative" data-testid="section-ticker-tape">
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none"
      >
        {TICKER_ITEMS.map((item) => {
          const isPos = item.change > 0;
          const isNeg = item.change < 0;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2 shrink-0 px-3 py-2 border rounded-md bg-card"
              data-testid={`ticker-strip-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{item.label}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tabular-nums">{formatTickerValue(item)}</span>
                  <MiniSparkline seed={item.label} />
                  <span
                    className={`text-xs tabular-nums font-medium ${
                      isPos ? "text-green-600 dark:text-green-400" : isNeg ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                    }`}
                  >
                    {isPos ? "+" : ""}{item.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={() => scroll(-1)} data-testid="button-ticker-left">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => scroll(1)} data-testid="button-ticker-right">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SavedScreenersSection() {
  return (
    <div data-testid="section-saved-screeners">
      <h2 className="text-sm font-semibold mb-3">My Saved Dashboards</h2>
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <SlidersHorizontal className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            Sign in to view your saved dashboards.
          </p>
          <p className="text-xs text-muted-foreground mb-4">OR</p>
          <Button data-testid="button-create-new-screener">
            Create New Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface FeaturedCard {
  title: string;
  tag?: string;
  description: string;
  rows: { ticker: string; name: string; value: string; change: string; positive: boolean }[];
}

const FEATURED_CARDS: FeaturedCard[] = [
  {
    title: "High Flight Risk Teams",
    tag: "Alert",
    description: "Teams with elevated attrition signals based on engagement surveys and tenure patterns.",
    rows: [
      { ticker: "ENG", name: "Engineering Ops", value: "82.3", change: "+3.2%", positive: true },
      { ticker: "MKT", name: "Marketing West", value: "71.0", change: "-2.1%", positive: false },
      { ticker: "FIN", name: "Finance Corp", value: "68.5", change: "+0.8%", positive: true },
    ],
  },
  {
    title: "Top Performing Departments",
    tag: "Trending",
    description: "Departments with the highest composite performance scores this quarter.",
    rows: [
      { ticker: "R&D", name: "Research & Dev", value: "94.1", change: "+5.2%", positive: true },
      { ticker: "PRD", name: "Product Design", value: "91.7", change: "+3.8%", positive: true },
      { ticker: "DAT", name: "Data Science", value: "89.0", change: "+1.4%", positive: true },
    ],
  },
  {
    title: "Compensation Outliers",
    tag: "Review",
    description: "Roles where compa-ratio deviates significantly from market benchmarks.",
    rows: [
      { ticker: "SWE", name: "Sr. Software Eng", value: "1.15", change: "+4.2%", positive: true },
      { ticker: "PM", name: "Product Manager", value: "0.87", change: "-3.1%", positive: false },
      { ticker: "DS", name: "Data Scientist", value: "1.08", change: "+2.3%", positive: true },
    ],
  },
  {
    title: "Latest Engagement Shifts",
    description: "Teams with the most significant engagement score changes in the past 30 days.",
    rows: [
      { ticker: "CSR", name: "Customer Success", value: "76.2", change: "-4.5%", positive: false },
      { ticker: "OPS", name: "Operations", value: "81.0", change: "+2.1%", positive: true },
      { ticker: "HR", name: "People Team", value: "88.4", change: "+1.7%", positive: true },
    ],
  },
];

function FeaturedCardsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div data-testid="section-featured-analytics">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Featured Analytics</h2>
          <Badge variant="default" className="text-xs gap-1">
            <span className="font-bold">P+</span>
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">View all</span>
          <span className="text-xs text-muted-foreground tabular-nums">1/4</span>
          <Button size="icon" variant="ghost" onClick={() => scroll(-1)} data-testid="button-featured-left">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => scroll(1)} data-testid="button-featured-right">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
      >
        {FEATURED_CARDS.map((card) => (
          <Card
            key={card.title}
            className="shrink-0 w-[280px] hover-elevate"
            data-testid={`featured-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#0f69ff] leading-tight">{card.title}</p>
                  {card.tag && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">{card.tag}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{card.description}</p>
              </div>
              <div className="space-y-1.5 border-t pt-2">
                {card.rows.map((row) => (
                  <div key={row.ticker} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-[#0f69ff] shrink-0">{row.ticker}</span>
                      <span className="truncate text-muted-foreground">{row.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-medium tabular-nums">{row.value}</span>
                      <span
                        className={`tabular-nums font-medium ${
                          row.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {row.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="text-xs text-[#0f69ff] font-medium text-left mt-auto"
                data-testid={`link-view-all-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                View all 50+ matches
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ScreenerType {
  title: string;
  description: string;
  icon: typeof Users;
}

const SCREENER_TYPES: ScreenerType[] = [
  {
    title: "Workforce Screener",
    description: "Screen your workforce by headcount, tenure, diversity, and composition metrics across all regions.",
    icon: Users,
  },
  {
    title: "Compensation Screener",
    description: "Analyze salary bands, compa-ratios, pay equity, and total rewards using market benchmarks.",
    icon: DollarSign,
  },
  {
    title: "Performance Screener",
    description: "Filter by performance ratings, goal completion, training hours, and productivity indices.",
    icon: Target,
  },
  {
    title: "Attrition Screener",
    description: "Screen for turnover patterns, flight risk, internal mobility, and regrettable attrition signals.",
    icon: BarChart3,
  },
  {
    title: "Engagement Screener",
    description: "Explore engagement scores, eNPS, survey responses, and culture alignment across teams.",
    icon: Heart,
  },
];

function CreateNewSection() {
  return (
    <div data-testid="section-create-new">
      <h2 className="text-lg font-semibold">Create a New Dashboard</h2>
      <p className="text-sm text-muted-foreground mb-4">Pick a screener type to get started</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {SCREENER_TYPES.map((type) => (
          <Card
            key={type.title}
            className="hover-elevate cursor-pointer border-[#0f69ff]/20"
            data-testid={`card-screener-type-${type.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <CardContent className="p-4 flex flex-col gap-2">
              <p className="text-sm font-bold text-[#0f69ff]">{type.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface PremiumScreener {
  title: string;
  description: string;
  icon: typeof Users;
}

const PREMIUM_SCREENERS: PremiumScreener[] = [
  {
    title: "Predictive Attrition Screener",
    description: "Leverage ML models to identify employees at risk of leaving, using engagement, tenure, and performance signals.",
    icon: Shield,
  },
  {
    title: "Skills Gap Screener",
    description: "Detect skill shortages with automated pattern analysis across job families and competency frameworks.",
    icon: Target,
  },
  {
    title: "Succession Pipeline Screener",
    description: "Find high-potential successors by combining performance trajectories, readiness assessments, and development plans.",
    icon: Users,
  },
  {
    title: "Total Rewards Optimizer",
    description: "Discover which compensation levers drive the highest retention and engagement returns on investment.",
    icon: DollarSign,
  },
];

function PremiumSection() {
  return (
    <div data-testid="section-premium-analytics">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-semibold">People Analytics Plus</h2>
        <Badge variant="default" className="text-xs gap-1">
          <span className="font-bold">P+</span>
        </Badge>
      </div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <p className="text-sm text-muted-foreground">Premium subscription required</p>
        <Button variant="outline" size="sm" data-testid="button-start-trial">
          Start Free Trial
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PREMIUM_SCREENERS.map((item) => (
          <Card
            key={item.title}
            className="hover-elevate cursor-pointer border-[#0f69ff]/20"
            data-testid={`card-premium-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <CardContent className="p-4 flex flex-col gap-2">
              <p className="text-sm font-bold text-[#0f69ff]">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              <div className="flex items-center justify-between mt-auto pt-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <Badge variant="default" className="text-[10px]">
                  <span className="font-bold">P+</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MenuPage() {
  return (
    <div className="p-5 space-y-6" data-testid="page-menu">
      <TickerTape />
      <SavedScreenersSection />
      <FeaturedCardsSection />
      <CreateNewSection />
      <PremiumSection />
    </div>
  );
}
