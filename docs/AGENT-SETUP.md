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
3. **Analyzes** the task with Claude (reads title, description, acceptance criteria, technical notes)
4. **Reports progress** back to Kanbai as it works
5. **Completes or escalates** the task based on Claude's analysis

## Agent Modes

- **semi** (default): Agent finds tasks and queues them for approval. You approve via `POST /api/agent/approve/:cardId`
- **auto**: Agent claims and processes tasks fully autonomously

## Control Endpoints (mounted automatically)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/start` | POST | Start the agent loop |
| `/api/agent/stop` | POST | Stop the agent loop |
| `/api/agent/status` | GET | View agent status, active tasks, pending approvals |
| `/api/agent/approve/:cardId` | POST | Approve a pending task (semi mode) |
| `/api/agent/reject/:cardId` | POST | Reject a pending task and release it |
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
