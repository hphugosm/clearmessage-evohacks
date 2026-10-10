"""Approval preparation only: local drafts, original-label comparisons and conflicts.

This module never changes the canonical review, excludes source rows or freezes
a split. Draft confirmations come only from explicit UI actions.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from threading import RLock
from typing import Literal
from zoneinfo import ZoneInfo
import json
import os
import tempfile

from pydantic import BaseModel, ConfigDict, Field

from ml.data_prep import read_input, import_rows, group_rows, digest, json_bytes, assert_no_leakage
from tools.human_review.app import ReviewError, read_bytes, read_review, summary


class Stage(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    ids: list[str] = Field(default_factory=list, max_length=100)
    label: Literal["original", "current", "ham", "spam", "smishing"] | None = None
    language: Literal["en", "cs", "other", "und"] | None = None
    metadata_mode: Literal["reconfirm_now", "known_history"] | None = None
    reviewer_id: str = Field(default="", max_length=80, pattern=r"^[a-zA-Z0-9 ._-]*$")
    historical_date: str | None = None
    group_id: str | None = None
    group_label: Literal["ham", "spam", "smishing"] | None = None
    propose_quarantine: bool | None = None
    attested: bool = False


class Submit(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    reviewer_id: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z0-9][a-zA-Z0-9 ._-]*$")
    submit_draft_confirmed: bool = False


class ValidationWorkspace:
    def __init__(self, store, source_path: Path, candidate_path: Path, hints_path: Path):
        self.store = store
        self.review, self.original_bytes = read_review(store.path)
        self.revision = digest(self.original_bytes)
        self.source_path, self.candidate_path = source_path, candidate_path
        self.candidate = json.loads(read_bytes(candidate_path))
        self.candidate_sha = digest(read_bytes(candidate_path))
        if candidate_path.with_suffix(".sha256").read_text().strip() != self.candidate_sha:
            raise ReviewError("candidate_hash_mismatch")
        provenance = self.candidate["provenance"]
        payload, input_meta = read_input(source_path, provenance["csv_member"], provenance["encoding"])
        if input_meta["input_sha256"] != provenance["input_sha256"] or self.review["source_input_sha256"] != provenance["input_sha256"]:
            raise ReviewError("validation_source_hash_mismatch")
        self.rows, _audit = import_rows(payload, provenance["encoding"])
        self.mapping, _grouping = group_rows(self.rows)
        self.lookup = {r.row_id: r for r in self.rows}
        self.groups = defaultdict(list)
        for row in self.rows:
            self.groups[self.mapping[row.row_id]].append(row)
        self.conflict_ids = {gid for gid, members in self.groups.items() if len({r.label for r in members}) > 1}
        if self.conflict_ids != set(self.candidate["conflicting_groups"]):
            raise ReviewError("candidate_conflict_mismatch")
        assert_no_leakage(self.candidate["records"])
        self.assignments = {r["row_id"]: r for r in self.candidate["records"]}
        if any(self.mapping[rid] != item["group_id"] or self.lookup[rid].label != item["label"]
               or self.lookup[rid].text_hash != item["text_sha256"] for rid, item in self.assignments.items()):
            raise ReviewError("candidate_source_records_mismatch")
        original_sample = {rid for ids in self.candidate["human_review_sample_ids"].values() for rid in ids}
        if {r["row_id"] for r in self.review["records"]} != original_sample:
            raise ReviewError("validation_sample_mismatch")
        self.hints = json.loads(read_bytes(hints_path))
        if self.hints.get("review_sha256") != self.revision or set(self.hints["records"]) != original_sample:
            raise ReviewError("validation_hints_revision_mismatch")
        self.draft = {}
        for row in self.review["records"]:
            rid = row["row_id"]
            if self.lookup[rid].label != row["source_label"] or self.assignments[rid]["split"] != "train":
                raise ReviewError("validation_original_label_or_partition_mismatch")
            saved = summary(row)
            self.draft[rid] = {"row_id": rid, "source_label": row["source_label"], "saved_review": saved,
                               "language": saved["language"], "reviewer_id": saved["reviewer_id"],
                               "reviewed_date": saved["reviewed_date"], "final_label": saved["requested_label"],
                               "label_rechecked": False, "language_confirmed": False, "metadata_confirmation": None}
        self.group_decisions = {}
        self.quarantine_proposed = False
        self.lock = RLock()
        self.submitted_revision = None

    def check_revision(self):
        if digest(read_bytes(self.store.path)) != self.revision:
            raise ReviewError("canonical_review_changed_restart_validation", 409)

    def label_for(self, row):
        if row.row_id in self.draft:
            return self.draft[row.row_id]["final_label"] or row.label
        return self.group_decisions.get(self.mapping[row.row_id], {}).get("label", row.label)

    def group_view(self, gid, *, draft=False):
        members = self.groups[gid]
        if len({r.normal_hash for r in members}) == 1:
            kind = "Identical after whitespace/case/Unicode normalization"
        elif members[0].template_hash is not None and len({r.template_hash for r in members}) == 1:
            kind = "Same conservative template with variable contacts/numbers"
        else:
            kind = "Near-copy or a combination of normalized/template/near-copy links"
        return {"group_id": gid, "reason": kind, "counts_by_original_label": dict(Counter(r.label for r in members)),
                "draft_conflict": len({self.label_for(r) for r in members}) > 1,
                "human_group_decision": self.group_decisions.get(gid),
                "rows": [{"row_id": r.row_id, "original_label": r.label, "draft_label": self.label_for(r) if draft else r.label,
                          "text": r.text, "in_review_sample": r.row_id in self.draft} for r in members]}

    def effect(self):
        original = Counter(r.label for r in self.rows)
        quarantined = [r for r in self.rows if self.mapping[r.row_id] in self.conflict_ids]
        eligible = [r for r in self.rows if self.mapping[r.row_id] not in self.conflict_ids]
        additional = [gid for gid, members in self.groups.items() if gid not in self.conflict_ids and len({self.label_for(r) for r in members}) > 1]
        overrides = [{"row_id": r.row_id, "source_label": r.label, "reviewed_label": self.label_for(r), "group_id": self.mapping[r.row_id]}
                     for r in eligible if self.label_for(r) != r.label]
        return {"original_rows": len(self.rows), "original_counts": dict(original),
                "quarantined_rows": len(quarantined), "quarantined_groups": len(self.conflict_ids),
                "quarantined_counts": dict(Counter(r.label for r in quarantined)),
                "eligible_rows": len(eligible), "eligible_original_counts": dict(Counter(r.label for r in eligible)),
                "conflict_reason_counts": dict(Counter(self.group_view(gid)["reason"] for gid in self.conflict_ids)),
                "draft_counts_after_corrections": dict(Counter(self.label_for(r) for r in eligible)),
                "additional_conflict_groups": additional, "additional_conflict_rows": sum(len(self.groups[gid]) for gid in additional),
                "label_overrides": overrides, "candidate_assignments_preserved": True,
                "retraining_required_if_approved": bool(overrides), "model_trained": False}

    def blockers(self):
        result = []
        for key, predicate in (
            ("labels_not_rechecked", lambda r: not r["label_rechecked"] or r["final_label"] not in ("ham", "spam", "smishing")),
            ("languages_not_confirmed", lambda r: not r["language_confirmed"]),
            ("review_metadata_missing", lambda r: not r["reviewer_id"].strip() or not r["reviewed_date"].strip()),
        ):
            ids = [rid for rid, row in self.draft.items() if predicate(row)]
            if ids:
                result.append({"code": key, "ids": ids})
        if not self.quarantine_proposed:
            result.append({"code": "conflict_quarantine_not_proposed", "count": len(self.conflict_ids)})
        added = self.effect()["additional_conflict_groups"]
        if added:
            result.append({"code": "corrections_create_additional_conflicts", "group_ids": added})
        return result

    def view(self):
        with self.lock:
            self.check_revision()
            records = [{**row, "text": self.lookup[rid].text, "changed_from_source": row["final_label"] != row["source_label"],
                        "saved_label": row["saved_review"]["requested_label"],
                        "hints": self.hints["records"][rid]} for rid, row in self.draft.items()]
            affected = {self.mapping[rid] for rid in self.draft if self.draft[rid]["final_label"] != self.lookup[rid].label and len(self.groups[self.mapping[rid]]) > 1}
            return {"revision": self.revision, "csrf_token": self.store.token, "records": records,
                    "conflicts": [self.group_view(gid) for gid in sorted(self.conflict_ids)],
                    "affected_review_groups": [self.group_view(gid, draft=True) for gid in sorted(affected)],
                    "language_hint_basis": self.hints["language_hint_basis"], "effect": self.effect(), "blockers": self.blockers(),
                    "quarantine_proposed": self.quarantine_proposed, "saved_review_modified": False,
                    "final_approval_given": False, "split_frozen": False,
                    "draft_submitted": self.submitted_revision is not None}

    def stage(self, change: Stage):
        with self.lock:
            self.check_revision()
            if not change.attested:
                raise ReviewError("explicit_human_confirmation_required")
            if len(set(change.ids)) != len(change.ids) or set(change.ids) - self.draft.keys():
                raise ReviewError("invalid_validation_selection")
            if (change.label or change.language or change.metadata_mode) and not change.ids:
                raise ReviewError("select_validation_entries")
            if change.metadata_mode and not change.reviewer_id.strip():
                raise ReviewError("actual_reviewer_required")
            if change.metadata_mode and any(self.draft[rid]["reviewer_id"].strip() and self.draft[rid]["reviewed_date"].strip() for rid in change.ids):
                raise ReviewError("existing_history_must_be_preserved")
            now = datetime.now(timezone.utc)
            today = now.astimezone(ZoneInfo("Europe/Prague")).date()
            if change.metadata_mode == "known_history":
                try:
                    historical_date = date.fromisoformat(change.historical_date or "")
                    if historical_date > today:
                        raise ValueError
                except ValueError:
                    raise ReviewError("actual_historical_date_required") from None
                if any((self.draft[rid]["reviewer_id"].strip() and self.draft[rid]["reviewer_id"].strip() != change.reviewer_id.strip())
                       or (self.draft[rid]["reviewed_date"].strip() and self.draft[rid]["reviewed_date"] != str(historical_date))
                       for rid in change.ids):
                    raise ReviewError("existing_history_must_be_preserved")
            if change.group_id is not None:
                if change.group_id not in self.groups or change.group_label is None or change.group_id in self.conflict_ids:
                    raise ReviewError("invalid_review_group_resolution")
                members = self.groups[change.group_id]
                # All related reviewed families are reserved for train. Never expose
                # new held-out examples to resolve a training review disagreement.
                if not any(r.row_id in self.draft for r in members) or any(self.assignments[r.row_id]["split"] != "train" for r in members):
                    raise ReviewError("review_group_not_reserved_for_train")
            for rid in change.ids:
                row = self.draft[rid]
                if change.label:
                    if change.label == "original":
                        row["final_label"] = row["source_label"]
                    elif change.label != "current":
                        row["final_label"] = change.label
                    row["label_rechecked"] = True
                    row["label_confirmed_at"] = now.isoformat()
                if change.language:
                    row["language"] = change.language
                    row["language_confirmed"] = True
                    row["language_confirmed_at"] = now.isoformat()
                if change.metadata_mode:
                    # The saved_review snapshot retains the old history separately
                    # from a newly dated re-confirmation or supplied missing facts.
                    row["reviewer_id"] = change.reviewer_id.strip()
                    row["reviewed_date"] = str(today if change.metadata_mode == "reconfirm_now" else historical_date)
                    row["metadata_confirmation"] = {"mode": change.metadata_mode, "recorded_at": now.isoformat(),
                                                    "historical_date_unknown": change.metadata_mode == "reconfirm_now"}
            if change.group_id:
                self.group_decisions[change.group_id] = {"label": change.group_label, "confirmed_at": now.isoformat()}
                for row in self.groups[change.group_id]:
                    if row.row_id in self.draft:
                        self.draft[row.row_id].update(final_label=change.group_label, label_rechecked=True, label_confirmed_at=now.isoformat())
            if change.propose_quarantine is not None:
                self.quarantine_proposed = change.propose_quarantine
            self.submitted_revision = None
            return self.view()

    def submit(self, request: Submit):
        with self.lock:
            self.check_revision()
            if not request.submit_draft_confirmed or not request.reviewer_id.strip():
                raise ReviewError("draft_submission_confirmation_required")
            if self.blockers():
                raise ReviewError("validation_draft_has_unresolved_blockers")
            value = {"format_version": 1, "status": "draft_awaiting_final_owner_approval", "final_approval_given": False,
                     "canonical_review_sha256": self.revision, "candidate_sha256": self.candidate_sha,
                     "source_input_sha256": self.review["source_input_sha256"], "submitted_by": request.reviewer_id.strip(),
                     "submitted_at": datetime.now(timezone.utc).isoformat(), "records": list(self.draft.values()),
                     "group_decisions": self.group_decisions, "quarantine_proposed": self.quarantine_proposed,
                     "proposed_quarantine_groups": sorted(self.conflict_ids), "effect": self.effect()}
            payload = json_bytes(value)
            # A separate immutable, text-free draft is reviewable before approval.
            # Canonical review, source corpus and manifests remain unchanged.
            destination = self.store.path.with_name(f"review.approval-draft-{digest(payload)[:16]}.json")
            if destination.exists():
                if read_bytes(destination) != payload:
                    raise ReviewError("draft_content_conflict", 409)
            else:
                temp_name = None
                try:
                    with tempfile.NamedTemporaryFile(dir=destination.parent, prefix=".validation-draft-", delete=False) as stream:
                        temp_name = stream.name
                        stream.write(payload); stream.flush(); os.fsync(stream.fileno())
                    os.link(temp_name, destination)
                    directory_fd = os.open(destination.parent, os.O_RDONLY)
                    try:
                        os.fsync(directory_fd)
                    finally:
                        os.close(directory_fd)
                finally:
                    if temp_name and os.path.exists(temp_name):
                        os.unlink(temp_name)
            self.submitted_revision = digest(payload)
            return {"draft_file": str(destination), "draft_sha256": self.submitted_revision, "view": self.view(),
                    "message": "Draft submitted for separate final approval. Canonical review and split are unchanged."}
