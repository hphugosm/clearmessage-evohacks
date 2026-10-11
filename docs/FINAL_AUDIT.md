# ClearMessage final release audit — approved dataset and retrained model

11 October 2026 · starting commit `c1a8c9f` · Apple M5 / macOS arm64.

**GO for a reproducible local research prototype using the approved dataset.**
**NO-GO for public/production fraud-detector release.** Goal 01 review/quarantine/
frozen-split approval blockers are resolved; the genuine approved-data model is
integrated. Independent/language evaluation, completed low-finding validation,
Docker execution and public-host/privacy controls remain unresolved. No deployment,
publication, new product feature or Goal 08 was performed.

[Historical pre-approval audit](FINAL_AUDIT-provisional-20261011.md) is retained.
Passing technical checks and owner approval of the 45-row audit do not independently
validate every corpus annotation or prove fraud protection.

## 1. Verified functionality

The owner explicitly approved the staged review summarized in commit `c1a8c9f`:
all 45 decisions/languages, metadata/dates, restoration of 29 erroneous saved SPAM
choices, SPAM→SMISHING for `row-000565` and `row-000891`, and reversible quarantine
of exactly 98 records in 46 mixed families. No human decisions were invented.

Canonical schema/source labels/history are retained. Final decisions: 45 confirmed,
zero pending; final sample 15 HAM / 13 SPAM / 17 SMISHING; all 45 English, reviewer
hugo, 41 dates 2026-10-10 and four explicit re-confirmations 2026-10-11 (unknown
original dates not invented). Prior canonical bytes and notes are preserved.
The raw archive and candidate/provisional manifests/models/reports remain unchanged.

| Dataset stage | HAM | SPAM | SMISHING | Total |
|---|---:|---:|---:|---:|
| Original | 4,844 | 489 | 638 | 5,971 |
| Approved quarantine | 0 | 48 | 50 | 98 |
| Final eligible | 4,844 | 439 | 590 | 5,873 |
| Train | 3,391 | 307 | 414 | 4,112 |
| Validation | 727 | 66 | 88 | 881 |
| Previously evaluated test | 726 | 66 | 88 | 880 |

5,585 eligible groups; zero remaining mixed-label families. Quarantined families:
32 normalized-identical, one template, 13 near-copy/combined. Exact row IDs and
reasons remain in the approved staged snapshot; reimporting the untouched archive
can restore them. No permanent deletion or label propagation. Seed 20261010;
every existing split/group assignment is retained. Row/group/text/normalized/
template intersections are all empty. Final manifest is immutable with
`data_split_ready=true`. Preflight reconstructs the approved revision and refuses
tampered approval, review, quarantine, labels or assignments.

| Identity | SHA-256 |
|---|---|
| Source archive | `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3` |
| Previous review | `4e674147a8a42f144aa90f023430c8e181566da4c8234de52b5b69ca459defa6` |
| Approved stage | `b0644144df2f738c946b2fec60eaad6e43a0aeeede70fea03df03a507d2373bb` |
| Owner approval | `33c707bb012d2ed9a89cfb470c18821adc9c951d31ef52458bf04283ef2d540e` |
| Final canonical review | `0c4748e7400ec54fe7e8dae343f33597a10339e5f68d5453a292b9d255c80b36` |
| Final dataset split | `9fa155bd267fd5492523b297515b3b1a357832ce19e131357ba81198cf89b988` |
| Selected model | `b6e56c3f1d3428c4cc9aee2fe2caa2beb10bd30cabcf35df8da915041e3eb4e1` |
| Training report | `3721e1f04a448633e1fb503dd06c4db6f81ce2b10116726ae29acb7faef172cd` |

Mendeley V1 / DOI 10.17632/f45bkkt8pr.1 / CC BY 4.0, original authors credited in
[DATA_SOURCES](../DATA_SOURCES.md). Our two label corrections and quarantine are
documented separately from raw source labels/text. A 45-row audit is not full
annotation. Time/campaign metadata are unavailable; grouping can miss families.

