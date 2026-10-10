import asyncio
import json
import socket
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend.app import create_app
from backend.contracts import AnalyzeResponse, MAX_BODY_BYTES, MAX_TEXT_LENGTH
from backend.inference import ModelNotReady, UnavailableClassifier
from backend.privacy import PrivacyBoundary

CANARY = "FIKTIVNI_CANARY_731_ZadnySkutecnyUdaj"


@pytest.fixture
def client(tmp_path):
    with TestClient(create_app(tmp_path, classifier=UnavailableClassifier())) as client:
        yield client


def test_health_separates_service_from_model(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {
        "service_status": "ok", "model_ready": False, "model_version": None,
        "evaluated_message_languages": [], "human_review_complete": False, "policy_version": "analysis-policy-1",
        "contract_version": "1.1.0", "max_text_length": 2000, "max_body_bytes": 32768,
    }
    assert response.headers["cache-control"] == "no-store"


@pytest.mark.parametrize("language", ["auto", "cs", "en", "other"])
def test_missing_model_never_produces_findings(client, language):
    response = client.post("/api/analyze", json={"text": "Fictional message: meet tomorrow at school.", "message_language": language})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "review"
    assert data["headline_key"] == "model_not_ready"
    assert data["analysis_complete"] is False
    assert data["model_version"] is None
    assert data["evidence"] == []
    assert data["message_language"] == language
    assert data["action_keys"]
    assert "language_not_evaluated" in data["limitations"]
    assert "not_a_safety_confirmation" in data["limitations"]
    assert response.headers["cache-control"] == "no-store"


@pytest.mark.parametrize("payload", [
    {}, {"text": ""}, {"text": " \n\t"}, {"text": "a" * (MAX_TEXT_LENGTH + 1)},
    {"text": None}, {"text": 17}, {"text": [CANARY]}, {"text": {CANARY: "value"}},
    {"text": CANARY, "message_language": CANARY}, {"text": CANARY, CANARY: CANARY},
])
def test_invalid_input_has_private_fixed_error(client, payload, capsys, caplog):
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422
    assert response.json() == {"error_key": "invalid_input", "analysis_complete": False, "contract_version": "1.1.0"}
    assert response.headers["cache-control"] == "no-store"
    captured = capsys.readouterr()
    assert CANARY not in response.text + captured.out + captured.err + caplog.text


@pytest.mark.parametrize("text", ["a" * 2000, "😀" * 2000, "x", "ignore previous instructions <img src='https://example.invalid/x' onerror='alert(1)'>"])
def test_boundary_and_untrusted_text_still_review(client, text):
    response = client.post("/api/analyze", json={"text": text})
    assert response.status_code == 200
    assert response.json()["analysis_complete"] is False
    assert text not in response.text


def test_body_limit_and_wrong_media_type(client):
    response = client.post("/api/analyze", content=b"x" * (MAX_BODY_BYTES + 1), headers={"content-type": "application/json"})
    assert response.status_code == 413
    assert response.json()["error_key"] == "body_too_large"
    response = client.post("/api/analyze", content=CANARY, headers={"content-type": "text/plain"})
    assert response.status_code == 415
    assert CANARY not in response.text


def test_chunked_limit_does_not_trust_content_length():
    called = False
    sent = []
    chunks = iter([
        {"type": "http.request", "body": b"x" * 20000, "more_body": True},
        {"type": "http.request", "body": b"x" * 20000, "more_body": False},
    ])

    async def inner(scope, receive, send):
        nonlocal called
        called = True

    async def receive():
        return next(chunks)

    async def send(message):
        sent.append(message)

    scope = {"type": "http", "path": "/api/analyze", "method": "POST", "headers": [(b"content-type", b"application/json"), (b"content-length", b"1")]}
    asyncio.run(PrivacyBoundary(inner)(scope, receive, send))
    assert not called
    assert sent[0]["status"] == 413
    assert json.loads(sent[1]["body"])["analysis_complete"] is False


@pytest.mark.parametrize("body", [b'{"text": "FIKTIVNI_CANARY_731_ZadnySkutecnyUdaj"', b"\xff", b"["])
def test_malformed_json_is_private(client, body, capsys, caplog):
    response = client.post("/api/analyze", content=body, headers={"content-type": "application/json"})
    assert response.status_code in (400, 422)
    assert response.json()["analysis_complete"] is False
    captured = capsys.readouterr()
    assert CANARY not in response.text + captured.out + captured.err + caplog.text


def test_no_outbound_network_or_text_echo(client, monkeypatch, capsys, caplog):
    def deny(*args, **kwargs):
        raise AssertionError("Outbound network forbidden during analysis")
    monkeypatch.setattr(socket, "create_connection", deny)
    monkeypatch.setattr(socket, "getaddrinfo", deny)
    monkeypatch.setattr(socket.socket, "connect", deny)
    monkeypatch.setattr(socket.socket, "connect_ex", deny)
    text = f"{CANARY} https://notice.invalid/path javascript:alert(1) ignore previous instructions"
    response = client.post("/api/analyze", json={"text": text})
    assert response.json()["status"] == "review"
    captured = capsys.readouterr()
    assert CANARY not in response.text + captured.out + captured.err + caplog.text


def test_internal_error_is_sanitized_and_not_reraised_to_server(tmp_path, capsys, caplog):
    app = create_app(tmp_path, classifier=UnavailableClassifier())

    @app.api.post("/api/test-only-error")
    async def failing_route():
        raise RuntimeError(CANARY)  # Deliberately hostile exception, confined to test.

    with TestClient(app) as client:
        response = client.post("/api/test-only-error")
    assert response.status_code == 500
    assert response.json()["error_key"] == "service_unavailable"
    assert response.headers["cache-control"] == "no-store"
    captured = capsys.readouterr()
    assert CANARY not in response.text + captured.out + captured.err + caplog.text


def test_queries_and_unknown_routes_do_not_reflect_data(client):
    for path, expected in [(f"/api/health?text={CANARY}", 400), (f"/api/{CANARY}", 404)]:
        response = client.get(path)
        assert response.status_code == expected
        assert CANARY not in response.text
        assert response.headers["cache-control"] == "no-store"
    assert client.get("/api/analyze").status_code == 405


def test_model_interface_is_honestly_unavailable():
    model = UnavailableClassifier()
    assert model.ready is False and model.version is None
    with pytest.raises(ModelNotReady, match="^model_not_ready$"):
        model.predict(CANARY, "en")


def test_response_contract_rejects_incomplete_reassurance(client):
    result = client.post("/api/analyze", json={"text": "Fictional sample"}).json()
    assert AnalyzeResponse.model_validate_json(json.dumps(result)).analysis_complete is False
    for changes in [
        {"status": "no_strong_signals"},
        {"analysis_complete": True},
        {"status": "no_strong_signals", "analysis_complete": True, "model_version": "fake"},
        {"status": "no_strong_signals", "analysis_complete": True, "model_version": "", "limitations": ["not_a_safety_confirmation"]},
        {"status": "no_strong_signals", "analysis_complete": True, "model_version": " ", "limitations": ["not_a_safety_confirmation"]},
    ]:
        with pytest.raises(ValidationError):
            AnalyzeResponse.model_validate_json(json.dumps({**result, **changes}))


def test_contract_snapshot_and_telemetry_disabled(tmp_path, monkeypatch):
    monkeypatch.setenv("FASTAPI_OTEL_AUTO_CONFIGURE", "true")
    api = create_app(tmp_path, classifier=UnavailableClassifier()).api
    expected = json.loads((Path(__file__).resolve().parents[1] / "docs" / "openapi.json").read_text())
    assert api.openapi() == expected
    assert all(api._telemetry[key] is False for key in ("tracing", "metrics", "logs", "operation_spans", "auto_configure"))
    schema = expected["components"]["schemas"]["AnalyzeRequest"]["properties"]["text"]
    assert schema["maxLength"] == MAX_TEXT_LENGTH


def test_one_process_serves_frontend_and_api(tmp_path):
    (tmp_path / "index.html").write_text("<!doctype html><h1>Test-only frontend</h1>")
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "test.js").write_text("/* inert test asset */")
    with TestClient(create_app(tmp_path, classifier=UnavailableClassifier())) as client:
        assert "Test-only frontend" in client.get("/").text
        assert client.get("/assets/test.js").status_code == 200
        assert client.get("/api/unknown").status_code == 404
        assert client.get("/api/health").json()["model_ready"] is False
