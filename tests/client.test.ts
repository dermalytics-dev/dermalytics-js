/** Tests for the Dermalytics client */

import { Dermalytics } from '../src/client';
import {
  AuthenticationError,
  RateLimitError,
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

describe('catalog search', () => {
  const client = new Dermalytics({ apiKey: 'test-key' });

  it('encodes queries and filters, and preserves pagination and null fields', async () => {
    const result = { data: [{ id: 'fixture', name: 'A&B', brand: null }], pagination: { limit: 2, offset: 0, next_offset: 2 }, credits_remaining: 99 };
    mockResponse(200, result);
    expect(await client.searchProducts(' A&B ', { limit: 2, ingredient: 'Vitamin B3', brand: 'Example / Co' })).toEqual(result);
    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.pathname).toBe('/v1/products');
    expect(url.searchParams.get('q')).toBe('A&B');
    expect(url.searchParams.get('ingredient')).toBe('Vitamin B3');
    expect(url.searchParams.get('brand')).toBe('Example / Co');
    expect(url.searchParams.get('limit')).toBe('2');
  });

  it('uses the collection route for CAS search and accepts an empty page', async () => {
    const result = { data: [], pagination: { limit: 20, offset: 0, next_offset: null }, credits_remaining: 100 };
    mockResponse(200, result);
    expect(await client.searchIngredients('98-92-0')).toEqual(result);
    expect(mockFetch.mock.calls[0][0]).toContain('/v1/ingredients?q=98-92-0&');
  });

  it('rejects invalid bounds and identifiers before any request', async () => {
    await expect(client.searchIngredients('x')).rejects.toThrow(ValidationError);
    await expect(client.searchProducts('cream', { limit: 51 })).rejects.toThrow(ValidationError);
    await expect(client.searchProducts('cream', { offset: -1 })).rejects.toThrow(ValidationError);
    await expect(client.searchProducts('cream', { brand: ' ' })).rejects.toThrow(ValidationError);
    await expect(client.getProduct('../private')).rejects.toThrow(ValidationError);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('uses the product detail route and existing insufficient credit errors', async () => {
    mockResponse(402, { error: { code: 'INSUFFICIENT_CREDITS', message: 'Insufficient credits' } });
    await expect(client.getProduct('f879d134-c8e3-4816-a7ad-a042508c44e5')).rejects.toThrow(InsufficientCreditsError);
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.dermalytics.dev/v1/products/f879d134-c8e3-4816-a7ad-a042508c44e5');
  });

  it('analyzeProduct is backwards-compatible with analyze', async () => {
    const result = { safety_status: 'safe', ingredients: [], credits_remaining: 99 };
    mockResponse(200, result);
    expect(await client.analyzeProduct(['Aqua'])).toEqual(result);
    expect(mockFetch).toHaveBeenCalledWith('https://api.dermalytics.dev/v1/analyze', expect.objectContaining({ method: 'POST', body: JSON.stringify({ ingredients: ['Aqua'] }) }));
  });
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
      trait_flags: [],
      category: 'Vitamins',
      synonyms: ['Vitamin B3'],
      credits_remaining: 99,
    };
    mockResponse(200, data);

    const client = new Dermalytics({ apiKey: 'test-key' });
    const result = await client.getIngredient('niacinamide');

    expect(result.name).toBe('Niacinamide');
    expect(result.credits_remaining).toBe(99);
    expect(result.category).toBe('Vitamins');
    expect(result.trait_flags).toEqual([]);
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
          trait_flags: ['fragrance'],
        },
      ],
      credits_remaining: 98,
    };
    mockResponse(200, data);

    const client = new Dermalytics({ apiKey: 'test-key' });
    const result = await client.analyze(['Aqua', 'Glycerin']);

    expect(result.safety_status).toBe('safe');
    expect(result.credits_remaining).toBe(98);
    expect(result.ingredients[0].found).toBe(true);
    expect(result.ingredients[0].trait_flags).toEqual(['fragrance']);
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

describe('access without an API key', () => {
  it('omits Authorization and defaults search to three results', async () => {
    mockResponse(200, {data:[],pagination:{limit:3,offset:0,next_offset:null},credits_remaining:0});
    await new Dermalytics().searchProducts('cream');
    expect(mockFetch.mock.calls[0][0]).toContain('limit=3');
    expect(mockFetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });
  it('rejects larger anonymous requests without sending them', async () => {
    const client = new Dermalytics();
    await expect(client.searchProducts('cream',{limit:4})).rejects.toThrow(ValidationError);
    await expect(client.searchIngredients('Water',{offset:3})).rejects.toThrow(ValidationError);
    await expect(client.analyze(Array(6).fill('Water'))).rejects.toThrow(ValidationError);
    expect(mockFetch).not.toHaveBeenCalled();
  });
  it('does not retry or fall back when a supplied key fails', async () => {
    mockResponse(401,{error:{message:'Invalid key'}});
    await expect(new Dermalytics({apiKey:'bad'}).searchProducts('cream')).rejects.toThrow(AuthenticationError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});


describe('registration link', () => {
  it('exposes the response link on success and quota errors, and clears it when absent', async () => {
    const client = new Dermalytics();
    const signup = 'https://www.dermalytics.dev/dashboard';
    for (const status of [200, 429]) {
      mockFetch.mockResolvedValueOnce({ ok: status === 200, status, headers: new Headers({'X-API-Key-URL': signup}), json: async () => status === 200 ? {data:[],pagination:{limit:3,offset:0,next_offset:null},credits_remaining:0} : {error:{message:`Register at ${signup}`}} });
      if (status === 200) await client.searchProducts('cream');
      else await expect(client.searchProducts('cream')).rejects.toThrow(RateLimitError);
      expect(client.signupUrl).toBe(signup);
    }
    mockResponse(200,{data:[],pagination:{limit:3,offset:0,next_offset:null},credits_remaining:0});
    await client.searchProducts('cream');
    expect(client.signupUrl).toBeNull();
  });
});
