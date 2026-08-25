import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatReleaseTimestamp, ReleaseStamp } from "./ReleaseStamp";

describe("ReleaseStamp", () => {
  it("renders a short visible build and preserves the exact source build", () => {
    render(
      <ReleaseStamp
        buildId="4ad533f1234567890abcdef"
        releasedAt="2026-08-24T18:15:27Z"
      />,
    );

    const stamp = screen.getByText(
      "Build 4ad533f12345 · Released 2026-08-24 18:15:27 UTC",
    );
    expect(stamp).toHaveAttribute(
      "aria-label",
      "Exact source build 4ad533f1234567890abcdef. Released 2026-08-24 18:15:27 UTC.",
    );
    expect(stamp).toHaveAttribute("data-build-id", "4ad533f1234567890abcdef");
  });

  it("does not claim release metadata when either value is unavailable", () => {
    const { container } = render(
      <ReleaseStamp buildId="local-build" releasedAt="" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("rejects an invalid timestamp", () => {
    expect(formatReleaseTimestamp("not-a-date")).toBeNull();
  });
});
