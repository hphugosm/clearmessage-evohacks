"""Human decisions here are fictional test input, never approvals of real data."""
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from tools.human_review.app import MARKER, ReviewStore, create_app

ORIGIN = "http://127.0.0.1:8765"


@pytest.fixture
def fixture(tmp_path):
    records = [
        {"row_id": "fictional-1", "label": "ham", "text": "Fictional school meeting tomorrow. <script>throw Error('CANARY')</script> https://notice.invalid/a"},
        {"row_id": "fictional-2", "label": "spam", "text": "Fictional advertisement: shoes half price."},
        {"row_id": "fictional-3", "label": "smishing", "text": "Fictional request: disclose your password at https://bank.invalid/"},
    ]
    value = {"pipeline_version": "data-prep-v2", "source_input_sha256": "1" * 64, "exclusions_approved_by": "",
             "unknown_metadata": {"preserve": True},
             "records": [{"row_id": r["row_id"], "source_label": r["label"], "decision": "pending", "language": "pending",
                          "reviewer_id": "", "reviewed_date": "", "notes": "Prior note retained.", "extra": {"retain": 1}} for r in records]}
    review = tmp_path / "review.json"; review.write_text(json.dumps(value, indent=2) + "\n")
    messages = tmp_path / "records.jsonl"; messages.write_text("".join(json.dumps(r) + "\n" for r in records))
    return review, messages, value


def client_for(fixture):
    review, records, _value = fixture
    return TestClient(create_app(review, records, suggestions=False), base_url=ORIGIN, raise_server_exceptions=False)


def save(client, changes, **kwargs):
    view = client.get("/api/review").json()
    payload = {"revision": view["revision"], "reviewer_id": "fictional-tester", "reviewed_date": "2026-10-10", "changes": changes, **kwargs}
    return client.post("/api/save", json=payload, headers={"Origin": ORIGIN, "X-Review-Token": view["csrf_token"]})


def test_load_does_not_review_or_write(fixture):
    review, _, _ = fixture; original = review.read_bytes()
    with client_for(fixture) as client:
        view = client.get("/api/review")
        assert view.status_code == 200
        assert view.json()["counters"] == {"total": 3, "approved": 0, "corrected": 0, "pending": 3, "proposed_exclusions": 0, "approved_exclusions": 0}
        assert "<script>" in view.json()["records"][0]["text"]
        for path in ("/", "/app.js", "/style.css", "/tokens.css", "/api/report"):
            response = client.get(path); assert response.status_code == 200
            assert response.headers["cache-control"] == "no-store"
            assert "default-src 'none'" in response.headers["content-security-policy"]
    assert review.read_bytes() == original and not list(review.parent.glob("*.backup-*"))


def test_atomic_save_backup_metadata_and_no_source_relabel(fixture):
    review, _, before = fixture; original = review.read_bytes()
    with client_for(fixture) as client:
        result = save(client, [{"row_id": "fictional-1", "action": "accept", "language": "en"}, {"row_id": "fictional-2", "action": "smishing"}])
        assert result.status_code == 200, result.text
        backup = Path(result.json()["backup_file"])
        assert backup.read_bytes() == original and backup.stat().st_mode & 0o777 == 0o600
        after = json.loads(review.read_bytes())
        assert set(after) == set(before)
        assert {k: v for k, v in after.items() if k != "records"} == {k: v for k, v in before.items() if k != "records"}
        assert after["records"][2] == before["records"][2]
        for row, old in zip(after["records"], before["records"]):
            assert set(row) == set(old) and row["source_label"] == old["source_label"] and row["extra"] == old["extra"]
        assert after["records"][0]["decision"] == "confirmed"
        assert after["records"][1]["decision"] == "disagreed"
        assert after["records"][1]["language"] == "pending"
        assert after["records"][1]["notes"].startswith("Prior note retained.\n" + MARKER)
        report = result.json()["report"]
        assert len(report["changes_since_server_start"]) == 2
        assert report["pending_ids"] == ["fictional-3"]
        assert report["goal01_complete"] is False and report["split_frozen"] is False and report["training_started"] is False
        assert "<script>" not in json.dumps(report)


