import { useCallback, useEffect, useRef, useState } from "react";

import type { AuthenticationService } from "../../services/authentication-service";
import { fictionalAuthenticationService } from "../../services/fictional/authentication";
import {
  FictionalSessionContext,
  type FictionalSessionState,
} from "./fictional-session-context";

export function FictionalSessionProvider({
  children,
  service = fictionalAuthenticationService,
}: {
  children: React.ReactNode;
  service?: AuthenticationService;
}) {
  const requestVersion = useRef(0);
  const [state, setState] = useState<FictionalSessionState>({
    status: "loading",
  });

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    const session = await service.getSession();
    if (version !== requestVersion.current) return;
    setState(
      session ? { session, status: "authenticated" } : { status: "signed-out" },
    );
  }, [service]);

  useEffect(() => {
    void refresh();
    const onSessionChanged = () => void refresh();
    window.addEventListener("territory-desk:session-changed", onSessionChanged);
    window.addEventListener("territory-desk:signed-out", onSessionChanged);
    return () => {
      requestVersion.current += 1;
      window.removeEventListener(
        "territory-desk:session-changed",
        onSessionChanged,
      );
      window.removeEventListener("territory-desk:signed-out", onSessionChanged);
    };
  }, [refresh]);

  return (
    <FictionalSessionContext.Provider value={state}>
      {children}
    </FictionalSessionContext.Provider>
  );
}
