# Historical Goal 07 audit before final approval

Superseded by [FINAL_AUDIT](FINAL_AUDIT.md) after explicit owner approval and retraining.

# ClearMessage final release audit — Goal 07

11 October 2026 · starting commit `e0323fb` · Apple M5 / macOS arm64.

**Recommendation: NO-GO for an approved detector/public release.** The genuine
provisional text prototype works locally and its technical checks pass. Goal 01
was **not formally finalized**, no final approved Goal 02 model exists, and no
public application/model was deployed. Passing software tests does not approve
human labels, quarantine decisions, language performance or a hosting environment.
No features, model/policy changes, retraining, review decisions, split freezing,
deployment, publication or Devpost submission were performed by this audit.

## 1. Verified functionality

### Formal Goal 01 and Goal 02 checks first

| Evidence | Verified finding |
|---|---|
| Canonical `review.completed.json` | 45 saved decisions: **16 confirmed / 29 disagreed**, zero pending label decisions. Disagreements have not been reconciled into approved training labels. |
| Languages and reviewer metadata | **45 pending language fields**, **four missing attributions**. Approved-data preflight also rejects missing/invalid review dates and incomplete per-class confirmations. |
| Quarantine | **98 rows in 46 conflicting groups** are automatically omitted from the candidate/provisional corpus; canonical `exclusions_approved_by` is blank. This is not approved human quarantine. |
| Submitted validation draft | The existing dated validation file explicitly says `goal01_complete=false`, `dataset_exclusions_approved=false` and `split_frozen=false`. The historical RAM-staged draft recorded in STATUS is not durable final approval. |
| Final frozen split | `ml/manifests/mendeley-v1.split.json` **does not exist**. Candidate/provisional manifests have `data_split_ready=false`. The candidate's row/group/text/normalized/template split intersections are empty; this integrity check does not finalize the split. |
| Current runtime | Artifact and selection-report hashes match our selected **TF-IDF C=2.0** provisional Goal 02 result; the internal warning threshold remains **0.60**. |
| Approved final Goal 02 results | **Absent.** Artifact/report provenance explicitly says `human_review_complete=false`, `original_labels=true`, `language_performance_verified=false`. It points to the provisional manifest, not an approved final split. |
| Deployed model | **None to verify.** There is no public URL or authorized existing destination; local runtime equivalence is verified separately. |

The source archive is hash-verified: 5,971 records, **4,844 ham / 489 spam / 638
smishing**, Mendeley V1, DOI 10.17632/f45bkkt8pr.1, CC BY 4.0, with provenance in
[DATA_SOURCES](../DATA_SOURCES.md). The provisional eligible corpus has **5,873**
records (**4,844 ham / 441 spam / 588 smishing**). These counts use original labels
and automatic conflict omission, not the proposed reviewed corrections. A final
approved eligible count cannot yet be certified.

| Provisional split | ham | spam | smishing | Total |
|---|---:|---:|---:|---:|
| Train | 3,391 | 309 | 412 | 4,112 |
| Validation | 727 | 66 | 88 | 881 |
| Test | 726 | 66 | 88 | 880 |

Seed **20261010**. Exact checked identities:

| Evidence | SHA-256 |
|---|---|
| Canonical review | `4e674147a8a42f144aa90f023430c8e181566da4c8234de52b5b69ca459defa6` |
| Raw archive | `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3` |
| Candidate manifest | `51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0` |
| Provisional manifest | `21b3089b3e0aa56d076efef258f16cf4a2b8e9a4a27494d0ecf902a02bf2f9f5` |
| Selected project JSON | `7fe727cfb7868445f07ad32b0449131165268a8c5cbd8bafb71dd2b5178747fa` |
| Selected experiment report | `b0d359771769be9f983370eec8599b7be13a6b55c4bc274259694a317eef3715` |

### Local application, safety, privacy and sharing

- Pasted text reaches the actual trained word/character TF-IDF + LogisticRegression
  classifier and transparent rules through FastAPI. Real production-build and
  Vite-proxy browser flows pass; no production fixture/model override is used.
- `suspicious`, `review` and `no_strong_signals` remain distinct from training
  labels. Current policy 2 always reports `analysis_complete=false`; low findings
  and stronger red presentations remain disabled. Inference failure/busy,
  corrupt/missing model, insufficient/unsupported text and coverage failures
  cannot produce a completed reassuring result. Observed requests can still
  warn with rules-only limitations during failure.
