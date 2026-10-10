# ClearMessage local human review tool

This standalone developer tool supports Goal 01 label review. It is separate
from the public application and does not freeze splits, retrain, remove dataset
rows or complete review for the owner. It reuses the installed FastAPI, Pydantic,
Uvicorn and scikit-learn dependencies; no frontend build or installation is needed.

From the repository root, launch:

```sh
.venv/bin/python scripts/review_tool.py
```

Open **http://127.0.0.1:8765**. Stop with Ctrl+C in the launching terminal.
There is deliberately no host option. The launcher binds only to `127.0.0.1`;
proxy headers are disabled. Do not place this developer tool behind a proxy or
expose/forward its port. Browser assets and API calls use the same origin.

The default review file is
`ml/data/mendeley-v1-audit-v2/review.completed.json`. Message text is joined by
entry ID from adjacent `records.jsonl`; only selected review messages are retained
or returned. No source URLs are fetched. Message markup is displayed with
`textContent`, never HTML; no message URL becomes a link. Browser storage,
telemetry and access logs are absent. The tool serves existing research messages,
not user-submitted production messages. It never stores those message bodies in
review notes, backups or reports.

## Fast review workflow

1. Enter your reviewer ID; verify the date (default: Europe/Prague today).
2. At tool delivery the initial view showed **41 pending entries**, grouped by
   original label, plus four prior decisions. The owner has since saved all 45
   label decisions; a zero-pending view is now expected. Use All entries to inspect
   saved decisions and complete missing language/attribution explicitly. Counters cover all
   45 entries and include staged decisions; the validation report covers saved data.
3. Expand a message for full text. Use a one-click original/HAM/SPAM/SMISHING
   decision, Propose exclusion or Unsure. HAM does not establish message safety.
   Language stays unconfirmed unless you explicitly select it after choosing a
   decision. Opening/expanding rows never marks them reviewed.
4. Select rows for a shared decision. The confirmation lists every selected ID.
   For **Approve all remaining reviewed entries as labeled**, first manually
   check Reviewed for the rows you inspected. The action includes only those
   still pending/unsure, across filters, and requires an explicit confirmation.
   It never approves untouched rows or overwrites prior corrections/proposals.
5. Click **Save decisions**. Unsaved choices live only in page memory and will
   be lost on reload/close. A successful save reports the backup path. Stale
   sessions are rejected instead of overwriting a newer review file.
6. Exclusion proposals require a reason. Save the proposals, select them and use
   **Approve selected exclusion proposals** for separate confirmation, then Save.
   This records approval only for those entries. It leaves the top-level approval
   of existing whole-group conflict exclusions unchanged and removes no records.
7. Open **Validation report** for all saved decisions, changes since server start,
   pending IDs, language/attribution gaps, requested corrections and exclusions.
   After restart, the full decisions list remains available; the changes-since-start
   list begins again. Zero pending labels is not proof of Goal 01 completion.

Model suggestions use the existing project-generated TF-IDF artifact only after
checking its configured SHA-256. It loads once and predicts the review samples
locally, without training, downloads or external services. These samples were
reserved for training, so suggestions may reflect training overlap. The model is
provisional and language performance unverified: suggestions are not ground truth.
Missing/invalid model or out-of-bounds text displays Unavailable, without a keyword
fallback. Disagreements are highlighted and sortable, not automatically resolved.

## Existing schema and preservation

The review file's top-level metadata and original `source_label` values remain
unchanged. All unknown top-level and per-entry fields are retained. The existing
seven fields are used without adding schema keys:

| Human action | Stored decision | Details |
|---|---|---|
| Accept original / choose the same label | `confirmed` | Original source label retained |
| Choose a different label | `disagreed` | Requested correction in notes; no source relabeling |
| Unsure | `pending` | Explicit uncertainty recorded in notes |
| Propose or approve exclusion | `disagreed` | Reason / separate approval attribution in notes |

New details are a versioned JSON line starting `ClearMessage human review tool:`
inside the existing `notes` string. Earlier notes are preserved; only the tool's
own annotation line is updated. Legacy `requested_label=spam` notes are recognized,
so the two earlier corrections appear correctly. An explicit save attributes
changed entries to the entered reviewer/date; it does not invent missing language
or attribution on untouched entries. Current preparation/preflight checks continue
to block corrections, unresolved exclusions and incomplete language/attribution.
Reconciliation and any final freeze require a separate authorized goal.

Every save takes a process/thread lock and checks the loaded SHA-256. It creates
a unique `review.completed.json.backup-<UTC timestamp>-<random>.json` beside the
file, with the exact pre-save bytes and owner-only permissions, then writes/fsyncs
a temporary file in the same directory and atomically replaces the review file.
Directory fsyncs persist the backup before replacement and the new file afterward. Backup or replacement failures
retain the original file; backups are never overwritten. Ordinary outside editors
do not participate in the tool lock: avoid concurrent manual edits during saves.
These ignored local files never belong in a public repository.

For an alternative file/port or disabled suggestions:

```sh
.venv/bin/python scripts/review_tool.py --review /absolute/path/review.json --records /absolute/path/records.jsonl --port 8766 --no-suggestions
```

## Verification

```sh
.venv/bin/python -m pytest tests/test_review_tool.py tests/test_data_prep.py tests/test_training_preflight.py -q
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_tool_browser.mjs
python3 scripts/audit_migration.py
```

Python tests use fictional fixtures and check schema/metadata preservation,
backups, failure recovery, stale sessions, confirmations, redacted validation,
request bounds and local-origin protection. Browser tests run a temporary
fictional dataset with inert `.invalid` URLs; test-only suggestions verify
disagreement styling. They test cancel/confirm, multiselect, exclusions, restart
and no external browser requests. The actual review file's hash is checked before
and after, without saving any decision to it.
