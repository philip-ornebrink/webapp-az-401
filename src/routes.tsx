import type { RouteObject } from "react-router";
import { AppLayout } from "./layout/AppLayout";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ObjectivesPage } from "./pages/ObjectivesPage";
import { ProgressPage } from "./pages/ProgressPage";

// Every page renders inside AppLayout, which holds the header and navigation.
// main.tsx uses these routes with a browser router, the tests with a memory router.
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <ObjectivesPage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
