import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, vi } from "vitest";

import { createFictionalHelpService } from "../../services/fictional/help";
import type { HelpService } from "../../services/help-service";
import { HelpAndFeedback } from "./HelpAndFeedback";
import { HelpRequestDetail } from "./HelpRequestDetail";
import { HelpTopic } from "./HelpTopic";

afterEach(() => vi.restoreAllMocks());

function renderHelp(
  service: HelpService = createFictionalHelpService(),
  initialEntry = "/help",
) {
  const router = createMemoryRouter(
    [
      { element: <HelpAndFeedback service={service} />, path: "/help" },
      { element: <HelpTopic service={service} />, path: "/help/:topicSlug" },
      {
        element: <HelpRequestDetail service={service} />,
        path: "/help/requests/:requestId",
      },
      { element: <p>Data Status destination</p>, path: "/data-status" },
    ],
    { initialEntries: [initialEntry] },
  );
  return render(<RouterProvider router={router} />);
}

describe("Help and Feedback", () => {
  it("keeps the five routing choices distinct and directs data issues correctly", async () => {
    renderHelp();
    expect(
      await screen.findByRole("heading", {
        name: "What do you need help with?",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Learn how Territory Desk works/ }),
    ).toBeVisible();
    expect(
      screen
        .getAllByRole("link", {
          name: /Report incorrect territory or employee information/,
        })
        .find((link) => link.getAttribute("href")?.startsWith("/data-status")),
    ).toHaveAttribute("href", "/data-status#my-reports");
    expect(
      screen
        .getAllByRole("link", { name: /Get sign-in or access help/ })
        .find((link) => link.getAttribute("href") === "/help/account-access"),
    ).toHaveAttribute("href", "/help/account-access");
    expect(
      screen.getByRole("button", { name: /Report an application problem/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Suggest an improvement/ }),
    ).toBeVisible();
  });

  it("searches only approved topics without placing text in the URL", async () => {
    const user = userEvent.setup();
    renderHelp();
    const search = await screen.findByLabelText("Search Territory Desk help");
    await user.type(search, "  SEND   A LEAD ");
    expect(screen.getByText("1 matching topic")).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /Send a cross-department lead/ }),
    ).not.toHaveLength(0);
    expect(window.location.search).toBe("");
  });

  it("shows a safe no-result state without inventing an answer", async () => {
    const user = userEvent.setup();
    renderHelp();
    await user.type(
      await screen.findByLabelText("Search Territory Desk help"),
      "quantum payroll export",
    );
    expect(screen.getByText("No help topic matched")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /Instructions, correction/ }),
    ).toBeVisible();
  });

  it("submits one simulated application problem with reviewed safe diagnostics", async () => {
    const user = userEvent.setup();
    renderHelp();
    await user.click(
      await screen.findByRole("button", {
        name: /Report an application problem/,
      }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Report an application problem",
    });
    await user.type(
      within(dialog).getByLabelText("Action you were trying to complete"),
      "Close the filters",
    );
    await user.type(
      within(dialog).getByLabelText(/Short summary/),
      "Keyboard focus is difficult to locate after closing filters",
    );
    expect(within(dialog).getByText("Application version")).toBeVisible();
    expect(within(dialog).queryByText(/full URL/i)).toBeVisible();
    expect(
      within(dialog).queryByLabelText(/attachment|screenshot/i),
    ).toBeNull();
    await user.click(
      within(dialog).getByRole("button", { name: "Submit Fictional Request" }),
    );
    expect(
      await screen.findByText(/Fictional request submitted · HELP-DEMO/),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Keyboard focus is difficult to locate after closing filters",
      ),
    ).toBeVisible();
  });

  it("rejects prohibited content without repeating the sensitive entry", async () => {
    const user = userEvent.setup();
    renderHelp();
    await user.click(
      await screen.findByRole("button", { name: /Suggest an improvement/ }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Suggest an improvement",
    });
    await user.type(
      within(dialog).getByLabelText(/Problem to solve/),
      "My password should appear inside this support request",
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "Submit Fictional Suggestion",
      }),
    );
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Remove credentials",
    );
    expect(within(dialog).getByRole("alert")).not.toHaveTextContent(
      "My password",
    );
  });

  it("preserves a form after a definite save failure", async () => {
    const user = userEvent.setup();
    renderHelp(createFictionalHelpService({ failSubmit: true }));
    await user.click(
      await screen.findByRole("button", { name: /Suggest an improvement/ }),
    );
    const field = screen.getByLabelText(/Problem to solve/);
    await user.type(field, "Finding the right topic takes too many steps");
    await user.click(
      screen.getByRole("button", { name: "Submit Fictional Suggestion" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Request was not submitted",
    );
    expect(field).toHaveValue("Finding the right topic takes too many steps");
  });

  it("keeps bundled topics readable while disabling request history offline", async () => {
    let online = true;
    vi.spyOn(window.navigator, "onLine", "get").mockImplementation(
      () => online,
    );
    const user = userEvent.setup();
    renderHelp();
    await screen.findByRole("heading", { name: "Browse by task" });
    online = false;
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
      await Promise.resolve();
    });
    expect(screen.getByText("Offline help")).toBeVisible();
    expect(
      screen.getByText(/Reconnect to load your request history/),
    ).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: /Send a cross-department lead/ }),
    ).not.toHaveLength(0);
    await user.click(
      screen.getByRole("button", { name: /Suggest an improvement/ }),
    );
    expect(
      screen.getByRole("button", { name: "Submit Fictional Suggestion" }),
    ).toBeDisabled();
  });

  it("fails closed before loading topics or request history", async () => {
    renderHelp(createFictionalHelpService({ access: "unauthorized" }));
    expect(
      await screen.findByRole("heading", { name: "Help access required" }),
    ).toBeVisible();
    expect(screen.queryByText("HELP-DEMO-K8V4")).not.toBeInTheDocument();
    expect(screen.queryByText("Browse by task")).not.toBeInTheDocument();
  });
});

describe("Help topic and request detail", () => {
  it("renders the complete approved article structure", async () => {
    renderHelp(
      createFictionalHelpService(),
      "/help/send-cross-department-lead",
    );
    expect(
      await screen.findByRole("heading", {
        name: "Send a cross-department lead",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Prerequisites" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Steps" })).toBeVisible();
    expect(screen.getByText(/Content version:/)).toBeVisible();
    expect(screen.getByText(/Last reviewed:/)).toBeVisible();
  });

  it("does not expose a missing or other-reporter request", async () => {
    renderHelp(
      createFictionalHelpService({ requestOwner: "other" }),
      "/help/requests/HELP-DEMO-K8V4",
    );
    expect(
      await screen.findByRole("heading", { name: "Help request unavailable" }),
    ).toBeVisible();
    expect(
      screen.getByText("No request information was disclosed"),
    ).toBeVisible();
    expect(
      screen.queryByText(/Keyboard focus is unclear/),
    ).not.toBeInTheDocument();
  });

  it("shows reporter-visible detail without internal support information", async () => {
    renderHelp(createFictionalHelpService(), "/help/requests/HELP-DEMO-K8V4");
    expect(
      await screen.findByRole("heading", {
        name: "Keyboard focus is unclear after closing the filter panel",
      }),
    ).toBeVisible();
    expect(screen.getByText("HELP-DEMO-K8V4")).toBeVisible();
    expect(screen.getByText(/Internal assignments/)).toBeVisible();
    expect(screen.queryByText(/assigned engineer/i)).not.toBeInTheDocument();
  });
});
