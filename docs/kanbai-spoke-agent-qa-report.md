# Kanbai Spoke Agent QA Test Report

**App:** Metric Market (metric-market)
**Date:** 2026-02-20
**Tester:** Automated QA
**Bundle Version:** kanbai-metric-market.js v2.1.1
**Agent Runner:** server/kanbai-agent-runner.js
**Connector:** server/kanbai-connector.js v2.1.0

---

## Executive Summary

**Result: FAIL — Agent execution pipeline broken. Tasks are discovered but never executed.**

The Kanbai spoke agent starts, finds kanban tasks via local database fallback, but fails to claim and execute them. The root cause is an authentication mismatch: the connector sends `HUB_API_KEY` (a `pat_...` format People Analytics Hub token) to the Kanbai kanban hub, which expects a different `DEPLOY_SECRET_KEY`. The hub returns 401 Unauthorized, and the agent silently skips the task without logging the failure.

---

## Test Steps & Results

### Step 1: Installation Verification

| Check | Result | Details |
|-------|--------|---------|
| Bundle file present | PASS | `kanbai-metric-market.js` exists (v2.1.1) |
| Agent runner present | PASS | `server/kanbai-agent-runner.js` loaded |
| Connector present | PASS | `server/kanbai-connector.js` v2.1.0 |
| Routes registered | PASS | `/api/agent/*` and `/api/kanban/*` endpoints respond |
| Auth middleware | PASS | Same-origin Referer bypass works; external requests require Bearer token |

### Step 2: API Key Configuration

| Secret | Status | Value Format |
|--------|--------|-------------|
| `DEPLOY_SECRET_KEY` | NOT SET | — |
| `DEPLOY_SECRET` | NOT SET | — |
| `HUB_API_KEY` | SET | `pat_bd10...` (52 chars, People Analytics Hub PAT format) |
| `ANTHROPIC_API_KEY` | SET | Available, functional |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | SET | Replit integration (not used by agent at runtime) |

**Finding:** The connector falls back through `DEPLOY_SECRET_KEY → DEPLOY_SECRET → HUB_API_KEY`. Since only `HUB_API_KEY` is set, it sends a People Analytics Hub PAT token to the Kanbai kanban hub, which expects a different shared secret. This is the primary authentication mismatch.

### Step 3: Agent Start & Task Discovery

| Check | Result | Details |
|-------|--------|---------|
| Agent starts | PASS | `POST /api/agent/start` returns `{"status":"started"}` |
| Mode switch | PASS | Auto mode with autoApprove enabled |
| Model configured | PASS | `claude-sonnet-4-5` (verified functional independently) |
| Task discovery | PASS (partial) | Local DB fallback finds 5 tasks; remote hub returns 401 |
| Task found | PASS | Card #24 "Expose Card Bundle Discovery API for Spoke Apps" [critical] |

### Step 4: Task Claim & Execution

| Check | Result | Details |
|-------|--------|---------|
| `checkDailyBudget()` | FALSE PASS | Hub returns 401 → `result.allowed` is undefined → `undefined !== false` evaluates to `true` → budget incorrectly reported as OK |
| `claimTask()` | **FAIL** | Hub returns `{"error":"Unauthorized..."}` (valid JSON, HTTP 401). `safeHubCall` returns `{error: "Unauthorized..."}` WITHOUT `local: true` flag |
| Task added to activeTasks | **FAIL** | Condition `!cr.error \|\| cr.local` → `false \|\| false` → task never added |
| `executeTaskWithTools()` | **NEVER REACHED** | activeTasks remains empty |
| Claude API called | **NEVER** | No Anthropic API calls made |
| Any file changes | **NONE** | `git diff --stat` shows no modifications |
| Card status updated | **NO** | Card #24 remains `status: backlog`, `assignedTo: null` |

### Step 5: Monitoring (90-second observation)

| Metric | Value |
|--------|-------|
| Observation window | 90 seconds |
| "Found task" log entries | 2 (at ~60s intervals matching pollInterval) |
| "Error" log entries | 0 (failure is silent) |
| activeTasks count | 0 (never populated) |
| Claude API calls | 0 |
| Files modified | 0 |
| Cards status-changed | 0 |

### Step 6: Post-Test Verification

| Check | Result |
|-------|--------|
| Application healthy | PASS — `GET /api/health` returns 200 OK |
| Card bundles intact | PASS — 26 bundles present |
| Card instances intact | PASS — 9 cards present |
| Card #24 unchanged | PASS — Still `backlog`, unassigned |
| No unintended side effects | PASS — No file changes, no DB mutations |
| Agent stopped cleanly | PASS — `POST /api/agent/stop` returns `{"status":"stopped"}` |

---

## Root Cause Analysis

### Primary Bug: Authentication Mismatch (CRITICAL)

**Location:** `server/kanbai-connector.js` lines 5, 11-14

The connector resolves auth via fallback chain: `DEPLOY_SECRET_KEY → DEPLOY_SECRET → HUB_API_KEY`. Only `HUB_API_KEY` is set, and it contains a People Analytics Hub PAT (`pat_bd10...`), not the Kanbai ecosystem shared secret. The Kanbai hub at `cdeb1be5-...picard.replit.dev` rejects the token with HTTP 401.

**Evidence:**
```
$ curl -s "$KANBAI_URL/api/agent/budget/check" -H "Authorization: Bearer $HUB_API_KEY" ...
→ 401 {"error":"Unauthorized. Provide Authorization: Bearer <DEPLOY_SECRET_KEY>"}
```

