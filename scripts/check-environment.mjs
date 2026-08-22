const requiredVariables = [
  "APP_ENV",
  "DATA_MODE",
  "NOTIFICATION_MODE",
  "DYNAMICS_INTEGRATION_MODE",
];

const allowedValues = {
  APP_ENV: new Set(["development", "preview", "production"]),
  DATA_MODE: new Set(["fictional", "approved-test", "production"]),
  NOTIFICATION_MODE: new Set(["simulation", "disabled", "live"]),
  DYNAMICS_INTEGRATION_MODE: new Set(["disabled", "read-only", "read-write"]),
};

const missingVariables = requiredVariables.filter(
  (variableName) => !process.env[variableName]?.trim(),
);

if (missingVariables.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVariables.join(", ")}`,
  );
  process.exit(1);
}

const invalidVariables = requiredVariables.filter(
  (variableName) => !allowedValues[variableName].has(process.env[variableName]),
);

if (invalidVariables.length > 0) {
  console.error(
    `Invalid environment configuration for: ${invalidVariables.join(", ")}`,
  );
  process.exit(1);
}

if (
  process.env.APP_ENV !== "production" &&
  (process.env.DATA_MODE === "production" ||
    process.env.NOTIFICATION_MODE === "live" ||
    process.env.DYNAMICS_INTEGRATION_MODE === "read-write")
) {
  console.error(
    "Unsafe environment combination: non-production environments cannot enable production data, live notifications, or Dynamics write access.",
  );
  process.exit(1);
}

console.log("Environment configuration passed safety validation.");
