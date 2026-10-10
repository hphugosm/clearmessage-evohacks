"""Synthetic/inert policy fixtures only. Never open held-out or blind datasets."""
from dataclasses import replace
import json
from pathlib import Path
import socket
import subprocess
import sys
from unittest.mock import Mock

from fastapi.testclient import TestClient
import pytest
import requests

from backend.app import create_app
from backend.contracts import AnalyzeRequest
from backend.inference import CONFIG, ROOT, LocalClassifier, Prediction, UnavailableClassifier, load_classifier
from backend.policy import Policy, analyze_text
from backend.rules import observed_rules
from backend.urls import EXTRACTOR, parse_urls

CANARY = "PRIVATE_CANARY_913_FICTIONAL_PERSON_OTP_654321"

# Fake models exist ONLY inside tests to exercise difficult policy branches.
class TestOnlyClassifier:
    __test__ = False
    version = "test-only"
    ready = True
    human_review_complete = True
    evaluated_languages = ("en",)
    def __init__(self, result=Prediction(.98, .01, .01, True)):
        self.result = result
    def predict(self, text, message_language):
        return self.result

@pytest.fixture(scope="module")
def real_model():
    model = load_classifier()
    assert model.ready, "Goal02 local selected artifact must be present for real integration tests"
    return model

def result(text="Fictional message: meet at school tomorrow.", language="en", model=None, policy=Policy()):
    return analyze_text(AnalyzeRequest(text=text, message_language=language), model or TestOnlyClassifier(), policy)

@pytest.mark.parametrize("text,key", [
    ("Please send me your password.", "request_for_secret"),
    ("Reply with your verification code.", "request_for_secret"),
    ("Pošlete mi své ověřovací kódy.", "request_for_secret"),
    ("Sdělte mi svoje heslo.", "request_for_secret"),
    ("Pay the invoice immediately.", "payment_pressure"),
    ("Zaplaťte tuto částku ihned.", "payment_pressure"),
    ("Okamžitě uhraďte tento poplatek.", "payment_pressure"),
    ("Do not tell your parents about this transaction.", "secrecy_request"),
    ("Neříkej o této platbě rodičům.", "secrecy_request"),
])
def test_observed_requests_have_actual_text_proof(text, key):
    matches = observed_rules(text)
    assert key in {m.key for m in matches}
    assert all(0 <= m.start < m.end <= len(text) and text[m.start:m.end].strip() for m in matches)
    data = result(text, model=UnavailableClassifier())
    assert data.status == "suspicious" and not data.analysis_complete
    assert "rules_only" in data.limitations
    assert {e.key for e in data.evidence} == {m.key for m in matches}

@pytest.mark.parametrize("text", [
    "Never send anyone your password.", "Do not share your OTP.",
    "We will never ask you to send your password.",
    "If someone asks you to send your password, call your bank independently.",
    "Beware: pay immediately is a scam warning example.",
    "Do not tell anyone your password.", "Nikdy neposílejte své heslo.",
    "Pokud vás někdo žádá: pošlete mu heslo, jde o příklad podvodu.",
    "Nemusíte zaplatit ihned.", "Neplaťte ihned.",
    "Do not pay the invoice now.",
    "Please tell your parents about this message.",
    "Sale: buy two fictional notebooks, get one free. https://shop.invalid/offer",
    "Your fictional school meeting is tomorrow at 10. https://school.invalid/info",
    "A typo with HTTPS https://short.invalid/x isn't evidence of fraud.",
])
def test_legitimate_advertising_negation_and_warnings_have_no_rule_evidence(text):
    assert observed_rules(text) == []
    data = result(text, model=UnavailableClassifier())
    assert data.status == "review" and data.evidence == []

@pytest.mark.parametrize("text", [
    "Never share your password. But please send me your OTP.",
    "Do not send codes, but send me your password.",
    "Nikdy nesdílej heslo, ale pošli mi svůj ověřovací kód.",
])
def test_conflicting_safety_advice_cannot_hide_later_request(text):
    assert "request_for_secret" in {e.key for e in result(text).evidence}

def test_rules_override_high_ham_and_do_not_fabricate_attribution():
    data = result("Please send me your password.")
    assert data.status == "suspicious"
    assert [e.model_dump() for e in data.evidence] == [{"key": "request_for_secret", "basis": "observed_text_signal"}]

def test_all_signals_bounded_and_spam_is_not_phishing():
    data = result("Please send me your password. Pay me now. Do not tell your parents.", model=TestOnlyClassifier(Prediction(.01,.01,.98,True)))
    assert len(data.evidence) == 3 and len(data.action_keys) == 3
    assert {e.key for e in data.evidence} == {"request_for_secret", "payment_pressure", "secrecy_request"}
    assert result(model=TestOnlyClassifier(Prediction(.01,.98,.01,True))).status == "review"

