import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, vi } from "vitest";

import {
  createFictionalLeadsListService,
  fictionalLeadsListService,
} from "../../services/fictional/leads-list";
import type { LeadsListService } from "../../services/leads-list-service";
import { LeadsList, resetLeadListSessionState } from "./LeadsList";

afterEach(() => vi.restoreAllMocks());
beforeEach(() => resetLeadListSessionState());

function LocationEvidence() {
  const location = useLocation();
  return (
    <output aria-label="Current URL">
      {location.pathname + location.search}
    </output>
  );
}

function renderList(
  leadsService: LeadsListService = fictionalLeadsListService,
  entry = "/leads",
) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <LeadsList leadsService={leadsService} />
      <LocationEvidence />
    </MemoryRouter>,
  );
}

describe("LeadsList", () => {
  it("starts with the ranked personal action queue and safe detail actions", async () => {
    renderList();

    expect(
      screen.getByRole("heading", { level: 1, name: "Leads" }),
    ).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Lead list controls" }),
    ).toBeVisible();
    expect(await screen.findByText("5 leads")).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Action Required" }),
    ).toBeVisible();
    const companies = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(companies.slice(1)).toEqual([
      "Northstar Packaging",
      "Blue River Pediatrics",
      "Summit Auto Group",
      "Lakeside Foods",
      "Harbor Tooling",
    ]);
    expect(screen.getByRole("link", { name: "Respond Now" })).toHaveAttribute(
      "href",
      "/leads/demo-lead-1001",
    );
    expect(
      screen.queryByRole("button", { name: "Accept" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("Why this is ranked here")).toHaveLength(5);
  });

  it("switches views through a safe URL and keeps search text out of it", async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByText("5 leads");

    await user.selectOptions(screen.getByLabelText("View"), "waiting");
    expect(await screen.findByText("2 leads")).toBeVisible();
    expect(screen.getByLabelText("Current URL")).toHaveTextContent(
      "/leads?view=waiting",
    );

    await user.type(screen.getByLabelText("Search this view"), "Meadow Lane");
    await waitFor(() =>
      expect(screen.getByText(/1 matching 2 total/)).toBeVisible(),
    );
    expect(
      screen.getByRole("heading", { name: "Meadow Lane Pharmacy" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Current URL")).not.toHaveTextContent(
      "Meadow",
    );
  });

  it("applies allowlisted filters only after confirmation", async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByText("5 leads");

    await user.click(screen.getByRole("button", { name: "Filters" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeVisible();
    await user.selectOptions(
      screen.getByLabelText("Department or service", { selector: "select" }),
      "first-aid-safety",
    );
    await user.selectOptions(
      screen.getByLabelText("Exact source division", { selector: "select" }),
      "first-aid-safety",
    );
    expect(screen.getByLabelText("Current URL")).toHaveTextContent("/leads");
    await user.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(await screen.findByText(/1 matching 5 total/)).toBeVisible();
    expect(screen.getByLabelText("Current URL")).toHaveTextContent(
      "department=first-aid-safety",
    );
    expect(screen.getByLabelText("Current URL")).toHaveTextContent(
      "division=first-aid-safety",
    );
    expect(screen.getByRole("button", { name: "Filters (2)" })).toBeVisible();
    await user.click(
      screen.getByRole("button", {
        name: "Remove Division: First Aid & Safety filter",
      }),
    );
    expect(screen.getByRole("button", { name: "Filters (1)" })).toBeVisible();
  });

  it("loads sent history in explicit bounded pages", async () => {
    const user = userEvent.setup();
    renderList(fictionalLeadsListService, "/leads?view=sent");

    expect(await screen.findByText("24 leads")).toBeVisible();
    expect(screen.getByRole("button", { name: "Load More" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "Load More" }));
    await waitFor(() =>
      expect(screen.getAllByRole("article")).toHaveLength(24),
    );
    expect(
      screen.queryByRole("button", { name: "Load More" }),
    ).not.toBeInTheDocument();
  });

  it("restores active-session search and loaded page range after remount", async () => {
    const user = userEvent.setup();
    const firstRender = renderList(
      fictionalLeadsListService,
      "/leads?view=sent",
    );
    await screen.findByText("24 leads");
    await user.click(screen.getByRole("button", { name: "Load More" }));
    await waitFor(() =>
      expect(screen.getAllByRole("article")).toHaveLength(24),
    );
    firstRender.unmount();

    const secondRender = renderList(
      fictionalLeadsListService,
      "/leads?view=sent",
    );
    await waitFor(() =>
      expect(screen.getAllByRole("article")).toHaveLength(24),
    );
    await user.type(screen.getByLabelText("Search this view"), "Oak Street");
    await waitFor(() =>
      expect(screen.getByText(/1 matching 24 total/)).toBeVisible(),
    );
    secondRender.unmount();

    renderList(fictionalLeadsListService, "/leads?view=sent");
    expect(screen.getByLabelText("Search this view")).toHaveValue("Oak Street");
    expect(await screen.findByText(/1 matching 24 total/)).toBeVisible();
  });

  it("preserves the independent count and list failure paths", async () => {
    const { unmount } = renderList(
      createFictionalLeadsListService({ failCounts: true }),
    );
    expect(await screen.findByText("Count unavailable")).toBeVisible();
    expect(await screen.findByText("5 leads")).toBeVisible();
    unmount();

    renderList(createFictionalLeadsListService({ failList: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Leads could not be loaded",
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  it("keeps authorized cards visible when the connection drops", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderList();
    await screen.findByRole("heading", { name: "Northstar Packaging" });

    online = false;
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByText("You are offline.")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Northstar Packaging" }),
    ).toBeVisible();
  });

  it("announces remote updates without moving the current list", async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByText("5 leads");

    act(() => {
      window.dispatchEvent(new Event("territory-desk:leads-updated"));
    });
    expect(screen.getByText(/New updates available/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Refresh List" }));
    await waitFor(() =>
      expect(
        screen.queryByText(/New updates available/),
      ).not.toBeInTheDocument(),
    );
  });
});
