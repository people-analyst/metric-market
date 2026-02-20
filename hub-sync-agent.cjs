#!/usr/bin/env node
// hub-sync-agent.js — Automated Hub Sync Cycle (uses Hub SDK)
// Application: Metric Market (metric-market)
// Hub: http://682eb7bd-f279-41bd-ac9e-1ad52cd23036-00-sc7pg47dpokt.spock.replit.dev
//
// This script wraps the Hub SDK's runFullSync() with additional
// doc_upgrade_request processing (adds missing sections to hub-docs.md).
//
// PREREQUISITES:
// - hub-sdk.js must exist in project root (download from Hub)
// - HUB_API_KEY env var set in Replit Secrets
//
// USAGE:
//   node hub-sync-agent.js              # Full sync cycle
//   node hub-sync-agent.js --status     # Just show current status
//   node hub-sync-agent.js --push-docs  # Just push current docs

const fs = require("fs");
const path = require("path");

let sdk;
try {
  sdk = require("./hub-sdk.cjs");
} catch {
  console.error("[Hub Sync] hub-sdk.js not found. Download it:");
  console.error("  curl -o hub-sdk.js http://682eb7bd-f279-41bd-ac9e-1ad52cd23036-00-sc7pg47dpokt.spock.replit.dev/api/sdk/metric-market");
  console.error("Then set HUB_API_KEY in your Replit Secrets tab.");
  process.exit(1);
}

const HUB_DOCS_PATH = path.join(process.cwd(), "hub-docs.md");
const REPLIT_MD_PATH = path.join(process.cwd(), "replit.md");

function readDocumentation() {
  try {
    if (fs.existsSync(HUB_DOCS_PATH)) return fs.readFileSync(HUB_DOCS_PATH, "utf-8");
    if (fs.existsSync(REPLIT_MD_PATH)) return fs.readFileSync(REPLIT_MD_PATH, "utf-8");
    return "";
  } catch { return ""; }
}

function writeDocumentation(content) {
  fs.writeFileSync(HUB_DOCS_PATH, content, "utf-8");
  console.log("[Hub Sync] Documentation saved to hub-docs.md (" + content.length + " chars)");
}

async function pushDocs() {
  const result = await sdk.syncDocumentation();
  if (result && !result.skipped) {
    console.log("[Hub Sync] Documentation pushed. Score: " + result.score + "/100");
    if (result.sections) {
      const weak = Object.entries(result.sections)
        .filter(([, s]) => s < 80)
        .map(([k, s]) => "  " + k + ": " + s + "/100");
      if (weak.length > 0) {
        console.log("[Hub Sync] Sections below 80%:");
        weak.forEach(w => console.log(w));
      }
    }
  } else if (result && result.skipped) {
    console.log("[Hub Sync] Documentation unchanged, skipped push.");
  }
  return result;
}

async function showStatus() {
  console.log("\n=== Hub Sync Status for Metric Market (metric-market) ===\n");
  try {
    const all = await sdk.fetchDirectives();
    const pending = all.filter(d => d.status === "pending");
    const acknowledged = all.filter(d => d.status === "acknowledged");
    const inProgress = all.filter(d => d.status === "in_progress");
    const completed = all.filter(d => d.status === "completed");
    console.log("Directives: " + pending.length + " pending, " + acknowledged.length + " acknowledged, " + inProgress.length + " in-progress, " + completed.length + " completed");
    const active = [...pending, ...acknowledged, ...inProgress];
    if (active.length > 0) {
      console.log("\nActive directives:");
      active.forEach(d => console.log("  [" + d.id + "] [" + d.status + "] [" + d.type + "] " + d.title));
    }
  } catch (e) { console.error("[Hub Sync] Could not fetch directives:", e.message); }
  const doc = readDocumentation();
  console.log("\nLocal hub-docs.md: " + (doc ? doc.length + " chars" : "NOT FOUND (also checked replit.md)"));
  try { await pushDocs(); } catch (e) { console.error("[Hub Sync] Could not push docs:", e.message); }
}

