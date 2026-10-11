# Goal 09 progress

11 October 2026. Base: `a9a924d`; branch: `feature/clearmessage-product-experience`.
Worktree is attached to this chat under `/Users/hugo/.codex/worktrees/clearmessage-product-experience/`; obtain its checkout directory with `git rev-parse --show-toplevel`.
Main was clean and remains untouched. No merge, publishing or deployment is authorized.

## Plan and checkpoints

A. Establish regression baseline; refine Style A with native typography, restrained colors and centered layout. Verify and commit.
B. Add feature-flagged PNG/JPEG browser OCR with same-origin assets, bounded validation, editable review and explicit confirmation. Verify real OCR and commit.
C. Expose only rule offsets, validate highlights, add curated situation checklists and retain neutral sharing. Verify semantics/failures and commit.
D. Add `/how-it-works` with report-verified data, methodology, limitations and privacy. Verify and commit.
E. Exercise actual complete flows, accessibility/reflow/errors and clean packaged release; document and commit.

Frozen files: model config/artifacts, training reports, dataset/source/review/quarantine/split metadata, rules expressions and classification thresholds. Canonical audits are historical evidence and will not be overwritten. Runtime resources were independently copied using APFS clones; dependencies are local to this worktree.

## Current checkpoint

Baseline `sh scripts/test.sh` PASS: 199 Python, 32 Vitest, 34 Playwright tests; migration, dependency, contract and build checks pass. A PASS: refined tokens/layout/copy with `npm --prefix frontend run build` and all 34 browser regressions (12.4s). Existing Starlette/httpx and Node color warnings remain. Initial new-doc migration audit failed on the operational legacy checkout path; the authored reference was corrected, without changing the scanner. Same-origin mark retained; decorative hero removed per authorized refinement. A–E implemented and verified; final documentation/clean commit handoff is active. Feature additions stop by 16:30 Europe/Prague; final verification and handoff take priority.

## Milestone B — SafeScan

Pinned OCR packages acquired at explicit setup; generated same-origin resources are ignored and restored/verified during build/dev startup. A small broker owns the native Tesseract worker (inspected v6.0.1 protocol) so initialization failures, timeouts, cancellations and unmounts terminate it. English-only recognition; byte signature/header and decoded-pixel checks; raster/canvas cleanup; no object URLs, persistent cache or image upload. Review edits revoke confirmation; checking requires a separate user gesture. Feature flag `VITE_ENABLE_OCR=false` hides screenshot input and preserves paste input.

Executed: 18 new OCR unit tests (50 client tests total) PASS; five production browser tests PASS, including real PNG and JPEG recognition, drag/drop, review/confirmation, actual approved-model API and neutral help. Full regression results are recorded below after completion. Canonical model/data untouched; no external requests, cookies or IndexedDB in real OCR tests. Native browser memory release depends on browser garbage collection after explicit cleanup; no claim of forensic erasure.

B final regression `sh scripts/test.sh` PASS: 199 Python / 50 Vitest / 44 Playwright (production and dev proxy), contract/dependency/migration/build checks PASS. Browser suite 24.0s. OCR assets approximately 31.66 MiB before HTTP compression. A commit `aefb818`; B commit follows this checkpoint.

## Milestone C — explanations and ActionGuide

Optional evidence spans expose the existing rule offsets only (no snippets, scores or model attribution); backward-compatible missing offsets show general explanations. The UI validates Unicode code-point bounds and escapes expanded phrases; no URL links. Five local curated situation checklists collect no secrets, perform no interventions and never enter the fixed help draft. Input edits reset checklist state.

`sh scripts/test.sh` PASS after correcting an initially miscounted expected offset: **209 Python / 63 Vitest / 54 Playwright**, build/migration/contract/dependency checks PASS. Initial run: **208 Python passed / 1 failed** (expected end 27; the actual unmodified rule correctly ends at 28). The assertion and API example were corrected, not the rule. Browser 36.1s. New real-API exact spans, Unicode/HTML/URL masking, negation, legacy/no-offset and model-only behavior, all situations, uncertain analyses and privacy-safe clipboard tests PASS. B commit `47496f2`; C commit follows.

## Milestone D — Behind the AI

`/how-it-works` uses the same-origin app shell and minimalist system. Aggregate facts are exported from the hash-pinned approved report and split; `--check` rejects drift. Counts, per-class metrics and confusion matrix are displayed with the previously evaluated test-set disclosure, unavailable independent English/Czech benchmarks, partial label-audit scope, pretrained comparison/OCR credits and local-only release/privacy limits. No model, dataset, threshold or decision rule changed.

