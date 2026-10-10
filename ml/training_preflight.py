"""Check Goal 01 approval before any training or message-text loading.

This module does not train, tokenize, embed or evaluate anything. Reports use
fixed diagnostic codes and metadata only, never review notes or message bodies.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

from ml.data_prep import LABELS, VERSION, DataError, assert_no_leakage, bounded_read, digest


def check_training_inputs(manifest_path: Path, review_path: Path, source_path: Path) -> dict:
    result = {"status": "blocked", "training_allowed": False, "blockers": [], "facts": {},
              "message_text_loaded": False, "held_out_messages_opened": False,
              "model_trained": False, "metrics_computed": False}

    def block(code):
        if code not in result["blockers"]:
            result["blockers"].append(code)

    def read_metadata(path, missing, invalid):
        try:
            payload = bounded_read(path)
            value = json.loads(payload)
            if not isinstance(value, dict):
                block(invalid)
                return None, None
            return value, digest(payload)
        except FileNotFoundError:
            block(missing)
        except (OSError, ValueError, UnicodeError):
            block(invalid)
        return None, None

    manifest, manifest_hash = read_metadata(manifest_path, "approved_manifest_missing", "manifest_invalid")
    review, review_hash = read_metadata(review_path, "human_review_missing", "human_review_invalid")
    if manifest is not None:
        result["facts"]["manifest_sha256"] = manifest_hash
        if manifest.get("status") != "frozen_after_human_review" or manifest.get("data_split_ready") is not True:
            block("manifest_not_approved")
        try:
            sidecar = bounded_read(manifest_path.with_suffix(".sha256")).decode("utf-8").strip()
            if sidecar != manifest_hash:
                block("manifest_hash_mismatch")
        except (OSError, UnicodeError, ValueError):
            block("manifest_hash_sidecar_missing_or_invalid")

    if review is not None:
        records = review.get("records")
        if not isinstance(records, list) or any(not isinstance(row, dict) for row in records):
            block("human_review_invalid")
        else:
            confirmed = [row for row in records if row.get("decision") == "confirmed"]
            result["facts"]["review_records"] = len(records)
            result["facts"]["human_reviews_confirmed"] = len(confirmed)
            if len(records) != 45 or len(confirmed) != 45:
                block("human_label_review_incomplete")
            if any(not isinstance(row.get("reviewer_id"), str) or not row["reviewer_id"].strip()
                   or not isinstance(row.get("reviewed_date"), str) or not row["reviewed_date"].strip() for row in confirmed):
                block("human_review_attribution_missing")
            for row in confirmed:
                try:
                    date.fromisoformat(row.get("reviewed_date", ""))
                except (ValueError, TypeError):
                    block("human_review_date_invalid")
            if any(row.get("language") not in ("en", "cs", "other", "und") for row in confirmed):
                block("human_language_review_incomplete")
            if any(row.get("source_label") not in LABELS for row in confirmed):
                block("human_review_labels_invalid")
            elif Counter(row.get("source_label") for row in confirmed) != {label: 15 for label in LABELS}:
                block("human_review_requires_15_per_class")

    # Reject unapproved inputs before inspecting source bytes or split records.
    if result["blockers"]:
        return result
    try:
        provenance = manifest["provenance"]
        rows = manifest["records"]
        if provenance.get("pipeline_version") != VERSION or review.get("pipeline_version") != VERSION:
            block("data_pipeline_version_mismatch")
        if manifest.get("human_review_sha256") != review_hash:
            block("human_review_hash_mismatch")
        if provenance.get("input_sha256") != review.get("source_input_sha256"):
            block("human_review_source_mismatch")
        if manifest.get("human_reviewed_counts") != {label: 15 for label in LABELS}:
            block("manifest_human_review_counts_invalid")
        lookup = {row["row_id"]: row for row in rows}
        sample = review["records"]
        if len({row.get("row_id") for row in sample}) != 45:
            block("human_review_duplicate_ids")
        if any(row.get("row_id") not in lookup or lookup[row["row_id"]]["label"] != row["source_label"]
               or lookup[row["row_id"]]["split"] != "train" for row in sample):
            block("human_review_sample_mismatch")
        raw_count = sum(provenance["observed_counts"].values())
        if raw_count > len(rows) and not str(review.get("exclusions_approved_by", "")).strip():
            block("human_exclusions_not_approved")
        for split in ("train", "validation", "test"):
            counts = Counter(row["label"] for row in rows if row["split"] == split)
            if counts != manifest["counts"][split] or any(not counts[label] for label in LABELS):
                block("split_counts_invalid")
        assert_no_leakage(rows)
        if result["blockers"]:
            return result
        if digest(bounded_read(source_path)) != provenance["input_sha256"]:
            block("source_hash_mismatch")
    except FileNotFoundError:
        block("source_file_missing")
    except DataError as error:
        block(str(error))
    except (OSError, UnicodeError, ValueError, TypeError, KeyError):
        block("approved_metadata_invalid")
    if not result["blockers"]:
        result.update(status="ready_for_training", training_allowed=True)
    return result
