# ClearMessage Goal 09 test report

11 October 2026, macOS arm64. Base `a9a924d`; isolated branch `feature/clearmessage-product-experience`. Results are local prototype evidence, not independent detector/real-world validation. Canonical historical audits were preserved.

## Final executed checks

| Command | Actual result |
|---|---|
| `sh scripts/test.sh` | **PASS: 217 Python, 68 Vitest, 62 Playwright**; Python 15.80s, browser 54.7s |
| Checks inside that command | Migration, pip consistency, OpenAPI/TypeScript drift, approved transparency facts, TypeScript/Vite production build PASS |
| `.venv/bin/python scripts/verify_release.py --clean-install --report docs/data/goal09-local-release.json` | PASS: fresh hash-locked Python environment, clean npm install/build, 50-file isolated runtime, actual model/browser OCR, restart, corruption/failure, privacy and resource admission |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-product-ui.mjs` | PASS: 15 layout captures, 15 contrast checks, reduced motion, real-model result, plus five genuine native 200% zoom captures |
| `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ocr-flag.mjs` | PASS: separate actual production build with `VITE_ENABLE_OCR=false`; no screenshot controls, real approved-model paste analysis remains incomplete |
| `.venv/bin/python -m pytest tests/test_runtime.py -q` | PASS: 11 targeted runtime tests, including six new OCR package rejection cases |
| `npm --prefix frontend test -- --run src/ocr.test.ts` | PASS: 23 OCR unit tests, including native worker postMessage failure, recognition deadline and owned-buffer cleanup |
| `npm --prefix frontend run test:e2e -- ocr.spec.ts --project=production` | PASS: seven real/failure-path OCR browser tests, 16.4s |

Baseline was **199 Python / 32 Vitest / 34 Playwright**, all passing before edits. Final suite retains these functional regressions and adds 18 Python, 36 client and 28 browser checks. Playwright runs each of 31 scenarios against production same-origin serving and the development proxy. Source/browser canaries and synthetic images are fictional; no real phishing website, source dataset row or private user message is used.

## Complete actual walkthroughs

**A — Screenshot:** real bundled English Tesseract recognizes synthetic PNG/JPEG; output stays editable, review is mandatory and edits revoke approval. No POST occurs before explicit confirmation/submit. The approved classifier and unmodified rules produce the actual incomplete warning. Proven rule words expand as escaped text. Curated guidance opens, then a fixed neutral preview is copied through the real Chromium clipboard API. No source words, URL or selected situation enter copying.

**B — Ordinary message:** the actual classifier receives a fictional lunch plan. Review remains incomplete, no observed phishing explanation is fabricated and no green reassurance appears. Negated password/code instructions retain existing rule semantics.

**C — Unavailable model:** only a throwaway packaged artifact is corrupted. Health reports `model_ready=false`; ordinary input visibly says Analysis not performed, and explicit observed requests can still warn with rules-only/model-not-ready limitations. The approved canonical artifact is untouched. HTTP/API failure, unrecognized payloads, inference limitations and stale/cancelled request handling remain covered.

**D — Transparency:** navigation, direct route, reload and return work. Aggregate export checks actual report/split hashes. Dataset counts, macro-F1, SMISHING recall, 74/88 matched and 14 missed, per-class scores/FP/FN and confusion rows match the reports. Reused-test and unavailable independent English/Czech disclosures stay adjacent and visible. No fresh-blind/public-protection claim appears.

## OCR bounds and privacy

Actual content validation covers empty/unsupported/corrupt PNG/JPEG, byte overflow, header pixel overflow and decoded-image failure. Real blank-image OCR gives a readable error and paste fallback. Real long-image OCR returns more than 2,000 characters without truncation; over-limit confirmation cannot submit, full text remains editable, and a reviewed shortened input can use the real API. Keyboard picker/confirmation at 360px and blank-image errors at 200% text size pass. Initialization failure, processing rejection/deadline, cancellation, unmount and cleanup are exercised with tests confined to test code; success evidence uses real workers.

Actual browser checks find only application-origin resource/API requests, no screenshot upload, no localStorage/sessionStorage/IndexedDB/cookies, no message console output and terminated workers. Backend application stdout/stderr remain empty; response/diagnostic canaries do not leak. Outgoing socket and DNS calls are blocked and counted in the application process during genuine startup, analysis and restart: **zero attempts**. This does not inspect the operating system, proxy, hosting platform, browser extensions or external clipboard recipients.

Runtime packaging verifies every OCR byte/license manifest, requires the complete asset set and rejects alteration, missing worker/core/manifest files, extra files and symlinks before creating a destination. Model/report pins remain verified. Normal analysis has no download or external LLM/OCR service.

## Accessibility and visual scope

Automated layout covers desktop 1440px, tablet 768px, mobile 360px, 320px reflow, expanded findings/guidance/help, validation and OCR errors, and transparency metrics. All captured visible form/button/disclosure targets satisfy 48px height. Radio/checkbox labels provide 48px targets around 24px controls. Text, controls and focus pairs pass the measured 4.5:1/3:1 thresholds; disabled blue-button compositing is measured separately. The full report records each value. Keyboard navigation, visible focus, input/result focus, labels, live statuses, semantic headings/fieldsets/tables, local keyboard table scrolling and reduced motion are checked.

**True browser zoom PASS:** a fresh isolated full Chromium profile changes the built-in Page zoom setting to 200%. The 1,440px test viewport becomes **720 CSS pixels**, `devicePixelRatio=2`, while root/body font declarations remain **16px/20px**. This proves native page zoom separately from CSS/text scaling. Input, real result/guidance/help, screenshot picker, real OCR review and expanded transparency reflow without document overflow. Five actual-viewport screenshots are listed in [UI evidence](data/goal09-ui-verification.json). Only the generated profile is removed afterward; user browser settings are never changed. This follows the [Playwright isolated-profile API](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context) and the [Chromium settings implementation](https://chromium.googlesource.com/chromium/src/+/79dc8b2c2837fb5b99a2b6eb7fbc56bac3deac46/chrome/browser/resources/settings/appearance_page/appearance_browser_proxy.ts).

Actual Codex in-app-browser inspection separately exercised pasted text → real result → expanded quote, Behind the AI navigation/claims, and synthetic screenshot → real OCR → confirmation → actual incomplete result. Its accessibility tree exposed the correct result focus and extracted-text focus; screenshots were visually inspected. Generated desktop/mobile/error/result/transparency/native-zoom images were also inspected. This is engineering review, not human-participant testing or spoken screen-reader verification.

The disconnected desktop Chrome and locked Mac initially prevented native desktop UI testing. The isolated bundled Chromium method resolved the actual page-zoom requirement. Native OS/Chrome UI, physical mobile keyboard, actual Safari/Firefox, VoiceOver/NVDA speech and assistive-user usability remain **UNVERIFIED**, not passed. No WCAG certification is claimed.

## Measured clean local runtime

[Release JSON](data/goal09-local-release.json) records the final executed observations:

| Observation | Measured value |
|---|---|
| Cold startup to HTTP health | 70.028s; start the service before a demo |
| Offline restart to health | 2.339s |
| Corrupted-model startup | 1.484s, model not ready |
| Sampled peak real-model process RSS | 157.56 MiB |
| 100 sequential actual analyses | p50 3.059ms / p95 4.905ms / maximum 6.778ms |
| Eight-client, 32-request burst | 32 HTTP 200, zero HTTP 503; p95 24.136ms |
| All eight admission slots occupied by incomplete bodies | Overflow HTTP 503; total body deadline returns HTTP 408 after configured five seconds |
| Runtime bytes after real analysis/restart | Unchanged against manifest |
| Application process logs / outgoing attempts | Empty / zero |

Host timings are observations rather than SLAs or low-end-device guarantees. RSS samples use `ps`, not cgroup enforcement. CPU/memory/pid settings and image size are not verified in Docker. Browser OCR latency/accuracy is not a representative benchmark.

## Failures corrected and checks skipped

Failures were not suppressed or tests removed:

- Initial migration scan rejected a newly authored legacy operational path; documentation wording was corrected, scanner unchanged.
- C initially had 208 Python pass/one failed because a test counted a span endpoint as 27 instead of the unmodified rule's 28. Assertion/API example corrected; full rerun passed.
- D had 211 Python/63 client pass but browser collection failed on Node JSON-import syntax (no browser tests ran). Fixed test import. Subsequent browser runs exposed incorrect metric rounding and a real 200% pipeline overflow; report-derived expectations and flex wrapping fixed them. Final 58-browser milestone passed.
- E targeted runtime 11/client OCR 23 passed; build failed on two TypeScript mock/ArrayBuffer typings. Correct typings restored build. The first expanded OCR browser run had three pass/one fail/three not run due two accessible picker controls; hiding the unused native file input fixed the actual semantic duplication. All seven then passed.
- The extended release walkthrough initially failed on an incorrect Copied-button selector and a strict selector matching visible/hidden copies of the same metric. Selectors now verify the actual status and summary cells; product outcomes/model policy were not altered. Extended walkthrough and both clean-release executions subsequently passed.
- Visual review found cramped 360px header spacing; an 8px mobile gap fixes it. Optional metric tables now expose labeled keyboard-scroll regions. Visual review also detected a clipped full-page capture at native zoom; the verifier now preserves the real viewport and checks the PNG physical width, without changing app layout or zoom. Final full suite/UI verifier cover these changes.

**SKIPPED/UNAVAILABLE:** Docker build/run/healthcheck/image size/resource or container-network enforcement, public deployment/HTTPS/proxy logging, native share delivery, representative OCR accuracy, independent English/Czech/classifier field performance and actual screen-reader/human usability. Docker CLI/daemon are absent; no confirmed authorized publishing destination exists. No credentials, consent or security boundary was bypassed. Existing Starlette/httpx deprecation and Node NO_COLOR/FORCE_COLOR warnings remain visible.

Final migration/diff/frozen-file checks and clean commit state are recorded in [handoff](GOAL_09_HANDOFF.md) and [progress](GOAL_09_PROGRESS.md). Historical Goal 04/05 and approved-model audit files were not overwritten.
