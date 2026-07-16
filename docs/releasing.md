# Releasing Kartboken

Kartboken releases are static artifacts. A release does not require a database migration, service deployment order, or runtime maintenance window.

## Checklist

1. Confirm the intended changes are present on the release branch and update `CHANGELOG.md`.
2. Set the same semantic version in the root, web, catalog, and catalog CLI package manifests.
3. Run `pnpm check`, `pnpm test`, `pnpm test:fuzz`, `pnpm test:budget`, and `pnpm test:e2e`.
4. Build the container and confirm its health check where Docker is available.
5. Merge the release commit to `main` after review and a green CI run.
6. Create an annotated `v<version>` tag on the reviewed `main` commit and push the tag.
7. Publish the static directory or container using the same version. Prefer immutable image tags or digests.
8. Verify the public root page, map fallback, one search, one source link, and the configured map style.

Rollback by serving the previous static artifact or container image. Git history retains the catalog and schema used for every release.

