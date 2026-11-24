# Repo for frontend code

## Purpose

To learn azure devops and github integration

## Development

The app is React with TypeScript, built with [Vite](https://vite.dev/) and routed with [React Router](https://reactrouter.com/). It needs Node.js 22.22 or later.

```sh
npm install
npm run dev            # dev server on http://localhost:5173
```

| Script                  | What it does                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Starts the dev server with hot reload.                          |
| `npm run build`         | Regenerates the API types, type-checks and builds into `dist/`. |
| `npm run preview`       | Serves the production build from `dist/`.                       |
| `npm run lint`          | Runs ESLint.                                                    |
| `npm run format`        | Formats the code with Prettier. `format:check` only checks.     |
| `npm test`              | Runs the Vitest tests once. `test:watch` reruns on changes.     |
| `npm run test:coverage` | Runs the tests with a coverage report in `coverage/`.           |

Routes are defined in `src/routes.tsx`. Every page renders inside `src/layout/AppLayout.tsx`, which holds the header and navigation. To add a page, create it in `src/pages/` and add a route.

## API client

The frontend talks to the backend through a typed client generated from the OpenAPI spec.

| File                    | What it is                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `api/openapi.yaml`      | Copy of the API contract. The source is `api/openapi.yaml` on `dev` in the Azure Repos repo `webapp az-401`. |
| `src/api/schema.gen.ts` | Types generated from the spec by [openapi-typescript](https://openapi-ts.dev/). Don't edit by hand.          |
| `src/api/client.ts`     | One typed function per endpoint, built on [openapi-fetch](https://openapi-ts.dev/openapi-fetch/).            |

Run `npm run generate:api` to regenerate `src/api/schema.gen.ts` after the spec changes. `npm run build` does it too.

Use the client like this:

```ts
import { ApiError, createApiClient } from "./api/client";

const api = createApiClient({
  baseUrl: "http://localhost:8080",
  getAccessToken: async () => token, // Entra ID token for the API
});

try {
  const objectives = await api.listObjectives();
} catch (e) {
  if (e instanceof ApiError && e.problem?.type.endsWith("/unauthorized")) {
    // sign in again
  }
}
```

### When the spec changes

1. Copy the new `api/openapi.yaml` from the Azure Repos repo.
2. Run `npm run build`.

The build fails when the change breaks the frontend: a removed or renamed endpoint, a changed parameter or request body, or a response field that the code reads.
