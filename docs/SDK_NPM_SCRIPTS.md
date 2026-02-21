# Embedded AI SDK - NPM Scripts

## Recommended NPM Scripts

Add these scripts to your `package.json` for convenient SDK management:

```json
{
  "scripts": {
    "sdk:install": "node scripts/install-embedded-ai-sdk.js",
    "sdk:verify": "node scripts/verify-sdk-installation.js",
    "sdk:info": "curl -s http://localhost:5000/api/sdk/info | json_pp || curl -s http://localhost:5000/api/sdk/info"
  }
}
```

## Usage

### Install SDK
Downloads and installs the latest Embedded AI SDK v1.1.0:
```bash
npm run sdk:install
```

### Verify Installation
Checks that the SDK is properly installed and operational:
```bash
npm run sdk:verify
```

### Check SDK Info
Queries the SDK metadata endpoint (requires server to be running):
```bash
npm run sdk:info
```

## Manual Commands

If you prefer not to add these to package.json, you can run them directly:

```bash
# Install
node scripts/install-embedded-ai-sdk.js

# Verify
node scripts/verify-sdk-installation.js

# Info (server must be running)
curl http://localhost:5000/api/sdk/info
```

## Integration with Existing Scripts

The SDK works alongside existing scripts:

- `npm run dev` - Starts server with SDK active
- `npm run build` - Builds project (SDK included in production)
- `npm run start` - Runs production server with SDK
- `npm run check` - TypeScript check (unaffected by SDK)

## Environment Variables

Set these in your `.env` file or shell:

```bash
AGENT_MODE=semi              # or "auto"
AGENT_MODEL=claude-sonnet-4-5
AGENT_MAX_ITERATIONS=25
AGENT_WINDDOWN_BUFFER=3
HUB_URL=http://localhost:5000
HUB_API_KEY=your-key-here    # optional
```

## CI/CD Integration

For CI/CD pipelines, you can verify SDK installation:

```bash
# In your CI script
npm run sdk:verify || echo "SDK verification failed (non-fatal)"
```

## Notes

- Scripts are safe to run multiple times
- Install script will overwrite existing SDK files
- Verify script exits with code 0 on success, 1 on failure
- Info endpoint requires the server to be running

---

**Recommendation:** Add these scripts to `package.json` for team convenience.
