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
