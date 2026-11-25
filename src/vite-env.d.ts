/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL the app calls the API on. See .env. */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
