// ════════════════════════════════════════════════════════════════════
// Kanbai Unified Bundle for metric-market
// ════════════════════════════════════════════════════════════════════
// ONE FILE. Just paste this into your Replit project as "kanbai-metric-market.js"
// Then add ONE line to your main server file:
//
//   require("./kanbai-metric-market").mount(app);
//
// Required Replit Secrets (any ONE of these for hub auth — checked in order):
//   DEPLOY_SECRET_KEY  - Shared secret (must match the Kanbai instance)
//   DEPLOY_SECRET      - Alternative name for the same secret
//   HUB_API_KEY        - Platform Hub API key (also accepted)
//
//   Anthropic API access - ONE of these (checked in order):
//     1. Replit AI Integration (recommended) — auto-provides AI_INTEGRATIONS_ANTHROPIC_API_KEY
//     2. ANTHROPIC_API_KEY — your own direct Anthropic key
//
// Connector v2.1.3 | Generated 2026-02-20T23:00:00.000Z
// ════════════════════════════════════════════════════════════════════

const KANBAI_URL = process.env.KANBAI_URL || "https://localhost:5000";
const DEPLOY_SECRET = process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY;
const CONNECTOR_VERSION = "2.1.3";
const APP_SLUG = "metric-market";

if (!DEPLOY_SECRET) {
  console.error("[Kanbai] WARNING: No authentication secret found. Set one of: DEPLOY_SECRET_KEY, DEPLOY_SECRET, or HUB_API_KEY");
  console.error("[Kanbai] Hub API calls will fail until a secret is configured.");
}

// ── Helper ──────────────────────────────────────────────────────────
const headers = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${DEPLOY_SECRET}`,
  "X-Kanbai-SDK-Version": CONNECTOR_VERSION,
  "X-Kanbai-Spoke-App": APP_SLUG,
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeHubCall(url, options, label) {
  try {
    const resp = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
    const text = await resp.text();
    try {
      const parsed = JSON.parse(text);
      if (!resp.ok || parsed.error) {
        console.warn(`[Kanbai] ${label}: Hub returned error JSON. Status: ${resp.status}, error: ${parsed.error || "unknown"}`);
        parsed.local = true;
        if (!parsed.error) parsed.error = "hub_error_" + resp.status;
      }
      return parsed;
    } catch {
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        console.warn(`[Kanbai] ${label}: Hub returned HTML (likely redirect or auth page). Status: ${resp.status}`);
        return { error: "hub_html_response", status: resp.status, local: true };
      }
      console.warn(`[Kanbai] ${label}: Non-JSON response from hub. Status: ${resp.status}`);
      return { error: "invalid_json", status: resp.status, local: true };
    }
  } catch (err) {
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    console.warn(`[Kanbai] ${label}: Hub ${isTimeout ? "timed out (10s)" : "unreachable"} — ${err.message}`);
    return { error: err.message, local: true };
  }
}

// ════════════════════════════════════════════════════════════════════
// SECTION 1: CONNECTOR  (pull cards, push cards, sync)
// ════════════════════════════════════════════════════════════════════

async function pullBoard() {
  return safeHubCall(`${KANBAI_URL}/api/pull/board/${APP_SLUG}`, { headers: headers() }, "pullBoard");
}

async function pullUpdates(since) {
  return safeHubCall(`${KANBAI_URL}/api/pull/updates?since=${encodeURIComponent(since)}&app=${APP_SLUG}`, { headers: headers() }, "pullUpdates");
}

async function getCards(page = 1, limit = 100) {
  const data = await safeHubCall(`${KANBAI_URL}/api/kanban/cards?app=${APP_SLUG}&page=${page}&limit=${limit}`, { headers: headers() }, "getCards");
  return Array.isArray(data) ? data : (data.cards || []);
}

async function pushCards(cards) {
  return safeHubCall(`${KANBAI_URL}/api/receive-cards`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({
      cards: cards.map(c => ({
        sourceCardId: c.id,
        title: c.title,
        type: c.type || "task",
        appTarget: APP_SLUG,
        status: c.status || "backlog",
        priority: c.priority || "medium",
        description: c.description || "",
        acceptanceCriteria: c.acceptanceCriteria || [],
        technicalNotes: c.technicalNotes || "",
        tags: c.tags || [],
        dependencies: c.dependencies || [],
        version: c.version || 1,
        updatedAt: c.updatedAt || new Date().toISOString(),
      })),
      metadata: { source: APP_SLUG, sourceApp: APP_SLUG, connectorVersion: CONNECTOR_VERSION, pushedAt: new Date().toISOString() },
    }),
  }, "pushCards");
}

async function checkForUpdates() {
  return safeHubCall(`${KANBAI_URL}/api/connector/update-check?version=${CONNECTOR_VERSION}&app=${APP_SLUG}`, {}, "checkForUpdates");
}

async function registerWebhook(callbackUrl) {
  return safeHubCall(`${KANBAI_URL}/api/webhooks/register`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ appSlug: APP_SLUG, callbackUrl }),
  }, "registerWebhook");
}

async function reportHealth() {
  return safeHubCall(`${KANBAI_URL}/api/ecosystem/health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app: APP_SLUG,
      status: "healthy",
      connectorVersion: CONNECTOR_VERSION,
      timestamp: new Date().toISOString(),
    }),
  }, "reportHealth");
}

// ── Rate-Limit Orchestration ──────────────────────────────────────
// Before making Claude API calls, acquire a rate-limit slot from the central coordinator.
// This prevents 429 errors when multiple spokes share one Anthropic API key.
async function acquireRateLimit(requestCount = 1) {
  return safeHubCall(`${KANBAI_URL}/api/agent/rate-limit/acquire`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ spokeId: APP_SLUG + "-agent", requestCount }),
  }, "acquireRateLimit");
}

async function getRateLimitStatus() {
  return safeHubCall(`${KANBAI_URL}/api/agent/rate-limit/status`, { headers: headers() }, "getRateLimitStatus");
}

// ════════════════════════════════════════════════════════════════════
// SECTION 2: AGENT TASK LIFECYCLE  (claim, progress, complete)
// ════════════════════════════════════════════════════════════════════

async function claimTask(cardId, agentId) {
  return safeHubCall(`${KANBAI_URL}/api/agent/claim`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId }),
  }, "claimTask");
}

async function reportProgress(cardId, agentId, status, notes) {
  return safeHubCall(`${KANBAI_URL}/api/agent/progress`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId, status, notes }),
  }, "reportProgress");
}

async function completeTask(cardId, agentId, completionNotes) {
  return safeHubCall(`${KANBAI_URL}/api/agent/complete`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId, completionNotes }),
  }, "completeTask");
}

async function releaseTask(cardId, agentId) {
  return safeHubCall(`${KANBAI_URL}/api/agent/release`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId }),
  }, "releaseTask");
}

async function getLocalAvailableTasks(priority) {
  if (!process.env.DATABASE_URL) return { cards: [] };
  try {
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const agentStatuses = ["backlog", "planned", "planning", "prioritization", "assignment"];
    let query = "SELECT * FROM kanban_cards WHERE status = ANY($1) AND (app_target = $2 OR app_target IS NULL)";
    const params = [agentStatuses, APP_SLUG];
    if (priority) { query += " AND priority = $" + (params.length + 1); params.push(priority); }
    query += " ORDER BY CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END LIMIT 5";
    const result = await pool.query(query, params);
    await pool.end();
    const cards = result.rows.map(r => ({
      id: r.id, title: r.title, type: r.type, priority: r.priority,
      status: r.status, description: r.description,
      acceptanceCriteria: r.acceptance_criteria,
      technicalNotes: r.technical_notes, tags: r.tags,
      appTarget: r.app_target, assignedTo: r.assigned_to,
    }));
    console.log(`[Kanbai] Local fallback: found ${cards.length} available tasks`);
    return { cards, source: "local" };
  } catch (err) {
    console.warn("[Kanbai] Local task discovery failed:", err.message);
    return { cards: [] };
  }
}

