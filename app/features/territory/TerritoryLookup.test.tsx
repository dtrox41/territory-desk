import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import { fictionalTerritoryLookupService } from "../../services/fictional/territory-lookup";
import type { TerritoryLookupService } from "../../services/territory-lookup-service";
import { TerritoryLookup } from "./TerritoryLookup";

function renderLookup(
  lookupService: TerritoryLookupService = fictionalTerritoryLookupService,
) {
  return render(
    <MemoryRouter>
      <TerritoryLookup lookupService={lookupService} />
    </MemoryRouter>,
  );
}

describe("TerritoryLookup", () => {
  it("rejects partial ZIP input without inventing a complete ZIP", async () => {
    const user = userEvent.setup();
    renderLookup();

    expect(
      screen.getByRole("heading", { level: 1, name: "Find Territory" }),
    ).toBeVisible();
    expect(screen.queryByText("Last verified")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No human verification timestamp is claimed/),
    ).toBeVisible();

    await user.type(screen.getByLabelText("ZIP code or city"), "631");
    await user.click(screen.getByRole("button", { name: "Find Territory" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter all five ZIP-code digits before searching.",
    );
    expect(
      screen.queryByText("Search criteria accepted"),
    ).not.toBeInTheDocument();
  });

  it("requires state disambiguation for a repeated city name", async () => {
    const user = userEvent.setup();
    renderLookup();

    await user.type(screen.getByLabelText("ZIP code or city"), "Springfield");
    await user.click(screen.getByRole("button", { name: "Find Territory" }));

    expect(
      await screen.findByRole("heading", {
        name: "Choose a state for Springfield",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Springfield, Illinois/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Springfield, Missouri/ }),
    ).toBeVisible();
  });

  it("supports keyboard selection from ZIP suggestions", async () => {
    const user = userEvent.setup();
    renderLookup();
    const input = screen.getByLabelText("ZIP code or city");

    await user.type(input, "63");
    expect(
      await screen.findByRole("option", { name: /63101.*St\. Louis, MO/ }),
    ).toBeVisible();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("63101");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows safe assigned, open, and conflicting results for an exact ZIP", async () => {
    const user = userEvent.setup();
    renderLookup();

    await user.type(screen.getByLabelText("ZIP code or city"), "63101");
    await user.click(screen.getByRole("button", { name: "Find Territory" }));

    expect(
      await screen.findByRole("heading", { level: 2, name: "St. Louis, MO" }),
    ).toBeVisible();
    expect(screen.getByText(/5 matching service assignments/)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Routing assignment conflict" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Open Territory" }),
    ).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Send Lead" })).toHaveLength(3);
  });

  it("requires an exact city ZIP before exposing Send Lead", async () => {
    const user = userEvent.setup();
    renderLookup();

    await user.type(screen.getByLabelText("ZIP code or city"), "Columbia, MO");
    await user.click(screen.getByRole("button", { name: "Find Territory" }));

    expect(
      await screen.findByRole("heading", {
        name: "Select the customer's exact ZIP",
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Send Lead" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use 65201" }));

    expect(
      await screen.findAllByRole("link", { name: "Send Lead" }),
    ).toHaveLength(3);
  });

  it("preserves the search and offers retry when results fail", async () => {
    const user = userEvent.setup();
    renderLookup({
      ...fictionalTerritoryLookupService,
      getResults: () => Promise.reject(new Error("fictional failure")),
    });

    const input = screen.getByLabelText("ZIP code or city");
    await user.type(input, "63101");
    await user.click(screen.getByRole("button", { name: "Find Territory" }));

    expect(
      await screen.findByRole("heading", {
        name: "Territory results could not be loaded",
      }),
    ).toBeVisible();
    expect(input).toHaveValue("63101");
    expect(screen.getByRole("button", { name: "Try Again" })).toBeVisible();
  });
});
