# Catalog curation

The reviewed YAML files in `data/places` are Kartboken's source of truth. Research, scraped text, and notes stay outside the published catalog until a person has checked and paraphrased the relevant facts.

## Add a place

1. Read `schemas/place-v1.schema.json` and a similar existing record.
2. Create `data/places/<id>.yaml`. Use a stable lowercase ID with hyphens and set `schemaVersion: 1`.
3. Start with `status: draft` while any required fact or source is uncertain.
4. Add a conservative summary in Kartboken's own words. Do not copy recommendation or venue text.
5. Record when each source was last checked using an ISO `YYYY-MM-DD` date.
6. Run `pnpm catalog:validate`, `pnpm test`, and `pnpm build`.
7. Change the record to `published` only after the record and its sources have been reviewed.

The filename must exactly match the place ID. IDs are permanent identifiers: never reuse one for another real-world place.

## Publication requirements

Every published record must include:

- a `recommendation` source showing why the place belongs in Kartboken;
- an `official` source identifying the place and supporting current venue facts;
- an address and WGS84 longitude/latitude supported by one of the listed sources;
- at least one category, a journey value, and a short factual summary.

Use a `geodata` source when coordinates or address come from a separate map or directory. Do not add ratings, popularity, opening hours, prices, accessibility claims, or availability unless the data contract is deliberately extended and a reliable update process exists.

## Journey values

| Value | Editorial meaning |
| --- | --- |
| `nearby` | Worth considering when already nearby. |
| `stop` | Worth planning as a stop along a route. |
| `detour` | Worth leaving the direct route for. |
| `journey` | Strong enough to be a destination itself. |

Journey value is an editorial classification of the recommendation, not a calculated distance or universal rating. When evidence is ambiguous, choose the more conservative value.

## Record lifecycle

- `draft`: valid working record, excluded from the public site.
- `published`: reviewed record included in the site build.
- `archived`: retained for history but excluded from the public site.

If sources disagree, keep the public claim conservative and resolve the research separately. A passing schema validates structure; it does not replace editorial review.

