import { useEffect } from "react";

import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";
import { fictionalAuthenticationService } from "../services/fictional/authentication";

export function meta() {
  return pageMeta(
    "Signed out",
    "The fictional Territory Desk session has ended.",
  );
}

export default function SignedOut() {
  useEffect(() => {
    void fictionalAuthenticationService.signOut().then(() => {
      window.dispatchEvent(new Event("territory-desk:signed-out"));
    });
  }, []);
  return <SystemStatePage state="signed-out" />;
}
