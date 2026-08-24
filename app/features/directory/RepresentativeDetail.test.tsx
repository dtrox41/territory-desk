import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import { fictionalDirectoryRepresentatives } from "../../services/fictional/representative-directory";
import { RepresentativeDetail } from "./RepresentativeDetail";

afterEach(() => vi.restoreAllMocks());

function getRepresentative(id: string) {
  const representative = fictionalDirectoryRepresentatives.find(
    (candidate) => candidate.id === id,
  );
  if (!representative) throw new Error(`Missing fictional profile: ${id}`);
  return representative;
}

describe("RepresentativeDetail", () => {
  it("separates fictional contact utilities from a tracked handoff", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RepresentativeDetail
          representative={getRepresentative("rep-jordan-lee")}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Jordan Lee" }),
    ).toBeVisible();
    expect(screen.getByText("jordan.lee@example.com")).toBeVisible();
    const sendLead = screen.getByRole("link", { name: "Send Lead" });
    expect(sendLead).toHaveAttribute(
      "href",
      "/leads/new?representative=rep-jordan-lee&source=directory",
    );

    await user.click(screen.getByRole("button", { name: "Call" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "No external contact was placed",
    );
  });

  it("disables conflicting direct contacts but keeps territory-validated handoff entry", () => {
    render(
      <MemoryRouter>
        <RepresentativeDetail
          representative={getRepresentative("rep-robin-hale-review")}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Needs Review")).toBeVisible();
    expect(screen.getByRole("button", { name: "Call" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Email" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Send Lead" })).toBeVisible();
  });

  it("prevents assignment to an inactive historical representative", () => {
    render(
      <MemoryRouter>
        <RepresentativeDetail
          representative={getRepresentative("rep-jamie-cole-inactive")}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Inactive")).toBeVisible();
    expect(screen.getByText(/cannot receive a new handoff/)).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Find Current Territory Owner" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Send Lead" }),
    ).not.toBeInTheDocument();
  });

  it("fails closed for an unknown profile identifier", () => {
    render(
      <MemoryRouter>
        <RepresentativeDetail representative={null} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Representative not available" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Return to Directory" }),
    ).toBeVisible();
  });

  it("disables contact and handoff entry when the session is offline", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    render(
      <MemoryRouter>
        <RepresentativeDetail
          representative={getRepresentative("rep-jordan-lee")}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Call" })).toBeDisabled();
    expect(
      screen.getByText(/session is offline and cannot be revalidated/),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Send Lead" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Reconnect before starting a tracked handoff."),
    ).toBeVisible();
  });
});
