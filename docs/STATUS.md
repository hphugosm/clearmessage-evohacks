# ClearMessage project status

Updated **11 October 2026, Europe/Prague**. Dataset/ML finalization is at
**Phase 1, awaiting explicit owner approval**. The live staged review was
rechecked; no label/language/metadata rechecks remain in the draft, but it is
neither submitted nor finally approved and the 98-row quarantine is only proposed.
Canonical data, candidate split and provisional model remain unchanged.
Goal 07 final audit is complete.
**NO-GO for an approved detector/public release**: Goal 01 approval/quarantine/final
split and final approved Goal 02 are absent; actual deployment/container gates
remain unresolved. Local technical verification passes with the genuine
provisional model. See [FINAL_AUDIT](FINAL_AUDIT.md) for evidence, error/coverage
results and the release recommendation. No features, training, policy/data
changes, deployment or publishing occurred.

Goal 06 was assessed and **skipped**:
the text core passes locally, but the required working deployed core remains
unverified. OCR was not implemented or enabled. The prerequisite checks and
reason are recorded below.

Goal 05 prepared the three-stage
single-container release and verified fresh local execution of the real model,
API and English Style A frontend. **Docker execution and public deployment remain
blocked**, not completed: no Docker/alternative runtime and no authorized existing
hosting destination. There is no public URL. Clean local install, production
packaging, real HTTP/Chromium flows, restart and corrupt-model failure passed;
measurements and actual scope are recorded below and in
[DEPLOYMENT_REPORT](DEPLOYMENT_REPORT.md). No publishing, purchase, credential
collection, retraining, review approval, split freeze, OCR or Devpost submission.

Goal 04's interface and the English migration remain intact. The last recorded
Goal 01 review state is staged in RAM, not submitted: all 45 labels explicitly
rechecked, all 45 languages confirmed, four missing attributions re-confirmed,
98-row quarantine proposed; final approval remains withheld. Canonical review,
provisional model, thresholds, Czech evaluation data and provenance are unchanged.

The real Goal 02 sparse model remains integrated with `analysis-policy-2` and
`observed-requests-2`, contract **1.1.0**. It is provisional: **final reviewed-data approval remains outstanding**, original
training labels unchanged, no verified language performance. Current
results are `suspicious` with actual basis or `review`, always
`analysis_complete=false`. Production `no_strong_signals` is disabled.

| Area | Actual state / evidence |
|---|---|
| Naming/language | ClearMessage; English UI, instructions, docs, metadata and public demos. Czech evaluation data remains separate. Migration verification below. |
| Brand | Approved Style A: shared blue/navy tokens, white rounded cards, local Inter, passive local mark/illustration, input-first mobile layout. |
| Frontend/API | Real model-backed POST via Vite and FastAPI-served build; no demo verdicts. |
| Contract | Pydantic → OpenAPI → TypeScript; schema 1.1.0 fields/enums unchanged; policy version 2; drift checks passed. |
| Model/policy | Hash-verified project JSON and validation-selection report; unchanged 0.60 warning threshold; policy 2 and rules 2. Incomplete results and rules-only failures remain explicit. |
| Dataset | 5,971 source rows. Canonical: 45 saved decisions (16 confirmed / 29 disagreed), all 45 languages pending, four missing attributions. 98-row/46-group conflict quarantine not approved. Historical RAM-staged draft is not final approval; source/training unchanged. |
| Data split | Immutable candidate, empty intersections; no approved final freeze. Provisional authorization preserves original assignments and `data_split_ready=false`. |
| Czech development/challenge | Format and independent instructions; zero actual challenge records. Existing synthetic Czech regression inputs preserved, not a benchmark. |
| Sharing | Fixed English dictionary/templates, preview, separate Copy/Share click. Write-only clipboard copies the neutral preview; denial/missing support selects it for manual copying. No source content or recipient selection. |
| Docker | Three-stage build and hardened loopback Compose prepared. CLI/daemon unavailable; build/run/healthcheck/enforcement **untested**. |
| Deployment | Fresh local release verified; no authorized existing public host/account or URL. HTTPS/proxy/hosting controls unverified. |
| Git | Local repository with no remote; commit after verification. Owner-supplied reference folder preserved. |
| Goal 07 | Final local audit passed technical checks; approved/public release NO-GO. FINAL_AUDIT records separate classifier/policy/language evidence. |
| Goal 05 | Local fallback verified; actual Docker and public release blocked, detailed evidence below. |
| Goal 04 | Implemented and verified below; real screen-reader/physical-device testing remains unperformed. |
| OCR | Goal 06 skipped at the deployed-core gate; no Tesseract dependency, screenshot input or OCR assets added. |
| Submission/video | Not started by this optional goal. |

## Dataset/ML finalization — Phase 1 approval gate

