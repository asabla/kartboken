import type { Place } from "./types.ts";

export interface SearchResult {
  place: Place;
  score: number;
}

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("sv-SE")
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

export function editDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        (current[rightIndex - 1] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + 1,
        (previous[rightIndex - 1] ?? 0) + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length] ?? Math.max(left.length, right.length);
}

function tokenScore(query: string, candidate: string): number {
  if (query === candidate) return 100;
  if (candidate.startsWith(query)) return 82 - Math.min(candidate.length - query.length, 20);
  if (candidate.includes(query)) return 65 - Math.min(candidate.length - query.length, 20);

  const distance = editDistance(query, candidate);
  const allowedDistance = Math.max(1, Math.floor(Math.max(query.length, candidate.length) * 0.3));
  return distance <= allowedDistance ? 55 - distance * 8 : 0;
}

function searchWords(place: Place): string[] {
  return normalizeSearchText(
    [
      place.name,
      place.summary,
      place.location.address,
      place.location.locality,
      place.location.region,
      ...place.categories,
      ...(place.tags ?? []),
    ].join(" "),
  ).split(" ");
}

export function searchPlaces(places: readonly Place[], query: string): SearchResult[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return places
      .map((place) => ({ place, score: 0 }))
      .sort((left, right) => left.place.name.localeCompare(right.place.name, "sv"));
  }

  const queryTokens = normalized.split(" ");
  return places
    .map((place) => {
      const words = searchWords(place);
      const scores = queryTokens.map((token) => Math.max(0, ...words.map((word) => tokenScore(token, word))));
      return { place, score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) };
    })
    .filter((result) => result.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.place.name.localeCompare(right.place.name, "sv"),
    );
}
