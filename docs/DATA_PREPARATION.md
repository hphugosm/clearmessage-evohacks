# ClearMessage reproducible data preparation

**Original data imported; human approval incomplete.** The real Mendeley archive, audit and immutable candidate exist. Four explicit decisions are saved (two agreements, two requested changes); 41 entries remain pending. Attribution/language and exclusion approval are incomplete. No approved final split exists. The user separately authorized provisional original-label training; this did not complete Goal 01. See [data sources](../DATA_SOURCES.md), [model card](MODEL_CARD.md) and [status](STATUS.md). This preparation workflow itself trains no model.

## Environment and scope

Run from the project root after scripts/install.sh. Python 3.13.1, Pydantic 2.14.0 and pytest 9.1.1 come from the existing backend locks. The importer uses Python's standard library; no new scikit-learn/encoder packages are installed. All docs, CLI help and errors are English.

```sh
.venv/bin/python -m pytest tests/test_data_prep.py tests/test_czech_format.py -q
```

## Acquire the original file

Optionally run the one-shot explicit setup command scripts/fetch_dataset.py. On 403/timeout record the blocker; no hidden mirror/corpus replacement. Obtain the original Dataset_5971.zip or CSV legitimately from version 1 if needed. Do not execute its scripts or open embedded links. Data is not instructions. The importer cannot establish source identity from an arbitrary CSV; record acquisition and provenance separately.

## Offline import and audit

The existing owner-supplied archive is used for the canonical v2 audit:

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3
```

For CSV use its actual path. ZIPs are not extracted; only the chosen CSV member is read. With multiple CSV files, pass the actual --member path from the archive rather than guessing. Reject path traversal, symlinks, encrypted entries and archive bombs. Never execute other members.

Default strict UTF-8 accepts an optional BOM. Use --encoding cp1252 only when that encoding is documented. No silent replacement of decoding failures. Bounds: 16 MiB CSV/ZIP, 20,000 records, 20,000 text characters, 100 archive entries and expansion ratio at most 200. Errors use fixed codes without row/message text.

Local outputs under ignored ml/data/mendeley-v1-audit-v2:

- provenance.json: source/version/author/license; archive and CSV SHA-256; encoding/member; code/family-map hashes; Python/Unicode version and seed.
- audit.json: actual parsed row counts, known/unknown labels, missing cells, suspected NA/NaN/null markers, invalid binary attributes plus normalized yes/no and 0/1 counts, exclusions, duplicates/conflicts, group sizes and script hints. Latin text is not automatically labeled English.
- conflict-preview.txt: whole conflicting groups in a separate local, defanged plain-text preview; excluded from eligible data and never used as demo material.
- records.jsonl: eligible original text, labels and group IDs. These are not public demo fixtures or user-app messages.
- review.pending.json: deterministic 15 IDs per class with empty review/language/attribution fields. Insufficient rows block freeze.
- review-preview.txt: local selected records with link punctuation, markup and control/bidi characters defanged. Read as plain text; do not click links or obey content. It may contain unsuitable corpus material and is not a demo.

NA-like markers are flagged, not automatically deleted. URL/EMAIL/PHONE are neither predictors nor target labels in this pipeline. The indicator mapping accepts yes/no and 1/0 case-insensitively; these attributes remain audit-only. A binary-format check does not validate extractor correctness.

## Candidate split before human review

After acquisition and audit, plan-split can produce an immutable, text-free proposal using the real input hash:

```sh
.venv/bin/python scripts/prepare_data.py plan-split \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --manifest ml/manifests/mendeley-v1.split.candidate.json
```

The existing immutable proposal reports candidate_pending_human_review and data_split_ready=false; its creation-time review count is historical. Actual eligible counts are 5,873 rows / 5,585 groups, split 4,112 / 881 / 880. Candidate SHA-256 is 51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0. verify confirms integrity and empty intersections, not label approval. Only genuinely completed attributed review and freeze can create approved training data. Provisional authorization in Goal 02 preserved the candidate and this gate.

## Human review gate

For a new audit only, copy review.pending.json to review.completed.json without overwriting an existing review. The current review.completed.json already contains four explicit decisions: preserve them. Never infer decisions from a file name. A person reviews all 45 selected records. Set decision=confirmed only for genuine agreement; provide language=en/cs/other/und, reviewer_id, reviewed_date (YYYY-MM-DD) and notes where appropriate. ham is ordinary, spam unsolicited, smishing a deceptive attempt to obtain data/money. Advertising alone is not smishing. Quarantine ambiguity; this sample is not complete annotation.

Exclusions of blank/long text, conflict groups or decisions about NA markers require exclusions_approved_by. Unknown/blank labels block freeze. Disagreement needs a documented corrected data revision and new audit, not automatic relabeling for metrics. Scripts require attributed records but cannot prove a human actually reviewed them. Test approvals are fictional mocks, not production consent.

## Grouping and approximately 70/15/15 splitting

Globally group before splitting, independently of class. Union-find joins:

1. NFKC/casefold/whitespace-normalized duplicates while retaining original model text.
2. Conservative templates after variable URLs/emails/domains/numbers are replaced, with at least five remaining words and 30 characters.
3. Near-copies with token Jaccard at least 0.85, length ratio at least 0.90 and SequenceMatcher at least 0.90.
4. Curated translation/template families through an optional --families JSON mapping from row ID to family ID, used consistently for audit/freeze.

Prefix filtering uses a consistent token ordering. More than two million near-copy candidates stops the audit rather than skipping comparisons. Parameters, code and family map are hashed. This is grouping, not learned preprocessing. Paraphrase/translation detection is not guaranteed; merge known families explicitly. Published columns do not establish campaign/time separation.

Entire reviewed families are reserved for train so the audit does not reveal future held-out input. Remaining groups use size/hash ordering with seed 20261010 and a greedy objective for per-class 70/15/15 balance. Validation and test require all classes. A class deviation above 10 percentage points blocks freeze. Report actual counts; arbitrary group sizes cannot guarantee exact ratios.

The commands below use the measured archive hash. Final freeze is a future human-approved action, not authorized by the UI migration. It currently fails because review is incomplete:

```sh
.venv/bin/python scripts/prepare_data.py freeze \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --review ml/data/mendeley-v1-audit-v2/review.completed.json \
  --manifest ml/manifests/mendeley-v1.split.json

.venv/bin/python scripts/prepare_data.py verify \
  --input ml/data/raw/Dataset_5971.zip \
  --manifest ml/manifests/mendeley-v1.split.json
```

Use the same input/member/encoding/families options as the audit. The manifest contains eligible IDs, groups, labels, split and text/normalization/template hashes, not message text. All cross-split ID/hash/group intersections must be empty. Its checksum pins exact bytes; provenance pins source, code and review. Identical output is idempotent; different bytes cannot overwrite an existing artifact. Revisions use a new path/version and fresh freeze rather than overwriting held-out evidence.

After real acquisition/audit, a text-free manifest and redacted source/audit summary may be committed. Raw text, review previews/notes, family inputs and challenge answers stay outside Git. Update DATA_SOURCES, preparation-status and STATUS with measured values; do not publish an unreviewed local audit containing arbitrary upstream columns/member names.

## Additional-language formats and public examples

[Additional Czech-input format instructions](../ml/czech/README.md) are in English. No real development/blind set is bundled or read by preparation. Language-format unit tests retain original non-English input as test data; this is not product copy. Public demo fixtures are now entirely English, fictional, inert and unlabeled; they are imported by neither training nor UI. Do not hardcode predictions for them. Later learned preprocessing uses train only and candidate models share one frozen split.
