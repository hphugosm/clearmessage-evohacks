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

## Goal 01 approval preparation workspace

The follow-up validation request requires a second look at the saved 44 SPAM /
1 HAM distribution before any corrected review or split is approved. A separate
mode provides that workflow without permitting writes to the canonical review:

```sh
.venv/bin/python scripts/review_tool.py --port 8767 \
  --validation-hints ml/data/mendeley-v1-audit-v2/review.inspection-hints-4e674147a8a4.json
```

Open **http://127.0.0.1:8767**. The local inspection-hints file is deliberately
ignored by Git: it contains manually inspected row IDs, textual observations and
language suggestions tied to review SHA-256 `4e674147a8a4…`. It contains no human
confirmations. All 45 entries appear predominantly English, including SMS shorthand;
the reviewer must explicitly confirm the suggested group or override individual
languages. The file was prepared for this specific saved review, not as a general
language detector or hardcoded model prediction.

The default compact comparison table contains all 29 changed labels, grouped by
original label (14 HAM, 15 SMISHING). All 45 entries are available in the same page.
The saved human label and draft label appear separately beside the original label
and expandable original message. Personal conversational HAM changes and bank-login /
government-transfer messages have prominent textual observations. They are suggestions,
not automatic reversions. Bulk label changes show a confirmation listing selected IDs.
Selections clear after staging labels or changing filters to avoid unintended reuse.

Language confirmations and the four missing metadata records have their own controls.
If historical facts are known, the reviewer supplies their actual reviewer/date.
Otherwise, explicit re-confirmation records the real current UTC time and current
Europe/Prague date in the draft, with the historical date marked unknown. The
canonical historical notes and earlier decisions remain untouched. Known review
metadata cannot be overwritten by this metadata operation.

The original conflicts contain **98 rows in 46 groups: 48 SPAM, 50 SMISHING, zero
HAM**. Recomputed from the hash-pinned original archive, 32 groups are identical after
normalization, one has the same conservative template, and 13 combine near-copy /
template / normalization relationships. Examples from each type are expanded;
all 98 messages are accessible as inert plain text. Recommended handling is
reversible whole-group quarantine, preserving the raw archive. This would retain
5,873 eligible rows (4,844 HAM / 441 SPAM / 588 SMISHING) before label corrections.
The quarantine button stages a proposal, never an exclusion approval.

The saved label corrections also create **seven additional mixed-label families /
29 rows** if applied without reconciliation. These families were reserved for
training in the candidate. The workspace shows every affected member and requires
either a corrected sampled decision or an explicit human shared-label decision
after inspecting the variants. No correction propagates automatically. The proposed
revision preserves existing partition assignments; no held-out examples are exposed
to resolve those training-family conflicts. Label overrides and any remaining
conflicts are recalculated with every staged choice.

Draft choices live in the local server's RAM and survive browser reloads, but a
server restart clears them. **Submit draft for separate final approval** becomes
available only after explicit label rechecks, language confirmations, valid metadata,
a quarantine proposal and resolution of new family conflicts. Submission writes a
separate owner-only, immutable, atomic `review.approval-draft-<hash>.json` alongside
the canonical review. It contains IDs, decisions, metadata, hashes and dataset effects;
no source message bodies. Its status is `draft_awaiting_final_owner_approval` and
`final_approval_given=false`. Source, canonical review and existing split are unchanged.

After the submitted draft is presented, the owner must give separate explicit final
approval in chat. Only that subsequent approved step can save a corrected review
with backups, validate the revised data, freeze a new approved split, determine
retraining requirements and update STATUS. Neither this mode nor its draft submission
trains a model, freezes a split or modifies the production application. The existing
training preflight remains unchanged and blocks the current unapproved review.

Verification uses fictional disposable files, including an explicitly test-only
untrusted-markup response. No source message body appears in public tests:

```sh
.venv/bin/python -m pytest tests/test_review_validation.py tests/test_review_tool.py tests/test_data_prep.py tests/test_training_preflight.py -q
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_validation_browser.mjs
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_tool_browser.mjs
python3 scripts/audit_migration.py
git diff --check
```

Actual results: **64 Python tests passed**, including seven new approval-workspace
tests. Both browser workflows passed; local real-data read-only checks confirmed
45 comparisons, 29 changes, 46/98 original conflicts, seven/29 additional conflicts
and zero inferred confirmations. The initial new browser check exposed a stale
select-all checkbox after clearing a bulk selection; fixed and rerun successfully.
Existing Starlette/httpx deprecation warnings remain unsuppressed. Source, review,
report, split and model preservation hashes are checked separately. STATUS is held
for the user's explicitly approved finalization step.