Read AGENTS, STATUS, FINAL_AUDIT, REVIEW_DRAFT_ASSESSMENT, DEPLOYMENT_REPORT,
PROJECT_PLAN, RESEARCH and ACCEPTANCE. Started from clean commit `95e53c6`.
Read-only inspection of the existing loopback approval workspace confirms the
same staged decisions described in [REVIEW_DRAFT_ASSESSMENT](REVIEW_DRAFT_ASSESSMENT.md),
including its exact 45-entry table and 46-group/98-row quarantine list.

- **Zero** unconfirmed label rechecks; **45/45** explicit English confirmations.
- Staged sample: **15 HAM / 13 SPAM / 17 SMISHING**. Restore 14 prior HAM→SPAM
  and 15 prior SMISHING→SPAM choices to original labels; correct source SPAM
  `row-000565` and `row-000891` to SMISHING. There are 31 changes versus the
  saved review, only two versus the original corpus, both singleton train groups.
- No missing staged reviewer metadata. Reviewer `hugo` for all 45; preserve 41
  dates as 2026-10-10. Four explicitly re-confirmed dates are 2026-10-11 for
  `row-000188`, `row-000244`, `row-000490`, `row-000565`; do not invent their
  unknown original dates. Preserve saved history and the original archive.
- Quarantine is **proposed, not approved**: 98 rows (48 SPAM / 50 SMISHING)
  in 46 original mixed families. Reasons: 32 normalized-identical families,
  one template family, 13 near-copy/combined families. No individual exclusions.
- **Zero additional mixed families** among 5,585 eligible groups under the staged
  corrections. Conditional eligible count: **5,873**, HAM **4,844**, SPAM **439**,
  SMISHING **590**. Candidate partitions total 4,112 / 881 / 880 and remain
  unapproved; do not freeze or move previously exposed groups before approval.
- `draft_submitted=false`, `final_approval_given=false`; no immutable approval
  draft file exists. Canonical metadata/decisions remain in the audited old state.
  The owner's instruction requires stopping here for approval. No submission,
  canonical edit, correction application, quarantine, freeze, training, runtime
  replacement or deployment occurred.

Read-only recomputation **PASS**: source/group/sample membership, candidate
checksum/leakage, staged confirmations, corrections, quarantine and counts;
protected review/archive/candidate/config/model hashes unchanged. Fresh text-free
snapshot is ignored at
`.cache/review-draft-assessment/assessment-finalization-20261011T094018874526Z.json`,
SHA-256 `b0644144df2f738c946b2fec60eaad6e43a0aeeede70fea03df03a507d2373bb`,
identical to the prior assessment. An initial snapshot-path wrapper failed with
`NameError` before writing output; its corrected rerun passed. No data changed.

Relevant checks:

```sh
.venv/bin/python -m pytest tests/test_review_validation.py tests/test_review_tool.py tests/test_training_preflight.py -q
python3 scripts/audit_migration.py
git diff --check
```

**34 tests passed**, one existing Starlette/httpx deprecation warning. Migration
and diff checks passed. Full retraining/integration/release checks are deferred
until approval, not claimed passed for an approved model. Prior test rows were
already evaluated in Goal 02/07: a later fixed-protocol comparison must disclose
that reuse, preserve their exclusion from fitting/tuning, and not call them fresh
blind validation. The 45 English confirmations concern training examples only;
English/Czech benchmark results remain unavailable without verified evaluation
language data. No new corpus or challenge labels were inspected.

## Goal 07 — final release audit

Started from clean commit `e0323fb`; read the required instructions, STATUS,
DEPLOYMENT_REPORT, BRAND_BIBLE and ACCEPTANCE, plus PROJECT_PLAN/RESEARCH. The
formal approval check ran first: **Goal 01 not finalized**. Canonical review has
45 decisions, 16 confirmed / 29 disagreed, 45 languages pending, four missing
attributions and blank quarantine approval. `mendeley-v1.split.json` is absent.
Candidate/provisional manifests remain immutable but unapproved, with empty
leakage intersections and data_split_ready=false. The historical staged RAM
draft does not establish submitted/final approval. Final eligible reviewed counts
cannot be certified; original-label provisional eligibility remains 5,873.

The locally loaded JSON and selection-report hashes match `tfidf_c2.0`, seed
20261010, threshold 0.60 and the expressly authorized original-label provisional
manifest. Provenance says human/language review incomplete. **No final approved
Goal 02 or public deployed model exists to certify.** Neither review nor quarantine,
source/split, artifact/config, thresholds or Czech provenance were changed.

Executed checks:

