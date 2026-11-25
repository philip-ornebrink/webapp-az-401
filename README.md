# Repo for frontend code

## Purpose

To learn azure devops and github integration

## Development

The app is React with TypeScript, built with [Vite](https://vite.dev/) and routed with [React Router](https://reactrouter.com/). It needs Node.js 22.22 or later. CI uses the version in `.nvmrc`.

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

### Continuous integration

The [Frontend CI](.github/workflows/frontend-ci.yml) workflow runs on pull requests into `dev`, `test` and `main`, and on pushes to them. It checks formatting, lints, regenerates the API types and type-checks, runs the tests with coverage and builds the app. The coverage report is attached to each run as the `coverage` artifact.

The **Require frontend CI** ruleset makes the `frontend-ci` check required on `dev` and `main`, so a pull request into them can't merge until CI passes. To run the same checks locally:

```sh
npm run format:check && npm run lint && npm run test:coverage && npm run build
```

### Configuration

Settings are Vite environment variables. The defaults are in `.env`, which is committed. Put local overrides in `.env.local`, which isn't. Vite puts every `VITE_` variable into the browser bundle, so never use one for a secret.

| Variable                | Default                 | What it is                                                                                 |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL`     | `/api`                  | Base URL the app calls the API on. In Azure, the API's absolute URL.                       |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` | Where `npm run dev` and `npm run preview` send `/api` requests. Not used in the built app. |

Locally the app calls `/api/...`. The dev server forwards those requests to the Go API and removes the `/api` prefix, so `/api/objectives` reaches `http://localhost:8080/objectives`. The browser only talks to `localhost:5173`, so the API needs no CORS setup locally. Start the API from the backend repository first.

Vite reads the variables when it builds, so each environment needs its own build. The CD workflow sets the API URL for that environment:

```sh
VITE_API_BASE_URL=https://<api-app>.azurewebsites.net npm run build
```

Environment variables win over the `.env` files. The app reads its settings in `src/config.ts` and stops with a clear error when `VITE_API_BASE_URL` is missing or malformed. `src/api/index.ts` exports the API client for the current environment.

### Routes

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
