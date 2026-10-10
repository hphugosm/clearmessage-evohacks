# ClearMessage project status

Updated **10 October 2026, Europe/Prague**. The standalone local Goal 01 human
review tool is ready; stop after this deliverable. The English ClearMessage /
approved Style A migration remains complete. This does not complete human review,
start Goal 04, retrain a model, freeze data, inspect blind/held-out messages or publish.

The real Goal 02 sparse model remains integrated with `analysis-policy-1` and
`observed-requests-1`, contract **1.1.0**. It is provisional: **41 human reviews
pending**, original source labels, no verified language performance. Current
results are `suspicious` with actual basis or `review`, always
`analysis_complete=false`. Production `no_strong_signals` is disabled.

| Area | Actual state / evidence |
|---|---|
| Naming/language | ClearMessage; English UI, instructions, docs, metadata and public demos. Czech evaluation data remains separate. Migration verification below. |
| Brand | Approved Style A: shared blue/navy tokens, white rounded cards, local Inter, passive local mark/illustration, input-first mobile layout. |
| Frontend/API | Real model-backed POST via Vite and FastAPI-served build; no demo verdicts. |
| Contract | Pydantic → OpenAPI → TypeScript; title migrated, fields/enums/versions unchanged. |
| Model/policy | Real hash-verified project JSON; incomplete results and rules-only errors remain explicit. |
| Dataset | 5,971 original rows; 4 explicit human decisions (2 agreements, 2 requested smishing → spam changes); 41 pending, attribution/languages and conflict approval incomplete. |
| Data split | Immutable candidate, empty intersections; no approved final freeze. Provisional authorization preserves original assignments and `data_split_ready=false`. |
| Czech development/challenge | Format and independent instructions; zero actual challenge records. Existing synthetic Czech regression inputs preserved, not a benchmark. |
| Sharing | Fixed English templates, preview and separate gesture; selectable manual-copy fallback. No clipboard API or source content. |
| Docker | Source prepared; CLI/daemon unavailable. Build/run/healthcheck **untested**. |
| Deployment | Account/destination unconfirmed; no publishing, credential collection or purchase. |
| Git | Local repository with no remote; commit after verification. Owner-supplied reference folder preserved. |
| OCR/submission/video/Goal 04 | Not started by this migration. |

## Goal 01 — standalone local human review tool

Built on migration commit `0c7f132`. [HUMAN_REVIEW](HUMAN_REVIEW.md) gives launch,
workflow, schema mapping, verification and limitations. No new dependencies,
production application edits, source relabeling or human decisions were made.

```sh
.venv/bin/python scripts/review_tool.py
```

The interface runs at **http://127.0.0.1:8765**, with no configurable host. It
displays all 41 pending rows on one page (14 HAM / 14 SPAM / 13 SMISHING), grouped
and filterable by original label; All entries includes the four existing decisions.
Full messages expand as plain text. One-click choices, multiselect, discrepancy
highlighting/problematic sorting, counters and saved-file validation are available.
Bulk approval requires manually reviewed rows and an explicit modal confirmation;
exclusion proposals require reasons, saved proposals and separate explicit approval.
Nothing is reviewed by opening/expanding a row. Unsure remains pending.

Writes preserve every existing schema key, source label, unknown metadata and prior
notes. Corrections/proposals use `disagreed` and a versioned annotation in existing
notes; accepted labels use `confirmed`. Entered reviewer/date apply only to explicit
changes; unconfirmed languages remain unconfirmed. Backups contain exact pre-save
bytes; file and directory fsync, same-directory atomic replacement, process/thread
locks and SHA-256 conflict rejection protect saves. No records are removed, and
the existing top-level conflict-exclusion approval remains untouched.

Suggestions come only from the existing configured hash-verified TF-IDF artifact,
loaded once locally. It agrees with all 45 original labels here. The interface
discloses that audit samples were reserved for training, overlap may bias these
suggestions, the classifier is provisional and language performance is unverified.
Disagreements and highlighted rows are capabilities, not invented findings.