```sh
sh scripts/test.sh
.venv/bin/python scripts/training_preflight.py
.venv/bin/python scripts/prepare_data.py verify --manifest ml/manifests/mendeley-v1.split.candidate.json --input ml/data/raw/Dataset_5971.zip
.venv/bin/python scripts/audit_release.py --output docs/data/goal07-model-audit.json
.venv/bin/python scripts/verify_release.py --clean-install --report docs/data/goal07-local-release.json
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 .venv/bin/python scripts/verify_model.py --report ml/reports/goal02-provisional-v2.json --output docs/data/goal07-model-reload.json
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_tool_browser.mjs
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_validation_browser.mjs
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ui.mjs
.venv/bin/python scripts/verify_analysis.py
python3 scripts/audit_migration.py
git diff --check
```

**PASS:** full suite **188 Python / 32 Vitest / 34 Playwright**, build, pip and
contract drift; both separate fictional review-tool browser flows; all four saved
model reload/fresh-process parity/overflow checks; selected-model recomputation of
881 validation and 880 test classifier/error/baseline/CLI-policy results; current
policy checked independently; fresh locked local runtime, offline restart,
corrupt-model case, limits, no-store, logs/share canaries and zero network attempts.
Independent synthetic API smoke passed 25 real requests across five fictional
EN/CZ development cases; this is not language accuracy. Final migration audit
passed **161 owned files**, and `git diff --check` passed. Existing Starlette/httpx
and Node color warnings remain visible. No tests/security checks were weakened.

**BLOCKED, exit 2:** approved training preflight correctly refuses absent final
manifest and incomplete label/metadata/language confirmation. **NOT RUN:** actual
Docker/Linux/Compose enforcement, public HTTPS/proxy/hosting/anonymous access,
real screen-reader/physical-device/participant or native-share delivery checks.
No available container tool or authorized public destination was found; no URL
invented. No model was trained and no blind challenge opened.

Recomputed source-label test macro-F1 **0.863645**; smishing classifier **9 FP / 14
FN** (3 smishing→ham / 11 smishing→spam). These annotations are not approved fraud
ground truth. Older CLI policy: 75 warnings, 805 review, 7 warning FP, 20 source
smishing without an explicit warning. Current policy with honest unspecified
language: **880/880 test review**, zero observed warnings, zero inference errors,
zero completed checks (also 881/881 validation review). Do not present the CLI
count as integrated API coverage or treat review as a reassuring negative.
**English metrics unavailable; Czech metrics unavailable**, separately reported;
source-language aggregate is neither a verified English nor Czech benchmark.
Synthetic regression examples are behavior tests only.

Fresh runtime on Apple M5/macOS arm64: cold startup **68.646 s**, restart **0.979 s**;
sampled RSS **159.55 / 161.92 / 154.25 MiB** for real/restart/failed processes.
100 loopback requests p50 **1.840 ms**, p95 **2.276 ms**, max **3.296 ms**. No
Linux quota/image-size/Internet-latency claim follows from these measurements.
Current UI harness passed seven captures/14 contrast pairs; all captures opened
and visually inspected separately (desktop, 360px, 320 CSS px, text enlargement,
error). Native 200% zoom evidence was reviewed from Goal 04, not repeated. No
WCAG certification, field validation or human usability observation was claimed.

Added a read-only reproducible audit script and machine-readable evidence, plus
[FINAL_AUDIT](FINAL_AUDIT.md)'s five requested sections. Preserved historical
Goal 03/04 generated reports while copying fresh measurements to Goal 07 files.
Corrected misleading “approved project artifact” / “frozen candidate” wording in
the deployment report to explicitly provisional identity. No critical runtime
privacy/safety regression was found within executed scope; no production behavior
changed. Final approval/training, representative language evaluation, hosting and
licensing clearance remain release blockers. Demonstrate only the accurately
labeled local prototype. Local commit follows checks; stop after Goal 07.

## Goal 06 — optional OCR skipped at the release gate

Started from clean commit `d9ac5ff`. Read AGENTS, PROJECT_PLAN, RESEARCH,
ACCEPTANCE, STATUS, BRAND_BIBLE, UI_COPY and LANGUAGE_POLICY. The user requested
prerequisite verification first and permitted skipping the optional bonus.
AGENTS requires OCR “only after a working deployed core.” This gate is **not met**:
only the clean local release is verified. There is no public deployment/URL,
Docker/alternative runtime is unavailable, and container execution, HTTPS and
proxy/hosting privacy controls remain untested. Do not describe this as a failed
text application; it is a missing deployment prerequisite.

| Prerequisite | Verified state on 11 October 2026 |
|---|---|
| Text frontend/API flow | PASS: current production-build and Vite-proxy browser suites exercise real POST/inference and ordinary/suspicious/review flows. |
| Genuine model | PASS: preparation loads our real JSON; artifact and validation-selection-report hashes match their recorded pins. No training/substitution. |
| Conservative safety policy | PASS: incomplete/unsupported/error states cannot reassure; current production always returns analysis_complete=false and keeps no_strong_signals disabled. |
| Reproducible local runtime | Recorded Goal 05 fresh-install verification PASS, including real inference, unchanged-asset offline restart, corrupt-model failure, no-egress and log canaries. The report/hashes were checked; a new clean-install benchmark was not run for this documentation-only decision. |
| Working deployed core / container release | BLOCKED: no authorized public destination or deployed URL, no container runtime; no Docker/public-host verification. |
| Optional OCR | SKIPPED: prerequisite failed; no screenshot handling/control, feature-flag implementation, worker/WASM/language assets or Tesseract dependency introduced. |

