"""Bounded, offline CSV import, conservative grouping and immutable splits.

No training, corpus code execution, link expansion or learned preprocessing.
Public manifests contain hashes/IDs only; message text stays in ignored ml/data.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import math
import re
import sys
import unicodedata
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from difflib import SequenceMatcher
from itertools import combinations
from pathlib import Path, PurePosixPath

LABELS = ("ham", "spam", "smishing")
SPLITS = ("train", "validation", "test")
RATIOS = (0.70, 0.15, 0.15)
SEED = 20261010
VERSION = "data-prep-v1"
MAX_BYTES = 16 * 1024 * 1024
MAX_ROWS = 20000
MAX_TEXT = 20000
MAX_CANDIDATES = 2_000_000
JACCARD = 0.85
CHAR_SIMILARITY = 0.90
SOURCE = json.loads((Path(__file__).parent / "sources/mendeley-v1.json").read_text())


class DataError(ValueError):
    """Fixed diagnostic codes, never source content or foreign exception text."""


def digest(value: bytes | str) -> str:
    return hashlib.sha256(value.encode("utf-8") if isinstance(value, str) else value).hexdigest()


def json_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=True, sort_keys=True, indent=2) + "\n").encode()


def normalized(text: str) -> str:
    return " ".join(unicodedata.normalize("NFKC", text).casefold().split())


# These patterns are grouping heuristics, not phishing detectors or URL parsers.
CONTACT = re.compile(
    r"(?:https?://|www\.)[^\s<>]+|[\w.+-]+@[\w.-]+|"
    r"\b(?:[\w-]+\.)+[a-z]{2,63}(?:/[^\s<>]*)?", re.I
)
NUMBER = re.compile(r"\d+(?:[ .:+/-]\d+)*")


def template(text: str) -> str | None:
    result = NUMBER.sub(" <number> ", CONTACT.sub(" <contact> ", normalized(text)))
    result = " ".join(result.split())
    # Avoid merging short, generic replies; exact/near duplicates still apply.
    words = re.findall(r"\w+", re.sub(r"<[^>]+>", "", result))
    return result if "<" in result and len(words) >= 5 and len(result) >= 30 else None


def script_hint(text: str) -> str:
    """Script coverage is not a language detector. Latin texts remain unknown."""
    scripts = set()
    letters = 0
    for char in text:
        if not char.isalpha():
            continue
        letters += 1
        name = unicodedata.name(char, "UNKNOWN")
        scripts.add("latin" if "LATIN" in name else "non_latin")
    if letters < 10:
        return "too_short_unknown"
    if len(scripts) > 1:
        return "mixed_unknown"
    return "latin_unknown" if scripts == {"latin"} else "non_latin_unknown"


def review_text(text: str) -> str:
    """Plain text only. Break links, escape markup/bidi/control characters."""
    out = []
    for char in text:
        if char in ".:/@\\":
            out.append({".": "[dot]", ":": "[colon]", "/": "[slash]", "@": "[at]", "\\": "[backslash]"}[char])
        elif char in "<>" or unicodedata.category(char).startswith("C"):
            out.append(f"[U+{ord(char):04X}]")
        else:
            out.append(char)
    return "".join(out)


def bounded_read(path: Path) -> bytes:
    with path.open("rb") as stream:
        value = stream.read(MAX_BYTES + 1)
    if len(value) > MAX_BYTES:
        raise DataError("input_size_limit")
    return value


def read_input(path: Path, member: str | None, encoding: str) -> tuple[bytes, dict]:
    payload = bounded_read(path)
    provenance = {"input_sha256": digest(payload), "input_bytes": len(payload), "csv_member": None, "encoding": encoding}
    if path.suffix.casefold() == ".zip":
        try:
            with zipfile.ZipFile(io.BytesIO(payload)) as archive:
                entries = archive.infolist()
                if len(entries) > 100:
                    raise DataError("archive_entry_limit")
                for entry in entries:
                    parts = PurePosixPath(entry.filename)
                    if parts.is_absolute() or ".." in parts.parts or "\\" in entry.filename:
                        raise DataError("archive_unsafe_path")
                    if (entry.external_attr >> 16) & 0o170000 == 0o120000 or entry.flag_bits & 1:
                        raise DataError("archive_unsupported_entry")
                candidates = [item for item in entries if item.filename.casefold().endswith(".csv") and not item.is_dir()]
                if member is None:
                    if len(candidates) != 1:
                        raise DataError("archive_select_csv_member")
                    entry = candidates[0]
                else:
                    matches = [item for item in candidates if item.filename == member]
                    if len(matches) != 1:
                        raise DataError("archive_csv_member_missing")
                    entry = matches[0]
                if entry.file_size > MAX_BYTES or entry.file_size > max(1, entry.compress_size) * 200:
                    raise DataError("archive_expansion_limit")
                with archive.open(entry) as stream:
                    payload = stream.read(MAX_BYTES + 1)
                if len(payload) > MAX_BYTES:
                    raise DataError("archive_expansion_limit")
                provenance["csv_member"] = entry.filename
        except (zipfile.BadZipFile, RuntimeError, NotImplementedError):
            raise DataError("invalid_archive") from None
    elif path.suffix.casefold() != ".csv" or member is not None:
        raise DataError("input_requires_csv_or_zip")
    provenance["csv_sha256"] = digest(payload)
    return payload, provenance


@dataclass(frozen=True)
class Row:
    row_id: str
    ordinal: int
    text: str
    label: str
    text_hash: str
    normal_hash: str
    template_hash: str | None
    script: str


def import_rows(payload: bytes, encoding: str) -> tuple[list[Row], dict]:
    if encoding not in ("utf-8-sig", "cp1252"):
        raise DataError("unsupported_encoding")
    try:
        text = payload.decode(encoding, errors="strict")
    except UnicodeError:
        raise DataError("csv_encoding_error") from None
    csv.field_size_limit(MAX_BYTES)
    rows = []
    counts: Counter = Counter()
    raw_label_counts: Counter = Counter()
    excluded = []
    missing: Counter = Counter()
    missing_markers: Counter = Counter()
    invalid_indicators: Counter = Counter()
    try:
        reader = csv.DictReader(io.StringIO(text, newline=""), strict=True)
        headers = reader.fieldnames
        if not headers or len(set(headers)) != len(headers) or not {"LABEL", "TEXT"}.issubset(headers):
            raise DataError("csv_required_headers")
        # These are only metadata columns; no URL/EMAIL/PHONE attribute is a label.
        for ordinal, record in enumerate(reader, 1):
            if ordinal > MAX_ROWS:
                raise DataError("row_limit")
            if None in record or any(value is None for value in record.values()):
                raise DataError("csv_column_count")
            counts["raw_rows"] += 1
            for key, value in record.items():
                if not value.strip():
                    missing[key] += 1
                elif value.strip().casefold() in ("na", "n/a", "nan", "null", "none"):
                    missing_markers[key] += 1
            for key in ("URL", "EMAIL", "PHONE"):
                if key in record and record[key].strip() not in ("", "0", "1"):
                    invalid_indicators[key] += 1
            label = record["LABEL"].strip().casefold()
            # Do not publish unknown label values: they can contain arbitrary text.
            raw_label_counts[label if label in LABELS else "missing" if not label else "unknown"] += 1
            body = record["TEXT"]
            reason = ("missing_label" if not label else "unknown_label" if label not in LABELS
                      else "missing_text" if not body.strip() else "text_size_limit" if len(body) > MAX_TEXT else None)
            if reason:
                counts[reason] += 1
                excluded.append({"ordinal": ordinal, "reason": reason})
                continue
            normal = normalized(body)
            skeleton = template(body)
            rows.append(Row(f"row-{ordinal:06d}", ordinal, body, label, digest(body), digest(normal),
                            digest(skeleton) if skeleton else None, script_hint(body)))
    except csv.Error:
        raise DataError("malformed_csv") from None
    if not counts["raw_rows"]:
        raise DataError("empty_csv")
    return rows, {"counts": dict(counts), "source_label_counts": dict(raw_label_counts),
                  "missing_by_column": dict(missing), "suspected_missing_markers_by_column": dict(missing_markers),
                  "nonbinary_indicator_counts": dict(invalid_indicators), "headers": headers, "excluded": excluded}


def group_rows(rows: list[Row], families: dict[str, str] | None = None) -> tuple[dict[str, str], dict]:
    """Union exact, template, conservative near-copy and curated family edges."""
    parent = list(range(len(rows)))
    edges: Counter = Counter()

    def find(index):
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(left, right, kind):
        left, right = find(left), find(right)
        if left != right:
            parent[max(left, right)] = min(left, right)
            edges[kind] += 1

    known = {row.row_id for row in rows}
    families = families or {}
    if set(families) - known or any(not isinstance(v, str) or not v.strip() for v in families.values()):
        raise DataError("invalid_family_mapping")
    for attr, kind in (("normal_hash", "normalized_duplicate"), ("template_hash", "template")):
        seen = {}
        for index, row in enumerate(rows):
            value = getattr(row, attr)
            if value is not None:
                if value in seen:
                    union(index, seen[value], kind)
                else:
                    seen[value] = index
    seen_families = {}
    for index, row in enumerate(rows):
        if row.row_id in families:
            family = families[row.row_id]
            if family in seen_families:
                union(index, seen_families[family], "curated_family")
            else:
                seen_families[family] = index

    # Prefix filtering for token-set Jaccard, using a single global order.
    # Frequencies are used solely to find grouping candidates, never as features.
    tokens = [set(re.findall(r"\w+", normalized(row.text))) for row in rows]
    frequency = Counter(token for values in tokens for token in values)
    index_by_token = defaultdict(list)
    candidates = set()
    for index, values in enumerate(tokens):
        prefix = sorted(values, key=lambda token: (frequency[token], token))[:len(values) - math.ceil(JACCARD * len(values)) + 1]
        for token in prefix:
            for other in index_by_token[token]:
                candidates.add((other, index))
                if len(candidates) > MAX_CANDIDATES:
                    raise DataError("near_copy_candidate_limit")
            index_by_token[token].append(index)
    for left, right in sorted(candidates):
        if find(left) == find(right):
            continue
        a, b = tokens[left], tokens[right]
        if not a or len(a & b) / len(a | b) < JACCARD:
            continue
        x, y = normalized(rows[left].text), normalized(rows[right].text)
        if min(len(x), len(y)) / max(len(x), len(y)) < CHAR_SIMILARITY:
            continue
        if SequenceMatcher(None, x, y, autojunk=False).ratio() >= CHAR_SIMILARITY:
            union(left, right, "near_copy")
    groups = defaultdict(list)
    for index, row in enumerate(rows):
        groups[find(index)].append(row.row_id)
    names = {root: "group-" + digest("\n".join(sorted(ids)))[:24] for root, ids in groups.items()}
    mapping = {row.row_id: names[find(index)] for index, row in enumerate(rows)}
    return mapping, {"groups": len(groups), "group_size_histogram": dict(Counter(len(ids) for ids in groups.values())),
                     "union_edges": dict(edges), "near_copy_candidates": len(candidates)}


def audit(rows: list[Row], mapping: dict, imported: dict, grouping: dict) -> tuple[dict, list[Row], dict]:
    group_labels = defaultdict(set)
    for row in rows:
        group_labels[mapping[row.row_id]].add(row.label)
    conflicts = sorted(group for group, labels in group_labels.items() if len(labels) > 1)
    conflict_set = set(conflicts)
    eligible = [row for row in rows if mapping[row.row_id] not in conflict_set]
    normalized_counts = Counter(row.normal_hash for row in rows)
    sample = {}
    for label in LABELS:
        pool = [row for row in eligible if row.label == label]
        pool.sort(key=lambda row: digest(f"{SEED}/{row.row_id}/{row.text_hash}"))
        sample[label] = [row.row_id for row in pool[:15]]
    report = {"pipeline_version": VERSION, **imported, "grouping": grouping,
              "accepted_counts": dict(Counter(row.label for row in rows)),
              "eligible_counts": dict(Counter(row.label for row in eligible)),
              "normalized_duplicate_extra_rows": sum(size - 1 for size in normalized_counts.values()),
              "conflicting_groups": conflicts, "conflict_rows_excluded": len(rows) - len(eligible),
              "script_counts": dict(Counter(row.script for row in rows)),
              "language_counts": {"unverified": len(rows)}, "human_review_sample": sample,
              "human_review_status": "pending", "training_ready": False,
              "time_campaign_split": "unavailable: source description lacks per-row timestamps/campaign IDs; header names do not establish semantics"}
    selected = {row_id for ids in sample.values() for row_id in ids}
    review = {"pipeline_version": VERSION, "source_input_sha256": None, "exclusions_approved_by": "",
              "records": [{"row_id": row.row_id, "source_label": row.label, "decision": "pending", "language": "pending",
                           "reviewer_id": "", "reviewed_date": "", "notes": ""}
                          for row in rows if row.row_id in selected]}
    return report, eligible, review


def verify_review(review: dict, expected: dict, report: dict) -> list[str]:
    if review.get("source_input_sha256") != expected["source_input_sha256"] or review.get("pipeline_version") != VERSION:
        raise DataError("review_source_mismatch")
    expected_records = {item["row_id"]: item for item in expected["records"]}
    records = review.get("records", [])
    if not isinstance(records, list) or any(not isinstance(item, dict) for item in records):
        raise DataError("invalid_review")
    if len(records) != 45 or len(expected_records) != 45 or {item.get("row_id") for item in records} != set(expected_records):
        raise DataError("review_requires_15_per_class")
    languages = []
    for item in records:
        expected_label = expected_records[item["row_id"]]["source_label"]
        if item.get("source_label") != expected_label or item.get("decision") != "confirmed":
            raise DataError("human_label_review_pending_or_disagreed")
        if item.get("language") not in ("en", "cs", "other", "und"):
            raise DataError("human_language_review_pending")
        if not isinstance(item.get("reviewer_id"), str) or not item["reviewer_id"].strip() or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", item.get("reviewed_date", "")):
            raise DataError("human_review_attribution_missing")
        languages.append(item["language"])
    if report["counts"].get("missing_label", 0) or report["counts"].get("unknown_label", 0):
        raise DataError("unmapped_labels_block_freeze")
    if report["suspected_missing_markers_by_column"] and not str(review.get("exclusions_approved_by", "")).strip():
        raise DataError("missing_marker_audit_needs_human_approval")
    excluded = len(report["excluded"]) + report["conflict_rows_excluded"]
    if excluded and not str(review.get("exclusions_approved_by", "")).strip():
        raise DataError("exclusions_need_human_approval")
    return languages


def split_rows(rows: list[Row], mapping: dict, reviewed_ids: set[str]) -> tuple[list[dict], dict]:
    grouped = defaultdict(list)
    for row in rows:
        grouped[mapping[row.row_id]].append(row)
    assigned = {}
    counts = {split: Counter() for split in SPLITS}
    for label in LABELS:
        groups = [group for group, members in grouped.items() if members[0].label == label]
        if any(len({row.label for row in grouped[group]}) != 1 for group in groups):
            raise DataError("split_mixed_label_group")
        forced = [group for group in groups if any(row.row_id in reviewed_ids for row in grouped[group])]
        remaining = [group for group in groups if group not in forced]
        if len(remaining) < 2:
            raise DataError("insufficient_unreviewed_groups")
        total = sum(len(grouped[group]) for group in groups)
        target = dict(zip(SPLITS, (total * ratio for ratio in RATIOS)))
        for group in forced:
            assigned[group] = "train"
            counts["train"][label] += len(grouped[group])
        remaining.sort(key=lambda group: (-len(grouped[group]), digest(f"{SEED}/{group}")))
        for offset, group in enumerate(remaining):
            empty = [split for split in ("validation", "test") if not counts[split][label]]
            choices = empty if len(remaining) - offset <= len(empty) else SPLITS
            size = len(grouped[group])
            # Choose the assignment with the smallest squared quota error.
            split = min(choices, key=lambda candidate: (
                sum((counts[other][label] + (size if other == candidate else 0) - target[other]) ** 2 for other in SPLITS),
                SPLITS.index(candidate)))
            assigned[group] = split
            counts[split][label] += size
        if any(abs(counts[split][label] / total - RATIOS[index]) > 0.10 for index, split in enumerate(SPLITS)):
            raise DataError("split_ratio_deviation_over_10_percentage_points")
    records = [{"row_id": row.row_id, "group_id": mapping[row.row_id], "label": row.label,
                "text_sha256": row.text_hash, "normalized_sha256": row.normal_hash,
                "template_sha256": row.template_hash, "split": assigned[mapping[row.row_id]]} for row in rows]
    return records, {split: dict(counts[split]) for split in SPLITS}


def assert_no_leakage(records: list[dict]) -> dict:
    result = {}
    seen_rows = set()
    for record in records:
        if record["split"] not in SPLITS or record["label"] not in LABELS or record["row_id"] in seen_rows:
            raise DataError("invalid_split_record")
        seen_rows.add(record["row_id"])
    for field in ("row_id", "group_id", "text_sha256", "normalized_sha256", "template_sha256"):
        sets = {split: {item[field] for item in records if item["split"] == split and item[field] is not None} for split in SPLITS}
        overlaps = sorted(set().union(*(sets[left] & sets[right] for left, right in combinations(SPLITS, 2))))
        if overlaps:
            raise DataError("cross_split_leakage")
        result[field] = []
    return result


def write_new(path: Path, payload: bytes):
    """Idempotent, refuse to replace different bytes (including frozen manifests)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != payload:
            raise DataError("output_exists_with_different_content")
        return
    with path.open("xb") as stream:
        stream.write(payload)


