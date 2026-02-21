#!/usr/bin/env node
/**
 * Verify Embedded AI Developer SDK v1.1.0 Installation
 * Checks that the SDK is properly installed and operational
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const REQUIRED_VERSION = '1.1.0';

console.log('🔍 Verifying Embedded AI Developer SDK Installation\n');

let allChecks = true;

// Check 1: SDK Files Exist
console.log('📋 Check 1: SDK Files');
const jsPath = path.join(PROJECT_ROOT, 'embedded-ai-sdk.js');
const cjsPath = path.join(PROJECT_ROOT, 'embedded-ai-sdk.cjs');

if (fs.existsSync(jsPath)) {
  console.log('   ✅ embedded-ai-sdk.js exists');
} else {
  console.log('   ❌ embedded-ai-sdk.js NOT FOUND');
  allChecks = false;
}

if (fs.existsSync(cjsPath)) {
  console.log('   ✅ embedded-ai-sdk.cjs exists');
} else {
  console.log('   ⚠️  embedded-ai-sdk.cjs not found (optional)');
}

// Check 2: SDK Version
console.log('\n📋 Check 2: SDK Version');
try {
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  const versionMatch = jsContent.match(/SDK v(\d+\.\d+\.\d+)/);
  
  if (versionMatch && versionMatch[1] === REQUIRED_VERSION) {
    console.log('   ✅ Version: v' + versionMatch[1]);
  } else if (versionMatch) {
    console.log('   ⚠️  Version mismatch: found v' + versionMatch[1] + ', expected v' + REQUIRED_VERSION);
    allChecks = false;
  } else {
    console.log('   ❌ Could not detect SDK version');
    allChecks = false;
  }
} catch (err) {
  console.log('   ❌ Could not read SDK file:', err.message);
  allChecks = false;
}

// Check 3: Server Integration
console.log('\n📋 Check 3: Server Integration');
const serverIndexPath = path.join(PROJECT_ROOT, 'server', 'index.ts');
try {
  const serverContent = fs.readFileSync(serverIndexPath, 'utf-8');
  
  if (serverContent.includes('embedded-ai-sdk.cjs')) {
    console.log('   ✅ SDK imported in server/index.ts');
  } else {
    console.log('   ❌ SDK not imported in server/index.ts');
    allChecks = false;
  }
  
  if (serverContent.includes('embeddedAiSdk.mount(app)')) {
    console.log('   ✅ SDK mounted in Express app');
  } else {
    console.log('   ❌ SDK not mounted in Express app');
    allChecks = false;
  }
} catch (err) {
  console.log('   ❌ Could not read server/index.ts:', err.message);
  allChecks = false;
}

// Check 4: API Routes
console.log('\n📋 Check 4: SDK Distribution API Routes');
const routesPath = path.join(PROJECT_ROOT, 'server', 'routes.ts');
try {
  const routesContent = fs.readFileSync(routesPath, 'utf-8');
  
  if (routesContent.includes('/api/sdk/embedded-ai')) {
    console.log('   ✅ SDK distribution endpoint configured');
  } else {
    console.log('   ⚠️  SDK distribution endpoint not configured');
  }
  
  if (routesContent.includes('/api/sdk/info')) {
    console.log('   ✅ SDK info endpoint configured');
  } else {
    console.log('   ⚠️  SDK info endpoint not configured');
  }
} catch (err) {
  console.log('   ❌ Could not read server/routes.ts:', err.message);
}

// Check 5: SDK Features (v1.1.0 specific)
console.log('\n📋 Check 5: SDK v1.1.0 Features');
try {
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  
  const features = [
    { name: 'Wind-down buffer', pattern: /windDownBuffer/i },
    { name: 'Pause-and-continue', pattern: /pause.*continue/i },
    { name: 'Env-configurable budget', pattern: /AGENT_MAX_ITERATIONS/i },
    { name: 'Project context loading', pattern: /projectContext|agent-context\.md/i },
    { name: 'Same-origin auth middleware', pattern: /same.*origin.*auth|auth.*middleware/i }
  ];
  
  for (const feature of features) {
    if (feature.pattern.test(jsContent)) {
      console.log('   ✅ ' + feature.name);
    } else {
      console.log('   ⚠️  ' + feature.name + ' (not detected)');
    }
  }
} catch (err) {
  console.log('   ❌ Could not verify features:', err.message);
}

// Check 6: Configuration
console.log('\n📋 Check 6: SDK Configuration');
try {
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  
  if (jsContent.includes('metric-market')) {
    console.log('   ✅ Configured for Metric Market');
  } else {
    console.log('   ⚠️  App configuration not detected');
  }
} catch (err) {
  console.log('   ❌ Could not verify configuration:', err.message);
}

// Summary
console.log('\n' + '='.repeat(50));
if (allChecks) {
  console.log('✅ SUCCESS: SDK v' + REQUIRED_VERSION + ' is properly installed and operational!');
  console.log('\n📝 Next Steps:');
  console.log('   - Restart the server to activate the SDK');
  console.log('   - Check /api/sdk/info for SDK status');
  console.log('   - Monitor logs for SDK agent activity');
  process.exit(0);
} else {
  console.log('⚠️  WARNING: Some installation checks failed');
  console.log('\n📝 Recommended Actions:');
  console.log('   1. Run: node scripts/install-embedded-ai-sdk.js');
  console.log('   2. Verify server integration in server/index.ts');
  console.log('   3. Re-run this verification script');
  process.exit(1);
}
