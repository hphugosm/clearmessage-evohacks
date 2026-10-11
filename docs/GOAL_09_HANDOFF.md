# ClearMessage Goal 09 handoff

11 October 2026. **GO for reviewer-authorized integration as a tested local research prototype. NO-GO for claiming an independently validated public fraud detector.** No merge, deployment, repository publication, purchase, video recording or Devpost submission occurred.

## Delivered and verified

Minimalist inclusive English UI; real English PNG/JPEG browser OCR; full editable extracted text with explicit confirmation; actual frozen trained classifier; truthful expandable rule highlights; five curated local situation checklists; fixed neutral preview/copy/share fallback; same-origin report-verified Behind the AI route. Every assessment remains incomplete and says it does not establish safety. Source/model/data/thresholds and Czech evaluation provenance are preserved.

Final regression **217 Python / 68 Vitest / 66 Chromium Playwright PASS**, plus **64 Firefox/WebKit PASS**. Clean locked runtime install/build, real OCR/model complete journey, clipboard copy, unavailable-model negative case, privacy/admission/limits/restart PASS. Fifteen layout/contrast checks and five genuine native Chromium 200% zoom captures PASS; separate OCR-disabled production build PASS. See [test report](GOAL_09_TEST_REPORT.md), [implementation](GOAL_09_IMPLEMENTATION.md), [release evidence](data/goal09-local-release.json) and [UI evidence](data/goal09-ui-verification.json) for actual scope and corrected failures.

The continuation corrected WebKit selector sizing, horizontal keyboard scrolling and OCR cancellation focus/announcement. Firefox runs 31 of 33 scenarios; its two clipboard read-back cases remain in Chromium/WebKit because Firefox automation cannot grant those permissions. WebKit engine checks do not establish actual Safari usability. See [cross-engine evidence](data/goal09-cross-browser.json).

Remaining: independent English/Czech and real-world classifier validation; completed low-finding policy; representative OCR accuracy; physical mobile, actual Safari and spoken screen-reader testing; Docker/resource enforcement, public HTTPS/proxy privacy; upstream distribution review and a selected first-party license. These are unverified or release gates, never marked complete. Browser cleanup is explicit but does not guarantee forensic memory erasure. Native sharing is device-dependent and does not prove delivery. Cold clean-runtime startup measured 74.759 seconds; warm offline restart 1.061 seconds.

## Checkout and commits

Managed worktree parent: `/Users/hugo/.codex/worktrees/clearmessage-product-experience/`. The checkout is attached to this chat. Run `git rev-parse --show-toplevel` inside it for the exact root. Branch: **feature/clearmessage-product-experience**. Base: **a9a924d**. Main checkout was clean at the start; review its latest state before integrating because another process may maintain it.

| Milestone | Local commit |
|---|---|
| A: design/tokens | `aefb818` |
| B: real SafeScan | `47496f2` |
| C: spans/ActionGuide | `abc7ba8` |
| D: report-verified transparency | `359e329` |
| E: final quality, verification and documentation | `8a26d3d` |
| E continuation: cross-engine accessibility review | The commit containing this updated handoff; resolve with `git log -1 --oneline` |

All implementation commits are local. No Git remote was added. Source changes are limited to frontend/components/copy/style/locked OCR setup, optional evidence contract/serializer/API route/CSP, runtime packaging/verification, focused tests and requested product documentation. Obtain the exact file list with `git diff --name-status a9a924d..HEAD` and inspect it before integration. Approved model config, training/source/review/quarantine/split records, classifier/rule implementation and canonical audits have no diff against the base.

## Main changed files

| Area | Files |
|---|---|
| Layout and copy | `frontend/src/App.tsx`, `copy.ts`, `styles.css`, `brand-tokens.css`; shared `docs/design-tokens.json` |
| OCR | `frontend/src/SafeScan.tsx`, `ocr.ts`, `ocr.test.ts`, `frontend/ocr-assets.json`, `frontend/scripts/prepare-ocr.mjs`, npm locks and feature-flag typing |
| Explanations/guidance | `EvidenceDetails.tsx`, `evidence.ts`, `evidence.test.ts`, `ActionGuide.tsx`; fixed existing help boundary preserved |
| Transparency | `BehindAI.tsx`, `model-facts.json`, `scripts/export_transparency.py`, exact backend UI route |
| Optional evidence contract | `backend/contracts.py`, evidence serializer in `backend/policy.py`, `frontend/src/api.ts`, generated schema/OpenAPI and API documentation |
| Runtime and privacy | `backend/privacy.py` CSP, `scripts/package_runtime.py`, `Dockerfile`, `scripts/verify_release.py`, frontend release/UI/flag verifiers |
| Regression | Existing app/analysis/runtime tests plus new OCR/guidance/transparency/evidence tests; `scripts/test.sh` adds fact drift |
| Documentation/evidence | Brand Bible, UI copy, README, STATUS, third-party notices; Goal 09 reports, aggregate release/UI/flag/cross-engine JSON, synthetic demo PNG and desktop preview |
| Continuation quality | Native select sizing/own chevron, OCR cancel announcement/focus, keyboard table scrolling; separate cross-engine config and expanded keyboard/clipboard/cancellation tests |