- Rules support requests for secrets, immediate payment and secrecy; negation,
  routine security notices, advertising and conflicting instructions are tested.
  Specific reasons require actual observed evidence; classifier-only wording is
  general. Spam, HTTPS/TLD, spelling and short URLs alone are not fraud evidence.
- Limits are 2,000 code points, 32 KiB body, eight admitted HTTP requests, one
  inference slot and five-second body receive deadline. Saturation/slow bodies
  return fixed 503/408 with no-store. Health separates live service from loaded
  model readiness; corrupt-model liveness succeeds and readiness fails.
- Application logs/response/browser/share canaries pass; validation and exception
  bodies do not echo private input. Text stays in backend RAM, not entirely in the
  browser. No app history/storage/cookies/analytics, user-message cache/training or
  third-party analysis API. Every tested response uses no-store.
- Fresh startup, inference, restart and failure run with outgoing socket/DNS/UDP
  attempts blocked and recorded: **zero attempts**. URL parsing is syntactic;
  tldextract PSL refresh and cache are disabled. No message URL was visited.
- Help preview receives only allowlisted keys and fixed neutral English sentences.
  Actual isolated Chromium copying matches the preview and excludes source text,
  snippets, links, names/accounts/codes. Preview and separate gestures precede
  copy/share; cancellation/denial/missing support retain honest manual fallback.
  Native share cancellation/failure is simulated in tests; actual recipient
  delivery was not tested or performed.
- English ClearMessage naming, `lang=en`, one dictionary, metadata/accessibility
  names and first-party docs pass migration checks. Czech inputs/provenance remain
  data exceptions, not a bilingual UI. Style A/local Inter/SVG are preserved.
- Keyboard/focus/live-region assertions, reduced motion, 20px body/18px buttons,
  controls at least 48px, 14 contrast pairs and seven visual captures pass. All
  seven fresh fictional-input images were opened and inspected: desktop,
  360px mobile, 320 CSS px reflow, 200% text enlargement and empty-error state.
  No horizontal page overflow or hidden result actions/limitations. The neutral
  preview textarea intentionally scrolls. Native 200% browser zoom evidence is
  from Goal 04 and was not repeated; real screen-reader speech is unverified.

## 2. Actual test results

Executed with project-local locked dependencies; no global installation.

