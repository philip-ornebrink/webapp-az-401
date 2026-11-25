// App settings from Vite environment variables. Vite replaces import.meta.env.VITE_*
// at build time, so each environment's build gets its own values. See .env.

export interface AppConfig {
  /** Base URL for API calls, without a trailing slash. "/api" locally, an absolute URL in Azure. */
  apiBaseUrl: string;
}

export function readConfig(env: Partial<Pick<ImportMetaEnv, "VITE_API_BASE_URL">>): AppConfig {
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!apiBaseUrl) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Set it in .env.local or in the build environment. See .env.",
    );
  }
  if (!apiBaseUrl.startsWith("/") && !URL.canParse(apiBaseUrl)) {
    throw new Error(
      `VITE_API_BASE_URL must be a path such as /api or an absolute URL, not "${apiBaseUrl}".`,
    );
  }
  return { apiBaseUrl };
}

export const config = readConfig(import.meta.env);