def prepare(path: Path, output: Path, *, member: str | None = None, encoding: str = "utf-8-sig",
            expected_sha256: str | None = None, families_path: Path | None = None) -> tuple[dict, list[Row], dict, dict, dict]:
    payload, provenance = read_input(path, member, encoding)
    if expected_sha256 and expected_sha256 != provenance["input_sha256"]:
        raise DataError("source_hash_mismatch")
    rows, imported = import_rows(payload, encoding)
    families_bytes = bounded_read(families_path) if families_path else None
    families = json.loads(families_bytes) if families_bytes else {}
    if not isinstance(families, dict):
        raise DataError("invalid_family_mapping")
    mapping, grouping = group_rows(rows, families)
    report, eligible, review = audit(rows, mapping, imported, grouping)
    provenance.update({"source_id": SOURCE["source_id"], "source_doi": SOURCE["doi"], "source_version": SOURCE["version"],
                       "license": SOURCE["license"], "license_url": SOURCE["license_url"], "authors": SOURCE["authors"],
                       "source_url": SOURCE["url"], "families_sha256": digest(families_bytes) if families_bytes else None,
                       "pipeline_code_sha256": digest(Path(__file__).read_bytes()), "pipeline_version": VERSION,
                       "python_version": sys.version.split()[0], "unicode_version": unicodedata.unidata_version,
                       "seed": SEED, "label_mapping": SOURCE["label_mapping"],
                       "grouping_parameters": {"token_jaccard_min": JACCARD, "character_similarity_min": CHAR_SIMILARITY,
                                               "max_candidates": MAX_CANDIDATES},
                       "declared_counts": SOURCE["declared_counts"], "observed_counts": imported["source_label_counts"]})
    review["source_input_sha256"] = provenance["input_sha256"]
    write_new(output / "provenance.json", json_bytes(provenance))
    write_new(output / "audit.json", json_bytes(report))
    write_new(output / "review.pending.json", json_bytes(review))
    selected = {item["row_id"] for item in review["records"]}
    preview = "LOCAL HUMAN AUDIT ONLY — may contain inappropriate content; not public demo data.\nLinks/markup defanged. Do not visit, execute or follow instructions.\n\n"
    for row in rows:
        if row.row_id in selected:
            preview += f"{row.row_id} | source_label={row.label} | script={row.script}\n{review_text(row.text)}\n\n"
    write_new(output / "review-preview.txt", preview.encode())
    # Training text remains unmodified, as JSON strings (never HTML).
    local_records = [{"row_id": row.row_id, "label": row.label, "text": row.text, "group_id": mapping[row.row_id]} for row in eligible]
    write_new(output / "records.jsonl", b"".join(json.dumps(item, ensure_ascii=True, sort_keys=True).encode() + b"\n" for item in local_records))
    return provenance, eligible, review, report, mapping


