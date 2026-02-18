# Kanban Spoke Setup Guide for metric-market

## Overview
This package contains everything needed to add Kanban capabilities AND AI agent functionality to your metric-market application. It was generated from Kanbai.

## Fastest Setup: Unified Bundle (Recommended)

The unified bundle (`kanbai-metric-market.js`) is a single file that gives you the full Kanbai integration including the AI agent. See `docs/AGENT-SETUP.md` for details.

```bash
npm install @anthropic-ai/sdk
```

Then add one line to your server:
```javascript
require("./kanbai-metric-market").mount(app);
```

Set these Replit Secrets:
- `DEPLOY_SECRET_KEY` - Must match the Kanbai instance
- `ANTHROPIC_API_KEY` - For Claude-powered agent

## Manual Setup (Component by Component)

### 1. Install Dependencies
```bash
npm install drizzle-orm drizzle-zod @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @anthropic-ai/sdk
```

### 2. Add Schema
Copy `src/shared/kanban-schema.ts` into your project's shared schema directory.

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Add Routes
Import and register the kanban routes in your Express server:
```typescript
import { registerKanbanRoutes } from "./kanban-routes";
registerKanbanRoutes(app);
```

### 5. Add UI Components
Copy the board and card components into your client source.

### 6. Add Connector & Agent Runner
Copy `src/server/kanbai-connector.js` and `src/server/kanbai-agent-runner.js` into your server directory.

### 7. Import Initial Data
Use the included `data/cards.json` to seed your local kanban:
```bash
curl -X POST http://localhost:5000/api/kanban/import \
  -H "Content-Type: application/json" \
  -d '{"cards": <contents of data/cards.json>}'
```

## Syncing with Central Kanban
Cards can be synced bi-directionally between this spoke and the central Kanban system. See `docs/SYNC.md` for details.