| Check / actual command | Result |
|---|---|
| `.venv/bin/python -m pytest tests/test_review_tool.py tests/test_data_prep.py tests/test_training_preflight.py -q` | **PASS: 57 tests**, including 18 review-tool tests; existing Starlette/httpx deprecation warning retained |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_tool_browser.mjs` | **PASS**: fictional temporary-file browser test; filters/sort/highlight, inert HTML/URLs, reviewed flags, bulk cancel/confirm, multiselect, separate exclusion approval, saves/backups, report/reload, 390px reflow before/after save, no external browser requests or page errors |
| `.venv/bin/python scripts/review_tool.py` + local HTTP/browser read-only smoke | **PASS**: real 45 records / 41 pending, prior 2 agreements / 2 corrections, 45 suggestions; all 41 pending rows visible, label filters 14/14/13; initial Save/bulk disabled, no automatic reviewed flags |
| Actual review copied to `TemporaryDirectory`, `TestClient` save | **PASS**: fictional test decision only in disposable copy; exact backup, same keys/metadata/source labels, all 45 records retained; original never written |
| Real `ReviewStore` load with socket connection/DNS functions blocked | **PASS**: 45 suggestions, zero network attempts; no download or training |
| `lsof -nP -iTCP:8765 -sTCP:LISTEN` | **PASS**: IPv4 `127.0.0.1:8765` only |
| `python3 scripts/audit_migration.py` | **PASS**: 133 owned files, intentional evaluation-input exceptions preserved |
| Diff / preservation | `git diff --check` **PASS**; all 63 snapshotted ML files unchanged, including original review, corpus, model and split artifacts |
| Production/frontend/Docker/full suite | **NOT RERUN**: unchanged; relevant data/preflight/tool tests run. No deployment, freeze, training or new review performed |

Original review SHA-256 remains
`7cf04370060bc86e58349a06dc04fc82de680b0404e17eb44b4babe34a30a70c`.
The saved-file report has **zero changes since server start** and **41 pending**.
All 45 language/reviewer attributions and existing whole-group exclusion approval
remain incomplete. Corrections and any approved exclusion proposals still need
separate pipeline reconciliation; this interface does not establish Goal 01 data
readiness. Unsaved choices disappear on reload; reports retain all saved decisions
but their changes-since-start list resets with the server. Avoid manual edits during
saves because outside editors do not participate in the tool lock. Fictional UI
layout was visually inspected; no full accessibility/screen-reader certification
is claimed. All executed tool checks passed; no tool check was skipped or failed.

## ClearMessage migration

Started from clean commit `5295124`. During discovery the owner uploaded
`clearmessage-evohacks/`, an approved English Style A reference package from a
separate task. Its brand bible was read before interface changes. Design assets,
tokens, font/license and English planning translations were incorporated;
**older foundation code and obsolete model/status claims were not substituted
for the current trained integration**. The uploaded folder remains untouched and
excluded from active Git/Docker source. See [MIGRATION_REPORT](MIGRATION_REPORT.md).

Translated/reconciled README, data-source/preparation/ML instructions, API/status,
planning/research/acceptance, goal prompts and Codex instructions. Single English
copy dictionary and help templates replace UI locales; `message_language=cs`
remains valid input metadata. Backend changes are branding only. No dependency
versions, learned preprocessing, weights, thresholds, manifests, raw records or
review decisions changed. Public demo fixtures alone became English; evaluation
inputs were not converted into demo material or removed.

The attached workspace path is retained because moving it would invalidate local
environments and attachment paths. New clone/delivery slug is
`clearmessage-evohacks`; npm/container identity is `clearmessage`.

### Commands and results for this migration

```sh
.venv/bin/python scripts/export_contract.py
npm --prefix frontend run contract:generate
python3 scripts/audit_migration.py
sh scripts/test.sh
sh -n scripts/install.sh scripts/test.sh
.venv/bin/python scripts/prepare_model.py
git diff --check
```

| Final check | Actual result |
|---|---|
| `python3 scripts/audit_migration.py` | **PASS**, 124 owned files; exact input exceptions retained; metadata/assets/font/license/local links checked |
| `sh scripts/test.sh` | **PASS exit 0**: pip check, OpenAPI/TS drift, **140 pytest** (2.74 s), **26 Vitest**, TypeScript/Vite build, **16 Playwright** (5.2 s) |
| Browser/API coverage | PASS in built-FastAPI and Vite-proxy modes; actual model version, English UI with Czech input, no external browser requests, private-share/log canaries, failure/limits/inert HTML |
| Build | PASS, Vite 8.3.4; 21 modules; JS 233.15 kB / gzip 73.28 kB; local SVG/font emitted under unchanged CSP |
| `sh -n scripts/install.sh scripts/test.sh` | PASS |
| `scripts/prepare_model.py` | PASS, exact selected SHA; no download/retraining |
| Preservation hashes | PASS, 73 of 74 protected files byte-identical; only public-demo expectation changed in the remaining test, original Czech string constants identical; archive/model/review/manifests unchanged |
| Desktop/mobile visual inspection | PASS, actual 1360px form and 360px model-backed result inspected; desktop input card 604.797px; assets/font render |
| 320px / 200% text enlargement | PASS, no horizontal overflow at 320px or 640px with root text enlarged to 200%; **not a native page-zoom audit** |
| Reduced motion / console / assets | PASS, submit transition 0s with reduced motion, no page errors, same-origin requests only |
| Contrast calculation | PASS for measured used pairs, minimum 4.759:1; detailed pairs in MIGRATION_REPORT; **not full WCAG conformance** |
| Docker CLI/daemon/build/run | **UNTESTED**; `command -v docker` returned no executable; no installation/daemon changes |
| Diff | First check caught one trailing blank line; removed; final `git diff --check` PASS |
| Deployment / training / Goal 04 | **NOT PERFORMED** |

No installation or download was required for this migration. Existing local
locks/environments were reused; no dependency versions or model artifacts changed.

Initial verification: **139 Python tests passed, 1 failed** because the public
fictional-demo check still required both UI languages; the new English-demo
expectation preserves all Czech evaluation inputs. **26 client tests passed**.
Initial browser run: **7 passed, 1 failed, 8 not run**, due to the illustration
check requiring an explicit `aria-hidden` on the image; fixed without relaxing
CSP. A temporary documentation export helper failed on a CommonJS variable-name
collision, was corrected and rerun successfully. These failures are not counted
as passed checks. Existing Starlette/httpx and NO_COLOR/FORCE_COLOR warnings are
retained, not suppressed.

## Goal 03 — integrated model, observed rules and help

Historical implementation commit **5295124**, based on clean `570f2f0`.
Review/model hashes preserved. LocalClassifier loads project-generated verified
JSON once, with one nonblocking model slot. No pickle, runtime download or fake
ML fallback. Sparse coverage checks full allowed text; incomplete coverage and
inference failures cannot give model warnings or reassuring outcomes. Actual
rules may still warn, with their limited basis disclosed.

Rules recognize requests to disclose passwords/codes, immediate-payment pressure
and concealment from someone trusted, in Czech/English message data. They handle
negation, ordinary safety notices, contrasting clauses and URL masking. Internal
character offsets support matches; no evidence snippets are shared. Advertising,
HTTPS, TLD, short links or spelling alone are not fraud evidence. Complex context
and negation remain limitations of finite rules.

EN provisional model warning threshold **0.60** is unchanged from validation
selection. Czech/other/unspecified input receives observed-rule warnings or
review, without claims of model performance. The low-finding policy is explicitly
unvalidated/disabled; hypothetical approved models exist only in tests.
`tldextract==5.4.0` uses `suffix_list_urls=()`, `cache_dir=None`, bundled PSL
without refresh or DNS/HTTP/WHOIS/redirects. Dependency solution: 28 runtime + 7
dev-only pinned versions with wheel hashes; runtime licenses/PSL notices recorded.

At most three supported reasons/actions. Neutral help preview plus explicit
native-share gesture, manual-copy fallback, no clipboard API. Three brief
recovery steps collect no secrets. Docker source includes explicitly prepared
sparse model; no raw data/encoder/user messages.

Historical actual checks:

| Check | Recorded result |
|---|---|
| Local dependency lock/clean install | PASS, hash-verified wheels and pip check |
| Clean runtime API/policy tests | **82 passed**, 73.17 s including first cold import; existing warning |
| Full `sh scripts/test.sh` | **140 pytest, 26 Vitest, 14 Playwright passed**, contract/build/pip check; Python 2.88 s, browser 5.1 s |
| Final targeted API/policy/build | **82 passed**, TypeScript/Vite passed |
| Real-model no-egress | PASS, DNS/socket/requests blocked, cold PSL/repeated URLs, **zero attempts** |
| Contradictions/notices/advertising/no-URL request/failure/overflow/busy/limits | PASS with fictional/inert development inputs |
| Canary logs/responses/share | PASS, no canary in logs/errors/preview/share; native share stub confined to tests |
| Fresh-process API/reload/maximum input | PASS, Goal 02 loader parity; 2,000 allowed, 2,001 rejected |
| Offline `prepare_model.py` | PASS, artifact/report/threshold verified, nothing trained/downloaded |
| Docker COPY layout in clean Python environment | PASS; **not a Docker build** |
| Docker build/run | UNTESTED, no CLI/daemon |
| Publishing/retraining/next goal | NOT PERFORMED |

`ml/reports/goal03-integration.json`: macOS 26.6.2 arm64, Python 3.13.1, Apple M5.
25 in-process HTTP/ASGI/model/rules requests, including cold PSL but excluding
initial imports: p50 **0.893 ms**, p95 **3.396 ms**, maximum **30.606 ms**, peak RSS
**178,503,680 bytes**. App factory in already imported process: **15.819 ms**.
These are not network/Docker latency or language accuracy. Five fictional
synthetic development smoke cases: Czech secret request and English immediate
payment warned; English safety notice, advertising and school message reviewed.
All incomplete, no real-world validation or tuning from blind/held-out data.
A duplicate-target patch attempt was rejected without partial edits and repaired.

## Goal 02 — provisional training after explicit permission

Historical commit **570f2f0**. The user paused review and explicitly authorized
provisional original-label training with incomplete audit disclosed. Four human
decisions preserved; no invented approvals or relabeling. Immutable provisional
manifest references the candidate and seed **20261010** with identical
**4,112 / 881 / 880** assignments; `data_split_ready=false`. An explicit CLI flag
is required. The approved preflight remains blocked.

Sklearn Pipeline: train-fitted word/character TF-IDF and balanced LR, predefined
C=0.5/2.0; train-fitted majority baseline. Frozen multilingual MiniLM,
Apache-2.0, revision `e8f8c211226b894fcb81acc59f3b34ba3efd5f42`, with our LR head
C=0.5/2.0 on the same splits. CPU only, no encoder pretraining/fine-tuning.
First 32 train messages benchmarked: **0.116693 s**. Only public train/validation
embeddings cached. Full tokenizer limit **128 including special tokens**, no
truncation; coverage train 4,103/4,112, validation 880/881, test 880/880. Overflow
stays review; covered denominators and selection coverage penalty disclosed.

Validation selected **TF-IDF C=2**, macro-F1 **0.876209**, warning threshold
**0.60** from a fixed grid. Selection saved before test featurization/scoring.
Test source-label macro-F1: selected TF-IDF **0.863645**, majority **0.301370**,
MiniLM C=0.5 **0.848873**, MiniLM C=2 **0.852579**. No selection from test. These
are agreement with unapproved source annotations, not fraud ground truth. Source
languages unverified: separate English/Czech results unavailable, not combined
into a language-performance claim. Blind challenge was not opened.

Provisional test policy: **75 suspicious / 805 review / 0 no_strong_signals**, all
incomplete; 68 source-smishing warnings, 7 false positives, 20 source-smishing
without explicit warning. Abstention **0.914773**, complete coverage zero.
Scores never appear as user-facing fraud probabilities.

Verified project JSON, local encoder safetensors and non-pickle NPY with hashes.
Reload difference **0**; repeated TF-IDF training byte-identical, repeated head
fit on fixed embeddings identical. Independently recomputed 32 encoder vectors:
max difference **3.88e-7** with a different padding batch. Cross-platform byte
identity is not claimed. Apple M5, macOS arm64, 24 GiB, CPU/4 threads: selected
model median **0.424 ms**, p95 **0.640 ms**, 32 validation messages including
policy, excluding load. All four candidates passed offline fresh-process inference.

Evidence: [MODEL_CARD](MODEL_CARD.md), [MODEL_REPORT](MODEL_REPORT.md),
`ml/reports/goal02-provisional-v2.json`, `goal02-verification-v2.json`,
`goal02-verification-clean-v2.json`, `goal02-latest.json`. Per-class metrics,
confusion matrices, false positives/negatives and error IDs were computed.
Raw text/links/weights/cache are not committed. Distribution license undecided.

Historical execution: 7 baseline / 34 encoder locked packages; 11 allowlisted
encoder assets acquired explicitly. Full Python run **89 passed**, one warning,
1.89 s. Failures preserved: first encoder install with hub 2.2.0 failed resolver
(ST required hub <2; resolved to 1.33.0); training v1 failed reload parity before
test (float32 head restored as float64; fixed dtype in v2); first clean-process
verification timed out after 60 s on cold import, then clean verification passed.
Approved preflight remained **blocked exit 2**; no frontend/API integration or
Docker/deployment happened in that goal.

## Goal 02 — initial approval blocker

Historical commit **d14f63f**, clean base `92142ab`. At that time 0/45 reviewed,
no attribution or exclusion approval; the name `review.completed.json` did not
establish completion. Preflight rejects pending/candidate input before reading
training text. Approved data checks pin manifest/review/archive, preparation
version, 15 attributed reviews per class, train assignment of review families,
exclusion approval, counts and empty group intersections. Fixed diagnostics echo
neither messages nor notes. Success would mean data readiness, not model quality.

Initial default preflight **blocked exit 2**: `approved_manifest_missing`,
`human_label_review_incomplete`, `human_review_requires_15_per_class`. Candidate
also blocked `manifest_not_approved`. **9 preflight tests passed; full 78 passed**,
one warning, 1.76 s. No fit, metrics, encoder acquisition, coverage or inference
was performed before the later explicit provisional permission. Initial blocker
report `ml/reports/goal02-status.json` retains null/not-computed historical results.

## Goal 01 — owner-supplied archive and automatic audit

Historical commit **92142ab**, clean base `9d1e6c6`. Local input resolved the
403 acquisition blocker without redefining failure as a successful download.
Only CSV was read from ZIP in RAM; scripts/PDF/embedded URLs were not executed
or opened. Original Downloads files preserved.

Actual archive/CSV sizes, hashes, counts and audit: [DATA_SOURCES](../DATA_SOURCES.md).
Strict UTF-8 header LABEL/TEXT/URL/EMAIL/PHONE; correct No/yes audit in new
`data-prep-v2` path. Older erroneous V1 audit preserved, not used/overwritten.
5,971 rows, 140 duplicate extras, 5,631 groups; 46 conflicts / 98 rows quarantined;
5,873 eligible rows / 5,585 groups. No missing cells, NA markers, unknown labels
or invalid mapped indicators. All source languages unverified; temporal/campaign
metadata absent. Fifteen review entries per class selected with defanged local
previews. At that time zero real human decisions; four were supplied later.

Candidate created with seed/code/source/group hashes, empty row/group/text/
normalized/template intersections. Counts: train 3,391 ham / 309 spam / 412
smishing; validation 727 / 66 / 88; test 726 / 66 / 88. Candidate checksum below.
No final `ml/manifests/mendeley-v1.split.json`. Freeze expectedly **blocked exit 2**,
`human_label_review_pending_or_disagreed`. Targeted data tests **36 passed**,
then two actual-manifest tests added; full **69 passed**, one warning. No model,
Docker or deployment in that continuation. Raw data/previews remained ignored.

## Goal 01 — first acquisition failure and tooling

Historical commit **9d1e6c6**. No Git initially (exit 128); 54 original files
snapshotted outside project, then local `git init -b main` explicitly authorized.
Original GET/API/archive failed HTTP 403 and browser download timed out at 30 s.
`fetch_dataset.py` **blocked exit 2**, `http_error`, `http_status=403`;
`prepare_data.py audit` **blocked exit 2**, `file_missing`. No fake hash/counts,
substitute corpus, real leakage success or annotation approval claimed.

Bounded offline importer, audit, grouped candidate/freeze and Czech format
implemented. Full **65 pytest passed**, one warning; early targeted 30 then 34
data/format tests. Fictional 100/class round trip produced 70/15/15 per class,
empty intersections and tamper rejection. Dependency/contract/build checks passed;
Vite 8.3.4, 18 modules. No new dependency/global install. Only intended README,
ML README/status changes affected original files; raw unavailable and Docker
untested. Actual corpus leakage was not tested until owner acquisition.

## Goal 00 — historical runnable foundation

Before local Git existed: commit skipped, `git status` exit 128. Python 3.13.1,
Node 25.8.2/npm 11.11.1, isolated venv/npm dependencies and Chromium 156.0.8078.4,
Playwright revision 1248 installed. Initially 14 runtime + 8 dev-only packages
locked with wheel hashes; later model integration legitimately expanded these.
Clean wheel installation and npm ci verified. No global install.

Real frontend/API, independent message-language hints, 2,000-code-point/32 KiB
limits, fixed no-echo errors, no-store/CSP/nosniff/no-referrer, no storage/analytics/
HTML execution/egress, 32 connections. FastAPI telemetry/autoconfiguration
explicitly disabled even under FASTAPI_OTEL_AUTO_CONFIGURE=true; required
OpenTelemetry API dependency has no SDK/exporter/instrumentation. No model then;
truthful model_not_ready, not a fabricated detector. Original bilingual UI and
old branding are historical and superseded by the English migration.

Final foundation suite **31 Python / 13 client / 12 browser passed**, one warning;
E2E 4.7 s. TypeScript/Vite build 228.78 kB JS / 72.30 kB gzip. Shell syntax passed;
install steps verified individually, not initially as a complete install script.
Local build 7860 and mobile 360px visually inspected; no horizontal overflow/page
error, real POST/incomplete response. Historical old-palette contrast pairs:
10.78, 6.07, 4.67, 11.76, 9.52, 7.39; these do not describe migrated Style A or
full WCAG compliance. Seventeen original files snapshotted; intended README/status
changes only. Initial planning README was byte-identical before this translation;
Git history retains its original language.

Failures repaired: first build exited 2 for missing language values/test import
location; E2E directory/import adjusted. Initial browser run had 12 launch
failures because relative browser cache resolved from another cwd; corrected
absolute path and all 12 passed. Tests/security were not disabled. Later invariant
repair rejected blank model version for completed low finding; 31 tests and both
contract checks passed again. npm found unrelated empty extraneous directories
ending in ` 2`; not included in locks or build context.

Global `hf --help` failed on Typer's unknown `suggest_commands`; no global fix or
credential/account probing. Read-only project configuration did not establish a
provider/destination. Missing Docker CLI, no daemon installation, no build/run.
Registry checks pinned available base-image manifests/digests, not execution.
No publication, purchase or access to credentials.

## Integrity pins and remaining limitations

| Artifact | SHA-256 |
|---|---|
| Selected sparse model | `7fe727cfb7868445f07ad32b0449131165268a8c5cbd8bafb71dd2b5178747fa` |
| Human review | `7cf04370060bc86e58349a06dc04fc82de680b0404e17eb44b4babe34a30a70c` |
| Candidate split | `51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0` |
| Provisional authorization | `21b3089b3e0aa56d076efef258f16cf4a2b8e9a4a27494d0ecf902a02bf2f9f5` |

Human audit/final freeze, verified EN/Czech benchmark, complex rule contexts,
Docker/Linux/Safari/Firefox, native sharing behavior, actual screen reader and
full native page-zoom/privacy/accessibility audits remain incomplete. Hosting
proxy logs/HTTPS are unverified. New clones require trusted model restoration,
not runtime downloads. Blind data remains reserved for an independently frozen
audit. The migration stops before Goal 04.

## Historical command ledger

These commands were recorded in the pre-migration STATUS at commit `5295124`.
They are retained as execution history, not instructions to retrain or restart
completed goals. Outcomes and failures appear in the English history above.
Current setup uses README; reproducing training requires deliberate authorization.

### Recorded command block 1

```sh
.venv/bin/python -m pip install --only-binary=:all: tldextract==5.4.0
.venv/bin/python scripts/lock_dependencies.py
python3 -m venv .cache/goal03-runtime
.cache/goal03-runtime/bin/python -m pip install --only-binary=:all: --require-hashes -r backend/requirements-dev.txt
.cache/goal03-runtime/bin/python -m pip check
.cache/goal03-runtime/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
.venv/bin/python scripts/export_contract.py
npm --prefix frontend run contract:generate
.venv/bin/python scripts/prepare_model.py
sh scripts/test.sh
.venv/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
npm --prefix frontend run build
.venv/bin/python scripts/verify_analysis.py
git diff --check
```

### Recorded command block 2

```sh
.venv/bin/python scripts/lock_ml_dependencies.py
.venv/bin/python -m pip install --only-binary=:all: --require-hashes -r ml/requirements-encoder.txt
.venv/bin/python scripts/setup_encoder.py
.venv/bin/python scripts/train.py \
  --allow-provisional-original-labels --encoder-directory ml/artifacts/encoder \
  --output ml/artifacts/goal02-provisional-v2 --report ml/reports/goal02-provisional-v2.json
