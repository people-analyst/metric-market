// ── Kanbai Agent Runner v2.1.0 for metric-market ──────────────────
// Claude agent with tool-use for READ, WRITE, EDIT code files.
// Auth: DEPLOY_SECRET_KEY, DEPLOY_SECRET, or HUB_API_KEY
// Anthropic: AI_INTEGRATIONS_ANTHROPIC_API_KEY (Replit) or ANTHROPIC_API_KEY

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import pathMod from "path";
import { execSync, execFileSync } from "child_process";
import { pullBoard, claimTask, reportProgress, completeTask, releaseTask, getAvailableTasks, getSchema, getSpokeConfig, safeHubCall, KANBAI_URL } from "./kanbai-connector.js";

async function triggerGitHubPush(message) {
  try {
    const port = process.env.PORT || "5000";
    const resp = await fetch(`http://localhost:${port}/api/github/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Referer": `http://localhost:${port}/` },
      body: JSON.stringify({ message: message || "Auto-sync after agent work" }),
    });
    const result = await resp.json();
    if (result.success) console.log(`[KanbaiAgent] GitHub push: ${result.filesCount} files → ${result.sha?.substring(0, 7)}`);
    else console.warn(`[KanbaiAgent] GitHub push failed: ${result.error}`);
  } catch (err) { console.warn(`[KanbaiAgent] GitHub push skipped: ${err.message}`); }
}

const PROJECT_ROOT = process.cwd();
const AGENT_CONFIG = {
  agentId: "agent-metric-market",
  appSlug: "metric-market",
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

try {
  const contextPath = pathMod.resolve(PROJECT_ROOT, "kanbai-context.md");
  if (fs.existsSync(contextPath)) {
    AGENT_CONFIG.projectContext = fs.readFileSync(contextPath, "utf-8").slice(0, 5000);
    console.log("[KanbaiAgent] Loaded project context from kanbai-context.md");
  }
} catch {}

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
        return { success: true, path: input.file_path };
      }
      case "edit_file": {
        const p = sanitizePath(input.file_path);
        if (!fs.existsSync(p)) return { error: "Not found" };
        const c = fs.readFileSync(p, "utf-8");
        if (!c.includes(input.old_string)) {
          const firstLine = (input.old_string || "").split("\n")[0].trim();
          let hint = "";
          if (firstLine.length > 5) {
            const lines = c.split("\n");
            const near = [];
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(firstLine.slice(0, 30))) {
                near.push({ line: i + 1, text: lines[i].trim().slice(0, 120) });
                if (near.length >= 3) break;
              }
            }
            if (near.length > 0) hint = " Nearby: " + near.map(m => `L${m.line}: "${m.text}"`).join("; ") + ". TIP: Use read_file to see exact text, or use write_file to replace entire file.";
          }
          return { error: "old_string not found in file." + hint };
        }
        if ((c.split(input.old_string).length - 1) > 1) return { error: "old_string not unique" };
        fs.writeFileSync(p, c.replace(input.old_string, input.new_string), "utf-8");
        return { success: true, path: input.file_path };
      }
      case "list_directory": {
        const p = sanitizePath(input.dir_path || ".");
        return { entries: fs.readdirSync(p, { withFileTypes: true }).filter(e => !AGENT_CONFIG.blockedPaths.includes(e.name)).map(e => e.name + (e.isDirectory() ? "/" : "")).sort() };
      }
      case "search_files": {
        const dir = sanitizePath(input.dir_path || ".");
        const args = ["-rn", "--binary-files=without-match"];
        ["node_modules", ".git", "dist", "attached_assets", ".cache", "coverage"].forEach(d => args.push("--exclude-dir=" + d));
        if (input.file_glob) args.push("--include=" + input.file_glob);
        args.push("--", input.pattern, dir);
        try {
          const r = execFileSync("grep", args, { cwd: PROJECT_ROOT, timeout: 10000, encoding: "utf-8", maxBuffer: 512 * 1024 });
          return { results: r.trim().split("\n").filter(Boolean).slice(0, 50).map(l => l.replace(PROJECT_ROOT + "/", "")) };
        } catch { return { results: [] }; }
      }
      case "run_command": {
        if (!isCommandAllowed(input.command)) return { error: "Command not allowed" };
        try {
          const r = execSync(input.command, { cwd: PROJECT_ROOT, timeout: AGENT_CONFIG.commandTimeout, encoding: "utf-8", maxBuffer: 512 * 1024 });
          return { exitCode: 0, output: r.slice(0, 5000) };
        } catch (err) {
          return { exitCode: err.status || 1, output: (err.stdout || "").slice(0, 3000), stderr: (err.stderr || "").slice(0, 2000) };
        }
      }
      default: return { error: "Unknown tool" };
    }
  } catch (err) { return { error: err.message }; }
}

