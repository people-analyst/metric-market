# Metric Market — Scripts Directory

Scripts for Hub SDK, Kanbai board sync, and documentation republish.

---

## 📁 Available Scripts

### 1. verify-hub-sdk.js
**Purpose:** Comprehensive verification of Hub SDK installation

**Usage:**
```bash
node scripts/verify-hub-sdk.js
```

**What it checks:**
- ✅ SDK files exist (hub-sdk.js, hub-sdk.cjs)
- ✅ SDK version matches 2.3.0
- ✅ SDK integration in server files
- ✅ Environment configuration (HUB_API_KEY)
- ✅ Hub configuration file exists
- ✅ SDK exports are available

**Exit codes:**
- `0` - All checks passed
- `1` - One or more checks failed

**Example output:**
```
╔══════════════════════════════════════════════════════════════╗
║  Hub SDK v2.3.0 Installation Verification                   ║
╚══════════════════════════════════════════════════════════════╝

📋 Check 1: Verifying SDK files exist...
   ✅ hub-sdk.js found
   ✅ hub-sdk.cjs found

📋 Check 2: Verifying SDK version...
   ✅ SDK version 2.3.0 matches required version 2.3.0

...

✅ Hub SDK v2.3.0 is properly installed and operational
```

---

### 2. test-hub-sdk.js
**Purpose:** Quick functionality test for Hub SDK

**Usage:**
```bash
node scripts/test-hub-sdk.js
```

**What it tests:**
- ✅ SDK module can be loaded
- ✅ Required exports are functions
- ✅ Basic SDK structure is valid

**Exit codes:**
- `0` - All tests passed
- `1` - One or more tests failed

**Example output:**
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
```

---

### 3. install-hub-sdk.sh
**Purpose:** Automated installation/update of Hub SDK

**Usage:**
```bash
bash scripts/install-hub-sdk.sh
```

**What it does:**
1. Creates `.sdk-backups` directory
2. Backs up existing SDK files with timestamps
3. Attempts to download latest SDK from Hub
4. Creates CommonJS version (hub-sdk.cjs)
5. Verifies installation
6. Provides next steps

**Environment variables:**
- `HUB_SDK_URL` - Override SDK download URL (optional)

**Exit codes:**
- `0` - Installation successful
- `1` - Installation verification failed

**Example output:**
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

## 🚀 Recommended Workflow

### Initial Setup
```bash
# 1. Run installation script
bash scripts/install-hub-sdk.sh

# 2. Verify installation
node scripts/verify-hub-sdk.js

# 3. Test functionality
node scripts/test-hub-sdk.js

# 4. Start server
npm run dev
```

### Regular Verification
```bash
# Quick health check
node scripts/test-hub-sdk.js

# Comprehensive check
node scripts/verify-hub-sdk.js
```

### Updating SDK
```bash
# 1. Install update (backs up automatically)
bash scripts/install-hub-sdk.sh

# 2. Verify new version
node scripts/verify-hub-sdk.js

# 3. Test new version
node scripts/test-hub-sdk.js

# 4. Restart server
npm run dev
```

### Troubleshooting
```bash
# Run detailed verification
node scripts/verify-hub-sdk.js

# Check what the verification script finds
# It will provide specific recommendations
```

---

## 🔧 Integration with NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "hub:verify": "node scripts/verify-hub-sdk.js",
    "hub:test": "node scripts/test-hub-sdk.js",
    "hub:install": "bash scripts/install-hub-sdk.sh"
  }
}
```

Then use:
```bash
npm run hub:verify
npm run hub:test
npm run hub:install
```

---

## 🐛 Common Issues

### Script not executing
**Problem:** Permission denied  
**Solution:** 
```bash
chmod +x scripts/install-hub-sdk.sh
```

### SDK download fails
**Problem:** curl fails to download  
**Solution:** 
- Hub might not be running
- Network connectivity issue
- In development, this is normal - script will use existing files

