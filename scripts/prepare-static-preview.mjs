import { copyFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const clientBuildDirectory = resolve("build/client");
const indexPath = resolve(clientBuildDirectory, "index.html");
const fallbackPath = resolve(clientBuildDirectory, "404.html");

const indexStats = await stat(indexPath).catch(() => null);

if (!indexStats?.isFile()) {
  throw new Error(
    "Static preview preparation requires build/client/index.html.",
  );
}

await copyFile(indexPath, fallbackPath);

console.log(
  "Static preview prepared with a GitHub Pages 404 fallback.",
);
