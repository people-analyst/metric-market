# Metric Market — Kanbai Notes

## Integration Status

- Pull API (`GET /api/pull/board/:slug`) implemented and auth-protected
- Receive-cards webhook (`POST /api/receive-cards`) implemented with upsert logic
- Local kanban DB stores cards with `sourceCardId` linking back to central Kanbai IDs
- DEPLOY_SECRET_KEY shared with Kanbai for mutual auth

## Card Inventory

- 54 done cards (24 from Kanbai agent work, 30 from earlier backlog)
- 10 backlog cards (prioritized: 2 critical, 4 high, 3 medium, 1 low)
- 3 open items: #105 (blocked on Segmentation Studio), #5 (deferred large project), #45 (planned cross-app)

## Agent Capabilities

- Kanbai agent runner (`server/kanbai-agent-runner.js`) can poll and execute tasks autonomously
- Claude-powered agent loop: poll → claim → implement → verify → complete
- Budget: 25 iterations per task (may need increase for complex multi-component work)

## Key Decisions

- Cards use local auto-increment IDs; `sourceCardId` tracks the original Kanbai card ID
- Board pull groups cards into 5 columns; unknown statuses fall into `backlog`
- Receive-cards webhook does upsert: matches by `sourceCardId` or `title` to avoid duplicates
