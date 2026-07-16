import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const assetDirectory = resolve(root, "apps/web/dist/_astro");
const html = await readFile(resolve(root, "apps/web/dist/index.html"), "utf8");
const files = await readdir(assetDirectory);

const sizes = await Promise.all(
  files.map(async (file) => ({ file, bytes: (await stat(resolve(assetDirectory, file))).size })),
);
const mapAssets = sizes.filter(({ file }) => file.startsWith("maplibre-gl."));
const applicationAssets = sizes.filter(({ file }) => !file.startsWith("maplibre-gl."));
const sum = (entries) => entries.reduce((total, { bytes }) => total + bytes, 0);

const applicationBytes = sum(applicationAssets);
const lazyMapBytes = sum(mapAssets);
const failures = [];

if (applicationBytes > 100_000) {
  failures.push(`application assets are ${applicationBytes} bytes; budget is 100000`);
}
if (lazyMapBytes > 1_200_000) {
  failures.push(`lazy map assets are ${lazyMapBytes} bytes; budget is 1200000`);
}
if (/<link[^>]+href="\/_astro\/maplibre-gl\.[^"]+\.css"/u.test(html)) {
  failures.push("MapLibre CSS is linked eagerly from the document");
}
if (mapAssets.length < 2) {
  failures.push("expected separate lazy MapLibre JavaScript and CSS assets");
}

if (failures.length) {
  console.error(`Bundle budget failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Bundle budget passes (${applicationBytes} application bytes; ${lazyMapBytes} lazy map bytes).`);
}