async function getAvailableTasks(priority) {
  const qs = priority ? `&priority=${priority}` : "";
  const data = await safeHubCall(`${KANBAI_URL}/api/agent/available?app=${APP_SLUG}${qs}`, { headers: headers() }, "getAvailableTasks");
  if (data.error) {
    consecutiveHubErrors++;
    if (consecutiveHubErrors === 1) {
      console.warn(`[KanbaiAgent] Hub error on getAvailableTasks: ${data.error}`);
    }
    if (consecutiveHubErrors >= 5) {
      console.warn(`[KanbaiAgent] ${consecutiveHubErrors} consecutive hub errors. Increasing poll interval.`);
    }
    const localData = await getLocalAvailableTasks(priority);
    if (localData.cards.length > 0) return localData;
    return data;
  }
  if (consecutiveHubErrors > 0) {
    console.log("[KanbaiAgent] Hub connection restored after " + consecutiveHubErrors + " errors.");
    consecutiveHubErrors = 0;
  }
  if (!data.cards || data.cards.length === 0) {
    const localData = await getLocalAvailableTasks(priority);
    if (localData.cards.length > 0) return localData;
  }
  return data;
}

async function getSchema() {
  return safeHubCall(`${KANBAI_URL}/api/kanban/schema`, { headers: headers() }, "getSchema");
}

// ════════════════════════════════════════════════════════════════════
// SECTION 3: AGENT RUNNER  (Claude-powered autonomous task loop with tool use)
// ════════════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const AGENT_CONFIG = {
  agentId: "agent-metric-market",
  appSlug: APP_SLUG,
  mode: process.env.KANBAI_AGENT_MODE || "semi",
  model: process.env.KANBAI_AGENT_MODEL || "claude-sonnet-4-5",
  pollInterval: 60000,
  maxConcurrent: 1,
  priorities: ["critical", "high", "medium"],
  autoApprove: (process.env.KANBAI_AGENT_MODE || "semi") === "auto",
  maxToolIterations: parseInt(process.env.KANBAI_AGENT_MAX_ITERATIONS || "25", 10),
  windDownBuffer: parseInt(process.env.KANBAI_AGENT_WINDDOWN_BUFFER || "3", 10),
  maxFileSize: 200 * 1024,
  commandTimeout: 30000,
  allowedCommands: ["npm test", "npm run lint", "npm run build", "ls", "cat", "grep", "find", "wc", "head", "tail", "diff"],
  blockedPaths: ["node_modules", ".git", ".env", ".replit", "replit.nix", "package-lock.json", ".env.local", ".env.production"],
  projectContext: null,
};

// Load spoke-specific context file if it exists
try {
  const contextPath = path.resolve(process.cwd(), "kanbai-context.md");
  if (fs.existsSync(contextPath)) {
    AGENT_CONFIG.projectContext = fs.readFileSync(contextPath, "utf-8").slice(0, 5000);
    console.log("[KanbaiAgent] Loaded project context from kanbai-context.md");
  }
} catch {}

const PROJECT_ROOT = process.cwd();

function sanitizePath(filePath) {
  const resolved = path.resolve(PROJECT_ROOT, filePath);
  if (!resolved.startsWith(PROJECT_ROOT + path.sep) && resolved !== PROJECT_ROOT) throw new Error("Path outside project: " + filePath);
  for (const blocked of AGENT_CONFIG.blockedPaths) {
    const segments = resolved.split(path.sep);
    if (segments.includes(blocked) || resolved.endsWith(path.sep + blocked)) {
      throw new Error("Access denied: " + blocked);
    }
  }
  return resolved;
}

function isCommandAllowed(cmd) {
  const trimmed = cmd.trim();
  const allowedExact = ["npm test", "npm run lint", "npm run build", "ls", "cat", "grep", "find", "wc", "head", "tail", "diff"];
  if (allowedExact.some(a => trimmed === a || trimmed.startsWith(a + " "))) return true;
  return false;
}

const TOOLS = [
  {
    name: "read_file",
    description: "Read the contents of a file. Returns the file text. Use this to understand existing code before making changes.",
    input_schema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Relative path from project root" },
        line_start: { type: "integer", description: "Optional: start reading from this line (1-indexed)" },
        line_end: { type: "integer", description: "Optional: stop reading at this line (inclusive)" }
      },
      required: ["file_path"]
    }
  },
  {
    name: "write_file",
    description: "Write content to a file, creating it if it doesn't exist or overwriting if it does. Use for creating new files or completely replacing file contents.",
    input_schema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Relative path from project root" },
        content: { type: "string", description: "The full file content to write" }
      },
      required: ["file_path", "content"]
    }
  },
  {
    name: "edit_file",
    description: "Replace a specific string in a file with new content. The old_string must match exactly (including whitespace). Use for surgical edits to existing files.",
    input_schema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Relative path from project root" },
        old_string: { type: "string", description: "The exact text to find and replace" },
        new_string: { type: "string", description: "The replacement text" }
      },
      required: ["file_path", "old_string", "new_string"]
    }
  },
  {
    name: "list_directory",
    description: "List files and directories at the given path. Returns names with / suffix for directories.",
    input_schema: {
      type: "object",
      properties: {
        dir_path: { type: "string", description: "Relative path from project root (use '.' for root)" }
      },
      required: ["dir_path"]
    }
  },
  {
    name: "search_files",
    description: "Search for a text pattern across files using grep. Returns matching lines with file paths and line numbers.",
    input_schema: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Text or regex pattern to search for" },
        dir_path: { type: "string", description: "Directory to search in (default: '.')" },
        file_glob: { type: "string", description: "Optional file pattern filter, e.g. '*.ts' or '*.tsx'" }
      },
      required: ["pattern"]
    }
  },
  {
    name: "run_command",
    description: "Run a shell command in the project directory. Only allowed commands: npm test, npm run lint, npm run build, ls, cat, grep, find, wc, head, tail, diff. Use for running tests or checking build output.",
    input_schema: {
      type: "object",
      properties: {
        command: { type: "string", description: "The shell command to run" }
      },
      required: ["command"]
    }
  }
];

