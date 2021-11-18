SHELL := /bin/bash
#==================================================================================
# Dev tools
#==================================================================================

dev:
	lerna bootstrap
	lerna run dev --parallel

publish:
	lerna publish

republish:
	lerna publish from-package --yes

lint:
	npm run lint

lint-fix:
	npm run lint:fix

#==================================================================================
# Build
#==================================================================================

build-dev:
	lerna bootstrap
	lerna run build-dev --parallel

build-development:
	lerna bootstrap
	lerna run build-development --parallel

build-staging:
	lerna bootstrap
	lerna run build-staging --parallel
