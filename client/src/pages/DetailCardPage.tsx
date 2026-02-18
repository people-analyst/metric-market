import { DetailCard } from "@/components/DetailCard";
import type { DetailCardProps } from "@/components/DetailCard";

const EXAMPLE_CARDS: { title: string; card: DetailCardProps }[] = [
  {
    title: "Employee Profile",
    card: {
      tags: [
        { label: "Full-time", active: true },
        { label: "Engineering" },
        { label: "US based" },
        { label: "Senior" },
      ],
      rows: [
        { label: "Tenure", value: "4.2 years" },
        { label: "Salary Range", value: "$125K - $165K" },
        { label: "Compa-Ratio", value: "1.08" },
        { label: "Performance Rating", value: "4.2 / 5.0" },
        { label: "Goal Completion", value: "87%" },
        { label: "Flight Risk", value: "Low" },
        { label: "Last Promotion", value: "18 months ago" },
        { label: "Manager", value: "J. Chen" },
      ],
      footer: {
        icon: "E",
        label: "Engagement Score",
        value: "82 / 100",
        href: "#",
      },
    },
  },
  {
    title: "Department Summary",
    card: {
      tags: [
        { label: "Active", active: true },
        { label: "Cost Center" },
        { label: "US headquartered" },
      ],
      rows: [
        { label: "Headcount", value: "342" },
        { label: "Turnover Rate", value: "12.4%" },
        { label: "Avg Tenure", value: "3.8 years" },
        { label: "Avg Salary", value: "$128,500" },
        { label: "Open Reqs", value: "17" },
        { label: "Time to Fill", value: "38 days" },
        { label: "Diversity Index", value: "0.72" },
        { label: "Budget Util", value: "91%" },
      ],
      footer: {
        icon: "D",
        label: "DEI Compliance Score",
        value: "A-",
        href: "#",
      },
    },
  },
  {
    title: "Role Benchmark",
    card: {
      tags: [
        { label: "Sr. Engineer", active: true },
        { label: "IC Track" },
      ],
      rows: [
        { label: "Market Median", value: "$145,000" },
        { label: "Internal Median", value: "$138,200" },
        { label: "Pay Gap", value: "-4.7%" },
        { label: "Total Comp (P50)", value: "$172,000" },
        { label: "Avg Bonus", value: "15.2%" },
        { label: "Promotion Rate", value: "22%" },
        { label: "Retention Rate", value: "89%" },
        { label: "Span of Control", value: "-" },
      ],
    },
  },
];

export function DetailCardPage() {
  return (
    <div className="p-5 space-y-5" data-testid="page-detail-card">
      <div>
        <h1 className="text-lg font-semibold tracking-tight" data-testid="text-detail-card-title">
          Detail Card
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fact-sheet card with tags and key-value rows
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAMPLE_CARDS.map((ex) => (
          <div key={ex.title}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{ex.title}</p>
            <DetailCard {...ex.card} />
          </div>
        ))}
      </div>
    </div>
  );
}
