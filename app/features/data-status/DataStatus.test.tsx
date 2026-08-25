import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import { createFictionalDataStatusService } from "../../services/fictional/data-status";
import type { DataStatusService } from "../../services/data-status-service";
import { DataStatus } from "./DataStatus";

afterEach(() => vi.restoreAllMocks());

function renderStatus(
  service: DataStatusService = createFictionalDataStatusService(),
  route = "/data-status",
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DataStatus service={service} />
    </MemoryRouter>,
  );
}

describe("DataStatus", () => {
  it("shows action safety before source evidence and labels demo integrations truthfully", async () => {
    renderStatus();
    expect(
      await screen.findByRole("heading", {
        name: "Routing available with 2 known exceptions",
      }),
    ).toBeVisible();
    expect(
      screen.getByText("Prototype — simulated services · Demo data"),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "What can I safely do now?" }),
    ).toBeVisible();
    expect(
      screen.getAllByText("Simulation only", { selector: "span" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByText("Not connected", { selector: "span" }),
    ).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Data sources" })).toBeVisible();
  });

  it("expands an allowlisted source from the route without exposing unsafe URL content", async () => {
    renderStatus(
      undefined,
      "/data-status?source=directory&record=ignored#sources",
    );
    const button = await screen.findByRole("button", {
      name: /Representative directory/,
    });
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Demo directory v12")).toBeVisible();
    expect(screen.queryByText("ignored")).not.toBeInTheDocument();
    expect(screen.getByText("1 within this demo scope")).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Ambiguous territory assignment" }),
    ).not.toBeInTheDocument();
  });

  it("submits an auditable report and explicitly states routing did not change", async () => {
    const user = userEvent.setup();
    renderStatus();
    await user.click(
      await screen.findByRole("button", { name: /Territory routing/ }),
    );
    await user.click(screen.getByRole("button", { name: "Report a problem" }));
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Short factual description"),
      "The displayed routing appears to list the wrong owner.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Submit Report" }),
    );
    expect(
      await screen.findByText(/Tracking reference DQ-DEMO-1102/),
    ).toBeVisible();
    expect(screen.getByText(/Routing data was not changed/)).toBeVisible();
    expect(screen.getByText("3 fictional reports")).toBeVisible();
  });

  it("preserves report input after definite submission failure", async () => {
    const user = userEvent.setup();
    renderStatus(createFictionalDataStatusService({ failReport: true }));
    await user.click(
      await screen.findByRole("button", { name: /Territory routing/ }),
    );
    await user.click(screen.getByRole("button", { name: "Report a problem" }));
    const description = screen.getByLabelText("Short factual description");
    await user.type(
      description,
      "Routing appears different from the approved map.",
    );
    await user.click(screen.getByRole("button", { name: "Submit Report" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Report was not submitted",
    );
    expect(description).toHaveValue(
      "Routing appears different from the approved map.",
    );
  });

  it("keeps the last loaded snapshot read only while offline", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderStatus();
    await screen.findByRole("heading", { name: "Data sources" });
    online = false;
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
      await Promise.resolve();
    });
    expect(screen.getByText("Offline demo status")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Refresh Status" }),
    ).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Known issues" })).toBeVisible();
  });

  it("does not reveal status details to an unauthorized user", async () => {
    renderStatus(createFictionalDataStatusService({ access: "unauthorized" }));
    expect(
      await screen.findByRole("heading", {
        name: "Data Status access required",
      }),
    ).toBeVisible();
    expect(screen.queryByText("Territory routing")).not.toBeInTheDocument();
    expect(screen.queryByText(/known exceptions/i)).not.toBeInTheDocument();
  });

  it("fails without displaying an Available summary when loading evidence fails", async () => {
    renderStatus(createFictionalDataStatusService({ failLoad: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No overall Available state is shown",
    );
    expect(
      screen.queryByRole("heading", { name: /Core actions are available/ }),
    ).not.toBeInTheDocument();
  });
});
