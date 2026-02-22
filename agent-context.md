# Metric Market — Agent Context

**Project Type:** TypeScript Monorepo  
**Stack:** React + Express + PostgreSQL  
**SDK Version:** Embedded AI Developer SDK v1.1.0

---

## 🏗️ Project Structure

```
metric-market/
├── client/              # React frontend
│   ├── src/
│   │   ├── App.tsx     # Main app & routing
│   │   ├── components/ # UI components
│   │   └── pages/      # Page components
│   └── index.html
│
├── server/              # Express backend
│   ├── index.ts        # Server entry, SDK mount point
│   ├── routes.ts       # API routes, SDK endpoints
│   └── auth.ts         # Authentication
│
├── shared/              # Shared types & schema
│   ├── schema.ts       # Database schema (Drizzle)
│   └── types.ts        # TypeScript types
│
├── scripts/             # Build & utility scripts
│   ├── install-embedded-ai-sdk.js
│   └── verify-embedded-ai-v1.1.0.js
│
└── docs/                # Documentation
```

---

## 🎯 Key Technologies

- **Frontend:** React 18, TypeScript, Wouter (routing), Tailwind CSS
- **Backend:** Express, TypeScript, PostgreSQL, Drizzle ORM
- **UI Components:** Radix UI, Lucide React, Recharts
- **Build:** Vite, esbuild
- **Database:** PostgreSQL with Neon serverless
- **Auth:** Passport.js with local strategy

---

## 📁 Important Files

| File | Purpose | Notes |
|------|---------|-------|
| `server/index.ts` | Server entry & SDK mount | Line 27-31: SDK mount point |
| `server/routes.ts` | API routes & SDK endpoints | Includes `/api/sdk/*` routes |
| `shared/schema.ts` | Database schema | Drizzle ORM schema |
| `client/src/App.tsx` | Frontend routing | Wouter-based routing |
| `package.json` | Dependencies | Includes @anthropic-ai/sdk |
| `docs/KANBAI_METRIC_MARKET_STATUS.md` | Kanbai status | Completed/open cards, verification, handoff |
| `docs/REPORT_BACK_PROMPT.md` | Report-back prompt | Prompt for status report / local agent |

---

## 🔧 Development Workflow

### Starting Development Server
```bash
npm run dev          # Start dev server (port 5000)
```

### Database Operations
```bash
npm run db:push      # Push schema changes to database
```

### Building for Production
```bash
npm run build        # Build frontend and backend
npm start            # Start production server
```

---

## 🎨 Code Style & Conventions

### TypeScript
- Strict mode enabled
- Explicit types preferred
- Use shared types from `shared/types.ts`

### React Components
- Functional components with hooks
- Props destructuring
- TypeScript interfaces for props

### API Routes
- RESTful conventions
- Express middleware pattern
- Zod validation for inputs

### Database
- Drizzle ORM for queries
- Schema in `shared/schema.ts`
- Migrations via `drizzle-kit push`

---

## 🚀 SDK Integration

### Embedded AI SDK v1.1.0
- **Location:** `embedded-ai-sdk.cjs` (CommonJS)
- **Mount:** `server/index.ts` lines 27-31
- **Mode:** Semi-automatic (configurable via `AGENT_MODE`)
- **Budget:** 25 iterations (configurable via `AGENT_MAX_ITERATIONS`)

### SDK Endpoints
- `GET /api/sdk/embedded-ai` - Download ES Module
- `GET /api/sdk/embedded-ai.cjs` - Download CommonJS
- `GET /api/sdk/info` - SDK metadata

---

## 📦 Key Dependencies

### Production
- `@anthropic-ai/sdk` (^0.75.0) - AI operations
- `express` (^4.21.2) - Backend server
- `react` (^18.3.1) - Frontend UI
- `drizzle-orm` (^0.39.1) - Database ORM
- `@radix-ui/*` - UI components
- `zod` (^3.24.2) - Validation

### Development
- `typescript` (5.6.3)
- `vite` (^5.4.20)
- `tsx` (^4.20.5)
- `drizzle-kit` (^0.31.4)

---

## 🎯 Common Tasks

### Adding a New API Route
1. Add route handler to `server/routes.ts`
2. Add types to `shared/types.ts` if needed
3. Update frontend API calls in components

### Creating a New Page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add navigation link if needed

### Database Schema Changes
1. Update `shared/schema.ts`
2. Run `npm run db:push`
3. Update related types