@pytest.mark.parametrize("confirmed,reviewed_ids", [(False, ["fictional-1"]), (True, [])])
def test_bulk_rejected_without_confirmation_and_reviewed_rows(fixture, confirmed, reviewed_ids):
    review, _, _ = fixture; original = review.read_bytes()
    with client_for(fixture) as client:
        response = save(client, [{"row_id": "fictional-1", "action": "accept"}], bulk_ids=["fictional-1"], bulk_confirmed=confirmed, reviewed_ids=reviewed_ids)
        assert response.status_code == 400 and response.json()["error"] == "bulk_human_confirmation_required"
    assert review.read_bytes() == original


def test_bulk_approves_only_explicit_reviewed_ids(fixture):
    with client_for(fixture) as client:
        response = save(client, [{"row_id": "fictional-2", "action": "accept"}], bulk_ids=["fictional-2"], reviewed_ids=["fictional-2"], bulk_confirmed=True)
        assert response.status_code == 200
        assert response.json()["report"]["pending_ids"] == ["fictional-1", "fictional-3"]


def test_exclusions_require_proposal_reason_and_separate_approval(fixture):
    review, _, _ = fixture
    with client_for(fixture) as client:
        assert save(client, [{"row_id": "fictional-1", "action": "approve_exclusion"}], exclusions_confirmed=True).json()["error"] == "propose_exclusion_before_approval"
        assert save(client, [{"row_id": "fictional-1", "action": "propose_exclusion"}]).json()["error"] == "exclusion_reason_required"
        proposal = save(client, [{"row_id": "fictional-1", "action": "propose_exclusion", "reason": "Fictional test duplicate"}])
        assert proposal.json()["view"]["counters"]["proposed_exclusions"] == 1
        before = review.read_bytes()
        assert save(client, [{"row_id": "fictional-1", "action": "approve_exclusion"}]).json()["error"] == "separate_exclusion_confirmation_required"
        assert review.read_bytes() == before
        approved = save(client, [{"row_id": "fictional-1", "action": "approve_exclusion"}], exclusions_confirmed=True)
        assert approved.status_code == 200 and approved.json()["view"]["counters"]["approved_exclusions"] == 1
        row = approved.json()["report"]["decisions"][0]
        assert row["exclusion_approved_by"] == "fictional-tester" and row["exclusion_reason"] == "Fictional test duplicate"
        assert json.loads(review.read_bytes())["exclusions_approved_by"] == ""
        assert len(json.loads(review.read_bytes())["records"]) == 3


def test_unsure_remains_pending_and_restart_restores_decisions(fixture):
    with client_for(fixture) as client:
        response = save(client, [{"row_id": "fictional-1", "action": "unsure"}])
        assert response.status_code == 200 and response.json()["report"]["counters"]["pending"] == 3
    with client_for(fixture) as client:
        assert client.get("/api/review").json()["records"][0]["state"] == "unsure"


def test_stale_session_and_all_or_nothing(fixture):
    review, _, _ = fixture
    with client_for(fixture) as client:
        view = client.get("/api/review").json()
        assert save(client, [{"row_id": "fictional-1", "action": "accept"}]).status_code == 200
        before = review.read_bytes()
        response = client.post("/api/save", json={"revision": view["revision"], "reviewer_id": "fictional-tester", "reviewed_date": "2026-10-10", "changes": [{"row_id": "fictional-2", "action": "ham"}]}, headers={"Origin": ORIGIN, "X-Review-Token": view["csrf_token"]})
        assert response.status_code == 409 and review.read_bytes() == before
        response = save(client, [{"row_id": "fictional-2", "action": "accept"}, {"row_id": "unknown", "action": "ham"}])
        assert response.status_code == 400 and review.read_bytes() == before


