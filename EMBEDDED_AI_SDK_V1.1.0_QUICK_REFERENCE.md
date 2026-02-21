# Embedded AI SDK v1.1.0 — Quick Reference Card

**Status:** ✅ Installed & Operational  
**Project:** Metric Market  
**Version:** 1.1.0

---

## 🚀 Quick Commands

```bash
# Verify installation
node scripts/verify-embedded-ai-v1.1.0.js

# Check status (API)
curl http://localhost:5000/api/sdk/info

# Start server (SDK auto-loads)
npm run dev
```

---

## ⚙️ Configuration (.env)

```bash
AGENT_MODE=semi                    # Mode: semi | auto
AGENT_MODEL=claude-sonnet-4-5      # AI model
AGENT_MAX_ITERATIONS=25            # Tool-use budget
AGENT_WINDDOWN_BUFFER=3            # Completion buffer
```

---

## ✨ v1.1.0 Features

| Feature | Description | Config |
|---------|-------------|--------|
| **Wind-down buffer** | Graceful task completion | `AGENT_WINDDOWN_BUFFER` |
| **Pause-and-continue** | Resume interrupted tasks | Built-in |
| **Configurable budget** | Control tool iterations | `AGENT_MAX_ITERATIONS` |
| **Project context** | Load from agent-context.md | Optional file |
| **Same-origin auth** | Security middleware | Built-in |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `embedded-ai-sdk.js` | ES Module |
| `embedded-ai-sdk.cjs` | CommonJS (active) |
| `server/index.ts` | SDK mount point |
| `server/routes.ts` | API endpoints |
| `agent-context.md` | Optional context |

---

## 🌐 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/sdk/embedded-ai` | Download ES Module |
| `GET` | `/api/sdk/embedded-ai.cjs` | Download CommonJS |
| `GET` | `/api/sdk/info` | SDK metadata |

---

## 📊 Agent Configuration

```javascript
{
  agentId: "agent-metric-market",
  mode: "semi",                    // semi | auto
  model: "claude-sonnet-4-5",
  pollInterval: 60000,             // ms
  maxConcurrent: 1,
  priorities: ["critical", "high", "medium"],
  maxToolIterations: 25,
  windDownBuffer: 3
}
```

---

## 🔍 Verification Checklist

- [x] SDK files present (v1.1.0)
- [x] Server integration active
- [x] API endpoints configured
- [x] Documentation complete
- [x] Dependencies installed
- [x] v1.1.0 features operational

---

## 🛠️ Troubleshooting

```bash
# Re-verify installation
node scripts/verify-embedded-ai-v1.1.0.js

# Check server logs
npm run dev
# Look for: [Embedded AI SDK v1.1.0] Mounted on Express app

# Test API
curl http://localhost:5000/api/sdk/info
```

---

## 📚 Documentation

- `EMBEDDED_AI_SDK_QUICKSTART.md` - Quick start guide
- `EMBEDDED_AI_SDK_V1.1.0_INSTALLATION_REPORT.md` - Full report
- `EMBEDDED_AI_SDK_V1.1.0_STATUS.json` - Status data
- `EMBEDDED_AI_SDK_V1.1.0_QUICK_REFERENCE.md` - This file

---

## 🎯 Agent Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| **semi** | Requires approval | Development, testing |
| **auto** | Fully automated | Production, CI/CD |

---

## 📝 Optional: Project Context

Create `agent-context.md` in project root:

```markdown
# Metric Market Context
- TypeScript monorepo
- React frontend (client/src/)
- Express backend (server/)
- Shared types (shared/)
- PostgreSQL + Drizzle ORM
```

---

## ✅ Installation Summary

**All systems operational:**
- SDK v1.1.0 installed
- Server integration active
- API endpoints configured
- Documentation complete
- Ready for automated tasks

**Next:** Configure `AGENT_MODE` in `.env` and restart server.

---

**Version:** 1.1.0  
**Status:** ✅ Operational  
**Last Updated:** 2026-02-21
