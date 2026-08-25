import { createFictionalProfileService } from "./profile";

describe("fictional profile service", () => {
  it("returns only the current fictional identity and masked contacts", async () => {
    const profile = await createFictionalProfileService().getProfile();
    expect(profile.currentRepresentativeId).toBe("rep-avery-morgan");
    expect(profile.maskedEmail).toBe("a••••@example.com");
    expect(profile.maskedSmsDestination).toBe("••• ••• 0102");
    expect(profile.roles.map((role) => role.label)).toEqual([
      "Representative access",
      "Manager access",
    ]);
  });

  it("saves only the approved reminder preference with versioning", async () => {
    const service = createFictionalProfileService();
    const result = await service.savePreference({
      defaultReminderLeadTime: "one-hour-before",
      idempotencyKey: "preference-command-1",
      reviewedVersion: 3,
    });
    expect(result.type).toBe("saved");
    if (result.type === "saved") {
      expect(result.profile.preference).toMatchObject({
        defaultReminderLeadTime: "one-hour-before",
        version: 4,
      });
      expect(result.profile.department).toBe("Uniform");
    }
  });

  it("uses idempotency to prevent duplicate preference versions", async () => {
    const service = createFictionalProfileService();
    const command = {
      defaultReminderLeadTime: "15-minutes-before" as const,
      idempotencyKey: "same-command",
      reviewedVersion: 3,
    };
    const first = await service.savePreference(command);
    const second = await service.savePreference(command);
    expect(first).toEqual(second);
    if (second.type === "saved")
      expect(second.profile.preference.version).toBe(4);
  });

  it("returns the current committed value instead of overwriting a conflict", async () => {
    const result = await createFictionalProfileService({
      saveConflict: true,
    }).savePreference({
      defaultReminderLeadTime: "at-due-time",
      idempotencyKey: "conflicting-command",
      reviewedVersion: 3,
    });
    expect(result.type).toBe("conflict");
    if (result.type === "conflict") {
      expect(result.current.preference.defaultReminderLeadTime).toBe(
        "one-hour-before",
      );
      expect(result.current.preference.version).toBe(4);
    }
  });

  it("supports representative, mismatch, unauthorized, and partial states", async () => {
    expect(
      (await createFictionalProfileService({ manager: false }).getProfile())
        .roles,
    ).toHaveLength(1);
    expect(
      (await createFictionalProfileService({ mismatch: true }).getProfile())
        .routing.state,
    ).toBe("version-mismatch");
    await expect(
      createFictionalProfileService({ access: "unauthorized" }).getAccess(),
    ).resolves.toEqual({ type: "unauthorized" });
    expect(
      (
        await createFictionalProfileService({
          failPreferenceLoad: true,
        }).getProfile()
      ).preferenceState,
    ).toBe("unavailable");
  });
});
