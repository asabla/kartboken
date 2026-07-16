---
name: verify-kartboken
description: Select and run proportionate Kartboken checks for catalog, search, UI, build, and repository changes before handoff or publication.
---

# Verify Kartboken

Start with the narrowest check that gives fast feedback, then cover every changed boundary.

## Change-to-check map

| Change | Required checks |
| --- | --- |
| Place YAML or schema | `pnpm catalog:validate`, `pnpm test`, `pnpm build` |
| Search or normalization | `pnpm test`, `pnpm test:fuzz` |
| Astro or Svelte UI | `pnpm check`, `pnpm test:e2e` |
| Build or workspace config | `pnpm check`, `pnpm build` |
| Cross-cutting or release-ready | all checks below |

## Full baseline

```sh
pnpm check
pnpm test
pnpm test:fuzz
pnpm test:e2e
```

The end-to-end command performs a production build. Install its browser once with `pnpm exec playwright install chromium` or run `make setup`.

When a check fails, identify whether the cause is product behavior, test expectation, or environment before editing. Never weaken assertions merely to make the suite green. Report exactly which commands ran and any unverified boundary.

