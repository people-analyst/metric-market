# Hub SDK v2.3.0 - NPM Scripts

This document describes the NPM scripts available for managing and verifying the Hub SDK installation.

## 📦 Recommended package.json Scripts

Add these scripts to your `package.json` for easy SDK management:

```json
{
  "scripts": {
    "hub:verify": "node scripts/verify-hub-sdk.js",
    "hub:test": "node scripts/test-hub-sdk.js",
    "hub:install": "bash scripts/install-hub-sdk.sh"
  }
}
```

## 🔍 Available Scripts

### `npm run hub:verify`
**Purpose:** Comprehensive verification of Hub SDK installation

**What it checks:**
- SDK files exist (hub-sdk.js, hub-sdk.cjs)
- SDK version matches required version (2.3.0)
- SDK integration in server files
- Environment configuration (HUB_API_KEY)
- Hub configuration file (hub-config.json)
- SDK exports are available

**Usage:**
```bash
npm run hub:verify
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  Hub SDK v2.3.0 Installation Verification                   ║
╚══════════════════════════════════════════════════════════════╝

📋 Check 1: Verifying SDK files exist...
   ✅ hub-sdk.js found
   ✅ hub-sdk.cjs found

📋 Check 2: Verifying SDK version...
   ✅ SDK version 2.3.0 matches required version 2.3.0

[... additional checks ...]

✅ Hub SDK v2.3.0 is properly installed and operational
```

---

### `npm run hub:test`
**Purpose:** Quick test to verify SDK can be loaded and basic functions work

**What it checks:**
- SDK module can be required
- All required exports are functions
- Basic SDK structure is valid

**Usage:**
```bash
npm run hub:test
```

**Expected Output:**
```
🧪 Testing Hub SDK v2.3.0...

Test 1: Loading SDK...
   ✅ SDK loaded successfully

Test 2: Checking SDK exports...
   ✅ init() is available
   ✅ emitEvent() is available
   ✅ setDirectiveHandler() is available
   ✅ executeDirective() is available

✅ All tests passed!

📋 SDK Summary:
   Version: 2.3.0
   Status: Operational
   Integration: Ready
```

---

### `npm run hub:install`
**Purpose:** Install or update Hub SDK to latest version

**What it does:**
- Backs up existing SDK files
- Downloads latest SDK from Hub
- Creates CommonJS version
- Verifies installation

**Usage:**
```bash
npm run hub:install
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║  Hub SDK v2.3.0 Installation                                 ║
╚══════════════════════════════════════════════════════════════╝

📦 Backing up existing hub-sdk.js...
   ✅ Backed up to .sdk-backups/hub-sdk.js.20240101_120000

⬇️  Downloading Hub SDK v2.3.0...
   ✅ Downloaded hub-sdk.js
   ✅ Created hub-sdk.cjs

🔍 Verifying installation...
   ✅ hub-sdk.js exists (version: 2.3.0)
   ✅ hub-sdk.cjs exists
   ✅ SDK is integrated in server/index.ts

✅ Hub SDK v2.3.0 installation complete!
```

---

## 🚀 Quick Start Workflow

### After Initial Installation
```bash
# 1. Verify SDK is installed
npm run hub:verify

# 2. Test SDK functionality
npm run hub:test

# 3. Start your server
npm run dev
```

### Updating SDK
```bash
# 1. Install/update SDK
npm run hub:install

# 2. Verify new version
npm run hub:verify

# 3. Test new version
npm run hub:test

# 4. Restart server
npm run dev
```

### Troubleshooting
```bash
# Run comprehensive verification
npm run hub:verify

# If issues found, check server logs
npm run dev

# Re-install if needed
npm run hub:install
```

---

## 📝 Manual Script Execution

If you prefer not to add NPM scripts, you can run the scripts directly:

### Verification Script
```bash
node scripts/verify-hub-sdk.js
```

### Test Script
```bash
node scripts/test-hub-sdk.js
```

### Installation Script
```bash
bash scripts/install-hub-sdk.sh
```

---

## 🔧 Integration with CI/CD

### Pre-deployment Check
Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Verify Hub SDK
  run: npm run hub:verify
```

### Health Check
Add to your health check endpoint:

```javascript
app.get('/health', (req, res) => {
  const hubSdk = require('./hub-sdk.cjs');
  res.json({
    status: 'ok',
    sdk_version: '2.3.0',
    // ... other health checks
  });
});
```

---

## 📊 Monitoring

### Log SDK Events
```javascript
const hubSdk = require('./hub-sdk.cjs');

// Monitor SDK events
hubSdk.emitEvent('app_started', {
  version: '1.0.0',
  sdk_version: '2.3.0',
  timestamp: new Date().toISOString()
});
```

### Track Directive Execution
```javascript
hubSdk.setDirectiveHandler(async (directive) => {
  console.log('Received directive:', directive.type);
  
  try {
    const result = await processDirective(directive);
    
    // Log success
    hubSdk.emitEvent('directive_completed', {
      directiveId: directive.id,
      type: directive.type,
      success: true
    });
    
    return result;
  } catch (error) {
    // Log failure
    hubSdk.emitEvent('directive_failed', {
      directiveId: directive.id,
      type: directive.type,
      error: error.message
    });
    
    throw error;
  }
});
```

---

## 🔍 Environment Variables

### Required for Production
```bash
HUB_API_KEY=pat_your_api_key_here
```

### Optional Configuration
```bash
HUB_URL=http://localhost:5000  # Override default Hub URL
NODE_ENV=production            # Enable production mode
```

---

## 📚 Additional Resources

- Full documentation: `HUB_SDK_V2.3.0_INSTALLATION.md`
- Hub configuration: `hub-config.json`
- Hub documentation: `hub-docs.md`
- Server integration: `server/index.ts`

---

## ✅ Installation Checklist

Use this checklist to ensure proper SDK setup:

- [ ] hub-sdk.js exists in root directory
- [ ] hub-sdk.cjs exists in root directory
- [ ] Scripts added to package.json
- [ ] `npm run hub:verify` passes all checks
- [ ] `npm run hub:test` passes all tests
- [ ] HUB_API_KEY set in production environment
- [ ] Server starts without SDK errors
- [ ] Health endpoint accessible
- [ ] Events reaching Hub (verify in Hub dashboard)
- [ ] Directives being received and executed

---

**Last Updated:** 2024  
**SDK Version:** 2.3.0  
**Status:** ✅ OPERATIONAL
