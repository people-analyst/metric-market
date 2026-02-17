# Kanban Sync Guide

## Bi-directional Card Synchronization

Kanbai supports bi-directional card sharing between the central board and spoke applications.

### Push Cards (Spoke -> Central)
```bash
# Export your spoke cards
curl http://localhost:5000/api/kanban/export > cards.json

# Push to central Kanban
curl -X POST https://<kanban-url>/api/kanban/sync/pull \
  -H "Content-Type: application/json" \
  -d '{"sourceApp": "<your-app>", "cards": <cards from export>}'
```

### Pull Cards (Central -> Spoke)
```bash
# Get cards for your app from central
curl https://<kanban-url>/api/kanban/sync/push \
  -H "Content-Type: application/json" \
  -d '{"targetApp": "<your-app>"}'

# Import into your spoke
curl -X POST http://localhost:5000/api/kanban/import \
  -H "Content-Type: application/json" \
  -d '{"cards": <cards from push response>}'
```

### Hub Sync
All cards are automatically shared with Hub. Hub can pull the full board state or push updates.

### Conflict Resolution
- Each card has a `sourceApp` and `sourceCardId` field for tracking origin
- When importing, duplicate detection uses sourceCardId
- The most recent `updatedAt` timestamp wins in conflicts