Genuine Pipeline: word/character TF-IDF + balanced LogisticRegression; transforms
fit train only. Same predeclared C grid 0.5/2.0 and thresholds 0.60/0.75/0.90.
Frozen pinned MiniLM + our LR heads were compared after a small CPU batch benchmark.
Validation selected TF-IDF C=2.0 and threshold 0.60 again, before test scoring.
All saved candidates have project-generated JSON, actual reload/fresh-process parity
and reproducibility checks; encoder has full-tokenizer overflow rejection.
No untrusted pickle, runtime download, GPU or request-time training.

The API now loads the approved artifact/report, verifies hashes, selection and
provenance, and exposes review readiness honestly. Policy/rules/contract remain
`analysis-policy-2` / `observed-requests-2` / `1.1.0`; decision logic and threshold
are unchanged. Dataset approval does not validate language or low-finding policy:
**all analysis_complete values remain false**, and no_strong_signals/red stronger
warnings remain disabled. Failure/coverage/unsupported input cannot reassure.
Observed requests may warn during model failure, with rules-only limitations.

Existing safe recommendations and fixed neutral help preview/copy remain intact.
No original text, snippet, URL, name, account/code enters share payloads. English
copy/status metadata was corrected to remove the outdated incomplete-label-audit
claim while retaining explicit unverified-language/limited-check notice. No new
product feature or interface design was added; Style A/local assets remain intact.

## 2. Actual test results

- **199 Python / 32 Vitest / 34 Playwright PASS** through `sh scripts/test.sh`:
  dependency checks, contract drift, TypeScript/Vite build, real production-build
  and Vite-proxy API flow, privacy/log/share canaries, errors, unsupported scope,
  full maximum text, keyboard, pending/stale-input and safe copying.
- Approved-data preflight **PASS**, 45 confirmed reviews, zero blockers. Final
  source/manifest/hash verification **PASS**, all split intersections empty.
- New approval reconciliation tests **PASS**: reject false approval, changed
  staged hash/quarantine/source/pending attestation and tampered final label.
  Original/history/assignments remain preserved and repeat finalization identical.
- Clean metadata restoration **PASS twice** in a fresh temporary data workspace,
  reproducing exact canonical-review/final-split bytes from tracked metadata and
  original archive. Uses current Python dependencies; not a container test.
- All four actual model candidates **PASS** hash/reload/fresh-process inference,
  oversized/encoder-overflow abstention and repeated embedding/head checks.
  Repeated sparse train fits produce byte-identical artifacts; LR heads identical
  on fixed embeddings. Numerical encoder differences remain separately disclosed.
- Actual selected-model metrics/error IDs/majority and old/new comparison **PASS**
  independent recomputation with no fitting/tuning or network attempts.
- Both fictional human-review browser harnesses **PASS**, preserving actual source,
  canonical review and candidate; their mock decisions stay in disposable tests.
- Synthetic API smoke **PASS**, 25 actual requests across five fictional EN/CZ
  cases, no-egress; not a language benchmark. Historical report bytes preserved.
- Fresh UI harness **PASS** seven captures / 14 contrast pairs with approved model,
  no external requests, errors or storage. Fresh captures are automated; manual
  Goal 07/native zoom observations remain historical, not falsely repeated.
- Migration/diff checks pass; exact final owned-file count is in STATUS. Existing
  Starlette/httpx deprecation and Node color warnings remain visible.

Exact root-directory commands (new report/output names required on repetition):

