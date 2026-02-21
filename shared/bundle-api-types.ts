/**
 * Type definitions for Card Bundle Discovery API
 * For use by Spoke apps integrating with metric-market
 */

import type { CardBundle } from './schema';

/**
 * Response type for GET /api/bundles
 */
export type BundleListResponse = CardBundle[];

/**
 * Response type for GET /api/bundles/:id or GET /api/bundles/key/:key
 */
export type BundleDetailResponse = CardBundle;

/**
 * JSON Schema base type
 */
export interface JSONSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  description?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  additionalProperties?: JSONSchema | boolean;
  minItems?: number;
  maxItems?: number;
  enum?: any[];
  default?: any;
}

/**
 * Bundle Discovery Client
 * Example client for Spoke apps to discover and work with bundles
 */
export class BundleDiscoveryClient {
  constructor(private baseUrl: string = '/api') {}

  /**
   * Get all available bundles
   */
  async getAllBundles(): Promise<BundleListResponse> {
    const response = await fetch(`${this.baseUrl}/bundles`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bundles: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get a specific bundle by ID
   */
  async getBundleById(id: string): Promise<BundleDetailResponse> {
    const response = await fetch(`${this.baseUrl}/bundles/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bundle: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get a specific bundle by key
   */
  async getBundleByKey(key: string): Promise<BundleDetailResponse> {
    const response = await fetch(`${this.baseUrl}/bundles/key/${key}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bundle: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Find bundles by category
   */
  async getBundlesByCategory(category: string): Promise<CardBundle[]> {
    const bundles = await this.getAllBundles();
    return bundles.filter(b => b.category === category);
  }

  /**
   * Find bundles by tag
   */
  async getBundlesByTag(tag: string): Promise<CardBundle[]> {
    const bundles = await this.getAllBundles();
    return bundles.filter(b => b.tags?.includes(tag));
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const bundles = await this.getAllBundles();
    const categories = new Set(bundles.map(b => b.category).filter(Boolean));
    return Array.from(categories).sort();
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const bundles = await this.getAllBundles();
    const tags = new Set(bundles.flatMap(b => b.tags || []));
    return Array.from(tags).sort();
  }

  /**
   * Validate data against a bundle's dataSchema
   * Note: This is a basic validation. For production use, consider using a JSON Schema validator library
   */
  validateData(bundle: CardBundle, data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    // Basic validation - check if data is an object
    if (typeof data !== 'object' || data === null) {
      errors.push('Data must be an object');
      return { valid: false, errors };
    }

    // Check required fields
    const schema = bundle.dataSchema as JSONSchema;
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate config against a bundle's configSchema
   */
  validateConfig(bundle: CardBundle, config: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    // Basic validation
    if (typeof config !== 'object' || config === null) {
      errors.push('Config must be an object');
      return { valid: false, errors };
    }

    // For more comprehensive validation, use a JSON Schema validator library
    return { valid: true };
  }
}

/**
 * Helper to create a bundle discovery client
 */
export function createBundleClient(baseUrl?: string): BundleDiscoveryClient {
  return new BundleDiscoveryClient(baseUrl);
}

/**
 * Example usage types
 */
export interface CreateCardRequest {
  bundleId: string;
  title: string;
  subtitle?: string;
  config?: Record<string, any>;
  tags?: string[];
  metricId?: string;
  chartConfigId?: string;
}

export interface PushCardDataRequest {
  [key: string]: any; // Must conform to bundle's dataSchema
}
