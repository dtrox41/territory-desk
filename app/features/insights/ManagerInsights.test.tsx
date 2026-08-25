import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { vi } from "vitest";

import {
  createFictionalManagerInsightsService,
  type FictionalManagerInsightsService,
} from "../../services/fictional/manager-insights";
import type { ManagerInsightsService } from "../../services/manager-insights-service";
import { ManagerInsights } from "./ManagerInsights";

function LeadDestination() {
  const location = useLocation();
  const state = location.state as { insightsOrigin?: string } | null;
  return <p>Lead opened from {state?.insightsOrigin ?? "no origin"}</p>;
}

function renderInsights(
  service: ManagerInsightsService = createFictionalManagerInsightsService(),
  initialEntry = "/insights#overview",
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          element={<ManagerInsights service={service} />}
          path="/insights"
        />
        <Route element={<LeadDestination />} path="/leads/:leadId" />
        <Route element={<p>Home destination</p>} path="/" />
        <Route element={<p>My Work destination</p>} path="/leads" />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ManagerInsights", () => {
  it("answers the manager question with reconciled fictional workflow metrics", async () => {
    renderInsights();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Team Insights" }),
    ).toBeVisible();
    expect(screen.getByText(/North Location/)).toBeVisible();
    expect(screen.getByText("Demo data")).toBeVisible();
    expect(
      await screen.findByRole("heading", { name: "Needs Attention" }),
    ).toBeVisible();
    expect(
      screen.getAllByText("First-response target completion")[0],
    ).toBeVisible();
    expect(
      screen.getAllByText("Closed-loop update completion")[0],
    ).toBeVisible();
    expect(
      screen.getByText(/Qualified progression is not enabled/),
    ).toBeVisible();
    expect(screen.queryByText(/employee ranking/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/revenue forecast/i)).not.toBeInTheDocument();
  });

  it("opens a permission-safe exception drill-down without changing lead state", async () => {
    const user = userEvent.setup();
    renderInsights();
    const section = await screen.findByRole("heading", {
      name: "Needs Attention",
    });
    const card = section.closest("section");
    expect(card).not.toBeNull();

    await user.click(
      within(card as HTMLElement).getAllByRole("button", {
        name: "Review records",
      })[0]!,
    );

    expect(
      await screen.findByRole("heading", { name: "Missed first response" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Missed first response" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /accept/i }),
    ).not.toBeInTheDocument();
  });

  it("passes only an Insights return location when opening an authorized lead", async () => {
    const user = userEvent.setup();
    renderInsights(undefined, "/insights?period=30&records=all#exceptions");
    const openLinks = await screen.findAllByRole("link", { name: "Open lead" });
    await user.click(openLinks[0]!);

    expect(
      await screen.findByText(
        "Lead opened from /insights?period=30&records=all#exceptions",
      ),
    ).toBeVisible();
  });

  it("shows no-data truth instead of zero percent for an empty authorized filter", async () => {
    renderInsights(
      undefined,
      "/insights?period=30&sending=uniform&receiving=uniform#overview",
    );

    expect(
      await screen.findByRole("heading", {
        name: "No eligible handoffs for this period and scope",
      }),
    ).toBeVisible();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("fails closed for a representative and for a manager with no scope", async () => {
    const first = renderInsights(
      createFictionalManagerInsightsService({ access: "unauthorized" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Manager access required" }),
    ).toBeVisible();
    expect(screen.getByText(/No team counts/)).toBeVisible();
    expect(screen.queryByText(/Northstar Packaging/)).not.toBeInTheDocument();
    first.unmount();

    renderInsights(
      createFictionalManagerInsightsService({ access: "no-scope" }),
    );
    expect(
      await screen.findByRole("heading", { name: "No team scope is assigned" }),
    ).toBeVisible();
    expect(screen.getByText(/zero performance/)).toBeVisible();
  });

  it("removes prior results immediately after a simulated scope removal", async () => {
    const service: FictionalManagerInsightsService =
      createFictionalManagerInsightsService();
    renderInsights(service);
    expect(await screen.findByText(/North Location/)).toBeVisible();

    service.setAccess("unauthorized");
    void act(() =>
      window.dispatchEvent(new Event("territory-desk:manager-scope-changed")),
    );

    expect(
      await screen.findByRole("heading", { name: "Manager access required" }),
    ).toBeVisible();
    expect(screen.queryByText(/North Location/)).not.toBeInTheDocument();
  });

  it("holds visible counts steady when new activity arrives", async () => {
    renderInsights();
    const heading = await screen.findByRole("heading", {
      name: "Needs Attention",
    });
    const section = heading.closest("section");
    const before = within(section as HTMLElement).getByLabelText(
      /unique handoffs/,
    ).textContent;

    void act(() =>
      window.dispatchEvent(new Event("territory-desk:insights-updated")),
    );

    expect(screen.getByText("New updates available")).toBeVisible();
    expect(
      within(section as HTMLElement).getByLabelText(/unique handoffs/),
    ).toHaveTextContent(before ?? "");
  });

  it("keeps validated sections visible when one metric section is partial", async () => {
    renderInsights(
      createFictionalManagerInsightsService({
        partialSection: "department-pairs",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Primary KPIs" }),
    ).toBeVisible();
    expect(
      screen.getAllByText("First-response target completion")[0],
    ).toBeVisible();
    const unavailable = screen.getByText(
      "Department comparisons did not return a compatible result.",
    );
    expect(unavailable).toBeVisible();
  });

  it("shows the safe access state if authorization lookup fails", async () => {
    const service = createFictionalManagerInsightsService({ failAccess: true });
    renderInsights(service);

    expect(
      await screen.findByRole("heading", { name: "Team Insights unavailable" }),
    ).toBeVisible();
    expect(screen.getByText(/No prior manager results/)).toBeVisible();
  });

  it("hides conflicting rates when a result version cannot be reconciled", async () => {
    renderInsights(createFictionalManagerInsightsService({ mismatch: true }));

    expect(
      await screen.findByRole("heading", {
        name: "Insights could not be reconciled",
      }),
    ).toBeVisible();
    expect(screen.getByText(/Conflicting rates are hidden/)).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Primary KPIs" }),
    ).not.toBeInTheDocument();
  });

  it("does not reorder results when offline", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderInsights();
    await screen.findByRole("heading", { name: "Needs Attention" });
    online = false;
    void act(() => window.dispatchEvent(new Event("offline")));

    expect(screen.getByText("Offline demo data")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Needs Attention" }),
    ).toBeVisible();
  });
});
