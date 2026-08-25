import { initials, reminderLabel } from "./profile";

describe("profile display helpers", () => {
  it("creates a neutral two-letter avatar without needing a photo", () => {
    expect(initials("Avery Morgan")).toBe("AM");
    expect(initials("Avery")).toBe("A");
  });

  it("maps only approved reminder values to labels", () => {
    expect(reminderLabel("one-day-before")).toBe("One day before");
    expect(reminderLabel("none")).toBe("No extra reminder");
  });
});
