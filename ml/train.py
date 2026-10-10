"""Bounded provisional experiment; validation selection precedes test scoring."""

from __future__ import annotations

import importlib.metadata
import json
import platform
import time
import warnings
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.dummy import DummyClassifier
from sklearn.exceptions import ConvergenceWarning
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from threadpoolctl import threadpool_limits

from ml.data_prep import (LABELS, SEED, DataError, assert_no_leakage, bounded_read,
                          digest, import_rows, json_bytes, normalized, read_input, write_new)
from ml.sparse_model import SparseModel, export_model, make_pipeline

CANDIDATES = (0.5, 2.0)
THRESHOLDS = (0.60, 0.75, 0.90)


def load_manifest(path: Path, allow_provisional: bool) -> tuple[dict, str]:
    payload = bounded_read(path)
    if digest(payload) != path.with_suffix(".sha256").read_text().strip():
        raise DataError("manifest_hash_mismatch")
    wrapper = json.loads(payload)
    if wrapper.get("status") != "provisional_original_labels_user_authorized" or not allow_provisional:
        raise DataError("explicit_provisional_authorization_required")
    if wrapper.get("authorization", {}).get("human_review_complete") is not False:
        raise DataError("provisional_manifest_invalid")
    name = wrapper["parent_candidate_file"]
    if Path(name).name != name:
        raise DataError("candidate_path_invalid")
    parent_bytes = bounded_read(path.parent / name)
    if digest(parent_bytes) != wrapper["parent_candidate_sha256"]:
        raise DataError("parent_candidate_hash_mismatch")
    manifest = json.loads(parent_bytes)
    if manifest.get("status") != "candidate_pending_human_review" or manifest["counts"] != wrapper["counts"]:
        raise DataError("candidate_metadata_mismatch")
    assert_no_leakage(manifest["records"])
    return manifest, digest(payload)


class Corpus:
    """Parse the pinned public source, but only expose requested split to modeling.

    CSV parsing routes all rows by ID; test rows are not tokenized, embedded,
    scored or inspected for candidate/threshold selection.
    """
    def __init__(self, source: Path, manifest: dict):
        provenance = manifest["provenance"]
        payload, observed = read_input(source, provenance["csv_member"], provenance["encoding"])
        if observed["input_sha256"] != provenance["input_sha256"] or observed["csv_sha256"] != provenance["csv_sha256"]:
            raise DataError("source_hash_mismatch")
        rows, _ = import_rows(payload, provenance["encoding"])
        self.rows = {r.row_id: r for r in rows}
        self.manifest = manifest
        self.events = []
        self.selection_complete = False

    def get(self, split: str):
        if split == "test" and not self.selection_complete:
            raise DataError("test_access_before_selection")
        self.events.append(split)
        records = [r for r in self.manifest["records"] if r["split"] == split]
        texts, labels, ids = [], [], []
        for record in records:
            row = self.rows[record["row_id"]]
            if (row.label != record["label"] or digest(row.text) != record["text_sha256"]
                    or digest(normalized(row.text)) != record["normalized_sha256"]):
                raise DataError("source_row_manifest_mismatch")
            texts.append(row.text)
            labels.append(row.label)
            ids.append(row.row_id)
        return texts, np.asarray(labels), ids


def metrics(labels, predictions, ids) -> dict:
    matrix = confusion_matrix(labels, predictions, labels=LABELS)
    report = classification_report(labels, predictions, labels=LABELS, output_dict=True, zero_division=0)
    per_class = {label: {**report[label], "false_positives": int(matrix[:, i].sum() - matrix[i, i]),
                         "false_negatives": int(matrix[i, :].sum() - matrix[i, i])} for i, label in enumerate(LABELS)}
    return {"count": len(labels), "counts": dict(Counter(labels.tolist())), "per_class": per_class,
            "macro_f1": float(report["macro avg"]["f1-score"]),
            "confusion_labels": list(LABELS), "confusion_matrix": matrix.tolist(),
            "errors": [{"row_id": rid, "source_label": str(gold), "prediction": str(pred)}
                       for rid, gold, pred in zip(ids, labels, predictions) if gold != pred]}


