import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardWrapper } from "@/components/CardWrapper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Card as CardType } from "@shared/schema";

type Scenario = "base" | "optimistic" | "pessimistic";

function ForecastCardTile({ cardId, scenario }: { cardId: string; scenario: Scenario }) {
  const { data: full, isLoading } = useQuery<{
    card: CardType;
    bundle?: { chartType: string };
    latestData?: { payload: Record<string, unknown>; periodLabel?: string };
  }>({
    queryKey: ["/api/cards", cardId, "full"],
    queryFn: async () => {
      const r = await fetch(`/api/cards/${cardId}/full`);
      if (!r.ok) throw new Error("Failed to load card");
      return r.json();
    },
  });

  if (isLoading || !full) return <Card className="p-4"><CardContent><p className="text-sm text-muted-foreground">Loading…</p></CardContent></Card>;
  const chartType = full.bundle?.chartType;
  const payload = full.latestData?.payload ?? {};
  const chartProps = { ...payload, scenario };

  return (
    <CardWrapper
      title={full.card.title}
      subtitle={full.card.subtitle ?? full.latestData?.periodLabel}
      chartType={chartType as any}
      chartProps={chartProps}
      tags={full.card.tags ?? undefined}
      sourceAttribution={full.card.sourceAttribution ?? undefined}
      periodLabel={full.latestData?.periodLabel}
    />
  );
}

export function ForecastDashboardPage() {
  const [scenario, setScenario] = useState<Scenario>("base");

  const { data: cards = [], isLoading } = useQuery<CardType[]>({ queryKey: ["/api/cards"] });
  const forecastCards = cards.filter((c) => c.sourceAttribution === "PeopleAnalyst");

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4" data-testid="page-forecast-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Forecast Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Scenario:</span>
          <Select value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
            <SelectTrigger className="w-[140px]" data-testid="select-scenario">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base case</SelectItem>
              <SelectItem value="optimistic">Optimistic</SelectItem>
              <SelectItem value="pessimistic">Pessimistic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Confidence band cards and headcount projections from PeopleAnalyst. Toggle scenario to compare views.
      </p>
      {isLoading && <p className="text-sm text-muted-foreground">Loading cards…</p>}
      {!isLoading && forecastCards.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">No PeopleAnalyst forecast cards yet. Push data via POST /api/ingest/people-analyst.</p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {forecastCards.map((c) => (
          <ForecastCardTile key={c.id} cardId={c.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
