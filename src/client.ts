/** Main API client for the Dermalytics SDK */

import {
  APIError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from './errors';
import { AnalyzeResponse, DermalyticsConfig, IngredientResponse } from './types';

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
      throw new APIError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    try {
      return (await response.json()) as T;
    } catch {
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
      const errorData = (await response.json()) as { error?: { message?: string; code?: string } };
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // If JSON parsing fails, use the status text
    }

    switch (response.status) {
      case 401:
      case 403:
        throw new AuthenticationError(errorMessage);
      case 402:
        throw new InsufficientCreditsError(errorMessage);
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
   * @param name - The INCI-style name or known synonym of the ingredient
   * @returns Promise resolving to ingredient information
   * @throws {ValidationError} If the ingredient name is invalid
   * @throws {NotFoundError} If the ingredient is not found
   * @throws {AuthenticationError} If authentication fails
   * @throws {InsufficientCreditsError} If the account has insufficient credits
   * @throws {APIError} For other API errors
   */
  async getIngredient(name: string): Promise<IngredientResponse> {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Ingredient name is required');
    }

    return this.request<IngredientResponse>(`/v1/ingredients/${encodeURIComponent(name.trim())}`);
  }

  /**
   * Analyze a list of ingredients for safety and compatibility.
   *
   * @param ingredients - Array of ingredient names to analyze
   * @returns Promise resolving to analysis results
   * @throws {ValidationError} If the ingredients array is invalid
   * @throws {AuthenticationError} If authentication fails
   * @throws {InsufficientCreditsError} If the account has insufficient credits
   * @throws {APIError} For other API errors
   */
  async analyze(ingredients: string[]): Promise<AnalyzeResponse> {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new ValidationError('Ingredients array is required and must not be empty');
    }

    return this.request<AnalyzeResponse>('/v1/analyze', {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    });
  }
}
