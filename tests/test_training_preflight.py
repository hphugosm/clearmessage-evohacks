"""Approval fixtures are fictional and confined to tests. No training here."""

import json
from pathlib import Path

import pytest

from ml.data_prep import VERSION, digest, json_bytes
from ml.training_preflight import check_training_inputs


@pytest.fixture
def approved_fixture(tmp_path):
    source = tmp_path / "fictional-source.zip"
    source.write_bytes(b"Fictional bytes; approval check hashes only, never parses or trains.")
    records = []
    reviews = []
    for label in ("ham", "spam", "smishing"):
        for index in range(17):
            row_id = f"fictional-{label}-{index}"
            records.append({"row_id": row_id, "label": label, "group_id": row_id,
                            "text_sha256": digest(row_id), "normalized_sha256": digest(row_id),
                            "template_sha256": None, "split": "train" if index < 15 else "validation" if index == 15 else "test"})
            if index < 15:
                reviews.append({"row_id": row_id, "source_label": label, "decision": "confirmed", "language": "en",
                                "reviewer_id": "fictional-test-reviewer", "reviewed_date": "2026-10-10"})
    review = {"records": reviews, "pipeline_version": VERSION, "source_input_sha256": digest(source.read_bytes()),
              "exclusions_approved_by": "fictional-test-reviewer"}
    review_path = tmp_path / "review.json"
    review_path.write_bytes(json_bytes(review))
    manifest = {"status": "frozen_after_human_review", "data_split_ready": True,
                "human_review_sha256": digest(review_path.read_bytes()), "records": records,
                "human_reviewed_counts": {label: 15 for label in ("ham", "spam", "smishing")},
                "provenance": {"pipeline_version": VERSION, "input_sha256": digest(source.read_bytes()),
                               "observed_counts": {label: 17 for label in ("ham", "spam", "smishing")}},
                "counts": {split: {label: count for label in ("ham", "spam", "smishing")}
                           for split, count in (("train", 15), ("validation", 1), ("test", 1))}}
    manifest_path = tmp_path / "manifest.json"
    save_manifest(manifest_path, manifest)
    return manifest_path, review_path, source


def save_manifest(path, value):
    path.write_bytes(json_bytes(value))
    path.with_suffix(".sha256").write_text(digest(path.read_bytes()) + "\n")


def test_approved_fixture_passes_metadata_gate_without_training(approved_fixture):
    result = check_training_inputs(*approved_fixture)
    assert result["training_allowed"] is True and result["status"] == "ready_for_training"
    assert result["model_trained"] is False
    assert result["message_text_loaded"] is False and result["held_out_messages_opened"] is False


def test_current_candidate_rejected_before_source_read(monkeypatch):
    import ml.training_preflight as module
    original = module.bounded_read
    source = Path("ml/data/raw/Dataset_5971.zip")

    def guarded_read(path):
        assert path != source, "Unapproved input must be rejected before source bytes are loaded"
        return original(path)

    monkeypatch.setattr(module, "bounded_read", guarded_read)
    # A fictional missing review is enough; no local private file is needed in CI.
    result = check_training_inputs(Path("ml/manifests/mendeley-v1.split.candidate.json"), Path("fictional-missing-review.json"), source)
    assert result["training_allowed"] is False
    assert "manifest_not_approved" in result["blockers"]
    assert "human_review_missing" in result["blockers"]


def test_pending_review_rejected_before_source_read(approved_fixture):
    manifest, review, source = approved_fixture
    value = json.loads(review.read_text())
    value["records"][0]["decision"] = "pending"
    review.write_bytes(json_bytes(value))
    source.write_bytes(b"changed source must not be read yet")
    result = check_training_inputs(manifest, review, source)
    assert "human_label_review_incomplete" in result["blockers"]
    assert "source_hash_mismatch" not in result["blockers"]


@pytest.mark.parametrize("problem", ["review_hash", "source_hash", "exclusions", "cross_split_group", "counts"])
def test_tampered_or_incomplete_approval_rejected(approved_fixture, problem):
    manifest_path, review_path, source = approved_fixture
    manifest = json.loads(manifest_path.read_text())
    review = json.loads(review_path.read_text())
    if problem == "review_hash":
        manifest["human_review_sha256"] = "0" * 64
    elif problem == "source_hash":
        source.write_bytes(b"changed fictional bytes")
    elif problem == "exclusions":
        manifest["provenance"]["observed_counts"]["ham"] += 1
        review["exclusions_approved_by"] = ""
        review_path.write_bytes(json_bytes(review))
        manifest["human_review_sha256"] = digest(review_path.read_bytes())
    elif problem == "cross_split_group":
        manifest["records"][15]["group_id"] = manifest["records"][0]["group_id"]
    elif problem == "counts":
        manifest["counts"]["test"]["ham"] += 1
    save_manifest(manifest_path, manifest)
    result = check_training_inputs(manifest_path, review_path, source)
    assert result["training_allowed"] is False
    codes = {"review_hash": "human_review_hash_mismatch", "source_hash": "source_hash_mismatch",
             "exclusions": "human_exclusions_not_approved", "cross_split_group": "cross_split_leakage", "counts": "split_counts_invalid"}
    assert codes[problem] in result["blockers"]


def test_untrusted_review_diagnostics_do_not_echo_notes(approved_fixture):
    manifest, review, source = approved_fixture
    value = json.loads(review.read_text())
    value["records"][0]["source_label"] = {"private-canary": "not a label"}
    value["records"][0]["notes"] = "do not expose private-canary"
    review.write_bytes(json_bytes(value))
    result = check_training_inputs(manifest, review, source)
    assert "human_review_labels_invalid" in result["blockers"]
    assert "private-canary" not in json.dumps(result)
