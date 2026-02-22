#!/usr/bin/env node
/**
 * Mark completed Metric Market Kanbai cards as done.
 * Card refs from .kanbai/NOTES.md and docs/KANBAI_METRIC_MARKET_STATUS.md.
 * Usage: node scripts/kanbai-close-completed.mjs
 * Env: KANBAI_URL (default https://people-analytics-kanban.replit.app)
 */
const KANBAI_URL = process.env.KANBAI_URL || "https://people-analytics-kanban.replit.app";

const COMPLETED_CARD_IDS = [
  50, 62, 72, 83, 85, 86, 88, 89, 90, 91, 92, 101, 102, 103, 106, 107,
  123, 124, 125, 137, 138, 139, 181, 206,
];

async function updateCard(id, status = "done") {
  const res = await fetch(`${KANBAI_URL}/api/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return { id, ok: res.ok, status: res.status };
}

async function main() {
  console.log("Closing", COMPLETED_CARD_IDS.length, "completed Kanbai cards at", KANBAI_URL);
  let ok = 0, fail = 0;
  for (const id of COMPLETED_CARD_IDS) {
    try {
      const r = await updateCard(id);
      if (r.ok) { ok++; console.log("  #" + id + " → done"); }
      else { fail++; console.log("  #" + id + " → " + r.status); }
    } catch (e) {
      fail++;
      console.log("  #" + id + " → error:", e.message);
    }
  }
  console.log("Done:", ok, "updated,", fail, "failed/skipped");
  process.exit(fail > 0 ? 1 : 0);
}

main();