let anthropic;
let activeTasks = new Map();
let pendingApproval = new Map();
let pendingReview = new Map();
let running = false;
let consecutiveHubErrors = 0;
let dailyBudgetPaused = false;

async function executeTaskWithTools(cardId, card) {
  const changeLog = [];
  const filesChanged = {};
  const testResults = [];
  let iter = 0;
  let agentSummary = "";
  const maxIter = AGENT_CONFIG.maxToolIterations;
  const exploreMax = Math.min(4, Math.floor(maxIter * 0.2));
  const implMax = Math.floor(maxIter * 0.6);

  const sys = `You are an autonomous AI development agent for "${AGENT_CONFIG.appSlug}".
You have a STRICT budget of ${maxIter} tool-use rounds. Be efficient and produce tangible output.

BUDGET ALLOCATION:
- Rounds 1-${exploreMax}: EXPLORE — list_directory and read_file on key files only
- Rounds ${exploreMax + 1}-${exploreMax + implMax}: IMPLEMENT — write_file or edit_file to create/modify code
- Rounds ${exploreMax + implMax + 1}-${maxIter - 1}: VERIFY — run tests or read modified files
- Round ${maxIter}: SUMMARIZE — write your final summary (no tools)

WORKFLOW:
1. EXPLORE (max ${exploreMax} rounds): Understand project structure. Read ONLY the files most relevant to the task.
2. IMPLEMENT (core budget): Create or edit files. Write actual code.
   - If edit_file fails twice on the same file, use write_file to replace the entire file instead.
   - Always check acceptance criteria against your implementation.
3. VERIFY (1-2 rounds): Read modified files or run "npm test" to confirm changes compile.
4. SUMMARIZE: Start your final message with "SUMMARY:" listing what you created/changed.

RULES:
- Spend at most ${exploreMax} rounds exploring. Then START implementing.
- Every task must produce at least one tangible artifact (file, code change, documentation)
- If the task is analytical, create an output file with the analysis
- Make focused, minimal changes
- Do NOT edit package.json directly — flag dependency needs in your summary
- Track which acceptance criteria you have and haven't addressed
- When done, start your summary with "SUMMARY:" listing every file created/modified

Project structure: TypeScript monorepo with React frontend (client/src/), Express backend (server/), shared types (shared/).
Key files: shared/schema.ts (DB schema), server/routes.ts (API), client/src/App.tsx (routing).${AGENT_CONFIG.projectContext ? "\n\nPROJECT CONTEXT (from kanbai-context.md):\n" + AGENT_CONFIG.projectContext : ""}`;

  const isContinuation = (card.tags || []).includes("agent-continuation") || (card.title && card.title.startsWith("[CONTINUE"));
  let resumeBlock = "";
  if (isContinuation && card._resumeContext) {
    const ctx = card._resumeContext;
    resumeBlock = `\n\n=== CONTINUATION CONTEXT (from previous agent session) ===
Previous agent: ${ctx.pausedBy || "unknown"}
Previous iterations: ${ctx.iterations || "?"}
Files already modified: ${(ctx.filesChanged ? Object.keys(ctx.filesChanged).join(", ") : "none")}
Resume instructions: ${ctx.resumeInstructions || "Continue from where the previous agent left off."}
Recent activity: ${(ctx.changeLog || []).slice(-5).join("; ")}
=== END CONTINUATION CONTEXT ===

IMPORTANT: This is a CONTINUATION task. Start by reading the files listed above to understand what was already done. Do NOT redo completed work. Focus on the remaining items.`;
  }

  const taskPrompt = `Task to implement (you have ${maxIter} tool rounds — explore briefly, then implement):\n\nTitle: ${card.title}\nType: ${card.type || "task"}\nPriority: ${card.priority}\nDescription: ${card.description || "None"}\nAcceptance Criteria: ${JSON.stringify(card.acceptanceCriteria || [])}\nTechnical Notes: ${card.technicalNotes || "None"}\nTags: ${(card.tags || []).join(", ")}${resumeBlock}\n\nBegin by briefly exploring (2-3 rounds), then implement. Produce tangible output.`;

  let messages = [{ role: "user", content: taskPrompt }];

  while (iter < maxIter) {
    iter++;
    await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", `Agent working (step ${iter}/${maxIter})`);

    const resp = await anthropic.messages.create({
      model: AGENT_CONFIG.model,
      max_tokens: 4096,
      system: sys,
      tools: TOOLS,
      messages,
    });

    if (resp.stop_reason === "end_turn" || !resp.content.some(b => b.type === "tool_use")) {
      agentSummary = resp.content.filter(b => b.type === "text").map(b => b.text).join("\n") || "Done";
      changeLog.push("Final: " + agentSummary.slice(0, 500));
      break;
    }

    messages.push({ role: "assistant", content: resp.content });
    const results = [];

    for (const b of resp.content) {
      if (b.type !== "tool_use") continue;
      console.log(`[KanbaiAgent] Tool: ${b.name}(${JSON.stringify(b.input).slice(0, 100)})`);
      const r = executeTool(b.name, b.input);

      if (r.error) {
        changeLog.push(`FAILED: ${b.name}(${(b.input.file_path || b.input.dir_path || b.input.pattern || b.input.command || "").slice(0, 60)}) — ${r.error.slice(0, 150)}`);
      } else if (b.name === "read_file") {
        changeLog.push("Read: " + b.input.file_path);
      } else if (b.name === "list_directory") {
        changeLog.push("Listed: " + (b.input.dir_path || "."));
      } else if (b.name === "search_files") {
        changeLog.push(`Searched: "${b.input.pattern}" in ${b.input.dir_path || "."} (${(r.results || []).length} matches)`);
      }

      if (b.name === "write_file" && r.success) {
        changeLog.push("Wrote: " + b.input.file_path);
        filesChanged[b.input.file_path] = { action: "written", size: (b.input.content || "").length };
      }
      if (b.name === "edit_file" && r.success) {
        changeLog.push("Edited: " + b.input.file_path);
        filesChanged[b.input.file_path] = { action: "edited", oldSnippet: (b.input.old_string || "").slice(0, 100) + "...", newSnippet: (b.input.new_string || "").slice(0, 100) + "..." };
      }
      if (b.name === "run_command" && !r.error) {
        changeLog.push(`Ran: ${b.input.command} (exit: ${r.exitCode})`);
        if (b.input.command.startsWith("npm test") || b.input.command.startsWith("npm run lint") || b.input.command.startsWith("npm run build")) {
          testResults.push({ command: b.input.command, exitCode: r.exitCode, output: (r.output || r.error || "").slice(0, 1000), passed: r.exitCode === 0 });
        }
      }

      results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify(r).slice(0, 10000) });
    }
    messages.push({ role: "user", content: results });

    const remaining = maxIter - iter;
    if (remaining === AGENT_CONFIG.windDownBuffer && Object.keys(filesChanged).length > 0) {
      messages.push({ role: "user", content: [{ type: "text", text:
        `BUDGET PAUSE WARNING: You have ${remaining} tool rounds remaining before this session is paused. Your work will NOT be lost — a continuation card will be created so you (or another agent) can resume later. Use your remaining rounds to: 1) Ensure all modified files are saved and in a working state, 2) Write a PAUSE REPORT starting with "PAUSE:" that documents: a) What you accomplished, b) What files were changed and why, c) What specific next steps remain, d) Any context the next agent needs to pick up where you left off.`
      }] });
    } else if (remaining === 1) {
      messages.push({ role: "user", content: [{ type: "text", text:
        `FINAL ROUND: This is your LAST tool round. Do NOT use any more tools. Write your PAUSE REPORT now. Start with "PAUSE:" and list: 1) Files changed and what was done, 2) Specific remaining work items, 3) Important context for resumption. This report will be used to create a continuation card.`
      }] });
    }
  }

  const budgetExhausted = iter >= maxIter;
  const failedOps = changeLog.filter(l => l.startsWith("FAILED:"));
  const hadChanges = Object.keys(filesChanged).length > 0;

  let failureReason = null;
  if (budgetExhausted && !hadChanges) {
    failureReason = failedOps.length > 0 ? "edit_failed" : "exhausted_budget_no_changes";
  } else if (budgetExhausted && hadChanges) {
    failureReason = "exhausted_budget_partial";
  }

  if (budgetExhausted) {
    changeLog.push("Reached max iterations (" + maxIter + ") — pausing for continuation");
    if (!agentSummary) {
      agentSummary = hadChanges
        ? `Agent paused at budget limit (${iter}/${maxIter} iterations). Files modified: ${Object.keys(filesChanged).join(", ")}. Activities: ${changeLog.length} operations (${failedOps.length} failed).`
        : `Agent paused at budget limit (${iter}/${maxIter} iterations). Explored codebase but made no file changes. Activities: ${changeLog.length} operations (${failedOps.length} failed).`;
    }
  }

  return {
    cardId, agentId: AGENT_CONFIG.agentId, app: AGENT_CONFIG.appSlug,
    iterations: iter, filesChanged, testResults, changeLog,
    failedOperations: failedOps, failureReason,
    summary: agentSummary || changeLog.join("\n"),
    completedAt: new Date().toISOString(),
    hadChanges,
    allTestsPassed: testResults.length === 0 || testResults.every(t => t.passed),
    budgetExhausted,
    resumeContext: budgetExhausted ? extractResumeContext(agentSummary, filesChanged, changeLog) : null,
  };
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY}` },
      body: JSON.stringify({ agentId: AGENT_CONFIG.agentId }),
    }, "checkDailyBudget");
    return result.allowed !== false;
  } catch { return true; }
}

async function notifyHubCompletion(report) {
  const hubUrl = process.env.HUB_URL || process.env.PLATFORM_HUB_URL;
  if (!hubUrl) return;
  try {
    const resp = await fetch(`${hubUrl}/api/agent-completion`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": process.env.HUB_API_KEY || process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || "" },
      body: JSON.stringify(report),
    });
    if (resp.ok) console.log(`[KanbaiAgent] Notified Hub of completion for card #${report.cardId}`);
  } catch (err) { console.log("[KanbaiAgent] Hub notification failed:", err.message); }
}

