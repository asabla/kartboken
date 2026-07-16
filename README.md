# Kartboken

Kartboken is a map-first guide to restaurants, cafés, and places worth a stop or a journey. The application is public, static, and built from a manually reviewed catalog so it can run with very little infrastructure.

## Start locally

Requirements: Node.js 24 or newer and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open <http://localhost:4321>. To install the browser used by the end-to-end suite as part of setup, run `make setup`.

## Useful commands

```sh
pnpm catalog:validate  # validate every YAML place record
pnpm check             # catalog, TypeScript, Astro, and Svelte checks
pnpm test              # deterministic unit and search-quality tests
pnpm test:fuzz         # property-based fuzzy tests
pnpm test:e2e          # production build and Playwright tests
pnpm build             # static production build
```

The same commands are available as `make check`, `make test`, `make fuzz`, `make e2e`, and `make build`.

## Architecture

- `apps/web` is an Astro static site with small Svelte islands.
- `data/places` is the reviewed, version-controlled source of truth.
- `packages/catalog` validates and searches catalog records.
- `tools/catalog-cli` contains manual catalog workflows.
- `schemas/place.schema.json` defines the public place-record contract.

There is no runtime database, account system, administration interface, or application API. Scraping and research stay outside the deployed site; only reviewed facts and source references enter the catalog.

The map uses OpenFreeMap's public Positron style by default. Set `PUBLIC_MAP_STYLE_URL` while building to use another MapLibre-compatible style, including a self-hosted one.

## Deploy

The output in `apps/web/dist` can be published to any static host. A hardened Caddy container and Compose service are also included:

```sh
docker compose up --build
```

See [docs/deployment.md](docs/deployment.md) for static-host caching, container operation, and map-hosting choices.

Repository guidance for coding agents lives in [AGENTS.md](AGENTS.md), with focused workflows under `.agents/skills`.
