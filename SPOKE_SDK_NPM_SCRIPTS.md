# Recommended NPM Scripts for Spoke Cockpit SDK

Add these scripts to `package.json` for convenient SDK management:

```json
{
  "scripts": {
    "spoke:install": "tsx scripts/install-spoke-sdk.ts",
    "spoke:download": "tsx scripts/download-spoke-sdk.ts",
    "spoke:verify": "tsx scripts/verify-spoke-sdk.ts",
    "spoke:status": "grep COCKPIT_VERSION spoke-cockpit-sdk.js || echo 'SDK not installed'"
  }
}
```

## Usage

After adding these scripts to package.json:

```bash
# Install/update Spoke Cockpit SDK v2.0
npm run spoke:install

# Download SDK only (no verification)
npm run spoke:download

# Verify SDK installation
npm run spoke:verify

# Check installed SDK version
npm run spoke:status
```

## Manual Installation (Alternative)

If you prefer not to add npm scripts, use directly:

```bash
npx tsx scripts/install-spoke-sdk.ts
npx tsx scripts/verify-spoke-sdk.ts
```

## Shell Script (Alternative)

```bash
bash scripts/install-spoke-sdk.sh
```

---

**Note**: The recommended approach is to add these scripts to package.json for team convenience.
