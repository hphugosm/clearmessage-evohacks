"""Liveness by default; optional readiness. No diagnostic payload or traceback."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.runtime import PrivateArgumentParser

import json
import urllib.request


def main() -> int:
    parser = PrivateArgumentParser(description=__doc__)
    parser.add_argument("--require-model", action="store_true")
    parser.add_argument("--port", type=int, default=7860)
    args = parser.parse_args()
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(f"http://127.0.0.1:{args.port}/api/health", timeout=2) as response:
            state = json.loads(response.read(8192))
        return 0 if state["service_status"] == "ok" and (not args.require_model or state["model_ready"] is True) else 1
    except Exception:
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
