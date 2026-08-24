import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { HomeDashboard } from "../features/dashboard/HomeDashboard";
import { fictionalHomeDashboardService } from "../services/fictional/home-dashboard";

describe("Home dashboard", () => {
  it("prioritizes fictional lead actions and collaboration context", async () => {
    const dashboard = await fictionalHomeDashboardService.getDashboard();

    render(
      <MemoryRouter>
        <HomeDashboard dashboard={dashboard} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Good morning, Taylor",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Quick actions" }),
    ).toHaveTextContent("Send Lead");
    expect(
      screen.getByRole("heading", { name: "Action Required" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Response target missed")).toBeVisible();
    expect(screen.getByText("Follow-up overdue")).toBeVisible();
    expect(screen.getByText("Demo data")).toBeVisible();
    expect(screen.queryByText(/calls per day/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/customer visits/i)).not.toBeInTheDocument();
  });
});
