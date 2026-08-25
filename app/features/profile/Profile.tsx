import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useBlocker, useNavigate } from "react-router";

import { Icon } from "../../components/foundation/Icon";
import { PageFrame } from "../../components/layout/PageFrame";
import {
  channelStateLabels,
  initials,
  profileStateLabels,
  reminderLabel,
  reminderOptions,
  type ProfileSnapshot,
  type ReminderLeadTime,
} from "../../domain/profile";
import type { ProfileService } from "../../services/profile-service";
import styles from "./Profile.module.css";

function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function deviceCategory() {
  if (typeof window === "undefined") return "Browser session";
  return window.innerWidth < 768 ? "Smartphone browser" : "Laptop browser";
}

function useDeviceCategory() {
  const [category, setCategory] = useState(deviceCategory);
  useEffect(() => {
    const update = () => setCategory(deviceCategory());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return category;
}

function commandKey() {
  return `profile-preference-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.readOnlyField}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <span>Managed by company directory</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className={styles.sectionHeader}>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
    </header>
  );
}

function SignOutDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => dialog.current?.showModal(), []);

  return (
    <dialog
      aria-labelledby="sign-out-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <div className={styles.dialogHeader}>
        <div>
          <p>Current demo session</p>
          <h2 id="sign-out-title">Discard changes and sign out?</h2>
        </div>
        <button
          aria-label="Close Sign Out confirmation"
          onClick={() => dialog.current?.close()}
          type="button"
        >
          ×
        </button>
      </div>
      <div className={styles.dialogBody}>
        <p>
          Your unsaved reminder preference exists only in this page and will be
          discarded. Territory Desk will also clear session-held fictional
          business data; existing records are not deleted.
        </p>
        <div className={styles.dialogActions}>
          <button
            className={styles.secondaryButton}
            disabled={pending}
            onClick={() => dialog.current?.close()}
            type="button"
          >
            Stay and Continue
          </button>
          <button
            className={styles.primaryButton}
            disabled={pending}
            onClick={() => {
              setPending(true);
              void onConfirm();
            }}
            type="button"
          >
            {pending ? "Signing out…" : "Discard Changes and Sign Out"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function LeaveChangesDialog({
  onDiscard,
  onStay,
}: {
  onDiscard: () => void;
  onStay: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => dialog.current?.showModal(), []);
  return (
    <dialog
      aria-labelledby="leave-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onStay}
      ref={dialog}
    >
      <div className={styles.dialogHeader}>
        <div>
          <p>Unsaved preference</p>
          <h2 id="leave-title">Discard your changes?</h2>
        </div>
        <button
          aria-label="Close discard-changes confirmation"
          onClick={() => dialog.current?.close()}
          type="button"
        >
          ×
        </button>
      </div>
      <div className={styles.dialogBody}>
        <p>Your reminder selection has not been saved.</p>
        <div className={styles.dialogActions}>
          <button
            className={styles.secondaryButton}
            onClick={onStay}
            type="button"
          >
            Stay and Continue
          </button>
          <button
            className={styles.primaryButton}
            onClick={onDiscard}
            type="button"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function Profile({ service }: { service: ProfileService }) {
  const navigate = useNavigate();
  const online = useOnline();
  const currentDeviceCategory = useDeviceCategory();
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ReminderLeadTime>("one-day-before");
  const [saveState, setSaveState] = useState<
    "idle" | "pending" | "saved" | "failed" | "unknown"
  >("idle");
  const [conflict, setConflict] = useState<ProfileSnapshot | null>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const idempotencyKey = useRef(commandKey());
  const allowNavigation = useRef(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const access = await service.getAccess();
      if (access.type === "unauthorized") {
        setUnauthorized(true);
        setProfile(null);
        return;
      }
      const result = await service.getProfile();
      setProfile(result);
      setDraft(result.preference.defaultReminderLeadTime);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    // Profile loading is the external synchronization owned by this route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const hasUnsavedChanges = Boolean(
    editing && profile && draft !== profile.preference.defaultReminderLeadTime,
  );
  const blocker = useBlocker(
    () => hasUnsavedChanges && !allowNavigation.current,
  );
  const manager = profile?.roles.some(
    (role) => role.label === "Manager access",
  );
  const statusClass = profile ? styles[`status_${profile.accessState}`] : "";

  async function savePreference() {
    if (!profile || !hasUnsavedChanges || !online) return;
    setSaveState("pending");
    setConflict(null);
    try {
      const result = await service.savePreference({
        defaultReminderLeadTime: draft,
        idempotencyKey: idempotencyKey.current,
        reviewedVersion: profile.preference.version,
      });
      if (result.type === "conflict") {
        setConflict(result.current);
        setSaveState("idle");
        return;
      }
      if (result.type === "unknown") {
        setSaveState("unknown");
        return;
      }
      setProfile(result.profile);
      setDraft(result.profile.preference.defaultReminderLeadTime);
      setEditing(false);
      setSaveState("saved");
      idempotencyKey.current = commandKey();
    } catch {
      setSaveState("failed");
    }
  }

  async function signOut() {
    await service.signOut();
    allowNavigation.current = true;
    setProfile(null);
    setDraft("one-day-before");
    setEditing(false);
    window.dispatchEvent(new Event("territory-desk:signed-out"));
    void navigate("/signed-out", { replace: true });
  }

  if (unauthorized)
    return (
      <PageFrame
        description="Identity, contact, role, and routing details remain protected."
        eyebrow="Access controlled"
        title="Profile access required"
      >
        <section className={styles.stateCard}>
          <h2>No profile information was loaded</h2>
          <p>Return to the approved sign-in or account-access flow.</p>
          <Link className={styles.primaryButton} to="/help/account-access">
            Get Access Help
          </Link>
        </section>
      </PageFrame>
    );

  return (
    <PageFrame
      description="Verify the fictional identity and work context Territory Desk uses for you."
      eyebrow="Demo profile · Fictional identity"
      title="My Profile"
    >
      {!online && profile ? (
        <section className={styles.offlineBanner} role="status">
          <strong>Offline demo profile</strong>
          <span>
            Last loaded information remains readable. Preference editing and
            protected navigation require reconnection; Sign Out remains
            available.
          </span>
        </section>
      ) : null}

      {loadError && !profile ? (
        <section className={styles.errorCard} role="alert">
          <h2>Profile could not be loaded</h2>
          <p>No prior identity or permission information is displayed.</p>
          <button
            className={styles.primaryButton}
            onClick={() => void load()}
            type="button"
          >
            Try Again
          </button>
        </section>
      ) : loading ? (
        <section aria-busy="true" className={styles.stateCard}>
          <h2>Loading your current profile…</h2>
          <p>
            Prior identity and access information is not reused while
            authorization is checked.
          </p>
        </section>
      ) : profile ? (
        <>
          <section className={styles.profileHero}>
            <span aria-hidden="true" className={styles.avatar}>
              {initials(profile.displayName)}
            </span>
            <div>
              <p>Current fictional account</p>
              <h2>{profile.displayName}</h2>
              <span>
                {profile.department} ·{" "}
                {profile.roles
                  .map((role) => role.label.replace(" access", ""))
                  .join(" + ")}
              </span>
            </div>
            <span className={statusClass}>
              {profileStateLabels[profile.accessState]}
            </span>
          </section>

          {profile.accessState === "access-changed" ? (
            <section className={styles.warningBanner} role="status">
              <strong>
                Your access changed. Territory Desk has refreshed your profile.
              </strong>
              <span>
                Removed destinations and prior scope information were cleared.
              </span>
            </section>
          ) : null}

          <div className={styles.layout}>
            <div className={styles.primaryColumn}>
              <section className={styles.panel}>
                <SectionHeader
                  eyebrow="Source controlled"
                  title="Identity and work information"
                />
                <p className={styles.guidance}>
                  Displayed for verification. These values cannot be edited in
                  Territory Desk.
                </p>
                <dl className={styles.fieldGrid}>
                  <ReadOnlyField
                    label="Display name"
                    value={profile.displayName}
                  />
                  <ReadOnlyField
                    label="Work email"
                    value={profile.maskedEmail}
                  />
                  <ReadOnlyField
                    label="SMS destination"
                    value={profile.maskedSmsDestination}
                  />
                  <ReadOnlyField
                    label="Primary department"
                    value={profile.department}
                  />
                  <ReadOnlyField
                    label="Source divisions"
                    value={profile.divisions.join(", ")}
                  />
                  <ReadOnlyField label="Location" value={profile.location} />
                  <ReadOnlyField
                    label="Work timezone"
                    value={profile.workTimezone}
                  />
                  <ReadOnlyField
                    label="Directory status"
                    value={profile.directoryStatus}
                  />
                  <ReadOnlyField
                    label="Source updated"
                    value={profile.sourceUpdatedAt}
                  />
                  <ReadOnlyField
                    label="Last verified"
                    value={profile.lastVerifiedAt}
                  />
                </dl>
                <p className={styles.timezoneNotice}>
                  Times are shown in {profile.workTimezone}. Device timezone
                  never changes a saved deadline.
                </p>
                <div className={styles.actions}>
                  <Link
                    className={styles.secondaryButton}
                    to={`/directory/${profile.currentRepresentativeId}`}
                  >
                    View my Directory profile
                  </Link>
                  <Link
                    className={styles.textLink}
                    to="/data-status?source=directory#sources"
                  >
                    Report incorrect profile information
                  </Link>
                  <Link className={styles.textLink} to="/data-status">
                    View Data Status
                  </Link>
                </div>
              </section>

              <section className={styles.panel}>
                <SectionHeader
                  eyebrow="Permission checked"
                  title="Role and access"
                />
                <p className={styles.guidance}>
                  Every role belongs to this one identity. Territory Desk does
                  not impersonate another representative.
                </p>
                <ul className={styles.roleList}>
                  {profile.roles.map((role) => (
                    <li key={role.label}>
                      <span className={styles.roleIcon}>
                        <Icon
                          name={
                            role.label === "Manager access"
                              ? "chart"
                              : "profile"
                          }
                        />
                      </span>
                      <div>
                        <h3>{role.label}</h3>
                        <p>{role.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                {profile.managerScope ? (
                  <div className={styles.scopeBox}>
                    <strong>Authorized manager scope</strong>
                    <span>{profile.managerScope}</span>
                    <small>Individual employees are not listed here.</small>
                  </div>
                ) : (
                  <p className={styles.scopeBox}>
                    Manager Insights permission is not included in this profile.
                  </p>
                )}
                <div className={styles.actions}>
                  {manager ? (
                    <Link
                      className={styles.primaryButton}
                      to="/insights#overview"
                    >
                      Open Team Insights
                    </Link>
                  ) : null}
                  <Link className={styles.textLink} to="/help/account-access">
                    Report access problem
                  </Link>
                </div>
              </section>

              <section className={styles.panel}>
                <SectionHeader
                  eyebrow="Current routing source"
                  title="Territory and routing context"
                />
                {profile.routing.state === "version-mismatch" ? (
                  <div className={styles.warningBanner}>
                    <strong>Routing profile needs review</strong>
                    <span>
                      Directory and territory versions do not match. Profile
                      cannot override this condition.
                    </span>
                  </div>
                ) : null}
                <dl className={styles.summaryList}>
                  <div>
                    <dt>Active assignments</dt>
                    <dd>{profile.routing.assignmentCount}</dd>
                  </div>
                  <div>
                    <dt>Regions covered</dt>
                    <dd>{profile.routing.regions.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Department context</dt>
                    <dd>{profile.routing.context}</dd>
                  </div>
                  <div>
                    <dt>Source version</dt>
                    <dd>{profile.routing.sourceVersion}</dd>
                  </div>
                </dl>
                <div className={styles.actions}>
                  <Link
                    className={styles.primaryButton}
                    to={`/directory/${profile.currentRepresentativeId}#territory`}
                  >
                    View my Territory Coverage
                  </Link>
                  {profile.routing.state !== "available" ? (
                    <Link
                      className={styles.textLink}
                      to="/data-status?source=territory#sources"
                    >
                      Review Data Status
                    </Link>
                  ) : null}
                </div>
              </section>

              <section className={styles.panel}>
                <SectionHeader
                  eyebrow="System status"
                  title="Notification delivery"
                />
                <ul className={styles.channelList}>
                  <li>
                    <div>
                      <h3>In-app notifications</h3>
                      <span
                        className={styles[`channel_${profile.inAppChannel}`]}
                      >
                        {channelStateLabels[profile.inAppChannel]}
                      </span>
                    </div>
                    <p>
                      Required peer-lead, response, follow-up, manager-action,
                      and data alerts cannot be disabled.
                    </p>
                    <Link
                      className={styles.secondaryButton}
                      to="/notifications"
                    >
                      Open Notification Center
                    </Link>
                  </li>
                  <li>
                    <div>
                      <h3>Territory Desk SMS</h3>
                      <span className={styles[`channel_${profile.smsChannel}`]}>
                        {channelStateLabels[profile.smsChannel]}
                      </span>
                    </div>
                    <p>
                      <span
                        className={styles.maskedContact}
                        aria-label={`Masked SMS destination ending in ${profile.maskedSmsDestination.slice(-4)}`}
                      >
                        {profile.maskedSmsDestination}
                      </span>{" "}
                      · New assignment and reassignment only.
                    </p>
                    <p>
                      No customer details are sent. Prototype SMS never contacts
                      a carrier.
                    </p>
                    <Link
                      className={styles.textLink}
                      to="/data-status?source=directory#sources"
                    >
                      Report incorrect number
                    </Link>
                  </li>
                </ul>
              </section>
            </div>

            <aside className={styles.secondaryColumn}>
              <section className={styles.panel}>
                <SectionHeader
                  eyebrow="You can change this"
                  title="Personal preferences"
                />
                {profile.preferenceState === "unavailable" ? (
                  <div className={styles.errorInline} role="alert">
                    <strong>Preferences unavailable</strong>
                    <span>
                      Your identity context remains available. No default was
                      guessed.
                    </span>
                    <button
                      className={styles.secondaryButton}
                      onClick={() => void load()}
                      type="button"
                    >
                      Try Again
                    </button>
                  </div>
                ) : editing ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void savePreference();
                    }}
                  >
                    <label htmlFor="reminder-default">
                      Default in-app follow-up reminder
                    </label>
                    <select
                      id="reminder-default"
                      onChange={(event) =>
                        setDraft(event.target.value as ReminderLeadTime)
                      }
                      value={draft}
                    >
                      {reminderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p id="reminder-help">
                      This is the starting choice for new follow-ups. You can
                      change it before saving each follow-up. It does not change
                      existing due times or send SMS.
                    </p>
                    {saveState === "failed" ? (
                      <p className={styles.formError} role="alert">
                        Preferences were not saved. Your selection is still
                        here; retry when ready.
                      </p>
                    ) : null}
                    {saveState === "unknown" ? (
                      <div className={styles.errorInline} role="status">
                        <strong>Save result not yet confirmed</strong>
                        <span>
                          Duplicate saving is locked while Territory Desk checks
                          the current version.
                        </span>
                        <button
                          className={styles.secondaryButton}
                          onClick={() => {
                            setSaveState("idle");
                            void load();
                          }}
                          type="button"
                        >
                          Check Saved Result
                        </button>
                      </div>
                    ) : null}
                    {conflict ? (
                      <div className={styles.conflictBox} role="alert">
                        <strong>Preference changed in another session</strong>
                        <span>
                          Current saved value:{" "}
                          {reminderLabel(
                            conflict.preference.defaultReminderLeadTime,
                          )}
                        </span>
                        <span>Your selection: {reminderLabel(draft)}</span>
                        <div className={styles.actions}>
                          <button
                            className={styles.secondaryButton}
                            onClick={() => {
                              setProfile(conflict);
                              setDraft(
                                conflict.preference.defaultReminderLeadTime,
                              );
                              setConflict(null);
                              setEditing(false);
                            }}
                            type="button"
                          >
                            Use Current Saved Value
                          </button>
                          <button
                            className={styles.textButton}
                            onClick={() => {
                              setProfile(conflict);
                              setConflict(null);
                              idempotencyKey.current = commandKey();
                            }}
                            type="button"
                          >
                            Review and Save My Selection
                          </button>
                        </div>
                      </div>
                    ) : null}
                    <div className={styles.actions}>
                      <button
                        className={styles.primaryButton}
                        disabled={
                          !hasUnsavedChanges ||
                          saveState === "pending" ||
                          saveState === "unknown" ||
                          !online
                        }
                        type="submit"
                      >
                        {saveState === "pending"
                          ? "Saving preferences…"
                          : "Save Preferences"}
                      </button>
                      <button
                        className={styles.secondaryButton}
                        disabled={saveState === "pending"}
                        onClick={() => {
                          setDraft(profile.preference.defaultReminderLeadTime);
                          setEditing(false);
                          setSaveState("idle");
                          setConflict(null);
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <dl className={styles.preferenceValue}>
                      <dt>Default in-app follow-up reminder</dt>
                      <dd>
                        {reminderLabel(
                          profile.preference.defaultReminderLeadTime,
                        )}
                      </dd>
                    </dl>
                    <p className={styles.guidance}>
                      Applies only as the starting choice for newly created
                      follow-ups.
                    </p>
                    {saveState === "saved" ? (
                      <p className={styles.successMessage} role="status">
                        Preferences saved
                      </p>
                    ) : null}
                    <button
                      className={styles.primaryButton}
                      disabled={!online}
                      onClick={() => {
                        setEditing(true);
                        setSaveState("idle");
                        idempotencyKey.current = commandKey();
                      }}
                      type="button"
                    >
                      Edit Preferences
                    </button>
                  </>
                )}
              </section>

              <section className={styles.panel}>
                <SectionHeader
                  eyebrow="System status"
                  title="Device and session"
                />
                <dl className={styles.sessionList}>
                  <div>
                    <dt>Signed-in identity</dt>
                    <dd>{profile.displayName}</dd>
                  </div>
                  <div>
                    <dt>Session state</dt>
                    <dd>{profile.accountStatus}</dd>
                  </div>
                  <div>
                    <dt>Last successful authentication</dt>
                    <dd>{profile.lastAuthenticatedAt}</dd>
                  </div>
                  <div>
                    <dt>Current device category</dt>
                    <dd>{currentDeviceCategory}</dd>
                  </div>
                  <div>
                    <dt>Profile last refreshed</dt>
                    <dd>{profile.lastRefreshedAt}</dd>
                  </div>
                  <div>
                    <dt>Authentication method</dt>
                    <dd>{profile.authenticationMethod}</dd>
                  </div>
                </dl>
                <p className={styles.guidance}>
                  Territory Desk clears session-held business data when you sign
                  out.
                </p>
                <div className={styles.actions}>
                  <button
                    className={styles.primaryButton}
                    onClick={() => {
                      if (hasUnsavedChanges) setSignOutOpen(true);
                      else void signOut();
                    }}
                    type="button"
                  >
                    Sign Out
                  </button>
                  <Link className={styles.textLink} to="/sign-in/help">
                    Get sign-in help
                  </Link>
                </div>
              </section>

              <section className={styles.panel}>
                <SectionHeader
                  eyebrow="Corrections and support"
                  title="Need help?"
                />
                <p className={styles.guidance}>
                  Profile corrections create an auditable data report. They do
                  not edit identity, routing, role, scope, or contact
                  information directly.
                </p>
                <div className={styles.stackActions}>
                  <Link
                    className={styles.secondaryButton}
                    to="/data-status?source=directory#sources"
                  >
                    Report incorrect profile information
                  </Link>
                  <Link
                    className={styles.secondaryButton}
                    to="/help/account-access"
                  >
                    Report access problem
                  </Link>
                  <Link className={styles.textLink} to="/help">
                    Open Help and Feedback
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </>
      ) : null}

      {signOutOpen ? (
        <SignOutDialog
          onClose={() => setSignOutOpen(false)}
          onConfirm={signOut}
        />
      ) : null}
      {blocker.state === "blocked" ? (
        <LeaveChangesDialog
          onDiscard={() => blocker.proceed()}
          onStay={() => blocker.reset()}
        />
      ) : null}
    </PageFrame>
  );
}
