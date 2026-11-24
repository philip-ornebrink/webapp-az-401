import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { routes } from "./routes";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe("routes", () => {
  it("shows the objectives page at the root, inside the shared layout", () => {
    renderAt("/");

    expect(screen.getByRole("heading", { level: 1, name: "Objectives" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Objectives" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navigates to the progress page from the navigation", async () => {
    const router = renderAt("/");

    await userEvent.click(screen.getByRole("link", { name: "Progress" }));

    expect(router.state.location.pathname).toBe("/progress");
    expect(screen.getByRole("heading", { level: 1, name: "Progress" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Progress" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Objectives" })).not.toHaveAttribute("aria-current");
  });

  it("shows a not found page for unknown addresses, with a way back", async () => {
    const router = renderAt("/no-such-page");

    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: "Go to the objectives" }));

    expect(router.state.location.pathname).toBe("/");
  });
});