function executeTool(name, input) {
  try {
    switch (name) {
      case "read_file": {
        const absPath = sanitizePath(input.file_path);
        if (!fs.existsSync(absPath)) return { error: "File not found: " + input.file_path };
        const stat = fs.statSync(absPath);
        if (stat.size > AGENT_CONFIG.maxFileSize) return { error: `File too large (${Math.round(stat.size/1024)}KB). Max: ${Math.round(AGENT_CONFIG.maxFileSize/1024)}KB` };
        let content = fs.readFileSync(absPath, "utf-8");
        if (input.line_start || input.line_end) {
          const lines = content.split("\n");
          const start = Math.max(0, (input.line_start || 1) - 1);
          const end = input.line_end || lines.length;
          content = lines.slice(start, end).join("\n");
        }
        return { content, lines: content.split("\n").length };
      }
      case "write_file": {
        const absPath = sanitizePath(input.file_path);
        if (input.content.length > AGENT_CONFIG.maxFileSize) return { error: "Content too large" };
        const dir = path.dirname(absPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(absPath, input.content, "utf-8");
        return { success: true, path: input.file_path, bytes: input.content.length };
      }
      case "edit_file": {
        const absPath = sanitizePath(input.file_path);
        if (!fs.existsSync(absPath)) return { error: "File not found: " + input.file_path };
        const content = fs.readFileSync(absPath, "utf-8");
        if (!content.includes(input.old_string)) {
          const firstLine = (input.old_string || "").split("\n")[0].trim();
          let hint = "";
          if (firstLine.length > 5) {
            const lines = content.split("\n");
            const nearMatches = [];
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(firstLine.slice(0, 30))) {
                nearMatches.push({ line: i + 1, text: lines[i].trim().slice(0, 120) });
                if (nearMatches.length >= 3) break;
              }
            }
            if (nearMatches.length > 0) {
              hint = " Nearby matches for first line: " + nearMatches.map(m => `L${m.line}: "${m.text}"`).join("; ") + ". TIP: Use read_file with line_start/line_end to see exact text, or use write_file to replace the entire file.";
            }
          }
          return { error: "old_string not found in file. Make sure it matches exactly including whitespace and indentation." + hint };
        }
        const occurrences = content.split(input.old_string).length - 1;
        if (occurrences > 1) return { error: `old_string found ${occurrences} times. Provide more surrounding context to make it unique.` };
        // Edit safety: warn on destructive edits and create .bak backup
        const oldLen = (input.old_string || "").length;
        const newLen = (input.new_string || "").length;
        let destructiveWarning = "";
        if (oldLen > 50 && newLen < oldLen * 0.5) {
          destructiveWarning = " WARNING: new_string is " + Math.round((1 - newLen / oldLen) * 100) + "% shorter than old_string. This is a large deletion.";
        }
        // Create .bak backup before modifying
        const bakPath = absPath + ".bak";
        try { fs.writeFileSync(bakPath, content, "utf-8"); } catch {}
        const updated = content.replace(input.old_string, input.new_string);
        // Duplicate declaration detection: check for duplicate exports/declarations
        const dupWarnings = [];
        if (input.file_path.match(/\.(ts|js|tsx|jsx|mjs|cjs)$/)) {
          const exportMatches = updated.match(/^export\s+(?:const|let|var|function|class|enum|type|interface|default)\s+(\w+)/gm);
          if (exportMatches) {
            const exportNames = exportMatches.map(m => m.replace(/^export\s+(?:const|let|var|function|class|enum|type|interface|default)\s+/, ""));
            const seen = {};
            for (const n of exportNames) { seen[n] = (seen[n] || 0) + 1; }
            const dups = Object.entries(seen).filter(([, c]) => c > 1).map(([n, c]) => n + " (x" + c + ")");
            if (dups.length > 0) {
              // REVERT: restore from backup to prevent app crash
              fs.writeFileSync(absPath, content, "utf-8");
              return { error: "EDIT REVERTED: Would create duplicate export declarations: " + dups.join(", ") + ". Search the file for existing declarations before adding new ones. Use read_file or search_files to check first." };
            }
          }
        }
        fs.writeFileSync(absPath, updated, "utf-8");
        return { success: true, path: input.file_path, backupCreated: bakPath.replace(PROJECT_ROOT + "/", ""), ...(destructiveWarning ? { warning: destructiveWarning } : {}) };
      }
      case "list_directory": {
        const absPath = sanitizePath(input.dir_path || ".");
        if (!fs.existsSync(absPath)) return { error: "Directory not found: " + input.dir_path };
        const entries = fs.readdirSync(absPath, { withFileTypes: true })
          .filter(e => !AGENT_CONFIG.blockedPaths.includes(e.name))
          .map(e => e.name + (e.isDirectory() ? "/" : ""))
          .sort();
        return { path: input.dir_path, entries };
      }
      case "search_files": {
        const dir = sanitizePath(input.dir_path || ".");
        const grepArgs = ["-rn", "--binary-files=without-match"];
        const defaultExcludes = ["node_modules", ".git", "dist", "attached_assets", ".cache", "coverage"];
        defaultExcludes.forEach(d => grepArgs.push("--exclude-dir=" + d));
        if (input.file_glob) grepArgs.push("--include=" + input.file_glob);
        grepArgs.push("--", input.pattern, dir);
        try {
          const { execFileSync } = require("child_process");
          const result = execFileSync("grep", grepArgs, { cwd: PROJECT_ROOT, timeout: 10000, encoding: "utf-8", maxBuffer: 512 * 1024 });
          const lines = result.trim().split("\n").filter(Boolean).slice(0, 50);
          return { matches: lines.length, results: lines.map(l => l.replace(PROJECT_ROOT + "/", "")) };
        } catch {
          return { matches: 0, results: [] };
        }
      }
      case "run_command": {
        if (!isCommandAllowed(input.command)) {
          return { error: `Command not allowed. Permitted: ${AGENT_CONFIG.allowedCommands.join(", ")}` };
        }
        try {
          const result = execSync(input.command, {
            cwd: PROJECT_ROOT,
            timeout: AGENT_CONFIG.commandTimeout,
            encoding: "utf-8",
            maxBuffer: 512 * 1024,
            stdio: ["pipe", "pipe", "pipe"]
          });
          const output = result.slice(0, 5000);
          return { exitCode: 0, output };
        } catch (err) {
          return { exitCode: err.status || 1, output: (err.stdout || "").slice(0, 3000), stderr: (err.stderr || "").slice(0, 2000) };
        }
      }
      default:
        return { error: "Unknown tool: " + name };
    }
  } catch (err) {
    return { error: err.message };
  }
}

