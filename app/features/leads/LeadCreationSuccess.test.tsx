import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { LeadCreationSuccess } from "./LeadCreationSuccess";

describe("LeadCreationSuccess", () => {
  it("distinguishes a saved handoff from a failed SMS attempt", () => {
    render(
      <MemoryRouter>
        <LeadCreationSuccess
          anotherDepartmentContext={{
            copiedCustomer: {
              city: "St. Louis",
              companyName: "Signal Test Labs",
              contactAvailability: "phone",
              contactName: "Pat Demo",
              email: "",
              noContactReason: "",
              phone: "555-010-1040",
              state: "MO",
              streetAddress: "",
              zip: "63101",
            },
            excludedDepartment: "facility-services",
            source: "another-department",
          }}
          receipt={{
            createdAtLabel: "Aug 24, 2026, 10:00 AM",
            handoffId: "lead-demo-0001",
            inAppNotificationState: "queued",
            recipientDepartment: "Facility Services",
            recipientId: "rep-jordan-lee",
            recipientName: "Jordan Lee",
            responseTargetLabel: "Tuesday, August 25, 2026 at 5:00 PM CDT",
            smsState: "failed",
            status: "pending_acceptance",
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Lead sent to Jordan Lee" }),
    ).toBeVisible();
    expect(
      screen.getByText(/Lead saved; SMS alert could not be completed/),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Create Another Department Handoff" }),
    ).toHaveAttribute("href", "/leads/new");
  });
});