Executed commands:

```sh
sh scripts/test.sh
.venv/bin/python scripts/prepare_model.py
python3 scripts/audit_migration.py
git diff --check
```

Also checked artifact/report SHA-256 directly against `backend/model-config.json`,
the saved `docs/data/goal05-local-release.json` result/inference/restart fields,
and availability of docker/podman/nerdctl/colima/limactl (none found). Source and
package-lock search confirms no Tesseract/OCR runtime was introduced.

Current regression results **PASS**: **188 Python**, **32 Vitest**, **34
Playwright**, dependency consistency, both contract drift checks, TypeScript/Vite
build and migration audit (**154 owned files**). Existing Starlette/httpx and Node
color-environment warnings remain visible. Tests include genuine model/API flows,
limits, unsupported scope, model/service failure, no-egress, neutral copying and
private canaries. No new language-performance or completed-analysis claim.

OCR quality is **not measured**; PNG/JPEG extraction, blur/format/byte/pixel-bound
checks, image privacy/worker cleanup and Tesseract/language-data availability or
licenses were **not tested/acquired**, because OCR was skipped. No screenshots
are handled by the application. Manual pasted-text input remains the verified
fallback; no OCR mock/demo or empty OCR result can enter analysis. No data/review,
model/policy, UI, dependencies or deployment configuration changed. Only this
status decision was committed. Stop after this optional goal; no next goal,
public publishing or Devpost action.

## Goal 05 — production packaging and verified local fallback

Started from clean commit `74b24f0`; preserved foreign reference files, canonical
review, data/manifests, model hash and policy selection. Added no dependencies or
product features. Three pinned build/runtime stages produce one nonprivileged CPU
service. Explicit model import accepts only our hash-pinned JSON and selection
report; build staging emits a per-file integrity manifest and excludes raw data,
training CLI, encoder, GPU, tests and Node. Runtime/restart only loads assets.

The request boundary admits eight simultaneous HTTP requests, one inference at a
time, 32 KiB body/2,000 characters and five-second total body receive deadline.
Fixed 408/503 errors retain no-store. Numerical libraries use one thread; one
worker, five-second keep-alive and backlog 64. The previous Uvicorn connection
limit could emit an early plain 503 outside the privacy boundary; app admission
now preserves fixed JSON/security headers. Partial headers/idle TCP still require
upstream protection for any future public deployment. No Linux quota or Compose
network/resource enforcement was tested.

Health is live-service versus verified-model readiness, with an explicit
`healthcheck.py --require-model` probe. Corrupt model stays live, fails readiness,
returns incomplete review or an actual observed warning with rules-only limits.
Server diagnostics discard private values/tracebacks/paths; access logs are off.
The fresh verifier blocks socket/DNS calls in only the application process; its
instrumentation never enters the production package. Browser/HTTP/canary checks
use only fictional public development cases and no model/API mocks.

Executed commands from the repository root:

```sh
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/package_runtime.py --output build/debug-runtime
.venv/bin/python -m pytest tests/test_runtime.py -q
.venv/bin/python scripts/export_contract.py
npm --prefix frontend run contract:generate
.venv/bin/python scripts/verify_release.py --clean-install
sh scripts/test.sh
python3 scripts/audit_migration.py
git diff --check
```

The trusted-import test restores a missing model in a task-owned runtime copy;
an incorrect JSON hash is rejected without leaking its contents or paths. Package
replacement refuses foreign/differing files. No owner files were removed.
Initial fresh runs **failed** a 30-second startup allowance. Cold scientific
imports were slow in the newly installed macOS environment; the final verifier
allows 120 seconds and actually measures startup rather than declaring success
from a Dockerfile. Docker start-period is provisionally 120 seconds. An initial migration check
failed while the new release-report link target was still unwritten; adding the
completed report resolved it. Final migration audit passed: **154 owned files**.

Full script **PASS**: **188 Python**, **32 Vitest**, **34 Playwright**; dependency
consistency, OpenAPI/TypeScript drift, TypeScript/Vite build and English migration
passed. Existing Starlette/httpx deprecation and Node color-environment warnings
remain visible. Separate fresh-install verification passed, including same-origin
font/illustration, genuine inference, neutral preview, unsupported scope, invalid
input, unavailable model, overload and slow bodies. No blind/test dataset was
opened for selection. Current analysis is always incomplete; no low finding was
unlocked and no new language-performance claim was made.

