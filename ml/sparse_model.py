"""Project-generated TF-IDF/linear artifacts, JSON only; no pickle or downloads."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from scipy.special import softmax
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion, Pipeline

from ml.data_prep import DataError, LABELS, SEED, digest, json_bytes, write_new

VERSION = "clearmessage-sparse-v1"
MAX_INPUT = 2000


def make_pipeline(c: float = 1.0) -> Pipeline:
    return Pipeline([
        ("features", FeatureUnion([
            ("word", TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=5000,
                                     sublinear_tf=True, dtype=np.float64)),
            ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), min_df=2,
                                     max_features=15000, sublinear_tf=True, dtype=np.float64)),
        ])),
        ("classifier", LogisticRegression(C=c, class_weight="balanced", solver="lbfgs",
                                          max_iter=1000, random_state=SEED)),
    ])


def export_model(pipeline: Pipeline, path: Path, provenance: dict) -> str:
    features = []
    for name, vectorizer in pipeline["features"].transformer_list:
        features.append({"name": name, "analyzer": vectorizer.analyzer,
                         "ngram_range": list(vectorizer.ngram_range),
                         "vocabulary": {key: int(value) for key, value in vectorizer.vocabulary_.items()},
                         "idf": vectorizer.idf_.tolist()})
    clf = pipeline["classifier"]
    payload = json_bytes({"format_version": 1, "model_version": VERSION, "provenance": provenance,
                          "features": features, "classes": clf.classes_.tolist(),
                          "coefficients": clf.coef_.tolist(), "intercept": clf.intercept_.tolist()})
    write_new(path, payload)
    return digest(payload)


class SparseModel:
    """Loading requires the caller's independently recorded project artifact hash."""

    def __init__(self, path: Path, expected_sha256: str):
        with path.open("rb") as stream:
            payload = stream.read(32 * 1024 * 1024 + 1)
        if len(payload) > 32 * 1024 * 1024 or digest(payload) != expected_sha256:
            raise DataError("model_artifact_hash_mismatch")
        try:
            state = json.loads(payload)
            if state["format_version"] != 1 or state["model_version"] != VERSION:
                raise DataError("model_artifact_format_invalid")
            self.classes = np.asarray(state["classes"])
            if sorted(self.classes.tolist()) != sorted(LABELS):
                raise DataError("model_artifact_classes_invalid")
            parts = []
            if len(state["features"]) != 2:
                raise DataError("model_artifact_features_invalid")
            for config, expected in zip(state["features"], ("word", "char_wb")):
                vocab = config["vocabulary"]
                if config["analyzer"] != expected or not 0 < len(vocab) <= 20000:
                    raise DataError("model_artifact_features_invalid")
                if set(vocab.values()) != set(range(len(vocab))):
                    raise DataError("model_artifact_vocabulary_invalid")
                ranges = tuple(config["ngram_range"])
                if ranges != ((1, 2) if expected == "word" else (3, 5)):
                    raise DataError("model_artifact_features_invalid")
                vec = TfidfVectorizer(analyzer=expected, ngram_range=ranges, vocabulary=vocab,
                                      sublinear_tf=True, dtype=np.float64)
                vec.idf_ = np.asarray(config["idf"], dtype=np.float64)
                if len(vec.idf_) != len(vocab) or not np.isfinite(vec.idf_).all():
                    raise DataError("model_artifact_idf_invalid")
                parts.append((config["name"], vec))
            self.features = FeatureUnion(parts)
            self.coef = np.asarray(state["coefficients"], dtype=np.float64)
            self.intercept = np.asarray(state["intercept"], dtype=np.float64)
            dimension = sum(len(part[1].idf_) for part in parts)
            if self.coef.shape != (3, dimension) or self.intercept.shape != (3,):
                raise DataError("model_artifact_dimensions_invalid")
            if not np.isfinite(self.coef).all() or not np.isfinite(self.intercept).all():
                raise DataError("model_artifact_weights_invalid")
            self.provenance = state["provenance"]
            self.version = VERSION
        except DataError:
            raise
        except (ValueError, TypeError, KeyError, AttributeError):
            raise DataError("model_artifact_invalid") from None

    def predict_proba(self, texts: list[str]) -> np.ndarray:
        """Internal classifier scores only. Never user-facing fraud probabilities."""
        features = self.features.transform(texts)
        return softmax(features @ self.coef.T + self.intercept, axis=1)

    def predict(self, texts: list[str]) -> np.ndarray:
        return self.classes[self.predict_proba(texts).argmax(axis=1)]

    def analyze(self, text: str, language: str = "und", threshold: float = 0.75) -> dict:
        base = {"status": "review", "analysis_complete": False, "model_version": self.version,
                "policy_version": "provisional-policy-v1", "limitations": []}
        if not isinstance(text, str) or not text.strip():
            base["limitations"] = ["insufficient_text"]
            return base
        if len(text) > MAX_INPUT:
            base["limitations"] = ["input_too_long"]
            return base
        scores = self.predict_proba([text])[0]
        label = str(self.classes[scores.argmax()])
        base.update(label=label, full_text_processed=True)
        if self.provenance.get("human_review_complete") is not True:
            base["limitations"] = ["human_label_audit_incomplete", "language_performance_unverified"]
            # Provisional artifacts cannot produce completed reassuring outcomes.
            if label == "smishing" and float(scores.max()) >= threshold:
                base["status"] = "suspicious"
            return base
        base["limitations"] = ["language_performance_unverified"]
        return base
