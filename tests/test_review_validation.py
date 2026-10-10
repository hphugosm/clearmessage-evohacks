"""Fictional review drafts only; no real human approvals, downloads or freezes."""
from datetime import datetime, timezone
import csv
import io
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ml.data_prep import digest, json_bytes, plan_split, prepare
from tools.human_review.app import MARKER, ReviewError, ReviewStore, create_app
from tools.human_review.validation import Stage, Submit, ValidationWorkspace


def make_fixture(directory: Path):
    entries = []
    for label in ("ham", "spam", "smishing"):
        for index in range(100):
            unique = " ".join(digest(f"fictional/{label}/{index}/{n}")[:16] for n in range(5))
            entries.append((label, f"Fictional validation {label} {unique}"))
    entries += [("spam", "Fictional conflicting subscription at https://notice.invalid/renew"),
                ("smishing", "Fictional conflicting subscription at https://notice.invalid/renew")]
    source = directory / "fixture.csv"
    def write_source():
        text = io.StringIO(); writer = csv.writer(text); writer.writerow(("LABEL", "TEXT", "URL", "EMAIL", "PHONE"))
        for label, message in entries:
            writer.writerow((label, message, "0", "0", "0"))
        source.write_text(text.getvalue())
    write_source()
    first = prepare(source, directory / "first")
    chosen = first[3]["human_review_sample"]["ham"][0]
    duplicate = next(row.text for row in first[1] if row.row_id == chosen)
    entries.append(("ham", duplicate)); write_source()
    prepared = prepare(source, directory / "local")
    provenance, rows, review, audit, mapping = prepared
    candidate = directory / "candidate.json"
    plan_split(provenance, rows, review, audit, mapping, candidate)
    first_ham = next(row["row_id"] for row in review["records"] if row["source_label"] == "ham" and row["row_id"] != chosen)
    for index, row in enumerate(review["records"]):
        target = "ham" if row["row_id"] == first_ham else "spam"
        row.update(decision="confirmed" if target == row["source_label"] else "disagreed",
                   notes="Fictional old human decision.\n" + MARKER + json.dumps({"version":1,"requested_label":target,"action":target}),
                   reviewer_id="" if index < 4 else "fictional-old-reviewer", reviewed_date="" if index < 4 else "2026-10-10")
    review_path = directory / "local/review.completed.json"; review_path.write_bytes(json_bytes(review))
    hints = directory / "hints.json"
    hints.write_bytes(json_bytes({"review_sha256":digest(review_path.read_bytes()),"language_hint_basis":"Fictional test-only language suggestions, not human confirmations.",
                                 "records":{row["row_id"]:{"language":"en","attention":"high","observation":"Fictional observation only.","suggested_label":row["source_label"]} for row in review["records"]}}))
    return review_path, source, candidate, hints


@pytest.fixture
def fixture(tmp_path):
    return make_fixture(tmp_path)


def workspace(fixture):
    review, source, candidate, hints = fixture
    store = ReviewStore(review, review.parent / "records.jsonl", suggestions=False)
    return ValidationWorkspace(store, source, candidate, hints)


def test_all_original_labels_conflicts_and_draft_effect(fixture):
    before = fixture[0].read_bytes(); work = workspace(fixture); view = work.view()
    assert len(view["records"]) == 45
    assert sum(row["changed_from_source"] for row in view["records"]) == 29
    assert view["effect"]["quarantined_rows"] == 2
    assert view["effect"]["quarantined_counts"] == {"spam":1,"smishing":1}
    assert view["effect"]["additional_conflict_groups"]
    assert len(view["conflicts"][0]["rows"]) == 2
    assert not any(row["label_rechecked"] or row["language_confirmed"] for row in view["records"])
    assert fixture[0].read_bytes() == before and not list(fixture[0].parent.glob("*.backup-*"))


def test_bulk_human_attestation_and_languages_required(fixture):
    work = workspace(fixture); ids = list(work.draft)
    with pytest.raises(ReviewError,match="explicit_human_confirmation_required"):
        work.stage(Stage(ids=ids,label="original"))
    work.stage(Stage(ids=ids,label="original",attested=True))
    assert not work.effect()["additional_conflict_groups"]
    assert all(row["label_rechecked"] and not row["language_confirmed"] for row in work.draft.values())
    work.stage(Stage(ids=ids,language="en",attested=True))
    assert all(row["language_confirmed"] and row["language"] == "en" for row in work.draft.values())
    with pytest.raises(ReviewError,match="validation_draft_has_unresolved_blockers"):
        work.submit(Submit(reviewer_id="fictional-owner",submit_draft_confirmed=True))


