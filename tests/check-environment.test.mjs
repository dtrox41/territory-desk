import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const checkerUrl = new URL("../scripts/check-environment.mjs", import.meta.url);

const development = {
  APP_ENV: "development",
  RELEASE_GATE: "safe-start",
  DATA_MODE: "fictional",
  AUTH_MODE: "demo",
  SMS_MODE: "simulation",
  EMAIL_MODE: "disabled",
  CALENDAR_MODE: "ics",
  DYNAMICS_INTEGRATION_MODE: "disabled",
  DEMO_PERSONAS_ENABLED: "true",
  PERSISTENCE_MODE: "memory",
  VITE_PUBLIC_APP_ENV: "development",
  VITE_PUBLIC_BASE_PATH: "/",
  VITE_FICTIONAL_PROTOTYPE: "true",
};

const preview = {
  ...development,
  APP_ENV: "preview",
  VITE_PUBLIC_APP_ENV: "preview",
  VITE_PUBLIC_BASE_PATH: "/territory-desk/",
  VITE_PUBLIC_BUILD_ID: "preview-test-build",
  VITE_PUBLIC_RELEASED_AT: "2026-08-24T18:15:27Z",
};

const production = {
  APP_ENV: "production",
  RELEASE_GATE: "safe-start",
  DATA_MODE: "protected-api",
  AUTH_MODE: "server-session",
  SMS_MODE: "disabled",
  EMAIL_MODE: "disabled",
  CALENDAR_MODE: "ics",
  DYNAMICS_INTEGRATION_MODE: "disabled",
  DEMO_PERSONAS_ENABLED: "false",
  PERSISTENCE_MODE: "database",
  VITE_PUBLIC_APP_ENV: "production",
  VITE_PUBLIC_BASE_PATH: "/",
  VITE_PUBLIC_BUILD_ID: "production-test-build",
  VITE_PUBLIC_RELEASED_AT: "2026-08-24T18:15:27Z",
  VITE_FICTIONAL_PROTOTYPE: "false",
  SESSION_SECRET: "fictional-test-session-secret",
  DATABASE_URL: "postgresql://fictional-test-only",
};

const runChecker = (configuration) =>
  spawnSync(process.execPath, [checkerUrl.pathname], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      ...configuration,
    },
  });

const expectPass = (configuration) => {
  const result = runChecker(configuration);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
};

const expectFailure = (configuration, variableName) => {
  const result = runChecker(configuration);
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, new RegExp(variableName));
};

test("accepts the exact fictional Development matrix", () => {
  expectPass(development);
});

test("accepts the exact public fictional Preview matrix", () => {
  expectPass(preview);
});

test("accepts a safe-start Production matrix with SMS disabled", () => {
  expectPass(production);
});

test("accepts Production go-live only with live SMS configuration", () => {
  expectPass({
    ...production,
    RELEASE_GATE: "go-live",
    SMS_MODE: "live",
    SMS_PROVIDER_API_KEY: "fictional-test-provider-key",
  });
});

test("rejects a missing required environment mode", () => {
  const { AUTH_MODE: _removed, ...configuration } = development;
  expectFailure(configuration, "AUTH_MODE");
});

test("rejects protected data in public Preview", () => {
  expectFailure({ ...preview, DATA_MODE: "protected-api" }, "DATA_MODE");
});

test("rejects live SMS in public Preview", () => {
  expectFailure({ ...preview, SMS_MODE: "live" }, "SMS_MODE");
});

test("rejects a database connection in public Preview", () => {
  expectFailure(
    { ...preview, DATABASE_URL: "postgresql://must-not-print" },
    "DATABASE_URL",
  );
});

test("rejects demo authentication in Production", () => {
  expectFailure({ ...production, AUTH_MODE: "demo" }, "AUTH_MODE");
});

test("rejects memory persistence in Production", () => {
  expectFailure(
    { ...production, PERSISTENCE_MODE: "memory" },
    "PERSISTENCE_MODE",
  );
});

test("rejects a go-live release while SMS is disabled", () => {
  expectFailure({ ...production, RELEASE_GATE: "go-live" }, "SMS_MODE");
});

test("rejects live Production SMS without a provider key", () => {
  expectFailure({ ...production, SMS_MODE: "live" }, "SMS_PROVIDER_API_KEY");
});

test("rejects a provider key while Production SMS is disabled", () => {
  expectFailure(
    { ...production, SMS_PROVIDER_API_KEY: "fictional-test-provider-key" },
    "SMS_PROVIDER_API_KEY",
  );
});

test("rejects an unapproved client-visible variable without printing its value", () => {
  const result = runChecker({
    ...preview,
    VITE_SECRET_TOKEN: "never-print-this-test-value",
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /VITE_SECRET_TOKEN/);
  assert.doesNotMatch(result.stderr, /never-print-this-test-value/);
});

test("rejects a client environment label mismatch", () => {
  expectFailure(
    { ...preview, VITE_PUBLIC_APP_ENV: "development" },
    "VITE_PUBLIC_APP_ENV",
  );
});

test("rejects an incorrect GitHub Pages base path", () => {
  expectFailure(
    { ...preview, VITE_PUBLIC_BASE_PATH: "/" },
    "VITE_PUBLIC_BASE_PATH",
  );
});

test("rejects a Preview build without its fictional-prototype flag", () => {
  expectFailure(
    { ...preview, VITE_FICTIONAL_PROTOTYPE: "false" },
    "VITE_FICTIONAL_PROTOTYPE",
  );
});

test("rejects a Preview build without a build identifier", () => {
  const { VITE_PUBLIC_BUILD_ID: _removed, ...configuration } = preview;
  expectFailure(configuration, "VITE_PUBLIC_BUILD_ID");
});

test("rejects a Preview build without a release timestamp", () => {
  const { VITE_PUBLIC_RELEASED_AT: _removed, ...configuration } = preview;
  expectFailure(configuration, "VITE_PUBLIC_RELEASED_AT");
});

test("rejects a Preview build with an invalid release timestamp", () => {
  expectFailure(
    { ...preview, VITE_PUBLIC_RELEASED_AT: "not-a-date" },
    "VITE_PUBLIC_RELEASED_AT",
  );
});

test("rejects direct Graph email in initial Production", () => {
  expectFailure({ ...production, EMAIL_MODE: "graph" }, "EMAIL_MODE");
});

test("rejects direct Graph calendar in initial Production", () => {
  expectFailure({ ...production, CALENDAR_MODE: "graph" }, "CALENDAR_MODE");
});

test("rejects Dynamics write access in initial Production", () => {
  expectFailure(
    { ...production, DYNAMICS_INTEGRATION_MODE: "read-write" },
    "DYNAMICS_INTEGRATION_MODE",
  );
});

test("rejects disabled Dynamics credentials in Production", () => {
  expectFailure(
    { ...production, DYNAMICS_CLIENT_SECRET: "fictional-test-client-secret" },
    "DYNAMICS_CLIENT_SECRET",
  );
});
