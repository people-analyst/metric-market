// ════════════════════════════════════════════════════════════════════
// Kanbai Unified Bundle for metric-market
// ════════════════════════════════════════════════════════════════════
// ONE FILE. Just paste this into your Replit project as "kanbai-metric-market.js"
// Then add ONE line to your main server file:
//
//   require("./kanbai-metric-market").mount(app);
//
// Required Replit Secrets:
//   DEPLOY_SECRET_KEY  - Shared secret (must match the Kanbai instance)
//                        If you already have this from a previous Kanbai setup, keep using it.
//   ANTHROPIC_API_KEY  - Your Claude API key (optional, only for agent runner)
//                        If you already have this set, no changes needed — your existing key works.
//
// Connector v2.0.0 | Generated 2026-02-18T00:32:53.095Z
// ════════════════════════════════════════════════════════════════════

const KANBAI_URL = "http://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev";
const DEPLOY_SECRET = process.env.DEPLOY_SECRET_KEY;
const CONNECTOR_VERSION = "2.0.0";
const APP_SLUG = "metric-market";

// ── Helper ──────────────────────────────────────────────────────────
const headers = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${DEPLOY_SECRET}`,
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ════════════════════════════════════════════════════════════════════
// SECTION 1: CONNECTOR  (pull cards, push cards, sync)
// ════════════════════════════════════════════════════════════════════

async function pullBoard() {
  const resp = await fetch(`${KANBAI_URL}/api/pull/board/${APP_SLUG}`, { headers: headers() });
  if (!resp.ok) throw new Error("Failed to pull board: " + resp.status);
  return resp.json();
}

async function pullUpdates(since) {
  const resp = await fetch(`${KANBAI_URL}/api/pull/updates?since=${encodeURIComponent(since)}&app=${APP_SLUG}`, { headers: headers() });
  if (!resp.ok) throw new Error("Failed to pull updates: " + resp.status);
  return resp.json();
}

async function getCards(page = 1, limit = 100) {
  const resp = await fetch(`${KANBAI_URL}/api/kanban/cards?app=${APP_SLUG}&page=${page}&limit=${limit}`, { headers: headers() });
  return resp.json();
}

async function pushCards(cards) {
  const resp = await fetch(`${KANBAI_URL}/api/receive-cards`, {
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
  });
  return resp.json();
}

async function checkForUpdates() {
  const resp = await fetch(`${KANBAI_URL}/api/connector/update-check?version=${CONNECTOR_VERSION}&app=${APP_SLUG}`);
  return resp.json();
}

async function registerWebhook(callbackUrl) {
  const resp = await fetch(`${KANBAI_URL}/api/webhooks/register`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ appSlug: APP_SLUG, callbackUrl }),
  });
  return resp.json();
}

async function reportHealth() {
  const resp = await fetch(`${KANBAI_URL}/api/ecosystem/health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app: APP_SLUG,
      status: "healthy",
      connectorVersion: CONNECTOR_VERSION,
      timestamp: new Date().toISOString(),
    }),
  });
  return resp.json();
}

// ════════════════════════════════════════════════════════════════════
// SECTION 2: AGENT TASK LIFECYCLE  (claim, progress, complete)
// ════════════════════════════════════════════════════════════════════

async function claimTask(cardId, agentId) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/claim`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId }),
  });
  return resp.json();
}

async function reportProgress(cardId, agentId, status, notes) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/progress`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId, status, notes }),
  });
  return resp.json();
}

