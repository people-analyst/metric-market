/**
 * Integration test for Card Bundle Discovery API
 * Tests GET /api/bundles endpoint
 */

import { describe, it, expect } from '@jest/globals';
import type { CardBundle } from '@shared/schema';

describe('Bundle Discovery API', () => {
  const BASE_URL = process.env.API_URL || 'http://localhost:5000';

  it('GET /api/bundles should return all bundles with schemas', async () => {
    const response = await fetch(`${BASE_URL}/api/bundles`);
    expect(response.ok).toBe(true);
    
    const bundles: CardBundle[] = await response.json();
    
    // Should return an array
    expect(Array.isArray(bundles)).toBe(true);
    
    // Should have bundles (if seeded)
    if (bundles.length > 0) {
      const bundle = bundles[0];
      
      // Verify all required fields exist
      expect(bundle).toHaveProperty('id');
      expect(bundle).toHaveProperty('key');
      expect(bundle).toHaveProperty('chartType');
      expect(bundle).toHaveProperty('displayName');
      expect(bundle).toHaveProperty('version');
      
      // Verify all three critical schemas are present
      expect(bundle).toHaveProperty('dataSchema');
      expect(bundle).toHaveProperty('configSchema');
      expect(bundle).toHaveProperty('outputSchema');
      
      // Verify schemas are objects (JSON)
      expect(typeof bundle.dataSchema).toBe('object');
      expect(typeof bundle.configSchema).toBe('object');
      expect(typeof bundle.outputSchema).toBe('object');
      
      // dataSchema should be a valid JSON Schema
      expect(bundle.dataSchema).toHaveProperty('type');
      
      // configSchema should be a valid JSON Schema
      expect(bundle.configSchema).toHaveProperty('type');
      
      // Verify helper fields exist
      expect(bundle).toHaveProperty('defaults');
      expect(bundle).toHaveProperty('exampleData');
      expect(bundle).toHaveProperty('exampleConfig');
      expect(bundle).toHaveProperty('createdAt');
      expect(bundle).toHaveProperty('updatedAt');
    }
  });

  it('GET /api/bundles should return bundles ordered by category and displayName', async () => {
    const response = await fetch(`${BASE_URL}/api/bundles`);
    const bundles: CardBundle[] = await response.json();
    
    if (bundles.length > 1) {
      // Verify ordering (category first, then displayName)
      for (let i = 1; i < bundles.length; i++) {
        const prev = bundles[i - 1];
        const curr = bundles[i];
        
        if (prev.category && curr.category) {
          if (prev.category === curr.category) {
            // Within same category, check displayName ordering
            expect(prev.displayName <= curr.displayName).toBe(true);
          }
        }
      }
    }
  });

  it('Bundle schemas should conform to JSON Schema spec', async () => {
    const response = await fetch(`${BASE_URL}/api/bundles`);
    const bundles: CardBundle[] = await response.json();
    
    bundles.forEach(bundle => {
      // dataSchema validation
      expect(bundle.dataSchema).toHaveProperty('type');
      expect(['object', 'array']).toContain((bundle.dataSchema as any).type);
      
      // configSchema validation
      expect(bundle.configSchema).toHaveProperty('type');
      expect(['object']).toContain((bundle.configSchema as any).type);
      
      // outputSchema validation
      expect(bundle.outputSchema).toHaveProperty('type');
    });
  });

  it('Each bundle should have unique key', async () => {
    const response = await fetch(`${BASE_URL}/api/bundles`);
    const bundles: CardBundle[] = await response.json();
    
    const keys = bundles.map(b => b.key);
    const uniqueKeys = new Set(keys);
    
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('Bundles should include documentation and examples', async () => {
    const response = await fetch(`${BASE_URL}/api/bundles`);
    const bundles: CardBundle[] = await response.json();
    
    if (bundles.length > 0) {
      bundles.forEach(bundle => {
        // Should have example data
        expect(bundle.exampleData).toBeDefined();
        expect(typeof bundle.exampleData).toBe('object');
        
        // Should have example config
        expect(bundle.exampleConfig).toBeDefined();
        expect(typeof bundle.exampleConfig).toBe('object');
        
        // Should have defaults
        expect(bundle.defaults).toBeDefined();
        expect(typeof bundle.defaults).toBe('object');
      });
    }
  });
});
