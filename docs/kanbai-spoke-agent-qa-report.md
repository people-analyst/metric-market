# Kanbai Spoke Agent QA Test Report

**App:** Metric Market (metric-market)
**Date:** 2026-02-20
**Tester:** Automated QA
**Bundle Version:** kanbai-metric-market.js v2.1.1
**Agent Runner:** server/kanbai-agent-runner.js
**Connector:** server/kanbai-connector.js v2.1.0

---

## Executive Summary

**Initial Result: FAIL — Agent execution pipeline broken. Tasks discovered but never executed.**
**After Fix: PASS — Agent fully operational. Tasks claimed, executed, and pushed to GitHub.**

The Kanbai spoke agent initially failed because `DEPLOY_SECRET_KEY` was not set — the connector fell back to `HUB_API_KEY` (a PA Hub PAT token), which the Kanbai hub rejected with 401. After setting the correct `DEPLOY_SECRET_KEY`, the agent successfully claimed task #24, executed 25 Claude tool-use iterations across 4 files, created continuation card #340, and auto-pushed to GitHub (commit `13870ba`).

Three code-level bugs in the Kanbai-provided connector/agent-runner were identified and reported back to Kanbai as card #341: (1) silent claim failure on auth errors, (2) no fetch timeout, (3) budget check false positive on error responses.

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

## Post-Fix Validation (DEPLOY_SECRET_KEY set)

After setting the correct `DEPLOY_SECRET_KEY`, the full integration test suite was re-run.

### Automated Test Suite Results: 18 PASS, 0 FAIL, 3 WARN

| # | Test | Result | Details |
|---|------|--------|---------|
| 1 | DEPLOY_SECRET_KEY is set | PASS | Configured correctly |
| 2 | KANBAI_URL env var set | PASS | `https://people-analytics-kanban.replit.app` |
| 3 | ANTHROPIC_API_KEY is set | PASS | Functional |
| 4 | Kanbai hub health check | PASS | Status: ok |
| 5 | DEPLOY_SECRET_KEY accepted by hub | PASS | HTTP 200 |
| 6 | Daily budget allowed | PASS | 9 tasks, 50 iterations, $1.75 today |
| 7 | Task discovery (critical) | PASS | 0 tasks |
| 8 | Task discovery (high) | PASS | 13 tasks |
| 9 | Task discovery (medium) | PASS | 2 tasks |
| 10 | Task discovery (low) | PASS | 0 tasks |
| 11 | Total remote tasks | PASS | 15 tasks available |
| 12 | Claim task #123 | PASS | Claimed successfully |
| 13 | Report progress on #123 | PASS | Status updated |
| 14 | Release task #123 to planned | PASS | Released (note: `backlog` is not a valid status via progress API) |
| 15 | Claude API (claude-sonnet-4-5) | PASS | Responded "OK" in 1443ms |
| 16 | GET /api/agent/status | PASS | HTTP 200 |
| 17 | POST /api/agent/mode (semi) | PASS | HTTP 200 |
| 18 | POST /api/agent/mode (auto) | PASS | HTTP 200 |

### Connector Code Quality Warnings (Kanbai-provided code)

| # | Check | Status | Issue |
|---|-------|--------|-------|
| W1 | `safeHubCall` has fetch timeout | WARN | No `AbortController` — unbounded fetch could hang indefinitely |
| W2 | Agent logs claim failures | WARN | Silent skip when `claimTask()` returns error object |
| W3 | `checkDailyBudget` validates errors | WARN | `undefined !== false` evaluates to `true` on auth/network errors |

### Agent Execution Verification

| Check | Result |
|-------|--------|
| Agent claimed task #24 | PASS — Card claimed and executed |
| Claude tool-use iterations | PASS — 25 iterations completed |
| Files modified | PASS — 4 files (1 edited, 3 created) |
| WorkbenchPage.tsx change | PASS — Added Output Schema column (2-col → 3-col grid), no regressions |
| Documentation created | PASS — API_BUNDLES_TEST.md, BUNDLE_DISCOVERY_API.md, IMPLEMENTATION_SUMMARY.md |
| Continuation card created | PASS — Card #340 created for follow-up work |
| Git push to GitHub | PASS — Commit `13870ba` pushed to `people-analyst/metric-market` |
| Application health after changes | PASS — All 26 bundles, 9 cards, all endpoints responding |

---

## Structured Feedback for Kanbai

### What Works Well
1. **Agent-hub protocol is solid** — claim/progress/complete lifecycle works correctly once auth is established
2. **Tool-use architecture effective** — Claude successfully reads, searches, edits files, and creates documentation across 25 iterations
3. **Auto-push integration** — Agent changes automatically pushed to GitHub with proper commit messages
4. **Budget tracking** — Daily budget system (tasks, iterations, cost) provides useful guardrails
5. **Continuation cards** — Agent properly creates follow-up cards when work exceeds single session

### Bugs to Fix in Connector/Agent-Runner Code

| ID | Severity | Component | Issue | Evidence |
|----|----------|-----------|-------|----------|
| BUG-1 | HIGH | `kanbai-connector.js:18` | **No fetch timeout** — `safeHubCall` uses bare `fetch()` without `AbortController`. When hub is cold-starting or unreachable, the fetch blocks indefinitely, potentially freezing the entire poll loop. | Verified via code inspection: no `AbortSignal`, no timeout parameter |
| BUG-2 | HIGH | `kanbai-agent-runner.js:446` | **Silent claim failure** — When `claimTask()` returns `{error: "..."}` (valid JSON error from hub), the agent silently skips the task. No log line emitted. Only `console.error` in catch block, which may not appear in Replit workflow logs. | Reproduced: with wrong auth key, agent logged "Found task: #24" then went silent for 90 seconds |
| BUG-3 | MEDIUM | `kanbai-agent-runner.js:417-425` | **Budget check false positive** — `checkDailyBudget()` checks `result.allowed !== false`. When hub returns error JSON (`{error: "..."}`) without `allowed` field, `undefined !== false` is `true`, so budget is reported OK despite auth failure. | Reproduced: hub returned 401, agent logged "Budget OK" |

### Suggestions for Improvement

| ID | Priority | Suggestion |
|----|----------|------------|
| SUG-1 | HIGH | Add `AbortSignal.timeout(10000)` to all `fetch()` calls in `safeHubCall` |
| SUG-2 | HIGH | Log claim failures: `console.log(\`[KanbaiAgent] Claim #${id} failed: ${cr.error}\`)` |
| SUG-3 | MEDIUM | Validate budget response: check for `result.error` before trusting `result.allowed` |
| SUG-4 | LOW | Document the valid status values for `/api/agent/progress` (discovered: `planned`, `in_progress`, `review`, `done` — not `backlog`) |
| SUG-5 | LOW | Add `stderr` capture guidance in spoke setup docs (Replit may not surface `console.error` in workflow logs) |

---

## Test Environment

| Component | Value |
|-----------|-------|
| Server | Express on port 5000 |
| Database | PostgreSQL (Neon) — 85 kanban cards |
| Node.js | v20.20.0 with built-in fetch |
| Anthropic SDK | @anthropic-ai/sdk (installed, functional) |
| Kanbai Hub | `people-analytics-kanban.replit.app` (online, auth working) |
| PA Hub | `682eb7bd-...spock.replit.dev` (separate, uses HUB_API_KEY) |
| Git Remote | `people-analyst/metric-market` on GitHub |
