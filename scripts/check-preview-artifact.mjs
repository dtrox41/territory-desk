import { lstat, readFile, readdir } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const expectedBasePath = "/territory-desk/";
const maximumArtifactBytes = 25 * 1024 * 1024;
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".svg",
  ".txt",
  ".webmanifest",
  ".xml",
]);

const forbiddenPathPatterns = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)(?:credentials?|secrets?|private|import-source)(?:\/|$)/i,
  /(?:^|\/)(?:service-account|id_rsa|id_ed25519)(?:\.|$)/i,
  /\.(?:map|pem|p12|pfx)$/i,
];

const forbiddenContentPatterns = [
  { label: "private-key material", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "GitHub credential", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { label: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "bearer credential", pattern: /\bBearer\s+[A-Za-z0-9._~-]{20,}/i },
  {
    label: "server-only configuration name",
    pattern:
      /\b(?:DATABASE_URL|DYNAMICS_CLIENT_SECRET|EMAIL_PROVIDER_API_KEY|SESSION_SECRET|SMS_PROVIDER_API_KEY)\b/,
  },
  { label: "source-map reference", pattern: /sourceMappingURL\s*=/i },
];

const allowedFictionalEmailDomain = /@(?:example\.com|example\.test)\b/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function fail(message) {
  throw new Error(`Preview artifact safety check failed: ${message}`);
}

async function collectFiles(rootDirectory, currentDirectory = rootDirectory) {
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = resolve(currentDirectory, entry.name);
    const relativePath = relative(rootDirectory, absolutePath).split(sep).join("/");
    const stats = await lstat(absolutePath);

    if (stats.isSymbolicLink()) {
      fail(`symbolic links are not publishable (${relativePath})`);
    }

    if (stats.isDirectory()) {
      files.push(...(await collectFiles(rootDirectory, absolutePath)));
      continue;
    }

    if (!stats.isFile()) {
      fail(`unsupported artifact entry (${relativePath})`);
    }

    files.push({ absolutePath, relativePath, size: stats.size });
  }

  return files;
}

export async function checkPreviewArtifact(
  artifactDirectory,
  {
    buildId = process.env.VITE_PUBLIC_BUILD_ID,
    releasedAt = process.env.VITE_PUBLIC_RELEASED_AT,
  } = {},
) {
  const rootDirectory = resolve(artifactDirectory);
  const files = await collectFiles(rootDirectory).catch((error) => {
    fail(`artifact directory is unavailable (${error.message})`);
  });

  if (!files?.length) fail("artifact directory is empty");

  const normalizedBuildId = buildId?.trim();
  const normalizedReleasedAt = releasedAt?.trim();

  if (!normalizedBuildId) fail("VITE_PUBLIC_BUILD_ID is missing");
  if (!normalizedReleasedAt || Number.isNaN(Date.parse(normalizedReleasedAt))) {
    fail("VITE_PUBLIC_RELEASED_AT is missing or invalid");
  }

  const fileByPath = new Map(files.map((file) => [file.relativePath, file]));
  for (const requiredPath of [
    "404.html",
    "index.html",
    "manifest.webmanifest",
    "offline-fallback.html",
    "sw.js",
  ]) {
    if (!fileByPath.has(requiredPath)) fail(`missing ${requiredPath}`);
  }

  const artifactSize = files.reduce((total, file) => total + file.size, 0);
  if (artifactSize > maximumArtifactBytes) {
    fail(`artifact is larger than ${maximumArtifactBytes} bytes`);
  }

  for (const file of files) {
    if (forbiddenPathPatterns.some((pattern) => pattern.test(file.relativePath))) {
      fail(`forbidden path ${file.relativePath}`);
    }
  }

  const indexHtml = await readFile(fileByPath.get("index.html").absolutePath, "utf8");
  const fallbackHtml = await readFile(
    fileByPath.get("404.html").absolutePath,
    "utf8",
  );

  if (indexHtml !== fallbackHtml) fail("404.html does not match index.html");
  if (!indexHtml.includes(expectedBasePath)) {
    fail(`index.html does not reference ${expectedBasePath}`);
  }
  if (!indexHtml.includes(normalizedBuildId)) {
    fail("index.html does not record the exact source build identifier");
  }
  if (!indexHtml.includes(normalizedReleasedAt)) {
    fail("index.html does not record the release timestamp");
  }

  const textFiles = files.filter((file) =>
    textExtensions.has(extname(file.relativePath).toLowerCase()),
  );
  let combinedText = "";

  for (const file of textFiles) {
    const content = await readFile(file.absolutePath, "utf8");
    combinedText += `\n${content}`;

    for (const { label, pattern } of forbiddenContentPatterns) {
      if (pattern.test(content)) fail(`${label} found in ${file.relativePath}`);
    }

    for (const email of content.match(emailPattern) ?? []) {
      if (!allowedFictionalEmailDomain.test(email)) {
        fail(`non-fictional email address found in ${file.relativePath}`);
      }
    }
  }

  if (
    !combinedText.includes(
      "Fictional Prototype — Do not enter real employee or customer information",
    )
  ) {
    fail("persistent fictional-prototype disclosure is missing");
  }

  return {
    artifactBytes: artifactSize,
    buildId: normalizedBuildId,
    fileCount: files.length,
    releasedAt: normalizedReleasedAt,
  };
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";

if (import.meta.url === invokedPath) {
  const artifactDirectory = process.argv[2] || "build/client";
  const result = await checkPreviewArtifact(artifactDirectory);
  console.log(
    `Preview artifact passed safety validation (${result.fileCount} files, ${result.artifactBytes} bytes, build ${result.buildId}).`,
  );
}
