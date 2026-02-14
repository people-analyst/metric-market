/**
 * People Analytics Hub SDK v2.1.0
 * Unified communication module for "Metric Market" (metric-market)
 *
 * DROP-IN SETUP:
 *   const hubSdk = require("./hub-sdk");
 *   hubSdk.init(app);          // app = your Express instance
 *
 * ENV REQUIRED:
 *   HUB_API_KEY  — your app's API key (from Hub > your app > Integration tab)
 *
 * This single file replaces: hub-client.js, hub-webhook.js, directive-executor.js, hub-sync-agent.js
 * Do NOT edit the core logic — pull updates from the Hub when a new version is available.
 */

const HUB_URL = "https://682eb7bd-f279-41bd-ac9e-1ad52cd23036-00-sc7pg47dpokt.spock.replit.dev";
const APP_SLUG = "metric-market";
const APP_NAME = "Metric Market";
const SDK_VERSION = "2.1.0";

// ─── Internal state ────────────────────────────────────────────────
let _apiKey = null;
let _lastDocVersion = null;
let _lastDocHash = null;
let _directiveHandler = null;
let _pollInterval = null;

function _getApiKey() {
  if (_apiKey) return _apiKey;
  _apiKey = process.env.HUB_API_KEY || null;
  if (!_apiKey) {
    console.warn("[hub-sdk] WARNING: HUB_API_KEY env var not set. Hub communication will fail.");
  }
  return _apiKey;
}

function _headers() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": _getApiKey() || "",
  };
}

function _simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return hash.toString(36);
}

// ─── Hub API Client ────────────────────────────────────────────────

async function fetchDirectives(status) {
  const qs = status ? "?status=" + status : "";
  const res = await fetch(HUB_URL + "/api/hub/app/" + APP_SLUG + "/directives" + qs, { headers: _headers() });
  if (!res.ok) throw new Error("Failed to fetch directives: " + res.status);
  return res.json();
}

async function updateDirective(directiveId, status, response) {
  const body = { status };
  if (response) body.response = response;
  const res = await fetch(HUB_URL + "/api/hub/app/" + APP_SLUG + "/directives/" + directiveId, {
    method: "PATCH",
    headers: _headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update directive: " + res.status);
  return res.json();
}

async function pushDocumentation(content, version) {
  if (!content || typeof content !== "string" || content.length < 50) {
    throw new Error("Documentation content must be a string with at least 50 characters");
  }

  const newHash = _simpleHash(content);

  if (_lastDocHash && newHash === _lastDocHash) {
    console.log("[hub-sdk] Documentation unchanged (same hash), skipping push.");
    return { skipped: true, reason: "unchanged" };
  }

  if (_lastDocVersion && version && version <= _lastDocVersion) {
    console.warn("[hub-sdk] WARNING: Version '" + version + "' is not newer than last pushed '" + _lastDocVersion + "'. Incrementing automatically.");
    version = new Date().toISOString();
  }

  const docVersion = version || new Date().toISOString();

  const res = await fetch(HUB_URL + "/api/hub/app/" + APP_SLUG + "/documentation", {
    method: "POST",
    headers: _headers(),
    body: JSON.stringify({ content, version: docVersion }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error("Failed to push documentation: " + res.status + " " + errBody);
  }

  _lastDocVersion = docVersion;
  _lastDocHash = newHash;

  const result = await res.json();
  console.log("[hub-sdk] Documentation pushed successfully. Score: " + result.score + "%");
  return result;
}

async function fetchRegistry() {
  const res = await fetch(HUB_URL + "/api/hub/registry", { headers: _headers() });
  if (!res.ok) throw new Error("Failed to fetch registry: " + res.status);
  return res.json();
}

async function fetchArchitecture() {
  const res = await fetch(HUB_URL + "/api/hub/architecture", { headers: _headers() });
  if (!res.ok) throw new Error("Failed to fetch architecture: " + res.status);
  return res.json();
}

async function checkSdkUpdate() {
  try {
    const res = await fetch(HUB_URL + "/api/sdk/version");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.version !== SDK_VERSION) {
      console.log("[hub-sdk] Update available: v" + data.version + " (current: v" + SDK_VERSION + "). Download from Hub > Integration tab or GET " + HUB_URL + "/api/sdk/" + APP_SLUG);
      return { updateAvailable: true, current: SDK_VERSION, latest: data.version, downloadUrl: HUB_URL + "/api/sdk/" + APP_SLUG };
    }
    return { updateAvailable: false, current: SDK_VERSION };
  } catch { return null; }
}

// ─── Field Exchange (if applicable) ────────────────────────────────

async function getFieldManifest() {
  const res = await fetch(HUB_URL + "/api/hub/app/" + APP_SLUG + "/fields/manifest", { headers: _headers() });
  if (!res.ok) throw new Error("Failed to fetch field manifest: " + res.status);
  return res.json();
}

async function exchangeFields(discoveredNames, confirmedMappings) {
  const res = await fetch(HUB_URL + "/api/hub/app/" + APP_SLUG + "/fields/exchange", {
    method: "POST",
    headers: _headers(),
    body: JSON.stringify({ discoveredNames: discoveredNames || [], confirmedMappings: confirmedMappings || [] }),
  });
  if (!res.ok) throw new Error("Failed to exchange fields: " + res.status);
  return res.json();
}

async function submitDataProfiles(profiles) {
  const res = await fetch(HUB_URL + "/api/hub/app/" + APP_SLUG + "/fields/profiles", {
    method: "POST",
    headers: _headers(),
    body: JSON.stringify({ profiles }),
  });
  if (!res.ok) throw new Error("Failed to submit data profiles: " + res.status);
  return res.json();
}

// ─── Express Route Registration ────────────────────────────────────

function _registerHealthRoute(app) {
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      app: APP_SLUG,
      sdkVersion: SDK_VERSION,
      timestamp: new Date().toISOString(),
    });
  });
}

