# Embedded AI SDK v1.1.0 Quick Start

## ✅ Installation Complete

The Embedded AI Developer SDK v1.1.0 is now installed and operational in Metric Market.

## 🚀 Quick Start

### Check SDK Status
```bash
# Verify installation
node scripts/verify-sdk-installation.js

# Query SDK info via API
curl http://localhost:5000/api/sdk/info
```

### Configuration

Set environment variables in `.env`:

```bash
# Agent mode: "semi" (default) or "auto"
AGENT_MODE=semi

# AI model to use
AGENT_MODEL=claude-sonnet-4-5

# Maximum iterations per task
AGENT_MAX_ITERATIONS=25

# Wind-down buffer
AGENT_WINDDOWN_BUFFER=3
```

### Project Context (Optional)

Create `agent-context.md` in project root to provide custom context:

```markdown
# Metric Market Context
- TypeScript monorepo
- React frontend (client/src/)
- Express backend (server/)
- Shared types (shared/)
```

## 📦 What's Included

| File | Purpose |
|------|---------|
| `embedded-ai-sdk.js` | ES Module version |
| `embedded-ai-sdk.cjs` | CommonJS version (active) |
| `scripts/install-embedded-ai-sdk.js` | Installation script |
| `scripts/verify-sdk-installation.js` | Verification script |
| `docs/EMBEDDED_AI_SDK_INSTALLATION.md` | Full documentation |

## 🔧 SDK Features (v1.1.0)

✅ Wind-down buffer for graceful task completion  
✅ Pause-and-continue operations  
✅ Environment-configurable budget  
✅ Project context loading  
✅ Same-origin auth middleware  

## 🌐 API Endpoints

- `GET /api/sdk/embedded-ai` - Download ES Module
- `GET /api/sdk/embedded-ai.cjs` - Download CommonJS
- `GET /api/sdk/info` - SDK metadata and status

## 🔍 Verification

Run the verification script to ensure everything is working:

```bash
node scripts/verify-sdk-installation.js
```

Expected output:
```
✅ SUCCESS: SDK v1.1.0 is properly installed and operational!
```

## 📝 Next Steps

1. **Restart Server** - Restart to activate the SDK if needed
2. **Monitor Logs** - Check console for agent activity
3. **Configure Mode** - Set AGENT_MODE based on your needs
4. **Add Context** - Create agent-context.md for better results

## 🛠️ Troubleshooting

If you encounter issues:

```bash
# Re-install SDK
node scripts/install-embedded-ai-sdk.js

# Verify installation
node scripts/verify-sdk-installation.js

# Restart server
npm run dev
```

## 📚 Documentation

Full documentation: `docs/EMBEDDED_AI_SDK_INSTALLATION.md`

## ✨ Ready to Use!

The SDK is now operational and ready to assist with development tasks. It will automatically poll for tasks and execute them based on the configured mode.

---

**Version:** 1.1.0  
**Status:** ✅ Operational  
**Integration:** ✅ Active in server/index.ts  
**API Endpoints:** ✅ Configured in server/routes.ts
