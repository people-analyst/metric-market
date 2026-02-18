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
- **Iteration cap**: Maximum 15 tool-use steps per task (prevents runaway loops)
- **Progress reporting**: Every 3 steps, the agent reports what it's done back to Kanbai

### Customizing Guardrails

You can adjust safety settings in the `AGENT_CONFIG` object:
```javascript
AGENT_CONFIG.maxToolIterations = 20;        // Allow more steps per task
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

## Completion Reports

When an agent finishes working on a task, it generates a structured completion report containing:
- **filesChanged**: Object mapping file paths to change details (action type, content size or before/after snippets)
- **testResults**: Array of test runs with command, exit code, output, pass/fail status
- **iterations**: Number of tool-use steps taken
- **summary**: Claude's own summary of what it accomplished and any remaining work
- **allTestsPassed**: Boolean indicating overall test status

In **semi mode**, this report is held for human review before the card moves to "done".
In **auto mode**, the report is sent to Kanbai and (optionally) the Hub immediately.

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
