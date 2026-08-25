import { useMemo } from "react";

import { pageMeta } from "../components/layout/page-meta";
import { useFictionalSession } from "../features/authentication/fictional-session-context";
import { Profile as ProfileScreen } from "../features/profile/Profile";
import { createFictionalProfileService } from "../services/fictional/profile";

export function meta() {
  return pageMeta("My Profile", "Fictional Territory Desk profile route.");
}

export default function Profile() {
  const session = useFictionalSession();
  const manager = session.status === "authenticated" && session.session.manager;
  const service = useMemo(
    () => createFictionalProfileService({ manager }),
    [manager],
  );
  return <ProfileScreen service={service} />;
}
