const KANBAI_URL = process.env.KANBAI_URL || "https://people-analytics-kanban.replit.app";
const APP_SLUG = process.env.HUB_APP_SLUG || "metric-market";

function headers() {
  return { "Content-Type": "application/json" };
}

export async function createKanbaiCard(opts: {
  title: string;
  description?: string;
  priority?: string;
  source?: string;
  sourceId?: string;
}) {
  try {
    const res = await fetch(`${KANBAI_URL}/api/cards`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        title: opts.title,
        description: opts.description || "",
        priority: opts.priority || "medium",
        status: "todo",
        source: opts.source || APP_SLUG,
        sourceId: opts.sourceId,
        labels: [APP_SLUG],
      }),
    });
    if (!res.ok) {
      console.log(`[kanbai] Failed to create card (${res.status})`);
      return null;
    }
    const card = await res.json();
    console.log(`[kanbai] Card created: ${card.id || "ok"} — ${opts.title}`);
    return card;
  } catch (e: any) {
    console.log(`[kanbai] Create card error: ${e.message}`);
    return null;
  }
}

export async function updateKanbaiCard(cardId: string, updates: {
  status?: string;
  description?: string;
}) {
  try {
    const res = await fetch(`${KANBAI_URL}/api/cards/${cardId}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      console.log(`[kanbai] Failed to update card ${cardId} (${res.status})`);
      return null;
    }
    return res.json();
  } catch (e: any) {
    console.log(`[kanbai] Update card error: ${e.message}`);
    return null;
  }
}

export async function listKanbaiCards(filters?: { source?: string; status?: string }) {
  try {
    const params = new URLSearchParams();
    if (filters?.source) params.set("source", filters.source);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${KANBAI_URL}/api/cards${qs}`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  } catch (e: any) {
    console.log(`[kanbai] List cards error: ${e.message}`);
    return [];
  }
}
