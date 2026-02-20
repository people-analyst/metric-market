// ── Kanbai Connector v2.1.3 for metric-market ──────────────────
// Set one of DEPLOY_SECRET_KEY, DEPLOY_SECRET, or HUB_API_KEY in your Replit Secrets.
// v2.1.3 changelog: fetch timeout (10s), HTTP error → local:true, SDK version header

const KANBAI_URL = process.env.KANBAI_URL || "https://people-analytics-kanban.replit.app";
const DEPLOY_SECRET = process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY;
const CONNECTOR_VERSION = "2.1.3";

if (!DEPLOY_SECRET) {
  console.error("[Kanbai] WARNING: No auth secret found. Set DEPLOY_SECRET_KEY, DEPLOY_SECRET, or HUB_API_KEY.");
}

const kanbaiHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY}`,
  "X-Kanbai-SDK-Version": CONNECTOR_VERSION,
  "X-Kanbai-Spoke-App": "metric-market",
});

async function safeHubCall(url, options, label) {
  try {
    const resp = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
    const text = await resp.text();
    try {
      const parsed = JSON.parse(text);
      if (!resp.ok || parsed.error) {
        console.warn(`[Kanbai] ${label}: Hub returned error. Status: ${resp.status}, error: ${parsed.error || "unknown"}`);
        parsed.local = true;
        if (!parsed.error) parsed.error = "hub_error_" + resp.status;
      }
      return parsed;
    } catch {
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        console.warn(`[Kanbai] ${label}: Hub returned HTML (redirect or auth page). Status: ${resp.status}`);
        return { error: "hub_html_response", status: resp.status, local: true };
      }
      return { error: "invalid_json", status: resp.status, local: true };
    }
  } catch (err) {
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    console.warn(`[Kanbai] ${label}: Hub ${isTimeout ? "timed out (10s)" : "unreachable"} — ${err.message}`);
    return { error: err.message, local: true };
  }
}

async function getLocalAvailableTasks(priority) {
  if (!process.env.DATABASE_URL) return { cards: [] };
  try {
    const pg = await import("pg");
    const Pool = pg.default?.Pool || pg.Pool;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const agentStatuses = ["backlog", "planned", "planning", "prioritization", "assignment"];
    let query = "SELECT * FROM kanban_cards WHERE status = ANY($1) AND (app_target = $2 OR app_target IS NULL)";
    const params = [agentStatuses, "metric-market"];
    if (priority) { query += " AND priority = $" + (params.length + 1); params.push(priority); }
    query += " ORDER BY CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END LIMIT 5";
    const result = await pool.query(query, params);
    await pool.end();
    const cards = result.rows.map(r => ({
      id: r.id, title: r.title, type: r.type, priority: r.priority,
      status: r.status, description: r.description,
      acceptanceCriteria: r.acceptance_criteria,
      technicalNotes: r.technical_notes, tags: r.tags,
      appTarget: r.app_target, assignedTo: r.assigned_to,
    }));
    console.log(`[Kanbai] Local fallback: found ${cards.length} available tasks`);
    return { cards, source: "local" };
  } catch (err) {
    console.warn("[Kanbai] Local task discovery failed:", err.message);
    return { cards: [] };
  }
}

export async function pullBoard() {
  return safeHubCall(`${KANBAI_URL}/api/pull/board/metric-market`, { headers: kanbaiHeaders() }, "pullBoard");
}

export async function pullUpdates(since) {
  return safeHubCall(`${KANBAI_URL}/api/pull/updates?since=${encodeURIComponent(since)}&app=metric-market`, { headers: kanbaiHeaders() }, "pullUpdates");
}

export async function claimTask(cardId, agentId) {
  return safeHubCall(`${KANBAI_URL}/api/agent/claim`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId }),
  }, "claimTask");
}

export async function reportProgress(cardId, agentId, status, notes) {
  return safeHubCall(`${KANBAI_URL}/api/agent/progress`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId, status, notes }),
  }, "reportProgress");
}

export async function completeTask(cardId, agentId, completionNotes) {
  return safeHubCall(`${KANBAI_URL}/api/agent/complete`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId, completionNotes }),
  }, "completeTask");
}

export async function getAvailableTasks(priority) {
  const qs = priority ? `&priority=${priority}` : "";
  const data = await safeHubCall(`${KANBAI_URL}/api/agent/available?app=metric-market${qs}`, { headers: kanbaiHeaders() }, "getAvailableTasks");
  if (data.local || data.error || !data.cards || data.cards.length === 0) {
    const localData = await getLocalAvailableTasks(priority);
    if (localData.cards.length > 0) return localData;
  }
  return data;
}

export async function releaseTask(cardId, agentId) {
  return safeHubCall(`${KANBAI_URL}/api/agent/release`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId }),
  }, "releaseTask");
}

export async function getSchema() {
  return safeHubCall(`${KANBAI_URL}/api/kanban/schema`, { headers: kanbaiHeaders() }, "getSchema");
}

export async function getSpokeConfig() {
  return safeHubCall(`${KANBAI_URL}/api/kanban/spoke-config?app=metric-market`, { headers: kanbaiHeaders() }, "getSpokeConfig");
}

export async function getCards(page = 1, limit = 100) {
  return safeHubCall(`${KANBAI_URL}/api/kanban/cards?app=metric-market&page=${page}&limit=${limit}`, { headers: kanbaiHeaders() }, "getCards");
}

export async function registerWebhook(callbackUrl) {
  return safeHubCall(`${KANBAI_URL}/api/webhooks/register`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ appSlug: "metric-market", callbackUrl }),
  }, "registerWebhook");
}

export { safeHubCall, KANBAI_URL, getLocalAvailableTasks };
