import type { Place } from "../src/index.ts";

export const places: Place[] = [
  {
    id: "bjorkbackens-kafe",
    name: "Björkbackens kafé",
    status: "published",
    categories: ["cafe", "bakery"],
    journeyValue: "detour",
    location: {
      locality: "Exempelby",
      region: "Dalarna",
      country: "SE",
      coordinates: { longitude: 15.1, latitude: 60.4 },
    },
    summary: "A fictional fixture used only in automated tests.",
    tags: ["surdeg", "fika"],
    sources: [{ url: "https://example.com", label: "Test source", checkedAt: "2026-07-16" }],
  },
  {
    id: "sodra-bordet",
    name: "Södra bordet",
    status: "published",
    categories: ["restaurant"],
    journeyValue: "stop",
    location: {
      locality: "Provstad",
      region: "Skåne",
      country: "SE",
      coordinates: { longitude: 13.2, latitude: 55.7 },
    },
    summary: "A second fictional fixture used only in automated tests.",
    tags: ["middag"],
    sources: [{ url: "https://example.org", label: "Test source", checkedAt: "2026-07-16" }],
  },
];
