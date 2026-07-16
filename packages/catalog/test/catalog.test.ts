import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { CatalogValidationError, loadCatalog } from "../src/index.ts";

const temporaryDirectories: string[] = [];
const schema = resolve(process.cwd(), "schemas/place.schema.json");

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

async function temporaryCatalog(): Promise<string> {
  const directory = await mkdtemp(resolve(tmpdir(), "kartboken-catalog-"));
  temporaryDirectories.push(directory);
  return directory;
}

describe("loadCatalog", () => {
  it("publishes reviewed records while retaining drafts for curation", async () => {
    const directory = await temporaryCatalog();
    await writeFile(
      resolve(directory, "test-place.yaml"),
      `id: test-place
name: Testplatsen
status: draft
categories: [cafe]
journeyValue: nearby
location:
  address: Exempelvägen 1
  locality: Exempelby
  region: Dalarna
  country: SE
  coordinates:
    longitude: 15.1
    latitude: 60.4
summary: A fictional test fixture.
sources:
  - kind: recommendation
    url: https://example.com
    label: Test source
    checkedAt: 2026-07-16
`,
    );

    await expect(loadCatalog({ directory, schema })).resolves.toEqual([]);
    await expect(loadCatalog({ directory, schema, includeDrafts: true })).resolves.toHaveLength(1);
  });

  it("rejects unsupported records before publication", async () => {
    const directory = await temporaryCatalog();
    await writeFile(resolve(directory, "unsupported.yaml"), "id: unsupported\nname: Unsupported\n");

    await expect(loadCatalog({ directory, schema, includeDrafts: true })).rejects.toBeInstanceOf(
      CatalogValidationError,
    );
  });

  it("requires recommendation and official provenance for published records", async () => {
    const directory = await temporaryCatalog();
    await writeFile(
      resolve(directory, "unverified-place.yaml"),
      `id: unverified-place
name: Unverified place
status: published
categories: [cafe]
journeyValue: nearby
location:
  address: Exempelvägen 1
  locality: Exempelby
  region: Dalarna
  country: SE
  coordinates:
    longitude: 15.1
    latitude: 60.4
summary: A fictional test fixture.
sources:
  - kind: recommendation
    url: https://example.com
    label: Test source
    checkedAt: 2026-07-16
`,
    );

    await expect(loadCatalog({ directory, schema })).rejects.toBeInstanceOf(CatalogValidationError);
  });
});
