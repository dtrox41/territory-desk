import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, vi } from "vitest";

import { createFictionalNotificationService } from "../../services/fictional/notifications";
import type { NotificationService } from "../../services/notification-service";
import { NotificationCenter } from "./NotificationCenter";

afterEach(() => vi.restoreAllMocks());

function LeadDestination() {
  const location = useLocation();
  const state = location.state as { notificationId?: string } | null;
  return <p>Lead destination · origin {state?.notificationId ?? "none"}</p>;
}

function renderCenter(
  service: NotificationService = createFictionalNotificationService(),
) {
  return render(
    <MemoryRouter initialEntries={["/notifications"]}>
      <Routes>
        <Route
          element={<NotificationCenter notificationService={service} />}
          path="/notifications"
        />
        <Route element={<LeadDestination />} path="/leads/:leadId" />
        <Route element={<p>Leads destination</p>} path="/leads" />
      </Routes>
    </MemoryRouter>,
  );
}

describe("NotificationCenter", () => {
  it("shows three unread event records without presenting them as priority ranking", async () => {
    renderCenter();
    expect(
      await screen.findByRole("heading", { name: "3 unread notifications" }),
    ).toBeVisible();
    expect(
      screen.getByText("Newest first · not ranked by priority"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Mark All Read" })).toBeVisible();
    expect(screen.getAllByText("Unread")).toHaveLength(3);
    expect(screen.getByText("26 available")).toBeVisible();
  });

  it("filters by category and unread state without using free-text search", async () => {
    const user = userEvent.setup();
    renderCenter();
    await screen.findByText("26 available");
    await user.click(screen.getByRole("button", { name: "Lead Alerts" }));
    expect(await screen.findByText("5 available")).toBeVisible();
    expect(
      screen.queryByText(/qualification call is overdue/),
    ).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Unread Only"));
    expect(await screen.findByText("1 available")).toBeVisible();
    expect(screen.getByText(/New peer lead from Alex Grant/)).toBeVisible();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("marks one alert read without executing its linked action", async () => {
    const user = userEvent.setup();
    renderCenter();
    const message = await screen.findByRole("heading", {
      name: /New peer lead from Alex Grant/,
    });
    const card = message.closest("li");
    expect(card).not.toBeNull();
    await user.click(
      within(card as HTMLElement).getByRole("button", { name: "Mark Read" }),
    );
    expect(
      await screen.findByRole("heading", { name: "2 unread notifications" }),
    ).toBeVisible();
    expect(within(card as HTMLElement).getByText("Read")).toBeVisible();
    expect(screen.queryByText(/Lead destination/)).not.toBeInTheDocument();
  });

  it("requires confirmation before marking all authorized notifications read", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(
      await screen.findByRole("button", { name: "Mark All Read" }),
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(
      "This clears notification unread indicators. It does not complete any lead actions.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Mark All Read" }),
    );
    expect(
      await screen.findByRole("heading", { name: "You’re caught up" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Mark All Read" }),
    ).not.toBeInTheDocument();
  });

  it("carries only the opaque notification origin to Lead Detail", async () => {
    const user = userEvent.setup();
    renderCenter();
    await user.click(await screen.findByRole("link", { name: "Review Lead" }));
    expect(
      await screen.findByText(
        "Lead destination · origin demo-notification-001",
      ),
    ).toBeVisible();
  });

  it("keeps list and count failures independent", async () => {
    const first = renderCenter(
      createFictionalNotificationService({ failCount: true }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Notification count unavailable",
      }),
    ).toBeVisible();
    expect(await screen.findByText("26 available")).toBeVisible();
    first.unmount();

    renderCenter(createFictionalNotificationService({ failList: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Notifications could not be loaded",
    );
    expect(
      screen.getByRole("heading", { name: "3 unread notifications" }),
    ).toBeVisible();
  });

  it("preserves loaded text and blocks mutations and protected links offline", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderCenter();
    await screen.findByText(/New peer lead from Alex Grant/);
    online = false;
    void act(() => window.dispatchEvent(new Event("offline")));
    expect(screen.getByText("You’re offline")).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Review Lead" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Mark Read" })[0],
    ).toBeDisabled();
  });

  it("announces new records without moving the current list and loads earlier explicitly", async () => {
    const user = userEvent.setup();
    renderCenter();
    await screen.findByText("26 available");
    void act(() =>
      window.dispatchEvent(new Event("territory-desk:new-notification")),
    );
    expect(screen.getByText("New Notifications Available")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Load Earlier Notifications" }),
    );
    await waitFor(() =>
      expect(screen.getByText("August 9, 2026")).toBeVisible(),
    );
    expect(
      screen.queryByRole("button", { name: "Load Earlier Notifications" }),
    ).not.toBeInTheDocument();
  });
});
