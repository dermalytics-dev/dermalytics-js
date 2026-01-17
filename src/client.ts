/** Main API client for the Dermalytics SDK */

import {
  APIError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from './errors';
import { DermalyticsConfig, Ingredient, ProductAnalysis } from './types';

export class Dermalytics {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Client for interacting with the Dermalytics API.
   *
   * @param config - Configuration object with API key and optional base URL
   * @throws {ValidationError} If API key is missing
   */
  constructor(config: DermalyticsConfig) {
    if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
      throw new ValidationError('API key is required');
    }

    this.apiKey = config.apiKey.trim();
    this.baseUrl = (config.baseUrl || 'https://api.dermalytics.dev').replace(/\/$/, '');
  }

  /**
   * Makes an HTTP request to the API with proper error handling.
   *
   * @private
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (error) {
      // Network errors (connection failed, timeout, etc.)
      throw new APIError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      // JSON parsing errors
      throw new APIError('Invalid response format from server');
    }
  }

  /**
   * Handles error responses from the API based on HTTP status codes.
   *
   * @private
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = (await response.json()) as { message?: string; error?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use the status text
    }

    switch (response.status) {
      case 401:
      case 403:
        throw new AuthenticationError(errorMessage);
      case 404:
        throw new NotFoundError(errorMessage);
      case 429:
        throw new RateLimitError(errorMessage);
      case 400:
        throw new ValidationError(errorMessage);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new APIError(`Server error: ${errorMessage}`);
      default:
        throw new APIError(errorMessage);
    }
  }

  /**
   * Get detailed information about a specific ingredient.
   *
   * @param name - The name of the ingredient to look up
   * @returns Promise resolving to ingredient information
   * @throws {ValidationError} If the ingredient name is invalid
   * @throws {NotFoundError} If the ingredient is not found
   * @throws {AuthenticationError} If authentication fails
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {APIError} For other API errors
   */
  async getIngredient(name: string): Promise<Ingredient> {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Ingredient name is required');
    }

    return this.request<Ingredient>(`/ingredients/${encodeURIComponent(name.trim())}`);
  }

  /**
   * Analyze a complete product formulation.
   *
   * @param ingredients - Array of ingredient names in the product
   * @returns Promise resolving to product analysis
   * @throws {ValidationError} If the ingredients array is invalid
   * @throws {AuthenticationError} If authentication fails
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {APIError} For other API errors
   */
  async analyze(ingredients: string[]): Promise<ProductAnalysis> {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new ValidationError('Ingredients array is required and must not be empty');
    }

    return this.request<ProductAnalysis>('/analyze', {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    });
  }
}
