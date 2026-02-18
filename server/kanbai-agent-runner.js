import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import pathMod from "path";
import { execSync, execFileSync } from "child_process";
import { pullBoard, claimTask, reportProgress, completeTask, releaseTask, getAvailableTasks, getSchema, getSpokeConfig, KANBAI_URL } from "./kanbai-connector.js";

const PROJECT_ROOT = process.cwd();
const AGENT_CONFIG = {
  agentId: "agent-metric-market",
  appSlug: "metric-market",
  mode: "semi",
  model: process.env.KANBAI_AGENT_MODEL || "claude-sonnet-4-5",
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

function sanitizePath(filePath) {
  const resolved = pathMod.resolve(PROJECT_ROOT, filePath);
  if (!resolved.startsWith(PROJECT_ROOT + pathMod.sep) && resolved !== PROJECT_ROOT) throw new Error("Path outside project");
  const segments = resolved.split(pathMod.sep);
  for (const b of AGENT_CONFIG.blockedPaths) {
    if (segments.includes(b)) throw new Error("Access denied: " + b);
  }
  return resolved;
}

function isCommandAllowed(cmd) {
  const trimmed = cmd.trim();
  return AGENT_CONFIG.allowedCommands.some(a => trimmed === a || trimmed.startsWith(a + " "));
}

const TOOLS = [
  { name: "read_file", description: "Read file contents", input_schema: { type: "object", properties: { file_path: { type: "string" }, line_start: { type: "integer" }, line_end: { type: "integer" } }, required: ["file_path"] } },
  { name: "write_file", description: "Write/create a file", input_schema: { type: "object", properties: { file_path: { type: "string" }, content: { type: "string" } }, required: ["file_path", "content"] } },
  { name: "edit_file", description: "Replace exact string in a file", input_schema: { type: "object", properties: { file_path: { type: "string" }, old_string: { type: "string" }, new_string: { type: "string" } }, required: ["file_path", "old_string", "new_string"] } },
  { name: "list_directory", description: "List files in a directory", input_schema: { type: "object", properties: { dir_path: { type: "string" } }, required: ["dir_path"] } },
  { name: "search_files", description: "Grep for a pattern across files", input_schema: { type: "object", properties: { pattern: { type: "string" }, dir_path: { type: "string" }, file_glob: { type: "string" } }, required: ["pattern"] } },
  { name: "run_command", description: "Run an allowed shell command", input_schema: { type: "object", properties: { command: { type: "string" } }, required: ["command"] } },
];

function executeTool(name, input) {
  try {
    switch (name) {
      case "read_file": {
        const p = sanitizePath(input.file_path);
        if (!fs.existsSync(p)) return { error: "Not found" };
        if (fs.statSync(p).size > AGENT_CONFIG.maxFileSize) return { error: "File too large" };
        let c = fs.readFileSync(p, "utf-8");
        if (input.line_start || input.line_end) {
          const ls = c.split("\n");
          c = ls.slice(Math.max(0, (input.line_start || 1) - 1), input.line_end || ls.length).join("\n");
        }
        return { content: c, lines: c.split("\n").length };
      }
      case "write_file": {
        const p = sanitizePath(input.file_path);
        const dir = pathMod.dirname(p);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(p, input.content, "utf-8");
        return { success: true, path: input.file_path, bytes: Buffer.byteLength(input.content) };
      }
      case "edit_file": {
        const p = sanitizePath(input.file_path);
        if (!fs.existsSync(p)) return { error: "File not found" };
        const content = fs.readFileSync(p, "utf-8");
        if (!content.includes(input.old_string)) return { error: "old_string not found in file" };
        const count = content.split(input.old_string).length - 1;
        if (count > 1) return { error: `old_string found ${count} times, must be unique` };
        fs.writeFileSync(p, content.replace(input.old_string, input.new_string), "utf-8");
        return { success: true, path: input.file_path };
      }
      case "list_directory": {
        const p = sanitizePath(input.dir_path);
        if (!fs.existsSync(p)) return { error: "Directory not found" };
        const entries = fs.readdirSync(p, { withFileTypes: true });
        return {
          entries: entries.map(e => ({
            name: e.name,
            type: e.isDirectory() ? "directory" : "file",
            size: e.isFile() ? fs.statSync(pathMod.join(p, e.name)).size : undefined,
          }))
        };
      }
      case "search_files": {
        const dir = input.dir_path ? sanitizePath(input.dir_path) : PROJECT_ROOT;
        const args = ["-rn"];
        if (input.file_glob) {
          args.push(`--include=${input.file_glob}`);
        } else {
          args.push("--include=*.ts", "--include=*.tsx", "--include=*.js", "--include=*.json");
        }
        args.push("--", input.pattern, dir);
        try {
          const out = execFileSync("grep", args, {
            timeout: AGENT_CONFIG.commandTimeout,
            encoding: "utf-8",
            maxBuffer: 1024 * 1024,
          });
          return { matches: out.trim().split("\n").filter(Boolean).slice(0, 50) };
        } catch {
          return { matches: [], message: "No matches found" };
        }
      }
      case "run_command": {
        if (!isCommandAllowed(input.command)) return { error: "Command not allowed: " + input.command };
        try {
          const out = execSync(input.command, {
            cwd: PROJECT_ROOT,
            timeout: AGENT_CONFIG.commandTimeout,
            encoding: "utf-8",
            maxBuffer: 1024 * 1024,
          });
          return { output: out.slice(0, 10000) };
        } catch (err) {
          return { error: err.message, stderr: (err.stderr || "").slice(0, 5000) };
        }
      }
      default:
        return { error: "Unknown tool: " + name };
    }
  } catch (err) {
    return { error: err.message };
  }
}

let anthropic;
let activeTasks = new Map();
let running = false;
const pendingApproval = new Map();
const pendingReview = new Map();

async function startAgent() {
  console.log(`[KanbaiAgent] Starting ${AGENT_CONFIG.agentId} in ${AGENT_CONFIG.mode} mode`);
  running = true;

  while (running) {
    try {
      if (activeTasks.size < AGENT_CONFIG.maxConcurrent) {
        await pickupNextTask();
      }
      await processActiveTasks();
    } catch (err) {
      console.error("[KanbaiAgent] Loop error:", err.message);
    }
    await sleep(AGENT_CONFIG.pollInterval);
  }
}

function stopAgent() {
  running = false;
  console.log("[KanbaiAgent] Stopping agent...");
}

async function pickupNextTask() {
  for (const priority of AGENT_CONFIG.priorities) {
    const { cards } = await getAvailableTasks(priority);
    if (!cards || cards.length === 0) continue;

    const card = cards[0];
    console.log(`[KanbaiAgent] Found task: #${card.id} "${card.title}" [${card.priority}]`);

    if (AGENT_CONFIG.mode === "semi" && !AGENT_CONFIG.autoApprove) {
      console.log("[KanbaiAgent] Semi-auto mode: task queued for approval");
      pendingApproval.set(card.id, card);
      return;
    }

    await claimAndStart(card);
    return;
  }
}

async function approveTask(cardId) {
  const card = pendingApproval.get(cardId);
  if (!card) throw new Error("No pending task with id " + cardId);
  pendingApproval.delete(cardId);
  await claimAndStart(card);
}

async function claimAndStart(card) {
  const result = await claimTask(card.id, AGENT_CONFIG.agentId);
  if (result.error && !result.local) {
    console.warn(`[KanbaiAgent] Could not claim #${card.id}: ${result.error}`);
    return;
  }
  console.log(`[KanbaiAgent] Claimed #${card.id}: "${card.title}"`);
  activeTasks.set(card.id, { ...card, claimedAt: new Date() });
}

async function processActiveTasks() {
  for (const [cardId, card] of activeTasks) {
    try {
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", "Agent processing task with tool-use...");

      const report = await processTaskWithClaude(card);

      if (AGENT_CONFIG.mode === "auto" && report.allTestsPassed) {
        await completeTask(cardId, AGENT_CONFIG.agentId,
          `Auto-completed by ${AGENT_CONFIG.agentId} | ${report.iterations} steps | ${Object.keys(report.filesChanged).length} files\n\n${report.summary}`);
        await notifyHubCompletion(report);
        activeTasks.delete(cardId);
        console.log(`[KanbaiAgent] Auto-completed #${cardId}`);
      } else {
        pendingReview.set(cardId, report);
        await reportProgress(cardId, AGENT_CONFIG.agentId, "review",
          `Agent completed work. ${Object.keys(report.filesChanged).length} files changed. Awaiting human review.`);
        activeTasks.delete(cardId);
        console.log(`[KanbaiAgent] #${cardId} ready for human review`);
      }
    } catch (err) {
      console.error(`[KanbaiAgent] Error processing #${cardId}:`, err.message);
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
        `Agent error: ${err.message}. Will retry.`);
    }
  }
}

