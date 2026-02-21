# Hub SDK v2.3.0 - Quick Reference Guide
## Metric Market

> **Status:** ✅ **INSTALLED AND OPERATIONAL**  
> **Version:** 2.3.0  
> **Last Verified:** 2024

---

## ⚡ Quick Commands

```bash
# Verify SDK installation
node scripts/verify-hub-sdk.js

# Test SDK functionality  
node scripts/test-hub-sdk.js

# Install/Update SDK
bash scripts/install-hub-sdk.sh

# Start server with SDK
npm run dev
```

---

## 📦 SDK Files

| File | Purpose | Location |
|------|---------|----------|
| `hub-sdk.js` | Main SDK (ES modules) | Root directory |
| `hub-sdk.cjs` | CommonJS version | Root directory |
| `hub-config.json` | Configuration | Root directory |

---

## 🔌 Integration Points

```typescript
// server/index.ts
const hubSdk = _require("../hub-sdk.cjs");
hubSdk.init(app, {
  pollDirectives: true,
  pollIntervalMs: 300000,
  onDirective: handleDirective,
});

// server/hubMetrics.ts
const hubSdk = _require("../hub-sdk.cjs");
// Used for event emission and metrics tracking
```

---

## 🛠️ Core API

### Initialize SDK
```javascript
const hubSdk = require('./hub-sdk.cjs');
hubSdk.init(app, options);
```

**Options:**
- `pollDirectives: boolean` - Enable directive polling
- `pollIntervalMs: number` - Polling interval (default: 300000)
- `onDirective: function` - Directive handler callback

### Emit Events
```javascript
hubSdk.emitEvent(eventType, payload);
```

**Example:**
```javascript
hubSdk.emitEvent('user_action', {
  action: 'bundle_created',
  userId: 123,
  timestamp: new Date().toISOString()
});
```

### Handle Directives
```javascript
hubSdk.setDirectiveHandler(async (directive) => {
  // Process directive
  return { success: true, result: data };
});
```

### Execute Directive Manually
```javascript
const result = await hubSdk.executeDirective(directive);
```

---

## 🔑 Environment Variables

### Required (Production)
```bash
HUB_API_KEY=pat_your_api_key_here
```

**Where to get:** Hub Dashboard → Your App → Integration Tab

### Optional
```bash
HUB_URL=http://localhost:5000  # Override Hub URL
NODE_ENV=production            # Enable production features
```

---

## ✅ Verification Checklist

Quick health check for Hub SDK:

- [x] `hub-sdk.js` exists in root
- [x] `hub-sdk.cjs` exists in root  
- [x] SDK version is 2.3.0
- [x] Imported in `server/index.ts`
- [x] Imported in `server/hubMetrics.ts`
- [ ] `HUB_API_KEY` set in production
- [x] `hub-config.json` present
- [x] Server starts without errors

---

## 🔍 Health Endpoint

```bash
curl http://localhost:5000/hub/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "app": "Metric Market",
  "sdk_version": "2.3.0",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🐛 Common Issues

### SDK not loading
**Problem:** `Cannot find module '../hub-sdk.cjs'`  
**Fix:** Ensure `hub-sdk.cjs` exists in root directory

### Events not reaching Hub
**Problem:** Events emitted but not in Hub  
**Fix:** 
1. Set `HUB_API_KEY` environment variable
2. Verify Hub URL in `hub-config.json`
3. Check network connectivity

### Directives not executing
**Problem:** Directives not triggering handler  
**Fix:**
1. Verify directive handler is set
2. Check `/hub/webhook` endpoint is accessible
3. Review server logs for errors

---

## 📊 Event Examples

### App Lifecycle Events
```javascript
// App started
hubSdk.emitEvent('app_started', {
  version: '1.0.0',
  environment: process.env.NODE_ENV
});

