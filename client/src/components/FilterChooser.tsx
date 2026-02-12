import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export interface FilterOption {
  id: string;
  label: string;
  checked?: boolean;
}

export interface FilterCategory {
  id: string;
  title: string;
  hasIcon?: boolean;
  options: FilterOption[];
}

interface FilterChooserProps {
  categories: FilterCategory[];
  onClose?: () => void;
  onFilterChange?: (categoryId: string, optionId: string, checked: boolean) => void;
}

export function FilterChooser({
  categories,
  onClose,
  onFilterChange,
}: FilterChooserProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map((category) => ({
    ...category,
    options: category.options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.options.length > 0);

  return (
    <div className="bg-white rounded-[3px] border border-[#e0e4e9] p-5 max-w-[800px]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="font-normal text-[#232a31] text-sm">
          Choose filters to screen Stocks
        </p>
        <div className="relative w-[220px]">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5b636a]" />
          <Input
            placeholder="Find Filters"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs border-[#e0e4e9] rounded-[3px]"
          />
        </div>
      </div>

      {filteredCategories.map((category) => (
        <div key={category.id} className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="font-bold text-[#232a31] text-xs">
              {category.title}
            </h3>
            {category.hasIcon && (
              <div className="w-4 h-4 rounded-full bg-[#6c2bd9] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">Y</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-1.5">
            {category.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={option.checked}
                  onCheckedChange={(checked) =>
                    onFilterChange?.(category.id, option.id, !!checked)
                  }
                  className="h-4 w-4 rounded-[3px] border-[#e0e4e9] data-[state=checked]:bg-[#0f69ff] data-[state=checked]:border-[#0f69ff]"
                />
                <span className="font-normal text-[#232a31] text-xs">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <Button
        className="mt-2 bg-[#0f69ff] hover:bg-[#0f69ff]/90 font-normal text-white text-xs px-5 h-8 rounded-[3px]"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
}