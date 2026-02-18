#!/usr/bin/env node
// kanbai-verify.js — Run this to verify your Kanbai spoke setup
// Usage: node kanbai-verify.js

const APP_SLUG = "metric-market";
const KANBAI_URL = "http://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev";

const CHECKS = [
  { name: "Environment Variables", fn: checkEnvVars },
  { name: "Hub Connectivity", fn: checkHubConnectivity },
  { name: "Authentication", fn: checkAuth },
  { name: "Card Access", fn: checkCards },
  { name: "Agent Readiness", fn: checkAgentReady },
  { name: "Dependencies", fn: checkDependencies },
];

async function checkEnvVars() {
  const missing = [];
  if (!process.env.DEPLOY_SECRET_KEY) missing.push("DEPLOY_SECRET_KEY");
  if (!process.env.ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY (optional, only for AI agent)");
  if (missing.length > 0) return { status: "fail", message: "Missing: " + missing.join(", ") + ". Check your Replit Secrets tab. If you had these from a previous setup, they should still be there and work fine." };
  return { status: "pass", message: "All required env vars found (existing keys are compatible with v2.0)" };
}

async function checkHubConnectivity() {
  try {
    const resp = await fetch(KANBAI_URL + "/api/spoke/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appSlug: APP_SLUG })
    });
    if (!resp.ok) return { status: "fail", message: "Hub returned " + resp.status };
    const data = await resp.json();
    return { status: "pass", message: "Hub v" + data.version + " reachable" };
  } catch (err) {
    return { status: "fail", message: "Cannot reach hub: " + err.message };
  }
}

async function checkAuth() {
  const key = process.env.DEPLOY_SECRET_KEY;
  if (!key) return { status: "fail", message: "DEPLOY_SECRET_KEY not set, cannot test auth" };
  try {
    const resp = await fetch(KANBAI_URL + "/api/spoke/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      body: JSON.stringify({ appSlug: APP_SLUG })
    });
    if (!resp.ok) return { status: "fail", message: "Hub returned " + resp.status };
    const data = await resp.json();
    const authCheck = data.checks && data.checks.auth;
    if (authCheck && authCheck.status === "pass") return { status: "pass", message: authCheck.message };
    return { status: "fail", message: (authCheck && authCheck.message) || "Auth check failed" };
  } catch (err) {
    return { status: "fail", message: "Auth test error: " + err.message };
  }
}

async function checkCards() {
  const key = process.env.DEPLOY_SECRET_KEY;
  try {
    const headers = { "Content-Type": "application/json" };
    if (key) headers["Authorization"] = "Bearer " + key;
    const resp = await fetch(KANBAI_URL + "/api/kanban/cards?app=" + encodeURIComponent(APP_SLUG), {
      headers: headers
    });
    if (!resp.ok) return { status: "fail", message: "Cards endpoint returned " + resp.status };
    const data = await resp.json();
    const cards = Array.isArray(data) ? data : (data.cards || []);
    if (cards.length > 0) return { status: "pass", message: cards.length + " card(s) available for " + APP_SLUG };
    return { status: "warn", message: "No cards found for " + APP_SLUG };
  } catch (err) {
    return { status: "fail", message: "Card access error: " + err.message };
  }
}

async function checkAgentReady() {
  try {
    require.resolve("@anthropic-ai/sdk");
    return { status: "pass", message: "@anthropic-ai/sdk is installed" };
  } catch {
    return { status: "fail", message: "@anthropic-ai/sdk not found. Run: npm install @anthropic-ai/sdk" };
  }
}

async function checkDependencies() {
  const required = ["@anthropic-ai/sdk"];
  const missing = [];
  for (const pkg of required) {
    try { require.resolve(pkg); } catch { missing.push(pkg); }
  }
  if (missing.length > 0) return { status: "fail", message: "Missing packages: " + missing.join(", ") };
  return { status: "pass", message: "All required packages installed" };
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function icon(status) {
  if (status === "pass") return GREEN + "PASS" + RESET;
  if (status === "warn") return YELLOW + "WARN" + RESET;
  return RED + "FAIL" + RESET;
}

async function main() {
  console.log("");
  console.log(BOLD + CYAN + "Kanbai Spoke Verification" + RESET);
  console.log(CYAN + "App: " + APP_SLUG + " | Hub: " + KANBAI_URL + RESET);
  console.log("─".repeat(50));
  console.log("");

  let allPassed = true;
  for (const check of CHECKS) {
    try {
      const result = await check.fn();
      console.log("  [" + icon(result.status) + "] " + BOLD + check.name + RESET + " — " + result.message);
      if (result.status === "fail") allPassed = false;
    } catch (err) {
      console.log("  [" + RED + "FAIL" + RESET + "] " + BOLD + check.name + RESET + " — Error: " + err.message);
      allPassed = false;
    }
  }

  console.log("");
  console.log("─".repeat(50));
  if (allPassed) {
    console.log(GREEN + BOLD + "All checks passed! Your spoke is ready." + RESET);
    process.exit(0);
  } else {
    console.log(RED + BOLD + "Some checks failed. Review the output above." + RESET);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(RED + "Fatal error: " + err.message + RESET);
  process.exit(1);
});