async function completeTask(cardId, agentId, completionNotes) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/complete`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId, completionNotes }),
  });
  return resp.json();
}

async function releaseTask(cardId, agentId) {
  const resp = await fetch(`${KANBAI_URL}/api/agent/release`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ cardId, agentId }),
  });
  return resp.json();
}

async function getAvailableTasks(priority) {
  const qs = priority ? `&priority=${priority}` : "";
  const resp = await fetch(`${KANBAI_URL}/api/agent/available?app=${APP_SLUG}${qs}`, { headers: headers() });
  return resp.json();
}

async function getSchema() {
  const resp = await fetch(`${KANBAI_URL}/api/kanban/schema`, { headers: headers() });
  return resp.json();
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
  mode: "semi",
  pollInterval: 60000,
  maxConcurrent: 1,
  priorities: ["critical", "high", "medium"],
  autoApprove: false,
  maxToolIterations: 15,
  maxFileSize: 200 * 1024,
  commandTimeout: 30000,
  allowedCommands: ["npm test", "npm run lint", "npm run build", "ls", "cat", "grep", "find", "wc", "head", "tail", "diff"],
  blockedPaths: ["node_modules", ".git", ".env", ".replit", "replit.nix", "package-lock.json", ".env.local", ".env.production"],
};

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
        if (!content.includes(input.old_string)) return { error: "old_string not found in file. Make sure it matches exactly including whitespace." };
        const occurrences = content.split(input.old_string).length - 1;
        if (occurrences > 1) return { error: `old_string found ${occurrences} times. Provide more context to make it unique.` };
        const updated = content.replace(input.old_string, input.new_string);
        fs.writeFileSync(absPath, updated, "utf-8");
        return { success: true, path: input.file_path };
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
        const grepArgs = ["-rn"];
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

  const systemPrompt = `You are an autonomous AI development agent working on the "${APP_SLUG}" application.
You have been assigned a task from the Kanban board. Your job is to implement the required changes by reading, understanding, and editing the project's source code.

IMPORTANT GUIDELINES:
- Start by exploring the project structure with list_directory and reading relevant files
- Understand the existing code patterns before making changes
- Make focused, minimal changes that accomplish the task
- After making changes, verify them by reading the modified files or running tests
- If you cannot fully complete the task, do as much as you can and clearly document what remains
- When you finish, provide a clear summary of what you changed and any remaining work

PROJECT: ${APP_SLUG}
WORKING DIRECTORY: ${PROJECT_ROOT}`;

  const taskPrompt = `Here is the task you need to implement:

Title: ${card.title}
Type: ${card.type || "task"}
Priority: ${card.priority || "medium"}
Description: ${card.description || "No description provided"}
Acceptance Criteria: ${JSON.stringify(card.acceptanceCriteria || [], null, 2)}
Technical Notes: ${card.technicalNotes || "None"}
Tags: ${(card.tags || []).join(", ") || "None"}

