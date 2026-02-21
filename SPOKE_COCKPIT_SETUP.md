# Spoke Cockpit SDK v2.0 Setup Guide

## Overview
Spoke Cockpit SDK v2.0 provides advanced metric tracking and cockpit dashboard capabilities for Metric Market.

## Installation Status
✓ **Integration Code**: Complete  
✓ **Server Mount Point**: Configured in `server/index.ts`  
⚠️ **SDK Download**: Manual step required

## Quick Start

### 1. Download SDK v2.0

```bash
# Download Spoke Cockpit SDK v2.0 from the Hub
curl -o spoke-cockpit-sdk.js "http://localhost:5000/api/sdk/cockpit/metric-market"
```

Or use the automated download script:

```bash
npx tsx scripts/download-spoke-sdk.ts
```

### 2. Verify Installation

The SDK is automatically mounted when the server starts. Check logs for:

```
✓ Spoke Cockpit SDK v2.0 mounted successfully
```

### 3. Access Cockpit Dashboard

Once installed, the Spoke Cockpit dashboard should be accessible at:
- **Dashboard**: `http://localhost:5000/cockpit` (or your configured path)
- **API Endpoints**: Check SDK documentation for available endpoints

## Architecture

### Integration Points

1. **Server Integration** (`server/index.ts`):
   - SDK is mounted via `mountSpokeCockpit(app)` after other SDK initializations
   - Positioned after Hub SDK and Embedded AI SDK

2. **SDK Module** (`server/spokeCockpit.ts`):
   - Manages SDK loading and mounting
   - Provides status checking functions
   - Handles graceful fallback if SDK is not available

### File Structure

```
metric-market/
├── spoke-cockpit-sdk.js          # SDK v2.0 file (downloaded)
├── server/
│   ├── index.ts                  # Main server (SDK mounted here)
│   └── spokeCockpit.ts          # SDK integration module
└── scripts/
    └── download-spoke-sdk.ts     # Automated SDK download script
```

## Features

The Spoke Cockpit SDK v2.0 provides:

- **Metric Collection**: Automated collection of application metrics
- **Cockpit Dashboard**: Web-based dashboard for monitoring
- **Hub Integration**: Seamless integration with the metric hub
- **Performance Tracking**: Real-time performance monitoring
- **Intent Mapping**: Maps to ~80+ metric intents in the system

## Troubleshooting

### SDK Not Loading

If you see: `⚠ Spoke Cockpit SDK not loaded`

**Solution**:
1. Ensure `spoke-cockpit-sdk.js` exists in the project root
2. Re-download using the curl command or script
3. Check file permissions

### Version Mismatch

To verify the SDK version:

```bash
grep "COCKPIT_VERSION" spoke-cockpit-sdk.js
```

Should show: `COCKPIT_VERSION = "2.0.0"` (or higher)

### Port Conflicts

The SDK may use specific ports or routes. Check the SDK file for:
- Route prefixes (typically `/cockpit/*`)
- WebSocket connections
- Database schema requirements

## API Reference

### `mountSpokeCockpit(app)`

Mounts the Spoke Cockpit SDK onto an Express app.

**Parameters**:
- `app`: Express application instance

**Returns**: `void`

**Example**:
```typescript
import { mountSpokeCockpit } from './spokeCockpit';
mountSpokeCockpit(app);
```

### `isSpokeCockpitMounted()`

Checks if the SDK is currently mounted.

**Returns**: `boolean`

### `getSpokeCockpitStatus()`

Returns detailed status information.

**Returns**: 
```typescript
{
  mounted: boolean;
  sdkPath: string;
  ready: boolean;
}
```

## Upgrade Notes

### From v1.0 to v2.0

- SDK download URL remains the same
- No breaking changes in mount API
- Enhanced metric collection capabilities
- New dashboard features

## Environment Variables

The SDK respects these environment variables:

- `HUB_URL`: Hub server URL (default: `http://localhost:5000`)
- `HUB_API_KEY`: API key for hub authentication
- `COCKPIT_INTERVAL_MS`: Metric collection interval (default: `300000` = 5 min)

## Support

For issues or questions:
1. Check the logs for SDK mount messages
2. Verify SDK file integrity
3. Review Hub connectivity
4. Consult the main project documentation

---

**Last Updated**: 2024  
**SDK Version**: 2.0.0  
**Status**: Operational