### Secondary Bug: Silent Claim Failure (HIGH)

**Location:** `server/kanbai-connector.js` line 20, `server/kanbai-agent-runner.js` line 446

When the hub returns HTTP 401 with valid JSON (`{"error": "Unauthorized..."}`), `safeHubCall` parses the JSON successfully and returns the object WITHOUT the `local: true` flag. The `local: true` flag is only added for:
- HTML responses (line 23)
- Invalid JSON responses (line 25)
- Network/fetch errors (line 29)

Valid JSON error responses from the hub get no `local: true`, so the agent's condition `!cr.error || cr.local` evaluates to `false`, silently skipping the task with zero logging.

**Code path:**
```
safeHubCall returns: {error: "Unauthorized. Provide Authorization: Bearer <DEPLOY_SECRET_KEY>"}
                     ^^^ no local:true because JSON parsed successfully

Line 446: if (!cr.error || cr.local)
           → if (!"Unauthorized..." || undefined)
           → if (false || false)
           → false — task SILENTLY SKIPPED
```

### Tertiary Bug: Budget Check False Positive (MEDIUM)

**Location:** `server/kanbai-agent-runner.js` lines 417-425

`checkDailyBudget()` calls the hub, receives `{error: "Unauthorized..."}`, and checks `result.allowed !== false`. Since `result.allowed` is `undefined` (not `false`), the budget is reported as OK. This masks the auth failure and allows the agent to proceed to task discovery, creating a confusing situation where tasks are found but never executed.

### Tertiary Bug: No Fetch Timeout (MEDIUM)

**Location:** `server/kanbai-connector.js` line 18

`safeHubCall` uses `fetch(url, options)` with no `AbortController` timeout. If the Kanbai hub is sleeping or slow to respond, the fetch blocks indefinitely. During testing, the hub responded in 40-226ms, but when cold-starting (observed in TLS handshake test), connections can hang >10 seconds.

### Tertiary Bug: console.error Visibility (LOW)

**Location:** `server/kanbai-agent-runner.js` lines 481, 485

Error logging uses `console.error` which writes to stderr. Replit workflow logs may not capture stderr consistently, making genuine errors invisible during monitoring.

---

## Hub Connectivity Profile

| Endpoint | Status | Latency | Response |
|----------|--------|---------|----------|
| `POST /api/agent/budget/check` | 401 | 226ms | `{"error":"Unauthorized..."}` |
| `GET /api/agent/available` | 401 | 148ms | `{"error":"Unauthorized..."}` |
| `POST /api/agent/claim` | 401 | 41ms | `{"error":"Unauthorized..."}` |
| `POST /api/agent/progress` | 401 | 43ms | `{"error":"Unauthorized..."}` |

Hub URL: `https://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev`
Hub is online and responsive. Auth is the sole barrier.

## Anthropic API Verification

| Check | Result |
|-------|--------|
| Model `claude-sonnet-4-5` | Valid, responds in 1.5s |
| API key | Functional (`ANTHROPIC_API_KEY`) |
| SDK initialization | Works (Anthropic constructor without explicit config) |

The Anthropic API is fully functional. The agent never reaches the Claude API call due to the upstream auth/claim failure.

---

## Recommended Fixes (Priority Order)

### 1. Set `DEPLOY_SECRET_KEY` secret (CRITICAL — immediate unblock)
Add the correct Kanbai ecosystem shared secret as `DEPLOY_SECRET_KEY` in Replit Secrets. This must match the key configured on the Kanbai hub. This single fix would unblock the entire pipeline.

### 2. Add `local: true` for HTTP 4xx/5xx responses (HIGH)
In `safeHubCall`, when the hub returns valid JSON but with a non-2xx HTTP status, add `local: true` to the response so the agent can fall back to local processing:
```javascript
// In safeHubCall, after JSON.parse succeeds:
const parsed = JSON.parse(text);
if (resp.status >= 400) parsed.local = true;
return parsed;
```

### 3. Add local claim fallback (HIGH)
Add a `claimTaskLocally()` function that updates the kanban_cards table (set `status = 'in_progress'`, `assigned_to = agentId`) when the hub claim fails. Mirror the pattern used by `getLocalAvailableTasks()`.

### 4. Log claim failures explicitly (MEDIUM)
Add logging after line 446 when the claim condition fails:
```javascript
const cr = await claimTask(card.id, AGENT_CONFIG.agentId);
if (!cr.error || cr.local) {
  activeTasks.set(card.id, { ...card, claimedAt: new Date() });
} else {
  console.log(`[KanbaiAgent] Failed to claim #${card.id}: ${cr.error}`);
}
```

### 5. Add fetch timeout to safeHubCall (MEDIUM)
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);
const resp = await fetch(url, { ...options, signal: controller.signal });
clearTimeout(timeout);
```

### 6. Validate budget check result (LOW)
```javascript
// In checkDailyBudget:
if (result.error) return true; // treat auth errors as "budget OK" but log warning
if (result.allowed === false) { ... }
```

---

## Test Environment

| Component | Value |
|-----------|-------|
| Server | Express on port 5000 |
| Database | PostgreSQL (Neon) — 85 kanban cards (81 backlog, 4 planned) |
| Node.js | v20.x with built-in fetch |
| Anthropic SDK | @anthropic-ai/sdk (installed) |
| Kanbai Hub | `cdeb1be5-...picard.replit.dev` (online, 401 on all endpoints) |
| PA Hub | `682eb7bd-...spock.replit.dev` (separate, uses HUB_API_KEY) |
