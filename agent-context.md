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

**Context Version:** 1.0  
**Last Updated:** 2026-02-21  
**SDK Version:** 1.1.0