`sh scripts/test.sh`: **211 Python / 63 Vitest PASS**, dependency/migration/contract/export/build PASS; browser collection initially failed on Node JSON-import syntax (no browser tests executed). After fixing the test import, browser runs exposed an incorrectly rounded expected precision and a real pipeline overflow at 200% text enlargement. The expectation now derives from the verified fact file; pipeline/header wrapping fixes the overflow. Final `npm --prefix frontend run build` and `npm --prefix frontend run test:e2e` **PASS: 58 Playwright, 29.0s**. All metrics, reload/return navigation, 360px/200% text reflow and keyboard expansion pass. C commit `abc7ba8`; D commit follows.

Native Chrome zoom could not be exercised: Chrome is not connected to computer use and the Mac was locked with automatic unlocking unavailable. This is separate from passing Chromium 200% text/reflow tests. Actual in-app-browser visual inspection is available; Docker CLI/daemon remain absent. These limitations are retained for the final test report.


## Milestone E — complete journey, quality and handoff

Final `sh scripts/test.sh` **PASS: 217 Python / 68 Vitest / 62 Playwright** (Python 15.80s, browser 54.7s), with migration/dependency/contract/aggregate-fact/build checks. Owned OCR buffers now clear on failure as well as success; synchronous worker-post failures clear timers/handlers. Runtime packaging requires the entire pinned OCR asset set and rejects tampering, missing/extra assets and symlinks. Worker embedded notices plus installed full dependency/React licenses are bundled; unresolved weight/bundled-code distribution scope remains explicit. OCR assets measured **33,195,743 bytes / 31.66 MiB**, 20 files before HTTP compression.

E targeted runtime 11 and OCR client 23 tests passed, then build caught two TypeScript mock/ArrayBuffer typings; fixed without weakening checks. Expanded OCR browser run initially had three pass/one fail/three not run because the hidden file input duplicated the visible picker in the accessibility tree. The native input is now actually hidden; seven production OCR tests passed in 16.4s. Real long OCR remains fully editable above 2,000 characters, cannot submit until shortened, and blank OCR is an error. New 360px keyboard and 200% text checks pass. Visual review fixed cramped mobile header spacing; metric regions now scroll with keyboard focus.

The extended release walkthrough initially used an incorrect Copied-button selector and matched both visible/hidden metric cells; these test selectors were corrected to the actual status/summary. Actual complete walkthrough subsequently passed. Two clean locked local-release executions PASS, including real OCR/model/explanations/guidance/clipboard/transparency, ordinary/unsupported messages, throwaway corrupted-model behavior, offline restart, bounded HTTP/body admission, empty logs/canaries and zero outgoing socket/DNS attempts. The later run covers final product/OCR asset identities: cold startup 70.028s, offline restart 2.339s, peak sampled RSS 157.56 MiB, 100 actual analyses p50 3.059ms/p95 4.905ms. This is not Docker or a public deployment. Evidence is newly written to `docs/data/goal09-local-release.json`; canonical release/audit findings stay unchanged.

`verify-product-ui.mjs` PASS: 15 layout captures/15 contrast pairs, desktop/tablet/360/320px, errors/help/guidance/transparency and 200% root text. A fresh full Chromium profile also passes **true native Page zoom 200%**: 1,440 physical viewport pixels → 720 CSS pixels, devicePixelRatio 2, unchanged 16px root/20px body font declarations. Five native-zoom viewport captures include real OCR review. Visual inspection caught Playwright full-page capture clipping at native zoom; the verifier now preserves the actual viewport and checks its 1,440px PNG width, with no app/zoom change. This resolves the page-zoom requirement despite unavailable desktop Chrome/locked Mac UI. Generated test profile removed; user settings unchanged. Separate actual OCR-disabled production build PASS. Actual Codex in-app-browser paste/result/quote/transparency and synthetic screenshot OCR/confirmation/model flow visually/accessibility-tree inspected and PASS. Actual screen-reader speech, Safari/Firefox/physical-mobile/human usability remain unverified.

Documentation includes updated Brand Bible/UI copy/README, implementation/test/handoff reports, synthetic PNG demo fixture and a short manual recording walkthrough. No video or Devpost submission is claimed. A `aefb818`; B `47496f2`; C `abc7ba8`; D `359e329`; E is the commit containing this final checkpoint. Final diff/migration/frozen-file/main-state inspection precedes that commit.


