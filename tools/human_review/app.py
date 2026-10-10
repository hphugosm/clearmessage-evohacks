"""Local human decisions, plain-text display, optimistic locking and atomic saves."""
from __future__ import annotations

import copy
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import tempfile
from threading import Lock
from typing import Literal
from datetime import date, datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ConfigDict, Field
from starlette.responses import FileResponse, JSONResponse

ROOT = Path(__file__).resolve().parents[2]
STATIC = Path(__file__).parent / "static"
DEFAULT_REVIEW = ROOT / "ml/data/mendeley-v1-audit-v2/review.completed.json"
LABELS = ("ham", "spam", "smishing")
MARKER = "ClearMessage human review tool: "
MAX_BYTES = 16 * 1024 * 1024


class ReviewError(Exception):
    def __init__(self, code: str, status: int = 400):
        self.code, self.status = code, status


def sha(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def read_bytes(path: Path) -> bytes:
    with path.open("rb") as stream:
        payload = stream.read(MAX_BYTES + 1)
    if len(payload) > MAX_BYTES:
        raise ReviewError("file_size_limit")
    return payload


def read_review(path: Path) -> tuple[dict, bytes]:
    payload = read_bytes(path)
    value = json.loads(payload)
    required = {"row_id", "source_label", "decision", "language", "reviewer_id", "reviewed_date", "notes"}
    if not isinstance(value, dict) or not isinstance(value.get("records"), list) or not value["records"]:
        raise ReviewError("invalid_review_file")
    ids = set()
    for row in value["records"]:
        if (not isinstance(row, dict) or not required <= row.keys()
                or any(not isinstance(row[key], str) for key in required)
                or not re.fullmatch(r"[a-zA-Z0-9_-]{1,100}", row["row_id"])
                or row["source_label"] not in LABELS or row["decision"] not in ("pending", "confirmed", "disagreed")
                or row["row_id"] in ids):
            raise ReviewError("invalid_review_record")
        ids.add(row["row_id"])
    return value, payload


def annotation(row: dict) -> dict:
    for line in reversed(row["notes"].splitlines()):
        if line.startswith(MARKER):
            try:
                item = json.loads(line[len(MARKER):])
                if isinstance(item, dict) and item.get("version") == 1:
                    return item
            except ValueError:
                pass
    return {}


def summary(row: dict) -> dict:
    meta = annotation(row)
    target = meta.get("requested_label")
    if target not in LABELS:
        old = re.search(r"requested_label=(ham|spam|smishing)\b", row["notes"])
        target = old.group(1) if old else None
    if meta.get("action") in ("propose_exclusion", "approve_exclusion"):
        state = "exclusion_approved" if meta.get("action") == "approve_exclusion" else "proposed_exclusion"
        target = None
    elif row["decision"] == "confirmed":
        state, target = "approved", row["source_label"]
    elif row["decision"] == "disagreed":
        state = "corrected" if target and target != row["source_label"] else "pending"
    else:
        state = "unsure" if meta.get("action") == "unsure" else "pending"
        target = None
    return {"row_id": row["row_id"], "source_label": row["source_label"], "state": state,
            "requested_label": target, "decision": row["decision"], "language": row["language"],
            "tool_action": meta.get("action", ""),
            "reviewer_id": row["reviewer_id"], "reviewed_date": row["reviewed_date"],
            "exclusion_approved_by": meta.get("exclusion_approved_by", ""),
            "exclusion_approved_date": meta.get("exclusion_approved_date", ""),
            "exclusion_reason": meta.get("reason", "") if "exclusion" in state else ""}


def counters(records: list[dict]) -> dict:
    states = [summary(row)["state"] for row in records]
    return {"total": len(states), "approved": states.count("approved"), "corrected": states.count("corrected"),
            "pending": sum(s in ("pending", "unsure") for s in states),
            "proposed_exclusions": states.count("proposed_exclusion"), "approved_exclusions": states.count("exclusion_approved")}


Action = Literal["accept", "ham", "spam", "smishing", "propose_exclusion", "unsure", "approve_exclusion"]


class Change(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    row_id: str = Field(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
    action: Action
    language: Literal["pending", "en", "cs", "other", "und"] | None = None
    reason: str = Field(default="", max_length=500)


class Save(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    revision: str = Field(pattern=r"^[a-f0-9]{64}$")
    reviewer_id: str = Field(min_length=1, max_length=80, pattern=r"^[a-zA-Z0-9][a-zA-Z0-9 ._-]*$")
    reviewed_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    changes: list[Change] = Field(min_length=1, max_length=1000)
    reviewed_ids: list[str] = Field(default_factory=list, max_length=1000)
    bulk_ids: list[str] = Field(default_factory=list, max_length=1000)
    bulk_confirmed: bool = False
    exclusions_confirmed: bool = False


class ReviewStore:
    def __init__(self, path: Path, records_path: Path, suggestions: bool = True):
        # Do not follow a review-file symlink: replacing it would replace the link.
        if path.is_symlink():
            raise ReviewError("review_symlink_not_supported")
        self.path = path.absolute()
        self.initial, self.initial_bytes = read_review(self.path)
        self.lock = Lock()
        self.token = secrets.token_urlsafe(32)
        self.texts = {}
        self.suggestions = {}
        selected = {r["row_id"]: r for r in self.initial["records"]}
        with records_path.open("rb") as stream:
            consumed = 0
            for line in stream:
                consumed += len(line)
                if consumed > MAX_BYTES or len(line) > 100000:
                    raise ReviewError("records_size_limit")
                row = json.loads(line)
                if row.get("row_id") not in selected:
                    continue
                if (row["row_id"] in self.texts or row.get("label") != selected[row["row_id"]]["source_label"]
                        or not isinstance(row.get("text"), str) or len(row["text"]) > 20000):
                    raise ReviewError("records_review_mismatch")
                self.texts[row["row_id"]] = row["text"]
        if self.texts.keys() != selected.keys():
            raise ReviewError("review_messages_missing")
        self.suggestion_status = "Suggestions disabled or unavailable; no label inferred."
        if suggestions:
            self.load_suggestions()

    def load_suggestions(self):
        try:
            from ml.sparse_model import SparseModel
            config = json.loads((ROOT / "backend/model-config.json").read_bytes())
            model = SparseModel(ROOT / config["artifact_path"], config["sha256"])
            ids = [key for key, value in self.texts.items() if value.strip() and len(value) <= 2000]
            predicted = model.predict([self.texts[key] for key in ids]) if ids else []
            self.suggestions = dict(zip(ids, map(str, predicted)))
            self.suggestion_status = (
                "Existing provisional TF-IDF classifier, hash verified. These audit samples were reserved for training; "
                "suggestions may reflect training overlap. Language performance is unverified. Suggestions are not ground truth.")
        except Exception:
            # No runtime downloads, keyword fallback or foreign exception details.
            self.suggestions = {}

    def view(self):
        current, payload = read_review(self.path)
        if [(r["row_id"], r["source_label"]) for r in current["records"]] != [
                (r["row_id"], r["source_label"]) for r in self.initial["records"]]:
            raise ReviewError("review_structure_changed_restart_required", 409)
        return {"revision": sha(payload), "csrf_token": self.token, "review_file": str(self.path),
                "suggestion_status": self.suggestion_status, "counters": counters(current["records"]),
                "records": [{**summary(row), "text": self.texts[row["row_id"]], "notes": row["notes"],
                             "suggested_label": self.suggestions.get(row["row_id"])} for row in current["records"]]}

    def report(self):
        current, payload = read_review(self.path)
        before = {r["row_id"]: summary(r) for r in self.initial["records"]}
        changes = [{"row_id": r["row_id"], "before": before.get(r["row_id"]), "after": summary(r)}
                   for r in current["records"] if before.get(r["row_id"]) != summary(r)]
        counts = counters(current["records"])
        pending = [r["row_id"] for r in current["records"] if summary(r)["state"] in ("pending", "unsure")]
        missing_languages = [r["row_id"] for r in current["records"] if r["language"] not in ("en", "cs", "other", "und")]
        missing_attribution = [r["row_id"] for r in current["records"] if not r["reviewer_id"].strip() or not r["reviewed_date"].strip()]
        return {"revision": sha(payload), "counters": counts, "changes_since_server_start": changes,
                "decisions": [summary(r) for r in current["records"]], "pending_ids": pending,
                "any_entries_pending": bool(pending or counts["proposed_exclusions"]),
                "missing_language_ids": missing_languages, "missing_attribution_ids": missing_attribution,
                "dataset_exclusions_approved": bool(current.get("exclusions_approved_by", "").strip()),
                "goal01_complete": False, "split_frozen": False, "training_started": False,
                "limitations": "Label changes and approved exclusion proposals still need separate pipeline reconciliation. "
                "Existing dataset conflict exclusions require their own approval. This tool does not freeze splits or train."}

    def save(self, request: Save):
        try:
            date.fromisoformat(request.reviewed_date)
        except ValueError:
            raise ReviewError("invalid_review_date") from None
        if not request.reviewer_id.strip():
            raise ReviewError("reviewer_required")
        ids = [change.row_id for change in request.changes]
        if len(ids) != len(set(ids)):
            raise ReviewError("duplicate_change")
        if request.bulk_ids and (not request.bulk_confirmed or not set(request.bulk_ids) <= set(request.reviewed_ids)):
            raise ReviewError("bulk_human_confirmation_required")
        if not set(request.bulk_ids) <= set(ids):
            raise ReviewError("invalid_bulk_selection")
        if any(change.action == "approve_exclusion" for change in request.changes) and not request.exclusions_confirmed:
            raise ReviewError("separate_exclusion_confirmation_required")
        # A stable separate lock coordinates independent processes using this tool.
        with self.lock, self.path.with_name(self.path.name + ".lock").open("a+b") as file_lock:
            fcntl.flock(file_lock, fcntl.LOCK_EX)
            current, original = read_review(self.path)
            if sha(original) != request.revision:
                raise ReviewError("file_changed_reload_before_saving", 409)
            result = copy.deepcopy(current)
            rows = {r["row_id"]: r for r in result["records"]}
            for change in request.changes:
                if change.row_id not in rows:
                    raise ReviewError("unknown_entry")
                row = rows[change.row_id]
                if change.row_id in request.bulk_ids and (change.action != "accept" or summary(row)["state"] not in ("pending", "unsure")):
                    raise ReviewError("bulk_requires_pending_reviewed_entries")
                meta = {"version": 1, "action": change.action}
                if change.action == "approve_exclusion":
                    if summary(row)["state"] != "proposed_exclusion":
                        raise ReviewError("propose_exclusion_before_approval")
                    meta.update(annotation(row), action="approve_exclusion",
                                exclusion_approved_by=request.reviewer_id.strip(), exclusion_approved_date=request.reviewed_date)
                    row["decision"] = "disagreed"
                elif change.action in ("propose_exclusion", "unsure"):
                    if change.action == "propose_exclusion" and not change.reason.strip():
                        raise ReviewError("exclusion_reason_required")
                    meta["reason"] = change.reason.strip()
                    row["decision"] = "disagreed" if change.action == "propose_exclusion" else "pending"
                else:
                    target = row["source_label"] if change.action == "accept" else change.action
                    meta["requested_label"] = target
                    row["decision"] = "confirmed" if target == row["source_label"] else "disagreed"
                # Preserve all previous notes and unknown schema metadata.
                existing = "\n".join(line for line in row["notes"].splitlines() if not line.startswith(MARKER))
                row["notes"] = (existing + "\n" if existing else "") + MARKER + json.dumps(meta, sort_keys=True, ensure_ascii=True)
                row["reviewer_id"], row["reviewed_date"] = request.reviewer_id.strip(), request.reviewed_date
                if change.language is not None:
                    row["language"] = change.language
            payload = (json.dumps(result, ensure_ascii=True, indent=2, sort_keys=True) + "\n").encode()
            if len(payload) > MAX_BYTES:
                raise ReviewError("file_size_limit")
            backup = self.atomic_write(original, payload)
        return {"backup_file": str(backup), "view": self.view(), "report": self.report()}

    def atomic_write(self, original: bytes, payload: bytes) -> Path:
        # Backup succeeds and is fsynced before replacement. Never overwrite backups.
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        backup = self.path.with_name(f"{self.path.name}.backup-{stamp}-{secrets.token_hex(4)}.json")
        fd = os.open(backup, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "wb") as stream:
            stream.write(original)
            stream.flush()
            os.fsync(stream.fileno())
        directory_fd = os.open(self.path.parent, os.O_RDONLY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
        temp_name = None
        try:
            with tempfile.NamedTemporaryFile(dir=self.path.parent, prefix=".review-save-", delete=False) as stream:
                temp_name = stream.name
                os.fchmod(stream.fileno(), self.path.stat().st_mode & 0o777)
                stream.write(payload)
                stream.flush()
                os.fsync(stream.fileno())
            # Also detect ordinary edits made outside the cooperating tool lock.
            if self.path.is_symlink() or read_bytes(self.path) != original:
                raise ReviewError("file_changed_reload_before_saving", 409)
            os.replace(temp_name, self.path)
            directory_fd = os.open(self.path.parent, os.O_RDONLY)
            try:
                os.fsync(directory_fd)
            finally:
                os.close(directory_fd)
        finally:
            if temp_name and os.path.exists(temp_name):
                os.unlink(temp_name)
        return backup


def create_app(review_path: Path = DEFAULT_REVIEW, records_path: Path | None = None,
               *, port: int = 8765, suggestions: bool = True, validation_hints: Path | None = None,
               source_path: Path | None = None, candidate_path: Path | None = None):
    store = ReviewStore(review_path, records_path or review_path.parent / "records.jsonl", suggestions and validation_hints is None)
    origin = f"http://127.0.0.1:{port}"
    api = FastAPI(title="ClearMessage human review tool", docs_url=None, redoc_url=None, openapi_url=None,
                  telemetry={"tracing": False, "metrics": False, "logs": False, "operation_spans": False, "auto_configure": False})
    api.state.store = store
    workspace = None
    if validation_hints is not None:
        from tools.human_review.validation import ValidationWorkspace, Stage, Submit
        workspace = ValidationWorkspace(store, source_path or ROOT / "ml/data/raw/Dataset_5971.zip",
                                        candidate_path or ROOT / "ml/manifests/mendeley-v1.split.candidate.json", validation_hints)
        api.state.workspace = workspace
        api.add_api_route("/api/validation", workspace.view, methods=["GET"])
        # Resolve request model annotations without importing the optional workflow
        # into the production service or relying on local annotation names.
        def stage(body):
            return workspace.stage(body)
        def submit(body):
            return workspace.submit(body)
        stage.__annotations__["body"] = Stage
        submit.__annotations__["body"] = Submit
        api.add_api_route("/api/validation/stage", stage, methods=["POST"])
        api.add_api_route("/api/validation/submit", submit, methods=["POST"])

    @api.exception_handler(RequestValidationError)
    async def invalid_input(_request, _error):
        return JSONResponse({"error": "invalid_request"}, status_code=422)

    @api.exception_handler(ReviewError)
    async def review_error(_request, error):
        return JSONResponse({"error": error.code}, status_code=error.status)

    @api.get("/")
    def index():
        return FileResponse(STATIC / ("validation.html" if workspace else "index.html"))

    for url, path, media in (("/app.js", STATIC / "app.js", "text/javascript"),
                             ("/validation.js", STATIC / "validation.js", "text/javascript"),
                             ("/style.css", STATIC / "style.css", "text/css"),
                             ("/tokens.css", ROOT / "frontend/src/brand-tokens.css", "text/css")):
        # Default path values are fixed internally, never exposed as query parameters.
        def route_factory(file, mime):
            def serve_asset():
                return FileResponse(file, media_type=mime)
            return serve_asset
        api.add_api_route(url, route_factory(path, media), methods=["GET"])

    @api.get("/api/review")
    def view():
        return store.view()

    @api.get("/api/report")
    def report():
        return store.report()

    @api.post("/api/save")
    def save(body: Save):
        if workspace is not None:
            raise ReviewError("canonical_save_requires_separate_final_approval", 403)
        return store.save(body)

    # Outer ASGI boundary: body bounds, DNS-rebinding/CSRF defense and no foreign
    # exception logging. No CORS, access logs, telemetry or remote static assets.
    class LocalBoundary:
        state = api.state

        async def __call__(self, scope, receive, send):
            if scope["type"] != "http":
                return await api(scope, receive, send)
            headers = dict(scope["headers"])
            async def secured_send(event):
                if event["type"] == "http.response.start":
                    event["headers"].extend([
                        (b"cache-control", b"no-store"), (b"x-content-type-options", b"nosniff"),
                        (b"referrer-policy", b"no-referrer"), (b"x-frame-options", b"DENY"),
                        (b"content-security-policy", b"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")])
                await send(event)
            async def reject(code, status):
                await JSONResponse({"error": code}, status_code=status)(scope, receive, secured_send)
            if headers.get(b"host", b"").decode("latin1") != f"127.0.0.1:{port}":
                return await reject("loopback_host_required", 403)
            if headers.get(b"sec-fetch-site") in (b"cross-site", b"same-site") or scope.get("query_string"):
                return await reject("request_rejected", 403)
            if scope["method"] not in ("GET", "HEAD", "POST"):
                return await reject("method_not_allowed", 405)
            if scope["method"] == "POST":
                if (headers.get(b"origin", b"").decode("latin1") != origin
                        or not secrets.compare_digest(headers.get(b"x-review-token", b""), store.token.encode())):
                    return await reject("human_session_required", 403)
                if headers.get(b"content-type", b"").split(b";")[0] != b"application/json":
                    return await reject("json_required", 415)
                body = bytearray()
                while True:
                    event = await receive()
                    if event["type"] == "http.disconnect":
                        return
                    body.extend(event.get("body", b""))
                    if len(body) > 1024 * 1024:
                        return await reject("request_size_limit", 413)
                    if not event.get("more_body", False):
                        break
                delivered = False
                async def bounded_receive():
                    nonlocal delivered
                    if not delivered:
                        delivered = True
                        return {"type": "http.request", "body": bytes(body), "more_body": False}
                    return await receive()
                receiver = bounded_receive
            else:
                receiver = receive
            started = False
            async def track_send(event):
                nonlocal started
                if event["type"] == "http.response.start":
                    started = True
                await secured_send(event)
            try:
                await api(scope, receiver, track_send)
            except Exception:
                if not started:
                    await reject("local_operation_failed", 500)
    return LocalBoundary()
