import { render, screen } from "@testing-library/react";

import Home from "./home";

describe("Home scaffold", () => {
  it("labels the foundation as fictional and exposes one page heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The application foundation is ready.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Fictional prototype")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main-content");
  });
});
