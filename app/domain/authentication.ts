export type DemoPersonaId = "representative" | "manager" | "data-exception";

export type DemoPersona = {
  description: string;
  id: DemoPersonaId;
  label: string;
  scope: string;
};

const allowedStaticPaths = new Set([
  "/",
  "/territory",
  "/leads",
  "/leads/new",
  "/directory",
  "/notifications",
  "/insights",
  "/data-status",
  "/profile",
  "/help",
]);

const allowedDetailPatterns = [
  /^\/leads\/[a-z0-9-]+$/i,
  /^\/directory\/[a-z0-9-]+$/i,
  /^\/help\/[a-z0-9-]+$/i,
  /^\/help\/requests\/[a-z0-9-]+$/i,
];

const unsafeEncodedValue = /%(?:2e|2f|5c|3a|00)/i;

export function sanitizeReturnDestination(rawValue: string | null) {
  if (!rawValue) return "/";
  const value = rawValue.trim();
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("..") ||
    value.includes(":") ||
    unsafeEncodedValue.test(value)
  )
    return "/";

  let parsed: URL;
  try {
    parsed = new URL(value, "https://territory-desk.invalid");
  } catch {
    return "/";
  }

  if (parsed.origin !== "https://territory-desk.invalid") return "/";
  if (parsed.search || parsed.hash) return "/";
  const path = parsed.pathname.replace(/\/$/, "") || "/";
  if (allowedStaticPaths.has(path)) return path;
  return allowedDetailPatterns.some((pattern) => pattern.test(path))
    ? path
    : "/";
}

export type SystemErrorOutcome = "failed" | "succeeded" | "unknown";

export function errorOutcomeMessage(outcome: SystemErrorOutcome) {
  if (outcome === "failed")
    return "The attempted action definitely failed. Review your information before trying again.";
  if (outcome === "succeeded")
    return "The attempted action definitely succeeded. Do not repeat it; return to My Work to confirm the result.";
  return "The result is unknown. Check the relevant list or activity history before trying the action again.";
}
