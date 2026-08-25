import { createFictionalAuthenticationService } from "./authentication";

describe("fictional authentication service", () => {
  it("clears prior state before establishing a selected demo persona", async () => {
    const service = createFictionalAuthenticationService();
    await service.beginDemoSignIn("manager", "/insights");
    const result = await service.completeAuthenticationReturn();
    expect(result).toEqual(
      expect.objectContaining({
        destination: "/insights",
        session: expect.objectContaining({ manager: true }),
        type: "completed",
      }),
    );
    await expect(service.getSession()).resolves.toEqual(
      expect.objectContaining({ manager: true, personaId: "manager" }),
    );
    expect(await service.completeAuthenticationReturn()).toEqual(
      expect.objectContaining({ type: "failed" }),
    );
  });

  it("clears the fictional session without persisting it in the browser", async () => {
    const service = createFictionalAuthenticationService();
    await expect(service.getSession()).resolves.toBeNull();
    await service.beginDemoSignIn("representative", "/leads");
    await service.completeAuthenticationReturn();
    await expect(service.getSession()).resolves.toEqual(
      expect.objectContaining({ manager: false, personaId: "representative" }),
    );
    await service.signOut();
    await expect(service.getSession()).resolves.toBeNull();
  });

  it("falls back to Home for an unsafe return destination", async () => {
    const service = createFictionalAuthenticationService();
    await service.beginDemoSignIn("representative", "https://attacker.example");
    expect(await service.completeAuthenticationReturn()).toEqual(
      expect.objectContaining({ destination: "/", type: "completed" }),
    );
  });

  it("fails safely when there is no pending fictional return", async () => {
    const service = createFictionalAuthenticationService();
    expect(await service.completeAuthenticationReturn()).toEqual({
      reference: "AUTH-DEMO-RETURN",
      type: "failed",
    });
  });
});