| Command/check | Actual outcome |
|---|---|
| `sh scripts/test.sh` | **PASS**: 188 Python, 32 Vitest, 34 Playwright; pip consistency, OpenAPI/TypeScript drift, TypeScript/Vite build and migration. |
| `.venv/bin/python scripts/training_preflight.py` | **BLOCKED, exit 2**, as expected: approved manifest missing, incomplete label reconciliation/attribution/dates/languages/per-class confirmations. No source text or model loaded by preflight. |
| `.venv/bin/python scripts/prepare_data.py verify --manifest ml/manifests/mendeley-v1.split.candidate.json --input ml/data/raw/Dataset_5971.zip` | **PASS candidate integrity**: source/manifest hashes match; all leakage intersections empty; explicitly not approved/frozen. |
| `.venv/bin/python scripts/audit_release.py --output docs/data/goal07-model-audit.json` | **PASS consistency**: actual selected-model inference on 881 validation and 880 test records exactly reproduces classifier metrics/error IDs, majority baseline and historical CLI policy. Current policy also checked separately; no fit/tuning, no egress. |
| `.venv/bin/python scripts/verify_release.py --clean-install --report docs/data/goal07-local-release.json` | **PASS fresh local runtime**: locked runtime-only venv, clean npm build, genuine HTTP/Chromium flows, offline unchanged-asset restart, corrupt-model failure, limits/admission, no-store and canaries. **Not Docker.** |
| `OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 .venv/bin/python scripts/verify_model.py --report ml/reports/goal02-provisional-v2.json --output docs/data/goal07-model-reload.json` | **PASS all four saved candidates**: hash/reload/fresh-process prediction parity, oversized review; frozen encoder overflow review and repeated first-32 embedding difference 3.8743e-7. No training/download. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_tool_browser.mjs` | **PASS** fictional temporary review flow; canonical review hash unchanged. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_validation_browser.mjs` | **PASS** fictional draft/language/metadata/quarantine/submission flow; canonical/source/candidate unchanged; no approval/freeze/training. |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ui.mjs` | **PASS** seven captures and 14 contrast pairs; preserved historical Goal 04 report and saved this run as Goal 07 evidence. |
| `.venv/bin/python scripts/verify_analysis.py` | **PASS**: 25 real API smoke requests across five fictional EN/CZ development cases, with no-egress guard; historical Goal 03 report preserved, fresh output copied to Goal 07. Not language accuracy. |
| `python3 scripts/audit_migration.py` / `git diff --check` | **PASS**; final owned-file count recorded in STATUS. |
| Docker/Linux/Compose enforcement/public hosting | **NOT RUN / BLOCKED**: no docker/podman/nerdctl/colima/limactl or authorized deployed destination. No invented public URL. |

Existing Starlette/httpx deprecation and Node color-environment warnings remain
visible. No test/security check was weakened. Audit-script output paths must be
new: existing reports are never overwritten. Tests that simulate failures/future
states are explicitly confined to tests, not evidence of production green output.

Fresh local measurements: **68.646 s** cold startup, **0.979 s** offline restart;
sampled peak RSS **159.55 / 161.92 / 154.25 MiB** for real/restart/failed model.
100 alternating short/near-limit HTTP requests: p50 **1.840 ms**, p95 **2.276 ms**,
max **3.296 ms**. CPU threads/inference are bounded; these are Apple M5 process-RSS
and loopback measurements, not enforced Linux quotas or Internet latency.

Machine-readable evidence:
[model/approval/error audit](data/goal07-model-audit.json),
[fresh local runtime](data/goal07-local-release.json),
[all-candidate reload](data/goal07-model-reload.json),
[UI/contrast/layout](data/goal07-ui-verification.json),
[synthetic API smoke](data/goal07-api-smoke.json).

### Recomputed classifier errors and policy coverage

The following are **agreement with unapproved source annotations**, not verified
fraud ground truth. Existing fixed selection was checked before reopening test
for audit. No held-out result changed model/policy/thresholds; blind challenges
were not opened. Macro-F1: validation **0.876209**, test **0.863645**. Train-majority
ham baseline test macro-F1 **0.301370**.

| Split / class | Precision | Recall | F1 | Support | FP | FN |
|---|---:|---:|---:|---:|---:|---:|
| Validation ham | 0.986395 | 0.997249 | 0.991792 | 727 | 10 | 2 |
| Validation spam | 0.736842 | 0.848485 | 0.788732 | 66 | 20 | 10 |
| Validation smishing | 0.957143 | 0.761364 | 0.848101 | 88 | 3 | 21 |
| Test ham | 0.982265 | 0.991736 | 0.986977 | 726 | 13 | 6 |
| Test spam | 0.750000 | 0.727273 | 0.738462 | 66 | 16 | 18 |
| Test smishing | 0.891566 | 0.840909 | 0.865497 | 88 | 9 | 14 |

Confusion matrices, rows source / columns prediction, order ham / spam / smishing:

```text
Validation (881)          Test (880)
725   1   1               720   5   1
  8  56   2                10  48   8
  2  19  67                 3  11  74
