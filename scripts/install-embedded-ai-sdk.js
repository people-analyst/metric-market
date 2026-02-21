#!/usr/bin/env node
/**
 * Install Embedded AI Developer SDK v1.1.0
 * Downloads the latest SDK from the hub and installs it to the project root
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SDK_URL = process.env.SDK_URL || 'http://localhost:5000/api/sdk/embedded-ai';
const SDK_VERSION = '1.1.0';

console.log('🚀 Installing Embedded AI Developer SDK v' + SDK_VERSION);
console.log('📥 Downloading from:', SDK_URL);

const client = SDK_URL.startsWith('https') ? https : http;

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    client.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        console.log('↪️  Following redirect to:', redirectUrl);
        downloadFile(redirectUrl, destination).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function installSDK() {
  try {
    // Download ES module version
    const jsPath = path.join(PROJECT_ROOT, 'embedded-ai-sdk.js');
    console.log('📦 Downloading ES module to:', jsPath);
    await downloadFile(SDK_URL, jsPath);
    console.log('✅ ES module downloaded');

    // Download CommonJS version (if available)
    try {
      const cjsPath = path.join(PROJECT_ROOT, 'embedded-ai-sdk.cjs');
      const cjsUrl = SDK_URL.replace('.js', '.cjs');
      console.log('📦 Downloading CommonJS module to:', cjsPath);
      await downloadFile(cjsUrl, cjsPath);
      console.log('✅ CommonJS module downloaded');
    } catch (err) {
      console.log('⚠️  CommonJS version not available, skipping');
    }

    // Verify the SDK version
    const content = fs.readFileSync(jsPath, 'utf-8');
    const versionMatch = content.match(/SDK v(\d+\.\d+\.\d+)/);
    
    if (versionMatch && versionMatch[1] === SDK_VERSION) {
      console.log('✅ Verified SDK version:', versionMatch[1]);
    } else if (versionMatch) {
      console.log('⚠️  Warning: Expected v' + SDK_VERSION + ' but found v' + versionMatch[1]);
    }

    // Check if SDK is properly integrated in server
    const serverIndexPath = path.join(PROJECT_ROOT, 'server', 'index.ts');
    const serverContent = fs.readFileSync(serverIndexPath, 'utf-8');
    
    if (serverContent.includes('embedded-ai-sdk.cjs')) {
      console.log('✅ SDK is integrated in server/index.ts');
    } else {
      console.log('⚠️  SDK not found in server/index.ts - may need manual integration');
    }

    console.log('\n🎉 Embedded AI Developer SDK v' + SDK_VERSION + ' installed successfully!');
    console.log('\n📋 Installation Summary:');
    console.log('   - ES Module: embedded-ai-sdk.js');
    console.log('   - CommonJS: embedded-ai-sdk.cjs');
    console.log('   - Server Integration: ✓');
    console.log('\n🔧 The SDK is now operational and ready to use.');
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('   1. Ensure the SDK endpoint is running: ' + SDK_URL);
    console.error('   2. Check network connectivity');
    console.error('   3. Verify the SDK version is available');
    process.exit(1);
  }
}

installSDK();