async function executeTaskWithTools(anthropic, cardId, card) {
  const changeLog = [];
  const filesChanged = {};
  const testResults = [];
  let iterationCount = 0;
  let agentSummary = "";

  const maxIter = AGENT_CONFIG.maxToolIterations;
  const exploreMax = Math.min(4, Math.floor(maxIter * 0.2));
  const implMax = Math.floor(maxIter * 0.6);
  const verifyMax = Math.max(2, maxIter - exploreMax - implMax - 1);
  const systemPrompt = `You are an autonomous AI development agent for "${APP_SLUG}".
You have a STRICT budget of ${maxIter} tool-use rounds. Be efficient and produce tangible output.

BUDGET ALLOCATION (plan your rounds carefully):
- Rounds 1-${exploreMax}: EXPLORE — list_directory and read_file on key files only
- Rounds ${exploreMax + 1}-${exploreMax + implMax}: IMPLEMENT — write_file or edit_file to create/modify code
- Rounds ${exploreMax + implMax + 1}-${maxIter - 1}: VERIFY — run tests or read modified files to confirm
- Round ${maxIter}: SUMMARIZE — write your final summary (no tools)

WORKFLOW:
1. EXPLORE (max ${exploreMax} rounds): Understand project structure. Read ONLY the files most relevant to the task.
2. IMPLEMENT (core budget): Create or edit files. Write actual code, not analysis.
   - If edit_file fails twice on the same file, use write_file to replace the entire file instead.
   - Always check acceptance criteria against your implementation.
3. VERIFY (1-2 rounds): Read modified files or run "npm test" / "npm run build" to confirm changes compile.
4. SUMMARIZE: Start your final message with "SUMMARY:" listing what you created/changed.

RULES:
- Spend at most ${exploreMax} rounds exploring. Then START implementing.
- Every task must produce at least one tangible artifact (file, code change, configuration, documentation)
- If the task is analytical (design, spec, planning), create an output file with the analysis
- Make focused, minimal changes that accomplish the task
- Do NOT edit package.json directly — flag dependency needs in your summary instead
- If you cannot fully complete the task, implement what you can and document remaining work in your summary
- Track which acceptance criteria you have and haven't addressed
- When you finish, provide a clear summary starting with "SUMMARY:" listing every file created/modified

CRITICAL GUARDRAILS:
- BEFORE editing any shared/schema file: Use search_files to check if the declaration/export you want to add already exists. Duplicate exports will crash the app.
- AFTER creating any API/route file: You MUST register it in the main routes/server file. Unregistered routes = dead code = wasted budget.
- BEFORE your final summary: Run "npm run build" or "npm test" to verify the app still compiles. Leaving a broken build for the next person is unacceptable.
- COMPLETION CHECKLIST: Before declaring done, verify: (1) All new files are registered/imported, (2) App compiles, (3) No empty files created, (4) Route handlers are accessible.

PROJECT: ${APP_SLUG}
WORKING DIRECTORY: ${PROJECT_ROOT}${AGENT_CONFIG.projectContext ? "\n\nPROJECT CONTEXT (from kanbai-context.md):\n" + AGENT_CONFIG.projectContext : ""}`;

  const isContinuation = (card.tags || []).includes("agent-continuation") || (card.title && card.title.startsWith("[CONTINUE"));
  let resumeBlock = "";
  if (isContinuation && card._resumeContext) {
    const ctx = card._resumeContext;
    const fileDetails = ctx.filesChanged ? Object.entries(ctx.filesChanged).map(([f, info]) => `  - ${f} (${info.action || "modified"}, ${info.size || "?"} bytes)`).join("\n") : "  none";
    resumeBlock = `\n\n=== CONTINUATION CONTEXT (from previous agent session) ===
Previous agent: ${ctx.pausedBy || "unknown"}
Previous iterations used: ${ctx.iterations || "?"}
Files already modified (DO NOT recreate these — read them to see current state):
${fileDetails}
Full activity log from previous session:
${(ctx.changeLog || []).join("\n")}
Resume instructions: ${ctx.resumeInstructions || "Continue from where the previous agent left off."}
=== END CONTINUATION CONTEXT ===

CRITICAL CONTINUATION RULES:
1. Do NOT re-explore directories you already know about. Skip list_directory calls — the activity log above shows what was found.
2. Do NOT recreate files that were already written — read them to verify, then continue with remaining work.
3. Focus ONLY on unfinished items from the resume instructions above.
4. Your budget is limited — every round spent re-reading known files is a round lost for implementation.
5. If the previous agent created API/route files, check if they are REGISTERED in the main routes file. Route registration is often the missing step.`;
  }

  const taskPrompt = `Task to implement (you have ${maxIter} tool rounds — explore briefly, then implement):

Title: ${card.title}
Type: ${card.type || "task"}
Priority: ${card.priority || "medium"}
Description: ${card.description || "No description provided"}
Acceptance Criteria: ${JSON.stringify(card.acceptanceCriteria || [], null, 2)}
Technical Notes: ${card.technicalNotes || "None"}
Tags: ${(card.tags || []).join(", ") || "None"}${resumeBlock}

Begin by briefly exploring the project structure (2-3 rounds), then implement the required changes. Produce tangible output.`;

  // If resuming from a restart, prepend prior conversation context
  let messages;
  if (card._resumed && card._priorMessages && card._priorMessages.length > 0) {
    messages = [{ role: "user", content: taskPrompt }];
    // Add a context note that we're resuming
    messages.push({ role: "user", content: [{ type: "text", text: `[SYSTEM: This task was interrupted by a server restart (restart #${card._restartCount || 1}). ${card._priorMessages.length} prior conversation messages have been restored. Continue from where you left off — do NOT re-read files you already explored. Focus on implementing remaining work.` }] });
    // Attempt to restore prior messages as context
    try {
      for (const msg of card._priorMessages) { messages.push(msg); }
      console.log(`[KanbaiAgent] Restored ${card._priorMessages.length} conversation messages for resumed task #${cardId}`);
    } catch { /* ignore restore errors */ }
  } else {
    messages = [{ role: "user", content: taskPrompt }];
  }

  let consecutiveApiErrors = 0;
  const API_MAX_RETRIES = 5;
  let circuitBroken = false;

  while (iterationCount < AGENT_CONFIG.maxToolIterations) {
    iterationCount++;
    await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
      `Agent working... (step ${iterationCount}/${AGENT_CONFIG.maxToolIterations})`);

    let response;
    try {
      response = await anthropic.messages.create({
        model: AGENT_CONFIG.model || "claude-sonnet-4-5",
        max_tokens: 4096,
        system: systemPrompt,
        tools: TOOLS,
        messages
      });
      consecutiveApiErrors = 0;
    } catch (apiErr) {
      const statusCode = apiErr.status || apiErr.statusCode || 0;
      const isRetryable = statusCode === 429 || statusCode === 529 || statusCode === 503 || statusCode === 500;
      consecutiveApiErrors++;
      const backoffMs = Math.min(5000 * Math.pow(2, consecutiveApiErrors - 1), 120000);
      console.warn(`[KanbaiAgent] Anthropic API error on #${cardId} (attempt ${consecutiveApiErrors}/${API_MAX_RETRIES}): ${statusCode} ${apiErr.message}. Next retry in ${Math.round(backoffMs / 1000)}s`);
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
        `API error (attempt ${consecutiveApiErrors}/${API_MAX_RETRIES}): ${statusCode}. Retrying in ${Math.round(backoffMs / 1000)}s...`);

      if (!isRetryable || consecutiveApiErrors >= API_MAX_RETRIES) {
        console.error(`[KanbaiAgent] Circuit breaker tripped for #${cardId} after ${consecutiveApiErrors} consecutive API failures. Releasing task.`);
        changeLog.push(`CIRCUIT_BREAKER: ${consecutiveApiErrors} consecutive API errors (${statusCode}). Task released.`);
        agentSummary = `PAUSED: Agent could not reach Claude API after ${consecutiveApiErrors} attempts (last error: ${statusCode} ${apiErr.message}). Task released for retry later.`;
        circuitBroken = true;
        try { await releaseTask(cardId, AGENT_CONFIG.agentId); } catch {}
        break;
      }
      await new Promise(r => setTimeout(r, backoffMs));
      iterationCount--;
      continue;
    }

    if (response.stop_reason === "end_turn" || !response.content.some(b => b.type === "tool_use")) {
      const textBlocks = response.content.filter(b => b.type === "text");
      agentSummary = textBlocks.map(b => b.text).join("\n") || "Task processing completed";
      changeLog.push("Final: " + agentSummary.slice(0, 500));
      break;
    }

    const assistantContent = response.content;
    messages.push({ role: "assistant", content: assistantContent });

    const toolResults = [];
    for (const block of assistantContent) {
      if (block.type !== "tool_use") continue;

      console.log(`[KanbaiAgent] Tool: ${block.name}(${JSON.stringify(block.input).slice(0, 100)}...)`);
      const result = executeTool(block.name, block.input);

      // Log ALL tool operations, including failures
      if (result.error) {
        changeLog.push(`FAILED: ${block.name}(${(block.input.file_path || block.input.dir_path || block.input.pattern || block.input.command || "").slice(0, 60)}) — ${result.error.slice(0, 150)}`);
      } else if (block.name === "read_file") {
        changeLog.push(`Read: ${block.input.file_path}`);
      } else if (block.name === "list_directory") {
        changeLog.push(`Listed: ${block.input.dir_path || "."}`);
      } else if (block.name === "search_files") {
        changeLog.push(`Searched: "${block.input.pattern}" in ${block.input.dir_path || "."} (${(result.matches || result.results?.length || 0)} matches)`);
      }
      if (block.name === "write_file" && result.success) {
        changeLog.push(`Wrote: ${block.input.file_path}`);
        filesChanged[block.input.file_path] = { action: "written", size: (block.input.content || "").length };
      }
      if (block.name === "edit_file" && result.success) {
        changeLog.push(`Edited: ${block.input.file_path}`);
        filesChanged[block.input.file_path] = { action: "edited", oldSnippet: (block.input.old_string || "").slice(0, 100) + "...", newSnippet: (block.input.new_string || "").slice(0, 100) + "..." };
      }
      if (block.name === "run_command" && !result.error) {
        changeLog.push(`Ran: ${block.input.command} (exit: ${result.exitCode})`);
        if (block.input.command.startsWith("npm test") || block.input.command.startsWith("npm run lint") || block.input.command.startsWith("npm run build")) {
          testResults.push({ command: block.input.command, exitCode: result.exitCode, output: (result.output || result.error || "").slice(0, 1000), passed: result.exitCode === 0 });
        }
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result).slice(0, 10000)
      });
    }

    messages.push({ role: "user", content: toolResults });

    const remaining = AGENT_CONFIG.maxToolIterations - iterationCount;
    if (remaining === AGENT_CONFIG.windDownBuffer && Object.keys(filesChanged).length > 0) {
      messages.push({ role: "user", content: [{ type: "text", text:
        `BUDGET PAUSE WARNING: You have ${remaining} tool rounds remaining before this session is paused. Your work will NOT be lost — a continuation card will be created so you (or another agent) can resume later. Use your remaining rounds to: 1) Ensure all modified files are saved and in a working state, 2) Write a PAUSE REPORT starting with "PAUSE:" that documents: a) What you accomplished, b) What files were changed and why, c) What specific next steps remain, d) Any context the next agent needs to pick up where you left off.`
      }] });
    } else if (remaining === 1) {
      messages.push({ role: "user", content: [{ type: "text", text:
        `FINAL ROUND: This is your LAST tool round. Do NOT use any more tools. Write your PAUSE REPORT now. Start with "PAUSE:" and list: 1) Files changed and what was done, 2) Specific remaining work items, 3) Important context for resumption. This report will be used to create a continuation card.`
      }] });
    }

    if (iterationCount % 3 === 0) {
      if (changeLog.length > 0) {
        await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
          `Agent progress (step ${iterationCount}): ${changeLog.slice(-3).join("; ")}`);
      }
      // Persist state every 3 iterations for restart resilience
      saveActiveTask(cardId, card, messages);
    }
  }

  // Clear active task state on completion
  clearActiveTask(cardId);

  const budgetExhausted = iterationCount >= AGENT_CONFIG.maxToolIterations;
  const failedOps = changeLog.filter(l => l.startsWith("FAILED:"));
  const hadChanges = Object.keys(filesChanged).length > 0;

  // Auto build verification: check if app still compiles after changes
  let buildVerified = false;
  if (hadChanges) {
    try {
      const buildCmd = isCommandAllowed("npm run build") ? "npm run build" : (isCommandAllowed("npm test") ? "npm test" : null);
      if (buildCmd) {
        const buildResult = executeTool("run_command", { command: buildCmd });
        if (buildResult.exitCode === 0) {
          changeLog.push("AUTO_VERIFY: Build check passed (" + buildCmd + ")");
          buildVerified = true;
        } else {
          changeLog.push("AUTO_VERIFY: Build check FAILED (" + buildCmd + "). Output: " + (buildResult.output || buildResult.stderr || "").slice(0, 500));
          // Try to restore from .bak files for any schema/shared files that were modified
          for (const [filePath] of Object.entries(filesChanged)) {
            if (filePath.includes("schema") || filePath.includes("shared/")) {
              const bakPath = sanitizePath(filePath) + ".bak";
              try {
                if (fs.existsSync(bakPath)) {
                  fs.copyFileSync(bakPath, sanitizePath(filePath));
                  changeLog.push("AUTO_RESTORE: Restored " + filePath + " from backup due to build failure");
                }
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      changeLog.push("AUTO_VERIFY: Build check error: " + err.message);
    }
  }

  // Classify the outcome
  let failureReason = null;
  if (budgetExhausted && !hadChanges) {
    failureReason = failedOps.length > 0 ? "edit_failed" : "exhausted_budget_no_changes";
  } else if (budgetExhausted && hadChanges) {
    failureReason = "exhausted_budget_partial";
  }

  if (budgetExhausted) {
    changeLog.push("Reached max iterations (" + AGENT_CONFIG.maxToolIterations + ") — pausing for continuation");
    if (!agentSummary) {
      if (hadChanges) {
        agentSummary = `Agent paused at budget limit (${iterationCount}/${AGENT_CONFIG.maxToolIterations} iterations). Files modified: ${Object.keys(filesChanged).join(", ")}. Build verified: ${buildVerified ? "YES" : "NO"}. Activities: ${changeLog.length} operations (${failedOps.length} failed). Work preserved — continuation card will be created for resumption.`;
      } else {
        agentSummary = `Agent paused at budget limit (${iterationCount}/${AGENT_CONFIG.maxToolIterations} iterations). Explored codebase but made no file changes. Activities: ${changeLog.length} operations (${failedOps.length} failed).`;
      }
    }
  }

  const completionReport = {
    cardId,
    agentId: AGENT_CONFIG.agentId,
    app: APP_SLUG,
    iterations: iterationCount,
    filesChanged,
    testResults,
    failedOperations: failedOps,
    failureReason,
    summary: agentSummary || changeLog.join("\n"),
    changeLog,
    completedAt: new Date().toISOString(),
    hadChanges,
    buildVerified,
    allTestsPassed: testResults.length === 0 || testResults.every(t => t.passed),
    budgetExhausted,
    circuitBroken,
    resumeContext: budgetExhausted ? extractResumeContext(agentSummary, filesChanged, changeLog) : null,
  };

  return completionReport;
}

function extractResumeContext(summary, filesChanged, changeLog) {
  const pauseMatch = summary && summary.match(/PAUSE:\s*([\s\S]*)/i);
  const remainingWork = pauseMatch ? pauseMatch[1].trim() : null;
  return {
    whatWasDone: Object.keys(filesChanged).length > 0
      ? `Modified ${Object.keys(filesChanged).length} files: ${Object.keys(filesChanged).join(", ")}`
      : "Explored codebase, no files changed yet",
    filesModified: Object.keys(filesChanged),
    recentActivity: changeLog.slice(-10),
    remainingWork: remainingWork || "Review the agent summary and original card for remaining work items.",
    resumeInstructions: "Start by reading the files listed above to understand what was already done. Then continue implementing the remaining acceptance criteria from the original card.",
  };
}

async function pauseAndCreateContinuation(report) {
  try {
    const pauseResult = await safeHubCall(`${KANBAI_URL}/api/agent/pause`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        cardId: report.cardId,
        agentId: report.agentId,
        reason: "budget_exhausted",
        resumeContext: report.resumeContext ? report.resumeContext.remainingWork : report.summary,
        filesChanged: report.filesChanged,
        changeLog: report.changeLog,
        iterations: report.iterations,
        summary: report.summary,
      }),
    }, "pauseAndContinue");

    if (pauseResult.continuationCardId) {
      console.log(`[KanbaiAgent] Created continuation card #${pauseResult.continuationCardId} for paused card #${report.cardId}`);
    }
    return pauseResult;
  } catch (err) {
    console.error(`[KanbaiAgent] Failed to create continuation card for #${report.cardId}:`, err.message);
    return { error: err.message };
  }
}

async function checkDailyBudget() {
  try {
    const result = await safeHubCall(`${KANBAI_URL}/api/agent/budget/check`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ agentId: AGENT_CONFIG.agentId }),
    }, "checkDailyBudget");
    if (result.error) {
      console.warn(`[KanbaiAgent] Budget check failed: ${result.error} — pausing agent`);
      return false;
    }
    return result.allowed !== false;
  } catch (err) {
    return true;
  }
}

