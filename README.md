# Dermalytics JavaScript/TypeScript SDK

JavaScript/TypeScript SDK for the [Dermalytics API](https://dermalytics.dev) - Skincare Ingredient Analysis and Safety Ratings.

## ⚠️ Status

This SDK is currently in **development** and **alpha testing**. The API is functional but may have breaking changes in future versions. Use with caution in production environments.

## Installation

```bash
npm install dermalytics
```

or with yarn:

```bash
yarn add dermalytics
```

or with pnpm:

```bash
pnpm add dermalytics
```

## Quick Start

### TypeScript/ES Modules

```typescript
import { Dermalytics } from 'dermalytics';

// Initialize the client
const client = new Dermalytics({
  apiKey: 'your_api_key_here'
});

// Get ingredient details
const ingredient = await client.getIngredient('niacinamide');
console.log(ingredient);

// Analyze a product
const analysis = await client.analyze([
  'Aqua',
  'Glycerin',
  'Niacinamide',
  'Salicylic Acid',
  'Hyaluronic Acid'
]);
console.log(analysis);
```

### CommonJS

```javascript
const { Dermalytics } = require('dermalytics');

const client = new Dermalytics({
  apiKey: 'your_api_key_here'
});
```

## API Reference

### `new Dermalytics(config: DermalyticsConfig)`

Initialize the Dermalytics API client.

**Parameters:**
- `config.apiKey` (string): Your Dermalytics API key
- `config.baseUrl` (string, optional): Base URL for the API (defaults to `https://api.dermalytics.dev`)

**Throws:**
- `ValidationError`: If API key is missing or invalid

### `getIngredient(name: string): Promise<Ingredient>`

Get detailed information about a specific ingredient.

**Parameters:**
- `name` (string): The name of the ingredient to look up (e.g., "niacinamide")

**Returns:**
- `Promise<Ingredient>`: Object containing:
  - `name` (string): Ingredient name
  - `severity` (string): Safety rating (e.g., "safe", "low_risk", "moderate_risk", "high_risk")
  - `description` (string, optional): Description of the ingredient
  - `category` (object): Category information with `name` and `slug`
  - `condition_safeties` (array): Array of condition-specific safety information
  - `synonyms` (array): Array of alternative names for the ingredient

**Throws:**
- `ValidationError`: If the ingredient name is invalid
- `NotFoundError`: If the ingredient is not found
- `AuthenticationError`: If authentication fails
- `RateLimitError`: If rate limit is exceeded
- `APIError`: For other API errors

### `analyze(ingredients: string[]): Promise<ProductAnalysis>`

Analyze a complete product formulation.

**Parameters:**
- `ingredients` (string[]): Array of ingredient names in the product

**Returns:**
- `Promise<ProductAnalysis>`: Object containing:
  - `safety_status` (string): Overall safety status of the product
  - `ingredients` (array): Array of analyzed ingredients with their safety ratings
  - `warnings` (array): Array of warnings for specific conditions or interactions

**Throws:**
- `ValidationError`: If the ingredients array is invalid
- `AuthenticationError`: If authentication fails
- `RateLimitError`: If rate limit is exceeded
- `APIError`: For other API errors

## Error Handling

The SDK provides comprehensive error handling with specific error classes for different scenarios:

```typescript
import {
  DermalyticsError,
  APIError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from 'dermalytics';

try {
  const ingredient = await client.getIngredient('niacinamide');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Ingredient not found');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded');
  } else if (error instanceof ValidationError) {
    console.log('Invalid input:', error.message);
  } else if (error instanceof APIError) {
    console.log('API error:', error.message);
  } else if (error instanceof DermalyticsError) {
    console.log('Dermalytics error:', error.message);
  }
}
```

### Error Classes

- `DermalyticsError` - Base error class for all SDK errors
- `APIError` - General API errors (server errors, network issues, invalid responses)
- `AuthenticationError` - Authentication failures (401, 403)
- `NotFoundError` - Resource not found (404)
- `RateLimitError` - Rate limit exceeded (429)
- `ValidationError` - Invalid request data (400, invalid input parameters)

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions. All types are exported for your convenience:

```typescript
import type {
  Ingredient,
  ProductAnalysis,
  Category,
  ConditionSafety,
  IngredientAnalysis,
  Warning,
  DermalyticsConfig,
} from 'dermalytics';
```

## Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/dermalytics-dev/dermalytics-js.git
cd dermalytics-js
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License allows you to:
- ✅ Use the code commercially
- ✅ Modify the code
- ✅ Distribute the code
- ✅ Use privately
- ✅ Include in proprietary software

You must:
- Include the original copyright notice
- Include the license text

## Links

- [Dermalytics API Documentation](https://docs.dermalytics.dev)
- [GitHub Repository](https://github.com/dermalytics-dev/dermalytics-js)
- [Issue Tracker](https://github.com/dermalytics-dev/dermalytics-js/issues)
- [npm Package](https://www.npmjs.com/package/dermalytics)

## Support

For support, email support@dermalytics.dev or open an issue on GitHub.
