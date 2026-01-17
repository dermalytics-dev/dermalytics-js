# Dermalytics JavaScript/TypeScript SDK

JavaScript/TypeScript SDK for the [Dermalytics API](https://dermalytics.dev) - Skincare Ingredient Analysis and Safety Ratings.

## ⚠️ Status

This SDK is currently a **placeholder**. Full implementation coming soon. All methods will throw errors until the SDK is fully implemented.

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
- `Error`: This SDK is currently a placeholder

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
- `Error`: This SDK is currently a placeholder
- `NotFoundError`: If the ingredient is not found
- `APIError`: If the API returns an error

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
- `Error`: This SDK is currently a placeholder
- `ValidationError`: If the request is invalid
- `APIError`: If the API returns an error

## Error Handling

The SDK provides custom error classes:

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
  } else if (error instanceof APIError) {
    console.log('API error:', error.message);
  }
}
```

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

## Publishing to npm

### Prerequisites

1. Create an npm account at https://www.npmjs.com/signup
2. Login to npm:
```bash
npm login
```

3. Verify you're logged in:
```bash
npm whoami
```

### Build and Publish

1. Update version in `package.json`:
```json
{
  "version": "0.1.0"
}
```

2. Build the project:
```bash
npm run build
```

3. Verify the build output:
```bash
ls dist/
```

4. Test the package locally (optional):
```bash
npm pack
# This creates a .tgz file you can test
```

5. Publish to npm:
```bash
npm publish
```

6. Publish to npm with public access (if needed):
```bash
npm publish --access public
```

### Version Management

Use npm's version command to update versions:

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

This automatically:
- Updates `package.json`
- Creates a git tag
- Commits the changes

Then publish:
```bash
npm publish
```

Follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Publishing Checklist

- [ ] Update version in `package.json`
- [ ] Update version in `src/index.ts` (if exported)
- [ ] Run `npm run build` to ensure build succeeds
- [ ] Run `npm test` to ensure tests pass
- [ ] Run `npm run lint` to ensure code quality
- [ ] Update CHANGELOG.md (if you have one)
- [ ] Commit all changes
- [ ] Create git tag: `git tag v0.1.0`
- [ ] Push to GitHub: `git push && git push --tags`
- [ ] Publish to npm: `npm publish`

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
