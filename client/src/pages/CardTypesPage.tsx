import { OrgMetricCard } from "@/components/OrgMetricCard";
import { ResearchCard } from "@/components/ResearchCard";
import { AnalysisSummaryCard } from "@/components/AnalysisSummaryCard";
import { ActionPlanCard } from "@/components/ActionPlanCard";
import { CompetitiveIntelCard } from "@/components/CompetitiveIntelCard";

export function CardTypesPage() {
  return (
    <div className="p-5 space-y-8 max-w-2xl" data-testid="page-card-types">
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Org Metric</h2>
        <OrgMetricCard
          ticker="HC"
          tickerColor="bg-blue-600"
          title="Engineering headcount growth outpaces budget by 2.3%"
          value="12,847"
          changePct="+2.30%"
          positive={true}
          source="HRIS"
          time="2 hours ago"
          sparklineSeed="headcount-eng"
          rows={[
            { label: "Eng Headcount", value: "3,241" },
            { label: "Budget Target", value: "3,168" },
            { label: "Variance", value: "+73 (+2.3%)" },
          ]}
        />
      </div>

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Peer Reviewed Research</h2>
        <ResearchCard
          title="Manager quality accounts for 70% of variance in team engagement scores"
          source="Journal of Applied Psychology"
          time="Published 2025"
          citation="Buckingham & Goodall, 2025. J. Applied Psychology, 110(4), pp. 412-429."
          tags={["Peer Reviewed", "Engagement", "Management"]}
          rows={[
            { label: "Sample Size", value: "n = 48,000" },
            { label: "Effect Size", value: "r = 0.71" },
            { label: "Confidence", value: "95% CI" },
          ]}
        />
      </div>

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Analysis Summary</h2>
        <AnalysisSummaryCard
          title="Q1 Attrition Risk Analysis: Sales org showing elevated voluntary turnover signals"
          source="People Analytics"
          time="4 hours ago"
          ticker="TURN"
          tickerColor="bg-red-500"
          riskLevel="high"
          rows={[
            { label: "Sales Turnover", value: "22.4% (vs 14.2% avg)" },
            { label: "Flight Risk Flags", value: "47 employees" },
            { label: "Est. Replacement Cost", value: "$3.2M" },
            { label: "Key Driver", value: "Comp below P50 market" },
          ]}
        />
      </div>

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Action Plan</h2>
        <ActionPlanCard
          title="Action Plan: Sales Retention Initiative Q2"
          source="Retention Task Force"
          time="6 hours ago"
          tags={["In Progress", "High Priority"]}
          actions={[
            { label: "Market adjustment for 23 below-band roles", completed: true },
            { label: "Launch stay interviews for top performers", completed: false },
            { label: "Redesign Sales IC career ladder", completed: false },
            { label: "Manager coaching program enrollment", completed: false },
          ]}
          progressPct={35}
        />
      </div>

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Competitive Intelligence</h2>
        <CompetitiveIntelCard
          title="Industry benchmark: Tech sector median turnover dropped to 13.8%"
          source="Competitive Intelligence"
          time="1 day ago"
          tags={["Benchmark", "Tech Sector"]}
          rows={[
            { label: "Industry Median", value: "13.8%" },
            { label: "Our Rate", value: "14.2%" },
            { label: "Gap", value: "+0.4pp above median" },
            { label: "Peer Range", value: "11.2% - 18.7%" },
          ]}
        />
      </div>
    </div>
  );
}
