#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run generate

#deploy via gh-pages
npm run deploy