def freeze(provenance: dict, rows: list[Row], expected_review: dict, report: dict, mapping: dict,
           review_path: Path, destination: Path) -> dict:
    review_payload = bounded_read(review_path)
    review = json.loads(review_payload)
    languages = verify_review(review, expected_review, report)
    records, counts = split_rows(rows, mapping, {item["row_id"] for item in review["records"]})
    manifest = {"format_version": 1, "provenance": provenance, "seed": SEED, "ratios": dict(zip(SPLITS, RATIOS)),
                "human_review_sha256": digest(review_payload), "human_reviewed_counts": {label: 15 for label in LABELS},
                "human_sample_languages": dict(Counter(languages)), "remaining_languages": "unverified",
                "reviewed_families_reserved_for": "train", "counts": counts, "records": records,
                "leakage_intersections": assert_no_leakage(records), "data_split_ready": True, "model_trained": False,
                "limitations": ["Source labels remain imperfect; 45-row human audit is a sample, not full annotation.",
                                "Script heuristics do not establish English/Czech language coverage.",
                                "Time/campaign metadata unavailable; undetected paraphrases/translations may remain.",
                                "Token Jaccard + character similarity and template heuristics can over/under-group."]}
    write_new(destination, json_bytes(manifest))
    write_new(destination.with_suffix(".sha256"), (digest(json_bytes(manifest)) + "\n").encode())
    return manifest
