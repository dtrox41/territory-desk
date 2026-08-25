import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, vi } from "vitest";

import type { LeadEntryContext } from "../../domain/lead-creation";
import { createFictionalLeadCreationService } from "../../services/fictional/lead-creation";
import { LeadCreation } from "./LeadCreation";

afterEach(() => vi.restoreAllMocks());

function Destination() {
  const location = useLocation();
  return <p>Destination: {location.pathname}</p>;
}

function renderCreation(entryContext: LeadEntryContext = { source: "global" }) {
  const service = createFictionalLeadCreationService();
  return render(
    <MemoryRouter initialEntries={["/leads/new"]}>
      <Routes>
        <Route
          element={
            <LeadCreation entryContext={entryContext} leadService={service} />
          }
          path="/leads/new"
        />
        <Route element={<Destination />} path="/leads/:leadId" />
      </Routes>
    </MemoryRouter>,
  );
}

async function confirmFacilityRoute(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(
    screen.getByLabelText("Requested department or service"),
    "facility-services",
  );
  await user.type(screen.getByLabelText("Customer ZIP code"), "63101");
  await user.click(
    screen.getByRole("button", { name: "Check Current Assignment" }),
  );
  expect(
    await screen.findByRole("heading", { name: "Jordan Lee" }),
  ).toBeVisible();
  await user.click(
    screen.getByRole("button", { name: "Continue to Customer" }),
  );
}

async function completeCustomer(
  user: ReturnType<typeof userEvent.setup>,
  companyName = "Fictional Packaging Group",
) {
  await user.type(
    screen.getByLabelText("Company or organization name"),
    companyName,
  );
  await user.click(screen.getByLabelText("Phone available"));
  await user.type(screen.getByLabelText("Customer phone"), "555-010-1040");
  await user.click(
    screen.getByRole("button", { name: "Continue to Opportunity" }),
  );
}

async function completeOpportunity(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText("What does the customer need?"),
    "Customer requested a fictional facility-services site walkthrough.",
  );
  await user.click(screen.getByLabelText("Within 7 days"));
  await user.click(
    screen.getByRole("button", { name: "Continue to Review & Send" }),
  );
}

describe("LeadCreation", () => {
  it("does not allow the user to skip current territory confirmation", async () => {
    const user = userEvent.setup();
    renderCreation();
    await user.click(
      screen.getByRole("button", { name: "Continue to Customer" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Select a requested department or service",
    );
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(
      screen.getAllByText(/exact five-digit customer ZIP/).length,
    ).toBeGreaterThan(0);
  });

  it("shows a directory mismatch and requires explicit current-assignment selection", async () => {
    const user = userEvent.setup();
    renderCreation({
      representativeId: "rep-alex-rivera",
      source: "directory",
    });
    await user.selectOptions(
      screen.getByLabelText("Requested department or service"),
      "facility-services",
    );
    await user.type(screen.getByLabelText("Customer ZIP code"), "63101");
    await user.click(
      screen.getByRole("button", { name: "Check Current Assignment" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Directory selection does not match current territory",
      }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Jordan Lee" })).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Use Current Assignment" }),
    );
    expect(
      screen.getByText(/Current assignment selected: Jordan Lee/),
    ).toBeInTheDocument();
  });

  it("blocks ambiguous and open territory rather than fabricating a recipient", async () => {
    const user = userEvent.setup();
    renderCreation();
    await user.selectOptions(
      screen.getByLabelText("Requested department or service"),
      "first-aid-safety",
    );
    await user.type(screen.getByLabelText("Customer ZIP code"), "63101");
    await user.click(
      screen.getByRole("button", { name: "Check Current Assignment" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Routing needs review" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Request Routing Help" }),
    ).toBeVisible();
  });

  it("completes the four-step workflow and navigates to the saved handoff", async () => {
    const user = userEvent.setup();
    renderCreation();
    await confirmFacilityRoute(user);
    await completeCustomer(user);
    await completeOpportunity(user);

    expect(
      screen.getByRole("heading", { name: "Review & Send" }),
    ).toBeVisible();
    expect(
      screen.getByText(/respond by the end of the next business day/),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Send Lead" }));
    expect(
      await screen.findByText("Destination: /leads/lead-demo-0001"),
    ).toBeVisible();
  });

  it("requires a reason before continuing past a possible duplicate", async () => {
    const user = userEvent.setup();
    renderCreation();
    await confirmFacilityRoute(user);
    await completeCustomer(user, "Northstar Packaging");
    await completeOpportunity(user);

    expect(
      await screen.findByRole("heading", {
        name: "A similar handoff may already exist",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Send Lead" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Explain why a separate handoff is still needed",
    );
    await user.type(
      screen.getByLabelText("Why is a separate handoff needed?"),
      "Different customer need and receiving conversation.",
    );
    await user.click(screen.getByRole("button", { name: "Send Lead" }));
    expect(
      await screen.findByText("Destination: /leads/lead-demo-0001"),
    ).toBeVisible();
  });

  it("keeps the active form visible but disables routing and sending offline", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderCreation();
    online = false;
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByText("You are offline.")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Check Current Assignment" }),
    ).toBeDisabled();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Continue to Customer" }),
      ).toBeDisabled(),
    );
  });
});
