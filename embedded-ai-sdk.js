// Embedded AI Developer SDK v1.1.0 — Metric Market
// Self-contained agent bundle. Usage: require('./embedded-ai-sdk').mount(app);
// Generated 2026-02-20T17:30:03.600Z | Hub: http://localhost:5000
// Field-tested patterns from Kanbai v2.1.0 production deployments
// v1.1.0: Wind-down buffer, pause-and-continue, env-configurable budget,
//         project context loading, same-origin auth middleware

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const pathMod = require("path");
const { execSync, execFileSync } = require("child_process");

const PROJECT_ROOT = process.cwd();
const HUB_URL = process.env.HUB_URL || process.env.PLATFORM_HUB_URL || "http://localhost:5000";
const HUB_API_KEY = process.env.HUB_API_KEY || process.env.DEPLOY_SECRET_KEY || "pat_bd10eceb8568a0c3a5de974f30e2589acc220560dab711cd";
const APP_SLUG = "metric-market";
const APP_NAME = "Metric Market";
const SDK_VERSION = "1.1.0";

const AGENT_CONFIG = {
  agentId: "agent-" + APP_SLUG,
  appSlug: APP_SLUG,
  mode: process.env.AGENT_MODE || "semi",
  model: process.env.AGENT_MODEL || "claude-sonnet-4-5",
  pollInterval: 60000,
  maxConcurrent: 1,
  priorities: ["critical", "high", "medium"],
  autoApprove: (process.env.AGENT_MODE || "semi") === "auto",
  maxToolIterations: parseInt(process.env.AGENT_MAX_ITERATIONS || "25", 10),
  windDownBuffer: parseInt(process.env.AGENT_WINDDOWN_BUFFER || "3", 10),
  maxFileSize: 200 * 1024,
  commandTimeout: 30000,
  allowedCommands: ["npm test", "npm run lint", "npm run build", "ls", "cat", "grep", "find", "wc", "head", "tail", "diff"],
  blockedPaths: ["node_modules", ".git", ".env", ".replit", "replit.nix", "package-lock.json", ".env.local", ".env.production"],
  projectContext: null,
};

// ── Project Context Loading (reads domain-specific context file) ──
try {
  const contextPath = pathMod.resolve(PROJECT_ROOT, "agent-context.md");
  if (fs.existsSync(contextPath)) {
    AGENT_CONFIG.projectContext = fs.readFileSync(contextPath, "utf-8").slice(0, 5000);
    console.log("[EmbeddedAI] Loaded project context from agent-context.md");
  }
} catch {}

// ── Centralized Anthropic Client (Fix 3: AI_INTEGRATIONS first, with baseURL) ──
let anthropic = null;
function createAnthropicClient() {
  if (anthropic) return anthropic;
  const config = {};
  if (process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
    config.apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    if (process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL) config.baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
    console.log("[EmbeddedAI] Using Replit AI Integration credentials");
  } else if (process.env.ANTHROPIC_API_KEY) {
    config.apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("[EmbeddedAI] Using ANTHROPIC_API_KEY");
  } else {
    console.warn("[EmbeddedAI] No Anthropic API key found. Set AI_INTEGRATIONS_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY.");
    return null;
  }
  anthropic = new Anthropic(config);
  return anthropic;
}

// ── Safe Hub Communication (Fix 4: .text() then JSON.parse, never .json() directly) ──
async function safeHubCall(url, options, label) {
  try {
    const resp = await fetch(url, options);
    const text = await resp.text();
    try { return JSON.parse(text); } catch {
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        console.warn("[EmbeddedAI] " + label + ": Hub returned HTML (redirect or auth page). Status: " + resp.status);
        return { error: "hub_html_response", status: resp.status, local: true };
      }
      return { error: "invalid_json", status: resp.status, local: true };
    }
  } catch (err) {
    console.warn("[EmbeddedAI] " + label + ": Hub unreachable — " + err.message);
    return { error: err.message, local: true };
  }
}

function hubHeaders() {
  return { "Content-Type": "application/json", "X-API-Key": HUB_API_KEY };
}

