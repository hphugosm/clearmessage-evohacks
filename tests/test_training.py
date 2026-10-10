"""Fictional model fixtures only; no real corpus or fake production metrics."""

import json
import subprocess
import sys
from pathlib import Path

import pytest

np = pytest.importorskip("numpy", reason="Install optional hash-pinned ML dependencies")
pytest.importorskip("sklearn", reason="Install optional hash-pinned ML dependencies")
from ml.data_prep import DataError
from ml.sparse_model import SparseModel, export_model, make_pipeline
from ml.train import load_manifest, metrics, policy_metrics


@pytest.fixture
def fitted(tmp_path):
    texts = ["ordinary friend meeting tomorrow"] * 4 + ["advertisement promotion offer sale"] * 4 + ["fictional impersonation send secret code"] * 4
    labels = ["ham"] * 4 + ["spam"] * 4 + ["smishing"] * 4
    pipeline = make_pipeline().fit(texts, labels)
    path = tmp_path / "model.json"
    h = export_model(pipeline, path, {"human_review_complete": False})
    return pipeline, path, h


def test_validation_tokens_do_not_enter_vocabulary(fitted):
    pipeline, _, _ = fitted
    before = {name: dict(vec.vocabulary_) for name, vec in pipeline["features"].transformer_list}
    pipeline.predict(["validationonlywordzzqv completely unseen"])
    assert before == {name: vec.vocabulary_ for name, vec in pipeline["features"].transformer_list}
    assert "validationonlywordzzqv" not in before["word"]


def test_reload_score_and_prediction_parity(fitted):
    pipeline, path, h = fitted
    model = SparseModel(path, h)
    texts = ["ordinary meeting", "promotion sale", "send secret code", "unknown 🦀"]
    np.testing.assert_allclose(model.predict_proba(texts), pipeline.predict_proba(texts), rtol=0, atol=1e-12)
    np.testing.assert_array_equal(model.predict(texts), pipeline.predict(texts))


def test_tampered_artifact_rejected(fitted):
    _, path, h = fitted
    path.write_bytes(path.read_bytes() + b" ")
    with pytest.raises(DataError, match="model_artifact_hash_mismatch"):
        SparseModel(path, h)


@pytest.mark.parametrize("text,reason", [("", "insufficient_text"), ("x" * 2001, "input_too_long")])
def test_invalid_input_cannot_complete_analysis(fitted, text, reason):
    _, path, h = fitted
    result = SparseModel(path, h).analyze(text)
    assert result["status"] == "review" and result["analysis_complete"] is False
    assert reason in result["limitations"]


def test_provisional_ham_never_reassures(fitted):
    _, path, h = fitted
    result = SparseModel(path, h).analyze("ordinary friend meeting tomorrow", "en")
    assert result["status"] == "review" and result["analysis_complete"] is False
    assert "human_label_audit_incomplete" in result["limitations"]


def test_fresh_process_does_not_echo_private_input(fitted):
    _, path, h = fitted
    body = json.dumps({"text": "ordinary meeting private-canary-592", "language": "en"})
    result = subprocess.run([sys.executable, "scripts/infer_model.py", "--artifact", str(path), "--sha256", h],
                            input=body, text=True, capture_output=True, check=True)
    assert "private-canary" not in result.stdout + result.stderr
    assert json.loads(result.stdout)["analysis_complete"] is False


def test_provisional_training_requires_explicit_flag():
    with pytest.raises(DataError, match="explicit_provisional_authorization_required"):
        load_manifest(Path("ml/manifests/mendeley-v1.split.provisional.json"), False)


def test_confusion_metrics_and_policy_account_for_abstention():
    y = np.asarray(["ham", "spam", "smishing"])
    pred = np.asarray(["spam", "spam", "ham"])
    result = metrics(y, pred, ["fictional-1", "fictional-2", "fictional-3"])
    assert result["confusion_matrix"] == [[0, 1, 0], [0, 1, 0], [1, 0, 0]]
    assert result["per_class"]["smishing"]["false_negatives"] == 1
    classes = np.asarray(["ham", "spam", "smishing"])
    scores = np.asarray([[.8, .1, .1], [.1, .8, .1], [.1, .1, .8]])
    policy = policy_metrics(y, scores, classes, .75, np.asarray([True, True, False]))
    assert policy["review"] == 3 and policy["no_strong_signals"] == 0
    assert policy["smishing_without_explicit_warning"] == 1 and policy["token_coverage"] == 2 / 3


def test_encoder_checks_full_token_count_and_rejects_overflow():
    from types import SimpleNamespace
    from ml.frozen_encoder import FrozenEncoder
    calls = []
    def tokenizer(texts, **kwargs):
        calls.append(kwargs)
        return {"input_ids": [[0] * int(text) for text in texts]}
    enc = FrozenEncoder.__new__(FrozenEncoder)
    enc.model = SimpleNamespace(tokenizer=tokenizer)
    enc.max_tokens = 128
    assert enc.coverage(["128", "129"]).tolist() == [True, False]
    assert calls[0]["truncation"] is False and calls[0]["add_special_tokens"] is True
    with pytest.raises(DataError, match="encoder_token_overflow"):
        enc.encode(["129"])


def test_source_test_access_is_blocked_before_selection():
    from ml.train import Corpus
    corpus = Corpus.__new__(Corpus)
    corpus.selection_complete = False
    with pytest.raises(DataError, match="test_access_before_selection"):
        corpus.get("test")
