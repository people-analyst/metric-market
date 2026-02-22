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

## Epic Management (Remote Kanbai API)

The Metric Market agent can create and manage epics on the central Kanbai instance:

| Function | Description |
|----------|-------------|
| `listKanbaiEpics()` | List all epics on Kanbai |
| `createKanbaiEpic({name, description?, status?})` | Create a new epic (default status: `not_started`) |
| `updateKanbaiEpic(epicId, {name?, description?, status?})` | Update epic fields |
| `deleteKanbaiEpic(epicId)` | Delete an epic (cards lose their `epicId`) |
| `assignCardToEpic(cardId, epicId)` | Assign a card to an epic (pass `null` to remove) |
| `findOrCreateEpic(name, description?)` | Find by name or create if not found |

**Remote API base:** `KANBAI_URL` env var or `https://people-analytics-kanban.replit.app`

### Typical Agent Flow

1. Read `.kanbai/KANBAN.md` to get card IDs
2. `listKanbaiEpics()` to see existing epics
3. `findOrCreateEpic("Theme Name", "description")` to get/create an epic
4. `assignCardToEpic(cardId, epic.id)` for each related card

## Agent Capabilities

- Kanbai agent runner (`server/kanbai-agent-runner.js`) can poll and execute tasks autonomously
- Claude-powered agent loop: poll → claim → implement → verify → complete
- Budget: 25 iterations per task (may need increase for complex multi-component work)

## Key Decisions

- Cards use local auto-increment IDs; `sourceCardId` tracks the original Kanbai card ID
- Board pull groups cards into 5 columns; unknown statuses fall into `backlog`
- Receive-cards webhook does upsert: matches by `sourceCardId` or `title` to avoid duplicates
