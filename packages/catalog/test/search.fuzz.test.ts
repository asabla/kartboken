import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { normalizeSearchText, searchPlaces } from "../src/index.ts";
import { places } from "./fixtures.ts";

describe("fuzzy search properties", () => {
  it("normalization is idempotent", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const normalized = normalizeSearchText(value);
        expect(normalizeSearchText(normalized)).toBe(normalized);
      }),
      { numRuns: 1_000 },
    );
  });

  it("is deterministic and returns each place at most once", () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const first = searchPlaces(places, query).map(({ place, score }) => [place.id, score]);
        const second = searchPlaces(places, query).map(({ place, score }) => [place.id, score]);
        expect(second).toEqual(first);
        expect(new Set(first.map(([id]) => id)).size).toBe(first.length);
      }),
      { numRuns: 1_000 },
    );
  });
});
