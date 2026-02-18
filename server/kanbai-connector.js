const KANBAI_URL = "http://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev";
const DEPLOY_SECRET = process.env.DEPLOY_SECRET_KEY;

const kanbaiHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${DEPLOY_SECRET}`,
});

export async function pullBoard() {
  const resp = await fetch(`${KANBAI_URL}/api/pull/board/metric-market`, { headers: kanbaiHeaders() });
  if (!resp.ok) throw new Error("Failed to pull board: " + resp.status);
  return resp.json();
}

export async function pullUpdates(since) {
  const resp = await fetch(`${KANBAI_URL}/api/pull/updates?since=${encodeURIComponent(since)}&app=metric-market`, { headers: kanbaiHeaders() });
  if (!resp.ok) throw new Error("Failed to pull updates: " + resp.status);
  return resp.json();
}

export async function claimTask(cardId, agentId) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/claim`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId }),
  });
  return resp.json();
}

export async function reportProgress(cardId, agentId, status, notes) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/progress`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId, status, notes }),
  });
  return resp.json();
}

export async function completeTask(cardId, agentId, completionNotes) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/complete`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId, completionNotes }),
  });
  return resp.json();
}

export async function getAvailableTasks(priority) {
  const qs = priority ? `&priority=${priority}` : "";
  const resp = await fetch(`${KANBAI_URL}/api/agent/available?app=metric-market${qs}`, { headers: kanbaiHeaders() });
  return resp.json();
}

export async function releaseTask(cardId, agentId) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/release`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ cardId, agentId }),
  });
  return resp.json();
}

export async function getSchema() {
  const resp = await fetch(`${KANBAI_URL}/api/kanban/schema`, { headers: kanbaiHeaders() });
  return resp.json();
}

export async function getSpokeConfig() {
  const resp = await fetch(`${KANBAI_URL}/api/kanban/spoke-config?app=metric-market`, { headers: kanbaiHeaders() });
  return resp.json();
}

export async function getCards(page = 1, limit = 100) {
  const resp = await fetch(`${KANBAI_URL}/api/kanban/cards?app=metric-market&page=${page}&limit=${limit}`, { headers: kanbaiHeaders() });
  return resp.json();
}

export async function registerWebhook(callbackUrl) {
  const resp = await fetch(`${KANBAI_URL}/api/webhooks/register`, {
    method: "POST", headers: kanbaiHeaders(),
    body: JSON.stringify({ appSlug: "metric-market", callbackUrl }),
  });
  return resp.json();
}