### Adding UI Components
1. Use existing Radix UI components
2. Follow Tailwind CSS conventions
3. Add to `client/src/components/`

---

## 🔐 Authentication

- **Strategy:** Passport.js with local strategy
- **Session:** Express sessions with PostgreSQL store
- **User Model:** Defined in `shared/schema.ts`
- **Protected Routes:** Middleware in `server/auth.ts`

---

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `tasks` - Task management
- `metrics` - Performance metrics
- Additional tables in `shared/schema.ts`

---

## 🌐 Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - Session encryption
- `ANTHROPIC_API_KEY` - AI operations

Optional (SDK):
- `AGENT_MODE` - semi/auto mode
- `AGENT_MAX_ITERATIONS` - Tool-use budget
- `AGENT_WINDDOWN_BUFFER` - Completion buffer

Optional (Hub / directives):
- `HUB_URL` - Hub base URL (required to fetch/complete directives)
- `HUB_API_KEY` - This app’s API key from the Hub registry (or `HUB_APP_SLUG` to override slug, default `metric-market`)

---

## 📡 Directives (Hub contract)

Metric Market is a spoke: it **fetches directives from the Hub** and **updates the Hub** after handling each one. Full contract and troubleshooting: **Hub repo → `docs/DIRECTIVES_SYSTEM.md`** (and `HANDOFF_DIRECTIVES_AND_CARDS.md` links to it). Summary:

**Contract**
- **Fetch:** Call the Hub (not our server): `GET {HUB_URL}/api/hub/app/{slug}/directives?status=pending` with header `X-API-Key: {HUB_API_KEY}`. Our slug: `metric-market` (or `HUB_APP_SLUG`).
- **Complete:** After handling each directive: `PATCH {HUB_URL}/api/hub/app/{slug}/directives/{id}` with body `{ "status": "completed", "response": "..." }` (or POST `.../directives/{id}/complete` if the Hub supports it).
- **Implementation:** Hub SDK polls every 5 min; we also expose `POST /api/hub/process-directives` to fetch from Hub, run `handleDirective` in `server/directiveHandler.ts`, then PATCH back.

**Troubleshooting**

| Situation | Meaning | Action |
|-----------|--------|--------|
| **502** when fetching directives | Hub was down or threw; proxy turned it into 502. Hub now returns 500 + JSON on errors. | Ensure Hub is up and `HUB_URL` is correct. Retry. If 500, check Hub logs. |
| **503 / "Hub not configured"** | Spoke has no `HUB_URL` and/or `HUB_API_KEY`. | Set both in this app’s environment. Get API key from Hub Registry for this app. |
| Fetches but never completes | Spoke didn’t call Hub to update directive after handling. | After `handleDirective(d)`, call Hub: PATCH with `status: "completed"` and optional `response`. |
| 401 | Invalid or missing API key. | Use the app’s key from Hub Registry; header `X-API-Key`. |

See **`docs/DIRECTIVES.md`** in this repo for a copy-paste block for agents; Hub repo has the single source of truth.

---

## 📝 Notes for AI Agent

### When Creating Files
- Follow existing patterns in similar files
- Use TypeScript with proper types
- Import types from `shared/types.ts`
- Follow naming conventions

### When Modifying Schema
- Update `shared/schema.ts`
- Mention need for `npm run db:push`
- Update related TypeScript types

### When Adding Dependencies
- **DO NOT** edit package.json directly
- Flag dependency needs in summary
- Mention required packages

### When Making Changes
- Make focused, minimal changes
- Verify against acceptance criteria
- Test changes if possible
- Document breaking changes

---

## 🎯 Current Focus Areas

1. **Task Management System** - Core feature
2. **Metrics Dashboard** - Visualization
3. **User Authentication** - Security
4. **API Development** - Backend routes
5. **SDK Integration** - AI automation

### Kanbai Card Work (Metric Market)

- **Status:** See `docs/KANBAI_METRIC_MARKET_STATUS.md` for completed cards, open items, and verification checklist.
- **Report back:** Use the prompt in `docs/REPORT_BACK_PROMPT.md` to generate a status report for handoff or standup.

---

## ✅ Acceptance Criteria Standards

When implementing features, ensure:
- Code follows TypeScript best practices
- Types are properly defined
- Error handling is implemented
- API routes follow RESTful conventions
- UI components use Radix UI patterns
- Database queries use Drizzle ORM
- Changes are minimal and focused

---

**Context Version:** 1.1  
**Last Updated:** 2026-02-22  
**SDK Version:** 1.1.0
