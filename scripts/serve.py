"""Shared privacy-conscious Uvicorn entry point for dev, E2E and Docker."""

import os
import sys
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.runtime import KEEP_ALIVE_SECONDS, LISTEN_BACKLOG, LOG_CONFIG, PrivateArgumentParser

for name in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS", "NUMEXPR_NUM_THREADS", "BLIS_NUM_THREADS", "VECLIB_MAXIMUM_THREADS"):
    os.environ[name] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

parser = PrivateArgumentParser()
parser.add_argument("--host", default="127.0.0.1")
parser.add_argument("--port", type=int, default=8000)
args = parser.parse_args()

if __name__ == "__main__":
    try:
        uvicorn.run("backend.app:app", host=args.host, port=args.port, access_log=False,
                    log_config=LOG_CONFIG, log_level="warning", timeout_keep_alive=KEEP_ALIVE_SECONDS,
                    backlog=LISTEN_BACKLOG, workers=1, server_header=False, proxy_headers=False)
    except Exception:
        raise SystemExit("ClearMessage server unavailable; check service health.") from None
