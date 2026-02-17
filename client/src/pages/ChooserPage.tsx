import { useState, useCallback } from "react";
import {
  FilterChooser,
  type FilterCategory,
} from "@/components/FilterChooser";

const defaultCategories: FilterCategory[] = [
  {
    id: "morningstarRating",
    title: "Morningstars Rating",
    hasIcon: true,
    options: [
      { id: "economicMoat", label: "Economic Moat" },
      { id: "morningstarRating", label: "Morningstar Rating" },
      { id: "stewardship", label: "Stewardship" },
      { id: "morningstarLastClose", label: "Morningstar Last Close Price/Fair Value" },
      { id: "morningstarRatingChange", label: "Morningstar Rating Change" },
      { id: "uncertaintyRating", label: "Uncertainty Rating" },
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
      { id: "estRateOfReturn", label: "Est. Rate of Return (%)" },
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

export function ChooserPage() {
  const [categories, setCategories] = useState<FilterCategory[]>(defaultCategories);

  const handleClose = useCallback(
    (updatedCategories: FilterCategory[]) => {
      setCategories(updatedCategories);
    },
    []
  );

  return (
    <div className="p-5" data-testid="page-chooser">
      <FilterChooser
        categories={categories}
        onClose={handleClose}
        onCategoriesChange={setCategories}
      />
    </div>
  );
}
