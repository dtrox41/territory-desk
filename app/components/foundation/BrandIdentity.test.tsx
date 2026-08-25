import { render, screen } from "@testing-library/react";

import { BrandIdentity } from "./BrandIdentity";

describe("BrandIdentity", () => {
  it("uses real product text and exposes the approved descriptor", () => {
    render(<BrandIdentity showDescriptor variant="compact" />);

    expect(screen.getByText("Territory Desk")).toBeVisible();
    expect(
      screen.getByText("Cross-Division Sales Command Center"),
    ).toBeVisible();
    expect(screen.getByText("TD")).toHaveAttribute("aria-hidden", "true");
  });
});
