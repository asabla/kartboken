import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse } from "yaml";

import type { Place } from "./types.ts";

export interface LoadCatalogOptions {
  directory: URL | string;
  schema: URL | string;
  includeDrafts?: boolean;
}

export class CatalogValidationError extends Error {
  readonly file: string;
  readonly details: ErrorObject[] | null | undefined;

  constructor(
    file: string,
    details: ErrorObject[] | null | undefined,
  ) {
    const message = details?.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
    super(`${file}: ${message || "invalid place record"}`);
    this.name = "CatalogValidationError";
    this.file = file;
    this.details = details;
  }
}

function pathOf(value: URL | string): string {
  return value instanceof URL ? fileURLToPath(value) : value;
}

export async function loadCatalog(options: LoadCatalogOptions): Promise<Place[]> {
  const directory = pathOf(options.directory);
  const schema = JSON.parse(await readFile(pathOf(options.schema), "utf8")) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile<Place>(schema);
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.ya?ml$/u.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name, "en"));

  const places: Place[] = [];
  const ids = new Map<string, string>();

  for (const entry of entries) {
    const file = `${directory}/${entry.name}`;
    const value: unknown = parse(await readFile(file, "utf8"));
    if (!validate(value)) {
      throw new CatalogValidationError(entry.name, validate.errors);
    }
    if (ids.has(value.id)) {
      throw new Error(`${entry.name}: duplicate place id ${value.id} (also in ${ids.get(value.id)})`);
    }
    if (entry.name.replace(/\.ya?ml$/u, "") !== value.id) {
      throw new Error(`${entry.name}: filename must match place id ${value.id}`);
    }
    ids.set(value.id, entry.name);
    if (options.includeDrafts || value.status === "published") {
      places.push(value);
    }
  }

  return places.sort((left, right) => left.name.localeCompare(right.name, "sv"));
}
