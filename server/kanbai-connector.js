const KANBAI_URL = "https://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev";
const DEPLOY_SECRET = process.env.DEPLOY_SECRET_KEY;

const kanbaiHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${DEPLOY_SECRET}`,
});

async function safeHubCall(url, options, label) {
  try {
    const resp = await fetch(url, options);
    const text = await resp.text();
    try { return JSON.parse(text); } catch {
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        console.warn(`[Kanbai] ${label}: Hub returned HTML (redirect or auth page). Status: ${resp.status}`);
        return { error: "hub_html_response", status: resp.status, local: true };
      }
      return { error: "invalid_json", status: resp.status, local: true };
    }
  } catch (err) {
    console.warn(`[Kanbai] ${label}: Hub unreachable — ${err.message}`);
    return { error: err.message, local: true };
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
  return safeHubCall(`${KANBAI_URL}/api/agent/available?app=metric-market${qs}`, { headers: kanbaiHeaders() }, "getAvailableTasks");
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

export { safeHubCall, KANBAI_URL };