// ── Same-Origin Auth Middleware (Fix 5: same-origin requests skip Bearer) ──
function requireAgentAuth(req, res, next) {
  const origin = req.get("origin") || req.get("referer") || "";
  const host = req.get("host") || "";
  if (origin && (origin.includes(host) || origin.includes("localhost"))) return next();
  const auth = req.get("authorization") || "";
  const secret = process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY;
  if (secret && auth === "Bearer " + secret) return next();
  if (secret && req.get("x-api-key") === secret) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// ── Safety Guardrails ──
function sanitizePath(filePath) {
  const resolved = pathMod.resolve(PROJECT_ROOT, filePath);
  if (!resolved.startsWith(PROJECT_ROOT + pathMod.sep) && resolved !== PROJECT_ROOT) throw new Error("Path outside project");
  const segments = resolved.split(pathMod.sep);
  for (const b of AGENT_CONFIG.blockedPaths) { if (segments.includes(b)) throw new Error("Access denied: " + b); }
  return resolved;
}

function isCommandAllowed(cmd) {
  const trimmed = cmd.trim();
  return AGENT_CONFIG.allowedCommands.some(a => trimmed === a || trimmed.startsWith(a + " "));
}

// ── Tool Definitions (6 tools, MCP-style) ──
const TOOLS = [
  { name: "read_file", description: "Read file contents", input_schema: { type: "object", properties: { file_path: { type: "string" }, line_start: { type: "integer" }, line_end: { type: "integer" } }, required: ["file_path"] } },
  { name: "write_file", description: "Write/create a file", input_schema: { type: "object", properties: { file_path: { type: "string" }, content: { type: "string" } }, required: ["file_path", "content"] } },
  { name: "edit_file", description: "Replace exact string in a file", input_schema: { type: "object", properties: { file_path: { type: "string" }, old_string: { type: "string" }, new_string: { type: "string" } }, required: ["file_path", "old_string", "new_string"] } },
  { name: "list_directory", description: "List files in a directory", input_schema: { type: "object", properties: { dir_path: { type: "string" } }, required: ["dir_path"] } },
  { name: "search_files", description: "Grep for a pattern across files", input_schema: { type: "object", properties: { pattern: { type: "string" }, dir_path: { type: "string" }, file_glob: { type: "string" } }, required: ["pattern"] } },
  { name: "run_command", description: "Run an allowed shell command", input_schema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } },
];

// ── Tool Executor (with logging — Fix 7) ──
function executeTool(name, input) {
  try {
    switch (name) {
      case "read_file": {
        const p = sanitizePath(input.file_path);
        if (!fs.existsSync(p)) return { error: "Not found" };
        if (fs.statSync(p).size > AGENT_CONFIG.maxFileSize) return { error: "File too large (>" + (AGENT_CONFIG.maxFileSize / 1024) + "KB)" };
        let c = fs.readFileSync(p, "utf-8");
        if (input.line_start || input.line_end) { const ls = c.split("\n"); c = ls.slice(Math.max(0, (input.line_start || 1) - 1), input.line_end || ls.length).join("\n"); }
        return { content: c, lines: c.split("\n").length };
      }
      case "write_file": {
        const p = sanitizePath(input.file_path);
        const dir = pathMod.dirname(p);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(p, input.content, "utf-8");
        return { success: true, path: input.file_path };
      }
      case "edit_file": {
        const p = sanitizePath(input.file_path);
        if (!fs.existsSync(p)) return { error: "Not found" };
        const c = fs.readFileSync(p, "utf-8");
        if (!c.includes(input.old_string)) return { error: "old_string not found" };
        if ((c.split(input.old_string).length - 1) > 1) return { error: "old_string not unique — provide more context" };
        fs.writeFileSync(p, c.replace(input.old_string, input.new_string), "utf-8");
        return { success: true, path: input.file_path };
      }
      case "list_directory": {
        const p = sanitizePath(input.dir_path || ".");
        return { entries: fs.readdirSync(p, { withFileTypes: true }).filter(e => !AGENT_CONFIG.blockedPaths.includes(e.name)).map(e => e.name + (e.isDirectory() ? "/" : "")).sort() };
      }
      case "search_files": {
        const dir = sanitizePath(input.dir_path || ".");
        const args = ["-rn"];
        if (input.file_glob) args.push("--include=" + input.file_glob);
        args.push("--", input.pattern, dir);
        try { const r = execFileSync("grep", args, { cwd: PROJECT_ROOT, timeout: 10000, encoding: "utf-8", maxBuffer: 512 * 1024 }); return { results: r.trim().split("\n").filter(Boolean).slice(0, 50).map(l => l.replace(PROJECT_ROOT + "/", "")) }; } catch { return { results: [] }; }
      }
      case "run_command": {
        if (!isCommandAllowed(input.command)) return { error: "Command not allowed. Permitted: " + AGENT_CONFIG.allowedCommands.join(", ") };
        try { const r = execSync(input.command, { cwd: PROJECT_ROOT, timeout: AGENT_CONFIG.commandTimeout, encoding: "utf-8", maxBuffer: 512 * 1024 }); return { exitCode: 0, output: r.slice(0, 5000) }; }
        catch (err) { return { exitCode: err.status || 1, output: (err.stdout || "").slice(0, 3000), stderr: (err.stderr || "").slice(0, 2000) }; }
      }
      default: return { error: "Unknown tool: " + name };
    }
  } catch (err) { return { error: err.message }; }
}