Final measured run on Apple M5/macOS arm64: fresh startup **61.741 s**,
offline restart **0.894 s**, sampled peak RSS **163.88 MiB**;
100 real sequential requests p50 **1.71 ms**, p95 **1.904 ms**, max **3.781 ms**.
Thirty-two requests/eight clients all returned HTTP 200; a separately saturated
admission test returned fixed 503, and all slow bodies returned fixed 408 after
five seconds. Corrupt-model liveness exited 0/readiness 1. Zero outgoing attempts
and empty application logs across all three processes; 29 package hashes
unchanged after successful inference and offline restart. These fictional
requests measured operation, not representative classifier accuracy.

[Measured machine-readable evidence](data/goal05-local-release.json) and
[English release instructions/evidence](DEPLOYMENT_REPORT.md) specify exact
measurements and limitations. CPU/RSS/loopback latency are development-host data,
not Linux container quotas, Internet latency or accuracy metrics. Compose uses a
provisional 512 MiB CPU-only budget with headroom over the measured process RSS;
Linux image execution and resource tuning must be checked on a Docker host.

**Blocked / skipped:** Docker CLI/daemon/alternative runtime absent (therefore no
build/run/healthcheck/image-size or enforcement success); no authorized existing
public destination (therefore no HTTPS/anonymous public access or proxy/hosting
logging verification). Official Hugging Face compute-Spaces paid-plan conditions
were rechecked on 11 October 2026 and linked in the release report; no account,
plan purchase or credentials were assumed. Only the clean local fallback is
verified. No public URL, publication, OCR or Devpost action.

## Goal 04 — simple English Style A interface

Started from a clean repository; preserved the real classifier, versioned API,
policy thresholds, review/splits, Czech evaluation provenance and local assets.
No dependencies were added and no foreign changes were overwritten.

- Style A retains the two-column desktop hero, local older/younger phone scene,
  mobile interaction-first layout, blue/navy/white tokens, rounded cards and
  self-hosted Inter. Rem sizes now respect the browser default; body 20px,
  buttons 18px at the standard default, actions at least 48px. No age/account,
  score, fake progress, safety badge, bilingual fallback or stored history.
- Text/language edits cancel an active request and clear previous result/error/
  help feedback. Request IDs also ignore transports that return after abort;
  unmount cleans up. The API keeps its ten-second deadline and fixed private-
  content-free errors. Duplicate submission is disabled while pending.
- Help receives only allowlisted template keys, not source text/full responses.
  Fixed neutral templates moved into the one English dictionary. Preview opens
  before a separate copy/share gesture. Copy writes only the preview; production
  code never reads the clipboard. Failed/unavailable copying selects it for
  manual copying and never claims success. Sharing cancellation/failure is
  reported honestly; a resolved native dialog is not proof of delivery.
- Brief polite live announcements sit outside the busy form; the result heading
  and help preview receive keyboard focus. Opening/copying the preview does not
  cause the entire result to be announced again. Actual screen-reader speech
  has not been tested.
- Real results remain incomplete review or evidence-supported amber suspicious.
  At most three reasons and actions; limitations stay visible. Green is a
  guarded future contract fixture only, with its safety limitation; production
  low-finding and red stronger-warning presentations remain disabled.

Executed commands from the repository root:

```sh
sh scripts/test.sh
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run test:e2e
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ui.mjs
python3 scripts/audit_migration.py
git diff --check
```

Actual results: full script **PASS** — **183 Python**, **32 Vitest**, **34
Playwright** tests across the actual FastAPI-served build and Vite API proxy;
dependency consistency, Python/TypeScript contract drift, TypeScript/Vite build
and migration audit passed. After the final compact announcement/default-font
adjustments, the frontend tests/build/browser checks were run again and passed.
Existing Starlette/httpx and Node color-environment warnings remain visible.

The separate visual harness passed **seven captures and 14 contrast pairs**:
1440px desktop initial/warning/help/review, 360px mobile warning/help/error,
320 CSS px reflow and 640px with 200% text enlargement. All captured images were
opened and visually inspected; no horizontal page overflow or hidden result
steps/limitations. A separate headed testing browser's native zoom control
explicitly showed **200%**; real submission/result/help and keyboard Tab to the
outlined copy control worked. No native sharing was sent. The preview itself
is a resizable textarea with vertical scrolling for long text.
[English verification report](UI_VERIFICATION.md),
[measured JSON](data/goal04-ui-verification.json) and
[native zoom record](data/goal04-native-zoom.json) state the precise scope.

Copy canaries were absent from the actual clipboard payload, fixed share
payload, browser console and result; existing backend log/no-egress tests also
passed. Test-only browser reads verify clipboard equality; no application read.
Network/malformed/missing model, pending/edit, cancellation, language changes,
keyboard, unavailable clipboard and late copy/analysis response checks passed.

