# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV ASTRO_TELEMETRY_DISABLED=1

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/catalog/package.json packages/catalog/package.json
COPY tools/catalog-cli/package.json tools/catalog-cli/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY apps apps
COPY data data
COPY packages packages
COPY schemas schemas
COPY tools tools
COPY tsconfig.json ./

ARG PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/positron
ENV PUBLIC_MAP_STYLE_URL=$PUBLIC_MAP_STYLE_URL

RUN pnpm build

FROM caddy:2.10-alpine AS runtime

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv

USER caddy
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

