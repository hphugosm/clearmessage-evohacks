# 01 — Verified data and frozen splits

Paste the following block into Codex, or ask Codex to read this file. If /goal is unavailable, use the text after /goal as a normal task request.

```text
/goal Prepare reproducible ClearMessage training data. Read AGENTS.md, docs/RESEARCH.md, docs/STATUS.md and docs/PROJECT_PLAN.md. This goal produces an audited dataset and immutable train/validation/test split, not a trained model. Existing offline preparation tools and English instructions are in docs/DATA_PREPARATION.md; inspect and reuse them. Actual raw acquisition and an immutable candidate exist; human approval and final freeze remain blocked. Preserve the existing four decisions and candidate. Provisional training did not complete Goal 01. Resolve event reuse requirements before relying on reused resources.

Start with the original Mendeley source, DOI 10.17632/f45bkkt8pr.1, https://data.mendeley.com/datasets/f45bkkt8pr/1. Verify the raw file, license and label meanings. In docs/DATA_SOURCES.md record authors, URL, version, acquisition date, license, SHA-256 and actual row/class counts. Read CSV as data; do not execute remote code or visit embedded links. If acquisition fails, document the blocker and provide local raw-file import. Never call a spam dataset phishing ground truth.

Preserve ham/spam/smishing with explicit mappings. Audit missing values, conflicts, duplicates and languages; prepare at least 15 records per class for human review, with nonclickable links. Keep inappropriate/raw corpus content out of public demo fixtures.

Group normalized duplicates, near-copies, translations and recognizable templates before approximately 70/15/15 stratified group splitting. Fix the seed and save manifests; no group may cross a boundary. Report unavailable campaign/time metadata. Fit no learned preprocessing here and do not merge corpora merely to increase size.

Prepare formats and English instructions for any additional-language development and independently reviewed blind challenge set. Do not read blind answers during development. Label synthetic/translated origins and keep related families together. Demo fixtures are separate, fictional, English and use .invalid domains. Preserve source dataset language rather than translating research evidence.

DONE: import/validation works, sources/license/hash/counts/audit/manifests are traceable and group intersections are empty. A missing file or unclear label remains a blocker. Update docs/STATUS.md, show a reproducible preparation command and commit if permitted. Do not train yet.
```