def policy_metrics(labels, scores, classes, threshold, covered=None):
    covered = np.ones(len(labels), dtype=bool) if covered is None else covered
    indexes = scores.argmax(axis=1)
    # All other outcomes abstain while labels/languages remain unreviewed.
    warnings_mask = covered & (classes[indexes] == "smishing") & (scores.max(axis=1) >= threshold)
    truth = labels == "smishing"
    tp, fp, fn = int((warnings_mask & truth).sum()), int((warnings_mask & ~truth).sum()), int((~warnings_mask & truth).sum())
    return {"threshold_internal_score": threshold, "suspicious": int(warnings_mask.sum()),
            "review": int((~warnings_mask).sum()), "no_strong_signals": 0,
            "analysis_complete_count": 0, "abstention_rate": float((~warnings_mask).mean()),
            "completed_coverage": 0.0, "token_coverage": float(covered.mean()),
            "warning_confusion_labels": ["not_smishing", "smishing"],
            "warning_confusion_matrix": [[int((~warnings_mask & ~truth).sum()), fp], [fn, tp]],
            "smishing_true_positives": tp, "smishing_false_positives": fp,
            "smishing_without_explicit_warning": fn,
            "warning_precision": tp / (tp + fp) if tp + fp else 0.0,
            "warning_recall": tp / (tp + fn) if tp + fn else 0.0,
            "warning_f1": 2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else 0.0}


def fit_checked(model, x, y):
    with threadpool_limits(limits=4), warnings.catch_warnings():
        warnings.simplefilter("error", ConvergenceWarning)
        model.fit(x, y)
    return model


