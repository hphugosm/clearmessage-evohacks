# ClearMessage ML — provisional model, incomplete review

The original Mendeley V1 archive contains 5,971 rows. Audit/hash/label mapping are
recorded. The candidate has 5,873 eligible rows and empty group intersections;
46 conflicting groups / 98 rows are quarantined. All 45 label decisions are
saved: 16 agreements and 29 requested corrections,
zero pending labels. All 45 languages and four reviewer/date attributions remain
missing; correction reconciliation and exclusion approval are incomplete.
Current validation evidence is in docs/STATUS.md.

The user explicitly authorized **provisional training on original labels**.
An immutable authorization manifest references the unchanged candidate and exact
assignments. `data_split_ready=false`; no approved freeze. Approved training
preflight remains blocked and has not been weakened.

Word/character TF-IDF + LogisticRegression and our LogisticRegression head over
frozen MiniLM were genuinely trained on train only. Validation selected TF-IDF
C=2; the project JSON artifact is hash verified. These are experiments against
source labels, not an approved detector or language benchmark. Goal 03 integrates
the selected real sparse model with the API; all current checks are incomplete.

- Setup, training and verification commands: [MODEL_CARD](../docs/MODEL_CARD.md).
- Actual metrics: [MODEL_REPORT](../docs/MODEL_REPORT.md), [JSON](reports/goal02-provisional-v2.json).
- Experiment index: [goal02-latest.json](reports/goal02-latest.json).
- Source/license/counts: [DATA_SOURCES](../DATA_SOURCES.md).
- Audit/freeze workflow: [DATA_PREPARATION](../docs/DATA_PREPARATION.md).
- Preserved Czech-input development/blind format: [czech/README.md](czech/README.md), currently zero real challenge records.

`scripts/infer_model.py` verifies our artifact's expected SHA-256, reads JSON from
stdin and returns neither input nor internal scores. Provisional policy cannot
produce `no_strong_signals` or `analysis_complete=true`. Encoder inference uses
verified local safetensors and rejects full-tokenizer overflow. No runtime
model download, untrusted pickle or remote dataset code.

Raw content, review notes, caches and weights are ignored by Git. Public reports
contain metrics, IDs/hashes and provenance, not dataset text or user inputs.
No/yes indicators are not model features. Classes are not API statuses.
The interface is English; original multilingual evaluation data is preserved.
