# Dermalytics JavaScript SDK

Search cosmetic products and ingredients, retrieve INCI lists, and analyze ingredient data with a typed JavaScript and TypeScript client.

[Documentation](https://www.dermalytics.dev/docs) · [Get an API key](https://www.dermalytics.dev/dashboard) · [OpenAPI](https://api.dermalytics.dev/openapi.json)

## Install

```sh
npm install dermalytics
```

The package uses ES modules and requires a global `fetch` implementation. Node.js 18+ provides it natively. Keep your API key in server-side code.

## Try without an API key

```js
import { Dermalytics } from 'dermalytics';

const client = new Dermalytics();
const matches = await client.searchIngredients('Niacinamide');
console.log(matches.data);
```

Try the REST API without an API key: **5 requests per IP address in a 24-hour window**, starting with the first request. Search returns up to 3 results, with no pagination; analysis accepts up to 5 ingredient names. The quota is shared across all REST data methods. Empty results and invalid requests that reach the API also use an attempt.

Responses keep the same fields. Without an account, `credits_remaining` is `0`; it is not your free-request balance. HTTP headers `X-Free-Requests-Remaining` and `X-Free-Requests-Reset` report the remaining attempts and reset time (Unix seconds). HTTP 429 includes `Retry-After`. Get a key from the [dashboard](https://www.dermalytics.dev/dashboard) for full access and 100 welcome credits. Supplying an invalid key returns an authentication error; it never falls back to free access. Shared IP addresses share a quota; IPv6 addresses within a /64 share one bucket.

After the second keyless request, `client.signupUrl` contains the registration URL. When the quota is exhausted, `RateLimitError` also includes the link in its message. The SDK does not open a browser or print unsolicited messages.

## Use an API key

Set `DERMALYTICS_API_KEY` in your environment, then run this code in an ES module:

```js
import { Dermalytics } from 'dermalytics';

const apiKey = process.env.DERMALYTICS_API_KEY;
if (!apiKey) throw new Error('Set DERMALYTICS_API_KEY');

const client = new Dermalytics({ apiKey });

const page = await client.searchProducts('cream', {
  ingredient: 'Niacinamide',
  limit: 5,
});

for (const product of page.data) {
  console.log(product.id, product.name, product.brand);
}

if (page.data.length > 0) {
  const product = await client.getProduct(page.data[0].id);
  console.log(product.ingredients);
  console.log('Credits remaining:', product.credits_remaining);
}
```

The examples below use this `client`. Its default base URL is `https://api.dermalytics.dev`; set `baseUrl` in the constructor to use another deployment. In CommonJS, load the package with `await import('dermalytics')` inside an async function.

## Methods and credits

All methods return a promise. Successful responses include `credits_remaining`.

| Method | Returns | Credits |
| --- | --- | --- |
| `searchIngredients(query, options?)` | `IngredientSearchResponse` | 1 per non-empty page |
| `getIngredient(name)` | `IngredientResponse` | 1 per successful lookup |
| `searchProducts(query, options?)` | `ProductSearchResponse` | 1 per non-empty page |
| `getProduct(id)` | `ProductResponse` | 1 per successful lookup |
| `analyze(ingredients)` | `AnalyzeResponse` | 1 per matched ingredient row |

`analyzeProduct(ingredients)` is an alias for `analyze(ingredients)`. For requests with an API key, empty search pages, missing records and validation errors do not consume credits. Product lookup accepts a UUID returned by product search.

## Search ingredients

```js
const matches = await client.searchIngredients('niacinamide', { limit: 10 });
const byCas = await client.searchIngredients('98-92-0');
const ingredient = await client.getIngredient('Niacinamide');

console.log(matches.data);
console.log(byCas.data);
console.log(ingredient.functions, ingredient.trait_flags);
```

## Search products and paginate

```js
const query = 'cream';
const options = { brand: 'CeraVe', ingredient: 'Niacinamide', limit: 10 };
const firstPage = await client.searchProducts(query, options);

// Fetch one additional page when needed. Each non-empty page costs 1 credit.
if (firstPage.pagination.next_offset !== null) {
  const nextPage = await client.searchProducts(query, {
    ...options,
    offset: firstPage.pagination.next_offset,
  });
  console.log(nextPage.data);
}
```

Search queries contain 2–100 characters. Ingredient search matches names and synonyms by case-insensitive substring, or CAS/EC numbers exactly. Product search matches product names and brands by case-insensitive substring.

| Option | Default | Accepted values |
| --- | --- | --- |
| `limit` | `20` with a key; `3` without | Integer from 1 to 50 with a key; 1 to 3 without |
| `offset` | `0` | Integer from 0 to 10,000 with a key; `0` without |
| `brand` | Omitted | Exact brand, case-insensitive; 1–255 characters |
| `ingredient` | Omitted | Exact ingredient name or known synonym, case-insensitive; 1–255 characters |

`brand` and `ingredient` apply only to product search. Results are ordered by name, then ID. Each page has `data`, `pagination` (`limit`, `offset`, `next_offset`) and `credits_remaining`. A null `next_offset` means there is no next page within the supported offset range. Requests are never automatically paginated or retried.

## Analyze an ingredient list

```js
const analysis = await client.analyze(['Water', 'Glycerin', 'Niacinamide']);

for (const ingredient of analysis.ingredients) {
  if (!ingredient.found) {
    console.log('Not found:', ingredient.name);
    continue;
  }
  console.log(ingredient.name, ingredient.comedogenicity, ingredient.irritancy);
}

console.log('Credits remaining:', analysis.credits_remaining);
```

To analyze a stored product composition, pass `product.ingredients.map(item => item.name)` to `analyze`. Check that the list is non-empty before calling it. Product lookup and analysis are separate paid operations.

## Product fields

Product search returns these fields for each result. Product lookup returns the same fields plus the stored ingredient list.

| Field | Meaning |
| --- | --- |
| `id` | Product UUID; pass it to product lookup |
| `name` | Product name |
| `brand` | Brand, or null |
| `category` | Category name, or null |
| `area` | `face`, `eyes`, `lips`, `body`, `hair`, `nails`, or null |
| `ingredients_count` | Number of linked ingredients |
| `traits_cache` | Stored product trait tags |
| `key_ingredient_tags` | Stored key-ingredient tags |
| `ingredients` | Lookup only: entries with `id`, `name` and nullable `position` |

Only active products are returned. A product lookup response also includes `credits_remaining`. Null values mean the information is unavailable; an empty ingredient list means no linked composition is available. Tags describe stored metadata, not independently verified product claims.

## Ingredient and analysis fields

Ingredient search returns `id`, `name`, `cas_no`, `ec_no`, `functions`, `ratings_available` and `record_updated_at`. The availability flags indicate whether comedogenicity and irritancy ratings exist. The timestamp records a database update, not a formulation verification date.

Ingredient lookup returns `name`, `severity`, `category`, `synonyms` and `credits_remaining`, together with these detail fields:

- `comedogenicity`, `irritancy`: nullable ratings from 0 to 5.
- `formula`, `molecular_weight`, `cas_no`, `ec_no`, `ph_eur_name`: nullable identifiers and chemical metadata.
- `functions`, `trait_flags`: lists of cosmetic functions and ingredient tags.
- `description`: nullable text; currently returned as null.

Analysis returns `safety_status`, `ingredients` and `credits_remaining`. Each ingredient row contains `name`, `found`, `severity`, `category` and the detail fields above. Severity values are `safe`, `low_risk`, `moderate_risk` and `high_risk`. Check `found` and the nullable ratings when interpreting results: a missing record or rating is not evidence of safety.

The SDK returns only documented fields, including nested records. The [OpenAPI specification](https://api.dermalytics.dev/openapi.json) defines the HTTP response schemas.

## Handle errors

```js
import {
  DermalyticsError,
  InsufficientCreditsError,
  NotFoundError,
} from 'dermalytics';

try {
  const ingredient = await client.getIngredient('Niacinamide');
  console.log(ingredient.name);
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    console.error('Add credits in the dashboard before continuing.');
  } else if (error instanceof NotFoundError) {
    console.error('No ingredient matched that name.');
  } else if (error instanceof DermalyticsError) {
    console.error(error.message);
  } else {
    throw error;
  }
}
```

| Error | When it occurs |
| --- | --- |
| `ValidationError` | Invalid SDK input or HTTP 400 |
| `AuthenticationError` | HTTP 401 or 403 |
| `InsufficientCreditsError` | HTTP 402 |
| `NotFoundError` | HTTP 404 |
| `RateLimitError` | HTTP 429, including the free-request limit |
| `APIError` | Network failure, invalid response or another HTTP error, including 503 when the catalog is unavailable |

All SDK errors inherit from `DermalyticsError`. A failed network request can have reached the server and consumed credits; check the balance before retrying a paid operation.

## TypeScript

Response and option types are exported from `dermalytics`. Method return types are inferred automatically.

```ts
import type { ProductResponse, ProductSearchOptions } from 'dermalytics';

const options: ProductSearchOptions = { limit: 5, ingredient: 'Niacinamide' };
const page = await client.searchProducts('cream', options);

if (page.data.length > 0) {
  const product: ProductResponse = await client.getProduct(page.data[0].id);
  console.log(product.ingredients);
}
```

See [all exported types](src/types.ts) for ingredient responses, analysis, pagination and errors.

## Develop

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

## Resources

- [API reference and examples](https://www.dermalytics.dev/docs)
- [Account, API keys and credits](https://www.dermalytics.dev/dashboard)
- [Report an SDK issue](https://github.com/dermalytics-dev/dermalytics-js/issues)
- [MIT license](LICENSE)
