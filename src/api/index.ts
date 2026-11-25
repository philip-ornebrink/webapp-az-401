import { config } from "../config";
import { createApiClient } from "./client";

/**
 * The app's API client, pointed at the API for the current environment.
 * Sign-in (#19) will pass getAccessToken here.
 */
export const api = createApiClient({ baseUrl: config.apiBaseUrl });