## Run and test

From the attached feature checkout, dependencies/model assets are already available. Do not use the main checkout's ignored environment as a symlink. A fresh checkout needs explicit dependency setup and the trusted hash-pinned model output described in [README](../README.md).

```sh
npm --prefix frontend run build
.venv/bin/python scripts/serve.py --port 7860
```

Open [ClearMessage](http://127.0.0.1:7860) and [Behind the AI](http://127.0.0.1:7860/how-it-works). Use a free port rather than restarting another process. A separate review server started by this task uses [port 8869](http://127.0.0.1:8869); if it has stopped, use the command above. No service on another process's port was replaced.

```sh
sh scripts/test.sh
npm --prefix frontend run test:e2e:cross
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-product-ui.mjs
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ocr-flag.mjs
.venv/bin/python scripts/verify_release.py --clean-install --report docs/data/goal09-local-release.json
python3 scripts/audit_migration.py
git diff --check
```

Tests own ports 8000/5173; cross-engine checks also own 8000 and must run afterward. UI capture owns 8788. Release/flag checks own temporary servers. Install Playwright Chromium, and optional Firefox/WebKit via the explicit project-local command in README, if absent; no browser/model download occurs during analysis. The clean-release command needs network for explicit fresh dependency installation and is not a Docker test. It writes Goal 09 evidence, preserving canonical historical audits.

## Short hackathon demo

1. Start the built service ahead of recording and show the calm Home interface. Say: “ClearMessage helps us understand warning signs and choose a next step. It is a research prototype with limited checks.”
2. Choose **Upload a screenshot**, then the supplied [fictional synthetic PNG](data/goal09-demo-screenshot.png). Wait for actual local OCR; point out the image remains in the browser. Review/edit the text, confirm removal of sensitive details, select English and choose **Check message**.
3. Show the actual incomplete warning. Expand a reason to show its exact observed phrase. Say: “The highlight comes from a transparent rule. It does not explain the classifier's prediction or prove fraud.”
4. Open **What have you already done?**, choose **I entered my password.**, and show practical steps. The app does not collect credentials or execute them.
5. Open **Ask someone for help**. Inspect the neutral preview, then **Copy help request**. Source text, links, codes and situation choices are absent. Sending remains the person's choice.
6. Return to paste mode and use “We can meet for a fictional lunch tomorrow.” The real model returns an incomplete review without invented observed reasons; no safety guarantee appears.
7. Open **Behind the AI**. Show 5,873 eligible records, macro-F1 0.864 and SMISHING recall 0.841. State visibly: these are previously evaluated-test annotation results, not independent blind or language-specific validation. Credit the dataset, reused comparison encoder/OCR and Codex assistance.
8. If a failure demonstration is needed, use the clean-release verifier's throwaway corrupted-model case; never modify the canonical model for a demo. No real video has been created by this goal. Recording/editing and manual submission remain the owner's work before the 19:00 Europe/Prague target.

## Reviewer-controlled integration

Review the feature checkout and test report first. Confirm the main checkout's current branch/status and preserve any unrelated work. If the base advanced, inspect conflicts, retain the approved ML/data changes and rerun checks; do not overwrite them or force-push. The commands below are instructions for a later authorized integration, not actions this goal executed:

```sh
git status --short
git log --oneline a9a924d..feature/clearmessage-product-experience
git diff --stat a9a924d..feature/clearmessage-product-experience
# In the clean destination checkout, after explicit merge authorization:
git merge --no-ff --no-commit feature/clearmessage-product-experience
sh scripts/test.sh
# Review the staged changes, then commit only the approved merge.
git commit
```

Do not cherry-pick part of the contract/UI/OCR pipeline without checking dependencies. Keep trusted ignored model resources and regenerate OCR assets from the pinned lock; generated OCR/dist/node_modules are not Git delivery files. Do not archive the feature worktree until review/integration and any needed ignored resources are preserved. No public release status change follows from merging this product experience.
