import { describe, expect, it } from "vitest";

import { normalizeSearchText, searchPlaces } from "../src/index.ts";
import { places } from "./fixtures.ts";

describe("normalizeSearchText", () => {
  it("folds Swedish diacritics and punctuation", () => {
    expect(normalizeSearchText("  BJÖRKBACKENS—KAFÉ! ")).toBe("bjorkbackens kafe");
  });
});

describe("searchPlaces", () => {
  it("finds names despite a small typo", () => {
    expect(searchPlaces(places, "bjorkbakens kafe")[0]?.place.id).toBe("bjorkbackens-kafe");
  });

  it("finds categories, localities, and tags", () => {
    expect(searchPlaces(places, "surdeg exempelby")[0]?.place.id).toBe("bjorkbackens-kafe");
    expect(searchPlaces(places, "restaurant skane")[0]?.place.id).toBe("sodra-bordet");
  });

  it("finds address and summary text", () => {
    expect(searchPlaces(places, "exempelvagen")[0]?.place.id).toBe("bjorkbackens-kafe");
    expect(searchPlaces(places, "second fictional")[0]?.place.id).toBe("sodra-bordet");
  });

  it("uses a stable alphabetical order for an empty query", () => {
    expect(searchPlaces(places, "").map((result) => result.place.id)).toEqual([
      "bjorkbackens-kafe",
      "sodra-bordet",
    ]);
  });
});
