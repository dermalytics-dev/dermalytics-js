/** Main API client for the Dermalytics SDK */

import { Ingredient, ProductAnalysis, DermalyticsConfig } from './types';

export class Dermalytics {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Client for interacting with the Dermalytics API.
   * 
   * This SDK is currently a placeholder. Full implementation coming soon.
   * 
   * @param config - Configuration object with API key and optional base URL
   */
  constructor(config: DermalyticsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.dermalytics.dev';
  }

  /**
   * Get detailed information about a specific ingredient.
   * 
   * @param name - The name of the ingredient to look up
   * @returns Promise resolving to ingredient information including safety ratings, category, and condition safeties
   * @throws {NotImplementedError} This SDK is currently a placeholder
   */
  async getIngredient(name: string): Promise<Ingredient> {
    throw new Error(
      'This SDK is a placeholder. Full implementation coming soon.'
    );
  }

  /**
   * Analyze a complete product formulation.
   * 
   * @param ingredients - Array of ingredient names in the product
   * @returns Promise resolving to product analysis including safety status, ingredient details, and warnings
   * @throws {NotImplementedError} This SDK is currently a placeholder
   */
  async analyze(ingredients: string[]): Promise<ProductAnalysis> {
    throw new Error(
      'This SDK is a placeholder. Full implementation coming soon.'
    );
  }
}