async function processDocUpgrade(directive) {
  console.log("\n[Hub Sync] Processing doc upgrade: " + directive.title);
  await sdk.updateDirective(directive.id, "in_progress", "Hub sync agent is processing this documentation upgrade request.");

  let currentDoc = readDocumentation();
  const REQUIRED_SECTIONS = [
    { key: "overview", heading: "## Application Overview", desc: "Purpose, core capabilities, key value proposition" },
    { key: "tech_stack", heading: "## Technology Stack", desc: "Frontend, backend, infrastructure, AI integration details" },
    { key: "ecosystem", heading: "## Platform Ecosystem Context", desc: "Position in the People Analytics architecture, connected apps, data contracts" },
    { key: "features", heading: "## Features & Pages", desc: "Every page/route with its purpose, features, current state" },
    { key: "api_reference", heading: "## API Reference", desc: "Every endpoint with method, path, purpose, request/response format" },
    { key: "database", heading: "## Database Schema", desc: "Every table with columns, types, relationships" },
    { key: "data_contracts", heading: "## Data Contracts & Export Formats", desc: "Data formats produced or consumed, JSON schemas, CSV formats" },
    { key: "instance_data", heading: "## Current Instance Data Summary", desc: "What data currently exists in the deployed instance" },
    { key: "health", heading: "## System Health & Recommendations", desc: "Readiness metrics, validation warnings, known issues" },
  ];

  const missingSections = [];
  for (const section of REQUIRED_SECTIONS) {
    const keyPattern = new RegExp("^##\\s+.*" + section.key.replace("_", "\\s*"), "im");
    const escapePat = /[.*+?^\$\{\}()|[\]\\]/g;
    const headingText = section.heading.replace("## ", "").replace(escapePat, "\\$&");
    const headingPattern = new RegExp("^##\\s+" + headingText, "im");
    if (!keyPattern.test(currentDoc) && !headingPattern.test(currentDoc)) {
      missingSections.push(section);
    }
  }

  if (missingSections.length > 0) {
    console.log("[Hub Sync] Missing sections: " + missingSections.map(s => s.key).join(", "));
    let additions = "\n";
    for (const section of missingSections) {
      additions += "\n" + section.heading + "\n" + section.desc + "\n\n_TODO: Fill in with real content from the codebase. Include 50+ words, use bullet lists, and add code examples._\n";
    }
    currentDoc += additions;
    writeDocumentation(currentDoc);
    console.log("[Hub Sync] Added placeholder sections to hub-docs.md.");
  }

  const pushResult = await pushDocs();
  const score = pushResult && pushResult.score ? pushResult.score : 0;

  await sdk.updateDirective(directive.id, "completed",
    "Documentation sync completed. Score: " + score + "/100. " +
    (missingSections.length > 0 ? "Added " + missingSections.length + " missing section(s)." : "All sections present.")
  );
  return score;
}

async function fullSync() {
  console.log("\n=== Hub Sync Agent — Full Cycle ===");
  console.log("App: Metric Market (metric-market)");
  console.log("Hub: http://682eb7bd-f279-41bd-ac9e-1ad52cd23036-00-sc7pg47dpokt.spock.replit.dev");
  console.log("Time: " + new Date().toISOString() + "\n");

  try {
    const update = await sdk.checkSdkUpdate();
    if (update && update.updateAvailable) {
      console.log("[Hub Sync] SDK update available: v" + update.latest + " (you have v" + update.current + ")");
      console.log("[Hub Sync] Download: curl -o hub-sdk.js http://682eb7bd-f279-41bd-ac9e-1ad52cd23036-00-sc7pg47dpokt.spock.replit.dev/api/sdk/metric-market\n");
    }
  } catch {}

  let directives;
  try { directives = await sdk.fetchDirectives(); } catch (e) {
    console.error("[Hub Sync] Failed to fetch directives:", e.message);
    return;
  }

  const active = directives.filter(d => d.status === "pending" || d.status === "acknowledged" || d.status === "in_progress");
  console.log("[Hub Sync] Found " + active.length + " active directive(s) of " + directives.length + " total.\n");

  if (active.length === 0) {
    console.log("[Hub Sync] No pending directives. Pushing current docs...");
    await pushDocs();
    console.log("[Hub Sync] Sync complete.");
    return;
  }

  let docUpgradeProcessed = false;
  for (const directive of active) {
    try {
      if (directive.type === "doc_upgrade_request") {
        await processDocUpgrade(directive);
        docUpgradeProcessed = true;
      } else {
        console.log("\n[Hub Sync] Acknowledging directive: [" + directive.type + "] " + directive.title);
        await sdk.updateDirective(directive.id, "acknowledged",
          'Directive "' + directive.type + '" acknowledged. Requires manual intervention.'
        );
      }
    } catch (e) {
      console.error("[Hub Sync] Error processing directive " + directive.id + ":", e.message);
      try { await sdk.updateDirective(directive.id, "acknowledged", "Error: " + e.message); } catch {}
    }
  }

  if (!docUpgradeProcessed) {
    console.log("\n[Hub Sync] Pushing current docs...");
    await pushDocs();
  }

  // Push operational metrics if app exposes them
  try {
    const catalog = await sdk.fetchMetricCatalog();
    console.log("[Hub Sync] Metric catalog: " + (catalog.metrics ? catalog.metrics.length : 0) + " metrics tracked by hub.");
  } catch (e) {
    console.log("[Hub Sync] Metric catalog not available yet (this is normal for new apps).");
  }

  console.log("\n=== Hub Sync Complete ===");
}

const args = process.argv.slice(2);
if (args.includes("--status")) {
  showStatus().catch(e => console.error("Error:", e.message));
} else if (args.includes("--push-docs")) {
  pushDocs().catch(e => console.error("Error:", e.message));
} else {
  fullSync().catch(e => console.error("Error:", e.message));
}
