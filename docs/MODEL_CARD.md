# ClearMessage (Klidná zpráva) — training blocked

Checked **2026-10-10, Europe/Prague**. **No classifier has been trained or saved.**
This records the actual Goal 02 blocker; it is not evidence of model performance.
The application still reports `model_not_ready`, `analysis_complete=false` and
`model_version=null`.

## Why training did not start

The original data exist, but the approved Goal 01 prerequisites do not:

- The only manifest is `mendeley-v1.split.candidate.json`, with
  `candidate_pending_human_review` and `data_split_ready=false`.
- The final `ml/manifests/mendeley-v1.split.json` is missing.
- All 45 review records are still pending: zero confirmed labels, zero attributed
  reviews. The filename `review.completed.json` does not constitute approval.
- Exclusion approval is empty for 46 conflicting groups / 98 excluded rows.

The previous data request explicitly treats unchecked labels as a blocker. The
current request authorizes training on **approved** Goal 01 data. The candidate
has not become approved merely because its hashes and split intersections pass.
No review was fabricated or completed by the agent on behalf of a human.

## Data, provenance and licenses

Source: Sandhya Mishra and Devpriya Soni (2022), *SMS PHISHING DATASET FOR MACHINE
LEARNING AND PATTERN RECOGNITION*, Mendeley Data V1, DOI
`10.17632/f45bkkt8pr.1`. The recorded source-page license is CC BY 4.0. Source
attribution, provenance limitations and license link are in [DATA_SOURCES](../DATA_SOURCES.md).
The supplied archive matches the recorded local SHA-256; no independent publisher
checksum is available to establish authenticity cryptographically.

| Data stage | ham | spam | smishing | Total |
|---|---:|---:|---:|---:|
| Imported original | 4,844 | 489 | 638 | 5,971 |
| Candidate eligible | 4,844 | 441 | 588 | 5,873 |
| Candidate train | 3,391 | 309 | 412 | 4,112 |
| Candidate validation | 727 | 66 | 88 | 881 |
| Candidate held-out test | 726 | 66 | 88 | 880 |

These are **dataset counts**, not evaluation results. Ham is a source label, not
a guarantee of safety; spam is not interchangeable with smishing. Source spelling
variants are explicitly mapped, without numeric-label guessing. Conflict groups
are excluded as whole groups pending human review of that decision.

Archive SHA-256:
`9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3`.
CSV SHA-256:
`649844f1c62a6b27e145eaf17a65f7010c56c390e11a794ea8329993a05ba71e`.
Candidate manifest SHA-256:
`51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0`.

Grouping/split seed: **20261010**, data preparation version `data-prep-v2`.
Normalized duplicates, conservative templates, near copies and known families
are grouped before splitting. Candidate intersections of row IDs, group IDs and
text/normalized/template hashes are empty. Time/campaign metadata are absent;
undetected paraphrases/translations and imperfect source labels remain limitations.

## Language and intended scope

The planned task is short-message ham/spam/smishing classification, separate from
the UI's suspicious/review/no_strong_signals policy. The UI language is not the
message language. All 5,971 source languages remain unverified: script hints alone
do not establish English. No English or Czech performance claim is supported.
No Czech development/challenge messages were read in this step. Synthetic fixtures
are tests only and are not a substitute corpus or representative validation.

## Requested architecture — not yet trained or verified

The requested baseline is a scikit-learn Pipeline using word and character
TF-IDF plus LogisticRegression. Learned transforms must fit only on train.
No Pipeline has been fitted; no scikit-learn version was installed or newly locked
for this blocked step. No retraining command is claimed to work yet.

The candidate train-count majority is **ham**, based only on existing split
metadata. A majority classifier has not been evaluated; no majority accuracy,
per-class scores or confusion matrix have been computed.

The requested optional comparator is the frozen
`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` encoder with our own
LogisticRegression head. No encoder was acquired, benchmarked or embedded; its
revision, artifact hashes and license verification for an acquired revision remain
pending. Encoder reuse must not be described as our pretraining. No public-data
embedding cache or user-input cache was created.

## Results and integrity checks

All model/policy metrics are **not computed**, represented as `null` in
[the machine-readable report](../ml/reports/goal02-status.json): per-class
precision/recall/F1, confusion matrices, false positives/negatives,
coverage/abstention and latency. Null is not a zero score. No candidate or
threshold was selected and no held-out message was opened for evaluation.

Tokenizer coverage, overflow handling, artifact reload/parity, fresh-process
inference and reproducible retraining are **not run**, because no model exists.
There is no pickle, runtime download, keyword fallback or demo-specific verdict.
The approval preflight is independently executable and rejects the candidate
before loading source bytes or message text. Passing preflight would establish
data readiness only, not trained-model correctness.

## Reproduce the blocker and unblock the data

From the project root:

```sh
.venv/bin/python scripts/training_preflight.py
# exit 2: final approved manifest missing; 45 human label reviews pending

.venv/bin/python scripts/training_preflight.py \
  --manifest ml/manifests/mendeley-v1.split.candidate.json
# exit 2: manifest_not_approved; human label reviews pending

.venv/bin/python -m pytest tests/test_training_preflight.py -q
```

Complete the actual human label/language review and exclusion attribution using
[DATA_PREPARATION](DATA_PREPARATION.md), then run its final freeze command.
If the review was completed elsewhere, supply its actual JSON path; do not
manufacture confirmation. Only after the final manifest/hash/review checks pass
can training, validation selection and the one-time held-out evaluation proceed.

## Our work versus reuse

Our existing work is the application scaffold, inference boundary, bounded data
import, grouping/audit, hash-pinned candidate manifest and training preflight.
The original dataset, source labels and licenses belong to their credited authors.
No trained classifier/head/encoder, measured performance or policy thresholds are
claimed as our work yet. Codex assisted with implementation and documentation.
