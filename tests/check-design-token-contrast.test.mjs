import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tokenUrl = new URL("../app/styles/tokens.css", import.meta.url);

const toLinearChannel = (channel) => {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const luminance = (hexColor) => {
  const channels = hexColor
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => toLinearChannel(Number.parseInt(channel, 16)));

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (firstColor, secondColor) => {
  const firstLuminance = luminance(firstColor);
  const secondLuminance = luminance(secondColor);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
};

const readColorTokens = async () => {
  const source = await readFile(tokenUrl, "utf8");
  return new Map(
    [...source.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map(
      ([, name, value]) => [name, value.toUpperCase()],
    ),
  );
};

test("approved normal text pairs meet the 4.5:1 minimum", async () => {
  const tokens = await readColorTokens();
  const pairs = [
    ["color-white", "color-blue-700"],
    ["color-white", "color-blue-800"],
    ["color-white", "color-blue-900"],
    ["color-blue-700", "color-white"],
    ["color-neutral-950", "color-white"],
    ["color-neutral-900", "color-white"],
    ["color-neutral-700", "color-white"],
    ["color-neutral-600", "color-white"],
    ["color-success-foreground", "color-success-background"],
    ["color-warning-foreground", "color-warning-background"],
    ["color-danger-foreground", "color-danger-background"],
    ["color-information-foreground", "color-information-background"],
    ["color-status-neutral-foreground", "color-status-neutral-background"],
  ];

  for (const [foregroundName, backgroundName] of pairs) {
    const foreground = tokens.get(foregroundName);
    const background = tokens.get(backgroundName);
    assert.ok(foreground, `Missing token ${foregroundName}`);
    assert.ok(background, `Missing token ${backgroundName}`);
    assert.ok(
      contrast(foreground, background) >= 4.5,
      `${foregroundName} on ${backgroundName} failed normal text contrast`,
    );
  }
});

test("approved control, status, and focus cues meet the 3:1 minimum", async () => {
  const tokens = await readColorTokens();
  const pairs = [
    ["color-neutral-control", "color-white"],
    ["color-neutral-control", "color-neutral-050"],
    ["color-success-boundary", "color-success-background"],
    ["color-warning-boundary", "color-warning-background"],
    ["color-danger-boundary", "color-danger-background"],
    ["color-information-boundary", "color-information-background"],
    ["color-status-neutral-boundary", "color-status-neutral-background"],
    ["color-blue-500", "color-white"],
    ["color-blue-500", "color-neutral-050"],
  ];

  for (const [foregroundName, backgroundName] of pairs) {
    const foreground = tokens.get(foregroundName);
    const background = tokens.get(backgroundName);
    assert.ok(foreground, `Missing token ${foregroundName}`);
    assert.ok(background, `Missing token ${backgroundName}`);
    assert.ok(
      contrast(foreground, background) >= 3,
      `${foregroundName} on ${backgroundName} failed non-text contrast`,
    );
  }
});
