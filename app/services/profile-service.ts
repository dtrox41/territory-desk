import type { ProfileSnapshot, ReminderLeadTime } from "../domain/profile";

export type ProfileAccess = { type: "unauthorized" } | { type: "authorized" };

export type SaveProfilePreferenceCommand = {
  defaultReminderLeadTime: ReminderLeadTime;
  idempotencyKey: string;
  reviewedVersion: number;
};

export type SaveProfilePreferenceResult =
  | { profile: ProfileSnapshot; type: "saved" }
  | { current: ProfileSnapshot; type: "conflict" }
  | { type: "unknown" };

export interface ProfileService {
  getAccess(): Promise<ProfileAccess>;
  getProfile(): Promise<ProfileSnapshot>;
  savePreference(
    command: SaveProfilePreferenceCommand,
  ): Promise<SaveProfilePreferenceResult>;
  signOut(): Promise<{ cleared: true }>;
}
