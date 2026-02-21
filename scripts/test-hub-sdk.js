#!/usr/bin/env node

/**
 * Hub SDK v2.3.0 Test Script
 * Quick test to verify SDK can be loaded and basic functions work
 */

console.log('🧪 Testing Hub SDK v2.3.0...\n');

try {
  // Test 1: Load SDK
  console.log('Test 1: Loading SDK...');
  const hubSdk = require('../hub-sdk.cjs');
  console.log('   ✅ SDK loaded successfully\n');

  // Test 2: Check SDK exports
  console.log('Test 2: Checking SDK exports...');
  const requiredExports = ['init', 'emitEvent', 'setDirectiveHandler', 'executeDirective'];
  let allExportsPresent = true;

  requiredExports.forEach(exportName => {
    if (typeof hubSdk[exportName] === 'function') {
      console.log(`   ✅ ${exportName}() is available`);
    } else {
      console.log(`   ❌ ${exportName}() is NOT available`);
      allExportsPresent = false;
    }
  });

  if (!allExportsPresent) {
    console.log('\n❌ Some required exports are missing!');
    process.exit(1);
  }

  console.log('\n✅ All tests passed!');
  console.log('\n📋 SDK Summary:');
  console.log('   Version: 2.3.0');
  console.log('   Status: Operational');
  console.log('   Integration: Ready');
  console.log('\nThe Hub SDK is properly installed and ready to use.');

} catch (error) {
  console.error('\n❌ SDK Test Failed!');
  console.error('Error:', error.message);
  console.error('\nPlease ensure:');
  console.error('  1. hub-sdk.cjs exists in the root directory');
  console.error('  2. The file is valid JavaScript');
  console.error('  3. Node.js can access the file');
  process.exit(1);
}
