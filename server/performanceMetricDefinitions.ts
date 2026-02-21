import type { InsertMetricDefinition } from "@shared/schema";

export interface HAVEMetricEnvelope {
  metricId: string;
  metricKey: string;
  label: string;
  description: string;
  domain: string;
  category: string;
  unit: { unitType: string; unitLabel: string };
  source: {
    app: string;
    joinSource: string;
    computeSource: string;
    lineage: string;
  };
  qualityProfile: {
    confidenceScore: number;
    dataQualityScore: number;
    segmentable: boolean;
    segmentDimensions: string[];
  };
  ui: {
    preferredDisplay: string;
    sortWeight: number;
    tags: string[];
  };
}

const SOURCE_LINEAGE = {
  app: "metric-market",
  joinSource: "Conductor (performance_review_facts JOIN employee_dim JOIN org_dim)",
  computeSource: "Calculus (performance_analytics_engine)",
  lineage: "Conductor join → Calculus computation → Metric Market catalog",
};

export const PERFORMANCE_METRIC_DEFINITIONS: InsertMetricDefinition[] = [
  {
    key: "performance_distribution_by_segment",
    name: "Performance Distribution by [Segment]",
    description: "Distribution of performance ratings across any segmentation dimension (department, level, location, tenure, gender, ethnicity) with calculated odds ratios showing relative likelihood of each rating in each segment versus the population baseline. Segments with odds ratios significantly above or below 1.0 indicate non-random patterns.",
    category: "Performance Analytics",
    unit: "distribution",
    unitLabel: "Rating Distribution + Odds Ratios",
    source: "Conductor join → Calculus performance_distribution_engine",
    calculationNotes: "Calculus computes frequency counts per segment×rating cell, then odds ratios as (segment_rate / baseline_rate). Confidence intervals derived from log-odds standard error. Conductor provides the joined fact table with employee demographics, org hierarchy, and performance ratings.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "chi_square_independence_test",
    name: "Chi-Square Independence Test Results",
    description: "Chi-square test of independence between performance rating and each segmentation variable (department, level, location, tenure band, gender, ethnicity). Reports chi-square statistic, degrees of freedom, p-value, and significance flag. Tests whether performance rating distribution is statistically independent of segment membership.",
    category: "Performance Analytics",
    unit: "test_result",
    unitLabel: "χ² Statistic / p-value",
    source: "Conductor join → Calculus chi_square_engine",
    calculationNotes: "Calculus builds contingency tables from Conductor's joined performance×segment data. Expected frequencies computed under independence assumption. Chi-square statistic = Σ((observed-expected)²/expected). P-value from chi-square CDF with (r-1)(c-1) degrees of freedom. Significance threshold: p < 0.05.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "cramers_v_effect_size",
    name: "Cramer's V Effect Size Rankings",
    description: "Cramer's V effect size for each segment×performance rating association, ranked from strongest to weakest. Cramer's V normalizes chi-square by sample size and table dimensions, producing a 0-1 scale where 0=no association and 1=perfect association. Interpretation thresholds: <0.10 negligible, 0.10-0.30 small, 0.30-0.50 medium, >0.50 large.",
    category: "Performance Analytics",
    unit: "score",
    unitLabel: "Cramer's V (0-1)",
    source: "Conductor join → Calculus cramers_v_engine",
    calculationNotes: "Derived from chi-square results: V = sqrt(χ² / (N × min(r-1, c-1))). Ranked across all segment dimensions to identify which segmentation variable has the strongest association with performance outcomes. Conductor provides the base join; Calculus computes chi-square and V.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "performance_trajectory",
    name: "Performance Trajectory (% Improved / Declined / Flatlined)",
    description: "Year-over-year performance trajectory showing the percentage of employees whose rating improved, declined, or stayed flat compared to the prior cycle. Broken down by movement direction with population counts and percentages. Requires at least two consecutive performance cycles.",
    category: "Performance Analytics",
    unit: "percent",
    unitLabel: "% of Population",
    source: "Conductor join (multi-cycle) → Calculus trajectory_engine",
    calculationNotes: "Calculus joins current and prior cycle ratings from Conductor, classifying each employee as Improved (rating_current > rating_prior), Declined (rating_current < rating_prior), or Flatlined (rating_current = rating_prior). Ratings mapped to ordinal scale for comparison. Employees present in only one cycle are excluded.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "calibration_impact_rate",
    name: "Calibration Impact Rate (% Changed, direction)",
    description: "Percentage of employees whose performance rating changed during the calibration process, broken down by direction (upgraded vs downgraded). Measures the magnitude and direction of calibration adjustments from manager-submitted ratings to final calibrated ratings.",
    category: "Performance Analytics",
    unit: "percent",
    unitLabel: "% Changed",
    source: "Conductor join (pre/post calibration) → Calculus calibration_impact_engine",
    calculationNotes: "Calculus compares pre-calibration (manager-submitted) ratings with post-calibration (final) ratings from Conductor. Change rate = (count changed / total) × 100. Directional split: upgraded = final > submitted, downgraded = final < submitted. Net calibration shift computed as mean ordinal change.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "leader_harshness_index",
    name: "Leader Harshness Index Score",
    description: "Per-manager index score measuring rating severity relative to organizational baseline. Positive scores indicate harsher-than-average rating behavior; negative scores indicate more lenient patterns. Normalized to population mean of 0 with standard deviation of 1.",
    category: "Performance Analytics",
    unit: "z_score",
    unitLabel: "Z-Score (σ from mean)",
    source: "Conductor join → Calculus harshness_index_engine",
    calculationNotes: "Calculus computes each manager's mean rating (ordinal-encoded), then z-scores against the population mean. Harshness Index = -(manager_mean - population_mean) / population_std. Positive = harsher than average. Requires minimum span of control (n ≥ 5 direct reports with ratings) for statistical validity. Conductor provides the manager→employee→rating join.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "eteam_scorecard",
    name: "E-Team Scorecard Metrics",
    description: "Executive team scorecard aggregating key HR metrics per E-Team member's organization: headcount, promotion rate, average performance rating, and rating distribution. Provides a leadership-level summary for each executive's span of influence.",
    category: "Performance Analytics",
    unit: "scorecard",
    unitLabel: "Composite Scorecard",
    source: "Conductor join (org hierarchy) → Calculus eteam_scorecard_engine",
    calculationNotes: "Calculus traverses the organizational hierarchy from Conductor to roll up metrics under each E-Team member: (1) Headcount = count of active employees in their org, (2) Promo Rate = promotions / headcount × 100, (3) Avg Rating = mean ordinal rating, (4) Rating Distribution = frequency counts per rating level. E-Team identified by org level ≤ 2 or explicit flag in Conductor data.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "rto_performance_correlation",
    name: "RTO-Performance Correlation",
    description: "Correlation analysis between return-to-office compliance (badge swipes, office days per week) and performance ratings. Reports Pearson correlation coefficient, p-value, and effect size. Tests whether RTO policy compliance has a measurable relationship with performance outcomes.",
    category: "Performance Analytics",
    unit: "correlation",
    unitLabel: "r (Pearson Correlation)",
    source: "Conductor join (attendance + performance) → Calculus rto_correlation_engine",
    calculationNotes: "Calculus joins RTO compliance data (badge events, office days/week) with performance ratings from Conductor. Pearson r computed between continuous RTO metric and ordinal-encoded performance rating. Point-biserial correlation used when RTO is dichotomized (compliant/non-compliant). Cohen's d effect size reported alongside. Controlled for tenure and job level as confounders.",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "flight_risk_score_distribution",
    name: "Flight Risk Score Distribution",
    description: "Distribution of flight risk scores across the employee population, segmented by risk tier (Low, Moderate, High, Critical). Flight risk is a composite score derived from performance trajectory, compensation positioning, tenure, engagement signals, and market demand indicators.",
    category: "Performance Analytics",
    unit: "distribution",
    unitLabel: "Risk Tier Distribution",
    source: "Conductor join (multi-signal) → Calculus flight_risk_engine",
    calculationNotes: "Calculus produces a composite flight risk score (0-100) from Conductor inputs: (1) performance trajectory (declining = higher risk), (2) compa-ratio (below 0.90 = higher risk), (3) tenure (2-4 years = peak risk), (4) engagement survey scores (low = higher risk), (5) market demand proxy from Conductor's BLS data. Score bucketed into tiers: Low (0-25), Moderate (26-50), High (51-75), Critical (76-100).",
    cadence: "per_cycle",
    isActive: true,
  },
  {
    key: "promotion_rate_by_segment",
    name: "Promotion Rate by [Segment]",
    description: "Promotion rate (promotions / headcount × 100) calculated per segmentation dimension (department, level, location, tenure, gender, ethnicity). Includes population counts, confidence intervals, and comparison to organization-wide baseline rate. Identifies segments with significantly higher or lower promotion velocity.",
    category: "Performance Analytics",
    unit: "percent",
    unitLabel: "% Promoted",
    source: "Conductor join → Calculus promotion_rate_engine",
    calculationNotes: "Calculus counts promotion events per segment from Conductor's joined fact table. Rate = (promotions_in_segment / headcount_in_segment) × 100. Baseline rate = total promotions / total headcount. Confidence intervals from Wilson score interval for binomial proportions. Statistical comparison via z-test for proportions against baseline. Requires Conductor's promotion event flag and segment dimensions.",
    cadence: "per_cycle",
    isActive: true,
  },
];

