"""Validate the checked-in text-free proposal, without reading raw/test messages."""

import hashlib
import json
from collections import Counter
from itertools import combinations
from pathlib import Path


def test_real_candidate_hash_counts_and_review_blocker():
    path = Path("ml/manifests/mendeley-v1.split.candidate.json")
    payload = path.read_bytes()
    manifest = json.loads(payload)
    assert hashlib.sha256(payload).hexdigest() == path.with_suffix(".sha256").read_text().strip()
    source = json.loads(Path("ml/sources/mendeley-v1.json").read_text())
    audit = json.loads(Path("docs/data/mendeley-v1.audit.json").read_text())
    assert manifest["provenance"]["input_sha256"] == source["sha256"]
    assert manifest["provenance"]["csv_sha256"] == source["csv_sha256"]
    assert len(manifest["records"]) + audit["conflict_rows_excluded"] == source["observed_counts"]["total"]
    assert Counter(row["label"] for row in manifest["records"]) == audit["eligible_counts"]
    for split, counts in manifest["counts"].items():
        assert Counter(row["label"] for row in manifest["records"] if row["split"] == split) == counts
    assert manifest["data_split_ready"] is False
    assert manifest["human_label_reviews_completed"] == 0
    assert manifest["status"] == "candidate_pending_human_review"
    assert all("text" not in row for row in manifest["records"])


def test_real_candidate_split_intersections_and_review_families():
    manifest = json.loads(Path("ml/manifests/mendeley-v1.split.candidate.json").read_text())
    rows = manifest["records"]
    splits = ("train", "validation", "test")
    for field in ("row_id", "group_id", "text_sha256", "normalized_sha256", "template_sha256"):
        values = {split: {row[field] for row in rows if row["split"] == split and row[field] is not None} for split in splits}
        for left, right in combinations(splits, 2):
            assert values[left] & values[right] == set()
    assert len({row["row_id"] for row in rows}) == len(rows)
    sampled = {row_id for ids in manifest["human_review_sample_ids"].values() for row_id in ids}
    assert len(sampled) == 45
    assert all(row["split"] == "train" for row in rows if row["row_id"] in sampled)
    assert all(len(ids) == 15 for ids in manifest["human_review_sample_ids"].values())
