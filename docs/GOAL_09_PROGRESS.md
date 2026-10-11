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

Baseline `sh scripts/test.sh` PASS: 199 Python, 32 Vitest, 34 Playwright tests; migration, dependency, contract and build checks pass. A PASS: refined tokens/layout/copy with `npm --prefix frontend run build` and all 34 browser regressions (12.4s). Existing Starlette/httpx and Node color warnings remain. Initial new-doc migration audit failed on the operational legacy checkout path; the authored reference was corrected, without changing the scanner. Same-origin mark retained; decorative hero removed per authorized refinement. B in progress; OCR packages being explicitly acquired at setup time. Feature additions stop by 16:30 Europe/Prague; final verification and handoff take priority.

## Milestone B — SafeScan

Pinned OCR packages acquired at explicit setup; generated same-origin resources are ignored and restored/verified during build/dev startup. A small broker owns the native Tesseract worker (inspected v6.0.1 protocol) so initialization failures, timeouts, cancellations and unmounts terminate it. English-only recognition; byte signature/header and decoded-pixel checks; raster/canvas cleanup; no object URLs, persistent cache or image upload. Review edits revoke confirmation; checking requires a separate user gesture. Feature flag `VITE_ENABLE_OCR=false` hides screenshot input and preserves paste input.

Executed: 18 new OCR unit tests (50 client tests total) PASS; five production browser tests PASS, including real PNG and JPEG recognition, drag/drop, review/confirmation, actual approved-model API and neutral help. Full regression results are recorded below after completion. Canonical model/data untouched; no external requests, cookies or IndexedDB in real OCR tests. Native browser memory release depends on browser garbage collection after explicit cleanup; no claim of forensic erasure.

B final regression `sh scripts/test.sh` PASS: 199 Python / 50 Vitest / 44 Playwright (production and dev proxy), contract/dependency/migration/build checks PASS. Browser suite 24.0s. OCR assets approximately 36 MiB before HTTP compression. A commit `aefb818`; B commit follows this checkpoint.

## Milestone C — explanations and ActionGuide

Optional evidence spans expose the existing rule offsets only (no snippets, scores or model attribution); backward-compatible missing offsets show general explanations. The UI validates Unicode code-point bounds and escapes expanded phrases; no URL links. Five local curated situation checklists collect no secrets, perform no interventions and never enter the fixed help draft. Input edits reset checklist state.

`sh scripts/test.sh` PASS after correcting an initially miscounted expected offset: **209 Python / 63 Vitest / 54 Playwright**, build/migration/contract/dependency checks PASS. Initial run: **208 Python passed / 1 failed** (expected end 27; the actual unmodified rule correctly ends at 28). The assertion and API example were corrected, not the rule. Browser 36.1s. New real-API exact spans, Unicode/HTML/URL masking, negation, legacy/no-offset and model-only behavior, all situations, uncertain analyses and privacy-safe clipboard tests PASS. B commit `47496f2`; C commit follows.