async function startAgent() {
  const DEPLOY_SECRET = process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY;
  if (!DEPLOY_SECRET) {
    console.error("[KanbaiAgent] No auth secret configured. Set DEPLOY_SECRET_KEY, DEPLOY_SECRET, or HUB_API_KEY.");
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
    console.warn("[KanbaiAgent] No Anthropic API key found. Set AI_INTEGRATIONS_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY.");
    return;
  }
  anthropic = new Anthropic(anthropicConfig);
  console.log(`[KanbaiAgent] Starting ${AGENT_CONFIG.agentId} in ${AGENT_CONFIG.mode} mode (tool-use, budget: ${AGENT_CONFIG.maxToolIterations} iterations)`);
  running = true;

  while (running) {
    try {
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

          const eligible = cards.filter(c => {
            const tags = c.tags || [];
            return !tags.includes("needs-approval");
          });
          if (eligible.length === 0) continue;
          const card = eligible[0];

          const isCont = (card.tags || []).includes("agent-continuation") || (card.title && card.title.startsWith("[CONTINUE"));
          if (isCont && card.technicalNotes) {
            try { card._resumeContext = JSON.parse(card.technicalNotes); } catch {}
          }

          console.log(`[KanbaiAgent] Found task: #${card.id} "${card.title}" [${card.priority}]${isCont ? " (CONTINUATION)" : ""}`);
          if (AGENT_CONFIG.mode === "semi" && !AGENT_CONFIG.autoApprove) { pendingApproval.set(card.id, card); break; }
          const cr = await claimTask(card.id, AGENT_CONFIG.agentId);
          if (!cr.error || cr.local) activeTasks.set(card.id, { ...card, claimedAt: new Date() });
          break;
        }
      }

      for (const [cardId, card] of activeTasks) {
        try {
          const report = await executeTaskWithTools(cardId, card);
          const summary = report.summary || report.changeLog.join("\n") || "No changes";
          const reportSummary = `${report.budgetExhausted ? "PAUSED" : "Completed"} in ${report.iterations} steps | ${Object.keys(report.filesChanged).length} files changed | Tests: ${report.testResults.length === 0 ? "none ran" : report.allTestsPassed ? "all passed" : "some failed"}\n\nFiles: ${Object.keys(report.filesChanged).join(", ") || "none"}\n\n${summary}`;

          if (report.budgetExhausted) {
            const pauseResult = await pauseAndCreateContinuation(report);
            if (!report.hadChanges) {
              await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
                `BLOCKED: Agent exhausted budget with 0 files changed (${(report.failedOperations || []).length} failed ops). Reason: ${report.failureReason}. Needs attention.\n${reportSummary}`);
            }
            console.log(`[KanbaiAgent] #${cardId} PAUSED (budget limit, ${report.iterations} steps, ${Object.keys(report.filesChanged).length} files, ${(report.failedOperations || []).length} failed). Continuation: #${pauseResult.continuationCardId || "failed"}`);
          } else if (AGENT_CONFIG.mode === "semi") {
            pendingReview.set(cardId, report);
            await reportProgress(cardId, AGENT_CONFIG.agentId, "review", `Agent finished. Awaiting human review.\n${reportSummary}`);
            console.log(`[KanbaiAgent] #${cardId} queued for review (${report.iterations} steps, ${Object.keys(report.filesChanged).length} files)`);
          } else if (report.hadChanges) {
            await completeTask(cardId, AGENT_CONFIG.agentId, reportSummary);
            await notifyHubCompletion(report);
            console.log(`[KanbaiAgent] Completed #${cardId} (${report.iterations} steps, ${Object.keys(report.filesChanged).length} files)`);
          } else {
            await reportProgress(cardId, AGENT_CONFIG.agentId, "review", `Agent finished but made no file changes. Moving to review.\n${reportSummary}`);
            console.log(`[KanbaiAgent] #${cardId} moved to review (no changes)`);
          }
          activeTasks.delete(cardId);
          if (report.hadChanges) {
            triggerGitHubPush(`Agent work on #${cardId}: ${report.cardTitle || "task"}`).catch(() => {});
          }
        } catch (err) {
          console.error(`[KanbaiAgent] Error on #${cardId}:`, err.message);
          await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", `Error: ${err.message}`);
        }
      }
    } catch (err) { console.error("[KanbaiAgent] Loop error:", err.message); }
    const backoff = consecutiveHubErrors >= 5 ? Math.min(AGENT_CONFIG.pollInterval * 3, 300000) : AGENT_CONFIG.pollInterval;
    await sleep(backoff);
  }
}