def run(manifest_path: Path, source: Path, output: Path, report_path: Path, *, allow_provisional=False, encoder_directory=None):
    if output.exists() or report_path.exists():
        raise DataError("experiment_output_exists_use_new_directory")
    manifest, manifest_hash = load_manifest(manifest_path, allow_provisional)
    corpus = Corpus(source, manifest)
    train_text, train_y, _ = corpus.get("train")
    val_text, val_y, val_ids = corpus.get("validation")
    provenance = {"source_sha256": manifest["provenance"]["input_sha256"], "split_sha256": manifest_hash,
                  "seed": SEED, "human_review_complete": False, "original_labels": True,
                  "language_performance_verified": False}
    report = {"status": "provisional_original_label_experiment", "data_approval": provenance,
              "counts": manifest["counts"], "seed": SEED,
              "candidates_predefined": list(CANDIDATES), "policy_grid_predefined": list(THRESHOLDS),
              "environment": {"system": platform.system(), "architecture": platform.machine(),
                              "python": platform.python_version(), "compute_threads": 4,
                              "versions": {n: importlib.metadata.version(n) for n in ("numpy", "scipy", "scikit-learn")}},
              "language_results": {"english": None, "czech": None, "unverified_source_languages": True},
              "blind_challenges_used": False, "models": {}, "encoder": {"status": "not_requested"}}
    fitted = {}
    for c in CANDIDATES:
        name = f"tfidf_c{c}"
        begin = time.perf_counter()
        model = fit_checked(make_pipeline(c), train_text, train_y)
        duration = time.perf_counter() - begin
        predictions = model.predict(val_text)
        scores = model.predict_proba(val_text)
        validation = metrics(val_y, predictions, val_ids)
        policies = [policy_metrics(val_y, scores, model.classes_, t) for t in THRESHOLDS]
        fitted[name] = {"model": model, "encoder": None}
        report["models"][name] = {"fit_seconds": duration, "validation": validation,
                                  "selection_score": validation["macro_f1"], "validation_policies": policies}
        print(json.dumps({"candidate": name, "validation_macro_f1": validation["macro_f1"]}), flush=True)
    if encoder_directory is not None:
        try:
            from ml.frozen_encoder import FrozenEncoder
            begin = time.perf_counter()
            encoder = FrozenEncoder(encoder_directory)
            load_seconds = time.perf_counter() - begin
            train_mask, val_mask = encoder.coverage(train_text), encoder.coverage(val_text)
            sample = [t for t, keep in zip(train_text, train_mask) if keep][:32]
            begin = time.perf_counter()
            encoder.encode(sample)
            benchmark_seconds = time.perf_counter() - begin
            report["encoder"] = {"status": "benchmarked", "revision": encoder.assets["revision"],
                                 "license": encoder.assets["license"], "assets": encoder.assets,
                                 "load_seconds": load_seconds, "benchmark_count": len(sample),
                                 "benchmark_seconds": benchmark_seconds, "device": "cpu", "max_tokens": encoder.max_tokens,
                                 "train_covered": int(train_mask.sum()), "train_total": len(train_y),
                                 "validation_covered": int(val_mask.sum()), "validation_total": len(val_y),
                                 "pretrained_by_us": False, "frozen": True}
            if benchmark_seconds > 60:
                report["encoder"]["status"] = "skipped_after_slow_benchmark"
            else:
                tx = encoder.encode([t for t, keep in zip(train_text, train_mask) if keep])
                vx = encoder.encode([t for t, keep in zip(val_text, val_mask) if keep])
                output.mkdir(parents=True, exist_ok=True)
                # Public development embeddings only; never app inputs or held-out embeddings.
                np.save(output / "public_train_embeddings.npy", tx, allow_pickle=False)
                np.save(output / "public_validation_embeddings.npy", vx, allow_pickle=False)
                for c in CANDIDATES:
                    name = f"minilm_c{c}"
                    begin = time.perf_counter()
                    head = fit_checked(LogisticRegression(C=c, class_weight="balanced", max_iter=1000,
                                                          random_state=SEED), tx, train_y[train_mask])
                    scores = np.zeros((len(val_y), 3))
                    scores[val_mask] = head.predict_proba(vx)
                    validation = metrics(val_y[val_mask], head.predict(vx), np.asarray(val_ids)[val_mask])
                    fitted[name] = {"model": head, "encoder": encoder}
                    report["models"][name] = {"fit_seconds": time.perf_counter() - begin, "validation": validation,
                        "selection_score": validation["macro_f1"] * float(val_mask.mean()),
                        "validation_policies": [policy_metrics(val_y, scores, head.classes_, t, val_mask) for t in THRESHOLDS]}
                    print(json.dumps({"candidate": name, "validation_macro_f1": validation["macro_f1"],
                                      "token_coverage": float(val_mask.mean())}), flush=True)
        except (OSError, ImportError, ValueError, RuntimeError):
            report["encoder"].update(status="unavailable", code="encoder_setup_or_benchmark_failed")
            # Keep a complete sparse experiment if an optional candidate fails.
            for name in [key for key in fitted if key.startswith("minilm")]:
                fitted.pop(name)
                report["models"].pop(name)
    selected = max(report["models"], key=lambda name: report["models"][name]["selection_score"])
    policies = report["models"][selected]["validation_policies"]
    chosen_policy = max(policies, key=lambda r: (r["warning_f1"], r["threshold_internal_score"]))
    report["selection"] = {"model": selected, "criterion": "validation_macro_f1_times_token_coverage",
                           "threshold": chosen_policy["threshold_internal_score"],
                           "threshold_criterion": "validation_smishing_warning_f1_then_higher_threshold",
                           "test_used": False}
    output.mkdir(parents=True, exist_ok=True)
    # Persist selection before test text enters model evaluation.
    write_new(output / "selection.json", json_bytes(report["selection"]))
    report["artifacts"] = {}
    for name, candidate in fitted.items():
        path = output / f"{name}.json"
        if candidate["encoder"] is None:
            h = export_model(candidate["model"], path, provenance)
            restored = SparseModel(path, h)
            difference = float(np.max(np.abs(restored.predict_proba(val_text) - candidate["model"].predict_proba(val_text))))
            if difference > 1e-10:
                raise DataError("artifact_reload_parity_failed")
            # Refit only train; identical bytes are required, not approximate metrics.
            repeat = fit_checked(make_pipeline(candidate["model"]["classifier"].C), train_text, train_y)
            repeat_hash = export_model(repeat, path, provenance)
            if repeat_hash != h:
                raise DataError("retraining_not_reproducible")
            report["artifacts"][name] = {"file": str(path), "sha256": h,
                                         "reload_max_score_difference": difference, "repeat_training_hash_identical": True}
        else:
            head = candidate["model"]
            payload = json_bytes({"format_version": 1, "kind": "frozen_minilm_linear_head", "provenance": provenance,
                                  "encoder_revision": candidate["encoder"].assets["revision"],
                                  "encoder_assets_sha256": digest((encoder_directory / "assets.json").read_bytes()),
                                  "coefficient_dtype": str(head.coef_.dtype),
                                  "classes": head.classes_.tolist(), "coefficients": head.coef_.tolist(),
                                  "intercept": head.intercept_.tolist()})
            write_new(path, payload)
            from ml.frozen_encoder import EmbeddingModel
            restored = EmbeddingModel(path, digest(payload), encoder_directory, candidate["encoder"])
            covered_texts = [t for t, keep in zip(val_text, val_mask) if keep]
            difference = float(np.max(np.abs(restored.predict_proba(covered_texts) - head.predict_proba(vx))))
            if difference > 1e-10:
                raise DataError("artifact_reload_parity_failed")
            repeat = fit_checked(LogisticRegression(C=head.C, class_weight="balanced", max_iter=1000,
                                                    random_state=SEED), tx, train_y[train_mask])
            if not np.array_equal(head.coef_, repeat.coef_) or not np.array_equal(head.intercept_, repeat.intercept_):
                raise DataError("retraining_not_reproducible")
            report["artifacts"][name] = {"file": str(path), "sha256": digest(payload),
                                         "reload_max_score_difference": difference, "repeat_head_weights_identical": True}
    corpus.selection_complete = True
    test_text, test_y, test_ids = corpus.get("test")
    for name, candidate in fitted.items():
        model, encoder = candidate["model"], candidate["encoder"]
        mask = np.ones(len(test_y), dtype=bool) if encoder is None else encoder.coverage(test_text)
        texts = [t for t, keep in zip(test_text, mask) if keep]
        begin = time.perf_counter()
        x = texts if encoder is None else encoder.encode(texts)
        scores = np.zeros((len(test_y), 3))
        scores[mask] = model.predict_proba(x)
        inference_seconds = time.perf_counter() - begin
        report["models"][name]["test"] = metrics(test_y[mask], model.classes_[scores[mask].argmax(axis=1)], np.asarray(test_ids)[mask])
        report["models"][name]["test_token_coverage"] = float(mask.mean())
        policy_mask = mask & np.asarray([0 < len(t.strip()) <= 2000 for t in test_text])
        report["models"][name]["test_policy"] = policy_metrics(test_y, scores, model.classes_, report["selection"]["threshold"], policy_mask)
        report["models"][name]["test_batch_latency"] = {"count": len(texts), "seconds": inference_seconds,
                                                         "amortized_ms_per_message": inference_seconds * 1000 / len(texts)}
    majority = DummyClassifier(strategy="most_frequent").fit(np.zeros((len(train_y), 1)), train_y)
    report["majority_baseline"] = {split: metrics(y, majority.predict(np.zeros((len(y), 1))), ids)
                                    for split, y, ids in [("validation", val_y, val_ids), ("test", test_y, test_ids)]}
    report["access_order"] = corpus.events
    report["test_evaluation_after_selection"] = True
    report["language_scope"] = "Source languages unverified; aggregate source-label metrics are neither verified English nor Czech performance."
    report["artifact_storage"] = "Project-generated JSON plus public-development NPY with allow_pickle=False."
    write_new(report_path, json_bytes(report))
    print(json.dumps({"status": report["status"], "selected": selected, "report": str(report_path)}), flush=True)
    return report
