#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 -m venv .venv
.venv/bin/python -m pip install --only-binary=:all: --require-hashes -r backend/requirements-dev.txt
npm ci --prefix frontend --no-audit --no-fund
