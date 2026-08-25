import { act, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router";

import AppLayout from "../../routes/app-layout";
import Insights from "../../routes/insights";
import { createFictionalAuthenticationService } from "../../services/fictional/authentication";
import type { AuthenticationService } from "../../services/authentication-service";
import { FictionalSessionProvider } from "./FictionalSessionProvider";

function LocationProbe({ label }: { label: string }) {
  const location = useLocation();
  return <p>{`${label}:${location.pathname}${location.search}`}</p>;
}

function renderIntegratedApp(
  service: AuthenticationService,
  initialEntry = "/",
) {
  const router = createMemoryRouter(
    [
      {
        children: [
          {
            children: [
              { element: <h1 tabIndex={-1}>Home workspace</h1>, index: true },
              {
                element: <h1 tabIndex={-1}>Leads workspace</h1>,
                path: "leads",
              },
              { element: <Insights />, path: "insights" },
            ],
            element: <AppLayout />,
          },
          {
            element: <LocationProbe label="sign-in" />,
            path: "sign-in",
          },
          { element: <p>access-denied</p>, path: "access-denied" },
        ],
        element: (
          <FictionalSessionProvider service={service}>
            <Outlet />
          </FictionalSessionProvider>
        ),
      },
    ],
    { initialEntries: [initialEntry] },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}

async function authenticate(
  service: AuthenticationService,
  persona: "representative" | "manager" | "data-exception",
  destination = "/",
) {
  await service.beginDemoSignIn(persona, destination);
  await service.completeAuthenticationReturn();
}

describe("fictional session integration", () => {
  it("keeps protected content hidden while resolving and returns a direct link through sign-in", async () => {
    const service = createFictionalAuthenticationService();
    renderIntegratedApp(service, "/leads?view=waiting#private");

    expect(screen.queryByText("Leads workspace")).not.toBeInTheDocument();
    expect(
      await screen.findByText("sign-in:/sign-in?returnTo=%2Fleads"),
    ).toBeVisible();
  });

  it("shows a representative shell without manager navigation", async () => {
    const service = createFictionalAuthenticationService();
    await authenticate(service, "representative");
    renderIntegratedApp(service);

    expect(await screen.findByText("Home workspace")).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Manager Insights" }),
    ).not.toBeInTheDocument();
  });

  it("denies representative access to the manager route without rendering insights", async () => {
    const service = createFictionalAuthenticationService();
    await authenticate(service, "representative", "/insights");
    renderIntegratedApp(service, "/insights");

    expect(await screen.findByText("access-denied")).toBeVisible();
    expect(screen.queryByText("Team Insights")).not.toBeInTheDocument();
  });

  it("allows an authorized manager to open Team Insights", async () => {
    const service = createFictionalAuthenticationService();
    await authenticate(service, "manager", "/insights");
    renderIntegratedApp(service, "/insights");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Team Insights" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Manager Insights" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("reacts to sign-out and prevents the protected workspace from remaining visible", async () => {
    const service = createFictionalAuthenticationService();
    await authenticate(service, "representative", "/leads");
    const { router } = renderIntegratedApp(service, "/leads");
    expect(await screen.findByText("Leads workspace")).toBeVisible();

    await service.signOut();
    window.dispatchEvent(new Event("territory-desk:signed-out"));

    await waitFor(() =>
      expect(screen.queryByText("Leads workspace")).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByText("sign-in:/sign-in?returnTo=%2Fleads"),
    ).toBeVisible();

    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe("/sign-in");
  });
});
