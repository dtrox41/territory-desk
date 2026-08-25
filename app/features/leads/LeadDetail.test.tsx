import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, vi } from "vitest";

import { createFictionalLeadDetailService } from "../../services/fictional/lead-detail";
import type { LeadDetailService } from "../../services/lead-detail-service";
import { LeadDetail } from "./LeadDetail";

afterEach(() => vi.restoreAllMocks());

function renderDetail(
  service: LeadDetailService = createFictionalLeadDetailService(),
  entry = "/leads/demo-lead-1001",
) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          element={<LeadDetail leadService={service} />}
          path="/leads/:leadId"
        />
        <Route element={<p>My Leads destination</p>} path="/leads" />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LeadDetail", () => {
  it("restores the prior Team Insights context for a manager drill-down", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          "/insights?period=30&records=missed-first-response#exceptions",
          {
            pathname: "/leads/demo-lead-1001",
            state: {
              insightsOrigin:
                "/insights?period=30&records=missed-first-response#exceptions",
            },
          },
        ]}
        initialIndex={1}
      >
        <Routes>
          <Route
            element={
              <LeadDetail leadService={createFictionalLeadDetailService()} />
            }
            path="/leads/:leadId"
          />
          <Route element={<p>Team Insights destination</p>} path="/insights" />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      await screen.findByRole("button", { name: "← Back to Team Insights" }),
    );
    expect(await screen.findByText("Team Insights destination")).toBeVisible();
  });

  it("shows the action, ownership, routing, and accountability without conflating view and response", async () => {
    renderDetail();
    expect(
      await screen.findByRole("heading", { name: "Northstar Packaging" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Respond Now" })).toBeVisible();
    expect(screen.getByText("Pending Acceptance")).toBeVisible();
    expect(screen.getByText(/viewing alone does not complete/)).toBeVisible();
    expect(screen.getAllByText("Taylor Morgan").length).toBeGreaterThan(0);
    expect(screen.getByText("Jamie Chen")).toBeVisible();
  });

  it("requires validation, reviews, and confirms an acceptance", async () => {
    const user = userEvent.setup();
    renderDetail();
    await user.click(
      await screen.findByRole("button", { name: "Respond Now" }),
    );
    await user.click(screen.getByRole("button", { name: "Review Response" }));
    expect(
      screen.getByText("Choose Accept, Need Information, or Decline."),
    ).toBeVisible();
    await user.click(screen.getByLabelText(/Accept/));
    await user.type(
      screen.getByLabelText("Shared next-action summary"),
      "Call the customer to confirm requirements",
    );
    await user.click(screen.getByRole("button", { name: "Review Response" }));
    expect(
      screen.getByRole("heading", { name: "Review response" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Confirm Response" }));
    expect(
      await screen.findByRole("heading", { name: "Lead accepted" }),
    ).toBeVisible();
    expect(screen.getAllByText("Accepted").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Work is up to date" }),
    ).toBeVisible();
  });

  it("opens the requested activity panel from the URL and filters history", async () => {
    const user = userEvent.setup();
    renderDetail(
      createFictionalLeadDetailService(),
      "/leads/demo-lead-1001#activity",
    );
    expect(
      await screen.findByRole("heading", { name: "Activity history" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(
      await screen.findByText("Recipient alert queued for fictional delivery."),
    ).toBeVisible();
    expect(
      screen.queryByText("Cross-department handoff created and routed."),
    ).not.toBeInTheDocument();
  });

  it("keeps core details available when secondary blocks fail", async () => {
    renderDetail(
      createFictionalLeadDetailService({
        failActivity: true,
        failSupplementary: true,
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Northstar Packaging" }),
    ).toBeVisible();
    expect(
      await screen.findByText(/Follow-up information could not be loaded/),
    ).toBeVisible();
    await userEvent
      .setup()
      .click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Activity could not be loaded",
    );
  });

  it("uses one generic unavailable state for invalid and unknown identifiers", async () => {
    const first = renderDetail(
      createFictionalLeadDetailService(),
      "/leads/private-customer-name",
    );
    expect(
      await screen.findByRole("heading", { name: "Lead unavailable" }),
    ).toBeVisible();
    first.unmount();
    renderDetail(createFictionalLeadDetailService(), "/leads/demo-lead-9999");
    expect(
      await screen.findByRole("heading", { name: "Lead unavailable" }),
    ).toBeVisible();
    expect(
      screen.getByText(/No customer details were disclosed/),
    ).toBeVisible();
  });

  it("preserves loaded content and disables writes offline", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderDetail();
    await screen.findByRole("heading", { name: "Northstar Packaging" });
    online = false;
    void act(() => window.dispatchEvent(new Event("offline")));
    expect(screen.getByText("You’re offline")).toBeVisible();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Respond Now" }),
      ).toBeDisabled(),
    );
  });

  it("reports an authorized core load to a notification-origin callback", async () => {
    const onAuthorizedLoad = vi.fn();
    render(
      <MemoryRouter initialEntries={["/leads/demo-lead-1001"]}>
        <Routes>
          <Route
            element={
              <LeadDetail
                leadService={createFictionalLeadDetailService()}
                onAuthorizedLoad={onAuthorizedLoad}
              />
            }
            path="/leads/:leadId"
          />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole("heading", { name: "Northstar Packaging" });
    expect(onAuthorizedLoad).toHaveBeenCalledWith("demo-lead-1001");
  });

  it("does not report a notification open when linked core access fails", async () => {
    const onAuthorizedLoad = vi.fn();
    render(
      <MemoryRouter initialEntries={["/leads/demo-lead-9999"]}>
        <Routes>
          <Route
            element={
              <LeadDetail
                leadService={createFictionalLeadDetailService()}
                onAuthorizedLoad={onAuthorizedLoad}
              />
            }
            path="/leads/:leadId"
          />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole("heading", { name: "Lead unavailable" });
    expect(onAuthorizedLoad).not.toHaveBeenCalled();
  });
});
