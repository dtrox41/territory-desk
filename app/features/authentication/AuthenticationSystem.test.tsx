import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, vi } from "vitest";

import { createFictionalAuthenticationService } from "../../services/fictional/authentication";
import type { AuthenticationService } from "../../services/authentication-service";
import { AuthenticationReturn } from "./AuthenticationReturn";
import { SignIn } from "./SignIn";
import { SignInHelp } from "./SignInHelp";
import { SystemStatePage } from "./SystemStatePage";

afterEach(() => vi.restoreAllMocks());

function renderAuthentication(
  service: AuthenticationService = createFictionalAuthenticationService(),
  initialEntry = "/sign-in",
) {
  const router = createMemoryRouter(
    [
      { element: <SignIn service={service} />, path: "/sign-in" },
      {
        element: <AuthenticationReturn service={service} />,
        path: "/auth/return",
      },
      { element: <p>Fictional Home opened</p>, path: "/" },
      { element: <p>Fictional My Work opened</p>, path: "/leads" },
    ],
    { initialEntries: [initialEntry] },
  );
  return render(<RouterProvider router={router} />);
}

describe("fictional sign-in", () => {
  it("shows a credential-free, visibly fictional entry screen", async () => {
    renderAuthentication();
    expect(
      await screen.findByRole("heading", { name: "Sign in to Territory Desk" }),
    ).toBeVisible();
    expect(
      screen.getByText(/not connected to Cintas systems or production data/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Enter Fictional Demo" }),
    ).toBeVisible();
    expect(screen.queryByLabelText(/email|password/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/remember me|create account|register/i),
    ).not.toBeInTheDocument();
  });

  it("clears and establishes a fictional manager persona before safe return", async () => {
    const user = userEvent.setup();
    renderAuthentication(
      createFictionalAuthenticationService(),
      "/sign-in?returnTo=%2Fleads",
    );
    await user.click(
      await screen.findByRole("button", { name: "Enter Fictional Demo" }),
    );
    expect(screen.getByText("New Business Representative")).toBeVisible();
    expect(screen.getByText("Authorized Manager")).toBeVisible();
    expect(screen.getByText("Data-Exception Representative")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Use Authorized Manager Demo" }),
    );
    expect(
      await screen.findByText(
        "Fictional My Work opened",
        {},
        { timeout: 1500 },
      ),
    ).toBeVisible();
  });

  it("rejects an external return destination and falls back to Home", async () => {
    const user = userEvent.setup();
    renderAuthentication(
      createFictionalAuthenticationService(),
      "/sign-in?returnTo=https%3A%2F%2Fattacker.example",
    );
    await user.click(
      await screen.findByRole("button", { name: "Enter Fictional Demo" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Use New Business Representative Demo",
      }),
    );
    expect(
      await screen.findByText("Fictional Home opened", {}, { timeout: 1500 }),
    ).toBeVisible();
  });

  it("keeps the intentionally bundled fictional demo available offline", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderAuthentication();
    await screen.findByRole("heading", { name: "Sign in to Territory Desk" });
    online = false;
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
      await Promise.resolve();
    });
    expect(
      screen.getByText("Connection required for production sign-in"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Enter Fictional Demo" }),
    ).toBeEnabled();
  });

  it("fails a direct authentication return without disclosing provider data", async () => {
    renderAuthentication(
      createFictionalAuthenticationService(),
      "/auth/return",
    );
    expect(
      await screen.findByRole(
        "heading",
        { name: "Sign-in could not be completed" },
        { timeout: 1500 },
      ),
    ).toBeVisible();
    expect(screen.getByText("AUTH-DEMO-RETURN")).toBeVisible();
    expect(
      screen.queryByText(/token=|authorization code|stack trace/i),
    ).not.toBeInTheDocument();
  });
});

describe("authentication help and system states", () => {
  it("provides privacy-minimized sign-in help without collecting identity", () => {
    const router = createMemoryRouter([{ element: <SignInHelp />, path: "/" }]);
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { name: "Get sign-in help" }),
    ).toBeVisible();
    expect(
      screen.getByText("Identity support contact not configured"),
    ).toBeVisible();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/manager role|department:/i),
    ).not.toBeInTheDocument();
  });

  it("does not disclose a protected record on Access Denied", () => {
    const router = createMemoryRouter([
      { element: <SystemStatePage state="access-denied" />, path: "/" },
    ]);
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", {
        name: "You do not have access to this page or record",
      }),
    ).toBeVisible();
    expect(screen.getByText(/does not confirm whether/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Return Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Open My Work" })).toHaveAttribute(
      "href",
      "/leads",
    );
  });

  it("shows the explicit discard path only when unsaved work exists", () => {
    const router = createMemoryRouter([
      {
        element: <SystemStatePage state="session-expired" unsavedWork />,
        path: "/",
      },
    ]);
    render(<RouterProvider router={router} />);
    expect(
      screen.getByText("Unsaved work is held in this tab only"),
    ).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: "Discard Unsaved Work and Sign Out",
      }),
    ).toHaveAttribute("href", "/signed-out");
  });

  it.each([
    ["failed", "definitely failed"],
    ["succeeded", "definitely succeeded"],
    ["unknown", "result is unknown"],
  ] as const)("renders a privacy-safe %s command outcome", (outcome, text) => {
    const router = createMemoryRouter([
      {
        element: (
          <SystemStatePage errorOutcome={outcome} state="unexpected-error" />
        ),
        path: "/",
      },
    ]);
    const view = render(<RouterProvider router={router} />);
    expect(screen.getByText(new RegExp(text))).toBeVisible();
    expect(screen.getByText(/Safe reference: TD-DEMO-PAGE/)).toBeVisible();
    expect(view.container).not.toHaveTextContent(/SQL|Bearer|customer name/i);
  });

  it("uses a generic non-disclosing not-found state", () => {
    const router = createMemoryRouter([
      { element: <SystemStatePage state="not-found" />, path: "/" },
    ]);
    render(<RouterProvider router={router} />);
    const card = screen.getByRole("heading", {
      name: "Page not found",
    }).parentElement;
    expect(card).not.toBeNull();
    expect(within(card!).getByText(/No requested URL/)).toBeVisible();
    expect(document.body).not.toHaveTextContent("SECRET-LEAD-99");
  });
});
