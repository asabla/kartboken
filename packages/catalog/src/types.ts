export const placeStatuses = ["draft", "published", "archived"] as const;
export type PlaceStatus = (typeof placeStatuses)[number];

export const placeCategories = [
  "restaurant",
  "cafe",
  "bakery",
  "bar",
  "farm-shop",
  "food-stop",
  "other",
] as const;
export type PlaceCategory = (typeof placeCategories)[number];

export const journeyValues = ["nearby", "stop", "detour", "journey"] as const;
export type JourneyValue = (typeof journeyValues)[number];

export interface PlaceSource {
  kind: "recommendation" | "official" | "geodata";
  url: string;
  label: string;
  checkedAt: string;
}

export interface Place {
  id: string;
  name: string;
  status: PlaceStatus;
  categories: PlaceCategory[];
  journeyValue: JourneyValue;
  location: {
    address: string;
    locality: string;
    region: string;
    country: "SE";
    coordinates: {
      longitude: number;
      latitude: number;
    };
  };
  summary: string;
  tags?: string[];
  sources: PlaceSource[];
}