// App shutdown
hubSdk.emitEvent('app_shutdown', {
  uptime: process.uptime()
});
```

### User Action Events
```javascript
// User created bundle
hubSdk.emitEvent('bundle_created', {
  userId: user.id,
  bundleId: bundle.id,
  name: bundle.name
});

// User analyzed metrics
hubSdk.emitEvent('metrics_analyzed', {
  userId: user.id,
  metricCount: metrics.length,
  duration: analysisTime
});
```

### System Events
```javascript
// Performance metrics
hubSdk.emitEvent('performance_metrics', {
  avgResponseTime: 150,
  errorRate: 0.01,
  requestCount: 1000
});

// Error tracking
hubSdk.emitEvent('error_occurred', {
  type: 'database_error',
  message: error.message,
  stack: error.stack
});
```

---

## 🔄 Update Procedure

### Step 1: Backup Current Version
```bash
mkdir -p .sdk-backups
cp hub-sdk.js .sdk-backups/hub-sdk.js.$(date +%Y%m%d_%H%M%S)
cp hub-sdk.cjs .sdk-backups/hub-sdk.cjs.$(date +%Y%m%d_%H%M%S)
```

### Step 2: Download New Version
```bash
curl -o hub-sdk.js "http://localhost:5000/api/sdk/download/metric-market"
cp hub-sdk.js hub-sdk.cjs
```

### Step 3: Verify Update
```bash
node scripts/verify-hub-sdk.js
node scripts/test-hub-sdk.js
```

### Step 4: Restart Server
```bash
npm run dev
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `HUB_SDK_V2.3.0_INSTALLATION.md` | Complete installation guide |
| `HUB_SDK_NPM_SCRIPTS.md` | NPM scripts reference |
| `hub-docs.md` | Full SDK documentation |
| `hub-config.json` | Hub configuration |

---

## 🎯 Key Features (v2.3.0)

- ✅ **Automatic directive polling** - No manual checking needed
- ✅ **Event batching** - Efficient event transmission
- ✅ **Webhook handling** - Automatic webhook endpoint setup
- ✅ **Health monitoring** - Built-in health check endpoint
- ✅ **Error recovery** - Automatic retry logic
- ✅ **TypeScript support** - Full type definitions available

---

## 🚀 Getting Started

### New Installation
```bash
# 1. Run install script
bash scripts/install-hub-sdk.sh

# 2. Set API key
export HUB_API_KEY=your_key_here

# 3. Verify installation
node scripts/verify-hub-sdk.js

# 4. Start server
npm run dev
```

### Existing Installation
```bash
# Quick verification
node scripts/verify-hub-sdk.js

# If any issues, re-run installation
bash scripts/install-hub-sdk.sh
```

---

## 💡 Best Practices

1. **Always set HUB_API_KEY in production**
   ```bash
   export HUB_API_KEY=pat_your_production_key
   ```

2. **Monitor SDK events in Hub dashboard**
   - Track event delivery
   - Monitor directive execution
   - Review error logs

3. **Use meaningful event names**
   ```javascript
   // Good
   hubSdk.emitEvent('user_created_bundle', { ... });
   
   // Avoid
   hubSdk.emitEvent('event1', { ... });
   ```

4. **Handle directive errors gracefully**
   ```javascript
   hubSdk.setDirectiveHandler(async (directive) => {
     try {
       // Process directive
       return { success: true };
     } catch (error) {
       console.error('Directive error:', error);
       return { success: false, error: error.message };
     }
   });
   ```

5. **Keep SDK updated**
   - Check Hub dashboard for updates
   - Run installation script for updates
   - Test after updating

---

## 📞 Support

- **Hub Dashboard:** http://localhost:5000
- **Documentation:** `hub-docs.md`
- **Integration Help:** `HUB_SDK_V2.3.0_INSTALLATION.md`
- **API Reference:** `hub-config.json`

---

**Version:** 2.3.0  
**Status:** ✅ Operational  
**Last Updated:** 2024