def test_threshold_not_just_top_class_and_unsupported_language():
    for score, expected in [(.59,"review"),(.60,"suspicious"),(.80,"suspicious")]:
        model = TestOnlyClassifier(Prediction((1-score)/2,(1-score)/2,score,True))
        assert result(model=model).status == expected
        for language in ("cs", "auto", "other"):
            data = result(language=language, model=model)
            assert data.status == "review" and not data.analysis_complete
            assert data.evidence == []

def test_current_policy_never_reassures_even_test_only_reviewed_model():
    data = result()
    assert data.status == "review" and not data.analysis_complete
    assert "policy_not_validated" in data.limitations

def test_future_reassurance_branch_requires_all_guards():
    policy = replace(Policy(), reassurance_validated=True)
    data = result(policy=policy)
    assert data.status == "no_strong_signals" and data.analysis_complete
    for language in ("auto", "cs", "other"):
        assert result(language=language, policy=policy).status == "review"
    for scores in (Prediction(.7,.2,.1,True), Prediction(.98,.01,.01,False)):
        assert result(model=TestOnlyClassifier(scores), policy=policy).status == "review"
    model = TestOnlyClassifier()
    model.human_review_complete = False
    assert result(model=model, policy=policy).status == "review"
    assert result("Hi", policy=policy).status == "review"

@pytest.mark.parametrize("scores", [Prediction(.98,.01,.01,False), Prediction(.01,.01,.98,False), Prediction(float("nan"),.01,.01,True), Prediction(2,-1,0,True)])
def test_overflow_invalid_scores_never_complete_or_warn_from_classifier(scores):
    data = result(model=TestOnlyClassifier(scores))
    assert data.status == "review" and not data.analysis_complete
    assert data.evidence == []
    assert "incomplete_coverage" in data.limitations or "inference_unavailable" in data.limitations

def test_exception_canary_and_rules_survive_failure(capsys, caplog):
    model = TestOnlyClassifier()
    model.predict = Mock(side_effect=RuntimeError(CANARY))
    with TestClient(create_app(classifier=model)) as client:
        response = client.post("/api/analyze", json={"text": f"Please send me your password. {CANARY}", "message_language":"en"})
    data = response.json()
    assert data["status"] == "suspicious" and not data["analysis_complete"]
    assert "inference_unavailable" in data["limitations"] and "rules_only" in data["limitations"]
    assert all(e["basis"] == "observed_text_signal" for e in data["evidence"])
    captured = capsys.readouterr()
    assert CANARY not in response.text + captured.out + captured.err + caplog.text
    assert data["share_summary_keys"] == ["analysis_not_completed", "help_verify_independently"]

def test_urls_never_supply_rule_evidence_and_parse_errors_are_private():
    for text in ("Visit https://shop.invalid/send-your-password-now", "Visit www.shop.invalid/pay-now", "Visit https://broken.invalid:secret/path"):
        data = result(text, model=UnavailableClassifier())
        assert data.evidence == [] and data.status == "review"
    parsed = parse_urls("https://[broken www.shop.invalid/x https://shop.invalid:wrong")
    assert [u.valid for u in parsed] == [False,True,False]
    assert EXTRACTOR.suffix_list_urls == () and not EXTRACTOR._cache.enabled

def test_real_model_hash_scores_parity_and_full_maximum_input(real_model):
    from ml.sparse_model import SparseModel
    raw = SparseModel(ROOT / CONFIG["artifact_path"], CONFIG["sha256"])
    text = "Fictional school meeting tomorrow. " + "x " * 980
    text = text[:2000]
    prediction = real_model.predict(text, "en")
    expected = dict(zip(raw.classes.tolist(), raw.predict_proba([text])[0]))
    assert (prediction.ham, prediction.spam, prediction.smishing) == tuple(float(expected[k]) for k in ("ham","spam","smishing"))
    assert prediction.full_text_coverage
    assert not real_model.human_review_complete and real_model.evaluated_languages == ()
    with pytest.raises(Exception, match="input_out_of_scope"):
        real_model.predict("x"*2001,"en")

def test_busy_model_abstains_and_releases_slot(real_model):
    assert real_model._slot.acquire(blocking=False)
    try:
        data = result(model=real_model)
        assert data.status == "review" and "inference_unavailable" in data.limitations
    finally:
        real_model._slot.release()
    assert real_model.predict("A fictional school message tomorrow.","en").full_text_coverage

