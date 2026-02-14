import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Download,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  FileJson,
  BookOpen,
  Link2,
  Layers,
  ArrowRightLeft,
} from "lucide-react";

interface RegistryEntry {
  key: string;
  displayName: string;
  description: string;
  version: number;
  category: string;
  componentType: "chart" | "control";
  tags: string[];
  integrationTargets: string[];
  demoUrl: string;
  lastUpdated: string;
}

interface IntegrationTarget {
  app: string;
  slug: string;
  role: "consumer" | "producer";
  description: string;
  dataContract: Record<string, any>;
}

interface ExportPackage {
  manifest: {
    component: string;
    displayName: string;
    version: number;
    exportedAt: string;
    sourceApp: string;
    sourceSlug: string;
    demoUrl: string;
  };
  schemas: {
    dataSchema: Record<string, any>;
    configSchema: Record<string, any>;
    outputSchema: Record<string, any>;
  };
  defaults: Record<string, any>;
  exampleData: Record<string, any>;
  exampleConfig: Record<string, any>;
  documentation: string;
  infrastructureNotes: string;
  integrationGuide: string;
  integrationTargets: IntegrationTarget[];
  sourceFiles: string[];
}

type TabId = "overview" | "schemas" | "integration" | "guide";

function SchemaBlock({ title, schema }: { title: string; schema: Record<string, any> }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(schema, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-[#232a31]">{title}</h4>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          data-testid={`button-copy-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
      </div>
      <pre className="text-[10px] leading-tight bg-[#f5f8fa] dark:bg-muted p-2 rounded-md overflow-x-auto max-h-[300px] overflow-y-auto border font-mono">
        {json}
      </pre>
    </div>
  );
}

function ComponentDetail({ componentKey, onBack }: { componentKey: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [guideCopied, setGuideCopied] = useState(false);

  const { data: pkg, isLoading } = useQuery<ExportPackage>({
    queryKey: ["/api/components", componentKey],
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
        <div className="animate-pulse space-y-2">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Button>
        <p className="text-sm text-muted-foreground mt-2">Component not found.</p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof FileJson }[] = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "schemas", label: "Schemas", icon: FileJson },
    { id: "integration", label: "Targets", icon: ArrowRightLeft },
    { id: "guide", label: "Guide", icon: BookOpen },
  ];

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${componentKey}-export-v${pkg.manifest.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(pkg.integrationGuide);
    setGuideCopied(true);
    setTimeout(() => setGuideCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
          </Button>
          <h2 className="text-base font-semibold text-[#232a31]" data-testid="text-component-name">
            {pkg.manifest.displayName}
          </h2>
          <Badge variant="secondary" className="text-[10px]">v{pkg.manifest.version}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(pkg.manifest.demoUrl, "_blank")}
            data-testid="button-open-demo"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" /> Demo
          </Button>
          <Button size="sm" onClick={handleDownload} data-testid="button-download-export">
            <Download className="w-3.5 h-3.5 mr-1" /> Export Package
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#0f69ff] text-[#0f69ff]"
                : "border-transparent text-[#5b636a] hover:text-[#232a31]"
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs text-[#5b636a]" data-testid="text-component-docs">{pkg.documentation}</p>
              {pkg.infrastructureNotes && (
                <p className="text-[10px] text-muted-foreground italic">{pkg.infrastructureNotes}</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-3">
                <h4 className="text-[10px] font-semibold text-muted-foreground mb-1">MANIFEST</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">{pkg.manifest.sourceApp}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Slug</span>
                    <span className="font-mono text-[10px]">{pkg.manifest.sourceSlug}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Version</span>
                    <span>{pkg.manifest.version}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <h4 className="text-[10px] font-semibold text-muted-foreground mb-1">SOURCE FILES</h4>
                <div className="space-y-0.5">
                  {pkg.sourceFiles.map((f) => (
                    <p key={f} className="text-[10px] font-mono text-[#5b636a] truncate">{f}</p>
                  ))}
                  {pkg.sourceFiles.length === 0 && (
                    <p className="text-[10px] text-muted-foreground">No source files specified</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-3">
              <h4 className="text-[10px] font-semibold text-muted-foreground mb-2">EXAMPLE DATA</h4>
              <pre className="text-[10px] leading-tight bg-[#f5f8fa] dark:bg-muted p-2 rounded-md overflow-x-auto max-h-[200px] overflow-y-auto border font-mono">
                {JSON.stringify(pkg.exampleData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "schemas" && (
        <div className="space-y-3">
          <SchemaBlock title="Data Schema (Input)" schema={pkg.schemas.dataSchema} />
          <SchemaBlock title="Config Schema" schema={pkg.schemas.configSchema} />
          <SchemaBlock title="Output Schema" schema={pkg.schemas.outputSchema} />
          <SchemaBlock title="Defaults" schema={pkg.defaults} />
        </div>
      )}

      {activeTab === "integration" && (
        <div className="space-y-3">
          {pkg.integrationTargets.length === 0 ? (
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">No integration targets defined for this component.</p>
              </CardContent>
            </Card>
          ) : (
            pkg.integrationTargets.map((target) => (
              <Card key={target.slug} data-testid={`target-${target.slug}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#0f69ff]" />
                    <h4 className="text-sm font-semibold">{target.app}</h4>
                    <Badge
                      variant={target.role === "producer" ? "default" : "secondary"}
                      className="text-[9px]"
                    >
                      {target.role === "producer" ? "Sends Data" : "Receives Data"}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono">{target.slug}</Badge>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <p className="text-xs text-[#5b636a]">{target.description}</p>
                  <div>
                    <h5 className="text-[10px] font-semibold text-muted-foreground mb-1">DATA CONTRACT</h5>
                    <pre className="text-[10px] leading-tight bg-[#f5f8fa] dark:bg-muted p-2 rounded-md overflow-x-auto max-h-[250px] overflow-y-auto border font-mono">
                      {JSON.stringify(target.dataContract, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "guide" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-[#232a31]">Integration Guide</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyGuide}
              data-testid="button-copy-guide"
            >
              {guideCopied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {guideCopied ? "Copied" : "Copy Guide"}
            </Button>
          </div>
          <Card>
            <CardContent className="p-3">
              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans text-[#232a31]">
                {pkg.integrationGuide}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function ComponentExportPage() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: components = [], isLoading } = useQuery<RegistryEntry[]>({
    queryKey: ["/api/components"],
  });

  if (selectedKey) {
    return <ComponentDetail componentKey={selectedKey} onBack={() => setSelectedKey(null)} />;
  }

  const categories = Array.from(new Set(components.map((c) => c.category))).sort();
  const filtered = categoryFilter
    ? components.filter((c) => c.category === categoryFilter)
    : components;

  const withTargets = filtered.filter((c) => c.integrationTargets.length > 0);
  const standalone = filtered.filter((c) => c.integrationTargets.length === 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-base font-semibold text-[#232a31]" data-testid="heading-export-page">
            Component Export
          </h1>
          <p className="text-xs text-[#5b636a]">
            Browse, preview, and export component packages for integration with AnyComp, Conductor, and other ecosystem tools.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">{components.length} components</Badge>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <Button
          size="sm"
          variant={categoryFilter === null ? "default" : "outline"}
          onClick={() => setCategoryFilter(null)}
          data-testid="filter-all"
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? "default" : "outline"}
            onClick={() => setCategoryFilter(cat)}
            data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {withTargets.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            INTEGRATED COMPONENTS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {withTargets.map((comp) => (
              <Card
                key={comp.key}
                className="cursor-pointer hover-elevate"
                onClick={() => setSelectedKey(comp.key)}
                data-testid={`component-card-${comp.key}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0f69ff]" />
                      <span className="text-sm font-semibold text-[#232a31]">{comp.displayName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[9px]">{comp.category}</Badge>
                      <Badge variant="outline" className="text-[9px]">v{comp.version}</Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#5b636a] line-clamp-2 mb-2">{comp.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {comp.integrationTargets.map((t) => (
                        <Badge key={t} variant="outline" className="text-[9px] font-mono">{t}</Badge>
                      ))}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {standalone.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            STANDALONE COMPONENTS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {standalone.map((comp) => (
              <button
                key={comp.key}
                onClick={() => setSelectedKey(comp.key)}
                className="text-left p-2 rounded-md border text-xs hover-elevate"
                data-testid={`component-tile-${comp.key}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <Badge variant="secondary" className="text-[9px] shrink-0">{comp.category}</Badge>
                  <span className="font-medium truncate text-[#232a31]">{comp.displayName}</span>
                </div>
                <p className="text-muted-foreground text-[10px] line-clamp-2">{comp.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  {comp.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[8px]">{tag}</Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-md" />
          ))}
        </div>
      )}
    </div>
  );
}
