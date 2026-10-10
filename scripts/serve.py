"""Shared privacy-conscious Uvicorn entry point for dev, E2E and Docker."""

import argparse
import sys
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
parser = argparse.ArgumentParser()
parser.add_argument("--host", default="127.0.0.1")
parser.add_argument("--port", type=int, default=8000)
args = parser.parse_args()

if __name__ == "__main__":
    uvicorn.run("backend.app:app", host=args.host, port=args.port, access_log=False,
                log_level="warning", limit_concurrency=32, timeout_keep_alive=5,
                server_header=False, proxy_headers=False)
