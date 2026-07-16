# AGENTS.md

This file contains durable guidance for agents working in Kartboken. Keep it concise, repository-specific, and aligned with commands that actually run. Detailed procedures belong in `.agents/skills`.

## Repository map

- `apps/web`: Astro static site and Svelte interactive islands.
- `packages/catalog`: place types, YAML validation, normalization, and client-safe search.
- `tools/catalog-cli`: manual catalog validation and future curation commands.
- `data/places`: reviewed place records; one YAML file per stable place ID.
- `schemas`: versioned data contracts.
- `tests/e2e`: Playwright tests against the production build.
- `.agents/skills`: focused maintenance workflows for agents.

## Invariants

- Keep the deployed application static and read-only. Do not add a database, server API, authentication, background worker, or administration UI without an explicit architecture decision.
- Treat reviewed YAML as the canonical catalog. Scraped material is evidence, never automatically published content.
- Every published claim must be traceable to a source entry. Do not invent opening hours, ratings, descriptions, coordinates, or source details.
- Preserve stable place IDs and schema compatibility. Make migrations explicit when a contract must change.
- Keep browser payloads and dependencies small. Prefer build-time work and platform APIs over runtime services and large libraries.
- Keep search deterministic, locale-aware, and usable without network calls.

## Engineering approach

- Inspect nearby code and repository guidance before changing behavior.
- Make the smallest coherent change; avoid speculative frameworks and abstractions.
- Add or update tests at the behavioral boundary being changed.
- Use accessible HTML first. Interactive controls must work with a keyboard and expose clear labels and states.
- Use Conventional Commits for commit messages, for example `feat: add place filters` or `fix: preserve Swedish search terms`.
- Do not provide time estimates. Describe scope, uncertainty, dependencies, and verification instead.

## Verification

Run the narrowest relevant check while iterating, then the appropriate baseline before handoff:

- `pnpm check`: catalog validation and static type/framework checks.
- `pnpm test`: deterministic unit and search-quality tests.
- `pnpm test:fuzz`: property-based tests for normalization and fuzzy search.
- `pnpm test:e2e`: production build and browser-level behavior.
- `pnpm build`: static deployable output.

Never claim a check was run if it was not. Explain environmental blockers and report the last successful boundary.

## Repository skills

- Use `.agents/skills/curate-catalog/SKILL.md` when adding, reviewing, or changing place data, provenance, taxonomy, or ingestion behavior.
- Use `.agents/skills/verify-kartboken/SKILL.md` to select and run proportionate checks.
- Use `.agents/skills/update-agents-md/SKILL.md` when repository structure or durable agent guidance changes.

