#!/usr/bin/env python3
"""Explicit setup download, not part of install, analysis, import or training."""

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.data_prep import MAX_BYTES, SOURCE, DataError, digest, write_new


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("ml/data/raw/Dataset_5971.zip"))
    args = parser.parse_args()
    try:
        with urllib.request.urlopen(SOURCE["download_url"], timeout=30) as response:
            payload = response.read(MAX_BYTES + 1)
        if len(payload) > MAX_BYTES:
            raise DataError("download_size_limit")
        # Reject HTML/login responses; offline import validates ZIP members/CSV.
        if not payload.startswith(b"PK"):
            raise DataError("download_not_zip")
        write_new(args.output, payload)
        print(json.dumps({"status": "downloaded_not_audited", "bytes": len(payload), "sha256": digest(payload)}))
        return 0
    except urllib.error.HTTPError as error:
        print(json.dumps({"status": "blocked", "code": "http_error", "http_status": error.code}), file=sys.stderr)
    except (urllib.error.URLError, TimeoutError):
        print('{"status":"blocked","code":"network_unavailable_or_timeout"}', file=sys.stderr)
    except DataError as error:
        print(json.dumps({"status": "blocked", "code": str(error)}), file=sys.stderr)
    except OSError:
        print('{"status":"blocked","code":"download_io_error"}', file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
