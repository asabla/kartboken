---
name: curate-catalog
description: Add, review, or change Kartboken place YAML, provenance, taxonomy, schemas, validation, or manual ingestion behavior without publishing unsupported claims.
---

# Curate the catalog

Use this workflow whenever work changes place data or the rules that turn research into published records.

## Workflow

1. Inspect `schemas/place.schema.json`, the target record, and similar records before editing.
2. Resolve a stable, human-readable ID. Never reuse an ID for a different real-world place.
3. Record facts conservatively. Coordinates, locality, category, journey value, and descriptive claims must be supported by a listed source.
4. Paraphrase source material. Do not copy reviews or scraped page text into the public catalog.
5. Set uncertain or incomplete records to `draft`; only reviewed records may be `published`.
6. Run `pnpm catalog:validate`, relevant package tests, and `pnpm build` if published output changes.

## Data rules

- Keep one YAML record per file under `data/places`, named after its `id`.
- Prefer source URLs that identify the original recommendation or the place itself.
- Use ISO 8601 dates for `checkedAt`.
- Keep coordinates in WGS84 longitude/latitude and inside their valid numeric ranges.
- Do not infer ratings, popularity, accessibility, opening hours, or price level from absence of evidence.
- Schema changes require fixtures and tests for both accepted and rejected records.

If sources disagree, preserve the disagreement in research outside the published description and choose the more conservative public claim.

