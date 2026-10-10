#!/usr/bin/env python3
"""Check approved training data without loading message text or fitting a model."""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.training_preflight import check_training_inputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=Path("ml/manifests/mendeley-v1.split.json"))
    parser.add_argument("--review", type=Path, default=Path("ml/data/mendeley-v1-audit-v2/review.completed.json"))
    parser.add_argument("--source", type=Path, default=Path("ml/data/raw/Dataset_5971.zip"))
    args = parser.parse_args()
    result = check_training_inputs(args.manifest, args.review, args.source)
    print(json.dumps(result, sort_keys=True))
    return 0 if result["training_allowed"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
