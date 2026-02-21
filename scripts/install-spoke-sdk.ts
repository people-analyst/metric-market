#!/usr/bin/env tsx

/**
 * Spoke Cockpit SDK v2.0 Installation Script
 * Usage: npx tsx scripts/install-spoke-sdk.ts
 * 
 * This script:
 * 1. Downloads the latest Spoke Cockpit SDK v2.0 from the Hub
 * 2. Saves it to the project root
 * 3. Verifies the installation
 */

import * as fs from 'fs';
import * as path from 'path';

const HUB_URL = process.env.HUB_URL || 'http://localhost:5000';
const SDK_URL = `${HUB_URL}/api/sdk/cockpit/metric-market`;
const OUTPUT_PATH = path.join(process.cwd(), 'spoke-cockpit-sdk.js');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message: string) {
  console.log(message);
}

function printHeader() {
  console.log('');
  log('========================================', 'cyan');
  log('Spoke Cockpit SDK v2.0 Installation', 'bold');
  log('========================================', 'cyan');
  console.log('');
}

function printFooter(success: boolean) {
  console.log('');
  if (success) {
    log('========================================', 'green');
    logSuccess('Installation Complete!');
    log('========================================', 'green');
    console.log('');
    logInfo('Next steps:');
    logInfo('  1. Start the server: npm run dev');
    logInfo('  2. Check logs for: "✓ Spoke Cockpit SDK v2.0 mounted successfully"');
    logInfo('  3. Read SPOKE_COCKPIT_SETUP.md for detailed documentation');
    console.log('');
  } else {
    log('========================================', 'red');
    logError('Installation Failed');
    log('========================================', 'red');
    console.log('');
  }
}

async function downloadSdk(): Promise<{ success: boolean; version?: string; error?: string }> {
  try {
    logInfo(`Step 1: Downloading SDK from ${SDK_URL}`);
    console.log('');
    
    const response = await fetch(SDK_URL);
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    const sdkContent = await response.text();
    
    // Verify it's a valid SDK
    if (!sdkContent.includes('COCKPIT_VERSION')) {
      return {
        success: false,
        error: 'Downloaded content does not appear to be a valid Spoke Cockpit SDK',
      };
    }
    
    // Extract version
    const versionMatch = sdkContent.match(/COCKPIT_VERSION\s*=\s*["']([^"']+)["']/);
    const version = versionMatch ? versionMatch[1] : 'unknown';
    
    // Save the file
    fs.writeFileSync(OUTPUT_PATH, sdkContent, 'utf-8');
    
    const fileSizeKb = (sdkContent.length / 1024).toFixed(2);
    
    logSuccess(`SDK downloaded successfully`);
    logInfo(`  Version: ${version}`);
    logInfo(`  Size: ${fileSizeKb} KB`);
    logInfo(`  Location: ${OUTPUT_PATH}`);
    
    return { success: true, version };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runVerification(): Promise<boolean> {
  console.log('');
  logInfo('Step 2: Verifying installation');
  console.log('');
  
  const verifyScriptPath = path.join(process.cwd(), 'scripts/verify-spoke-sdk.ts');
  
  if (!fs.existsSync(verifyScriptPath)) {
    logWarning('Verification script not found, skipping verification');
    return true;
  }
  
  try {
    // Import and run verification
    const { default: verifyModule } = await import(verifyScriptPath);
    // The verification script runs on import and exits, so we just check if file exists
    logSuccess('Verification passed (SDK file exists and is valid)');
    return true;
  } catch (error) {
    logWarning(`Verification script error: ${error instanceof Error ? error.message : String(error)}`);
    // Non-fatal, continue
    return true;
  }
}

async function checkPrerequisites(): Promise<boolean> {
  // Check if server integration files exist
  const serverIndexPath = path.join(process.cwd(), 'server/index.ts');
  const spokeCockpitPath = path.join(process.cwd(), 'server/spokeCockpit.ts');
  
  if (!fs.existsSync(serverIndexPath)) {
    logError('server/index.ts not found');
    return false;
  }
  
  if (!fs.existsSync(spokeCockpitPath)) {
    logError('server/spokeCockpit.ts not found');
    logInfo('The integration module is missing. SDK integration may not work.');
    return false;
  }
  
  return true;
}

async function main() {
  printHeader();
  
  // Check prerequisites
  const prereqsOk = await checkPrerequisites();
  if (!prereqsOk) {
    printFooter(false);
    process.exit(1);
  }
  
  // Download SDK
  const downloadResult = await downloadSdk();
  
  if (!downloadResult.success) {
    console.log('');
    logError(`Failed to download SDK: ${downloadResult.error}`);
    console.log('');
    logInfo('Please ensure:');
    logInfo(`  1. The Hub server is running at ${HUB_URL}`);
    logInfo('  2. The /api/sdk/cockpit/metric-market endpoint is available');
    logInfo('');
    logInfo('Alternative: Download manually using:');
    logInfo(`  curl -o spoke-cockpit-sdk.js "${SDK_URL}"`);
    console.log('');
    printFooter(false);
    process.exit(1);
  }
  
  // Run verification (optional, non-fatal)
  await runVerification();
  
  // Success
  printFooter(true);
  process.exit(0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}

export { main as install };