def test_group_resolution_is_explicit_and_only_reserved_training_families(fixture):
    work = workspace(fixture); gid = work.effect()["additional_conflict_groups"][0]
    with pytest.raises(ReviewError,match="explicit_human_confirmation_required"):
        work.stage(Stage(group_id=gid,group_label="spam"))
    work.stage(Stage(group_id=gid,group_label="spam",attested=True))
    assert gid not in work.effect()["additional_conflict_groups"]
    assert all(work.label_for(row) == "spam" for row in work.groups[gid])
    excluded = next(iter(work.conflict_ids))
    with pytest.raises(ReviewError,match="invalid_review_group_resolution"):
        work.stage(Stage(group_id=excluded,group_label="spam",attested=True))


def test_new_metadata_is_current_and_old_history_not_overwritten(fixture):
    work = workspace(fixture); missing=[rid for rid,row in work.draft.items() if not row["reviewer_id"]]
    assert len(missing) == 4
    before = datetime.now(timezone.utc)
    work.stage(Stage(ids=missing,metadata_mode="reconfirm_now",reviewer_id="fictional-reconfirmer",attested=True))
    for rid in missing:
        row = work.draft[rid]
        assert row["metadata_confirmation"]["historical_date_unknown"] is True
        assert datetime.fromisoformat(row["metadata_confirmation"]["recorded_at"]) >= before
        assert row["saved_review"]["reviewer_id"] == row["saved_review"]["reviewed_date"] == ""
    known = next(rid for rid,row in work.draft.items() if row["reviewer_id"] == "fictional-old-reviewer")
    prior = dict(work.draft[known])
    with pytest.raises(ReviewError,match="existing_history_must_be_preserved"):
        work.stage(Stage(ids=[known],metadata_mode="known_history",historical_date="2000-01-01",reviewer_id="different",label="ham",attested=True))
    assert work.draft[known] == prior
    assert json.loads(fixture[0].read_bytes())["records"][0]["reviewer_id"] == ""


def test_submission_is_separate_text_free_draft_never_final_approval(fixture):
    before={path:path.read_bytes() for path in fixture[:3]}
    work=workspace(fixture);ids=list(work.draft)
    work.stage(Stage(ids=ids,label="original",language="en",attested=True))
    missing=[rid for rid,row in work.draft.items() if not row["reviewer_id"]]
    work.stage(Stage(ids=missing,metadata_mode="known_history",historical_date="2026-10-10",reviewer_id="fictional-owner",attested=True))
    work.stage(Stage(propose_quarantine=True,attested=True))
    assert not work.blockers()
    with pytest.raises(ReviewError,match="draft_submission_confirmation_required"):
        work.submit(Submit(reviewer_id="fictional-owner"))
    result=work.submit(Submit(reviewer_id="fictional-owner",submit_draft_confirmed=True))
    draft=Path(result["draft_file"]); content=json.loads(draft.read_bytes())
    assert content["final_approval_given"] is False and content["status"] == "draft_awaiting_final_owner_approval"
    assert "Fictional validation ham" not in draft.read_text() and "https://notice.invalid" not in draft.read_text()
    assert content["quarantine_proposed"] is True and len(content["records"]) == 45
    assert all(row["final_label"] == row["source_label"] for row in content["records"])
    assert any(row["saved_review"]["requested_label"] != row["final_label"] for row in content["records"])
    assert all(path.read_bytes() == payload for path,payload in before.items())
    assert not list(fixture[0].parent.glob("*.backup-*"))


def test_stale_canonical_blocks_stage_and_draft_submission(fixture):
    work=workspace(fixture);fixture[0].write_bytes(fixture[0].read_bytes()+b" ")
    with pytest.raises(ReviewError,match="canonical_review_changed_restart_validation"):
        work.stage(Stage(ids=[next(iter(work.draft))],label="original",attested=True))
    with pytest.raises(ReviewError,match="canonical_review_changed_restart_validation"):
        work.submit(Submit(reviewer_id="fictional-owner",submit_draft_confirmed=True))


def test_api_canonical_save_forbidden_but_explicit_draft_staging_allowed(fixture):
    review,source,candidate,hints=fixture; before=review.read_bytes()
    app=create_app(review,port=8767,validation_hints=hints,source_path=source,candidate_path=candidate)
    with TestClient(app,base_url="http://127.0.0.1:8767") as client:
        view=client.get("/api/validation").json(); headers={"Origin":"http://127.0.0.1:8767","X-Review-Token":view["csrf_token"]}
        rejected=client.post("/api/save",headers=headers,json={"revision":view["revision"],"reviewer_id":"fictional","reviewed_date":"2026-10-10","changes":[{"row_id":view["records"][0]["row_id"],"action":"accept"}]})
        assert rejected.status_code == 403 and rejected.json()["error"] == "canonical_save_requires_separate_final_approval"
        staged=client.post("/api/validation/stage",headers=headers,json={"ids":[view["records"][0]["row_id"]],"label":"original","attested":True})
        assert staged.status_code == 200,staged.text
        assert client.get("/api/validation").json()["records"][0]["label_rechecked"] is True
        assert client.get("/validation.js").status_code == 200
    assert review.read_bytes() == before