```sh
.venv/bin/python scripts/finalize_data.py --approval ml/reviews/goal01-owner-approval.json --staged ml/reviews/goal01-approved-staged.json
.venv/bin/python scripts/training_preflight.py
.venv/bin/python scripts/prepare_data.py verify --manifest ml/manifests/mendeley-v1.split.json --input ml/data/raw/Dataset_5971.zip
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 .venv/bin/python scripts/train.py --manifest ml/manifests/mendeley-v1.split.json --output ml/artifacts/goal02-approved-v1 --report ml/reports/goal02-approved-v1.json --encoder-directory ml/artifacts/encoder
OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 .venv/bin/python scripts/verify_model.py --manifest ml/manifests/mendeley-v1.split.json --report ml/reports/goal02-approved-v1.json --output ml/reports/goal02-approved-verification-v1.json
.venv/bin/python scripts/audit_release.py --output docs/data/approved-model-audit-v1.json
.venv/bin/python scripts/prepare_model.py
sh scripts/test.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_tool_browser.mjs
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node tests/review_validation_browser.mjs
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ui.mjs
.venv/bin/python scripts/verify_analysis.py
.venv/bin/python scripts/verify_release.py --clean-install --report docs/data/approved-local-release-v1.json
python3 scripts/audit_migration.py
git diff --check
```

Goal 03/04 harnesses write historical paths; wrappers preserved/restored those
reports and copied fresh results to approved-release evidence. The model audit
initially rejected absolute-vs-relative metadata paths; normalization was fixed,
then recomputation passed. A metadata shell check used system Python missing
FastAPI; rerun with `.venv/bin/python` passed. Neither changed decisions/metrics.
The first clean-runtime run failed a browser assertion pinned to the old model
hash; it is a failed run, not a pass. The expected identity was updated to the
approved artifact without weakening flow/privacy/negative assertions.

### Fresh packaged runtime — actual completed check

The full clean-install rerun **PASS**: real approved-model HTTP/Chromium flows,
offline unchanged-asset restart, deliberately corrupt disposable model, health,
limits/admission, no-store, privacy canaries and zero outgoing network attempts.
Cold startup **66.358 s**, offline restart
**1.216 s**; sampled RSS real/restart/failed
**156.81/162.39/154.61 MiB**.
100 loopback requests: p50 **2.180**, p95 **3.416**, max **4.161 ms**.
All 29 runtime hashes unchanged after inference/restart. No Docker/Linux/
public-host claim. Detailed [deployment scope](DEPLOYMENT_REPORT.md),
[fresh runtime JSON](data/approved-local-release-v1.json),
[model reload](../ml/reports/goal02-approved-verification-v1.json),
[clean data restore](data/approved-data-clean-restore-v1.json),
[synthetic smoke](data/approved-api-smoke-v1.json),
[automated UI checks](data/approved-ui-verification-v1.json).

### Actual metrics and old/new comparison

These are annotation-agreement metrics on partially audited source labels.
The 880 test rows were already evaluated in Goal 02/07. This is **reused-test
comparison, not fresh blind or genuinely independent validation**. No reshuffle,
new benchmark fabrication, test-driven candidate/policy adjustment or blind
challenge inspection. Both models score identical unchanged validation/test rows.

Selected macro-F1: validation **0.876209**, reused test **0.863645**. Provisional
selected values are identical; **delta zero**, no prediction disagreements.
Majority HAM test macro-F1 **0.301370**. Actual weights/provenance/hash changed.
Frozen MiniLM C=0.5 validation/test **0.813473 / 0.845570**; C=2.0
**0.801229 / 0.839003**; neither selected using test results.

| Reused-test class | Precision | Recall | F1 | Support | FP | FN |
|---|---:|---:|---:|---:|---:|---:|
| HAM | 0.982265 | 0.991736 | 0.986977 | 726 | 13 | 6 |
| SPAM | 0.750000 | 0.727273 | 0.738462 | 66 | 16 | 18 |
| SMISHING | 0.891566 | 0.840909 | 0.865497 | 88 | 9 | 14 |

Confusion rows annotation / columns prediction, HAM / SPAM / SMISHING:

```text
720   5   1
 10  48   8
  3  11  74
```

