import { useState, useCallback } from "react";
import {
  StockScreenerFilters,
  type FilterItem,
} from "@/components/StockScreenerFilters";
import {
  FilterChooser,
  type FilterCategory,
} from "@/components/FilterChooser";
import { RangeInputFilter } from "@/components/RangeInputFilter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const defaultFilters: FilterItem[] = [
  {
    id: "region",
    label: "Region  is",
    type: "badge",
    selected: ["United States"],
    hasRemove: true,
  },
  {
    id: "marketCap",
    label: "Market Cap (Intraday) is",
    type: "toggle",
    options: ["Small Cap", "Mid Cap", "Large Cap", "Mega Cap"],
    selected: ["Large Cap"],
    hasRemove: true,
  },
  {
    id: "sector",
    label: "Sector  is",
    type: "badge",
    selected: ["Financial Services", "Technology"],
    hasRemove: true,
  },
  {
    id: "industry",
    label: "Industry  is",
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
    label: "Years of Consecutive Positive EPS",
    type: "input",
    sublabel: "Greater than",
    sublabelOptions: ["Greater than", "Less than", "Equal to", "Between"],
    inputValue: "",
    hasIcon: true,
    hasRemove: true,
  },
  {
    id: "uncertaintyRating",
    label: "Uncertainty Rating is",
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
    label: "Gross Profit Margin %",
    type: "input",
    sublabel: "Greater than",
    sublabelOptions: ["Greater than", "Less than", "Equal to", "Between"],
    inputValue: "",
    hasRemove: true,
  },
];

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

export const Frame = (): JSX.Element => {
  const [showChooser, setShowChooser] = useState(false);
  const [filters, setFilters] = useState<FilterItem[]>(defaultFilters);
  const [categories, setCategories] = useState<FilterCategory[]>(defaultCategories);
  const { toast } = useToast();

  const handleFindStocks = useCallback(
    (currentFilters: FilterItem[]) => {
      toast({
        title: "Finding Stocks",
        description: `Searching with ${currentFilters.length} active filters...`,
      });
    },
    [toast]
  );

  const handleSaveFilters = useCallback(
    (currentFilters: FilterItem[]) => {
      toast({
        title: "Filters Saved",
        description: `${currentFilters.length} filters saved successfully.`,
      });
    },
    [toast]
  );

  const handleCloseChooser = useCallback(
    (updatedCategories: FilterCategory[]) => {
      setCategories(updatedCategories);
      setShowChooser(false);
    },
    []
  );

  return (
    <div className="bg-[#f5f8fa] min-h-screen p-5" data-testid="page-stock-screener">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-lg font-semibold text-[#232a31] mb-4" data-testid="text-page-title">
          People Analytics Toolbox
        </h1>

        <Tabs defaultValue="screener" className="w-full">
          <TabsList className="mb-4" data-testid="tabs-component-list">
            <TabsTrigger value="screener" data-testid="tab-screener">
              Stock Screener
            </TabsTrigger>
            <TabsTrigger value="chooser" data-testid="tab-chooser">
              Filter Chooser
            </TabsTrigger>
            <TabsTrigger value="range" data-testid="tab-range">
              Range Input
            </TabsTrigger>
            <TabsTrigger value="menu" data-testid="tab-menu">
              Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screener">
            <StockScreenerFilters
              filters={filters}
              estimatedResults={1}
              onFiltersChange={setFilters}
              onFindStocks={handleFindStocks}
              onSaveFilters={handleSaveFilters}
              onAddFilter={() => setShowChooser(true)}
            />
            {showChooser && (
              <div className="mt-4" data-testid="section-filter-chooser">
                <FilterChooser
                  categories={categories}
                  onClose={handleCloseChooser}
                  onCategoriesChange={setCategories}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="chooser">
            <FilterChooser
              categories={categories}
              onClose={handleCloseChooser}
              onCategoriesChange={setCategories}
            />
          </TabsContent>

          <TabsContent value="range">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h2 className="text-sm font-semibold text-[#232a31]" data-testid="text-range-title">
                  Range Input Filters
                </h2>
                <div className="space-y-3">
                  <RangeInputFilter
                    label="Years of Consecutive Positive EPS"
                    onChange={(val) =>
                      toast({
                        title: "Range Changed",
                        description: `${val.condition}: ${val.value}`,
                      })
                    }
                  />
                  <RangeInputFilter
                    label="Gross Profit Margin %"
                    defaultCondition="Less than"
                    onChange={(val) =>
                      toast({
                        title: "Range Changed",
                        description: `${val.condition}: ${val.value}`,
                      })
                    }
                  />
                  <RangeInputFilter
                    label="Est. EPS Growth (%)"
                    conditions={["Greater than", "Less than", "Equal to", "Between", "Not equal to"]}
                    onChange={(val) =>
                      toast({
                        title: "Range Changed",
                        description: `${val.condition}: ${val.value}`,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-[#5b636a]" data-testid="text-menu-placeholder">
                  Menu component will be added here from the Menu4 Figma design.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