async function notifyHubCompletion(report) {
  const hubUrl = process.env.HUB_URL || process.env.PLATFORM_HUB_URL;
  if (!hubUrl) return;
  try {
    const resp = await fetch(`${hubUrl}/api/agent-completion`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": process.env.HUB_API_KEY || process.env.DEPLOY_SECRET_KEY || "" },
      body: JSON.stringify(report),
    });
    if (resp.ok) console.log(`[KanbaiAgent] Notified Hub of completion for card #${report.cardId}`);
  } catch (err) { console.log("[KanbaiAgent] Hub notification failed:", err.message); }
}

let activeTasks = new Map();
let pendingApproval = new Map();
let pendingReview = new Map();
let recentlyFailedClaims = new Set();
let processedCards = new Set();
let running = false;
let dailyBudgetPaused = false;
let consecutiveHubErrors = 0;
const agentActivityLog = [];

async function updateLocalCardStatus(cardId, newStatus) {
  if (!process.env.DATABASE_URL) return;
  try {
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query("UPDATE kanban_cards SET status = $1 WHERE id = $2", [newStatus, cardId]);
    await pool.end();
    console.log(`[KanbaiAgent] Local DB: card #${cardId} → ${newStatus}`);
  } catch (err) {
    console.warn(`[KanbaiAgent] Local DB update failed for #${cardId}: ${err.message}`);
  }
}
function logActivity(event, cardId, details) {
  const entry = { ts: new Date().toISOString(), event, cardId: cardId || null, details: details || "" };
  agentActivityLog.push(entry);
  if (agentActivityLog.length > 200) agentActivityLog.shift();
  console.log(`[KanbaiAgent] ${event}${cardId ? " #" + cardId : ""}: ${details || ""}`);
}

