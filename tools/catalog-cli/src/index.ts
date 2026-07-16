import { resolve } from "node:path";

import { loadCatalog } from "@kartboken/catalog";

const [, , command] = process.argv;

if (command !== "validate") {
  console.error("Usage: pnpm catalog:validate");
  process.exitCode = 1;
} else {
  const root = resolve(import.meta.dirname, "../../..");
  const places = await loadCatalog({
    directory: resolve(root, "data/places"),
    schema: resolve(root, "schemas/place.schema.json"),
    includeDrafts: true,
  });
  console.log(`Catalog is valid (${places.length} records).`);
}

