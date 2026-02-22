import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CardWrapper } from "@/components/CardWrapper";
import type { Card as CardType } from "@shared/schema";

function EcosystemCardTile({ cardId }: { cardId: string }) {
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

  return (
    <CardWrapper
      title={full.card.title}
      subtitle={full.card.subtitle ?? full.latestData?.periodLabel}
      chartType={chartType as any}
      chartProps={payload}
      tags={full.card.tags ?? undefined}
      sourceAttribution={full.card.sourceAttribution ?? undefined}
      periodLabel={full.latestData?.periodLabel}
    />
  );
}

export function EcosystemHealthPage() {
  const { data: cards = [], isLoading } = useQuery<CardType[]>({ queryKey: ["/api/cards"] });
  const ecosystemCards = cards.filter(
    (c) => c.sourceAttribution === "Product Kanban" || (c.tags && c.tags.includes("development-ops"))
  );

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4" data-testid="page-ecosystem-health">
      <h1 className="text-xl font-semibold">Ecosystem Health Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Velocity, burndown, app health, and sprint health from Product Kanban. Data pushed via POST /api/ingest/product-kanban (6h cadence).
      </p>
      {isLoading && <p className="text-sm text-muted-foreground">Loading cards…</p>}
      {!isLoading && ecosystemCards.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">No Product Kanban cards yet. Push velocity, burndown, appHealth, or summary via POST /api/ingest/product-kanban.</p>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {ecosystemCards.map((c) => (
          <EcosystemCardTile key={c.id} cardId={c.id} />
        ))}
      </div>
    </div>
  );
}