```

Of the test's 88 source-smishing rows, **3 predict ham / 11 spam**; the nine
smishing false positives originate from **1 source ham / 8 source spam**.
Error IDs/labels are reproducible in JSON; no raw source message/dangerous link
is published as an example.

The original Goal 02 **CLI** threshold policy yields **75 suspicious / 805 review**,
68 source-smishing warnings, seven non-smishing warnings and 20 source-smishing
rows without an explicit warning. Completed-analysis coverage is zero.
These counts are **not integrated API policy results**.

With the current policy 2 and honest `message_language=auto` for this
unverified-language corpus, actual policy inference gives **881/881 validation
and 880/880 test rows as review**, zero observed-rule warnings, zero inference
errors, zero completed analyses. All 88 source-smishing test rows lack an explicit
warning. This is a substantial utility/coverage limitation, **not 880 reassuring
negative findings**. Classifier warnings require an explicit English hint; assigning
English to the whole corpus to obtain the CLI count would invent confirmations.
Narrow rules do not establish fraud detection performance. No policy was tuned
from these audit results.

### English and Czech are reviewed separately

| Evaluation scope | Actual state |
|---|---|
| English | **No verified English benchmark/denominator or language-specific FP/FN metrics.** Original report `language_results.english=null`; canonical language confirmations are pending. Fictional English regression cases verify behavior only. |
| Czech | **No verified Czech benchmark/denominator or language-specific FP/FN metrics.** Original report `language_results.czech=null`; only format/schema/instructions and synthetic regression inputs exist, with no actual development/blind challenge records found. |
| Source-language aggregate | Recomputed provisional metrics above; **not renamed English or merged with Czech**. |

Frozen multilingual MiniLM is a comparison encoder with our trained LR head,
not our pretrained/fine-tuned encoder and not the deployed runtime. Encoder
license/revision/hash provenance remains in MODEL_CARD/encoder asset manifest.
Synthetic fixtures are neither representative validation nor actual human testing.

## 3. Remaining blockers

1. Final human approval/reconciliation of 45 decisions, complete language/reviewer
   metadata and explicit approval of proposed quarantine. A draft/staged selection
   cannot substitute for approval; no human decisions were invented here.
2. An approved final frozen dataset split with pinned review/source hashes and
   empty group intersections, followed by separately authorized final Goal 02
   training/selection/evaluation on that approved dataset. Current artifact remains
   the expressly authorized original-label provisional experiment.
3. Verified language-specific data/performance and validation of any completed
   low-finding policy. Default unspecified-language warnings have no demonstrated
   corpus coverage here. The current abstention guard stays intact.
4. Actual Docker build/run/read-only/resource/network enforcement and public
   destination authorization. HTTPS, anonymous public access, proxy/hosting body
   logging, secret/analytics controls and deployment artifact identity are untested.
5. Upstream partial-header/connection/rate protection before public exposure;
   application admission/body bounds do not cap every idle TCP connection.
6. Project distribution license and complete redistribution clearance/notices
   review remain outstanding as documented in THIRD_PARTY_NOTICES. Nothing was
   published; recorded dataset/encoder/font licenses are not blanket permission.

## 4. Known limitations

- Source annotations are disputed, metadata incomplete, source dated 2022 and
  campaign/time split metadata unavailable. Grouping is conservative and may miss
  paraphrase/translation families. Hash identity is not an independent publisher
  authenticity checksum or proof of data quality.
- All actual current assessments are incomplete. Review is uncertainty/abstention,
  not safety; the model does not verify senders, links, devices or transaction intent.
  Spam is not interchangeable with smishing. Rules can miss indirect/sophisticated
  wording and can flag benign requests; no numerical fraud probability is exposed.
- No representative English/Czech challenge or field evaluation, human participant
  observations, real screen-reader, physical mobile keyboard, Safari/Firefox or
  actual native-share delivery testing. Accessibility assertions are not WCAG
  certification. Historical native zoom is distinguished from this audit's text
  enlargement/reflow checks.
- Fresh local runtime requires trusted ignored model restoration plus explicit
  dependency installation. Linux image/platform/quotas/image size are unmeasured;
  512 MiB/one-CPU Compose settings and 120-second startup grace are provisional.
- OCR was skipped; no screenshots, camera, PDF, remote browsing, cloud OCR or
  multimodal service. No added age/account/history/integration features.

## 5. Release recommendation

**Do not describe or publish this build as a finalized, approved fraudulent-message
detector.** Goal 01/approved Goal 02 and deployment gates are unresolved.

A **local development/demo prototype** may be demonstrated using fictional inert
messages, with the visible incomplete-review/language notice, genuine classifier,
observed-rule basis and independent-verification advice. Cite source-label metrics
only with their provisional annotation/language scope and distinguish CLI policy
from current integrated behavior. Preserve review/error abstention; do not unlock
low findings or adjust thresholds using the audited test set.

No critical failing runtime/privacy regression was found in the executed scope.
One misleading documentation phrase (“approved project artifact”) was corrected
to **hash-pinned provisional project artifact**, and “frozen candidate” to
**immutable provisional manifest**. A reproducible read-only model-audit script
and evidence reports were added; no product feature or production behavior changed.
Final approval, reconciliation, training and hosting remain separate authorized
work. Stop after Goal 07; no next goal, deployment or publication was started.
