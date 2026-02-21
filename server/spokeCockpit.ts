/**
 * Spoke Cockpit SDK Integration
 * Manages the Spoke Cockpit SDK v2.0 for Metric Market
 */

import { createRequire } from "node:module";
import type { Express } from "express";
import { log } from "./vite";

let spokeCockpitMounted = false;

/**
 * Mount Spoke Cockpit SDK v2.0 onto the Express app
 * The SDK provides metric tracking and cockpit dashboard capabilities
 */
export function mountSpokeCockpit(app: Express): void {
  try {
    const _require = createRequire(import.meta.url);
    const spokeCockpitSdk = _require("../spoke-cockpit-sdk.js");
    
    // Check if the SDK has a mount function
    if (typeof spokeCockpitSdk.mount === 'function') {
      spokeCockpitSdk.mount(app);
      spokeCockpitMounted = true;
      
      // Extract version info if available
      const version = spokeCockpitSdk.COCKPIT_VERSION || spokeCockpitSdk.version || 'unknown';
      log(`✓ Spoke Cockpit SDK v${version} mounted successfully`);
    } else {
      log('⚠ Spoke Cockpit SDK loaded but no mount function found');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`⚠ Spoke Cockpit SDK not loaded: ${errorMessage}`);
    log('  To install: npm run spoke:install or download from hub');
  }
}

/**
 * Check if Spoke Cockpit SDK is currently mounted
 */
export function isSpokeCockpitMounted(): boolean {
  return spokeCockpitMounted;
}

/**
 * Get Spoke Cockpit SDK status information
 */
export function getSpokeCockpitStatus() {
  return {
    mounted: spokeCockpitMounted,
    sdkPath: '../spoke-cockpit-sdk.js',
    ready: spokeCockpitMounted,
  };
}
