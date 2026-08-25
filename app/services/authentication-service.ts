import type { DemoPersona, DemoPersonaId } from "../domain/authentication";

export type DemoSession = {
  manager: boolean;
  personaId: DemoPersonaId;
  scopeLabel: string;
};

export type AuthenticationReturnResult =
  | { destination: string; session: DemoSession; type: "completed" }
  | { reference: string; type: "failed" };

export interface AuthenticationService {
  beginDemoSignIn(
    personaId: DemoPersonaId,
    returnDestination: string | null,
  ): Promise<{ accepted: true }>;
  completeAuthenticationReturn(): Promise<AuthenticationReturnResult>;
  getDemoPersonas(): Promise<DemoPersona[]>;
  getSession(): Promise<DemoSession | null>;
  signOut(): Promise<{ cleared: true }>;
}