Initial harness checks failed because CSS minification changes HEX case and
uses three-digit HEX; those measurement-parser defects were corrected before
the successful measurements. No test/security requirements were weakened.
The Chrome connector was unavailable; installed isolated testing Chromium
provided actual native zoom. Real screen reader, physical mobile/on-screen
keyboard, Safari/Firefox and human-participant checks are **NOT PERFORMED**.
Docker remains **UNTESTED** (no CLI/daemon); deployment is unperformed. Final
review/data approval and language-performance validation remain outstanding.
The temporary verification server/browser were closed; unrelated review
processes were left untouched.
Local commit follows verification. Stop here; no OCR or next goal started.

## Goal 03 — real flow verification and policy 2

Inspected the clean existing repository and retained its genuine Goal 02
integration. No dataset decisions or weights were replaced. The current flow is
text → bounded local sparse classifier → evidence-supported observed rules →
versioned policy → fixed English reasons/actions → neutral help preview and
separate user-initiated sharing. Manual copying uses the selectable preview;
no clipboard access, external agent or integration was added.

- Startup now checks the pinned selection-report hash, selected artifact
  path/hash, validation-selection record and exact threshold agreement. Missing,
  corrupt or inconsistent selection assets disable the model. Scores remain
  internal; the selected warning threshold is unchanged at **0.60**.
- `observed-requests-2` handles explicit login/security/authentication code
  requests and the verified routine-warning/negation gaps. A trailing warning
  cannot erase an earlier direct request. Evidence remains observed wording,
  never fraud proof or fabricated model attribution. Existing Czech test data
  and rules are retained. Complex quotations/paraphrases remain a documented
  finite-rule limitation.
- Policy **analysis-policy-2**, schema **1.1.0**. Real inference failure,
  insufficient text, partial coverage, unsupported/unspecified input language
  and pending approval cannot produce reassurance. Explicit observed evidence
  may still warn with rules-only/incomplete limitations. Spam/HTTPS/TLD/typos
  or shortened links are not rule evidence; cold PSL parsing remains offline.
- Backend contract checks passed before expanding frontend presentation. Client
  validation now rejects evidence/status, language-scope and help/completion
  contradictions. Style A distinguishes amber supported warnings, neutral
  review and unavailable analysis; completion is a separate visible label.
  Green remains reserved behind full guards and unreachable for this artifact.
  Stronger red warnings remain disabled without a validated presentation policy.
- Reasons and actions remain capped at three. Independent verification uses
  familiar contact details, never those from the message. Help drafts contain
  only approved fixed sentences, with no source, evidence, URLs, personal
  identifiers or codes. Recovery advice collects no secrets and executes no
  intervention. The source is processed in backend RAM, not solely in-browser.
- Docker now includes the pinned selection report needed at startup. An
  isolated fresh-process runtime test loaded the actual classifier/API using
  only packaged runtime assets, without raw training data or an encoder.
  This is not evidence of Docker execution.

Executed from the repository root, using existing local dependencies:

```sh
.venv/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
.venv/bin/python -m pip check
.venv/bin/python scripts/export_contract.py --check
npm --prefix frontend run contract:check
.venv/bin/python -m pytest -q
npm --prefix frontend test
npm --prefix frontend run build
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/verify_analysis.py
npm --prefix frontend run test:e2e
python3 scripts/audit_migration.py
git diff --check
command -v docker
sh scripts/test.sh
```

Actual results: initial API/contract suite **82 passed**; backend corrections
before frontend changes **96 passed**; final full suite **183 passed**. Client
**30 passed**. TypeScript/Vite build, Python/npm contract drift, dependency
consistency, offline model preparation and migration audit **PASS**. Browser
**20 passed** across the actual single-process build and Vite API proxy, including
EN/CZ evidence, no-URL requests, uncertain and unavailable states, canary preview/
share, no storage/external requests, and narrow reflow. The final consolidated
`scripts/test.sh` run passed; migration inspected **140 owned files**, including
the new machine-readable status report. Diff whitespace **PASS**.

Real API smoke measurement: **25 synthetic development requests**, zero network
attempts; p50 **0.953 ms**, p95 **3.972 ms**, max **37.223 ms** on macOS arm64,
Python 3.13.1. These are in-process TestClient timings including model/rules/ASGI
and cold bundled PSL, excluding first module import; not an HTTP deployment
benchmark or language-performance validation. [Measured JSON](../ml/reports/goal03-integration.json)
and [policy 2 verification status](../ml/reports/goal03-policy2-status.json)
contain no source-message text. Tests verify actual full 2,000-character input
with a trailing code request, reload/API inference, selection integrity,
threshold conflicts, overload, invalid scores/partial coverage, no-egress and
log/share canaries. Failure models and native-share simulations are test-only.

