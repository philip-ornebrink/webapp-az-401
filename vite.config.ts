import react from "@vitejs/plugin-react";
import { loadEnv, type ProxyOptions } from "vite";
import { defineConfig } from "vitest/config";

// When the app calls the API on a path such as /api, the dev server and `vite preview`
// forward that path to the Go API and strip the prefix, so the browser sees one origin
// and the API needs no CORS setup locally. An absolute API URL needs no proxy.
function apiProxy(env: Record<string, string>): Record<string, ProxyOptions> | undefined {
  const basePath = env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
  const target = env.VITE_API_PROXY_TARGET?.trim();
  if (!basePath?.startsWith("/") || !target) {
    return undefined;
  }
  // Match /api, /api/... and /api?..., but not /apiary. Vite reads a key that starts
  // with ^ as a regular expression.
  const pattern = `^${basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[/?]|$)`;
  const prefix = new RegExp(pattern);
  return {
    [pattern]: {
      target,
      changeOrigin: true,
      rewrite: (path) => path.replace(prefix, "") || "/",
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const proxy = apiProxy(env);

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/api/schema.gen.ts",
          "src/main.tsx",
          "src/test/**",
          "src/**/*.test.{ts,tsx}",
          "src/vite-env.d.ts",
        ],
      },
    },
  };
});
