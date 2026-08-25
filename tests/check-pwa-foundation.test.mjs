import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const manifestPath = new URL("../public/manifest.webmanifest", import.meta.url);

test("PWA manifest defines a standalone, base-path-safe application", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(manifest.name, "Territory Desk");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.theme_color, "#0B4B91");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
});

test("PWA public foundation includes install and offline assets", async () => {
  const requiredAssets = [
    "../public/sw.js",
    "../public/offline-fallback.html",
    "../public/icons/territory-desk-180.png",
    "../public/icons/territory-desk-192.png",
    "../public/icons/territory-desk-512.png",
    "../public/icons/territory-desk-maskable-512.png",
  ];

  await Promise.all(
    requiredAssets.map((asset) => access(new URL(asset, import.meta.url))),
  );
});
