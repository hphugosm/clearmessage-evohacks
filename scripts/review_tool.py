#!/usr/bin/env python3
"""Launch the standalone review interface on IPv4 loopback only."""
import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools.human_review.app import DEFAULT_REVIEW, create_app


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--review", type=Path, default=DEFAULT_REVIEW)
    parser.add_argument("--records", type=Path, help="Defaults to records.jsonl beside the review file")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-suggestions", action="store_true")
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error("port must be between 1024 and 65535")
    try:
        app = create_app(args.review, args.records, port=args.port, suggestions=not args.no_suggestions)
    except Exception:
        print("Review tool could not load local files. Check paths and the documented schema; no files changed.", file=sys.stderr)
        return 2
    import uvicorn
    print(f"ClearMessage human review tool: http://127.0.0.1:{args.port}", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=args.port, access_log=False, log_level="warning",
                proxy_headers=False, server_header=False, limit_concurrency=16, timeout_keep_alive=5)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
