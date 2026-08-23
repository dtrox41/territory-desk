import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Home from "./home";

describe("Home shell preview", () => {
  it("exposes one descriptive heading and the fictional safety boundary", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Home",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Current safety boundary" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No employee or customer records")).toBeVisible();
  });
});
