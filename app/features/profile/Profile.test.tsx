import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, vi } from "vitest";

import { createFictionalProfileService } from "../../services/fictional/profile";
import type { ProfileService } from "../../services/profile-service";
import { Profile } from "./Profile";

afterEach(() => vi.restoreAllMocks());

function renderProfile(
  service: ProfileService = createFictionalProfileService(),
) {
  const router = createMemoryRouter(
    [
      { element: <Profile service={service} />, path: "/profile" },
      { element: <p>You are signed out</p>, path: "/signed-out" },
      { element: <p>Help destination</p>, path: "/help" },
    ],
    { initialEntries: ["/profile"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("Profile", () => {
  it("shows one fictional identity with source-controlled, preference, and system labels", async () => {
    renderProfile();
    expect(
      await screen.findByRole("heading", { name: "Avery Morgan" }),
    ).toBeVisible();
    expect(screen.getByText("Demo profile · Fictional identity")).toBeVisible();
    expect(screen.getAllByText("Managed by company directory")).toHaveLength(
      10,
    );
    expect(screen.getByText("You can change this")).toBeVisible();
    expect(screen.getAllByText("System status")).toHaveLength(2);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/theme|outlook|customer texting/i),
    ).not.toBeInTheDocument();
  });

  it("shows manager access as an additional role without listing employees", async () => {
    renderProfile();
    expect(await screen.findByText("Manager access")).toBeVisible();
    expect(screen.getByText("Representative access")).toBeVisible();
    expect(
      screen.getByText(/Every role belongs to this one identity/),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Open Team Insights" }),
    ).toHaveAttribute("href", "/insights#overview");
    expect(
      screen.getByText("Individual employees are not listed here."),
    ).toBeVisible();
  });

  it("omits manager actions for a representative profile", async () => {
    renderProfile(createFictionalProfileService({ manager: false }));
    expect(
      await screen.findByText(
        "Manager Insights permission is not included in this profile.",
      ),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Open Team Insights" }),
    ).not.toBeInTheDocument();
  });

  it("edits and saves only the approved reminder preference", async () => {
    const user = userEvent.setup();
    renderProfile();
    await user.click(
      await screen.findByRole("button", { name: "Edit Preferences" }),
    );
    const select = screen.getByLabelText("Default in-app follow-up reminder");
    expect(
      screen.getByRole("button", { name: "Save Preferences" }),
    ).toBeDisabled();
    await user.selectOptions(select, "one-hour-before");
    await user.click(screen.getByRole("button", { name: "Save Preferences" }));
    expect(await screen.findByText("Preferences saved")).toBeVisible();
    expect(screen.getByText("One hour before")).toBeVisible();
    expect(
      screen.queryByLabelText("Primary department"),
    ).not.toBeInTheDocument();
  });

  it("preserves an unsaved selection after a definite save failure", async () => {
    const user = userEvent.setup();
    renderProfile(createFictionalProfileService({ failSave: true }));
    await user.click(
      await screen.findByRole("button", { name: "Edit Preferences" }),
    );
    const select = screen.getByLabelText("Default in-app follow-up reminder");
    await user.selectOptions(select, "at-due-time");
    await user.click(screen.getByRole("button", { name: "Save Preferences" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Preferences were not saved",
    );
    expect(select).toHaveValue("at-due-time");
  });

  it("does not silently overwrite a concurrent preference change", async () => {
    const user = userEvent.setup();
    renderProfile(createFictionalProfileService({ saveConflict: true }));
    await user.click(
      await screen.findByRole("button", { name: "Edit Preferences" }),
    );
    await user.selectOptions(
      screen.getByLabelText("Default in-app follow-up reminder"),
      "at-due-time",
    );
    await user.click(screen.getByRole("button", { name: "Save Preferences" }));
    const conflict = await screen.findByRole("alert");
    expect(conflict).toHaveTextContent("Current saved value: One hour before");
    expect(conflict).toHaveTextContent("Your selection: At due time");
    expect(
      within(conflict).getByRole("button", { name: "Use Current Saved Value" }),
    ).toBeVisible();
  });

  it("shows routing mismatch without allowing a profile override", async () => {
    renderProfile(createFictionalProfileService({ mismatch: true }));
    expect(
      await screen.findByText("Routing profile needs review"),
    ).toBeVisible();
    expect(
      screen.getByText(/Profile cannot override this condition/),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Review Data Status" }),
    ).toHaveAttribute("href", "/data-status?source=territory#sources");
  });

  it("blocks preference editing offline while keeping Sign Out available", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    renderProfile();
    await screen.findByRole("heading", { name: "Avery Morgan" });
    online = false;
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
      await Promise.resolve();
    });
    expect(screen.getByText("Offline demo profile")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Edit Preferences" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeEnabled();
  });

  it("updates the non-fingerprinting device category when the viewport changes", async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    renderProfile();
    expect(await screen.findByText("Smartphone browser")).toBeVisible();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1440,
    });
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
      await Promise.resolve();
    });
    expect(screen.getByText("Laptop browser")).toBeVisible();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth,
    });
  });

  it("warns before sign out when a preference has unsaved changes", async () => {
    const user = userEvent.setup();
    renderProfile();
    await user.click(
      await screen.findByRole("button", { name: "Edit Preferences" }),
    );
    await user.selectOptions(
      screen.getByLabelText("Default in-app follow-up reminder"),
      "none",
    );
    await user.click(screen.getByRole("button", { name: "Sign Out" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Discard changes and sign out?");
    await user.click(
      within(dialog).getByRole("button", {
        name: "Discard Changes and Sign Out",
      }),
    );
    expect(await screen.findByText("You are signed out")).toBeVisible();
  });

  it("signs out immediately when no preference changes are pending", async () => {
    const user = userEvent.setup();
    renderProfile();
    await user.click(await screen.findByRole("button", { name: "Sign Out" }));
    expect(await screen.findByText("You are signed out")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("warns before navigating away with an unsaved preference", async () => {
    const user = userEvent.setup();
    renderProfile();
    await user.click(
      await screen.findByRole("button", { name: "Edit Preferences" }),
    );
    await user.selectOptions(
      screen.getByLabelText("Default in-app follow-up reminder"),
      "none",
    );
    await user.click(
      screen.getByRole("link", { name: "Open Help and Feedback" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Discard your changes?",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Stay and Continue" }),
    );
    expect(screen.getByRole("heading", { name: "My Profile" })).toBeVisible();
  });

  it("fails closed without exposing profile data to an unauthorized user", async () => {
    renderProfile(createFictionalProfileService({ access: "unauthorized" }));
    expect(
      await screen.findByRole("heading", { name: "Profile access required" }),
    ).toBeVisible();
    expect(screen.queryByText("Avery Morgan")).not.toBeInTheDocument();
    expect(screen.queryByText("Manager access")).not.toBeInTheDocument();
    expect(screen.queryByText("0102")).not.toBeInTheDocument();
  });
});