Docker CLI detection **UNAVAILABLE, exit 1**; build/run/healthcheck **UNTESTED**.
The existing Starlette/httpx deprecation and Node color-environment warnings
remain visible. Initial file discovery used a nonexistent `frontend/e2e`
path/glob; it failed and was corrected to the actual `frontend/tests` directory.
No application/build/test failure was concealed or security check weakened.
Real screen-reader use and public hosting/proxy/privacy checks were not performed.

Review, candidate, real artifact, selection report and model-config SHA-256 values
match the recorded pre-change pins. All production analyses remain incomplete:
final data approval and per-language validation are outstanding; policy 2 did
not retrain or unlock `no_strong_signals`. No final split, new model metrics,
blind challenge use, publication or deployment is claimed. This active
integration goal ends after verification and a local commit.

## Goal 01 — completed rechecks, awaiting submission and final approval

The owner completed all 45 label rechecks. Read-only verification confirms every
explicit label/language timestamp and metadata record, no pending rechecks and
zero workspace blockers. `draft_submitted=false`: no immutable approval-draft
file exists yet. The user must choose **Submit draft for separate final approval**
in the existing local workspace; its ready state is not final approval.

Current [REVIEW_DRAFT_ASSESSMENT](REVIEW_DRAFT_ASSESSMENT.md) supersedes the earlier
29-recheck snapshot below and lists all 45 current decisions and all 98 proposed
quarantine rows. Review balance is **15 HAM / 13 SPAM / 17 SMISHING**:
`row-000565` and `row-000891` now explicitly change original SPAM to SMISHING.
Both belong to singleton train groups. They create no additional mixed family
and do not alter candidate assignments or expose held-out message bodies.

Compared with the saved canonical review, 14 requested labels would return to
HAM and 17 would become SMISHING; the other 14 would remain unchanged. Only the
two identified SPAM → SMISHING decisions override original corpus labels.
All 45 language confirmations and reviewer metadata remain present: reviewer
`hugo`, 41 historical dates `2026-10-10`, four explicit re-confirmations
`2026-10-11`, with original historical date unknown. None are written to canonical.

The quarantine proposal remains **46 groups / 98 rows** (48 original SPAM / 50
original SMISHING). Conditional reviewed eligible counts are **4,844 HAM /
439 SPAM / 590 SMISHING**, **5,873 rows / 5,585 groups**, zero mixed eligible
groups and empty candidate split intersections. The original source archive and
the current model still retain original labels. The workspace flags retraining
as required if the two-label revision is approved; no training is authorized or
performed by this read-only check.

Actual commands and results:

```sh
PYTHONPATH="$PWD" .venv/bin/python .cache/review-draft-assessment/verify.py
.venv/bin/python -m pytest tests/test_review_validation.py tests/test_review_tool.py tests/test_training_preflight.py -q
python3 scripts/audit_migration.py
git diff --check
```

Read-only consistency **PASS**, including all 45 staged confirmations, two
singleton train overrides, 98 quarantine rows and protected before/after hashes.
**34 tests passed**, one existing Starlette/httpx warning. Migration audit
**PASS**, 139 owned files; diff whitespace check **PASS**. No runtime/UI changes;
build/browser/Docker checks not rerun. Only assessment/status documentation is
committed. Canonical review, raw archive, candidate, configuration and real model
remain unchanged. No submission, final approval, split freeze or retraining was
performed on the owner's behalf.

## Goal 01 — earlier staged-draft assessment, 11 October 2026 (historical)

[REVIEW_DRAFT_ASSESSMENT](REVIEW_DRAFT_ASSESSMENT.md) lists all 45 staged decisions,
their saved/source labels and dates, and every one of the 98 conditional
quarantine rows with its group and conflict reason. No submitted
`review.approval-draft-*.json` exists; the loopback validation workspace reports
`draft_submitted=false`, `quarantine_proposed=true`, and no final approval.
This assessment does not create human decisions or approve an exclusion.

- Canonical choices remain **1 HAM / 44 SPAM / 0 SMISHING**. The staged draft
  proposes reversing 14 HAM → SPAM and 15 SMISHING → SPAM corrections, producing
  **15 HAM / 15 SPAM / 15 SMISHING**, with zero original corpus label overrides.
- All 45 languages are explicitly confirmed `en` in the staged workspace.
  Reviewer `hugo` and dates are present for all 45: 41 historical dates remain
  `2026-10-10`; four missing attributions are explicitly re-confirmed
  `2026-10-11`, with their original historical date recorded as unknown.
- **29 label rechecks are present; 16 remain missing.** Existing saved choices
  are not treated as fresh rechecks. No completed submission is inferred.