Begin by exploring the project structure to understand what exists, then implement the required changes. Use the tools available to you.`;

  let messages = [{ role: "user", content: taskPrompt }];

  while (iterationCount < AGENT_CONFIG.maxToolIterations) {
    iterationCount++;
    await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
      `Agent working... (step ${iterationCount}/${AGENT_CONFIG.maxToolIterations})`);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: TOOLS,
      messages
    });

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

      if (block.name === "write_file" && result.success) {
        changeLog.push(`Created/wrote: ${block.input.file_path}`);
        filesChanged[block.input.file_path] = { action: "written", size: (block.input.content || "").length };
      }
      if (block.name === "edit_file" && result.success) {
        changeLog.push(`Edited: ${block.input.file_path}`);
        filesChanged[block.input.file_path] = { action: "edited", oldSnippet: (block.input.old_string || "").slice(0, 100) + "...", newSnippet: (block.input.new_string || "").slice(0, 100) + "..." };
      }
      if (block.name === "run_command") {
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

    if (iterationCount % 3 === 0 && changeLog.length > 0) {
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
        `Agent progress (step ${iterationCount}): ${changeLog.slice(-3).join("; ")}`);
    }
  }

  if (iterationCount >= AGENT_CONFIG.maxToolIterations) {
    changeLog.push("Reached max iterations (" + AGENT_CONFIG.maxToolIterations + ")");
  }

  const completionReport = {
    cardId,
    agentId: AGENT_CONFIG.agentId,
    app: APP_SLUG,
    iterations: iterationCount,
    filesChanged,
    testResults,
    summary: agentSummary || changeLog.join("\n"),
    changeLog,
    completedAt: new Date().toISOString(),
    hadChanges: Object.keys(filesChanged).length > 0,
    allTestsPassed: testResults.length === 0 || testResults.every(t => t.passed),
  };

  return completionReport;
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
let running = false;

async function startAgent() {
  let Anthropic;
  try { Anthropic = require("@anthropic-ai/sdk"); } catch {
    console.warn("[KanbaiAgent] @anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk");
    console.warn("[KanbaiAgent] Agent runner disabled. Connector and routes still work.");
    return;
  }
  const anthropic = new Anthropic();
  console.log(`[KanbaiAgent] Starting ${AGENT_CONFIG.agentId} in ${AGENT_CONFIG.mode} mode (with tool-use)`);
  running = true;

  while (running) {
    try {
      if (activeTasks.size < AGENT_CONFIG.maxConcurrent) {
        for (const priority of AGENT_CONFIG.priorities) {
          const { cards } = await getAvailableTasks(priority);
          if (!cards || cards.length === 0) continue;
          const card = cards[0];
          console.log(`[KanbaiAgent] Found task: #${card.id} "${card.title}" [${card.priority}]`);
          if (AGENT_CONFIG.mode === "semi" && !AGENT_CONFIG.autoApprove) {
            pendingApproval.set(card.id, card);
            break;
          }
          const claimResult = await claimTask(card.id, AGENT_CONFIG.agentId);
          if (!claimResult.error) {
            activeTasks.set(card.id, { ...card, claimedAt: new Date() });
          }
          break;
        }
      }
      for (const [cardId, card] of activeTasks) {
        try {
          await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", "Agent starting task with tool-use...");
          const report = await executeTaskWithTools(anthropic, cardId, card);
          const summary = report.summary || report.changeLog.join("\n") || "No changes made";
          const reportSummary = `Completed in ${report.iterations} steps | ${Object.keys(report.filesChanged).length} files changed | Tests: ${report.testResults.length === 0 ? "none ran" : report.allTestsPassed ? "all passed" : "some failed"}\n\nFiles: ${Object.keys(report.filesChanged).join(", ") || "none"}\n\n${summary}`;

          if (AGENT_CONFIG.mode === "semi") {
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
        } catch (err) {
          console.error(`[KanbaiAgent] Error on #${cardId}:`, err.message);
          await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", `Agent error: ${err.message}`);
        }
      }
    } catch (err) { console.error("[KanbaiAgent] Loop error:", err.message); }
    await sleep(AGENT_CONFIG.pollInterval);
  }
}

function stopAgent() { running = false; console.log("[KanbaiAgent] Stopping..."); }

// ════════════════════════════════════════════════════════════════════
// SECTION 4: EXPRESS ROUTES  (mount all endpoints in one call)
// ════════════════════════════════════════════════════════════════════

function mount(app) {
  // Health endpoint (required for ecosystem monitoring)
  app.get("/health", (req, res) => {
    res.json({ status: "ok", app: APP_SLUG, connectorVersion: CONNECTOR_VERSION, agent: running });
  });

  // Webhook receiver (Kanbai sends card events here)
  app.post("/api/hub-webhook", (req, res) => {
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
      if (!result.error) activeTasks.set(card.id, { ...card, claimedAt: new Date() });
      res.json({ success: true });
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
      const { reason } = req.body || {};
      await releaseTask(cardId, AGENT_CONFIG.agentId);
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
        `Human rejected agent work: ${reason || "No reason given"}. Card released for rework.`);
      console.log(`[KanbaiAgent] #${cardId} rejected during review: ${reason || "no reason"}`);
      res.json({ success: true, message: `Card #${cardId} rejected and released` });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/agent/start", (req, res) => { if (!running) startAgent(); res.json({ status: "started" }); });
  app.post("/api/agent/stop", (req, res) => { stopAgent(); res.json({ status: "stopped" }); });

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

  // Proxy routes so the board UI can fetch cards and config via the spoke server
  app.get("/api/kanban/cards", async (req, res) => {
    try {
      const resp = await fetch(`${KANBAI_URL}/api/kanban/cards?app=${APP_SLUG}`, { headers: headers() });
      const data = await resp.json();
      res.json(data);
    } catch (err) {
      res.status(502).json({ error: "Could not reach Kanbai hub", details: err.message });
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
  startAgent, stopAgent,
  CONNECTOR_VERSION, APP_SLUG,
};
