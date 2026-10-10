#!/usr/bin/env python3
"""Prepare only the original Mendeley v1 data, entirely offline."""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ml.data_prep import DataError, assert_no_leakage, bounded_read, digest, freeze, prepare


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for command in ("audit", "freeze"):
        sub = commands.add_parser(command)
        sub.add_argument("--input", type=Path, required=True, help="Original CSV or Dataset_5971.zip; no other corpus")
        sub.add_argument("--output", type=Path, default=Path("ml/data/mendeley-v1"))
        sub.add_argument("--member", help="Exact CSV member if ZIP contains several CSV files")
        sub.add_argument("--encoding", choices=("utf-8-sig", "cp1252"), default="utf-8-sig")
        sub.add_argument("--expected-sha256", required=command == "freeze")
        sub.add_argument("--families", type=Path, help="Optional curated row_id -> family_id JSON; hash is pinned")
        if command == "freeze":
            sub.add_argument("--review", type=Path, required=True, help="Completed HUMAN review, never auto-approved")
            sub.add_argument("--manifest", type=Path, default=Path("ml/manifests/mendeley-v1.split.json"))
    sub = commands.add_parser("verify")
    sub.add_argument("--manifest", type=Path, required=True)
    sub.add_argument("--input", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == "verify":
            payload = bounded_read(args.manifest)
            manifest = json.loads(payload)
            pinned = args.manifest.with_suffix(".sha256").read_text().strip()
            if digest(payload) != pinned:
                raise DataError("manifest_hash_mismatch")
            if digest(bounded_read(args.input)) != manifest["provenance"]["input_sha256"]:
                raise DataError("source_hash_mismatch")
            assert_no_leakage(manifest["records"])
            print(json.dumps({"status": "verified", "manifest_sha256": pinned, "leakage_intersections": "empty"}))
            return 0
        result = prepare(args.input, args.output, member=args.member, encoding=args.encoding,
                         expected_sha256=args.expected_sha256, families_path=args.families)
        provenance, rows, expected_review, report, mapping = result
        if args.command == "freeze":
            manifest = freeze(provenance, rows, expected_review, report, mapping, args.review, args.manifest)
            print(json.dumps({"status": "frozen", "counts": manifest["counts"], "leakage_intersections": "empty"}))
        else:
            print(json.dumps({"status": "human_review_required", "input_sha256": provenance["input_sha256"],
                              "raw_rows": report["counts"]["raw_rows"], "eligible_counts": report["eligible_counts"],
                              "review_sample_counts": {key: len(value) for key, value in report["human_review_sample"].items()},
                              "split_created": False}))
        return 0
    except DataError as error:
        print(json.dumps({"status": "blocked", "code": str(error)}), file=sys.stderr)
    except FileNotFoundError:
        print('{"status":"blocked","code":"file_missing"}', file=sys.stderr)
    except (OSError, UnicodeError, ValueError, TypeError, KeyError):
        print('{"status":"blocked","code":"invalid_file_or_metadata"}', file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
