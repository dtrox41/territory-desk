const requiredVariables = [
  "APP_ENV",
  "RELEASE_GATE",
  "DATA_MODE",
  "AUTH_MODE",
  "SMS_MODE",
  "EMAIL_MODE",
  "CALENDAR_MODE",
  "DYNAMICS_INTEGRATION_MODE",
  "DEMO_PERSONAS_ENABLED",
  "PERSISTENCE_MODE",
  "VITE_PUBLIC_APP_ENV",
  "VITE_PUBLIC_BASE_PATH",
  "VITE_FICTIONAL_PROTOTYPE",
];

const allowedValues = {
  APP_ENV: new Set(["development", "preview", "production"]),
  RELEASE_GATE: new Set(["safe-start", "go-live"]),
  DATA_MODE: new Set(["fictional", "protected-api"]),
  AUTH_MODE: new Set(["demo", "server-session"]),
  SMS_MODE: new Set(["simulation", "disabled", "live"]),
  EMAIL_MODE: new Set(["disabled", "graph"]),
  CALENDAR_MODE: new Set(["ics", "graph"]),
  DYNAMICS_INTEGRATION_MODE: new Set(["disabled", "read-only", "read-write"]),
  DEMO_PERSONAS_ENABLED: new Set(["true", "false"]),
  PERSISTENCE_MODE: new Set(["memory", "database"]),
  VITE_FICTIONAL_PROTOTYPE: new Set(["true", "false"]),
};

const fail = (message, variableNames = []) => {
  const suffix = variableNames.length > 0 ? `: ${variableNames.join(", ")}` : "";
  console.error(`${message}${suffix}`);
  process.exit(1);
};

const missingVariables = requiredVariables.filter(
  (variableName) => !process.env[variableName]?.trim(),
);

if (missingVariables.length > 0) {
  fail("Missing required environment variables", missingVariables);
}

const invalidVariables = Object.entries(allowedValues)
  .filter(([variableName, values]) => !values.has(process.env[variableName]))
  .map(([variableName]) => variableName);

if (invalidVariables.length > 0) {
  fail("Invalid environment configuration", invalidVariables);
}

const publicClientVariables = new Set([
  "VITE_PUBLIC_APP_ENV",
  "VITE_PUBLIC_BASE_PATH",
  "VITE_PUBLIC_BUILD_ID",
  "VITE_PUBLIC_RELEASED_AT",
  "VITE_FICTIONAL_PROTOTYPE",
]);

const unexpectedClientVariables = Object.keys(process.env).filter(
  (variableName) =>
    variableName.startsWith("VITE_") &&
    process.env[variableName]?.trim() &&
    !publicClientVariables.has(variableName),
);

if (unexpectedClientVariables.length > 0) {
  fail(
    "Unapproved client-visible environment variables",
    unexpectedClientVariables,
  );
}

const appEnvironment = process.env.APP_ENV;

const exactNonproductionModes = {
  RELEASE_GATE: "safe-start",
  DATA_MODE: "fictional",
  AUTH_MODE: "demo",
  SMS_MODE: "simulation",
  EMAIL_MODE: "disabled",
  CALENDAR_MODE: "ics",
  DYNAMICS_INTEGRATION_MODE: "disabled",
  DEMO_PERSONAS_ENABLED: "true",
  PERSISTENCE_MODE: "memory",
  VITE_FICTIONAL_PROTOTYPE: "true",
};

const mismatchedVariables = [];

if (appEnvironment === "development" || appEnvironment === "preview") {
  for (const [variableName, expectedValue] of Object.entries(
    exactNonproductionModes,
  )) {
    if (process.env[variableName] !== expectedValue) {
      mismatchedVariables.push(variableName);
    }
  }
}

