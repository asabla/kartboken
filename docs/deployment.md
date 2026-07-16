# Deployment

Kartboken has no application server or runtime data store. A production build is a directory of static files in `apps/web/dist`, and any conventional static host can serve it.

## Build-time settings

`PUBLIC_MAP_STYLE_URL` selects the MapLibre style document. It is embedded into the browser bundle at build time, so changing it requires a rebuild.

```sh
PUBLIC_MAP_STYLE_URL=https://maps.example.com/styles/kartboken/style.json pnpm build
```

Without this setting, Kartboken uses OpenFreeMap's public Positron style. The application still works as a searchable source-backed list when a style or tile service is unavailable.

## Static hosting

Run `pnpm build`, then publish the contents of `apps/web/dist`. Serve files under `/_astro/` with a long immutable cache lifetime; their filenames contain content hashes. Do not apply the same long lifetime to HTML.

The canonical site URL is configured as `https://kartboken.com` in `apps/web/astro.config.mjs`. Update it before building another canonical deployment.

## Container

The included image builds the catalog and site, then serves only the static output with an unprivileged Caddy process on port 8080.

```sh
docker build -t kartboken:local .
docker run --read-only --tmpfs /tmp:size=16m --cap-drop ALL \
  --security-opt no-new-privileges --publish 8080:8080 kartboken:local
```

Or use Compose:

```sh
docker compose up --build
```

Set `KARTBOKEN_PORT` to change the host port. Set `PUBLIC_MAP_STYLE_URL` before the Compose build to use a different map service.

Put the container behind a TLS-terminating reverse proxy for public traffic. The image deliberately does not manage certificates or persist Caddy state.

## Map hosting choices

The deployed site is independent of a particular map provider:

1. The default OpenFreeMap public style is the lowest-maintenance starting point and requires no account or API key.
2. A self-hosted OpenFreeMap deployment can expose the same kind of MapLibre style URL. Rebuild Kartboken with that URL when operational control is worth the extra tile-storage and update cost.
3. Another MapLibre-compatible style service can be used in the same way. Confirm its attribution, usage terms, fonts, sprites, and tile endpoints before switching.

PMTiles is a possible later optimization for serving regional tile archives directly from object storage. It is not enabled in v1 because MapLibre needs an additional protocol adapter and the current catalog does not justify that extra client code.

## Operations

- Deploys are replaceable static artifacts; roll back by serving an earlier image or `dist` directory.
- Catalog backups are ordinary Git history. There is no runtime volume to back up.
- Rebuild after catalog, application, dependency, or map-style changes.
- Keep the image behind HTTPS and monitor the root health endpoint plus external map availability separately.

