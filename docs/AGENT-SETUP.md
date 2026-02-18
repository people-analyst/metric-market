# AI Agent Setup Guide for metric-market

## Overview
This package includes everything needed for local Claude agents to pick up and execute Kanban tasks autonomously. The AI agent system connects to Kanbai (http://cdeb1be5-0bf9-40c9-9f8a-4b50dbea18f1-00-2133qt2hcwgu.picard.replit.dev) to claim tasks, analyze them with Claude, report progress, and complete work.

## Quick Start (Recommended)

The fastest way to get the full agent system running is the **unified bundle** file:

### 1. Copy the unified bundle
Copy `kanbai-metric-market.js` to your project root.

### 2. Set Replit Secrets
Add these to your Replit Secrets tab:
- `DEPLOY_SECRET_KEY` - Must match the Kanbai instance (shared ecosystem key). **If you already have this from a previous connector setup, your existing key works — do not change it.**
- `ANTHROPIC_API_KEY` - Your Claude API key for the agent runner. **If this is already in your Secrets, no action needed — your existing key is compatible.**

> **Already have these secrets?** Great — skip this step entirely. v2.0 is fully backward-compatible with your existing keys.

### 3. Install the Anthropic SDK
```bash
npm install @anthropic-ai/sdk
```

### 4. Mount in your Express server
Add ONE line to your main server file (e.g., `server/index.ts` or `index.js`):
```javascript
require("./kanbai-metric-market").mount(app);
```

### 5. Start the agent
POST to `/api/agent/start` or call `startAgent()` programmatically.

That's it. Your app now has:
- Full Kanbai connector (pull/push cards, sync, health reporting)
- Agent task lifecycle (claim, progress, complete, release)
- Claude-powered autonomous task loop
- Webhook receiver for real-time card events
- Health + specifications endpoints for ecosystem monitoring

## What the Agent Does

The agent runs a continuous loop:
1. **Polls** Kanbai for available tasks assigned to `metric-market`
2. **Claims** a task (locks it so no other agent takes it)
3. **Explores** the project (lists directories, reads files, searches code)
4. **Implements** changes using Claude's tool-use (edits files, creates new files)
5. **Verifies** its work by reading modified files and running tests
6. **Reports progress** back to Kanbai at each step
7. **Completes or escalates** the task based on results

## Tool-Use Capabilities (v2.0)

The agent uses Claude's tool-use feature to interact with the project filesystem. Claude can call these tools during task execution:

| Tool | Description |
|------|-------------|
| `read_file` | Read file contents (with optional line range) |
| `write_file` | Create or overwrite a file |
| `edit_file` | Replace a specific string in a file (surgical edit) |
| `list_directory` | List files and subdirectories |
| `search_files` | Grep for a pattern across project files |
| `run_command` | Run an allowed shell command (e.g., `npm test`) |

### Safety Guardrails

The agent operates within strict safety boundaries:

- **Path restrictions**: Cannot access files outside the project root, or in `node_modules/`, `.git/`, `.env`, `.replit`, `replit.nix`, `package-lock.json`
- **File size limit**: Cannot read or write files larger than 200KB
- **Command allowlist**: Only these commands are permitted: `npm test`, `npm run lint`, `npm run build`, `ls`, `cat`, `grep`, `find`, `wc`, `head`, `tail`, `diff`
- **Command timeout**: Shell commands time out after 30 seconds
- **Iteration cap**: Default 25 tool-use steps per task (configurable via `KANBAI_AGENT_MAX_ITERATIONS` env var)
- **Pause-and-continue**: When budget is reached, agent pauses (instead of hard-stopping), preserves all work, and creates a continuation card
- **Wind-down buffer**: 3 rounds before budget limit, the agent receives a pause warning to document work-in-progress
- **Final round prompt**: On the last round, the agent writes a PAUSE REPORT documenting remaining work
- **Daily budget limits**: Configurable daily caps on iterations and tasks across all agents
- **Approval gates**: Continuation cards require admin approval before another agent can resume
- **Progress reporting**: Every step, the agent reports what it's done back to Kanbai

### Pause-and-Continue Workflow

When an agent reaches its iteration budget mid-task, the system follows a graceful pause-and-continue flow instead of hard-stopping:

1. **Wind-down warning** (3 rounds before limit): Agent is prompted to save all work and write a PAUSE REPORT
2. **Pause**: Agent execution stops, all work-in-progress is preserved
3. **Continuation card created**: A new card is automatically created with:
   - Title: `[CONTINUE] {original title}`
   - Tags: `agent-continuation`, `needs-approval`
   - Full resume context in technicalNotes (JSON): files changed, remaining work, activity log
   - Link to original card via dependencies
4. **Admin reviews**: The continuation card appears on the board with a "needs-approval" tag
5. **Admin approves**: `POST /api/agent/approve-continuation/:cardId` removes the needs-approval tag
6. **Agent resumes**: On next poll, the agent picks up the continuation card, reads the resume context, and continues from where the previous agent left off — without redoing completed work

### Daily Budget Controls

Daily budgets prevent runaway agent costs across your ecosystem:

```bash
KANBAI_DAILY_BUDGET_ITERATIONS=500   # Max tool iterations per day across all agents (default: 500)
KANBAI_DAILY_BUDGET_TASKS=50         # Max tasks claimed per day (default: 50)
```

When daily budget is exhausted:
- Agent pauses and waits (polls every 5 minutes to check if budget is restored)
- Console log: "Daily budget exhausted. Pausing until admin increases limits."
- Admin can increase limits or reset via Kanbai's `POST /api/agent/budget` endpoint

### Customizing Guardrails

**Via environment variables (recommended — no code changes needed):**
```bash
KANBAI_AGENT_MAX_ITERATIONS=40       # Allow 40 tool rounds per task (default: 25)
KANBAI_AGENT_WINDDOWN_BUFFER=5       # Start wind-down 5 rounds before limit (default: 3)
KANBAI_DAILY_BUDGET_ITERATIONS=500   # Daily iteration budget (default: 500)
KANBAI_DAILY_BUDGET_TASKS=50         # Daily task budget (default: 50)
```

**Via code (for other settings):**
```javascript
AGENT_CONFIG.maxFileSize = 500 * 1024;      // Allow larger files (500KB)
AGENT_CONFIG.commandTimeout = 60000;        // 60-second command timeout
AGENT_CONFIG.allowedCommands.push("python"); // Add python to allowed commands
AGENT_CONFIG.blockedPaths.push("secrets/");  // Block additional paths
```

## Agent Modes

- **semi** (default): Two-stage review process:
  1. Agent finds tasks and queues them for **pre-work approval** (`POST /api/agent/approve/:cardId`)
  2. After the agent finishes work, results are queued for **post-work review** with a structured completion report
  3. You review the report (`GET /api/agent/review/:cardId`) showing files changed, change summaries, and test results
  4. You **confirm** (`POST /api/agent/confirm/:cardId`) to mark done, or **reject** (`POST /api/agent/reject-review/:cardId`) to release for rework
- **auto**: Agent claims, implements, and completes tasks fully autonomously, posting structured completion reports back to Kanbai and the Hub

Both modes support **pause-and-continue**: when an agent hits its iteration budget, it pauses and creates a continuation card regardless of mode. In semi mode, continuation cards go through the same approval flow.

## Completion and Pause Reports

When an agent finishes working on a task, it generates a structured report containing:
- **filesChanged**: Object mapping file paths to change details (action type, content size or before/after snippets)
- **testResults**: Array of test runs with command, exit code, output, pass/fail status
- **iterations**: Number of tool-use steps taken
- **summary**: Claude's own summary of what it accomplished and any remaining work
- **allTestsPassed**: Boolean indicating overall test status
- **budgetExhausted**: Boolean — true if the agent was paused due to iteration limit
- **resumeContext**: (when paused) Object with filesModified, remainingWork, resumeInstructions for the continuation card

In **semi mode**, this report is held for human review before the card moves to "done".
In **auto mode**, the report is sent to Kanbai and (optionally) the Hub immediately.
When **budgetExhausted** is true, a continuation card is created automatically.

### Hub Notification

If `HUB_URL` or `PLATFORM_HUB_URL` is set, the agent will POST the completion report to `{HUB_URL}/api/agent-completion` so the Hub can track which cards were completed and what changed.

## Control Endpoints (mounted automatically)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/start` | POST | Start the agent loop |
| `/api/agent/stop` | POST | Stop the agent loop |
| `/api/agent/status` | GET | View agent status, active/pending/review queues |
| `/api/agent/approve/:cardId` | POST | Approve a pending task for the agent to work on (semi mode, pre-work) |
| `/api/agent/reject/:cardId` | POST | Reject a pending task and release it (pre-work) |
| `/api/agent/review/:cardId` | GET | View the structured completion report for a finished task (semi mode, post-work) |
| `/api/agent/confirm/:cardId` | POST | Confirm agent work and mark card done (semi mode, post-work) |
| `/api/agent/reject-review/:cardId` | POST | Reject agent work and release card for rework (semi mode, post-work) |
| `/api/agent/mode` | POST | Switch mode: `{ "mode": "auto" }` or `{ "mode": "semi" }` |
| `/api/kanban/cards` | GET | Proxied board data from hub (used by board UI) |
| `/api/kanban/spoke-config` | GET | Proxied column config from hub (used by board UI) |
| `/health` | GET | Ecosystem health check |
| `/api/hub-webhook` | POST | Receive card events from Kanbai |
| `/api/specifications` | GET | Ecosystem capability discovery |

### Kanbai-Side API Endpoints (for pause-and-continue)

These are endpoints on the **Kanbai central server** that your agents call:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/pause` | POST | Pause a task and create a continuation card with resume context |
| `/api/agent/budget` | GET | View current daily budget status and usage |
| `/api/agent/budget` | POST | Update daily budget limits (admin) |
| `/api/agent/budget/check` | POST | Check if daily budget allows more work |
| `/api/agent/approve-continuation/:cardId` | POST | Approve a continuation card for agent pickup |

## Alternative: Separate Files

If you prefer modular files instead of the unified bundle:
- `src/server/kanbai-connector.js` - Connector only (pull/push/sync)
- `src/server/kanbai-agent-runner.js` - Agent runner only (Claude task loop)

Import them separately:
```javascript
const connector = require("./src/server/kanbai-connector");
const agent = require("./src/server/kanbai-agent-runner");
```

## Ecosystem Integration

Once mounted, your app automatically:
- Registers its webhook with Kanbai for real-time card notifications
- Reports health status to the ecosystem dashboard
- Exposes `/api/specifications` for Kanbai ecosystem discovery
- Responds to `/health` checks

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Agent won't start | Check that `@anthropic-ai/sdk` is installed and `ANTHROPIC_API_KEY` is set |
| "Unauthorized" errors | Verify `DEPLOY_SECRET_KEY` matches the Kanbai instance |
| No tasks found | Check that cards are assigned to `metric-market` in Kanbai and are in claimable statuses |
| Agent claims but can't process | Check Claude API quota and key validity |
