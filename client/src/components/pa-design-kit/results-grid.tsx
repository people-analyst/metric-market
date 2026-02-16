import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { OutputCard, type OutputCardData } from "./output-card";

interface ResultsFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeTags?: string[];
  onTagToggle?: (tag: string) => void;
  availableTags?: string[];
  sortOptions?: { label: string; value: string }[];
  activeSort?: string;
  onSortChange?: (value: string) => void;
  resultCount?: number;
  className?: string;
}

export function ResultsFilters({
  searchValue,
  onSearchChange,
  activeTags = [],
  onTagToggle,
  availableTags = [],
  resultCount,
  className,
}: ResultsFiltersProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags ? availableTags : availableTags.slice(0, 8);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="pl-8 h-8 text-sm"
            data-testid="input-results-search"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2"
              data-testid="button-clear-search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {resultCount !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {resultCount} results
          </span>
        )}
      </div>

      {availableTags.length > 0 && onTagToggle && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <SlidersHorizontal className="h-3 w-3 text-muted-foreground shrink-0" />
          {visibleTags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "text-xs cursor-pointer",
                activeTags.includes(tag) && "toggle-elevate toggle-elevated",
              )}
              onClick={() => onTagToggle(tag)}
              data-testid={`filter-tag-${tag}`}
            >
              {tag}
            </Badge>
          ))}
          {availableTags.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowAllTags(!showAllTags)}
              data-testid="button-toggle-tags"
            >
              {showAllTags ? "Less" : `+${availableTags.length - 8} more`}
            </Button>
          )}
          {activeTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => activeTags.forEach((t) => onTagToggle!(t))}
              data-testid="button-clear-filters"
            >
              <X className="h-3 w-3 mr-0.5" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultsGridProps {
  items: OutputCardData[];
  title?: string;
  icon?: any;
  emptyMessage?: string;
  compact?: boolean;
  maxVisible?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  searchable?: boolean;
  filterable?: boolean;
  className?: string;
}

export function ResultsGrid({
  items,
  title,
  icon,
  emptyMessage = "No results",
  compact = false,
  maxVisible,
  showLoadMore = false,
  onLoadMore,
  searchable = false,
  filterable = false,
  className,
}: ResultsGridProps) {
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (activeTags.length > 0) {
      result = result.filter((item) =>
        activeTags.some((t) => item.tags?.includes(t)),
      );
    }
    return result;
  }, [items, search, activeTags]);

  const visible = maxVisible ? filtered.slice(0, maxVisible) : filtered;
  const hasMore = maxVisible ? filtered.length > maxVisible : false;
  const IconComp = icon;

  const handleTagToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(title || searchable || filterable) && (
        <div className="space-y-2">
          {title && (
            <div className="flex items-center gap-2">
              {IconComp && <IconComp className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm font-medium">{title}</span>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {filtered.length}
              </Badge>
            </div>
          )}
          {(searchable || filterable) && (
            <ResultsFilters
              searchValue={search}
              onSearchChange={setSearch}
              activeTags={filterable ? activeTags : []}
              onTagToggle={filterable ? handleTagToggle : undefined}
              availableTags={filterable ? allTags : []}
              resultCount={search || activeTags.length > 0 ? filtered.length : undefined}
            />
          )}
        </div>
      )}

      <div className="divide-y">
        {visible.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          visible.map((item) => (
            <OutputCard key={item.id} item={item} compact={compact} />
          ))
        )}
      </div>

      {(hasMore || showLoadMore) && (
        <div className="flex justify-center pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={onLoadMore}
            data-testid="button-load-more"
          >
            <ChevronDown className="h-3 w-3 mr-1" />
            Show more
          </Button>
        </div>
      )}
    </div>
  );
}
