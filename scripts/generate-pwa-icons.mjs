import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

const iconsDirectory = resolve("public/icons");
const standardSvg = await readFile(
  resolve(iconsDirectory, "territory-desk-icon.svg"),
  "utf8",
);
const maskableSvg = await readFile(
  resolve(iconsDirectory, "territory-desk-maskable.svg"),
  "utf8",
);
const iconTargets = [
  { filename: "territory-desk-180.png", size: 180, svg: standardSvg },
  { filename: "territory-desk-192.png", size: 192, svg: standardSvg },
  { filename: "territory-desk-512.png", size: 512, svg: standardSvg },
  {
    filename: "territory-desk-maskable-512.png",
    size: 512,
    svg: maskableSvg,
  },
];

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browser = await chromium.launch({
  executablePath: executablePath || undefined,
  headless: true,
});

try {
  for (const { filename, size, svg } of iconTargets) {
    const page = await browser.newPage({
      deviceScaleFactor: 1,
      viewport: { height: size, width: size },
    });
    await page.setContent(`
      <!doctype html>
      <html>
        <head>
          <style>
            html, body, svg {
              display: block;
              height: 100%;
              margin: 0;
              overflow: hidden;
              width: 100%;
            }
          </style>
        </head>
        <body>${svg}</body>
      </html>
    `);
    await page.screenshot({ path: resolve(iconsDirectory, filename) });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("Generated Apple, Android, and maskable PWA icons.");