if (appEnvironment === "production") {
  const exactProductionModes = {
    DATA_MODE: "protected-api",
    AUTH_MODE: "server-session",
    EMAIL_MODE: "disabled",
    CALENDAR_MODE: "ics",
    DYNAMICS_INTEGRATION_MODE: "disabled",
    DEMO_PERSONAS_ENABLED: "false",
    PERSISTENCE_MODE: "database",
    VITE_FICTIONAL_PROTOTYPE: "false",
  };

  for (const [variableName, expectedValue] of Object.entries(
    exactProductionModes,
  )) {
    if (process.env[variableName] !== expectedValue) {
      mismatchedVariables.push(variableName);
    }
  }

  if (!new Set(["disabled", "live"]).has(process.env.SMS_MODE)) {
    mismatchedVariables.push("SMS_MODE");
  }

  if (
    process.env.RELEASE_GATE === "go-live" &&
    process.env.SMS_MODE !== "live"
  ) {
    mismatchedVariables.push("SMS_MODE");
  }
}

if (process.env.VITE_PUBLIC_APP_ENV !== appEnvironment) {
  mismatchedVariables.push("VITE_PUBLIC_APP_ENV");
}

const expectedBasePath =
  appEnvironment === "preview" ? "/territory-desk/" : "/";
if (process.env.VITE_PUBLIC_BASE_PATH !== expectedBasePath) {
  mismatchedVariables.push("VITE_PUBLIC_BASE_PATH");
}

if (
  appEnvironment !== "development" &&
  !process.env.VITE_PUBLIC_BUILD_ID?.trim()
) {
  mismatchedVariables.push("VITE_PUBLIC_BUILD_ID");
}

if (appEnvironment !== "development") {
  const releasedAt = process.env.VITE_PUBLIC_RELEASED_AT?.trim();

  if (!releasedAt || Number.isNaN(Date.parse(releasedAt))) {
    mismatchedVariables.push("VITE_PUBLIC_RELEASED_AT");
  }
}

if (mismatchedVariables.length > 0) {
  fail(
    "Unsafe environment compatibility combination",
    [...new Set(mismatchedVariables)],
  );
}

const nonproductionServerValues = [
  "SESSION_SECRET",
  "DYNAMICS_TENANT_ID",
  "DYNAMICS_CLIENT_ID",
  "DYNAMICS_CLIENT_SECRET",
  "DATABASE_URL",
  "SMS_PROVIDER_API_KEY",
  "EMAIL_PROVIDER_API_KEY",
];

if (appEnvironment !== "production") {
  const configuredServerValues = nonproductionServerValues.filter(
    (variableName) => process.env[variableName]?.trim(),
  );

  if (configuredServerValues.length > 0) {
    fail(
      "Public or local fictional environments cannot contain live server configuration",
      configuredServerValues,
    );
  }
}

if (appEnvironment === "production") {
  const missingProductionValues = ["SESSION_SECRET", "DATABASE_URL"].filter(
    (variableName) => !process.env[variableName]?.trim(),
  );

  if (
    process.env.SMS_MODE === "live" &&
    !process.env.SMS_PROVIDER_API_KEY?.trim()
  ) {
    missingProductionValues.push("SMS_PROVIDER_API_KEY");
  }

  if (missingProductionValues.length > 0) {
    fail(
      "Missing required production server configuration",
      missingProductionValues,
    );
  }

  if (
    process.env.SMS_MODE === "disabled" &&
    process.env.SMS_PROVIDER_API_KEY?.trim()
  ) {
    fail("Disabled SMS mode cannot retain an active provider key", [
      "SMS_PROVIDER_API_KEY",
    ]);
  }

  const disabledIntegrationValues = [
    "DYNAMICS_TENANT_ID",
    "DYNAMICS_CLIENT_ID",
    "DYNAMICS_CLIENT_SECRET",
    "EMAIL_PROVIDER_API_KEY",
  ].filter((variableName) => process.env[variableName]?.trim());

  if (disabledIntegrationValues.length > 0) {
    fail(
      "Disabled integrations cannot retain active configuration",
      disabledIntegrationValues,
    );
  }
}

console.log("Environment configuration passed safety validation.");