Final inspection: `python3 scripts/audit_migration.py` PASS (212 owned files); `git diff --check` PASS. Diff against `a9a924d` is empty for model config/inference/rules, all `ml/` files and the canonical final/model/deployment/approved audit reports. Main `git status --short` is empty and HEAD remains `a9a924d`. Only the feature checkout is committed. Product code has not changed since the 217/68/62 full pass; final additions are verification captures/documentation. User-facing preview saved at `docs/data/goal09-desktop-preview.png`; synthetic OCR demo image contains no actual secret or URL. Final E commit is resolved through `git log -1 --oneline` in this branch.


## Milestone E continuation — cross-engine accessibility and release evidence

The owner requested “continue” after E commit `8a26d3d`. Reused the clean isolated feature checkout and current Goal 09 scope. Acquired pinned Playwright Firefox 157.0/revision 1555 and WebKit 27.2/revision 2370 once under the project's ignored browser cache using `playwright install --no-remove --no-progress firefox webkit`; no global install, browser preference change, new model or main-checkout edit.

Cross-engine runs found and fixed three actual accessibility problems: WebKit's native select was 28px high; focused overflowing metrics regions did not scroll with arrows; OCR cancellation removed the focused control and lacked an announcement. The select retains native semantics with an original bundled chevron and shared minimum height. Table regions scroll on focused unmodified left/right arrows. Cancellation returns picker focus and announces that no analysis ran; a fresh real OCR attempt succeeds afterward.

Initial cross-engine runs: 43 pass/1 fail/14 not run (selector), 52 pass/1 fail/5 not run (macOS native Tab assumption), then 61 pass/1 fail (table scrolling). WebKit keyboard tests now use native Option+Tab, without changing user settings. The added cancellation regression failed before the fix, then passes in all engines. The first full continuation regression passed 217 Python/68 client but stopped at 29 browser pass/1 fail/36 not run: an old worker-cancellation test raced image decoding. It now waits for a created worker before testing initialization cancellation, preserving the cleanup assertion.

Final `sh scripts/test.sh` PASS: **217 Python / 68 Vitest / 66 Chromium Playwright**, Python 6.27s/browser 40.6s, migration/dependency/contract/fact/build checks. Final `npm --prefix frontend run test:e2e:cross` PASS: **64**, Firefox 31/WebKit 33, 32.3s; no selected skips, failures or retries. Native keyboard and clipboard checks are separate: WebKit uses its supported clipboard-read permission and passes actual preview read-back; Firefox's two read-back cases are explicitly filtered because its automation protocol cannot grant them. Both cases remain in Chromium/WebKit. Manual preview, denied/missing clipboard and sharing fallbacks run in Firefox. Four focused Chromium production/dev clipboard checks pass after that permission setup. Browser evidence is `docs/data/goal09-cross-browser.json`; the raw test JSON stays ignored.

`verify-product-ui.mjs` PASS again: 15 layout captures/15 contrast pairs and five genuine native Chromium 200% zoom captures. Updated desktop preview copied from the actual new capture. Actual in-app-browser reload shows a 50px native selector; updated WebKit 360px capture visually inspected without document overflow. A third fresh hash-locked release PASS with 51 runtime files, real OCR/model/highlights/guidance/clipboard/transparency, truthful failed-model behavior, zero outgoing attempts, empty application logs and unchanged runtime assets after restart. New host observations: cold startup 74.759s, offline restart 1.061s, sampled peak RSS 163.53 MiB; 100 analyses p50 1.784ms/p95 2.143ms. These replace current Goal 09 JSON observations, without inventing a performance gain or rewriting historical E timings.

Updated README/setup, Brand Bible, implementation/test/handoff and current STATUS preamble. Actual Safari, physical mobile, spoken screen reader/human usability, independent language evaluation, Docker/public hosting/privacy and redistribution gates remain unverified. Protected ML/data/policy and canonical audit files remain unchanged against `a9a924d`; no merge, deployment, publishing or video/submission. Final migration/diff/main-state checks precede the local continuation commit; resolve its identity with `git log -1 --oneline`.

Final continuation inspection: migration audit PASS (215 owned files), `git diff --check` PASS; main checkout clean at `a9a924d`. Protected-file diff is empty, and the recorded model/report/split hashes and cross-engine source hashes match their actual files. These verified changes are staged for the local continuation commit.
