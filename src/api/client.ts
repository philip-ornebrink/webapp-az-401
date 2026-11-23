// Typed client for the study tracker API.
//
// The types come from src/api/schema.gen.ts, which is generated from api/openapi.yaml
// with `npm run generate:api`. Don't edit the generated file by hand.
//
// Every endpoint goes through a function below, and each function is typed against the
// generated paths. When the spec renames or removes an endpoint, or changes a parameter or
// request body, regenerating makes these functions fail to type-check, and `npm run build`
// fails with them.
import createClient, { type Middleware } from "openapi-fetch";
import type { components, paths } from "./schema.gen";

type Schemas = components["schemas"];

export type Problem = Schemas["Problem"];
export type HealthStatus = Schemas["HealthStatus"];
export type SkillArea = Schemas["SkillArea"];
export type ObjectiveSummary = Schemas["ObjectiveSummary"];
export type ObjectiveDetail = Schemas["ObjectiveDetail"];
export type ChecklistItem = Schemas["ChecklistItem"];
export type ChecklistItemUpdateResult = Schemas["ChecklistItemUpdateResult"];
export type Quiz = Schemas["Quiz"];
export type QuizQuestion = Schemas["QuizQuestion"];
export type QuizOption = Schemas["QuizOption"];
export type QuizAnswer = Schemas["QuizAnswer"];
export type QuizSummary = Schemas["QuizSummary"];
export type QuizResult = Schemas["QuizResult"];
export type AnswerResult = Schemas["AnswerResult"];
export type ObjectiveProgress = Schemas["ObjectiveProgress"];

/**
 * Thrown for every non-2xx response. `problem` is set when the API answered with
 * problem details (RFC 9457). Branch on `problem.type`, not on `problem.detail`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: Problem | undefined;

  constructor(response: Response, body: unknown) {
    const problem = isProblem(body) ? body : undefined;
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${response.status}`);
    this.name = "ApiError";
    this.status = response.status;
    this.problem = problem;
  }
}

function isProblem(body: unknown): body is Problem {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Problem).type === "string" &&
    typeof (body as Problem).title === "string" &&
    typeof (body as Problem).status === "number"
  );
}

async function unwrap<T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await request;
  if (!response.ok) {
    throw new ApiError(response, error);
  }
  return data as T;
}

export interface ApiClientOptions {
  /** API base URL, for example http://localhost:8080. Set per environment. */
  baseUrl: string;
  /**
   * Returns an Entra ID access token for the API, or undefined when signed out.
   * Called before every request, so it can refresh tokens silently.
   */
  getAccessToken?: () => Promise<string | undefined>;
  /** Override fetch, for example in tests. */
  fetch?: typeof globalThis.fetch;
}

export function createApiClient(options: ApiClientOptions) {
  const client = createClient<paths>({ baseUrl: options.baseUrl, fetch: options.fetch });

  const { getAccessToken } = options;
  if (getAccessToken) {
    const auth: Middleware = {
      async onRequest({ request }) {
        const token = await getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        return request;
      },
    };
    client.use(auth);
  }

  return {
    // Health
    getHealth: (): Promise<HealthStatus> => unwrap(client.GET("/healthz")),
    getReadiness: (): Promise<HealthStatus> => unwrap(client.GET("/readyz")),

    // Objectives
    listObjectives: (): Promise<ObjectiveSummary[]> => unwrap(client.GET("/objectives")),
    getObjective: (objectiveId: number): Promise<ObjectiveDetail> =>
      unwrap(client.GET("/objectives/{objectiveId}", { params: { path: { objectiveId } } })),
    setChecklistItem: (
      objectiveId: number,
      itemId: number,
      done: boolean,
    ): Promise<ChecklistItemUpdateResult> =>
      unwrap(
        client.PUT("/objectives/{objectiveId}/items/{itemId}", {
          params: { path: { objectiveId, itemId } },
          body: { done },
        }),
      ),

    // Quizzes
    listQuizzes: (filter: { objectiveId?: number } = {}): Promise<QuizSummary[]> =>
      unwrap(client.GET("/quizzes", { params: { query: filter } })),
    startQuiz: (objectiveId: number): Promise<Quiz> =>
      unwrap(client.POST("/quizzes", { body: { objectiveId } })),
    getQuiz: (quizId: string): Promise<Quiz> =>
      unwrap(client.GET("/quizzes/{quizId}", { params: { path: { quizId } } })),
    submitQuiz: (quizId: string, answers: QuizAnswer[]): Promise<QuizResult> =>
      unwrap(
        client.POST("/quizzes/{quizId}/answers", {
          params: { path: { quizId } },
          body: { answers },
        }),
      ),
    getQuizResult: (quizId: string): Promise<QuizResult> =>
      unwrap(client.GET("/quizzes/{quizId}/result", { params: { path: { quizId } } })),

    // Progress
    getProgress: (): Promise<ObjectiveProgress[]> => unwrap(client.GET("/progress")),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