function _registerWebhookRoute(app) {
  app.post("/api/hub-webhook", (req, res) => {
    const { event, directive } = req.body || {};
    console.log("[hub-sdk] Webhook received: " + (event || "unknown") + (directive ? " — " + directive.title : ""));

    if (directive && directive.id) {
      updateDirective(directive.id, "acknowledged")
        .then(() => console.log("[hub-sdk] Directive " + directive.id + " acknowledged"))
        .catch((err) => console.error("[hub-sdk] Failed to acknowledge directive:", err.message));

      if (_directiveHandler) {
        Promise.resolve(_directiveHandler(directive))
          .then((response) => {
            if (response) {
              updateDirective(directive.id, "completed", typeof response === "string" ? response : JSON.stringify(response))
                .catch((err) => console.error("[hub-sdk] Failed to complete directive:", err.message));
            }
          })
          .catch((err) => {
            console.error("[hub-sdk] Directive handler error:", err.message);
            updateDirective(directive.id, "completed", "Handler error: " + err.message).catch(() => {});
          });
      }
    }

    res.json({ received: true, sdkVersion: SDK_VERSION });
  });
}

function _registerSpecificationsRoute(app) {
  const fs = require("fs");
  const path = require("path");

  app.get("/api/specifications", (_req, res) => {
    const candidates = ["hub-docs.md", "replit.md", "README.md", "docs/README.md"];
    for (const candidate of candidates) {
      const filePath = path.resolve(process.cwd(), candidate);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        if (content && content.length > 20) {
          res.setHeader("Content-Type", "text/plain");
          return res.send(content);
        }
      }
    }
    res.status(404).json({ message: "No documentation file found. Create hub-docs.md with your app documentation." });
  });
}

// ─── Directive Polling ─────────────────────────────────────────────

function startDirectivePolling(intervalMs) {
  if (_pollInterval) clearInterval(_pollInterval);
  const ms = intervalMs || 300000;
  console.log("[hub-sdk] Directive polling started (every " + (ms / 1000) + "s)");

  async function poll() {
    try {
      const directives = await fetchDirectives("pending");
      if (directives && directives.length > 0) {
        console.log("[hub-sdk] " + directives.length + " pending directive(s) found");
        for (const d of directives) {
          await updateDirective(d.id, "acknowledged");
          if (_directiveHandler) {
            try {
              const response = await _directiveHandler(d);
              if (response) {
                await updateDirective(d.id, "completed", typeof response === "string" ? response : JSON.stringify(response));
              }
            } catch (err) {
              console.error("[hub-sdk] Directive handler error for #" + d.id + ":", err.message);
            }
          }
        }
      }
    } catch (err) {
      console.error("[hub-sdk] Polling error:", err.message);
    }
  }

  poll();
  _pollInterval = setInterval(poll, ms);
}

function stopDirectivePolling() {
  if (_pollInterval) {
    clearInterval(_pollInterval);
    _pollInterval = null;
    console.log("[hub-sdk] Directive polling stopped");
  }
}

// ─── Documentation Helper ──────────────────────────────────────────

function _getDocFilePath() {
  const fs = require("fs");
  const path = require("path");
  const hubDocsPath = path.resolve(process.cwd(), "hub-docs.md");
  if (fs.existsSync(hubDocsPath)) return hubDocsPath;
  const replitMdPath = path.resolve(process.cwd(), "replit.md");
  if (fs.existsSync(replitMdPath)) return replitMdPath;
  return hubDocsPath;
}

function loadDocumentation() {
  const fs = require("fs");
  const filePath = _getDocFilePath();
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  if (!content || content.length < 50) return null;
  return content;
}

function saveDocumentation(content) {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.resolve(process.cwd(), "hub-docs.md");
  fs.writeFileSync(filePath, content, "utf-8");
  console.log("[hub-sdk] Documentation saved to hub-docs.md (" + content.length + " chars)");
  return filePath;
}

function generateDocFromReplitMd() {
  return loadDocumentation();
}

