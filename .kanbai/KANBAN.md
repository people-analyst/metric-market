# Metric Market — Kanbai Integration

**App Slug:** `metric-market`  
**Board Endpoint:** `GET /api/pull/board/metric-market`  
**Card Webhook:** `POST /api/receive-cards`  
**Auth:** `Authorization: Bearer <DEPLOY_SECRET_KEY>`

## Board Columns

| Column | Status Value |
|--------|-------------|
| Backlog | `backlog` |
| To Do | `todo` |
| In Progress | `in_progress` |
| In Review | `in_review` |
| Done | `done` |

## Pull API

```
GET /api/pull/board/:slug
Authorization: Bearer <DEPLOY_SECRET_KEY>

Response: {
  slug: string,
  columns: {
    backlog: CardSummary[],
    todo: CardSummary[],
    in_progress: CardSummary[],
    in_review: CardSummary[],
    done: CardSummary[]
  },
  totalCards: number,
  generatedAt: string
}
```

## Receive Cards Webhook

```
POST /api/receive-cards
Authorization: Bearer <DEPLOY_SECRET_KEY>
Content-Type: application/json

Body: { cards: [ { title, type?, status?, priority?, description?, tags?, id? } ] }

Response: {
  received: number,
  processed: number,
  results: [ { id, title, action: "created"|"updated"|"unchanged" } ]
}
```

## Local Endpoints (internal)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kanban/cards` | GET | List all local cards (filter: `?app=`, `?status=`) |
| `/api/kanban/cards/:id` | GET | Get single card |
| `/api/kanban/cards` | POST | Create card |
| `/api/kanban/cards/:id` | PATCH | Update card |
| `/api/kanban/cards/:id` | DELETE | Delete card |
| `/api/kanban/import` | POST | Bulk import cards |
| `/api/kanban/export` | GET | Export all cards |
