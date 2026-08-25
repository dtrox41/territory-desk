import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { PwaInstallGuide } from "./PwaInstallGuide";

const originalMatchMedia =
  typeof window.matchMedia === "function"
    ? window.matchMedia.bind(window)
    : undefined;

describe("PwaInstallGuide", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows Apple Home Screen guidance on an iPhone browser", async () => {
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("iPhone");

    render(<PwaInstallGuide />);
    await act(() => vi.runOnlyPendingTimersAsync());

    expect(
      screen.getByRole("complementary", { name: "Install Territory Desk" }),
    ).toBeVisible();
    expect(
      screen.getByText("In Safari, tap Share, then Add to Home Screen."),
    ).toBeVisible();
  });

  it("offers the browser installation action on Android", async () => {
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("Android");
    const prompt = vi.fn().mockResolvedValue(undefined);
    render(<PwaInstallGuide />);
    await act(() => vi.runOnlyPendingTimersAsync());

    const installPromptEvent = Object.assign(new Event("beforeinstallprompt"), {
      prompt,
      userChoice: Promise.resolve({
        outcome: "accepted" as const,
        platform: "web",
      }),
    });
    act(() => {
      window.dispatchEvent(installPromptEvent);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Install" }));
      await Promise.resolve();
    });

    expect(prompt).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("complementary", {
        name: "Install Territory Desk",
      }),
    ).not.toBeInTheDocument();
  });

  it("does not prompt when the app is already running standalone", async () => {
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("iPhone");
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    render(<PwaInstallGuide />);
    await act(() => vi.runOnlyPendingTimersAsync());

    expect(
      screen.queryByRole("complementary", {
        name: "Install Territory Desk",
      }),
    ).not.toBeInTheDocument();
  });
});
