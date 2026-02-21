# Spoke Cockpit SDK v2.0 Installation Checklist

## Pre-Installation

- [x] Hub server is running at `http://localhost:5000` (or configured URL)
- [x] Database is accessible and configured
- [x] Project dependencies are installed (`npm install`)

## Installation Steps

### 1. Download SDK
- [x] Run: `npx tsx scripts/install-spoke-sdk.ts`
- [x] OR manually: `curl -o spoke-cockpit-sdk.js "http://localhost:5000/api/sdk/cockpit/metric-market"`
- [x] Verify file exists: `ls -lh spoke-cockpit-sdk.js`

### 2. Verify Installation
- [x] Run: `npx tsx scripts/verify-spoke-sdk.ts`
- [x] All checks pass with ✓ marks
- [x] SDK version is 2.0 or higher

### 3. Review Integration
- [ ] File exists: `server/spokeCockpit.ts`
- [ ] File contains: `mountSpokeCockpit` function
- [ ] `server/index.ts` imports: `import { mountSpokeCockpit } from "./spokeCockpit"`
- [ ] `server/index.ts` calls: `mountSpokeCockpit(app)`

### 4. Start Server
- [ ] Run: `npm run dev`
- [ ] Server starts without errors
- [ ] Log shows: `✓ Spoke Cockpit SDK v2.0 mounted successfully`
- [ ] No warning messages about SDK

### 5. Test Endpoints
- [ ] Server health check: `curl http://localhost:5000/health`
- [ ] API health check: `curl http://localhost:5000/api/health`
- [ ] Cockpit status (if exposed): `curl http://localhost:5000/cockpit/status`

## Post-Installation

### Documentation Review
- [ ] Read: `SPOKE_COCKPIT_SETUP.md`
- [ ] Read: `docs/spoke-cockpit-integration.md`
- [ ] Bookmark for future reference

### Optional: Add NPM Scripts
- [ ] Review: `SPOKE_SDK_NPM_SCRIPTS.md`
- [ ] Add recommended scripts to `package.json`
- [ ] Test: `npm run spoke:verify`

### Environment Variables
- [ ] Set `HUB_URL` (if different from default)
- [ ] Set `HUB_API_KEY` (if required)
- [ ] Set `COCKPIT_INTERVAL_MS` (if custom interval needed)

## Verification Checklist

### SDK File
- [ ] File: `spoke-cockpit-sdk.js` exists in project root
- [ ] Size: > 1 KB (should be ~5-50 KB)
- [ ] Contains: `COCKPIT_VERSION`
- [ ] Contains: `mount` function
- [ ] Version: 2.0 or higher

### Integration Files
- [ ] File: `server/spokeCockpit.ts` exists
- [ ] File: `server/index.ts` imports spokeCockpit module
- [ ] Mount call: `mountSpokeCockpit(app)` present in server startup

### Runtime
- [ ] Server starts successfully
- [ ] No SDK-related errors in logs
- [ ] Success message in logs
- [ ] Hub connection established (if applicable)

## Troubleshooting Reference

If any checks fail, refer to:
- `SPOKE_COCKPIT_SETUP.md` - Setup guide with troubleshooting
- `docs/spoke-cockpit-integration.md` - Integration details and debugging
- Server logs - Check for specific error messages
- Verification script output - Run `npx tsx scripts/verify-spoke-sdk.ts`

## Common Issues

### ✗ SDK Not Found
**Solution**: Run `npx tsx scripts/install-spoke-sdk.ts`

### ✗ Version Mismatch
**Solution**: Delete old SDK and re-download: `rm spoke-cockpit-sdk.js && npx tsx scripts/install-spoke-sdk.ts`

### ✗ Hub Connection Failed
**Solution**: Verify hub is running: `curl http://localhost:5000/health`

### ✗ Mount Function Not Called
**Solution**: Check `server/index.ts` for `mountSpokeCockpit(app)` call

## Sign-Off

Installation completed by: ________________  
Date: ________________  
SDK Version: ________________  
Status: ☐ Successful  ☐ Issues (see notes)  

Notes:
_____________________________________________
_____________________________________________
_____________________________________________

---

**Checklist Version**: 1.0  
**For SDK Version**: 2.0+  
**Last Updated**: 2024
