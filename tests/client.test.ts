/** Tests for the Dermalytics client */

import { Dermalytics } from '../src/client';
import {
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
  ValidationError,
} from '../src/errors';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  mockFetch.mockClear();
});

describe('Dermalytics constructor', () => {
  it('should initialize without error', () => {
    const client = new Dermalytics({ apiKey: 'test-key' });
    expect(client).toBeInstanceOf(Dermalytics);
  });

  it('should throw ValidationError for missing api key', () => {
    expect(() => new Dermalytics({ apiKey: '' })).toThrow(ValidationError);
  });
});

describe('getIngredient', () => {
  it('should return ingredient data on success', async () => {
    const data = {
      name: 'Niacinamide',
      severity: 'safe',
      description: 'A form of vitamin B3.',
      comedogenicity: 0,
      irritancy: 0,
      formula: null,
      molecular_weight: null,
      cas_no: null,
      ec_no: null,
      ph_eur_name: null,
      functions: ['Skin conditioning'],
      categories: [{ name: 'Vitamins', slug: 'vitamins' }],
      condition_safeties: [],
      synonyms: ['Vitamin B3'],
      credits_remaining: 99,
    };
    mockResponse(200, data);

    const client = new Dermalytics({ apiKey: 'test-key' });
    const result = await client.getIngredient('niacinamide');

    expect(result.name).toBe('Niacinamide');
    expect(result.credits_remaining).toBe(99);
    expect(result.categories).toEqual([{ name: 'Vitamins', slug: 'vitamins' }]);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.dermalytics.dev/v1/ingredients/niacinamide',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) })
    );
  });

  it('should throw ValidationError for empty name', async () => {
    const client = new Dermalytics({ apiKey: 'test-key' });
    await expect(client.getIngredient('')).rejects.toThrow(ValidationError);
  });

  it('should throw NotFoundError on 404', async () => {
    mockResponse(404, { error: { code: 'not_found', message: 'Ingredient not found' } });
    const client = new Dermalytics({ apiKey: 'test-key' });
    await expect(client.getIngredient('unknown-xyz')).rejects.toThrow(NotFoundError);
  });

  it('should throw AuthenticationError on 401', async () => {
    mockResponse(401, { error: { code: 'unauthorized', message: 'Invalid API key' } });
    const client = new Dermalytics({ apiKey: 'bad-key' });
    await expect(client.getIngredient('niacinamide')).rejects.toThrow(AuthenticationError);
  });

  it('should throw InsufficientCreditsError on 402', async () => {
    mockResponse(402, { error: { code: 'insufficient_credits', message: 'Insufficient credits' } });
    const client = new Dermalytics({ apiKey: 'test-key' });
    await expect(client.getIngredient('niacinamide')).rejects.toThrow(InsufficientCreditsError);
  });
});

describe('analyze', () => {
  it('should return analysis data on success', async () => {
    const data = {
      safety_status: 'safe',
      ingredients: [
        {
          name: 'Aqua',
          found: true,
          severity: 'safe',
          category: 'Solvents',
          description: null,
          comedogenicity: 0,
          irritancy: 0,
          formula: null,
          molecular_weight: null,
          cas_no: null,
          ec_no: null,
          ph_eur_name: null,
          functions: [],
        },
      ],
      warnings: [],
      credits_remaining: 98,
    };
    mockResponse(200, data);

    const client = new Dermalytics({ apiKey: 'test-key' });
    const result = await client.analyze(['Aqua', 'Glycerin']);

    expect(result.safety_status).toBe('safe');
    expect(result.credits_remaining).toBe(98);
    expect(result.ingredients[0].found).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.dermalytics.dev/v1/analyze',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should throw ValidationError for empty array', async () => {
    const client = new Dermalytics({ apiKey: 'test-key' });
    await expect(client.analyze([])).rejects.toThrow(ValidationError);
  });

  it('should throw InsufficientCreditsError on 402', async () => {
    mockResponse(402, { error: { code: 'insufficient_credits', message: 'Insufficient credits' } });
    const client = new Dermalytics({ apiKey: 'test-key' });
    await expect(client.analyze(['Aqua'])).rejects.toThrow(InsufficientCreditsError);
  });
});