async function processTaskWithClaude(card) {
  if (!anthropic) anthropic = new Anthropic();

  const maxIter = AGENT_CONFIG.maxToolIterations;
  const systemPrompt = `You are an autonomous AI development agent for "${AGENT_CONFIG.appSlug}".
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

Project structure: TypeScript monorepo with React frontend (client/src/), Express backend (server/), shared types (shared/).
Key files: shared/schema.ts (DB schema), server/routes.ts (API), client/src/App.tsx (routing).`;

  const taskPrompt = `Task: ${card.title}
Type: ${card.type} | Priority: ${card.priority}
Description: ${card.description || "No description"}
Acceptance Criteria: ${JSON.stringify(card.acceptanceCriteria || [])}
Technical Notes: ${card.technicalNotes || "None"}
Tags: ${(card.tags || []).join(", ")}

Complete this task using the available tools. Read files first to understand context, then make changes.`;

  const report = {
    cardId: card.id,
    cardTitle: card.title,
    iterations: 0,
    filesChanged: {},
    changeLog: [],
    testResults: [],
    allTestsPassed: true,
    summary: "",
  };

  let messages = [{ role: "user", content: taskPrompt }];

  for (let i = 0; i < AGENT_CONFIG.maxToolIterations; i++) {
    report.iterations = i + 1;

    const response = await anthropic.messages.create({
      model: AGENT_CONFIG.model,
      max_tokens: 4096,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find(b => b.type === "text");
      report.summary = textBlock ? textBlock.text.slice(0, 2000) : "Task processing completed.";
      report.changeLog.push(`Iteration ${i + 1}: Agent finished.`);
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter(b => b.type === "tool_use");
      const toolResults = [];

      for (const toolUse of toolUses) {
        console.log(`[KanbaiAgent] Tool: ${toolUse.name}(${JSON.stringify(toolUse.input).slice(0, 100)})`);
        const result = executeTool(toolUse.name, toolUse.input);

        if ((toolUse.name === "write_file" || toolUse.name === "edit_file") && result.success) {
          report.filesChanged[toolUse.input.file_path] = (report.filesChanged[toolUse.input.file_path] || 0) + 1;
          report.changeLog.push(`${toolUse.name}: ${toolUse.input.file_path}`);
        }

        if (toolUse.name === "run_command" && toolUse.input.command.includes("test")) {
          report.testResults.push({
            command: toolUse.input.command,
            passed: !result.error,
            output: (result.output || result.error || "").slice(0, 1000),
          });
          if (result.error) report.allTestsPassed = false;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result).slice(0, 10000),
        });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    } else {
      report.summary = "Agent stopped: " + response.stop_reason;
      break;
    }
  }

  return report;
}

