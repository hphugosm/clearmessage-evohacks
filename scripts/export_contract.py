"""Export/check the exact OpenAPI contract without running a server."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app import create_app  # noqa: E402

parser = argparse.ArgumentParser()
parser.add_argument("--check", action="store_true")
args = parser.parse_args()
path = ROOT / "docs" / "openapi.json"
content = json.dumps(create_app().api.openapi(), ensure_ascii=False, indent=2, sort_keys=True) + "\n"
if args.check:
    if not path.exists() or path.read_text() != content:
        raise SystemExit("Contract differs: run scripts/export_contract.py and npm run contract:generate")
    print("OpenAPI contract matches backend.")
else:
    path.write_text(content)
    print("Exported docs/openapi.json")
