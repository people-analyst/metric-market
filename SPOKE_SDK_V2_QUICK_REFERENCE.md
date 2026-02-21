# Spoke Cockpit SDK v2.0 — Quick Reference

## Version Info
- **Current Version**: 2.0.0
- **Release Date**: 2024
- **Status**: ✅ Installed & Operational

---

## Quick Commands

### Verification
```bash
# Check installed version
grep "COCKPIT_VERSION" spoke-cockpit-sdk.js

# Verify installation
npx tsx scripts/verify-spoke-sdk.ts

# Check server logs
npm run dev  # Look for "✓ Spoke Cockpit SDK v2.0 mounted successfully"
```

### Installation/Update
```bash
# Re-download SDK v2.0
npx tsx scripts/download-spoke-sdk.ts

# Full installation
npx tsx scripts/install-spoke-sdk.ts

# Manual download
curl -o spoke-cockpit-sdk.js "http://localhost:5000/api/sdk/cockpit/metric-market"
```

---

## SDK Configuration

### Environment Variables
```bash
# Required/Optional Configuration
export HUB_URL="http://localhost:5000"          # Hub server URL
export HUB_API_KEY=""                            # API key (if required)
export COCKPIT_INTERVAL_MS="300000"              # Collection interval (5 min)
```

### Application Constants
```javascript
APP_SLUG = "metric-market"
APP_NAME = "Metric Market"
COCKPIT_VERSION = "2.0.0"
```

---

## API Endpoints

### Dashboard
```
GET  /cockpit                    # Main cockpit dashboard
```

### Metrics API
```
POST /cockpit/api/metrics        # Record metric data
GET  /cockpit/api/metrics        # Retrieve metric snapshots
GET  /cockpit/api/status         # SDK health check
```

### Information
```
GET  /cockpit/api/version        # SDK version info
GET  /cockpit/api/intents        # List metric intents
```

---

## Integration Code

### Server Mount (server/index.ts)
```typescript
import { mountSpokeCockpit } from './spokeCockpit';

// After other SDK initialization
mountSpokeCockpit(app);
```

### Status Check (server/spokeCockpit.ts)
```typescript
import { isSpokeCockpitMounted, getSpokeCockpitStatus } from './spokeCockpit';

// Check if mounted
if (isSpokeCockpitMounted()) {
  console.log('Spoke Cockpit is ready');
}

// Get detailed status
const status = getSpokeCockpitStatus();
console.log(status);
```

---

## v2.0 Features

### New in v2.0
- ✨ Enhanced metric collection engine
- ✨ Real-time monitoring improvements
- ✨ Advanced cockpit dashboard
- ✨ Better performance tracking
- ✨ Extended metric intent support (80+)

### Retained from v1.0
- ✅ Self-contained bundle
- ✅ Express middleware integration
- ✅ Configurable intervals
- ✅ Environment variable support
- ✅ PostgreSQL integration

---

## Metric Domains

### Strategic (3 metrics)
- Workflow Completion Rate
- Data Quality Score
- Active Users (7d)

### Operational (8 metrics)
- Avg Job Runtime
- Retry Rate
- Recruiter Efficiency
- Payroll Expense per Employee
- HR Staffing Coverage
- Self-Service Penetration
- Data Freshness
- + more

### Analytical (70+ metrics)
- Talent Acquisition
- Total Rewards
- Headcount & Movement
- Leadership & Development
- Company Health
- Survey & Engagement

---

## Troubleshooting

### SDK Not Loading
```bash
# Check if file exists
ls -lh spoke-cockpit-sdk.js

# Verify version
grep COCKPIT_VERSION spoke-cockpit-sdk.js

# Re-download if needed
npx tsx scripts/download-spoke-sdk.ts
```

### Version Issues
```bash
# Current version should be 2.0.0
grep "COCKPIT_VERSION" spoke-cockpit-sdk.js

# Should output: const COCKPIT_VERSION = "2.0.0";
```

### Hub Connection
```bash
# Test hub connection
curl http://localhost:5000/api/sdk/cockpit/metric-market

# Check environment
echo $HUB_URL
echo $HUB_API_KEY
```

---

## File Locations

```
metric-market/
├── spoke-cockpit-sdk.js                    # ← SDK v2.0 file
├── server/
│   ├── index.ts                            # Server (SDK mounted here)
│   └── spokeCockpit.ts                     # Integration module
├── scripts/
│   ├── download-spoke-sdk.ts               # Download script
│   ├── install-spoke-sdk.ts                # Install script
│   └── verify-spoke-sdk.ts                 # Verify script
└── SPOKE_COCKPIT_V2_INSTALLATION.md       # Installation report
```

---

## Documentation Files

- `SPOKE_COCKPIT_SETUP.md` - Full setup guide
- `SPOKE_COCKPIT_V2_INSTALLATION.md` - Installation report (this release)
- `SPOKE_SDK_NPM_SCRIPTS.md` - NPM scripts guide
- `SPOKE_SDK_CHECKLIST.md` - Installation checklist
- `SPOKE_SDK_V2_QUICK_REFERENCE.md` - This file

---

## Support Checklist

When troubleshooting, check:
- [ ] SDK file exists: `spoke-cockpit-sdk.js`
- [ ] Version is 2.0.0: `grep COCKPIT_VERSION spoke-cockpit-sdk.js`
- [ ] Integration files exist: `server/spokeCockpit.ts`
- [ ] Server logs show successful mount
- [ ] Hub URL is correct: `echo $HUB_URL`
- [ ] Dashboard accessible: visit `/cockpit`

---

## Upgrade Notes

### v1.0 → v2.0 Changes
- ✅ **No breaking changes**
- ✅ **Backward compatible**
- ✅ **Same API surface**
- ✅ **Enhanced performance**
- ✅ **New features available**

### Migration Steps
1. Update SDK file (✅ already done)
2. Restart server
3. Verify v2.0 is running
4. No code changes needed

---

## Quick Status Check

```bash
# One-liner to check everything
if grep -q 'COCKPIT_VERSION.*"2.0.0"' spoke-cockpit-sdk.js; then 
  echo "✓ SDK v2.0 installed"; 
else 
  echo "✗ SDK v2.0 not found"; 
fi
```

Expected output: `✓ SDK v2.0 installed`

---

## NPM Scripts (Optional Add-ons)

Add to `package.json`:
```json
{
  "scripts": {
    "spoke:status": "grep COCKPIT_VERSION spoke-cockpit-sdk.js",
    "spoke:verify": "tsx scripts/verify-spoke-sdk.ts",
    "spoke:install": "tsx scripts/install-spoke-sdk.ts"
  }
}
```

---

**SDK Version**: v2.0.0  
**Status**: OPERATIONAL ✅  
**Last Updated**: 2024

For detailed documentation, see `SPOKE_COCKPIT_V2_INSTALLATION.md`
