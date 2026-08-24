import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import { fictionalRepresentativeDirectoryService } from "../../services/fictional/representative-directory";
import type { RepresentativeDirectoryService } from "../../services/representative-directory-service";
import { RepresentativeDirectory } from "./RepresentativeDirectory";

afterEach(() => vi.restoreAllMocks());

function renderDirectory(
  directoryService: RepresentativeDirectoryService = fictionalRepresentativeDirectoryService,
) {
  return render(
    <MemoryRouter>
      <RepresentativeDirectory directoryService={directoryService} />
    </MemoryRouter>,
  );
}

describe("RepresentativeDirectory", () => {
  it("shows a bounded alphabetical first page with safe card actions", async () => {
    renderDirectory();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Representative Directory",
      }),
    ).toBeVisible();
    expect(
      await screen.findByText(/Showing 6 of 13 representatives/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Show More Representatives" }),
    ).toBeVisible();
    expect(screen.queryByText("Jamie Cole")).not.toBeInTheDocument();

    const sendLead = screen.getAllByRole("link", { name: /Send Lead to/ })[0];
    expect(sendLead).toHaveAttribute("href", "/leads/new");
    expect(sendLead?.getAttribute("href")).not.toContain("representative=");
    expect(sendLead?.getAttribute("href")).not.toContain("zip=");
  });

  it("keeps duplicate names separate with accessible department and location context", async () => {
    const user = userEvent.setup();
    renderDirectory();
    const search = screen.getByLabelText("Search representatives");

    await user.type(search, "Cameron Brooks");

    await waitFor(() => {
      expect(
        screen.getAllByRole("heading", { name: "Cameron Brooks" }),
      ).toHaveLength(2);
    });
    expect(
      screen.getByRole("link", {
        name: /View Cameron Brooks, First Aid & Safety, Demo Location 202/,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: /View Cameron Brooks, Uniform, Demo Location 101/,
      }),
    ).toBeVisible();
  });

  it("filters by department and exposes the no-result recovery path", async () => {
    const user = userEvent.setup();
    renderDirectory();

    await screen.findByText(/Showing 6 of 13 representatives/);
    await user.selectOptions(
      screen.getByLabelText("Department or service"),
      "fire-protection",
    );
    expect(
      await screen.findByRole("heading", { name: "Robin Hale" }),
    ).toBeVisible();

    const search = screen.getByLabelText("Search representatives");
    await user.type(search, "No Such Person");
    expect(
      await screen.findByRole("heading", {
        name: "No representatives match this search.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Search Territory" }),
    ).toBeVisible();
  });

  it("preserves controls and offers retry when search fails", async () => {
    renderDirectory({
      ...fictionalRepresentativeDirectoryService,
      search: () => Promise.reject(new Error("fictional failure")),
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Representative search could not be completed",
    );
    expect(screen.getByLabelText("Search representatives")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeVisible();
  });

  it("preserves loaded results but blocks new actions after connection loss", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderDirectory();

    await screen.findByText(/Showing 6 of 13 representatives/);
    online = false;
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByText("You are offline.")).toBeVisible();
    expect(screen.getByLabelText("Search representatives")).toBeDisabled();
    expect(
      screen.queryByRole("link", { name: /Send Lead to/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Reconnect before starting a tracked handoff."),
    ).not.toHaveLength(0);
  });
});