export function buildHAVEEnvelopes(): HAVEMetricEnvelope[] {
  return PERFORMANCE_METRIC_DEFINITIONS.map((def) => ({
    metricId: `metric-market:performance:${def.key}`,
    metricKey: def.key,
    label: def.name,
    description: def.description ?? "",
    domain: "performance",
    category: def.category ?? "Performance Analytics",
    unit: {
      unitType: def.unit ?? "unknown",
      unitLabel: def.unitLabel ?? "",
    },
    source: {
      ...SOURCE_LINEAGE,
      lineage: def.source ?? SOURCE_LINEAGE.lineage,
    },
    qualityProfile: {
      confidenceScore: 0.95,
      dataQualityScore: 0.98,
      segmentable: def.key.includes("segment") || def.key.includes("distribution"),
      segmentDimensions: getSegmentDimensions(def.key),
    },
    ui: {
      preferredDisplay: getPreferredDisplay(def.unit ?? ""),
      sortWeight: 1,
      tags: ["performance-cycle", "calculus-computed", "conductor-sourced"],
    },
  }));
}

function getSegmentDimensions(key: string): string[] {
  const baseSegments = ["department", "level", "location", "tenure_band"];
  if (key.includes("segment") || key.includes("distribution")) {
    return [...baseSegments, "gender", "ethnicity"];
  }
  if (key.includes("eteam")) {
    return ["executive", "org_unit"];
  }
  return baseSegments;
}

function getPreferredDisplay(unit: string): string {
  switch (unit) {
    case "distribution": return "stacked_bar";
    case "percent": return "number";
    case "score": return "ranked_list";
    case "z_score": return "diverging_bar";
    case "correlation": return "number";
    case "test_result": return "table";
    case "scorecard": return "scorecard";
    default: return "number";
  }
}
