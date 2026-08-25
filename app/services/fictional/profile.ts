import type { ProfileSnapshot } from "../../domain/profile";
import type {
  ProfileService,
  SaveProfilePreferenceCommand,
} from "../profile-service";

export type FictionalProfileOptions = {
  access?: "authorized" | "unauthorized";
  failLoad?: boolean;
  failPreferenceLoad?: boolean;
  failSave?: boolean;
  manager?: boolean;
  mismatch?: boolean;
  saveConflict?: boolean;
  unknownSave?: boolean;
};

const baseProfile: ProfileSnapshot = {
  accessState: "active",
  accountStatus: "Signed in · Demo account active",
  authenticationMethod: "Fictional prototype sign-in",
  currentRepresentativeId: "rep-avery-morgan",
  department: "Uniform",
  directoryStatus: "Active · Eligible for peer handoffs",
  displayName: "Avery Morgan",
  divisions: ["Uniform Rental"],
  inAppChannel: "available",
  lastAuthenticatedAt: "August 24, 2026 at 7:58 AM CT",
  lastRefreshedAt: "August 24, 2026 at 9:18 AM CT",
  lastVerifiedAt: "August 22, 2026 at 3:30 PM CT",
  location: "Demo Location 101 · Missouri",
  maskedEmail: "a••••@example.com",
  maskedSmsDestination: "••• ••• 0102",
  preferenceState: "available",
  preference: {
    defaultReminderLeadTime: "one-day-before",
    updatedAt: "August 22, 2026 at 2:10 PM CT",
    version: 3,
  },
  roles: [
    {
      description:
        "Send and receive authorized cross-department peer handoffs and use personal My Work.",
      label: "Representative access",
    },
  ],
  routing: {
    assignmentCount: 18,
    context: "Uniform Rental · Demo Location 101",
    regions: ["Missouri"],
    sourceVersion: "Demo routing v12 · Directory v12",
    state: "available",
  },
  smsChannel: "simulation-only",
  sourceUpdatedAt: "August 20, 2026 at 6:00 PM CT",
  workTimezone: "America/Chicago (Central Time)",
};

function createSnapshot(options: FictionalProfileOptions) {
  const profile = structuredClone(baseProfile);
  if (options.manager !== false) {
    profile.roles.push({
      description:
        "View aggregate collaboration insights for the authorized North Location departments.",
      label: "Manager access",
    });
    profile.managerScope =
      "North Location · Uniform + Facility Services + First Aid & Safety";
  }
  if (options.mismatch) {
    profile.accessState = "needs-review";
    profile.routing.state = "version-mismatch";
    profile.routing.sourceVersion = "Demo routing v12 · Directory v11";
  }
  return profile;
}

export function createFictionalProfileService(
  options: FictionalProfileOptions = {},
): ProfileService {
  let profile = createSnapshot(options);
  const savedCommands = new Map<string, ProfileSnapshot>();

  return {
    async getAccess() {
      await Promise.resolve();
      return options.access === "unauthorized"
        ? { type: "unauthorized" as const }
        : { type: "authorized" as const };
    },
    async getProfile() {
      await Promise.resolve();
      if (options.failLoad) throw new Error("profile-unavailable");
      const result = structuredClone(profile);
      if (options.failPreferenceLoad) {
        result.preferenceState = "unavailable";
      }
      return result;
    },
    async savePreference(command: SaveProfilePreferenceCommand) {
      await Promise.resolve();
      const prior = savedCommands.get(command.idempotencyKey);
      if (prior)
        return { profile: structuredClone(prior), type: "saved" as const };
      if (options.failSave) throw new Error("preferences-not-saved");
      if (options.unknownSave) return { type: "unknown" as const };
      if (
        options.saveConflict ||
        command.reviewedVersion !== profile.preference.version
      ) {
        const current = structuredClone(profile);
        current.preference.defaultReminderLeadTime = "one-hour-before";
        current.preference.version += 1;
        return { current, type: "conflict" as const };
      }
      profile = structuredClone(profile);
      profile.preference = {
        defaultReminderLeadTime: command.defaultReminderLeadTime,
        updatedAt: "August 24, 2026 at 9:19 AM CT",
        version: profile.preference.version + 1,
      };
      savedCommands.set(command.idempotencyKey, structuredClone(profile));
      return { profile: structuredClone(profile), type: "saved" as const };
    },
    async signOut() {
      await Promise.resolve();
      savedCommands.clear();
      profile = createSnapshot(options);
      return { cleared: true as const };
    },
  };
}

export const fictionalProfileService = createFictionalProfileService();