async function syncDocumentation() {
  const content = loadDocumentation();
  if (!content) {
    console.warn("[hub-sdk] No hub-docs.md or replit.md found (or content too short). Skipping doc sync.");
    console.warn("[hub-sdk] TIP: Write your documentation to hub-docs.md — this file is stable and won't be auto-regenerated by the platform.");
    return null;
  }
  return pushDocumentation(content, new Date().toISOString());
}

// ─── Full Sync Cycle ───────────────────────────────────────────────

async function runFullSync() {
  console.log("[hub-sdk] ═══ Starting full hub sync cycle ═══");
  const results = { directives: 0, docPushed: false, sdkUpdate: null, errors: [] };

  try {
    const update = await checkSdkUpdate();
    results.sdkUpdate = update;
    if (update && update.updateAvailable) {
      console.log("[hub-sdk] SDK update available: v" + update.latest);
    }
  } catch (err) { results.errors.push("SDK check: " + err.message); }

  try {
    const directives = await fetchDirectives("pending");
    results.directives = directives ? directives.length : 0;
    if (directives && directives.length > 0) {
      console.log("[hub-sdk] Processing " + directives.length + " pending directive(s)...");
      for (const d of directives) {
        console.log("[hub-sdk]   → #" + d.id + " [" + d.priority + "] " + d.title);
        await updateDirective(d.id, "acknowledged");
        if (_directiveHandler) {
          try {
            const response = await _directiveHandler(d);
            if (response) await updateDirective(d.id, "completed", typeof response === "string" ? response : JSON.stringify(response));
          } catch (err) {
            console.error("[hub-sdk]   Error processing directive #" + d.id + ":", err.message);
            results.errors.push("Directive #" + d.id + ": " + err.message);
          }
        }
      }
    } else {
      console.log("[hub-sdk] No pending directives.");
    }
  } catch (err) { results.errors.push("Directives: " + err.message); }

  try {
    const docResult = await syncDocumentation();
    if (docResult && !docResult.skipped) {
      results.docPushed = true;
      console.log("[hub-sdk] Documentation synced. Score: " + docResult.score + "%");
    }
  } catch (err) { results.errors.push("Doc sync: " + err.message); }

  console.log("[hub-sdk] ═══ Sync complete. Directives: " + results.directives + ", Doc pushed: " + results.docPushed + ", Errors: " + results.errors.length + " ═══");
  return results;
}

// ─── Init ──────────────────────────────────────────────────────────

function init(app, options) {
  const opts = options || {};

  console.log("[hub-sdk] Initializing v" + SDK_VERSION + " for " + APP_NAME + " (" + APP_SLUG + ")");
  console.log("[hub-sdk] Hub URL: " + HUB_URL);

  if (opts.apiKey) _apiKey = opts.apiKey;

  if (opts.onDirective && typeof opts.onDirective === "function") {
    _directiveHandler = opts.onDirective;
  }

  if (app) {
    try {
      _registerHealthRoute(app);
    } catch (err) {
      console.error("[hub-sdk] CRITICAL: Failed to register /health route:", err.message);
    }
    try {
      _registerWebhookRoute(app);
    } catch (err) {
      console.error("[hub-sdk] Failed to register /api/hub-webhook route:", err.message);
    }
    try {
      _registerSpecificationsRoute(app);
    } catch (err) {
      console.error("[hub-sdk] Failed to register /api/specifications route:", err.message);
    }
    console.log("[hub-sdk] Routes registered: GET /health, POST /api/hub-webhook, GET /api/specifications");
  }

  if (!_getApiKey()) {
    console.warn("[hub-sdk] ────────────────────────────────────────────────────────");
    console.warn("[hub-sdk] HUB_API_KEY is not set. The /health endpoint will work,");
    console.warn("[hub-sdk] but hub communication (directives, doc sync) will fail.");
    console.warn("[hub-sdk] Set HUB_API_KEY in your Replit Secrets tab.");
    console.warn("[hub-sdk] ────────────────────────────────────────────────────────");
  }

  try {
    if (opts.pollDirectives !== false && _getApiKey()) {
      startDirectivePolling(opts.pollInterval || 300000);
    }
  } catch (err) {
    console.error("[hub-sdk] Failed to start directive polling:", err.message);
  }

  checkSdkUpdate().catch(() => {});

  return module.exports;
}

// ─── Exports ───────────────────────────────────────────────────────

module.exports = {
  // Setup
  init,
  SDK_VERSION,
  HUB_URL,
  APP_SLUG,
  APP_NAME,

  // Hub API
  fetchDirectives,
  updateDirective,
  pushDocumentation,
  fetchRegistry,
  fetchArchitecture,
  checkSdkUpdate,

  // Field Exchange
  getFieldManifest,
  exchangeFields,
  submitDataProfiles,

  // Documentation
  loadDocumentation,
  saveDocumentation,
  generateDocFromReplitMd,
  syncDocumentation,

  // Directive Processing
  startDirectivePolling,
  stopDirectivePolling,

  // Full Sync
  runFullSync,
};
