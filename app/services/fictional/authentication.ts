import {
  sanitizeReturnDestination,
  type DemoPersona,
  type DemoPersonaId,
} from "../../domain/authentication";
import type {
  AuthenticationService,
  DemoSession,
} from "../authentication-service";

type AuthenticationOptions = {
  failReturn?: boolean;
};

const personas: DemoPersona[] = [
  {
    description:
      "Personal My Work, lead collaboration, territory lookup, and directory access.",
    id: "representative",
    label: "New Business Representative",
    scope: "Fictional North Location · Personal work only",
  },
  {
    description:
      "The representative experience plus limited fictional Team Insights.",
    id: "manager",
    label: "Authorized Manager",
    scope: "Fictional North Location · Limited manager scope",
  },
  {
    description:
      "Demonstrates ambiguous routing, stale data, and safe blocked-action states.",
    id: "data-exception",
    label: "Data-Exception Representative",
    scope: "Fictional North Location · Exception scenarios",
  },
];

export function createFictionalAuthenticationService(
  options: AuthenticationOptions = {},
): AuthenticationService {
  let pending: { destination: string; personaId: DemoPersonaId } | undefined;
  let currentSession: DemoSession | undefined;

  return {
    async beginDemoSignIn(personaId, returnDestination) {
      await Promise.resolve();
      currentSession = undefined;
      pending = {
        destination: sanitizeReturnDestination(returnDestination),
        personaId,
      };
      return { accepted: true as const };
    },
    async completeAuthenticationReturn() {
      await Promise.resolve();
      if (options.failReturn || !pending)
        return {
          reference: "AUTH-DEMO-RETURN",
          type: "failed" as const,
        };
      const persona = personas.find((item) => item.id === pending?.personaId);
      if (!persona)
        return {
          reference: "AUTH-DEMO-PERSONA",
          type: "failed" as const,
        };
      currentSession = {
        manager: persona.id === "manager",
        personaId: persona.id,
        scopeLabel: persona.scope,
      };
      const destination = pending.destination;
      pending = undefined;
      return {
        destination,
        session: structuredClone(currentSession),
        type: "completed" as const,
      };
    },
    async getDemoPersonas() {
      await Promise.resolve();
      return structuredClone(personas);
    },
    async getSession() {
      await Promise.resolve();
      return currentSession ? structuredClone(currentSession) : null;
    },
    async signOut() {
      await Promise.resolve();
      currentSession = undefined;
      pending = undefined;
      return { cleared: true as const };
    },
  };
}

export const fictionalAuthenticationService =
  createFictionalAuthenticationService();
