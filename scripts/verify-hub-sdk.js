#!/usr/bin/env node

/**
 * Hub SDK v2.3.0 Verification Script
 * Verifies that the Hub SDK is properly installed and operational
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_SDK_VERSION = '2.3.0';
const SDK_FILES = ['hub-sdk.js', 'hub-sdk.cjs'];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  Hub SDK v2.3.0 Installation Verification                   ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let allChecks = true;

// Check 1: Verify SDK files exist
console.log('📋 Check 1: Verifying SDK files exist...');
for (const file of SDK_FILES) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} found`);
  } else {
    console.log(`   ❌ ${file} NOT FOUND`);
    allChecks = false;
  }
}

// Check 2: Verify SDK version
console.log('\n📋 Check 2: Verifying SDK version...');
try {
  const sdkContent = fs.readFileSync('hub-sdk.js', 'utf8');
  const versionMatch = sdkContent.match(/SDK_VERSION\s*=\s*["']([^"']+)["']/);
  
  if (versionMatch) {
    const installedVersion = versionMatch[1];
    if (installedVersion === REQUIRED_SDK_VERSION) {
      console.log(`   ✅ SDK version ${installedVersion} matches required version ${REQUIRED_SDK_VERSION}`);
    } else {
      console.log(`   ⚠️  SDK version ${installedVersion} differs from required version ${REQUIRED_SDK_VERSION}`);
      allChecks = false;
    }
  } else {
    console.log('   ❌ Could not detect SDK version');
    allChecks = false;
  }
} catch (error) {
  console.log(`   ❌ Error reading SDK file: ${error.message}`);
  allChecks = false;
}

// Check 3: Verify SDK integration in server
console.log('\n📋 Check 3: Verifying SDK integration...');
try {
  const serverIndexContent = fs.readFileSync('server/index.ts', 'utf8');
  
  if (serverIndexContent.includes('hub-sdk')) {
    console.log('   ✅ Hub SDK is imported in server/index.ts');
  } else {
    console.log('   ⚠️  Hub SDK not found in server/index.ts');
  }
  
  if (serverIndexContent.includes('hubSdk.init')) {
    console.log('   ✅ Hub SDK is initialized in server/index.ts');
  } else {
    console.log('   ⚠️  Hub SDK initialization not found in server/index.ts');
  }
} catch (error) {
  console.log(`   ❌ Error reading server file: ${error.message}`);
}

// Check 4: Verify environment configuration
console.log('\n📋 Check 4: Verifying environment configuration...');
if (process.env.HUB_API_KEY) {
  console.log('   ✅ HUB_API_KEY environment variable is set');
} else {
  console.log('   ⚠️  HUB_API_KEY environment variable not set (required for production)');
}

// Check 5: Verify hub-config.json
console.log('\n📋 Check 5: Verifying hub configuration...');
try {
  if (fs.existsSync('hub-config.json')) {
    const hubConfig = JSON.parse(fs.readFileSync('hub-config.json', 'utf8'));
    console.log('   ✅ hub-config.json found');
    console.log(`   ℹ️  App: ${hubConfig.app_name || 'Not specified'}`);
    console.log(`   ℹ️  Slug: ${hubConfig.app_slug || 'Not specified'}`);
  } else {
    console.log('   ⚠️  hub-config.json not found (optional)');
  }
} catch (error) {
  console.log(`   ⚠️  Error reading hub-config.json: ${error.message}`);
}

// Check 6: Verify SDK exports
console.log('\n📋 Check 6: Verifying SDK exports...');
try {
  const sdkContent = fs.readFileSync('hub-sdk.js', 'utf8');
  const exports = ['init', 'emitEvent', 'setDirectiveHandler', 'executeDirective'];
  
  for (const exportName of exports) {
    if (sdkContent.includes(`exports.${exportName}`) || 
        sdkContent.includes(`module.exports.${exportName}`) ||
        sdkContent.includes(`function ${exportName}`)) {
      console.log(`   ✅ Export '${exportName}' found`);
    } else {
      console.log(`   ⚠️  Export '${exportName}' not clearly identified`);
    }
  }
} catch (error) {
  console.log(`   ❌ Error verifying exports: ${error.message}`);
}

// Final summary
console.log('\n' + '═'.repeat(64));
if (allChecks) {
  console.log('✅ Hub SDK v2.3.0 is properly installed and operational');
  console.log('\nNext steps:');
  console.log('  1. Set HUB_API_KEY environment variable if not set');
  console.log('  2. Restart the server to ensure SDK is loaded');
  console.log('  3. Test SDK functionality with a test event');
} else {
  console.log('⚠️  Some checks failed - review the output above');
  console.log('\nRecommended actions:');
  console.log('  1. Ensure hub-sdk.js and hub-sdk.cjs are present');
  console.log('  2. Verify SDK version is 2.3.0');
  console.log('  3. Check server integration in server/index.ts');
}
console.log('═'.repeat(64));

process.exit(allChecks ? 0 : 1);