// ── File-based persistence for restart resilience ──────────────────────
const KANBAI_DIR = path.resolve(PROJECT_ROOT, ".kanbai");
const STALE_TASK_MINUTES = parseInt(process.env.KANBAI_STALE_TASK_MINUTES || "30", 10);

function ensureKanbaiDir() {
  if (!fs.existsSync(KANBAI_DIR)) fs.mkdirSync(KANBAI_DIR, { recursive: true });
}

// Active task state persistence (survives server restarts)
function saveActiveTask(cardId, card, conversationMessages) {
  try {
    ensureKanbaiDir();
    const state = {
      cardId, card, savedAt: new Date().toISOString(),
      agentId: AGENT_CONFIG.agentId,
      restartCount: 0,
    };
    fs.writeFileSync(path.join(KANBAI_DIR, "active-task.json"), JSON.stringify(state, null, 2), "utf-8");
    // Persist conversation (last N messages, truncated)
    if (conversationMessages && conversationMessages.length > 0) {
      const trimmed = conversationMessages.slice(-10).map(m => {
        if (typeof m.content === "string" && m.content.length > 2000) {
          return { ...m, content: m.content.slice(0, 2000) + "...[truncated]" };
        }
        if (Array.isArray(m.content)) {
          return { ...m, content: m.content.map(b => {
            if (b.type === "text" && b.text && b.text.length > 2000) return { ...b, text: b.text.slice(0, 2000) + "...[truncated]" };
            if (b.type === "tool_result" && typeof b.content === "string" && b.content.length > 1000) return { ...b, content: b.content.slice(0, 1000) + "...[truncated]" };
            return b;
          })};
        }
        return m;
      });
      fs.writeFileSync(path.join(KANBAI_DIR, `conversation-${cardId}.json`), JSON.stringify(trimmed, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[KanbaiAgent] Failed to save active task state:", err.message);
  }
}

function clearActiveTask(cardId) {
  try {
    const taskFile = path.join(KANBAI_DIR, "active-task.json");
    if (fs.existsSync(taskFile)) fs.unlinkSync(taskFile);
    const convFile = path.join(KANBAI_DIR, `conversation-${cardId}.json`);
    if (fs.existsSync(convFile)) fs.unlinkSync(convFile);
  } catch {}
}

function loadActiveTask() {
  try {
    const taskFile = path.join(KANBAI_DIR, "active-task.json");
    if (!fs.existsSync(taskFile)) return null;
    const state = JSON.parse(fs.readFileSync(taskFile, "utf-8"));
    if (!state.cardId) return null;
    // Check staleness
    const savedAt = new Date(state.savedAt);
    const ageMinutes = (Date.now() - savedAt.getTime()) / 60000;
    if (ageMinutes > STALE_TASK_MINUTES) {
      console.log(`[KanbaiAgent] Active task #${state.cardId} is stale (${Math.round(ageMinutes)}m > ${STALE_TASK_MINUTES}m). Discarding.`);
      clearActiveTask(state.cardId);
      return null;
    }
    // Increment restart counter
    state.restartCount = (state.restartCount || 0) + 1;
    const MAX_RESTARTS = parseInt(process.env.KANBAI_MAX_RESTARTS_PER_TASK || "5", 10);
    if (state.restartCount > MAX_RESTARTS) {
      console.warn(`[KanbaiAgent] Task #${state.cardId} restarted ${state.restartCount} times (max ${MAX_RESTARTS}). Auto-pausing to prevent infinite loop.`);
      clearActiveTask(state.cardId);
      return null;
    }
    // Save updated restart count
    fs.writeFileSync(path.join(KANBAI_DIR, "active-task.json"), JSON.stringify(state, null, 2), "utf-8");
    console.log(`[KanbaiAgent] Resuming active task #${state.cardId} (restart #${state.restartCount}, age: ${Math.round(ageMinutes)}m)`);
    return state;
  } catch { return null; }
}

function loadConversation(cardId) {
  try {
    const convFile = path.join(KANBAI_DIR, `conversation-${cardId}.json`);
    if (!fs.existsSync(convFile)) return null;
    return JSON.parse(fs.readFileSync(convFile, "utf-8"));
  } catch { return null; }
}

// Pending review persistence
function savePendingReview(cardId, report) {
  try {
    ensureKanbaiDir();
    fs.writeFileSync(path.join(KANBAI_DIR, `review-${cardId}.json`), JSON.stringify(report, null, 2), "utf-8");
  } catch (err) {
    console.warn("[KanbaiAgent] Failed to persist review:", err.message);
  }
}

function deletePendingReview(cardId) {
  try {
    const filePath = path.join(KANBAI_DIR, `review-${cardId}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

function loadPendingReviews() {
  try {
    if (!fs.existsSync(KANBAI_DIR)) return;
    const files = fs.readdirSync(KANBAI_DIR).filter(f => f.startsWith("review-") && f.endsWith(".json"));
    for (const file of files) {
      try {
        const report = JSON.parse(fs.readFileSync(path.join(KANBAI_DIR, file), "utf-8"));
        if (report.cardId) {
          pendingReview.set(report.cardId, report);
          console.log(`[KanbaiAgent] Restored pending review for card #${report.cardId}`);
        }
      } catch {}
    }
    if (pendingReview.size > 0) {
      console.log(`[KanbaiAgent] Restored ${pendingReview.size} pending review(s) from disk`);
    }
  } catch {}
}

// Restore pending reviews on load
loadPendingReviews();

async function startAgent() {
  // Duplicate-start guard: prevent two agent loops from running
  if (running) {
    console.warn("[KanbaiAgent] Agent already running. Ignoring duplicate start.");
    return;
  }
  let Anthropic;
  try { Anthropic = require("@anthropic-ai/sdk"); } catch {
    console.warn("[KanbaiAgent] @anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk");
    console.warn("[KanbaiAgent] Agent runner disabled. Connector and routes still work.");
    return;
  }
  if (!DEPLOY_SECRET) {
    console.error("[KanbaiAgent] No auth secret configured. Set DEPLOY_SECRET_KEY, DEPLOY_SECRET, or HUB_API_KEY.");
    console.error("[KanbaiAgent] Agent cannot communicate with hub. Aborting start.");
    return;
  }
  const anthropicConfig = {};
  if (process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
    anthropicConfig.apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    if (process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL) anthropicConfig.baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
    console.log("[KanbaiAgent] Using Replit AI Integration credentials");
  } else if (process.env.ANTHROPIC_API_KEY) {
    console.log("[KanbaiAgent] Using ANTHROPIC_API_KEY");
  } else {
    console.warn("[KanbaiAgent] No Anthropic API key found. Set AI_INTEGRATIONS_ANTHROPIC_API_KEY (via Replit AI Integration) or ANTHROPIC_API_KEY.");
    return;
  }
  const anthropic = new Anthropic(anthropicConfig);
  console.log(`[KanbaiAgent] Starting ${AGENT_CONFIG.agentId} in ${AGENT_CONFIG.mode} mode (tool-use, budget: ${AGENT_CONFIG.maxToolIterations} iterations, stale: ${STALE_TASK_MINUTES}m)`);
  running = true;

  // ── Auto-resume: check for interrupted task from previous run ──
  const resumedState = loadActiveTask();
  if (resumedState) {
    const card = resumedState.card;
    const priorMessages = loadConversation(resumedState.cardId);
    activeTasks.set(resumedState.cardId, { ...card, claimedAt: new Date(), _resumed: true, _priorMessages: priorMessages, _restartCount: resumedState.restartCount });
    console.log(`[KanbaiAgent] Auto-resumed task #${resumedState.cardId} "${card.title}" (restart #${resumedState.restartCount}${priorMessages ? ", " + priorMessages.length + " prior messages restored" : ""})`);
  }

  while (running) {
    try {
      // Check daily budget before claiming new work
      if (dailyBudgetPaused) {
        const budgetOk = await checkDailyBudget();
        if (budgetOk) {
          dailyBudgetPaused = false;
          console.log("[KanbaiAgent] Daily budget restored. Resuming work.");
        } else {
          await sleep(AGENT_CONFIG.pollInterval * 5);
          continue;
        }
      }

      if (activeTasks.size < AGENT_CONFIG.maxConcurrent) {
        const budgetOk = await checkDailyBudget();
        if (!budgetOk) {
          if (!dailyBudgetPaused) {
            dailyBudgetPaused = true;
            console.log("[KanbaiAgent] Daily budget exhausted. Pausing until admin increases limits.");
          }
          await sleep(AGENT_CONFIG.pollInterval * 5);
          continue;
        }

        for (const priority of AGENT_CONFIG.priorities) {
          const { cards } = await getAvailableTasks(priority);
          if (!cards || cards.length === 0) continue;

          // Skip cards that need approval, are already pending, or recently failed claim
          const eligible = cards.filter(c => {
            const tags = c.tags || [];
            if (tags.includes("needs-approval")) return false;
            if (pendingApproval.has(c.id) || activeTasks.has(c.id)) return false;
            if (recentlyFailedClaims.has(c.id) || processedCards.has(c.id)) return false;
            return true;
          });
          if (eligible.length === 0) continue;
          const card = eligible[0];

          // If this is a continuation card, load resume context
          const isContinuation = (card.tags || []).includes("agent-continuation") || (card.title && card.title.startsWith("[CONTINUE"));
          if (isContinuation && card.technicalNotes) {
            try {
              card._resumeContext = JSON.parse(card.technicalNotes);
            } catch { /* non-JSON technicalNotes, proceed without context */ }
          }

          console.log(`[KanbaiAgent] Found task: #${card.id} "${card.title}" [${card.priority}]${isContinuation ? " (CONTINUATION)" : ""}`);
          if (AGENT_CONFIG.mode === "semi" && !AGENT_CONFIG.autoApprove) {
            pendingApproval.set(card.id, card);
            break;
          }
          const claimResult = await claimTask(card.id, AGENT_CONFIG.agentId);
          if (!claimResult.error || claimResult.local) {
            activeTasks.set(card.id, { ...card, claimedAt: new Date() });
            saveActiveTask(card.id, card, []);
            recentlyFailedClaims.delete(card.id);
            await updateLocalCardStatus(card.id, "in_progress");
          } else {
            console.warn(`[KanbaiAgent] Claim gate blocked task #${card.id}: error=${claimResult.error}, local=${claimResult.local}`);
            logActivity("CLAIM_GATE_BLOCKED", card.id, `Hub error=${claimResult.error}, local=${claimResult.local}. Full result: ${JSON.stringify(claimResult).substring(0, 200)}`);
            recentlyFailedClaims.add(card.id);
          }
          break;
        }
      }
      for (const [cardId, card] of activeTasks) {
        try {
          logActivity("TASK_START", cardId, `Processing "${card.title}" with executeTaskWithTools`);
          await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", "Agent starting task with tool-use...");
          const report = await executeTaskWithTools(anthropic, cardId, card);
          logActivity("TASK_DONE", cardId, `iterations=${report.iterations}, files=${Object.keys(report.filesChanged).length}, circuitBroken=${!!report.circuitBroken}, budgetExhausted=${!!report.budgetExhausted}`);
          const summary = report.summary || report.changeLog.join("\n") || "No changes made";
          const reportSummary = `${report.budgetExhausted ? "PAUSED" : report.circuitBroken ? "API_FAILURE" : "Completed"} in ${report.iterations} steps | ${Object.keys(report.filesChanged).length} files changed | Tests: ${report.testResults.length === 0 ? "none ran" : report.allTestsPassed ? "all passed" : "some failed"}\n\nFiles: ${Object.keys(report.filesChanged).join(", ") || "none"}\n\n${summary}`;

          if (report.circuitBroken) {
            recentlyFailedClaims.add(cardId);
            logActivity("CIRCUIT_BREAK", cardId, `API unavailable after retries. Card blocked from re-approval.`);
            await reportProgress(cardId, AGENT_CONFIG.agentId, "backlog",
              `Circuit breaker: API unavailable. Task released for retry later.\n${reportSummary}`);
          } else if (report.budgetExhausted) {
            const pauseResult = await pauseAndCreateContinuation(report);
            if (!report.hadChanges) {
              await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
                `BLOCKED: Agent exhausted budget with 0 files changed (${report.failedOperations.length} failed ops). Reason: ${report.failureReason}. Needs attention.\n${reportSummary}`);
            }
            logActivity("TASK_PAUSED", cardId, `Budget limit. ${report.iterations} steps, ${Object.keys(report.filesChanged).length} files. Continuation: #${pauseResult.continuationCardId || "failed"}`);
          } else if (AGENT_CONFIG.mode === "semi") {
            savePendingReview(cardId, report);
            pendingReview.set(cardId, report);
            await reportProgress(cardId, AGENT_CONFIG.agentId, "review",
              `Agent finished work. Awaiting human review.\n${reportSummary}`);
            console.log(`[KanbaiAgent] #${cardId} queued for review (${report.iterations} steps, ${Object.keys(report.filesChanged).length} files)`);
          } else if (report.hadChanges) {
            await completeTask(cardId, AGENT_CONFIG.agentId, reportSummary);
            await notifyHubCompletion(report);
            console.log(`[KanbaiAgent] Completed #${cardId} (${report.iterations} steps, ${Object.keys(report.filesChanged).length} files)`);
          } else {
            await reportProgress(cardId, AGENT_CONFIG.agentId, "review",
              `Agent finished but made no file changes. Moving to review.\n${reportSummary}`);
            console.log(`[KanbaiAgent] #${cardId} moved to review (no changes made)`);
          }
          activeTasks.delete(cardId);
          clearActiveTask(cardId);
          processedCards.add(cardId);
          const localStatus = report.circuitBroken ? "backlog" : (AGENT_CONFIG.mode === "semi" ? "review" : (report.hadChanges ? "done" : "review"));
          await updateLocalCardStatus(cardId, localStatus);
        } catch (err) {
          console.error(`[KanbaiAgent] Error on #${cardId}:`, err.message);
          logActivity("TASK_ERROR", cardId, err.message);
          await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", `Agent error: ${err.message}`);
          // Don't clear active task on transient errors — will retry on next restart
        }
      }
    } catch (err) { logActivity("LOOP_ERROR", null, err.message); }
    const backoff = consecutiveHubErrors >= 5 ? Math.min(AGENT_CONFIG.pollInterval * 1.5, 120000) : AGENT_CONFIG.pollInterval;
    await sleep(backoff);
  }
}

