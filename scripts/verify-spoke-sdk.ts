#!/usr/bin/env tsx

/**
 * Verify Spoke Cockpit SDK Installation
 * Usage: tsx scripts/verify-spoke-sdk.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SDK_PATH = path.join(process.cwd(), 'spoke-cockpit-sdk.js');
const SERVER_INDEX_PATH = path.join(process.cwd(), 'server/index.ts');
const SPOKE_MODULE_PATH = path.join(process.cwd(), 'server/spokeCockpit.ts');

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

function check(name: string, condition: boolean, successMsg: string, failMsg: string, details?: string) {
  results.push({
    passed: condition,
    message: condition ? successMsg : failMsg,
    details,
  });
}

function printResults() {
  console.log('\n=== Spoke Cockpit SDK Verification ===\n');
  
  let allPassed = true;
  
  results.forEach((result, index) => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${icon}${reset} ${result.message}`);
    if (result.details) {
      console.log(`  ${result.details}`);
    }
    
    if (!result.passed) {
      allPassed = false;
    }
  });
  
  console.log('\n' + '='.repeat(40));
  
  if (allPassed) {
    console.log('✓ All checks passed! Spoke Cockpit SDK is properly installed.\n');
    return 0;
  } else {
    console.log('✗ Some checks failed. See details above.\n');
    console.log('To fix:');
    console.log('  1. Download SDK: npx tsx scripts/download-spoke-sdk.ts');
    console.log('  2. Or manually: curl -o spoke-cockpit-sdk.js "http://localhost:5000/api/sdk/cockpit/metric-market"\n');
    return 1;
  }
}

// Check 1: SDK file exists
const sdkExists = fs.existsSync(SDK_PATH);
check(
  'SDK File',
  sdkExists,
  'SDK file found at project root',
  'SDK file NOT found at project root',
  sdkExists ? `Location: ${SDK_PATH}` : 'Expected location: spoke-cockpit-sdk.js'
);

// Check 2: SDK file is valid JavaScript
if (sdkExists) {
  try {
    const sdkContent = fs.readFileSync(SDK_PATH, 'utf-8');
    const hasVersion = sdkContent.includes('COCKPIT_VERSION');
    const hasMount = sdkContent.includes('mount') || sdkContent.includes('function');
    
    check(
      'SDK Content',
      hasVersion && hasMount,
      'SDK file appears to be valid',
      'SDK file may be corrupted or incomplete',
      hasVersion ? undefined : 'Missing COCKPIT_VERSION constant'
    );
    
    // Extract version
    if (hasVersion) {
      const versionMatch = sdkContent.match(/COCKPIT_VERSION\s*=\s*["']([^"']+)["']/);
      const version = versionMatch ? versionMatch[1] : 'unknown';
      
      check(
        'SDK Version',
        true,
        `Detected SDK version: ${version}`,
        'Could not detect SDK version'
      );
      
      const isV2 = version.startsWith('2.');
      check(
        'Version Check',
        isV2,
        'SDK v2.0+ detected (correct version)',
        `SDK version ${version} detected (expected v2.0+)`,
        isV2 ? undefined : 'Please download the latest v2.0 SDK'
      );
    }
    
    // Check file size (should be non-trivial)
    const fileSizeKb = (sdkContent.length / 1024).toFixed(2);
    const hasContent = sdkContent.length > 1000;
    check(
      'SDK Size',
      hasContent,
      `SDK file size: ${fileSizeKb} KB`,
      'SDK file is too small (may be incomplete)',
      hasContent ? undefined : 'Re-download the SDK'
    );
  } catch (error) {
    check(
      'SDK Read',
      false,
      'SDK file is readable',
      'Cannot read SDK file',
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Check 3: Integration module exists
const moduleExists = fs.existsSync(SPOKE_MODULE_PATH);
check(
  'Integration Module',
  moduleExists,
  'spokeCockpit.ts module exists',
  'spokeCockpit.ts module NOT found',
  moduleExists ? `Location: ${SPOKE_MODULE_PATH}` : undefined
);

// Check 4: Server integration
if (fs.existsSync(SERVER_INDEX_PATH)) {
  const serverContent = fs.readFileSync(SERVER_INDEX_PATH, 'utf-8');
  const hasImport = serverContent.includes('mountSpokeCockpit');
  const hasMount = serverContent.includes('mountSpokeCockpit(app)');
  
  check(
    'Server Import',
    hasImport,
    'Server imports mountSpokeCockpit',
    'Server does NOT import mountSpokeCockpit',
    hasImport ? undefined : 'Add: import { mountSpokeCockpit } from "./spokeCockpit";'
  );
  
  check(
    'Server Mount',
    hasMount,
    'Server calls mountSpokeCockpit(app)',
    'Server does NOT call mountSpokeCockpit(app)',
    hasMount ? undefined : 'Add: mountSpokeCockpit(app);'
  );
}

// Check 5: Documentation
const docsExist = fs.existsSync(path.join(process.cwd(), 'SPOKE_COCKPIT_SETUP.md'));
check(
  'Documentation',
  docsExist,
  'Setup documentation available',
  'Setup documentation NOT found'
);

const exitCode = printResults();
process.exit(exitCode);