async function notifyHubCompletion(report) {
  try {
    await fetch(`${KANBAI_URL}/api/agent/completion-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.DEPLOY_SECRET_KEY}` },
      body: JSON.stringify({
        appSlug: AGENT_CONFIG.appSlug,
        agentId: AGENT_CONFIG.agentId,
        cardId: report.cardId,
        filesChanged: Object.keys(report.filesChanged),
        iterations: report.iterations,
        summary: report.summary,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn("[KanbaiAgent] Could not notify hub of completion:", err.message);
  }
}

export function registerAgentRoutes(app) {
  app.get("/api/agent/status", (req, res) => {
    res.json({
      agentId: AGENT_CONFIG.agentId,
      mode: AGENT_CONFIG.mode,
      running,
      activeTasks: Array.from(activeTasks.entries()).map(([id, c]) => ({ id, title: c.title })),
      pendingApproval: Array.from(pendingApproval.entries()).map(([id, c]) => ({ id, title: c.title })),
      pendingReview: Array.from(pendingReview.entries()).map(([id, r]) => ({
        id,
        filesChanged: Object.keys(r.filesChanged).length,
        testResults: r.testResults.length,
        allTestsPassed: r.allTestsPassed,
      })),
    });
  });

  app.post("/api/agent/approve/:cardId", async (req, res) => {
    try {
      await approveTask(parseInt(req.params.cardId));
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/agent/review/:cardId", (req, res) => {
    const report = pendingReview.get(parseInt(req.params.cardId));
    if (!report) return res.status(404).json({ error: "No pending review" });
    res.json(report);
  });

  app.post("/api/agent/confirm/:cardId", async (req, res) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const report = pendingReview.get(cardId);
      if (!report) return res.status(404).json({ error: "No pending review" });
      pendingReview.delete(cardId);
      const summary = report.summary || report.changeLog.join("\n");
      await completeTask(cardId, AGENT_CONFIG.agentId,
        `Confirmed by human review | ${report.iterations} steps | ${Object.keys(report.filesChanged).length} files\n\n${summary}`);
      await notifyHubCompletion(report);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/agent/reject-review/:cardId", async (req, res) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const report = pendingReview.get(cardId);
      if (!report) return res.status(404).json({ error: "No pending review" });
      pendingReview.delete(cardId);
      await releaseTask(cardId, AGENT_CONFIG.agentId);
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
        `Human rejected: ${(req.body || {}).reason || "No reason"}`);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/agent/start", (req, res) => {
    if (!running) startAgent();
    res.json({ status: "started" });
  });

  app.post("/api/agent/stop", (req, res) => {
    stopAgent();
    res.json({ status: "stopped" });
  });

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
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export { startAgent, stopAgent, approveTask, AGENT_CONFIG };