// ── Agent Task Executor (v1.1.0: wind-down buffer, pause-and-continue) ──
let activeTasks = new Map();
let pendingApproval = new Map();
let pendingReview = new Map();
let running = false;
let taskHistory = [];

async function executeTask(taskId, task) {
  const client = createAnthropicClient();
  if (!client) throw new Error("No Anthropic client available");
  const changeLog = [];
  const filesChanged = {};
  const testResults = [];
  let iter = 0;
  let agentSummary = "";
  let paused = false;
  const maxIter = AGENT_CONFIG.maxToolIterations;
  const windDown = AGENT_CONFIG.windDownBuffer;

  const contextBlock = AGENT_CONFIG.projectContext ? "\n\nPROJECT CONTEXT:\n" + AGENT_CONFIG.projectContext : "";

  const sys = `You are an autonomous AI development agent for "${APP_NAME}" (${APP_SLUG}).
You have a STRICT budget of ${maxIter} tool-use rounds. Be efficient and produce tangible output.

WORKFLOW:
1. EXPLORE (2-3 rounds max): list_directory and read_file to understand the project
2. IMPLEMENT (remaining rounds): Create or edit files to fulfill the task
3. VERIFY (1-2 rounds): Read modified files or run tests
4. SUMMARIZE: Start your final message with "SUMMARY:" listing what you created/changed

RULES:
- Spend at most 3-4 rounds exploring. Then START implementing.
- Every task must produce at least one tangible artifact (file, code change, documentation)
- If the task is analytical, create an output file with the analysis
- Make focused, minimal changes
- Do NOT edit package.json directly — flag dependency needs in your summary
- When done, start your summary with "SUMMARY:" listing every file created/modified
- When you receive a WIND-DOWN WARNING, wrap up immediately and write a SUMMARY
- When you receive a FINAL ROUND notice, write a PAUSE REPORT documenting remaining work${contextBlock}`;

  const taskPrompt = "Task to implement (you have " + maxIter + " tool rounds — explore briefly, then implement):\n\n" +
    "Title: " + task.title + "\n" +
    "Description: " + (task.description || "None") + "\n" +
    "Priority: " + (task.priority || "medium") + "\n" +
    "Acceptance Criteria: " + JSON.stringify(task.acceptanceCriteria || []) + "\n\n" +
    "Begin by briefly exploring (2-3 rounds), then implement. Produce tangible output.";

  let messages = [{ role: "user", content: taskPrompt }];

  while (iter < maxIter) {
    iter++;
    const remaining = maxIter - iter;
    console.log("[EmbeddedAI] Task #" + taskId + " step " + iter + "/" + maxIter);
    if (iter % 3 === 0 || iter === 1) {
      await notifyHub("progress", { taskId, agentId: AGENT_CONFIG.agentId, step: iter, maxSteps: maxIter, status: "in_progress", changeLog: changeLog.slice(-5) });
    }

    // Wind-down warning injection
    if (remaining === windDown && remaining > 0) {
      messages.push({ role: "user", content: "[SYSTEM] WIND-DOWN WARNING: You have " + remaining + " rounds left. Start wrapping up NOW. Write your changes, verify, and produce a SUMMARY." });
      console.log("[EmbeddedAI] Wind-down warning sent at step " + iter);
    }
    // Final round — request pause report
    if (remaining === 0) {
      messages.push({ role: "user", content: "[SYSTEM] FINAL ROUND: This is your last tool-use round. Write a PAUSE REPORT documenting: (1) what you completed, (2) what remains, (3) specific next steps for a continuation. Start with PAUSE REPORT:" });
      console.log("[EmbeddedAI] Final round notice sent at step " + iter);
    }

    const resp = await client.messages.create({ model: AGENT_CONFIG.model, max_tokens: 4096, system: sys, tools: TOOLS, messages });

    if (resp.stop_reason === "end_turn" || !resp.content.some(b => b.type === "tool_use")) {
      agentSummary = resp.content.filter(b => b.type === "text").map(b => b.text).join("\n") || "Done";
      changeLog.push("Final: " + agentSummary.slice(0, 500));
      if (agentSummary.includes("PAUSE REPORT:")) paused = true;
      break;
    }

    messages.push({ role: "assistant", content: resp.content });
    const results = [];
    for (const b of resp.content) {
      if (b.type !== "tool_use") continue;
      console.log("[EmbeddedAI] Tool: " + b.name + "(" + JSON.stringify(b.input).slice(0, 100) + ")");
      const r = executeTool(b.name, b.input);
      if (b.name === "read_file") changeLog.push("Read: " + b.input.file_path);
      if (b.name === "list_directory") changeLog.push("Listed: " + (b.input.dir_path || "."));
      if (b.name === "search_files") changeLog.push("Searched: \"" + b.input.pattern + "\" in " + (b.input.dir_path || "."));
      if (b.name === "write_file" && r.success) { changeLog.push("Wrote: " + b.input.file_path); filesChanged[b.input.file_path] = { action: "written", size: (b.input.content || "").length }; }
      if (b.name === "edit_file" && r.success) { changeLog.push("Edited: " + b.input.file_path); filesChanged[b.input.file_path] = { action: "edited", oldSnippet: (b.input.old_string || "").slice(0, 100), newSnippet: (b.input.new_string || "").slice(0, 100) }; }
      if (b.name === "run_command") {
        changeLog.push("Ran: " + b.input.command);
        if (b.input.command.startsWith("npm test") || b.input.command.startsWith("npm run lint") || b.input.command.startsWith("npm run build")) {
          testResults.push({ command: b.input.command, exitCode: r.exitCode, output: (r.output || r.error || "").slice(0, 1000), passed: r.exitCode === 0 });
        }
      }
      results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify(r).slice(0, 10000) });
    }
    messages.push({ role: "user", content: results });
  }

  // Fix 8: Fallback summary generation (also handles pause)
  if (iter >= maxIter && !agentSummary && changeLog.length > 0) {
    paused = true;
    agentSummary = "PAUSE REPORT: Agent completed " + iter + " iterations (budget exhausted). " +
      (Object.keys(filesChanged).length > 0 ? "Files modified: " + Object.keys(filesChanged).join(", ") + ". " : "Explored codebase but made no file changes. ") +
      "Activities: " + changeLog.length + " operations performed. Continuation recommended.";
    changeLog.push("Paused at max iterations (" + maxIter + ") — continuation context preserved");
  }

  const report = {
    taskId, agentId: AGENT_CONFIG.agentId, app: APP_SLUG,
    iterations: iter, filesChanged, testResults, changeLog,
    summary: agentSummary || changeLog.join("\n"),
    completedAt: new Date().toISOString(),
    hadChanges: Object.keys(filesChanged).length > 0,
    allTestsPassed: testResults.length === 0 || testResults.every(t => t.passed),
    paused,
    continuationContext: paused ? { remainingWork: agentSummary, filesInProgress: Object.keys(filesChanged), lastChangeLog: changeLog.slice(-10) } : null,
  };
  taskHistory.unshift(report);
  if (taskHistory.length > 50) taskHistory.length = 50;
  return report;
}

