# ClearMessage Goal 10 progress

11 October 2026 · Europe/Prague. Started at 16:22; current verified implementation checkpoint at 16:45. Feature freeze deadline 18:00; internal submission target 19:00. No artificial waiting, model training, publication, deployment or merge.

## Isolation and baseline

Goal 09 checkout was clean at `c91cf63edbb7b2a00984a141e2984e4c5bb8530f`. Created a separate managed worktree under `/Users/hugo/.codex/worktrees/clearmessage-human-first/` and branch `feature/clearmessage-human-first` from that exact commit. Pinned dependencies, browser binaries and trusted ignored model/data resources were copied into isolated directories, never symlinked to the prior worktree. Main and Goal 09 source are preserved.

Before behavior changes, `sh scripts/test.sh` PASS: **217 Python (6.35s), 68 Vitest, 66 Chromium browser instances (42.4s)**; migration, dependency, schema/fact drift and build checks PASS. This is a new run, not the historical reported baseline.

## Implemented A–D checkpoint

Home/result restructuring, refined shared tokens, real one-tap example, default simple/detailed result disclosure, fixed-guidance Read Aloud, exact interactive Unicode rule spans, real automatic/manual display masking and conservative evidence-based pattern context are integrated. Existing browser OCR confirmation, action checklists, neutral preview/copy/sharing, service errors and report-verified transparency remain available. No backend, classifier, model configuration, data, split, threshold or canonical audit changed.

Parallel feature work was integrated and verified as one coherent A–D checkpoint before the first local implementation commit. Independent helper/component work avoids partially functioning feature commits. Commit hash is recorded in the next checkpoint; resolve this checkpoint with the human-first implementation entry in `git log --oneline c91cf63..HEAD`.

Executed: current TypeScript/Vite production build PASS; **131 Vitest PASS**; retained **33 production browser scenarios PASS (20.7s)**; new **11 production feature scenarios PASS (5.6s)**. The actual in-app browser separately shows the real example/incomplete result, selected payment-rule explanation and URL masking. New automated UI verifier and OCR-disabled verifier pass; final repetition, visual refinement and full release results remain in progress.

## Problems found and corrected

No tests were removed or policy guards loosened. New speech assertions initially used superseded headline/limit wording; they now assert the approved fixed plain-language dictionary. A new synthetic combining-character fixture initially tripped the existing migration scanner; only the new fixture changed to combining grave, preserving Unicode coverage and all historical Czech data. A privacy recognizer initially mishandled `Password is: value`; a targeted regression and whole-word delimiter fix pass. Pattern context’s newline separator failed its new test and was corrected.

Retained browser runs initially failed selectors for a decorative status marker and duplicate bubble/evidence sentences (0/1/32 and 6/1/26 pass/fail/not-run respectively). Selectors now scope the actual semantic component; all 33 retained scenarios pass. New feature suite similarly corrected its service-state selector after three scenarios passed. No fabricated result, source leakage or model change was introduced.

## Remaining verification at this checkpoint

Full `sh scripts/test.sh`, cross-engine checks, clean locked packaged release, final source/hash/diff review and final documentation/commit. Real speech API presence is observed in Chromium, but its initial voice inventory is empty; playback/lifecycle tests use explicit test mocks. Physical audible output, screen-reader speech, actual Safari/mobile usability, Docker/public hosting and independent language/model validation remain unverified or release gates. See the final Goal 10 test report and handoff for completed commands and truthful scope.
