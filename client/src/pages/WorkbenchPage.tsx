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
import { Plus, Trash2, Eye, ChevronDown, ChevronRight } from "lucide-react";
import type { MetricDefinition, ChartConfig, Card as CardType, ChartType } from "@shared/schema";
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
};

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
  const [form, setForm] = useState({ name: "", chartType: "" as string, description: "" });
  const { toast } = useToast();

  const { data: configs = [], isLoading } = useQuery<ChartConfig[]>({ queryKey: ["/api/chart-configs"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/chart-configs", { ...data, settings: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chart-configs"] });
      setForm({ name: "", chartType: "", description: "" });
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
                <Input placeholder="Config name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-config-name" />
                <Select value={form.chartType} onValueChange={(v) => setForm({ ...form, chartType: v })}>
                  <SelectTrigger data-testid="select-chart-type">
                    <SelectValue placeholder="Chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map((ct) => (
                      <SelectItem key={ct} value={ct} data-testid={`option-chart-${ct}`}>{CHART_TYPE_LABELS[ct] || ct}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-config-description" />
              <div className="flex gap-2">
                <Button size="sm" disabled={!form.name || !form.chartType || createMutation.isPending} onClick={() => createMutation.mutate(form)} data-testid="button-save-config">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel-config">Cancel</Button>
              </div>
            </div>
          )}
          {isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
          {configs.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 text-xs border-b border-border pb-1" data-testid={`config-row-${c.id}`}>
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="secondary" className="text-[10px] bg-[#e0f0ff] text-[#0f69ff] shrink-0">{CHART_TYPE_LABELS[c.chartType] || c.chartType}</Badge>
                <span className="font-medium truncate">{c.name}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-config-${c.id}`}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
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
  const [form, setForm] = useState({ title: "", subtitle: "", metricId: "", chartConfigId: "", sourceAttribution: "", tagsStr: "" });
  const { toast } = useToast();

  const { data: cardsList = [], isLoading } = useQuery<CardType[]>({ queryKey: ["/api/cards"] });
  const { data: metrics = [] } = useQuery<MetricDefinition[]>({ queryKey: ["/api/metric-definitions"] });
  const { data: configs = [] } = useQuery<ChartConfig[]>({ queryKey: ["/api/chart-configs"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setForm({ title: "", subtitle: "", metricId: "", chartConfigId: "", sourceAttribution: "", tagsStr: "" });
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
      sourceAttribution: form.sourceAttribution || undefined,
      tags: tags.length > 0 ? tags : undefined,
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
                    <SelectValue placeholder="Link chart config (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({CHART_TYPE_LABELS[c.chartType] || c.chartType})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            return (
              <div key={c.id} className="flex items-center justify-between gap-2 text-xs border-b border-border pb-1" data-testid={`card-row-${c.id}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={c.isPublished ? "default" : "secondary"} className={`text-[10px] shrink-0 ${c.isPublished ? "bg-[#0f69ff]" : ""}`}>
                    {c.isPublished ? "Published" : c.status}
                  </Badge>
                  <span className="font-medium truncate">{c.title}</span>
                  {config && <span className="text-muted-foreground truncate">{CHART_TYPE_LABELS[config.chartType] || config.chartType}</span>}
                  {metric && <span className="text-muted-foreground truncate">{metric.name}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
            <p className="text-xs text-muted-foreground">No cards yet. Create metrics and chart configs first, then add cards.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function ApiReferenceSection() {
  const [expanded, setExpanded] = useState(false);

  const endpoints = [
    { method: "GET", path: "/api/metric-definitions", desc: "List all metric definitions" },
    { method: "POST", path: "/api/metric-definitions", desc: "Create a metric definition" },
    { method: "PATCH", path: "/api/metric-definitions/:id", desc: "Update a metric definition" },
    { method: "DELETE", path: "/api/metric-definitions/:id", desc: "Delete a metric definition" },
    { method: "GET", path: "/api/chart-configs", desc: "List all chart configurations" },
    { method: "POST", path: "/api/chart-configs", desc: "Create a chart configuration" },
    { method: "PATCH", path: "/api/chart-configs/:id", desc: "Update a chart configuration" },
    { method: "DELETE", path: "/api/chart-configs/:id", desc: "Delete a chart configuration" },
    { method: "GET", path: "/api/cards", desc: "List all cards" },
    { method: "POST", path: "/api/cards", desc: "Create a card (links metric + chart config)" },
    { method: "PATCH", path: "/api/cards/:id", desc: "Update a card" },
    { method: "DELETE", path: "/api/cards/:id", desc: "Delete a card" },
    { method: "GET", path: "/api/cards/:id/data", desc: "List all data snapshots for a card" },
    { method: "GET", path: "/api/cards/:id/data/latest", desc: "Get latest data payload for a card" },
    { method: "POST", path: "/api/cards/:id/data", desc: "Push new data payload (spoke apps call this)" },
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
              <span className={`w-12 font-bold ${methodColor[ep.method] || ""}`}>{ep.method}</span>
              <span className="text-foreground">{ep.path}</span>
              <span className="text-muted-foreground ml-auto text-right font-sans">{ep.desc}</span>
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
        <p className="text-xs text-muted-foreground mt-0.5">Define metrics, configure charts, and assemble cards. Spoke apps push data via the API.</p>
      </div>
      <MetricDefinitionsSection />
      <ChartConfigsSection />
      <CardsSection />
      <ApiReferenceSection />
    </div>
  );
}