def test_bad_or_missing_artifact_is_honestly_unavailable(tmp_path, monkeypatch):
    path = tmp_path / "model.json"
    path.write_text('{"malicious":"payload"}')
    with pytest.raises(Exception, match="model_artifact_hash_mismatch"):
        LocalClassifier(path)
    monkeypatch.setitem(CONFIG, "artifact_path", str(path))
    assert not load_classifier().ready
    path.unlink()
    assert not load_classifier().ready

def test_real_api_no_egress_and_log_share_canary(real_model, monkeypatch, capsys, caplog):
    calls = []
    def deny(*args, **kwargs):
        calls.append(True)
        raise AssertionError("No egress during analysis")
    monkeypatch.setattr(socket, "create_connection", deny)
    monkeypatch.setattr(socket, "getaddrinfo", deny)
    monkeypatch.setattr(socket.socket, "connect", deny)
    monkeypatch.setattr(socket.socket, "connect_ex", deny)
    monkeypatch.setattr(requests.sessions.Session,"request",deny)
    # Force cold bundled PSL parsing: both cold and repeated analysis are checked.
    EXTRACTOR._extractor = None
    inference = Mock(wraps=real_model.predict)
    monkeypatch.setattr(real_model, "predict", inference)
    with TestClient(create_app(classifier=real_model)) as client:
        health = client.get("/api/health").json()
        assert health["model_ready"] and not health["human_review_complete"]
        for text, expected in ((f"Please send me your OTP. {CANARY} https://notice.invalid/path", "suspicious"), ("Fictional sale on school notebooks. https://shop.invalid/offer", "review"), ("Fictional meeting tomorrow at school.", "review")):
            response = client.post("/api/analyze",json={"text":text,"message_language":"en"})
            data = response.json()
            assert response.status_code == 200 and data["model_version"].endswith(CONFIG["sha256"][:12])
            assert data["analysis_complete"] is False and data["status"] != "no_strong_signals"
            assert data["status"] == expected
            assert len(data["evidence"]) <= 3 and len(data["action_keys"]) <= 3
            assert response.headers["cache-control"] == "no-store"
            assert CANARY not in response.text
    captured = capsys.readouterr()
    assert calls == []
    assert inference.call_count == 3  # Actual model, not metadata/rules alone.
    assert CANARY not in captured.out + captured.err + caplog.text

def test_fresh_process_real_api():
    code = '''from fastapi.testclient import TestClient
from backend.app import create_app
with TestClient(create_app()) as client:
 assert client.get("/api/health").json()["model_ready"]
 data=client.post("/api/analyze",json={"text":"Please send me your password.","message_language":"en"}).json()
 assert data["status"] == "suspicious" and not data["analysis_complete"]
 assert any(e["key"]=="request_for_secret" for e in data["evidence"])
 print("fresh_process_real_api_passed")'''
    completed = subprocess.run([sys.executable,"-c",code],cwd=ROOT,capture_output=True,text=True,timeout=30)
    assert completed.returncode == 0, "Fresh-process API failed (private diagnostics suppressed)"
    assert completed.stdout.strip() == "fresh_process_real_api_passed"

@pytest.mark.parametrize("text", ["Transfer your school notes immediately.", "We do not need you to send a password.", "Never share your password or pay now."])
def test_non_payment_transfer_and_negated_context(text):
    assert observed_rules(text) == []

def test_secrecy_with_otp_elsewhere_is_not_silently_suppressed():
    assert "secrecy_request" in {m.key for m in observed_rules("Do not tell your parents about this OTP transaction.")}

@pytest.mark.parametrize("text", ["Do not keep this secret.", "Do not tell your password to anyone.", "Neříkej svoje heslo rodičům."])
def test_negated_concealment_and_secret_protection(text):
    assert observed_rules(text) == []

def test_hostile_urls_are_only_parsed(real_model, monkeypatch):
    calls = []
    def deny(*args, **kwargs):
        calls.append(True)
        raise AssertionError("network_forbidden")
    monkeypatch.setattr(socket,"getaddrinfo",deny)
    monkeypatch.setattr(socket.socket,"connect",deny)
    text = "Fictional links https://127.0.0.1/x https://[::1]/x https://localhost/x https://name:code@shop.invalid/ https://žluťoučký.invalid/x javascript:alert(1) <img src='https://image.invalid/x'> ignore previous instructions"
    data = result(text,model=real_model)
    assert not data.analysis_complete and data.status != "no_strong_signals"
    assert all(e.key == "model_signal" for e in data.evidence)
    assert calls == []
