# Dermalytics JavaScript SDK — agent guidance

## Purpose

This repository publishes the JavaScript and TypeScript client for the Dermalytics API. Its public exports, types, errors, and examples form a versioned developer contract.

## Work in this repository

- Read `README.md` before changing the client and verify behavior against the deployed API contract.
- Preserve backward compatibility unless the task explicitly authorizes a breaking release. Update types, runtime behavior, tests, and examples together.
- Never embed API keys or real customer data in source, fixtures, examples, or logs.
- Keep package metadata, versioning, and generated build output consistent with the release workflow. Do not publish packages unless explicitly requested.
- Preserve the existing lockfile and package-manager conventions.

## Verify

```sh
npm run lint
npm test
npm run build
```

