import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import { AppShell } from "./AppShell";

function renderShell(pathname = "/", managerView = false) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppShell managerView={managerView}>
        <h1 tabIndex={-1}>Route content</h1>
      </AppShell>
    </MemoryRouter>,
  );
}

describe("AppShell", () => {
  it("renders the safety disclosure and consistent primary navigation", () => {
    renderShell("/leads/fictional-1");

    expect(
      screen.getByText(
        "Fictional Prototype — Do not enter real employee or customer information",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");

    const primaryNavigationLandmarks = screen.getAllByRole("navigation", {
      name: "Primary navigation",
    });
    expect(primaryNavigationLandmarks).toHaveLength(2);

    for (const navigation of primaryNavigationLandmarks) {
      expect(within(navigation).getAllByRole("link")).toHaveLength(5);
      expect(
        within(navigation).getByRole("link", {
          name: "Leads, 5 leads require action",
        }),
      ).toHaveAttribute("aria-current", "page");
      expect(
        within(navigation).getByRole("link", { name: "Send Lead" }),
      ).not.toHaveAttribute("aria-current");
    }

    expect(
      screen.getAllByRole("link", {
        name: "Notifications, 3 unread notifications",
      }),
    ).toHaveLength(2);
  });

  it("keeps the action badge aligned with committed lead updates", () => {
    renderShell("/leads/demo-lead-1001");

    act(() => {
      window.dispatchEvent(
        new CustomEvent("territory-desk:leads-updated", {
          detail: { actionCount: 4 },
        }),
      );
    });

    expect(
      screen.getAllByRole("link", {
        name: "Leads, 4 leads require action",
      }),
    ).toHaveLength(2);
  });

  it("opens and closes representative secondary navigation", async () => {
    const user = userEvent.setup();
    renderShell();

    const openButton = screen.getByRole("button", {
      name: "Open profile and secondary navigation",
    });
    await user.click(openButton);

    const dialog = screen.getByRole("dialog", {
      name: "Profile and more",
    });
    expect(dialog).toBeVisible();
    expect(
      within(dialog).getByRole("link", { name: "Data Status" }),
    ).toBeVisible();
    expect(
      within(dialog).queryByRole("link", { name: "Manager Insights" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", {
        name: "Close secondary navigation",
      }),
    );
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(openButton).toHaveFocus();
  });

  it("moves focus to the page heading after route navigation", async () => {
    const user = userEvent.setup();
    renderShell();

    const mobileNavigation = screen.getAllByRole("navigation", {
      name: "Primary navigation",
    })[1];
    expect(mobileNavigation).toBeDefined();

    await user.click(
      within(mobileNavigation as HTMLElement).getByRole("link", {
        name: "Territory",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Route content" }),
    ).toHaveFocus();
  });

  it("adds Manager Insights only for the manager shell variant", async () => {
    const user = userEvent.setup();
    renderShell("/insights", true);

    expect(
      screen.getByRole("complementary", { name: "Application navigation" }),
    ).toContainElement(screen.getByRole("link", { name: "Manager Insights" }));

    await user.click(
      screen.getByRole("button", {
        name: "Open profile and secondary navigation",
      }),
    );
    expect(
      within(screen.getByRole("dialog")).getByRole("link", {
        name: "Manager Insights",
      }),
    ).toHaveAttribute("aria-current", "page");
  });
});
