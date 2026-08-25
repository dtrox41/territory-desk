import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { checkPreviewArtifact } from "../scripts/check-preview-artifact.mjs";

const buildId = "fictional-preview-build";
const releasedAt = "2026-08-24T18:15:27Z";

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "territory-desk-artifact-"));
  const index = `<!doctype html><meta name="territory-desk-build-id" content="${buildId}"><meta name="territory-desk-released-at" content="${releasedAt}"><script src="/territory-desk/assets/app.js"></script>`;

  await mkdir(join(directory, "assets"));
  await Promise.all([
    writeFile(join(directory, "index.html"), index),
    writeFile(join(directory, "404.html"), index),
    writeFile(join(directory, "manifest.webmanifest"), "{}"),
    writeFile(join(directory, "offline-fallback.html"), "Offline"),
    writeFile(join(directory, "sw.js"), "const fictional = true;"),
    writeFile(
      join(directory, "assets/app.js"),
      'const notice="Fictional Prototype — Do not enter real employee or customer information"; const email="lead@example.com";',
    ),
  ]);

  return directory;
}

async function withFixture(run) {
  const directory = await createFixture();
  try {
    await run(directory);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

test("accepts a traceable, fictional GitHub Pages artifact", async () => {
  await withFixture(async (directory) => {
    const result = await checkPreviewArtifact(directory, {
      buildId,
      releasedAt,
    });
    assert.equal(result.fileCount, 6);
    assert.equal(result.buildId, buildId);
  });
});

test("rejects a fallback that differs from the application document", async () => {
  await withFixture(async (directory) => {
    await writeFile(join(directory, "404.html"), "different");
    await assert.rejects(
      checkPreviewArtifact(directory, { buildId, releasedAt }),
      /404\.html does not match index\.html/,
    );
  });
});

test("rejects server-only configuration markers", async () => {
  await withFixture(async (directory) => {
    await writeFile(
      join(directory, "assets/unsafe.js"),
      "const key = 'DATABASE_URL';",
    );
    await assert.rejects(
      checkPreviewArtifact(directory, { buildId, releasedAt }),
      /server-only configuration name/,
    );
  });
});

test("rejects non-fictional email addresses", async () => {
  await withFixture(async (directory) => {
    await writeFile(
      join(directory, "assets/unsafe.js"),
      "const email = 'person@company.com';",
    );
    await assert.rejects(
      checkPreviewArtifact(directory, { buildId, releasedAt }),
      /non-fictional email address/,
    );
  });
});
