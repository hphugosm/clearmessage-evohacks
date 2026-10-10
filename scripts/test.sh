#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
python3 scripts/audit_migration.py
.venv/bin/python -m pip check
.venv/bin/python scripts/export_contract.py --check
npm --prefix frontend run contract:check
.venv/bin/python -m pytest -q
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run test:e2e
