import { Badge } from "@/components/ui/badge";
import type { SectionHeaderMeta } from "./types";

interface SectionHeaderProps {
  section: SectionHeaderMeta;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ section, actions, className = "" }: SectionHeaderProps) {
  const Icon = section.icon;

  return (
    <div className={`flex items-center justify-between gap-2 flex-wrap ${className}`} data-testid={`section-header-${section.id}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${section.color}`} />
        <span className="text-sm font-medium">{section.label}</span>
        <Badge variant="secondary" className="text-xs">{section.metricCount}</Badge>
        {section.alertCount !== undefined && section.alertCount > 0 && (
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            {section.alertCount} alert{section.alertCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}
