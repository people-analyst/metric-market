import { useState, useCallback } from "react";
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterItem {
  id: string;
  label: string;
  type: "badge" | "toggle" | "add" | "input";
  options?: string[];
  selected?: string[];
  placeholder?: string;
  sublabel?: string;
  sublabelOptions?: string[];
  inputValue?: string;
  hasIcon?: boolean;
  hasRemove?: boolean;
}

interface StockScreenerFiltersProps {
  title?: string;
  subtitle?: string;
  filters: FilterItem[];
  estimatedResults?: number;
  onFiltersChange?: (filters: FilterItem[]) => void;
  onFindStocks?: (filters: FilterItem[]) => void;
  onSaveFilters?: (filters: FilterItem[]) => void;
  onAddFilter?: () => void;
  onAddBadge?: (filterId: string) => void;
  className?: string;
}

export function StockScreenerFilters({
  title = "Build Stocks screener with filters below",
  subtitle = "Currency in USD",
  filters: initialFilters,
  estimatedResults = 1,
  onFiltersChange,
  onFindStocks,
  onSaveFilters,
  onAddFilter,
  onAddBadge,
  className = "",
}: StockScreenerFiltersProps) {
  const [filters, setFilters] = useState<FilterItem[]>(initialFilters);

  const updateFilters = useCallback(
    (updated: FilterItem[]) => {
      setFilters(updated);
      onFiltersChange?.(updated);
    },
    [onFiltersChange]
  );

  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      updateFilters(filters.filter((f) => f.id !== filterId));
    },
    [filters, updateFilters]
  );

  const handleRemoveBadge = useCallback(
    (filterId: string, badgeValue: string) => {
      updateFilters(
        filters.map((f) =>
          f.id === filterId
            ? { ...f, selected: f.selected?.filter((s) => s !== badgeValue) }
            : f
        )
      );
    },
    [filters, updateFilters]
  );

  const handleToggleChange = useCallback(
    (filterId: string, values: string[]) => {
      updateFilters(
        filters.map((f) => (f.id === filterId ? { ...f, selected: values } : f))
      );
    },
    [filters, updateFilters]
  );

  const handleInputChange = useCallback(
    (filterId: string, value: string) => {
      updateFilters(
        filters.map((f) =>
          f.id === filterId ? { ...f, inputValue: value } : f
        )
      );
    },
    [filters, updateFilters]
  );

  const handleSublabelChange = useCallback(
    (filterId: string, value: string) => {
      updateFilters(
        filters.map((f) =>
          f.id === filterId ? { ...f, sublabel: value } : f
        )
      );
    },
    [filters, updateFilters]
  );

  return (
    <div className={`flex gap-5 ${className}`}>
      <div className="flex-1 max-w-[800px]">
        <div className="mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <ChevronDownIcon
              className="w-4 h-4 text-[#232a31]"
              data-testid="icon-collapse-header"
            />
            <h1
              className="font-semibold text-[#232a31] text-sm"
              data-testid="text-screener-title"
            >
              {title}
            </h1>
            <span
              className="font-normal text-[#5b636a] text-xs"
              data-testid="text-screener-subtitle"
            >
              {subtitle}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          {filters.map((filter) => (
            <Card
              key={filter.id}
              className="bg-white rounded-[3px] border-0 shadow-none"
              data-testid={`card-filter-${filter.id}`}
            >
              <CardContent className="px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    {filter.type === "input" ? (
                      <div className="flex flex-col min-w-[170px]">
                        <span className="font-normal text-[#5b636a] text-xs whitespace-nowrap">
                          {filter.label}
                        </span>
                        {filter.sublabelOptions ? (
                          <Select
                            value={filter.sublabel}
                            onValueChange={(val) =>
                              handleSublabelChange(filter.id, val)
                            }
                          >
                            <SelectTrigger
                              className="border-0 p-0 h-auto text-xs text-[#0f69ff] font-normal shadow-none focus:ring-0 w-auto gap-0.5"
                              data-testid={`select-condition-${filter.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {filter.sublabelOptions.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : filter.sublabel ? (
                          <span className="font-normal text-[#0f69ff] text-xs flex items-center gap-0.5">
                            {filter.sublabel}
                            <ChevronDownIcon className="w-3 h-3" />
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="font-normal text-[#5b636a] text-xs whitespace-nowrap min-w-[170px]">
                        {filter.label}
                      </span>
                    )}

                    {filter.type === "badge" && (
                      <div className="flex gap-1 flex-wrap">
                        {filter.selected?.map((item) => (
                          <Badge
                            key={item}
                            variant="secondary"
                            className="bg-[#e0f0ff] text-[#232a31] font-normal text-xs px-2 py-0.5 h-auto rounded-[3px] cursor-pointer"
                            data-testid={`badge-filter-${filter.id}-${item.replace(/\s+/g, "-").toLowerCase()}`}
                            onClick={() => handleRemoveBadge(filter.id, item)}
                          >
                            {item}
                            <XIcon className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAddBadge?.(filter.id)}
                          data-testid={`button-add-badge-${filter.id}`}
                        >
                          <PlusIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {filter.type === "toggle" && (
                      <ToggleGroup
                        type="multiple"
                        value={filter.selected || []}
                        onValueChange={(vals) =>
                          handleToggleChange(filter.id, vals)
                        }
                        className="border border-[#e0e4e9] rounded-[3px] p-0"
                        data-testid={`toggle-group-${filter.id}`}
                      >
                        {filter.options?.map((option) => (
                          <ToggleGroupItem
                            key={option}
                            value={option}
                            className="font-normal text-[#5b636a] text-xs px-3 py-1 rounded-none border-r border-[#e0e4e9] last:border-r-0 data-[state=on]:bg-[#e0f0ff] data-[state=on]:text-[#232a31]"
                            data-testid={`toggle-${filter.id}-${option.replace(/\s+/g, "-").toLowerCase()}`}
                          >
                            {option}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )}

                    {filter.type === "add" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-normal text-[#5b636a] text-xs"
                        onClick={() => onAddBadge?.(filter.id)}
                        data-testid={`button-add-${filter.id}`}
                      >
                        <PlusIcon className="w-3 h-3 mr-1" />
                        Add {filter.placeholder}
                      </Button>
                    )}

                    {filter.type === "input" && (
                      <Input
                        type="text"
                        value={filter.inputValue || ""}
                        onChange={(e) =>
                          handleInputChange(filter.id, e.target.value)
                        }
                        className="w-20 text-xs border-[#e0e4e9] rounded-[3px]"
                        data-testid={`input-value-${filter.id}`}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {filter.hasIcon && (
                      <div
                        className="w-5 h-5 rounded-full bg-[#6c2bd9] flex items-center justify-center flex-shrink-0"
                        data-testid={`icon-info-${filter.id}`}
                      >
                        <span className="text-white text-[8px] font-bold">
                          P
                        </span>
                      </div>
                    )}
                    {filter.hasRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#5b636a] flex-shrink-0"
                        onClick={() => handleRemoveFilter(filter.id)}
                        data-testid={`button-remove-filter-${filter.id}`}
                      >
                        <XIcon className="w-3.5 h-3.5" />
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
          size="sm"
          className="mt-3 font-normal text-[#0f69ff] text-xs"
          onClick={onAddFilter}
          data-testid="button-add-another-filter"
        >
          <PlusIcon className="w-3.5 h-3.5 mr-1" />
          Add another filter
        </Button>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            size="sm"
            className="bg-[#0f69ff] font-normal text-white text-xs rounded-[3px]"
            onClick={() => onFindStocks?.(filters)}
            data-testid="button-find-stocks"
          >
            Find Stocks
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#0f69ff] text-[#0f69ff] font-normal text-xs rounded-[3px]"
            onClick={() => onSaveFilters?.(filters)}
            data-testid="button-save-filters"
          >
            Save Filters
          </Button>
        </div>
      </div>

      <div className="w-[140px] flex-shrink-0">
        <div className="border-l-[3px] border-[#e0e4e9] pl-3">
          <p
            className="font-normal text-[#232a31] text-xs mb-0.5"
            data-testid="text-estimated-results-label"
          >
            Estimated results
          </p>
          <p
            className="font-semibold text-[#232a31] text-2xl"
            data-testid="text-estimated-results-value"
          >
            {estimatedResults}
          </p>
        </div>
      </div>
    </div>
  );
}