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
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      console.log(`[kanbai] Create card: unexpected content-type (${ct})`);
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
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
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
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return [];
    return res.json();
  } catch (e: any) {
    console.log(`[kanbai] List cards error: ${e.message}`);
    return [];
  }
}

export interface KanbaiEpic {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
}

export async function listKanbaiEpics(): Promise<KanbaiEpic[]> {
  try {
    const res = await fetch(`${KANBAI_URL}/api/kanban/epics`, { headers: headers() });
    if (!res.ok) {
      console.log(`[kanbai] Failed to list epics (${res.status})`);
      return [];
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return [];
    return res.json();
  } catch (e: any) {
    console.log(`[kanbai] List epics error: ${e.message}`);
    return [];
  }
}

export async function createKanbaiEpic(opts: {
  name: string;
  description?: string;
  status?: string;
}): Promise<KanbaiEpic | null> {
  try {
    const res = await fetch(`${KANBAI_URL}/api/kanban/epics`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name: opts.name,
        description: opts.description || null,
        status: opts.status || "not_started",
      }),
    });
    if (!res.ok) {
      console.log(`[kanbai] Failed to create epic (${res.status})`);
      return null;
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    const epic = await res.json();
    console.log(`[kanbai] Epic created: ${epic.id} — ${opts.name}`);
    return epic;
  } catch (e: any) {
    console.log(`[kanbai] Create epic error: ${e.message}`);
    return null;
  }
}

export async function updateKanbaiEpic(epicId: number, updates: {
  name?: string;
  description?: string;
  status?: string;
}): Promise<KanbaiEpic | null> {
  try {
    const res = await fetch(`${KANBAI_URL}/api/kanban/epics/${epicId}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      console.log(`[kanbai] Failed to update epic ${epicId} (${res.status})`);
      return null;
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return res.json();
  } catch (e: any) {
    console.log(`[kanbai] Update epic error: ${e.message}`);
    return null;
  }
}

export async function deleteKanbaiEpic(epicId: number): Promise<boolean> {
  try {
    const res = await fetch(`${KANBAI_URL}/api/kanban/epics/${epicId}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) {
      console.log(`[kanbai] Failed to delete epic ${epicId} (${res.status})`);
      return false;
    }
    console.log(`[kanbai] Epic deleted: ${epicId}`);
    return true;
  } catch (e: any) {
    console.log(`[kanbai] Delete epic error: ${e.message}`);
    return false;
  }
}

export async function assignCardToEpic(cardId: number, epicId: number | null): Promise<boolean> {
  try {
    const res = await fetch(`${KANBAI_URL}/api/kanban/cards/${cardId}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ epicId }),
    });
    if (!res.ok) {
      console.log(`[kanbai] Failed to assign card ${cardId} to epic ${epicId} (${res.status})`);
      return false;
    }
    console.log(`[kanbai] Card ${cardId} → epic ${epicId}`);
    return true;
  } catch (e: any) {
    console.log(`[kanbai] Assign card to epic error: ${e.message}`);
    return false;
  }
}

export async function findOrCreateEpic(name: string, description?: string): Promise<KanbaiEpic | null> {
  const epics = await listKanbaiEpics();
  const existing = epics.find((e) => e.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    console.log(`[kanbai] Found existing epic: ${existing.id} — ${existing.name}`);
    return existing;
  }
  return createKanbaiEpic({ name, description });
}
