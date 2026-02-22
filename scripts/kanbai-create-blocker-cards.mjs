#!/usr/bin/env node
/**
 * Create Kanbai blocker cards for Metric Market (and spokes).
 * Usage: node scripts/kanbai-create-blocker-cards.mjs
 * Env: KANBAI_URL (default https://people-analytics-kanban.replit.app)
 */
const KANBAI_URL = process.env.KANBAI_URL || "https://people-analytics-kanban.replit.app";
const APP_SLUG = process.env.HUB_APP_SLUG || "metric-market";

const BLOCKER_CARDS = [
  {
    title: "[Blocked] #105 — Segment dimension filtering (Metric Market)",
    description: `Add Segment Dimension Filtering Across Cards is blocked until Segmentation Studio exposes population dimensions (department, location, tenure) and frontend filter state can be shared across card views.

Do not start #105 until segment API/source is defined. See docs/KANBAI_METRIC_MARKET_STATUS.md and .kanbai/NOTES.md.`,
    priority: "medium",
    labels: [APP_SLUG, "blocked", "segmentation-studio"],
  },
  {
    title: "Align directive handling to Hub contract (DIRECTIVES_SYSTEM.md)",
    description: `Our app reported "Hub returned 502" or "Hub not configured" when checking directives. Do the following so the directive system works:

1. **Env:** Set HUB_URL (Hub base URL) and HUB_API_KEY (this app's API key from the Hub registry). If we use HUB_PAT_TOKEN for the same value, set that.

2. **Fetch:** Call the Hub (not our own server): GET {HUB_URL}/api/hub/app/{our-slug}/directives?status=pending with header X-API-Key: {HUB_API_KEY}. Use our app's slug from the Hub registry.

3. **Complete:** After handling each directive, update the Hub: PATCH {HUB_URL}/api/hub/app/{our-slug}/directives/{directiveId} with body { "status": "completed", "response": "..." } or POST .../directives/{id}/complete.

4. **Optional:** Expose POST /api/hub/process-directives (or keep npm run directives) that fetches from Hub, runs our handler, then PATCHes/complete back.

Full contract and troubleshooting: docs/DIRECTIVES_SYSTEM.md in the Hub repo. HANDOFF_DIRECTIVES_AND_CARDS.md links to it.`,
    priority: "high",
    labels: [APP_SLUG, "directives", "hub"],
  },
];

async function createCard(card) {
  const res = await fetch(`${KANBAI_URL}/api/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: card.title,
      description: card.description || "",
      priority: card.priority || "medium",
      status: "todo",
      source: APP_SLUG,
      labels: card.labels || [APP_SLUG],
    }),
  });
  if (!res.ok) {
    console.log("  Failed:", res.status, await res.text());
    return null;
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

async function main() {
  console.log("Creating", BLOCKER_CARDS.length, "blocker cards at", KANBAI_URL);
  for (const card of BLOCKER_CARDS) {
    try {
      const created = await createCard(card);
      if (created) console.log("  Created:", created.id, "—", card.title.slice(0, 50) + "...");
      else console.log("  Skip:", card.title.slice(0, 50) + "...");
    } catch (e) {
      console.log("  Error:", card.title.slice(0, 40) + "...", e.message);
    }
  }
  console.log("Done.");
}

main();
