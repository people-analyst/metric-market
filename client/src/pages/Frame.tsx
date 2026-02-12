import { useState } from "react";
import { StockScreenerFilters, type FilterItem } from "@/components/StockScreenerFilters";
import { FilterChooser, type FilterCategory } from "@/components/FilterChooser";

const defaultFilters: FilterItem[] = [
  {
    id: "region",
    label: "Region is",
    type: "badge",
    selected: ["United States"],
    hasRemove: true,
  },
  {
    id: "marketCap",
    label: "Market Cap (Intraday) is",
    type: "toggle",
    options: ["Small Cap", "Mid Cap", "Large Cap", "Mega Cap"],
    selected: [],
    hasRemove: true,
  },
  {
    id: "sector",
    label: "Sector is",
    type: "badge",
    selected: ["Financial Services", "Technology"],
    hasRemove: true,
  },
  {
    id: "industry",
    label: "Industry is",
    type: "add",
    placeholder: "Industry",
    hasRemove: true,
  },
  {
    id: "revenueConsistency",
    label: "Revenue Consistency is",
    type: "toggle",
    options: ["Low", "Medium", "High"],
    selected: ["Medium"],
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "consecutiveEps",
    label: "Year of Consecutive Positive EPS",
    type: "input",
    sublabel: "Greater than",
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "uncertaintyRating",
    label: "Uncertainity rating is",
    type: "toggle",
    options: ["Low", "Medium", "High", "Very High", "Extreme"],
    selected: ["Very High"],
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "morningstarRating",
    label: "Morningstar Rating Change is",
    type: "toggle",
    options: ["Upgrade", "Downgrade"],
    selected: ["Upgrade"],
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "grossProfitMargin",
    label: "Gross Profit Margin % is",
    type: "input",
    sublabel: "Greater than",
    hasRemove: true,
  },
];

const defaultCategories: FilterCategory[] = [
  {
    id: "morningstarRating",
    title: "Morninstars Rating",
    hasIcon: true,
    options: [
      { id: "economicMoat", label: "Ecnomic Moat" },
      { id: "morningstarRating", label: "Morningstar Rating" },
      { id: "stewardship", label: "Stewardship" },
      { id: "morningstarLastClose", label: "Morningstar Last Close Price/Fair Value" },
      { id: "morningstarRatingChange", label: "Morningstar Rating Change" },
      { id: "uncertaintyRating", label: "Uncertanity Rating" },
      { id: "moatTrend", label: "Moat Trend" },
      { id: "morningstarRatingUpdated", label: "Morningstar Rating Updated Time" },
    ],
  },
  {
    id: "fairValue",
    title: "Fair Value",
    hasIcon: true,
    options: [
      { id: "earningsConsistency", label: "Earnings Consistency" },
      { id: "revenueConsistency", label: "Revenue Consistency" },
      { id: "valuation", label: "Valuation" },
      { id: "estEpsGrowth", label: "Est. EPS Growth (%)" },
      { id: "estRateOfReturn", label: "Est. Rate if Return (%)" },
      { id: "yearsConsecutiveEps", label: "Years of Consecutive Positive EPS" },
      { id: "estEpsGrowth2", label: "Est. EPS Growth (%)" },
      { id: "lastCloseFairValue", label: "Last Close Price/Fair Value" },
    ],
  },
  {
    id: "popularFilters",
    title: "Popular Filters",
    options: [
      { id: "beta", label: "Beta (5Y Monthly)" },
      { id: "region", label: "Region", checked: true },
      { id: "exchange", label: "Exchange" },
      { id: "sectorIndustry", label: "Sector & Industry", checked: true },
      { id: "marketCapIntraday", label: "Market Cap (Intraday)", checked: true },
      { id: "symbol", label: "Symbol" },
    ],
  },
  {
    id: "priceMarketCap",
    title: "Changes in Price and Market Cap",
    options: [
      { id: "priceEndOfDay", label: "Price (End of Day)" },
      { id: "weekPriceChange", label: "52 Week Price % Change" },
      { id: "priceIntraday", label: "Price (Intraday)", checked: true },
    ],
  },
];

export const Frame = (): JSX.Element => {
  const [showChooser, setShowChooser] = useState(false);

  return (
    <div className="bg-[#f5f8fa] min-h-screen p-5">
      <StockScreenerFilters
        filters={defaultFilters}
        estimatedResults={1}
        onAddFilter={() => setShowChooser(true)}
      />

      {showChooser && (
        <div className="mt-4">
          <FilterChooser
            categories={defaultCategories}
            onClose={() => setShowChooser(false)}
          />
        </div>
      )}
    </div>
  );
};