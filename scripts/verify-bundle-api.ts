#!/usr/bin/env ts-node
/**
 * Verification script for Card Bundle Discovery API
 * Run with: npx ts-node scripts/verify-bundle-api.ts
 */

import { createBundleClient } from '../shared/bundle-api-types';

async function verifyBundleAPI() {
  console.log('🔍 Verifying Card Bundle Discovery API...\n');

  const baseUrl = process.env.API_URL || 'http://localhost:5000/api';
  const client = createBundleClient(baseUrl);

  try {
    // Test 1: Fetch all bundles
    console.log('Test 1: GET /api/bundles');
    const bundles = await client.getAllBundles();
    console.log(`✅ Retrieved ${bundles.length} bundles\n`);

    if (bundles.length === 0) {
      console.log('⚠️  No bundles found. Run seedBundles() to populate.');
      return;
    }

    // Test 2: Verify schema fields
    console.log('Test 2: Verify schema fields on first bundle');
    const firstBundle = bundles[0];
    console.log(`Bundle: ${firstBundle.displayName} (${firstBundle.key})`);
    
    const hasDataSchema = firstBundle.dataSchema && typeof firstBundle.dataSchema === 'object';
    const hasConfigSchema = firstBundle.configSchema && typeof firstBundle.configSchema === 'object';
    const hasOutputSchema = firstBundle.outputSchema && typeof firstBundle.outputSchema === 'object';
    
    console.log(`  dataSchema: ${hasDataSchema ? '✅' : '❌'}`);
    console.log(`  configSchema: ${hasConfigSchema ? '✅' : '❌'}`);
    console.log(`  outputSchema: ${hasOutputSchema ? '✅' : '❌'}`);
    
    if (!hasDataSchema || !hasConfigSchema || !hasOutputSchema) {
      console.error('\n❌ Bundle missing required schemas!');
      return;
    }
    console.log();

    // Test 3: Get bundle by key
    console.log('Test 3: GET /api/bundles/key/:key');
    const bundleByKey = await client.getBundleByKey(firstBundle.key);
    console.log(`✅ Retrieved bundle by key: ${bundleByKey.displayName}\n`);

    // Test 4: List categories
    console.log('Test 4: List all categories');
    const categories = await client.getCategories();
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(cat => console.log(`  - ${cat}`));
    console.log();

    // Test 5: List tags
    console.log('Test 5: List all tags');
    const tags = await client.getTags();
    console.log(`✅ Found ${tags.length} unique tags:`);
    console.log(`  ${tags.slice(0, 10).join(', ')}${tags.length > 10 ? '...' : ''}\n`);

    // Test 6: Filter by category
    if (categories.length > 0) {
      console.log(`Test 6: Filter by category "${categories[0]}"`);
      const categoryBundles = await client.getBundlesByCategory(categories[0]);
      console.log(`✅ Found ${categoryBundles.length} bundles in category\n`);
    }

    // Test 7: Sample bundle details
    console.log('Test 7: Display sample bundle details');
    console.log('─'.repeat(60));
    console.log(`Bundle: ${firstBundle.displayName}`);
    console.log(`Key: ${firstBundle.key}`);
    console.log(`Type: ${firstBundle.chartType}`);
    console.log(`Category: ${firstBundle.category || 'N/A'}`);
    console.log(`Version: ${firstBundle.version}`);
    console.log(`Description: ${firstBundle.description}`);
    console.log(`\nData Schema (excerpt):`);
    console.log(JSON.stringify(firstBundle.dataSchema, null, 2).slice(0, 300) + '...');
    console.log(`\nConfig Schema (excerpt):`);
    console.log(JSON.stringify(firstBundle.configSchema, null, 2).slice(0, 300) + '...');
    console.log('─'.repeat(60));
    console.log();

    // Summary
    console.log('✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log(`  Total Bundles: ${bundles.length}`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Tags: ${tags.length}`);
    console.log('\n🎉 Card Bundle Discovery API is working correctly!');

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    process.exit(1);
  }
}

// Run verification
verifyBundleAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
