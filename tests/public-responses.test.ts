import { Dermalytics } from '../src/client';
import { APIError } from '../src/errors';
import cases from './public-responses.json';

const fetchMock = jest.fn();
global.fetch = fetchMock;
const client = new Dermalytics({ apiKey: 'test-key' });
const invoke = {
  ingredient: () => client.getIngredient('Example'),
  analysis: () => client.analyze(['Example']),
  ingredientSearch: () => client.searchIngredients('Example'),
  productSearch: () => client.searchProducts('Example'),
  product: () => client.getProduct('f879d134-c8e3-4816-a7ad-a042508c44e5'),
};

beforeEach(() => fetchMock.mockReset());

it.each(cases)('$kind returns only the allowed fields at every nesting level', async ({kind, input, expected}) => {
  const original = JSON.stringify(input);
  fetchMock.mockResolvedValue({ok: true, json: async () => input});
  expect(await invoke[kind as keyof typeof invoke]()).toEqual(expected);
  expect(JSON.stringify(input)).toBe(original);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it.each([
  {name: {source: 'PRIVATE_MARKER'}},
  {traits_cache: [{source: 'PRIVATE_MARKER'}]},
  {ingredients: [{name: {source: 'PRIVATE_MARKER'}}]},
])('rejects objects hidden in scalar fields without returning raw data', async (body) => {
  fetchMock.mockResolvedValue({ok: true, json: async () => body});
  await expect(invoke.product()).rejects.toThrow(APIError);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