@pytest.mark.parametrize("stage", ["backup", "replace"])
def test_io_failure_preserves_original(fixture, monkeypatch, stage):
    import tools.human_review.app as module
    review, _, _ = fixture; before = review.read_bytes()
    with client_for(fixture) as client:
        if stage == "replace":
            monkeypatch.setattr(module.os, "replace", lambda *args: (_ for _ in ()).throw(OSError("PRIVATE_CANARY")))
        else:
            original_open = module.os.open
            def failed_open(path, flags, *args, **kwargs):
                if ".backup-" in str(path):
                    raise OSError("PRIVATE_CANARY")
                return original_open(path, flags, *args, **kwargs)
            monkeypatch.setattr(module.os, "open", failed_open)
        response = save(client, [{"row_id": "fictional-1", "action": "accept"}])
        assert response.status_code == 500 and "PRIVATE_CANARY" not in response.text
        assert review.read_bytes() == before and not list(review.parent.glob(".review-save-*"))
        if stage == "replace":
            assert next(review.parent.glob("*.backup-*")).read_bytes() == before


def test_old_correction_and_prior_notes_are_preserved(fixture):
    review, records, value = fixture
    value["records"][0].update(decision="disagreed", notes="Existing human decision; requested_label=spam. Attribution pending.")
    review.write_text(json.dumps(value))
    store = ReviewStore(review, records, suggestions=False)
    assert store.view()["records"][0]["state"] == "corrected"
    assert store.view()["records"][0]["requested_label"] == "spam"
    with client_for(fixture) as client:
        saved = save(client, [{"row_id": "fictional-1", "action": "unsure"}])
        assert saved.json()["view"]["records"][0]["requested_label"] is None
        assert json.loads(review.read_bytes())["records"][0]["notes"].startswith(value["records"][0]["notes"])


@pytest.mark.parametrize("host,origin,token", [("evil.invalid", ORIGIN, True), ("127.0.0.1:8765", "https://evil.invalid", True), ("127.0.0.1:8765", ORIGIN, False)])
def test_local_host_origin_and_token_required(fixture, host, origin, token):
    review, _, _ = fixture; before = review.read_bytes()
    with client_for(fixture) as client:
        session = client.get("/api/review").json()
        response = client.post("/api/save", json={}, headers={"Host": host, "Origin": origin, "X-Review-Token": session["csrf_token"] if token else "bad"})
        assert response.status_code == 403
        assert client.get("/api/review", headers={"Host": "evil.invalid"}).status_code == 403
        assert client.get("/api/review?PRIVATE_CANARY").status_code == 403
    assert review.read_bytes() == before


def test_validation_errors_are_redacted_and_size_bounded(fixture, capsys, caplog):
    with client_for(fixture) as client:
        view = client.get("/api/review").json()
        headers = {"Origin": ORIGIN, "X-Review-Token": view["csrf_token"], "Content-Type": "application/json"}
        invalid = client.post("/api/save", json={"PRIVATE_CANARY": "private body"}, headers=headers)
        assert invalid.status_code == 422 and invalid.json() == {"error": "invalid_request"}
        big = client.post("/api/save", content=b"x" * (1024 * 1024 + 1), headers=headers)
        assert big.status_code == 413
        assert "PRIVATE_CANARY" not in capsys.readouterr().out + caplog.text + invalid.text


@pytest.mark.parametrize("changes,kwargs", [
    ([{"row_id": "fictional-1", "action": "accept"}, {"row_id": "fictional-1", "action": "ham"}], {}),
    ([{"row_id": "fictional-1", "action": "accept"}], {"reviewed_date": "2026-02-31"}),
    ([{"row_id": "fictional-1", "action": "accept"}], {"reviewer_id": " "}),
])
def test_invalid_decisions_do_not_write(fixture, changes, kwargs):
    review, _, _ = fixture; before = review.read_bytes()
    with client_for(fixture) as client:
        assert save(client, changes, **kwargs).status_code in (400, 422)
    assert review.read_bytes() == before
