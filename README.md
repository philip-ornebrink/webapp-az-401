# Repo for frontend code

## Purpose  

To learn azure devops and github integration  

## API client

The frontend talks to the backend through a typed client generated from the OpenAPI spec.

| File | What it is |
| --- | --- |
| `api/openapi.yaml` | Copy of the API contract. The source is `api/openapi.yaml` on `dev` in the Azure Repos repo `webapp az-401`. |
| `src/api/schema.gen.ts` | Types generated from the spec by [openapi-typescript](https://openapi-ts.dev/). Don't edit by hand. |
| `src/api/client.ts` | One typed function per endpoint, built on [openapi-fetch](https://openapi-ts.dev/openapi-fetch/). |

```sh
npm install
npm run generate:api   # regenerate src/api/schema.gen.ts after the spec changes
npm run build          # regenerates the types, then type-checks
```

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