### Verification fails
**Problem:** verify-hub-sdk.js reports errors  
**Solution:**
1. Check error messages for specific issues
2. Ensure hub-sdk.js and hub-sdk.cjs exist
3. Run install script to repair: `bash scripts/install-hub-sdk.sh`

### Test fails
**Problem:** test-hub-sdk.js can't load SDK  
**Solution:**
1. Ensure hub-sdk.cjs exists in root directory
2. Check file permissions
3. Verify file is valid JavaScript

---

## 📊 CI/CD Integration

### GitHub Actions Example
```yaml
name: Verify Hub SDK

on: [push, pull_request]

jobs:
  verify-sdk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Verify Hub SDK
        run: node scripts/verify-hub-sdk.js
      
      - name: Test Hub SDK
        run: node scripts/test-hub-sdk.js
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Verifying Hub SDK..."
node scripts/test-hub-sdk.js

if [ $? -ne 0 ]; then
  echo "Hub SDK verification failed!"
  exit 1
fi
```

---

## 📝 Script Maintenance

### Updating verify-hub-sdk.js
When adding new checks:
1. Add check to the appropriate section
2. Update `allChecks` variable if check is critical
3. Add to summary output
4. Update this README

### Updating test-hub-sdk.js
When adding new tests:
1. Add test case with descriptive output
2. Check return value
3. Update `allExportsPresent` if critical
4. Update this README

### Updating install-hub-sdk.sh
When modifying installation:
1. Test in development environment first
2. Ensure backup functionality works
3. Update version checks
4. Update this README

---

## 🔍 Script Dependencies

### verify-hub-sdk.js
- Node.js (built-in modules only)
- File system access
- Read access to: hub-sdk.js, server/index.ts, hub-config.json

### test-hub-sdk.js
- Node.js (built-in modules only)
- Ability to require hub-sdk.cjs

### install-hub-sdk.sh
- Bash shell
- curl (for downloading)
- cp, mkdir, grep (standard utilities)
- Write access to root directory

---

## 📚 Additional Documentation

For more information, see:
- **HUB_SDK_V2.3.0_INSTALLATION.md** - Complete installation guide
- **HUB_SDK_NPM_SCRIPTS.md** - NPM scripts reference
- **HUB_SDK_QUICK_REFERENCE.md** - Quick reference guide
- **HUB_SDK_IMPLEMENTATION_COMPLETE.md** - Implementation summary

---

## Kanbai & docs

### kanbai-close-completed.mjs
Mark the 24 completed Metric Market cards as **done** on the Kanbai board.
```bash
node scripts/kanbai-close-completed.mjs
```
Env: `KANBAI_URL` (default: https://people-analytics-kanban.replit.app).

### kanbai-create-blocker-cards.mjs
Create blocker cards: **[Blocked] #105** (segment dimensions) and **Align directive handling to Hub contract**.
```bash
node scripts/kanbai-create-blocker-cards.mjs
```
Env: `KANBAI_URL`, `HUB_APP_SLUG` (default: metric-market).

### republish-docs.mjs
Push `hub-docs.md` to the Hub for documentation scoring.
```bash
node scripts/republish-docs.mjs
```
Env: `HUB_API_KEY` (required).

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Verify installation | `node scripts/verify-hub-sdk.js` |
| Test functionality | `node scripts/test-hub-sdk.js` |
| Install/update SDK | `bash scripts/install-hub-sdk.sh` |
| Close completed Kanbai cards | `node scripts/kanbai-close-completed.mjs` |
| Create blocker cards | `node scripts/kanbai-create-blocker-cards.mjs` |
| Republish docs to Hub | `node scripts/republish-docs.mjs` |
| Make executable | `chmod +x scripts/install-hub-sdk.sh` |

---

**Last Updated:** 2026-02-22  
**SDK Version:** 2.3.0  
**Scripts Version:** 1.0.0
