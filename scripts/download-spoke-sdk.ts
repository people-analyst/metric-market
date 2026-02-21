#!/usr/bin/env tsx

/**
 * Download Spoke Cockpit SDK v2.0
 * Usage: tsx scripts/download-spoke-sdk.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const HUB_URL = process.env.HUB_URL || 'http://localhost:5000';
const SDK_URL = `${HUB_URL}/api/sdk/cockpit/metric-market`;
const OUTPUT_PATH = path.join(process.cwd(), 'spoke-cockpit-sdk.js');

async function downloadSdk() {
  try {
    console.log(`Downloading Spoke Cockpit SDK from ${SDK_URL}...`);
    
    const response = await fetch(SDK_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to download SDK: ${response.status} ${response.statusText}`);
    }
    
    const sdkContent = await response.text();
    
    // Verify it's a valid SDK by checking for version
    if (!sdkContent.includes('COCKPIT_VERSION')) {
      throw new Error('Downloaded content does not appear to be a valid Spoke Cockpit SDK');
    }
    
    // Extract version from the SDK
    const versionMatch = sdkContent.match(/COCKPIT_VERSION\s*=\s*["']([^"']+)["']/);
    const version = versionMatch ? versionMatch[1] : 'unknown';
    
    fs.writeFileSync(OUTPUT_PATH, sdkContent, 'utf-8');
    
    console.log(`✓ Successfully downloaded Spoke Cockpit SDK v${version}`);
    console.log(`✓ Saved to: ${OUTPUT_PATH}`);
    console.log(`✓ File size: ${(sdkContent.length / 1024).toFixed(2)} KB`);
    
    return version;
  } catch (error) {
    console.error('✗ Failed to download Spoke Cockpit SDK:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadSdk().catch(() => process.exit(1));
}

export { downloadSdk };