Smishing FN: three predict HAM, eleven SPAM. Smishing FP: one source HAM, eight
SPAM. [MODEL_CARD](MODEL_CARD.md) contains validation metrics/confusion and all
licenses/hashes. [Training JSON](../ml/reports/goal02-approved-v1.json) and
[recomputed comparison](data/approved-model-audit-v1.json) contain error IDs and
per-candidate results, never raw message bodies or dangerous clickable examples.

Threshold-only calculation: 75 suspicious / 805 review, seven non-smishing
annotations warned, 20 smishing without warning. This is **not integrated API
coverage**. Actual policy with honest unspecified language gives **880/880 test
review**, also 881/881 validation review, zero observed warnings, inference errors
and completed checks. Review is abstention/uncertainty, not a reassuring negative.
This is a substantial utility limitation. Explicit EN permits experimental model
warnings, not a verified English benchmark; do not invent language confirmations.

| Language | Results |
|---|---|
| English | Separately unavailable: 45 training confirmations only, no verified evaluation-language denominator/FP/FN benchmark. |
| Czech | Separately unavailable: no actual development/blind records; retained synthetic behavior tests are not field validation. |
| Source aggregate | Partially audited annotation-agreement metrics; never relabeled English or merged with Czech. |

## 3. Remaining blockers

1. Genuinely independent, language-confirmed evaluation and fuller label quality
   audit. Already evaluated test data cannot certify new blind performance.
2. Validated language scope and completed low-finding policy. Current limited
   warnings/abstention do not establish protection or safety; no guard was unlocked.
3. Actual Docker/Linux/read-only/resource/network enforcement verification. No
   container tool/daemon exists here; updated Dockerfile is prepared, not tested.
4. Public destination authorization and anonymous HTTPS/proxy/hosting no-body-log/
   analytics controls, upstream partial-header/connection/rate protection. No URL
   exists, and no deployment/publication was requested or attempted.
5. Project distribution license and complete redistribution clearance/notices
   review, as recorded in THIRD_PARTY_NOTICES. Recorded source/encoder/font licenses
   are not blanket upstream clearance.

## 4. Known limitations

- Old source (2022), imperfect annotations, 45-row training audit only; time and
  campaign metadata unavailable; grouping can over/under-merge families.
- No sender/device/link verification, network reputation or general language
  reasoning. Narrow rules miss indirect/evasive requests and may flag benign ones.
- Internal classifier scores are not fraud probabilities. No safety labels or
  numeric user scores. Every analysis remains incomplete with visible limits.
- No real screen-reader speech, human participants, physical mobile/Safari/Firefox,
  current native 200% zoom repetition or actual native-share delivery. Automated
  accessibility/clipboard evidence is not WCAG certification or usability proof.
- Fresh local macOS execution differs from Linux/container quotas/Internet latency.
  Compose resource budgets remain provisional. Trusted ignored weights/source
  require explicit setup/restoration, never analysis/restart acquisition.
- OCR remains skipped; no external agent/integration/account/history/analytics.
  Already running owner dev/review processes were not silently restarted; new
  processes use the approved on-disk configuration.

## 5. Release recommendation

**GO: approved dataset and reproducible trained local research prototype.** Owner
approval is now documented; data/model identity and technical integration are
verified. Demonstrate fictional inert cases with visible limited-analysis notice.

**NO-GO: independently validated public/production fraud detector.** Resolve the
remaining language/independent-evaluation, policy, container, hosting/privacy and
licensing gates before a broader release claim. Do not call absence of warnings
safety, claim a fresh blind benchmark or tune thresholds from this reused test.
No deployment/publication or Goal 08 follows this work.

Final-source verification also passed after tightening model loading to reuse the
verified bounded report bytes (no second unchecked read). The exact final package
ran offline with real HTTP/browser/limits/canaries using the project environment;
[final package manifest and checks](data/approved-final-package-v1.json) records
all 29 file hashes. This complements the fresh-install run and is explicitly not
a second fresh install or Docker test.
