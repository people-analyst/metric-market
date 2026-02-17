import Anthropic from "@anthropic-ai/sdk";
import { pullBoard, claimTask, reportProgress, completeTask, releaseTask, getAvailableTasks, getSchema, getSpokeConfig } from "./kanbai-connector.js";

const AGENT_CONFIG = {
  agentId: "agent-metric-market",
  appSlug: "metric-market",
  mode: "semi",
  pollInterval: 60000,
  maxConcurrent: 1,
  priorities: ["critical", "high", "medium"],
  autoApprove: false,
};

const anthropic = new Anthropic();
let activeTasks = new Map();
let running = false;

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

const pendingApproval = new Map();

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
  if (result.error) {
    console.warn(`[KanbaiAgent] Could not claim #${card.id}: ${result.error}`);
    return;
  }
  console.log(`[KanbaiAgent] Claimed #${card.id}: "${card.title}"`);
  activeTasks.set(card.id, { ...card, claimedAt: new Date() });
}

async function processActiveTasks() {
  for (const [cardId, card] of activeTasks) {
    try {
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", "Agent analyzing task...");
      
      const analysis = await analyzeTaskWithClaude(card);
      
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", 
        `Agent analysis complete: ${analysis.summary}`);
      
      if (analysis.canAutoComplete && AGENT_CONFIG.mode === "auto") {
        await executeTask(cardId, card, analysis);
        await completeTask(cardId, AGENT_CONFIG.agentId, 
          `Auto-completed by ${AGENT_CONFIG.agentId}: ${analysis.summary}`);
        activeTasks.delete(cardId);
        console.log(`[KanbaiAgent] Completed #${cardId}`);
      } else {
        await reportProgress(cardId, AGENT_CONFIG.agentId, "review", 
          `Ready for review. Agent recommendation: ${analysis.recommendation}`);
        activeTasks.delete(cardId);
        console.log(`[KanbaiAgent] Moved #${cardId} to review`);
      }
    } catch (err) {
      console.error(`[KanbaiAgent] Error processing #${cardId}:`, err.message);
      await reportProgress(cardId, AGENT_CONFIG.agentId, "in_progress", 
        `Agent error: ${err.message}. Will retry.`);
    }
  }
}

async function analyzeTaskWithClaude(card) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: `You are an AI agent working on development tasks for the ${AGENT_CONFIG.appSlug} application.
You analyze kanban cards and determine what work needs to be done.
Respond with a JSON object: { "summary": "...", "recommendation": "...", "canAutoComplete": boolean, "steps": [...] }`,
    messages: [{
      role: "user",
      content: `Analyze this task and determine what needs to be done:

Title: ${card.title}
Type: ${card.type}
Priority: ${card.priority}
Description: ${card.description || "No description"}
Acceptance Criteria: ${JSON.stringify(card.acceptanceCriteria || [])}
Technical Notes: ${card.technicalNotes || "None"}
Tags: ${(card.tags || []).join(", ")}

Provide your analysis as JSON.`
    }]
  });
  
  try {
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text.slice(0, 200), recommendation: "Review needed", canAutoComplete: false, steps: [] };
  } catch {
    return { summary: "Analysis completed", recommendation: "Manual review recommended", canAutoComplete: false, steps: [] };
  }
}

async function executeTask(cardId, card, analysis) {
  console.log(`[KanbaiAgent] Executing task #${cardId}: ${analysis.summary}`);
  for (const step of analysis.steps || []) {
    console.log(`[KanbaiAgent]   Step: ${step}`);
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

  app.post("/api/agent/start", (req, res) => {
    if (!running) startAgent();
    res.json({ status: "started" });
  });

  app.post("/api/agent/stop", (req, res) => {
    stopAgent();
    res.json({ status: "stopped" });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export { startAgent, stopAgent, approveTask, AGENT_CONFIG };