function stopAgent() { running = false; console.log("[KanbaiAgent] Stopping agent..."); }

async function approveTask(cardId) {
  const card = pendingApproval.get(cardId);
  if (!card) throw new Error("No pending task with id " + cardId);
  pendingApproval.delete(cardId);
  const cr = await claimTask(card.id, AGENT_CONFIG.agentId);
  if (!cr.error || cr.local) activeTasks.set(card.id, { ...card, claimedAt: new Date() });
}

function requireAgentAuth(req, res, next) {
  const key = process.env.DEPLOY_SECRET_KEY || process.env.DEPLOY_SECRET || process.env.HUB_API_KEY;
  if (!key) return next();
  const auth = req.headers.authorization;
  const xKey = req.headers["x-api-key"];
  const referer = req.headers.referer || req.headers.origin || "";
  const isSameOrigin = referer.includes(req.hostname);
  if (isSameOrigin) return next();
  if (auth === `Bearer ${key}` || xKey === key) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

function registerAgentRoutes(app) {
  app.get("/api/agent/status", requireAgentAuth, (req, res) => {
    res.json({
      agentId: AGENT_CONFIG.agentId, mode: AGENT_CONFIG.mode, running,
      model: AGENT_CONFIG.model,
      maxIterations: AGENT_CONFIG.maxToolIterations,
      dailyBudgetPaused,
      activeTasks: Array.from(activeTasks.entries()).map(([id, c]) => ({ id, title: c.title })),
      pendingApproval: Array.from(pendingApproval.entries()).map(([id, c]) => ({ id, title: c.title })),
      pendingReview: Array.from(pendingReview.entries()).map(([id, r]) => ({
        id, filesChanged: Object.keys(r.filesChanged).length,
        testResults: r.testResults.length, allTestsPassed: r.allTestsPassed,
      })),
    });
  });

  app.post("/api/agent/approve/:cardId", requireAgentAuth, async (req, res) => {
    try { await approveTask(parseInt(req.params.cardId)); res.json({ success: true }); }
    catch (err) { res.status(400).json({ error: err.message }); }
  });

  app.get("/api/agent/review/:cardId", requireAgentAuth, (req, res) => {
    const report = pendingReview.get(parseInt(req.params.cardId));
    if (!report) return res.status(404).json({ error: "No pending review" });
    res.json(report);
  });

  app.post("/api/agent/confirm/:cardId", requireAgentAuth, async (req, res) => {
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
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/agent/reject-review/:cardId", requireAgentAuth, async (req, res) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const report = pendingReview.get(cardId);
      if (!report) return res.status(404).json({ error: "No pending review" });
      pendingReview.delete(cardId);
      await releaseTask(cardId, AGENT_CONFIG.agentId);
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress",
        `Human rejected: ${(req.body || {}).reason || "No reason"}`);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/agent/start", requireAgentAuth, (req, res) => { if (!running) startAgent(); res.json({ status: "started" }); });
  app.post("/api/agent/stop", requireAgentAuth, (req, res) => { stopAgent(); res.json({ status: "stopped" }); });
  app.post("/api/agent/mode", requireAgentAuth, (req, res) => {
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
  app.post("/api/agent/reject/:cardId", requireAgentAuth, async (req, res) => {
    const id = parseInt(req.params.cardId);
    const c = pendingApproval.get(id);
    if (!c) return res.status(404).json({ error: "Not found" });
    pendingApproval.delete(id);
    try { await releaseTask(id, AGENT_CONFIG.agentId); } catch {}
    res.json({ success: true });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export { startAgent, stopAgent, approveTask, registerAgentRoutes, AGENT_CONFIG };
