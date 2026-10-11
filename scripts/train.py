#!/usr/bin/env python3
"""Explicit training command; no demo data and no automatic approval."""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.data_prep import DataError
from ml.train import run


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest", type=Path, default=Path("ml/manifests/mendeley-v1.split.json"))
    p.add_argument("--source", type=Path, default=Path("ml/data/raw/Dataset_5971.zip"))
    p.add_argument("--output", type=Path, required=True)
    p.add_argument("--report", type=Path, required=True)
    p.add_argument("--allow-provisional-original-labels", action="store_true")
    p.add_argument("--encoder-directory", type=Path)
    a = p.parse_args()
    try:
        run(a.manifest, a.source, a.output, a.report, allow_provisional=a.allow_provisional_original_labels,
            encoder_directory=a.encoder_directory)
        return 0
    except DataError as e:
        print(json.dumps({"status": "blocked", "code": str(e)}))
    except (OSError, ValueError, TypeError, KeyError, RuntimeError):
        print('{"status":"failed","code":"training_failed"}')
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
