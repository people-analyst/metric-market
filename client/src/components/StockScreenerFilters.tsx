import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface FilterItem {
  id: string;
  label: string;
  type: "badge" | "toggle" | "add" | "input";
  options?: string[];
  selected?: string[];
  placeholder?: string;
  sublabel?: string;
  hasIcon?: boolean;
  hasRemove?: boolean;
}

interface StockScreenerFiltersProps {
  title?: string;
  subtitle?: string;
  filters: FilterItem[];
  estimatedResults?: number;
  onFindStocks?: () => void;
  onSaveFilters?: () => void;
  onAddFilter?: () => void;
  onRemoveFilter?: (filterId: string) => void;
}

export function StockScreenerFilters({
  title = "Build Stocks screener with filters below",
  subtitle = "Currency in USD",
  filters,
  estimatedResults = 1,
  onFindStocks,
  onSaveFilters,
  onAddFilter,
  onRemoveFilter,
}: StockScreenerFiltersProps) {
  return (
    <div className="flex gap-5">
      <div className="flex-1 max-w-[800px]">
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ChevronDownIcon className="w-4 h-4 text-[#232a31]" />
            <h1 className="font-normal text-[#232a31] text-lg">
              {title}
            </h1>
          </div>
          <p className="font-normal text-[#5b636a] text-xs ml-6">
            {subtitle}
          </p>
        </div>

        <div className="space-y-1.5">
          {filters.map((filter) => (
            <Card
              key={filter.id}
              className="bg-white rounded-[3px] border-0 shadow-none"
            >
              <CardContent className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-normal text-[#5b636a] text-xs whitespace-nowrap min-w-[170px]">
                      {filter.label}
                    </span>

                    {filter.type === "badge" && (
                      <div className="flex gap-1">
                        {filter.selected?.map((item, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-[#e0f0ff] text-[#232a31] hover:bg-[#e0f0ff] font-normal text-xs px-2 py-1 h-auto rounded-[3px]"
                          >
                            {item}
                            <XIcon className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[3px]"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {filter.type === "toggle" && (
                      <ToggleGroup
                        type="multiple"
                        defaultValue={filter.selected}
                        className="border border-[#e0e4e9] rounded-[3px] h-7 p-0"
                      >
                        {filter.options?.map((option, idx) => (
                          <ToggleGroupItem
                            key={idx}
                            value={option}
                            className="font-normal text-[#5b636a] text-xs px-3 h-full rounded-none border-r border-[#e0e4e9] last:border-r-0 data-[state=on]:bg-[#e0f0ff] data-[state=on]:text-[#232a31]"
                          >
                            {option}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}

                    {filter.type === "add" && (
                      <Button
                        variant="ghost"
                        className="font-normal text-[#5b636a] text-xs h-auto p-1"
                      >
                        <PlusIcon className="w-3 h-3 mr-1" />
                        {filter.placeholder}
                      </Button>
                    )}

                    {filter.type === "input" && (
                      <div className="flex flex-col gap-0.5">
                        <div className="border border-[#e0e4e9] rounded-[3px] h-7 w-20 px-2" />
                        {filter.sublabel && (
                          <span className="font-normal text-[#0f69ff] text-xs">
                            {filter.sublabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {filter.hasIcon && (
                      <div className="w-4 h-4 rounded-full bg-[#6c2bd9] flex items-center justify-center">
                        <ChevronDownIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    {filter.hasRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full text-[#5b636a]"
                        onClick={() => onRemoveFilter?.(filter.id)}
                      >
                        <XIcon className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="ghost"
          className="mt-3 font-normal text-[#0f69ff] text-xs h-auto p-1"
          onClick={onAddFilter}
        >
          <PlusIcon className="w-3.5 h-3.5 mr-1" />
          Add another filter
        </Button>

        <div className="flex gap-2 mt-4">
          <Button
            className="bg-[#0f69ff] hover:bg-[#0f69ff]/90 font-normal text-white text-xs px-5 h-8 rounded-[3px]"
            onClick={onFindStocks}
          >
            Find Stocks
          </Button>
          <Button
            variant="outline"
            className="border-[#0f69ff] text-[#0f69ff] hover:bg-[#0f69ff]/10 font-normal text-xs px-5 h-8 rounded-[3px]"
            onClick={onSaveFilters}
          >
            Save Filters
          </Button>
        </div>
      </div>

      <div className="w-[150px]">
        <div className="border-l-[3px] border-[#e0e4e9] pl-3">
          <p className="font-normal text-[#232a31] text-xs mb-1">
            Estimated results
          </p>
          <p className="font-normal text-[#232a31] text-xl">
            {estimatedResults}
          </p>
        </div>
      </div>
    </div>
  );
}