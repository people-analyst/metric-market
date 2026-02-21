# Embedded AI Developer SDK v1.1.0 Installation Guide

## Overview

The Embedded AI Developer SDK v1.1.0 is now installed and operational in Metric Market. This SDK provides autonomous AI agent capabilities for task management and development automation.

## Installation Status

✅ **SDK Version:** 1.1.0  
✅ **Installation Date:** Current  
✅ **Status:** Operational  
✅ **Integration:** Active in server/index.ts  

## Files Installed

```
embedded-ai-sdk.js       # ES Module version
embedded-ai-sdk.cjs      # CommonJS version (used by server)
```

## Key Features (v1.1.0)

This version includes the following enhancements:

1. **Wind-down Buffer** - Graceful completion of tasks with buffer management
2. **Pause-and-Continue** - Ability to pause and resume agent operations
3. **Environment-Configurable Budget** - Customizable iteration limits via env vars
4. **Project Context Loading** - Automatic loading of project-specific context
5. **Same-Origin Auth Middleware** - Enhanced security for API requests

## Configuration

The SDK is configured via environment variables:

```bash
# Agent Mode: "auto" or "semi" (default: "semi")
AGENT_MODE=semi

# AI Model to use (default: "claude-sonnet-4-5")
AGENT_MODEL=claude-sonnet-4-5

# Maximum tool iterations (default: 25)
AGENT_MAX_ITERATIONS=25

# Wind-down buffer for graceful completion (default: 3)
AGENT_WINDDOWN_BUFFER=3

# Hub URL for SDK communication
HUB_URL=http://localhost:5000

# Hub API Key (optional)
HUB_API_KEY=your-api-key-here
```

## Server Integration

The SDK is automatically mounted in the Express application:

```typescript
// server/index.ts
const embeddedAiSdk = _require("../embedded-ai-sdk.cjs");
embeddedAiSdk.mount(app);
```

## API Endpoints

### SDK Distribution

The following endpoints are available for SDK distribution:

#### GET /api/sdk/embedded-ai
Returns the ES Module version of the SDK.

**Response Headers:**
- `Content-Type: application/javascript`
- `X-SDK-Version: 1.1.0`

#### GET /api/sdk/embedded-ai.cjs
Returns the CommonJS version of the SDK.

**Response Headers:**
- `Content-Type: application/javascript`
- `X-SDK-Version: 1.1.0`

#### GET /api/sdk/info
Returns SDK metadata and status.

**Response Example:**
```json
{
  "name": "Embedded AI Developer SDK",
  "version": "1.1.0",
  "app": "Metric Market",
  "endpoints": {
    "esModule": "/api/sdk/embedded-ai",
    "commonjs": "/api/sdk/embedded-ai.cjs"
  },
  "features": [
    "Wind-down buffer",
    "Pause-and-continue",
    "Environment-configurable budget",
    "Project context loading",
    "Same-origin auth middleware"
  ],
  "status": "operational"
}
```

## Scripts

### Install SDK
Downloads and installs the latest SDK from the hub:

```bash
node scripts/install-embedded-ai-sdk.js
```

### Verify Installation
Checks that the SDK is properly installed and operational:

```bash
node scripts/verify-sdk-installation.js
```

## Project Context

To provide custom context to the AI agent, create a file named `agent-context.md` in the project root. This file will be automatically loaded by the SDK (up to 5000 characters).

Example:
```markdown
# Metric Market Agent Context

## Project Overview
Metric Market is a TypeScript monorepo with React frontend and Express backend...

## Key Conventions
- Use Drizzle ORM for database operations
- Follow the shared schema in shared/schema.ts
- API routes are defined in server/routes.ts
...
```

## Usage

Once installed, the SDK operates automatically based on the configured mode:

### Semi-Automatic Mode (default)
- Agent polls for high-priority tasks
- Requires approval for critical operations
- Provides detailed execution logs

### Automatic Mode
- Agent operates autonomously
- Auto-approves all operations within safety constraints
- Suitable for trusted environments

## Monitoring

Monitor SDK activity through:

1. **Server Logs** - Check console output for agent activity
2. **API Endpoint** - Query `/api/sdk/info` for status
3. **Hub Dashboard** - View agent metrics in the hub interface

## Troubleshooting

### SDK Not Loading
```bash
# Re-install the SDK
node scripts/install-embedded-ai-sdk.js

# Verify installation
node scripts/verify-sdk-installation.js

# Restart the server
npm run dev
```

### Version Mismatch
If the SDK version doesn't match v1.1.0:
1. Download the latest version using the install script
2. Clear any cached versions
3. Restart the server

### Integration Issues
Check that:
- SDK files exist in project root
- Server imports the SDK in server/index.ts
- Environment variables are properly configured

## Security Considerations

1. **API Key** - Store `HUB_API_KEY` in environment variables, not in code
2. **Command Allowlist** - SDK only executes whitelisted commands
3. **Path Blocking** - Sensitive paths (.env, node_modules) are blocked
4. **Same-Origin Auth** - API requests require proper authentication

## Upgrade Path

To upgrade to a newer SDK version:

1. Update the `SDK_VERSION` in install script
2. Run installation script to download new version
3. Verify with verification script
4. Review changelog for breaking changes
5. Update configuration if needed

## Support

For issues or questions:
- Check server logs for error messages
- Verify installation with verification script
- Review SDK documentation in the file headers
- Contact platform support if needed

## Changelog

### v1.1.0 (Current)
- Added wind-down buffer management
- Implemented pause-and-continue functionality
- Environment-configurable iteration budget
- Automatic project context loading
- Enhanced same-origin authentication
- Based on Kanbai v2.1.0 production patterns

---

**Last Updated:** Current Installation  
**Maintained By:** Metric Market Development Team  
**SDK Source:** http://localhost:5000/api/sdk/embedded-ai