// ── Hub Notifications ──
async function notifyHub(eventType, payload) {
  if (!HUB_URL) return;
  return safeHubCall(HUB_URL + "/api/agent-event", {
    method: "POST", headers: hubHeaders(),
    body: JSON.stringify({ app: APP_SLUG, eventType, ...payload, timestamp: new Date().toISOString() }),
  }, "notifyHub:" + eventType);
}

// ── Control Endpoints (mounted automatically, with auth middleware) ──
function mount(app) {
  console.log("[EmbeddedAI] Mounting SDK v" + SDK_VERSION + " for " + APP_NAME + " (" + APP_SLUG + ")");

  app.get("/api/embedded-ai/status", (req, res) => {
    res.json({
      sdk: "embedded-ai-developer", version: SDK_VERSION,
      agentId: AGENT_CONFIG.agentId, app: APP_SLUG, mode: AGENT_CONFIG.mode, running,
      hasApiKey: !!(process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY),
      activeTasks: Array.from(activeTasks.entries()).map(([id, t]) => ({ id, title: t.title })),
      pendingApproval: Array.from(pendingApproval.entries()).map(([id, t]) => ({ id, title: t.title })),
      pendingReview: Array.from(pendingReview.entries()).map(([id, r]) => ({ id, filesChanged: Object.keys(r.filesChanged).length, allTestsPassed: r.allTestsPassed, paused: r.paused })),
      config: { maxToolIterations: AGENT_CONFIG.maxToolIterations, windDownBuffer: AGENT_CONFIG.windDownBuffer, maxFileSize: AGENT_CONFIG.maxFileSize, allowedCommands: AGENT_CONFIG.allowedCommands, blockedPaths: AGENT_CONFIG.blockedPaths },
      recentHistory: taskHistory.slice(0, 5).map(h => ({ taskId: h.taskId, iterations: h.iterations, filesChanged: Object.keys(h.filesChanged).length, completedAt: h.completedAt, hadChanges: h.hadChanges, paused: h.paused })),
    });
  });

  app.post("/api/embedded-ai/task", requireAgentAuth, async (req, res) => {
    const { title, description, priority, acceptanceCriteria } = req.body || {};
    if (!title) return res.status(400).json({ error: "title is required" });
    const taskId = "task-" + Date.now();
    const task = { title, description, priority: priority || "medium", acceptanceCriteria: acceptanceCriteria || [] };
    if (AGENT_CONFIG.mode === "semi" && !AGENT_CONFIG.autoApprove) {
      pendingApproval.set(taskId, task);
      return res.json({ taskId, status: "pending_approval", message: "Task queued for approval (semi mode)" });
    }
    activeTasks.set(taskId, task);
    res.json({ taskId, status: "started" });
    try {
      const report = await executeTask(taskId, task);
      activeTasks.delete(taskId);
      if (report.paused) {
        pendingReview.set(taskId, report);
        await notifyHub("paused", { taskId, continuationContext: report.continuationContext });
      } else if (AGENT_CONFIG.mode === "semi") { pendingReview.set(taskId, report); }
      else { await notifyHub("completion", report); }
    } catch (err) {
      activeTasks.delete(taskId);
      console.error("[EmbeddedAI] Task " + taskId + " failed:", err.message);
    }
  });

  app.post("/api/embedded-ai/approve/:taskId", requireAgentAuth, async (req, res) => {
    const task = pendingApproval.get(req.params.taskId);
    if (!task) return res.status(404).json({ error: "No pending task with that ID" });
    const taskId = req.params.taskId;
    pendingApproval.delete(taskId);
    activeTasks.set(taskId, task);
    res.json({ taskId, status: "approved_and_started" });
    try {
      const report = await executeTask(taskId, task);
      activeTasks.delete(taskId);
      pendingReview.set(taskId, report);
    } catch (err) {
      activeTasks.delete(taskId);
      console.error("[EmbeddedAI] Task " + taskId + " failed:", err.message);
    }
  });

  app.post("/api/embedded-ai/reject/:taskId", requireAgentAuth, (req, res) => {
    if (!pendingApproval.delete(req.params.taskId)) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/embedded-ai/review/:taskId", requireAgentAuth, (req, res) => {
    const report = pendingReview.get(req.params.taskId);
    if (!report) return res.status(404).json({ error: "No pending review" });
    res.json(report);
  });

  app.post("/api/embedded-ai/confirm/:taskId", requireAgentAuth, async (req, res) => {
    const report = pendingReview.get(req.params.taskId);
    if (!report) return res.status(404).json({ error: "No pending review" });
    pendingReview.delete(req.params.taskId);
    await notifyHub("completion", report);
    res.json({ success: true, message: "Confirmed and notified Hub" });
  });

  app.post("/api/embedded-ai/reject-review/:taskId", requireAgentAuth, (req, res) => {
    if (!pendingReview.delete(req.params.taskId)) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.post("/api/embedded-ai/mode", requireAgentAuth, (req, res) => {
    const { mode } = req.body || {};
    if (mode !== "auto" && mode !== "semi") return res.status(400).json({ error: "mode must be 'auto' or 'semi'" });
    AGENT_CONFIG.mode = mode;
    AGENT_CONFIG.autoApprove = mode === "auto";
    res.json({ mode, autoApprove: AGENT_CONFIG.autoApprove });
  });

  app.post("/api/embedded-ai/config", requireAgentAuth, (req, res) => {
    const updates = req.body || {};
    const allowed = ["maxToolIterations", "windDownBuffer", "maxFileSize", "commandTimeout"];
    for (const key of allowed) { if (updates[key] != null) AGENT_CONFIG[key] = updates[key]; }
    if (Array.isArray(updates.addCommands)) AGENT_CONFIG.allowedCommands.push(...updates.addCommands);
    if (Array.isArray(updates.addBlockedPaths)) AGENT_CONFIG.blockedPaths.push(...updates.addBlockedPaths);
    res.json({ config: AGENT_CONFIG });
  });

  app.get("/api/embedded-ai/history", (req, res) => {
    res.json(taskHistory.slice(0, parseInt(req.query.limit) || 20));
  });

  app.get("/api/specifications", (req, res) => {
    res.json({
      app: APP_SLUG, name: APP_NAME, sdk: "embedded-ai-developer", version: SDK_VERSION,
      capabilities: ["agent-task-execution", "tool-use", "hub-notification", "semi-auto-mode", "pause-and-continue", "wind-down-buffer"],
      endpoints: [
        { path: "/api/embedded-ai/status", method: "GET", description: "Agent status and config" },
        { path: "/api/embedded-ai/task", method: "POST", description: "Submit a task" },
        { path: "/api/embedded-ai/approve/:taskId", method: "POST", description: "Approve pending task" },
        { path: "/api/embedded-ai/review/:taskId", method: "GET", description: "View completion report" },
        { path: "/api/embedded-ai/confirm/:taskId", method: "POST", description: "Confirm reviewed work" },
        { path: "/api/embedded-ai/mode", method: "POST", description: "Switch auto/semi mode" },
        { path: "/api/embedded-ai/config", method: "POST", description: "Update agent config" },
        { path: "/api/embedded-ai/history", method: "GET", description: "Recent task history" },
      ],
    });
  });

  try {
    app.get("/health", (req, res) => {
      res.json({ status: "ok", app: APP_SLUG, sdk: "embedded-ai-developer", version: SDK_VERSION, timestamp: new Date().toISOString() });
    });
  } catch {}

  console.log("[EmbeddedAI] SDK v" + SDK_VERSION + " mounted — endpoints: /api/embedded-ai/* (auth-protected)");
}

module.exports = { mount, createAnthropicClient, executeTask, safeHubCall, requireAgentAuth, AGENT_CONFIG, APP_SLUG, SDK_VERSION };