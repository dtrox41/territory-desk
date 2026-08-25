import { createContext, useContext } from "react";

import type { DemoSession } from "../../services/authentication-service";

export type FictionalSessionState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { session: DemoSession; status: "authenticated" };

export const FictionalSessionContext =
  createContext<FictionalSessionState | null>(null);

export function useFictionalSession() {
  const state = useContext(FictionalSessionContext);
  if (!state)
    throw new Error(
      "useFictionalSession must be used within FictionalSessionProvider",
    );
  return state;
}
