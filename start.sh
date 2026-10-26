#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
node scripts/check-node.mjs
if [ ! -f node_modules/vite/bin/vite.js ]; then npm ci; fi
npm run dev -- --open
