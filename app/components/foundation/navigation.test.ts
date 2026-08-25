import { getPageTitle, isNavigationItemActive } from "./navigation";

describe("shell navigation contract", () => {
  it("keeps Send Lead and Leads active states distinct", () => {
    expect(isNavigationItemActive("/leads/new", "/leads/new")).toBe(true);
    expect(isNavigationItemActive("/leads/new", "/leads")).toBe(false);
    expect(isNavigationItemActive("/leads/fictional-1", "/leads")).toBe(true);
  });

  it("provides stable page titles for primary and nested routes", () => {
    expect(getPageTitle("/")).toBe("Home");
    expect(getPageTitle("/directory/fictional-1")).toBe(
      "Representative Detail",
    );
    expect(getPageTitle("/help/requests/fictional-1")).toBe("Help Request");
    expect(getPageTitle("/unknown")).toBe("Page not found");
  });
});
