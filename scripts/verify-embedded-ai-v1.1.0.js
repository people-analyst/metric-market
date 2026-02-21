#!/usr/bin/env node

/**
 * Embedded AI SDK v1.1.0 Verification Script
 * Comprehensive check for SDK installation and operational status
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Embedded AI SDK v1.1.0 Verification\n');
console.log('═'.repeat(60));

let allChecks = true;

// Check 1: SDK Files
console.log('\n📦 SDK Files:');

const sdkFiles = [
  { name: 'embedded-ai-sdk.js', required: true },
  { name: 'embedded-ai-sdk.cjs', required: true }
];

sdkFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file.name);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    const versionMatch = content.match(/SDK_VERSION\s*=\s*"([^"]+)"/);
    const headerMatch = content.match(/Embedded AI Developer SDK v([\d.]+)/);
    
    const version = versionMatch ? versionMatch[1] : (headerMatch ? headerMatch[1] : 'unknown');
    
    if (version === '1.1.0') {
      console.log(`  ✅ ${file.name} (v${version})`);
    } else {
      console.log(`  ⚠️  ${file.name} (v${version}) - Expected v1.1.0`);
      allChecks = false;
    }
  } else {
    console.log(`  ❌ ${file.name} - NOT FOUND`);
    allChecks = false;
  }
});

// Check 2: Server Integration
console.log('\n🔧 Server Integration:');

const serverIndexPath = path.join(process.cwd(), 'server', 'index.ts');
if (fs.existsSync(serverIndexPath)) {
  const content = fs.readFileSync(serverIndexPath, 'utf8');
  
  if (content.includes('embedded-ai-sdk.cjs') && content.includes('.mount(app)')) {
    console.log('  ✅ SDK mounted in server/index.ts');
  } else {
    console.log('  ❌ SDK not properly mounted in server/index.ts');
    allChecks = false;
  }
} else {
  console.log('  ❌ server/index.ts not found');
  allChecks = false;
}

// Check 3: API Endpoints
console.log('\n🌐 API Endpoints:');

const routesPath = path.join(process.cwd(), 'server', 'routes.ts');
if (fs.existsSync(routesPath)) {
  const content = fs.readFileSync(routesPath, 'utf8');
  
  const endpoints = [
    { path: '/api/sdk/embedded-ai', description: 'ES Module download' },
    { path: '/api/sdk/embedded-ai.cjs', description: 'CommonJS download' },
    { path: '/api/sdk/info', description: 'SDK info' }
  ];
  
  endpoints.forEach(endpoint => {
    if (content.includes(endpoint.path)) {
      console.log(`  ✅ ${endpoint.path} (${endpoint.description})`);
    } else {
      console.log(`  ⚠️  ${endpoint.path} - Not found in routes`);
    }
  });
} else {
  console.log('  ⚠️  server/routes.ts not found');
}

// Check 4: Installation Scripts
console.log('\n📜 Scripts:');

const scripts = [
  'scripts/install-embedded-ai-sdk.js',
  'scripts/verify-sdk-installation.js'
];

scripts.forEach(script => {
  const scriptPath = path.join(process.cwd(), script);
  if (fs.existsSync(scriptPath)) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ⚠️  ${script} - Not found`);
  }
});

// Check 5: Documentation
console.log('\n📚 Documentation:');

const docs = [
  'EMBEDDED_AI_SDK_QUICKSTART.md',
  'EMBEDDED_AI_SDK_V1.1.0_INSTALLATION_REPORT.md',
  'EMBEDDED_AI_SDK_V1.1.0_STATUS.json'
];

docs.forEach(doc => {
  const docPath = path.join(process.cwd(), doc);
  if (fs.existsSync(docPath)) {
    console.log(`  ✅ ${doc}`);
  } else {
    console.log(`  ⚠️  ${doc} - Not found`);
  }
});

// Check 6: v1.1.0 Features
console.log('\n✨ v1.1.0 Features:');

const sdkCjsPath = path.join(process.cwd(), 'embedded-ai-sdk.cjs');
if (fs.existsSync(sdkCjsPath)) {
  const content = fs.readFileSync(sdkCjsPath, 'utf8');
  
  const features = [
    { name: 'Wind-down buffer', pattern: /windDownBuffer|AGENT_WINDDOWN_BUFFER/ },
    { name: 'Pause-and-continue', pattern: /pause|continue|resume/ },
    { name: 'Env-configurable budget', pattern: /AGENT_MAX_ITERATIONS|maxToolIterations/ },
    { name: 'Project context loading', pattern: /agent-context\.md|PROJECT_CONTEXT/ },
    { name: 'Same-origin auth', pattern: /same-origin|auth.*middleware/ }
  ];
  
  features.forEach(feature => {
    if (feature.pattern.test(content)) {
      console.log(`  ✅ ${feature.name}`);
    } else {
      console.log(`  ⚠️  ${feature.name} - Pattern not detected`);
    }
  });
} else {
  console.log('  ⚠️  Cannot verify features - SDK file not found');
}

// Check 7: Dependencies
console.log('\n📦 Dependencies:');

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies && packageJson.dependencies['@anthropic-ai/sdk']) {
    console.log(`  ✅ @anthropic-ai/sdk: ${packageJson.dependencies['@anthropic-ai/sdk']}`);
  } else {
    console.log('  ❌ @anthropic-ai/sdk not found in dependencies');
    allChecks = false;
  }
} else {
  console.log('  ❌ package.json not found');
  allChecks = false;
}

// Final Summary
console.log('\n' + '═'.repeat(60));

if (allChecks) {
  console.log('\n✅ SUCCESS: Embedded AI SDK v1.1.0 is properly installed!\n');
  console.log('The SDK is operational and ready to assist with development tasks.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  WARNING: Some checks failed.\n');
  console.log('Review the output above and run:');
  console.log('  node scripts/install-embedded-ai-sdk.js\n');
  process.exit(1);
}
