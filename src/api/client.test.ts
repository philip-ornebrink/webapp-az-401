import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./client";

function jsonResponse(status: number, body: unknown, contentType = "application/json") {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": contentType } });
}

// openapi-fetch calls fetch with a single Request, so the tests read the request from the first argument.
function fakeFetch(respond: () => Response) {
  return vi.fn<typeof globalThis.fetch>(async () => respond());
}

function requestOf(fetch: ReturnType<typeof fakeFetch>, call = 0): Request {
  return fetch.mock.calls[call]![0] as Request;
}

describe("createApiClient", () => {
  it("returns the response body and sends the access token", async () => {
    const fetch = fakeFetch(() => jsonResponse(200, { status: "ok" }));
    const api = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: async () => "token-123",
      fetch,
    });

    await expect(api.getHealth()).resolves.toEqual({ status: "ok" });

    const request = requestOf(fetch);
    expect(request.url).toBe("http://api.test/healthz");
    expect(request.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("sends no Authorization header when there is no token", async () => {
    const fetch = fakeFetch(() => jsonResponse(200, []));
    const api = createApiClient({
      baseUrl: "http://api.test",
      getAccessToken: async () => undefined,
      fetch,
    });

    await api.listObjectives();

    expect(requestOf(fetch).headers.has("Authorization")).toBe(false);
  });

  it("throws ApiError with the problem details on an error response", async () => {
    const problem = {
      type: "https://studytracker.example/problems/quiz-already-submitted",
      title: "The quiz has already been submitted",
      status: 409,
      detail: "Quiz 1 was submitted at 2026-12-08T10:15:00Z.",
    };
    const fetch = fakeFetch(() => jsonResponse(409, problem, "application/problem+json"));
    const api = createApiClient({ baseUrl: "http://api.test", fetch });

    const error = await api
      .submitQuiz("3f1c2a9e-6b1d-4a43-9d1e-2f5b8c7a0d11", [{ questionId: 1, optionId: 2 }])
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, problem, message: problem.detail });
  });

  it("throws ApiError without problem details when the body isn't a problem", async () => {
    const fetch = fakeFetch(() => new Response("Bad gateway", { status: 502 }));
    const api = createApiClient({ baseUrl: "http://api.test", fetch });

    const error = await api.getProgress().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 502,
      problem: undefined,
      message: "Request failed with status 502",
    });
  });
});
