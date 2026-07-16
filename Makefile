.PHONY: setup dev build check test fuzz e2e

setup:
	pnpm install
	pnpm exec playwright install chromium

dev:
	pnpm dev

build:
	pnpm build

check:
	pnpm check

test:
	pnpm test

fuzz:
	pnpm test:fuzz

e2e:
	pnpm test:e2e