- Independently recomputed source conflicts: **46 groups / 98 rows**, comprising
  **48 SPAM / 50 SMISHING**. Reasons: 32 normalized-duplicate groups, one
  conservative-template group, 13 near-copy/combined groups. These rows are
  already excluded from the existing candidate. Owner quarantine proposal is
  explicitly staged, but separate final approval is still withheld.
- Conditional eligible corpus: **5,873 rows / 5,585 groups**, **4,844 HAM /
  441 SPAM / 588 SMISHING**, with **zero mixed eligible groups**. Staged reversal
  removes the seven extra mixed groups / 29 rows that saved corrections would
  introduce. The 46 original raw conflicts remain documented, not relabeled.
- Candidate assignments remain 4,112 train / 881 validation / 880 test; group
  intersections are empty. No final freeze, held-out message inspection, model
  inference, training or canonical write occurred.

Read-only recomputation used the original archive, candidate, saved review and
existing loopback workspace. It checked source/member hashes, all expected IDs,
source/group/text-hash consistency, candidate checksum, explicit confirmations,
metadata, exact quarantine membership, eligible counts and workspace blockers.
Protected review/source/candidate/config/model SHA-256 values match before and
after; full pins and a text-free snapshot hash are in the assessment.

```sh
PYTHONPATH="$PWD" .venv/bin/python .cache/review-draft-assessment/verify.py
.venv/bin/python -m pytest tests/test_review_validation.py tests/test_review_tool.py tests/test_training_preflight.py -q
python3 scripts/audit_migration.py
git diff --check
```

Actual results: read-only consistency **PASS**; **34 tests passed**, one existing
unsuppressed Starlette/httpx warning; migration audit **PASS**, 139 owned files;
`git diff --check` **PASS**. The verifier/snapshot are local ignored `.cache/`
files and depend on the running staged workspace. No interface/runtime code
changed, so build/browser/Docker checks were not rerun. Only assessment/status
documentation is committed. Final review approval, freeze and training remain
explicitly withheld by the owner.

An additional ad hoc group-count check initially failed because it looked for
`group_id` on a source row. Rechecked through the actual grouping mapping:
**PASS**, 5,585 unique eligible groups. Report-table checks also **PASS**:
45 decision rows and 98 unique quarantine row IDs across 46 groups.

## Goal 01 — owner-supplied review validation follow-up (10 October, historical)

The owner supplied
`ml/data/mendeley-v1-audit-v2/review.validation-2026-10-10-4e674147a8a4.json`.
Report SHA-256:
`e362d9a78e20b543aab79bb7515beda33fd1793007631edc1ae2ab1f4a05ece9`.
Its revision matches the exact current `review.completed.json` SHA-256:
`4e674147a8a42f144aa90f023430c8e181566da4c8234de52b5b69ca459defa6`.
This supersedes the older four-decision review state recorded below. Historical
model/report and migration hashes remain evidence of their original runs.

Read-only verification with `tools.human_review.app.read_review`, `summary` and
`counters` passed: schema, source hash/version, 45 expected IDs and unchanged
original labels, all decisions/counters, 41 saved-change after-states and
language/attribution/exclusion flags match the canonical saved review. No source
message text was read or exposed and no review decisions were written.

- **16 source-label agreements, 29 requested corrections, zero pending labels.**
- Requested labels: **44 spam / 1 ham / 0 smishing**. Changes: all 15 source
  smishing → spam and 14 source ham → spam. The remaining ham and 15 source spam
  agree with original labels. This is the owner's saved selection, not an
  automatically corrected corpus. Clarification was requested about the unusual
  distribution; no alternate decisions were inferred.
- **45 languages still unconfirmed**; reviewer/date missing on four original
  entries: `row-000188`, `row-000244`, `row-000490`, `row-000565`.
- Zero proposed/approved individual exclusions. Existing automatic quarantine
  of **46 conflicting groups / 98 rows** lacks separate human approval.
- Corrections need an explicitly authorized, documented data revision and
  re-audit. The immutable candidate and original-label model remain unchanged.
  A zero-pending counter is not an approved split or completed Goal 01.

```sh
.venv/bin/python scripts/training_preflight.py
.venv/bin/python -m pytest tests/test_review_tool.py tests/test_training_preflight.py -q
python3 scripts/audit_migration.py
git diff --check
```

Actual results: metadata consistency **PASS**; approved preflight **EXPECTEDLY
BLOCKED, exit 2**, `training_allowed=false`, missing approved manifest, incomplete
label reconciliation, language and attribution/date/per-class approval. It loaded
no message text and trained nothing. **27 tests passed**, one existing unsuppressed
Starlette/httpx warning. No browser/build/full-suite rerun was needed for this
metadata/documentation follow-up. Migration audit **PASS**, 133 owned files; `git diff --check` **PASS**. No dataset/model assets, policy thresholds, split assignments or
human files were modified. Training and split freeze were not performed.

## Goal 01 — standalone local human review tool (historical tool-delivery state)

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
