import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardWrapper } from "@/components/CardWrapper";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, ChevronDown, ChevronRight, BookOpen, Link2 } from "lucide-react";
import type { MetricDefinition, ChartConfig, Card as CardType, CardBundle } from "@shared/schema";
import { CHART_TYPES } from "@shared/schema";

const CHART_TYPE_LABELS: Record<string, string> = {
  confidence_band: "Confidence Band",
  alluvial: "Alluvial / Sankey",
  waffle_bar: "Waffle Bar",
  bullet_bar: "Bullet Bar",
  slope_comparison: "Slope Comparison",
  bubble_scatter: "Bubble Scatter",
  box_whisker: "Box & Whisker",
  strip_timeline: "Strip Timeline",
  waffle_percent: "Waffle Percent",
  heatmap: "Heatmap",
  strip_dot: "Strip Dot",
  multi_line: "Multi Line",
  tile_cartogram: "Tile Cartogram",
  timeline_milestone: "Timeline Milestone",
  control: "Control Chart",
  dendrogram: "Dendrogram",
  radial_bar: "Radial Bar",
  bump: "Bump Chart",
  sparkline_rows: "Sparkline Rows",
  stacked_area: "Stacked Area",
  range_strip: "Range Strip",
};

function BundleBrowserSection() {
  const [expanded, setExpanded] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { data: bundles = [], isLoading } = useQuery<CardBundle[]>({ queryKey: ["/api/bundles"] });

  const selected = bundles.find((b) => b.key === selectedKey);

  return (
    <Card data-testid="section-bundles">
      <CardHeader
        className="flex flex-row items-center justify-between gap-2 cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <h2 className="text-sm font-semibold" data-testid="heading-bundles">Card Bundles</h2>
          <Badge variant="secondary" className="text-[10px]">{bundles.length}</Badge>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {isLoading && <p className="text-xs text-muted-foreground">Loading bundles...</p>}
          <div className="grid grid-cols-2 gap-1.5">
            {bundles.map((b) => (
              <button
                key={b.key}
                onClick={() => setSelectedKey(selectedKey === b.key ? null : b.key)}
                className={`text-left p-2 rounded-md border text-xs transition-colors ${selectedKey === b.key ? "border-[#0f69ff] bg-[#e0f0ff]" : "border-border hover-elevate"}`}
                data-testid={`bundle-tile-${b.key}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Badge variant="secondary" className="text-[9px] shrink-0">{b.category}</Badge>
                  <span className="font-medium truncate">{b.displayName}</span>
                </div>
                <p className="text-muted-foreground text-[10px] line-clamp-2">{b.description}</p>
              </button>
            ))}
          </div>
          {selected && (
            <div className="border border-[#0f69ff] rounded-md p-3 space-y-3 bg-[#e0f0ff]/20" data-testid="bundle-detail">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">{selected.displayName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="secondary" className="text-[9px]">v{selected.version}</Badge>
                  <Badge variant="secondary" className="text-[9px] bg-[#e0f0ff] text-[#0f69ff]">{selected.chartType}</Badge>
                </div>
              </div>
              {selected.tags && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map((t) => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
                </div>
              )}
              {selected.documentation && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <BookOpen className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Documentation</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{selected.documentation}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Data Schema</span>
                  <pre className="text-[10px] bg-[#232a31] text-[#e0f0ff] p-2 rounded-md overflow-auto max-h-40 font-mono" data-testid="bundle-data-schema">
                    {JSON.stringify(selected.dataSchema, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Config Schema</span>
                  <pre className="text-[10px] bg-[#232a31] text-[#e0f0ff] p-2 rounded-md overflow-auto max-h-40 font-mono" data-testid="bundle-config-schema">
                    {JSON.stringify(selected.configSchema, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Example Data</span>
                  <pre className="text-[10px] bg-[#232a31] text-[#e0f0ff] p-2 rounded-md overflow-auto max-h-40 font-mono" data-testid="bundle-example-data">
                    {JSON.stringify(selected.exampleData, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Example Config</span>
                  <pre className="text-[10px] bg-[#232a31] text-[#e0f0ff] p-2 rounded-md overflow-auto max-h-40 font-mono" data-testid="bundle-example-config">
                    {JSON.stringify(selected.exampleConfig, null, 2)}
                  </pre>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Preview (Example Data)</span>
                <div className="bg-background rounded-md p-2 border border-border">
                  <CardWrapper
                    title={selected.displayName}
                    subtitle="Bundle preview with example data"
                    chartType={selected.chartType as any}
                    chartProps={selected.exampleData as Record<string, any>}
                    tags={selected.tags ?? undefined}
                    periodLabel={`v${selected.version}`}
                  />
                </div>
              </div>
              {selected.infrastructureNotes && (
                <p className="text-[10px] text-muted-foreground italic">{selected.infrastructureNotes}</p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function MetricDefinitionsSection() {
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ key: "", name: "", category: "", unit: "", source: "", description: "", cadence: "" });
  const { toast } = useToast();

  const { data: metrics = [], isLoading } = useQuery<MetricDefinition[]>({ queryKey: ["/api/metric-definitions"] });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/metric-definitions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metric-definitions"] });
      setForm({ key: "", name: "", category: "", unit: "", source: "", description: "", cadence: "" });
      setShowForm(false);
      toast({ title: "Metric created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/metric-definitions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metric-definitions"] });
      toast({ title: "Metric deleted" });
    },
  });

  return (
    <Card data-testid="section-metrics">
      <CardHeader
        className="flex flex-row items-center justify-between gap-2 cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <h2 className="text-sm font-semibold" data-testid="heading-metrics">Metric Definitions</h2>
          <Badge variant="secondary" className="text-[10px]">{metrics.length}</Badge>
        </div>
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}
          data-testid="button-add-metric"
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {showForm && (
            <div className="border border-border rounded-md p-3 space-y-2" data-testid="form-metric">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="key (e.g. attrition_rate)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} data-testid="input-metric-key" />
                <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-metric-name" />
                <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="input-metric-category" />
                <Input placeholder="Unit (%, count, $)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} data-testid="input-metric-unit" />
                <Input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} data-testid="input-metric-source" />
                <Input placeholder="Cadence (monthly, quarterly)" value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value })} data-testid="input-metric-cadence" />
              </div>
              <Textarea placeholder="Description / calculation notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="text-xs" data-testid="input-metric-description" />
              <div className="flex gap-2">
                <Button size="sm" disabled={!form.key || !form.name || !form.category || createMutation.isPending} onClick={() => createMutation.mutate(form)} data-testid="button-save-metric">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel-metric">Cancel</Button>
              </div>
            </div>
          )}
          {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
          {metrics.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 text-xs border-b border-border pb-1" data-testid={`metric-row-${m.key}`}>
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="secondary" className="text-[10px] shrink-0">{m.category}</Badge>
                <span className="font-medium truncate">{m.name}</span>
                <span className="text-muted-foreground truncate">{m.key}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {m.unit && <span className="text-muted-foreground">{m.unit}</span>}
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(m.id)} data-testid={`button-delete-metric-${m.key}`}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && metrics.length === 0 && !showForm && (
            <p className="text-xs text-muted-foreground">No metrics defined yet. Click Add to create one.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function ChartConfigsSection() {
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", chartType: "" as string, description: "", bundleId: "" });
  const { toast } = useToast();

  const { data: configs = [], isLoading } = useQuery<ChartConfig[]>({ queryKey: ["/api/chart-configs"] });
  const { data: bundles = [] } = useQuery<CardBundle[]>({ queryKey: ["/api/bundles"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/chart-configs", { ...data, settings: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-configs"] });
      setForm({ name: "", chartType: "", description: "", bundleId: "" });
      setShowForm(false);
      toast({ title: "Chart config created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/chart-configs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-configs"] });
      toast({ title: "Config deleted" });
    },
  });

  const handleBundleSelect = (bundleId: string) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (bundle) {
      setForm({ ...form, bundleId, chartType: bundle.chartType, name: form.name || bundle.displayName });
    }
  };

  return (
    <Card data-testid="section-chart-configs">
      <CardHeader
        className="flex flex-row items-center justify-between gap-2 cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <h2 className="text-sm font-semibold" data-testid="heading-chart-configs">Chart Configurations</h2>
          <Badge variant="secondary" className="text-[10px]">{configs.length}</Badge>
        </div>
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}
          data-testid="button-add-config"
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {showForm && (
            <div className="border border-border rounded-md p-3 space-y-2" data-testid="form-chart-config">
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.bundleId} onValueChange={handleBundleSelect}>
                  <SelectTrigger data-testid="select-bundle">
                    <SelectValue placeholder="Select bundle" />
                  </SelectTrigger>
                  <SelectContent>
                    {bundles.map((b) => (
                      <SelectItem key={b.id} value={b.id} data-testid={`option-bundle-${b.key}`}>{b.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Config name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-config-name" />
              </div>
              <Select value={form.chartType} onValueChange={(v) => setForm({ ...form, chartType: v })}>
                <SelectTrigger data-testid="select-chart-type">
                  <SelectValue placeholder="Chart type (auto-filled from bundle)" />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct} data-testid={`option-chart-${ct}`}>{CHART_TYPE_LABELS[ct] || ct}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-config-description" />
              <div className="flex gap-2">
                <Button size="sm" disabled={!form.name || !form.chartType || createMutation.isPending} onClick={() => createMutation.mutate(form)} data-testid="button-save-config">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel-config">Cancel</Button>
              </div>
            </div>
          )}
          {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
          {configs.map((c) => {
            const bundle = bundles.find((b) => b.id === c.bundleId);
            return (
              <div key={c.id} className="flex items-center justify-between gap-2 text-xs border-b border-border pb-1" data-testid={`config-row-${c.id}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="secondary" className="text-[10px] bg-[#e0f0ff] text-[#0f69ff] shrink-0">{CHART_TYPE_LABELS[c.chartType] || c.chartType}</Badge>
                  <span className="font-medium truncate">{c.name}</span>
                  {bundle && <span className="text-muted-foreground text-[10px] truncate">{bundle.displayName}</span>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-config-${c.id}`}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
          {!isLoading && configs.length === 0 && !showForm && (
            <p className="text-xs text-muted-foreground">No chart configs yet. Click Add to create one.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function CardsSection() {
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", metricId: "", chartConfigId: "", bundleId: "", sourceAttribution: "", tagsStr: "", refreshPolicy: "manual", importance: "", significance: "", relevance: "" });
  const { toast } = useToast();

  const { data: cardsList = [], isLoading } = useQuery<CardType[]>({ queryKey: ["/api/cards"] });
  const { data: metrics = [] } = useQuery<MetricDefinition[]>({ queryKey: ["/api/metric-definitions"] });
  const { data: configs = [] } = useQuery<ChartConfig[]>({ queryKey: ["/api/chart-configs"] });
  const { data: bundles = [] } = useQuery<CardBundle[]>({ queryKey: ["/api/bundles"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setForm({ title: "", subtitle: "", metricId: "", chartConfigId: "", bundleId: "", sourceAttribution: "", tagsStr: "", refreshPolicy: "manual", importance: "", significance: "", relevance: "" });
      setShowForm(false);
      toast({ title: "Card created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({ title: "Card deleted" });
    },
  });

  const handleCreate = () => {
    const tags = form.tagsStr ? form.tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [];
    createMutation.mutate({
      title: form.title,
      subtitle: form.subtitle || undefined,
      metricId: form.metricId || undefined,
      chartConfigId: form.chartConfigId || undefined,
      bundleId: form.bundleId || undefined,
      sourceAttribution: form.sourceAttribution || undefined,
      tags: tags.length > 0 ? tags : undefined,
      refreshPolicy: form.refreshPolicy,
      importance: form.importance ? parseFloat(form.importance) : undefined,
      significance: form.significance ? parseFloat(form.significance) : undefined,
      relevance: form.relevance ? parseFloat(form.relevance) : undefined,
    });
  };

  return (
    <Card data-testid="section-cards">
      <CardHeader
        className="flex flex-row items-center justify-between gap-2 cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <h2 className="text-sm font-semibold" data-testid="heading-cards">Cards</h2>
          <Badge variant="secondary" className="text-[10px]">{cardsList.length}</Badge>
        </div>
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}
          data-testid="button-add-card"
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {showForm && (
            <div className="border border-border rounded-md p-3 space-y-2" data-testid="form-card">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Card title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-card-title" />
                <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} data-testid="input-card-subtitle" />
                <Select value={form.bundleId} onValueChange={(v) => setForm({ ...form, bundleId: v })}>
                  <SelectTrigger data-testid="select-card-bundle">
                    <SelectValue placeholder="Select bundle" />
                  </SelectTrigger>
                  <SelectContent>
                    {bundles.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.metricId} onValueChange={(v) => setForm({ ...form, metricId: v })}>
                  <SelectTrigger data-testid="select-card-metric">
                    <SelectValue placeholder="Link metric (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {metrics.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.chartConfigId} onValueChange={(v) => setForm({ ...form, chartConfigId: v })}>
                  <SelectTrigger data-testid="select-card-config">
                    <SelectValue placeholder="Chart config (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({CHART_TYPE_LABELS[c.chartType] || c.chartType})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.refreshPolicy} onValueChange={(v) => setForm({ ...form, refreshPolicy: v })}>
                  <SelectTrigger data-testid="select-card-refresh">
                    <SelectValue placeholder="Refresh policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="on_demand">On Demand</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Importance (0-1)" type="number" step="0.1" min="0" max="1" value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value })} data-testid="input-card-importance" />
                <Input placeholder="Significance (0-1)" type="number" step="0.1" min="0" max="1" value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value })} data-testid="input-card-significance" />
                <Input placeholder="Relevance (0-1)" type="number" step="0.1" min="0" max="1" value={form.relevance} onChange={(e) => setForm({ ...form, relevance: e.target.value })} data-testid="input-card-relevance" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Source attribution" value={form.sourceAttribution} onChange={(e) => setForm({ ...form, sourceAttribution: e.target.value })} data-testid="input-card-source" />
                <Input placeholder="Tags (comma separated)" value={form.tagsStr} onChange={(e) => setForm({ ...form, tagsStr: e.target.value })} data-testid="input-card-tags" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={!form.title || createMutation.isPending} onClick={handleCreate} data-testid="button-save-card">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel-card">Cancel</Button>
              </div>
            </div>
          )}
          {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
          {cardsList.map((c) => {
            const config = configs.find((cfg) => cfg.id === c.chartConfigId);
            const metric = metrics.find((m) => m.id === c.metricId);
            const bundle = bundles.find((b) => b.id === c.bundleId);
            return (
              <div key={c.id} className="flex items-center justify-between gap-2 text-xs border-b border-border pb-1" data-testid={`card-row-${c.id}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={c.isPublished ? "default" : "secondary"} className={`text-[10px] shrink-0 ${c.isPublished ? "bg-[#0f69ff]" : ""}`}>
                    {c.isPublished ? "Published" : c.status}
                  </Badge>
                  <span className="font-medium truncate">{c.title}</span>
                  {bundle && <Badge variant="secondary" className="text-[9px] shrink-0">{bundle.displayName}</Badge>}
                  {config && <span className="text-muted-foreground truncate">{CHART_TYPE_LABELS[config.chartType] || config.chartType}</span>}
                  {metric && <span className="text-muted-foreground truncate">{metric.name}</span>}
                  {c.refreshStatus && c.refreshStatus !== "current" && (
                    <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-800 shrink-0">{c.refreshStatus}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {c.importance != null && <span className="text-[9px] text-muted-foreground" title="Importance">I:{c.importance}</span>}
                  {c.tags?.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  <Button size="icon" variant="ghost" onClick={() => setPreviewId(previewId === c.id ? null : c.id)} data-testid={`button-preview-card-${c.id}`}>
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-card-${c.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          {!isLoading && cardsList.length === 0 && !showForm && (
            <p className="text-xs text-muted-foreground">No cards yet. Select a bundle, create metrics and chart configs, then add cards.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function RelationsSection() {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sourceCardId: "", targetCardId: "", relationType: "drilldown", label: "" });
  const { toast } = useToast();

  const { data: cardsList = [] } = useQuery<CardType[]>({ queryKey: ["/api/cards"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/card-relations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setForm({ sourceCardId: "", targetCardId: "", relationType: "drilldown", label: "" });
      setShowForm(false);
      toast({ title: "Relation created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Card data-testid="section-relations">
      <CardHeader
        className="flex flex-row items-center justify-between gap-2 cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Link2 className="w-4 h-4" />
          <h2 className="text-sm font-semibold" data-testid="heading-relations">Card Relations (Drill-downs)</h2>
        </div>
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); setExpanded(true); }}
          data-testid="button-add-relation"
        >
          <Plus className="w-3 h-3 mr-1" /> Link
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {showForm && (
            <div className="border border-border rounded-md p-3 space-y-2" data-testid="form-relation">
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.sourceCardId} onValueChange={(v) => setForm({ ...form, sourceCardId: v })}>
                  <SelectTrigger data-testid="select-source-card">
                    <SelectValue placeholder="Source card" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardsList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.targetCardId} onValueChange={(v) => setForm({ ...form, targetCardId: v })}>
                  <SelectTrigger data-testid="select-target-card">
                    <SelectValue placeholder="Target card (drill-down)" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardsList.filter((c) => c.id !== form.sourceCardId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.relationType} onValueChange={(v) => setForm({ ...form, relationType: v })}>
                  <SelectTrigger data-testid="select-relation-type">
                    <SelectValue placeholder="Relation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drilldown">Drill-down</SelectItem>
                    <SelectItem value="component_of">Component of</SelectItem>
                    <SelectItem value="related">Related</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Label (optional)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} data-testid="input-relation-label" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={!form.sourceCardId || !form.targetCardId || createMutation.isPending} onClick={() => createMutation.mutate(form)} data-testid="button-save-relation">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel-relation">Cancel</Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Link cards together to create drill-down paths. A parent card can reference sub-measure cards. These links are stored in the database and available via GET /api/cards/:id/drilldowns.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

function ApiReferenceSection() {
  const [expanded, setExpanded] = useState(false);

  const endpoints = [
    { method: "GET", path: "/api/bundles", desc: "List all card bundles (chart type contracts)" },
    { method: "GET", path: "/api/bundles/:id", desc: "Get bundle by ID" },
    { method: "GET", path: "/api/bundles/key/:key", desc: "Get bundle by key (e.g. multi_line)" },
    { method: "GET", path: "/api/metric-definitions", desc: "List all metric definitions" },
    { method: "POST", path: "/api/metric-definitions", desc: "Create a metric definition" },
    { method: "PATCH", path: "/api/metric-definitions/:id", desc: "Update a metric definition" },
    { method: "DELETE", path: "/api/metric-definitions/:id", desc: "Delete a metric definition" },
    { method: "GET", path: "/api/chart-configs", desc: "List all chart configurations" },
    { method: "POST", path: "/api/chart-configs", desc: "Create a chart configuration" },
    { method: "PATCH", path: "/api/chart-configs/:id", desc: "Update a chart configuration" },
    { method: "DELETE", path: "/api/chart-configs/:id", desc: "Delete a chart configuration" },
    { method: "GET", path: "/api/cards", desc: "List all cards" },
    { method: "GET", path: "/api/cards/:id/full", desc: "Get card with bundle, config, metric, latest data, and relations" },
    { method: "POST", path: "/api/cards", desc: "Create a card (links bundle + metric + chart config)" },
    { method: "PATCH", path: "/api/cards/:id", desc: "Update a card (scoring, refresh, metadata)" },
    { method: "DELETE", path: "/api/cards/:id", desc: "Delete a card" },
    { method: "GET", path: "/api/cards/:id/data", desc: "List all data snapshots for a card" },
    { method: "GET", path: "/api/cards/:id/data/latest", desc: "Get latest data payload for a card" },
    { method: "POST", path: "/api/cards/:id/data", desc: "Push new data payload (auto-updates refresh status)" },
    { method: "GET", path: "/api/cards/:id/drilldowns", desc: "Get drill-down cards linked from this card" },
    { method: "GET", path: "/api/cards/:id/relations", desc: "Get all relations for a card" },
    { method: "POST", path: "/api/card-relations", desc: "Create a card relation (drilldown, component_of, related, parent)" },
    { method: "DELETE", path: "/api/card-relations/:id", desc: "Delete a card relation" },
    { method: "GET", path: "/api/chart-types", desc: "List all available chart types" },
  ];

  const methodColor: Record<string, string> = {
    GET: "text-[#0f69ff]",
    POST: "text-emerald-600",
    PATCH: "text-amber-600",
    DELETE: "text-red-600",
  };

  return (
    <Card data-testid="section-api-reference">
      <CardHeader
        className="flex flex-row items-center gap-2 cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <h2 className="text-sm font-semibold" data-testid="heading-api">API Reference</h2>
        <Badge variant="secondary" className="text-[10px]">{endpoints.length} endpoints</Badge>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-1">
          {endpoints.map((ep) => (
            <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-2 text-xs font-mono" data-testid={`api-row-${ep.method}-${ep.path}`}>
              <span className={`w-14 font-bold shrink-0 ${methodColor[ep.method] || ""}`}>{ep.method}</span>
              <span className="text-foreground shrink-0">{ep.path}</span>
              <span className="text-muted-foreground ml-auto text-right font-sans truncate">{ep.desc}</span>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function WorkbenchPage() {
  return (
    <div className="p-4 space-y-4 max-w-4xl" data-testid="page-workbench">
      <div>
        <h1 className="text-base font-bold text-foreground" data-testid="heading-workbench">Workbench</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Browse bundles, define metrics, configure charts, assemble cards, and link drill-downs. Spoke apps push data via the API.</p>
      </div>
      <BundleBrowserSection />
      <MetricDefinitionsSection />
      <ChartConfigsSection />
      <CardsSection />
      <RelationsSection />
      <ApiReferenceSection />
    </div>
  );
}