async function stopAgent() {
  running = false;
  console.log("[KanbaiAgent] Stopping...");
  for (const [cardId] of activeTasks) {
    try {
      await releaseTask(cardId, AGENT_CONFIG.agentId);
      console.log(`[KanbaiAgent] Released task #${cardId} on stop`);
    } catch (err) { console.warn(`[KanbaiAgent] Could not release #${cardId}: ${err.message}`); }
  }
  activeTasks.clear();
  console.log("[KanbaiAgent] Stopped. All active tasks released.");
}

// ════════════════════════════════════════════════════════════════════
// SECTION 4: EXPRESS ROUTES  (mount all endpoints in one call)
// ════════════════════════════════════════════════════════════════════

function requireAgentAuth(req, res) {
  const secret = DEPLOY_SECRET;
  if (!secret) return true;
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${secret}`) return true;
  const referer = req.headers.referer || req.headers.origin || "";
  const host = req.headers.host || "";
  if (referer && host && referer.includes(host)) return true;
  if (req.headers["x-requested-with"] === "XMLHttpRequest") return true;
  res.status(401).json({ error: "Unauthorized" });
  return false;
}

function mount(app) {
  // Health endpoint (required for ecosystem monitoring)
  app.get("/health", (req, res) => {
    res.json({ status: "ok", app: APP_SLUG, connectorVersion: CONNECTOR_VERSION, agent: running });
  });

  // Webhook receiver (hub-to-spoke, requires auth)
  app.post("/api/hub-webhook", (req, res) => {
    if (!requireAgentAuth(req, res)) return;
    const { event, data } = req.body || {};
    console.log(`[Kanbai Webhook] ${event}:`, data?.title || data?.id || "");
    res.json({ received: true });
  });

  // Specifications endpoint (Kanbai ecosystem discovery)
  app.get("/api/specifications", (req, res) => {
    res.json({
      app: APP_SLUG,
      connectorVersion: CONNECTOR_VERSION,
      capabilities: ["pull", "push", "agent", "webhook", "health"],
      endpoints: ["/health", "/api/hub-webhook", "/api/specifications", "/api/agent/status"],
    });
  });

  // Agent control routes
  app.get("/api/agent/status", (req, res) => {
    res.json({
      agentId: AGENT_CONFIG.agentId, mode: AGENT_CONFIG.mode, running,
      activeTasks: Array.from(activeTasks.entries()).map(([id, c]) => ({ id, title: c.title })),
      pendingApproval: Array.from(pendingApproval.entries()).map(([id, c]) => ({ id, title: c.title })),
      pendingReview: Array.from(pendingReview.entries()).map(([id, r]) => ({
        id, filesChanged: Object.keys(r.filesChanged).length,
        testResults: r.testResults.length, allTestsPassed: r.allTestsPassed,
      })),
    });
  });

  app.post("/api/agent/approve/:cardId", async (req, res) => {
    try {
      const card = pendingApproval.get(parseInt(req.params.cardId));
      if (!card) return res.status(400).json({ error: "No pending task with that id" });
      pendingApproval.delete(card.id);
      const result = await claimTask(card.id, AGENT_CONFIG.agentId);
      if (!result.error || result.local) {
        activeTasks.set(card.id, { ...card, claimedAt: new Date() });
        saveActiveTask(card.id, card, []);
        recentlyFailedClaims.delete(card.id);
        processedCards.delete(card.id);
        await updateLocalCardStatus(card.id, "in_progress");
        logActivity("APPROVED", card.id, `Claimed${result.local ? " (local mode)" : ""}. Now in activeTasks. Local DB updated.`);
      } else {
        logActivity("APPROVE_FAILED", card.id, `Claim blocked: error=${result.error}, local=${result.local}. Will force local claim.`);
        activeTasks.set(card.id, { ...card, claimedAt: new Date() });
        saveActiveTask(card.id, card, []);
        recentlyFailedClaims.delete(card.id);
        processedCards.delete(card.id);
        await updateLocalCardStatus(card.id, "in_progress");
        logActivity("APPROVED_LOCAL_FORCED", card.id, "Hub claim failed but user approved — forcing local claim so agent can proceed.");
      }
      const claimed = activeTasks.has(card.id);
      const forced = claimed && !!(result.error && !result.local);
      res.json({ success: claimed, claimed, local: !!(result.local || forced), forced, hubError: result.error || null });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/agent/review/:cardId", (req, res) => {
    const report = pendingReview.get(parseInt(req.params.cardId));
    if (!report) return res.status(404).json({ error: "No pending review for this card" });
    res.json(report);
  });

  app.post("/api/agent/confirm/:cardId", async (req, res) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const report = pendingReview.get(cardId);
      if (!report) return res.status(404).json({ error: "No pending review for this card" });
      pendingReview.delete(cardId);
      deletePendingReview(cardId);
      const summary = report.summary || report.changeLog.join("\n");
      const reportSummary = `Confirmed by human review | ${report.iterations} steps | ${Object.keys(report.filesChanged).length} files changed\n\nFiles: ${Object.keys(report.filesChanged).join(", ") || "none"}\n\n${summary}`;
      await completeTask(cardId, AGENT_CONFIG.agentId, reportSummary);
      await notifyHubCompletion(report);
      console.log(`[KanbaiAgent] #${cardId} confirmed and completed after human review`);
      res.json({ success: true, message: `Card #${cardId} confirmed and marked complete` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/agent/reject-review/:cardId", async (req, res) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const report = pendingReview.get(cardId);
      if (!report) return res.status(404).json({ error: "No pending review for this card" });
      pendingReview.delete(cardId);
      deletePendingReview(cardId);
      const { reason } = req.body || {};
      await releaseTask(cardId, AGENT_CONFIG.agentId);
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
        `Human rejected agent work: ${reason || "No reason given"}. Card released for rework.`);
      console.log(`[KanbaiAgent] #${cardId} rejected during review: ${reason || "no reason"}`);
      res.json({ success: true, message: `Card #${cardId} rejected and released` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/agent/start", (req, res) => { if (!running) startAgent(); res.json({ status: "started" }); });
  app.post("/api/agent/stop", async (req, res) => { await stopAgent(); res.json({ status: "stopped" }); });

  app.post("/api/agent/mode", (req, res) => {
    const { mode } = req.body || {};
    if (mode === "auto" || mode === "semi") {
      AGENT_CONFIG.mode = mode;
      AGENT_CONFIG.autoApprove = mode === "auto";
      console.log(`[KanbaiAgent] Mode switched to ${mode}`);
      res.json({ mode, autoApprove: AGENT_CONFIG.autoApprove });
    } else {
      res.status(400).json({ error: "Invalid mode. Use 'auto' or 'semi'." });
    }
  });

  app.post("/api/agent/reject/:cardId", async (req, res) => {
    const cardId = parseInt(req.params.cardId);
    const card = pendingApproval.get(cardId);
    if (!card) return res.status(404).json({ error: "No pending task with that id" });
    pendingApproval.delete(cardId);
    try {
      await releaseTask(cardId, AGENT_CONFIG.agentId);
      res.json({ success: true, message: `Task #${cardId} rejected and released` });
    } catch (err) {
      res.json({ success: true, message: `Task #${cardId} removed from queue` });
    }
  });

  app.get("/api/agent/activity", (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({ events: agentActivityLog.slice(-limit), total: agentActivityLog.length });
  });

  app.post("/api/agent/run", async (req, res) => {
    if (!requireAgentAuth(req, res)) return;
    if (!running) startAgent();
    res.json({ status: "started" });
  });

  // Proxy routes so the board UI can fetch cards and config via the spoke server
  app.get("/api/kanban/cards", async (req, res) => {
    try {
      const resp = await fetch(`${KANBAI_URL}/api/kanban/cards?app=${APP_SLUG}`, { headers: headers() });
      const data = await resp.json();
      const cards = Array.isArray(data) ? data : (data.cards || []);
      res.json(cards);
    } catch (err) {
      res.status(502).json({ error: "Could not reach Kanbai hub", details: err.message });
    }
  });

  app.get("/api/kanban/cards/open", async (req, res) => {
    try {
      const all = await getCards(1, 500);
      const cards = Array.isArray(all) ? all : (all.cards || []);
      const open = cards.filter(c => c.status === "backlog" || c.status === "planned" || c.status === "in_progress");
      res.json(open);
    } catch (err) {
      res.status(502).json({ error: "Could not fetch open cards", details: err.message });
    }
  });

  app.get("/api/kanban/spoke-config", async (req, res) => {
    try {
      const resp = await fetch(`${KANBAI_URL}/api/kanban/spoke-config?app=${APP_SLUG}`, { headers: headers() });
      const data = await resp.json();
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: "Could not reach Kanbai hub for config", details: err.message });
    }
  });

  // Auto-register webhook on mount
  const appUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.REPL_SLUG
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      : null;
  if (appUrl) {
    registerWebhook(`${appUrl}/api/hub-webhook`).then(() => {
      console.log(`[Kanbai] Webhook registered: ${appUrl}/api/hub-webhook`);
    }).catch(() => {});
  }

  // Report healthy on mount
  reportHealth().catch(() => {});

  console.log(`[Kanbai] metric-market connected to ${KANBAI_URL} (connector v${CONNECTOR_VERSION})`);
}

// ════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════

module.exports = {
  mount,
  pullBoard, pullUpdates, pushCards, getCards, checkForUpdates, registerWebhook, reportHealth,
  claimTask, reportProgress, completeTask, releaseTask, getAvailableTasks, getSchema,
  acquireRateLimit, getRateLimitStatus,
  startAgent, stopAgent,
  CONNECTOR_VERSION, APP_SLUG,
};
