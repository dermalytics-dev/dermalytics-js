/** Main API client for the Dermalytics SDK */

import { publicResponse, type ResponseKind } from './publicResponse.js';

import {
  APIError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from './errors.js';
import {
  AnalyzeResponse,
  DermalyticsConfig,
  ErrorResponse,
  IngredientResponse,
  IngredientSearchResponse,
  ProductSearchResponse,
  ProductResponse,
  SearchOptions,
  ProductSearchOptions,
} from './types.js';

export class Dermalytics {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  /** Registration link returned after the second keyless request or when its quota is exhausted. */
  signupUrl: string | null = null;

  /**
   * Client for interacting with the Dermalytics API.
   *
   * @param config - Configuration object with API key and optional base URL
   * @throws {ValidationError} If a provided API key is empty or invalid
   */
  constructor(config: DermalyticsConfig = {}) {
    if (config.apiKey !== undefined && (typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0)) {
      throw new ValidationError('API key is required');
    }

    this.apiKey = config.apiKey?.trim();
    this.baseUrl = (config.baseUrl || 'https://api.dermalytics.dev').replace(/\/$/, '');
  }

  /**
   * Makes an HTTP request to the API with proper error handling.
   *
   * @private
   */
  private async request<T>(endpoint: string, kind: ResponseKind, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (error) {
      throw new APIError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }

    const signup = response.headers?.get('X-API-Key-URL');
    this.signupUrl = signup?.startsWith('https://') ? signup : null;

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    try {
      return publicResponse(await response.json(), kind) as T;
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
      const errorData = (await response.json()) as ErrorResponse;
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

    return this.request<IngredientResponse>(`/v1/ingredients/${encodeURIComponent(name.trim())}`, 'ingredient');
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

    if (!this.apiKey && (ingredients.length > 5 || ingredients.some(value => typeof value !== 'string' || !value.trim() || value.length > 100))) {
      throw new ValidationError('Without an API key, provide 1–5 ingredient names of 1–100 characters each');
    }

    return this.request<AnalyzeResponse>('/v1/analyze', 'analysis', {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    });
  }

  /** Alias matching the website quick start; analyze() remains supported. */
  async analyzeProduct(ingredients: string[]): Promise<AnalyzeResponse> {
    return this.analyze(ingredients);
  }

  private searchParams(query: string, options: SearchOptions): URLSearchParams {
    if (typeof query !== 'string' || query.trim().length < 2 || query.trim().length > 100) {
      throw new ValidationError('Search query must contain 2–100 characters');
    }
    const limit = options.limit ?? (this.apiKey ? 20 : 3);
    const offset = options.offset ?? 0;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new ValidationError('limit must be an integer from 1 to 50');
    }
    if (!Number.isInteger(offset) || offset < 0 || offset > 10000) {
      throw new ValidationError('offset must be an integer from 0 to 10000');
    }
    if (!this.apiKey && (limit > 3 || offset !== 0)) throw new ValidationError('Without an API key, use limit 1–3 and offset 0');
    return new URLSearchParams({ q: query.trim(), limit: String(limit), offset: String(offset) });
  }

  /** Search names, synonyms or exact CAS/EC identifiers. One credit per non-empty page. */
  async searchIngredients(query: string, options: SearchOptions = {}): Promise<IngredientSearchResponse> {
    return this.request<IngredientSearchResponse>(`/v1/ingredients?${this.searchParams(query, options)}`, 'ingredientSearch');
  }

  /** Search the available product catalog. Availability depends on the API deployment. */
  async searchProducts(query: string, options: ProductSearchOptions = {}): Promise<ProductSearchResponse> {
    const params = this.searchParams(query, options);
    for (const name of ['brand', 'ingredient'] as const) {
      const value = options[name];
      if (value !== undefined) {
        if (typeof value !== 'string' || !value.trim() || value.trim().length > 255) {
          throw new ValidationError(`${name} must contain 1–255 characters`);
        }
        params.set(name, value.trim());
      }
    }
    return this.request<ProductSearchResponse>(`/v1/products?${params}`, 'productSearch');
  }

  /** Fetch a product and its stored ingredient list by UUID. One credit on success. */
  async getProduct(id: string): Promise<ProductResponse> {
    if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new ValidationError('Product id must be a UUID');
    }
    return this.request<ProductResponse>(`/v1/products/${encodeURIComponent(id)}`, 'product');
  }
}
