const HUB_URL = process.env.HUB_URL || "";
const APP_SLUG = process.env.HUB_APP_SLUG || "metric-market";
const API_KEY = process.env.HUB_API_KEY || "";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
}

export async function fetchDirectives(status?: string) {
  const url = status
    ? `${HUB_URL}/api/hub/app/${APP_SLUG}/directives?status=${status}`
    : `${HUB_URL}/api/hub/app/${APP_SLUG}/directives`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Hub responded ${res.status}`);
  return res.json();
}

export async function updateDirective(directiveId: string, status: string, response?: string) {
  const body: any = { status };
  if (response) body.response = response;
  const res = await fetch(
    `${HUB_URL}/api/hub/app/${APP_SLUG}/directives/${directiveId}`,
    { method: "PATCH", headers: getHeaders(), body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`Hub responded ${res.status}`);
  return res.json();
}

export async function pushDocumentation(content: string, version: string) {
  const res = await fetch(
    `${HUB_URL}/api/hub/app/${APP_SLUG}/documentation`,
    { method: "POST", headers: getHeaders(), body: JSON.stringify({ content, version }) }
  );
  if (!res.ok) throw new Error(`Hub responded ${res.status}`);
  return res.json();
}

export async function fetchRegistry() {
  const res = await fetch(`${HUB_URL}/api/hub/registry`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Hub responded ${res.status}`);
  return res.json();
}

export async function fetchArchitecture() {
  const res = await fetch(`${HUB_URL}/api/hub/architecture`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Hub responded ${res.status}`);
  return res.json();
}

export async function acknowledgeDirective(directiveId: string) {
  return updateDirective(directiveId, "acknowledged");
}

export async function completeDirective(directiveId: string, response: string) {
  return updateDirective(directiveId, "completed", response);
}

export async function rejectDirective(directiveId: string, reason: string) {
  return updateDirective(directiveId, "rejected", reason);
}

export function isConfigured(): boolean {
  return !!(HUB_URL && API_KEY);
}

export { HUB_URL, APP_SLUG };
