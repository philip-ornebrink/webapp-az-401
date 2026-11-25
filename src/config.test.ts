import { describe, expect, it } from "vitest";
import { config, readConfig } from "./config";

describe("readConfig", () => {
  it("uses a relative base path as is", () => {
    expect(readConfig({ VITE_API_BASE_URL: "/api" })).toEqual({ apiBaseUrl: "/api" });
  });

  it("accepts an absolute URL and removes trailing slashes", () => {
    expect(readConfig({ VITE_API_BASE_URL: " https://api.example.net/ " })).toEqual({
      apiBaseUrl: "https://api.example.net",
    });
  });

  it.each([undefined, "", "  ", "/"])("fails when the base URL is %j", (value) => {
    expect(() => readConfig({ VITE_API_BASE_URL: value })).toThrow(/VITE_API_BASE_URL is not set/);
  });

  it("fails on a value that is neither a path nor a URL", () => {
    expect(() => readConfig({ VITE_API_BASE_URL: "api.example.net" })).toThrow(
      /must be a path such as \/api or an absolute URL/,
    );
  });
});

describe("config", () => {
  it("reads the committed .env default", () => {
    expect(config.apiBaseUrl).toBe("/api");
  });
});