python3 -m venv .cache/ml-verify
.cache/ml-verify/bin/python -m pip install --only-binary=:all: --require-hashes -r ml/requirements.txt
.venv/bin/python scripts/verify_model.py \
  --report ml/reports/goal02-provisional-v2.json --output ml/reports/goal02-verification-v2.json
.venv/bin/python scripts/verify_model.py \
  --report ml/reports/goal02-provisional-v2.json --output ml/reports/goal02-verification-clean-v2.json \
  --fresh-python .cache/ml-verify/bin/python
.venv/bin/python scripts/write_model_report.py \
  --report ml/reports/goal02-provisional-v2.json --verification ml/reports/goal02-verification-v2.json \
  --output docs/MODEL_REPORT.md
.venv/bin/python scripts/training_preflight.py
.venv/bin/python -m pip check
.venv/bin/python -m pytest -q
```

### Recorded command block 3

```sh
.venv/bin/python -m pip install --only-binary=:all: scikit-learn==1.9.1 numpy==2.5.3 scipy==1.18.1 joblib==1.6.0 threadpoolctl==3.7.0
.venv/bin/python -m pip install --only-binary=:all: sentence-transformers==6.1.0 torch==2.14.1 transformers==5.19.0 'huggingface-hub>=1.31.0,<2.0.0' safetensors==0.8.0
```

### Recorded command block 4

```sh
.venv/bin/python scripts/training_preflight.py
.venv/bin/python scripts/training_preflight.py \
  --manifest ml/manifests/mendeley-v1.split.candidate.json
.venv/bin/python -m pytest tests/test_training_preflight.py -q
.venv/bin/python -m pytest -q
```

### Recorded command block 5

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3

.venv/bin/python scripts/prepare_data.py plan-split \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --manifest ml/manifests/mendeley-v1.split.candidate.json

.venv/bin/python scripts/prepare_data.py verify \
  --input ml/data/raw/Dataset_5971.zip \
  --manifest ml/manifests/mendeley-v1.split.candidate.json

.venv/bin/python scripts/prepare_data.py freeze \
  --input ml/data/raw/Dataset_5971.zip \
  --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3 \
  --review ml/data/mendeley-v1-audit-v2/review.completed.json \
  --manifest ml/manifests/mendeley-v1.split.json

.venv/bin/python -m pytest -q
```

### Recorded command block 6

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip --output ml/data/mendeley-v1
```

### Recorded command block 7

```sh
sh scripts/install.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" frontend/node_modules/.bin/playwright install chromium
sh scripts/test.sh
.venv/bin/python scripts/serve.py --port 7860
```
