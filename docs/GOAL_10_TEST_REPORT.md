# ClearMessage Goal 10 test report

11 October 2026, Europe/Prague. Final implementation and verification on `feature/clearmessage-human-first`, exact Goal 09 base `c91cf63edbb7b2a00984a141e2984e4c5bb8530f`. Implementation commit `2277dfa`; verification commit `a1148b0`; the final documentation commit is identified by `git log --oneline c91cf63..HEAD`. All reported results below were executed in this goal. Historical Goal 09 evidence is preserved.

## Executed commands and outcomes

| Check | Actual result |
|---|---|
| Pre-change `sh scripts/test.sh` | PASS: 217 Python (6.35s), 68 Vitest, 66 Chromium instances (42.4s); migration/dependency/contracts/transparency/build pass |
| Final `sh scripts/test.sh` | PASS: 217 Python (5.94s), 131 Vitest in 8 files, 88 Chromium instances (47.9s), 44 scenarios each for production and development proxy |
| Cross-engine production suite | PASS: 42 Firefox + 44 WebKit = 86 checks (52.40s); zero unexpected failures, skips after selection, flaky cases or retries |
| Human-first UI verifier | PASS: 27 layout captures, 7 genuine Chromium 200% page-zoom captures, 17 contrast pairs; minimum normal-text pair 4.694:1 |
| OCR-disabled build verifier | PASS: separate `VITE_ENABLE_OCR=false` production build, no screenshot/file controls, real approved-model paste result remains incomplete |
| Fresh locked packaged release | PASS: new hash-locked Python environment, clean npm install/build, isolated 51-file runtime, actual HTTP/model/OCR/browser, offline restart and disposable failed-model case |
| Source review | PASS: no blocking safety/privacy/accessibility defect; earlier privacy, stale-result, hostile-input, OCR-confirmation and sharing assertions preserved |
| Final migration, frozen-source diff and whitespace review | PASS; final checkpoint is recorded in progress and machine-readable evidence |

Reproduce from the human-first checkout with dependencies and trusted assets already prepared:

```sh
sh scripts/test.sh
npm --prefix frontend run test:e2e:cross -- --reporter=json
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-human-first-ui.mjs
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ocr-flag.mjs --goal10
.venv/bin/python scripts/verify_release.py --clean-install --goal 10 --report docs/data/goal10-local-release.json
python3 scripts/audit_migration.py
git diff --check
```

Run suites sequentially: browser regressions own ports 8000/5173; the layout verifier owns 8788. The release verifier explicitly acquires locked dependencies at setup time, never during message analysis. The separate cross configuration uses the prepared browser binaries. Its two native clipboard read-back cases are filtered for Firefox because its protocol cannot grant the required permissions; both pass in Chromium and WebKit. Firefox still tests neutral selectable previews and permission-denial/share fallbacks. WebKit is an engine test, not a claim about the actual Safari application.

The existing Starlette/httpx TestClient deprecation warning remains visible; no dependency or warning suppression was added. No model retraining, threshold tuning, deleted regression scenarios or production inference mocks were used. Tests for deliberately failed APIs, unavailable speech and native share errors use explicit test-only mocks.

## Feature coverage and actual browser inspection

The 11 new browser scenarios cover a 360px keyboard entry, real one-tap API request and genuine incomplete verdict, replacement/failure clearing, simple uncertainty states, exact Unicode highlights, hostile inert source text, automatic/manual masking without request changes, fixed gesture-only sharing, speech lifecycle/privacy, unsupported speech, conservative patterns, and actual screenshot review without a source-image preview. The existing 33 scenarios retain real PNG/JPEG OCR, editable confirmation, cancellation, complete extraction, actual inference, ActionGuide, neutral clipboard output, race guards and report-verified transparency.

The new helper suites add 12 speech, 14 bubble and 37 privacy/pattern tests. They verify fixed-only narration, cancellation and late-event guards, local English voice preference, errors, overlap handling, repeated phrases, Unicode code-point mapping, invalid/model-only evidence rejection, labeled secret formats, UTF-16 manual selections, masking reset, positive/contextual patterns and negation suppression. Together with the original 68 tests they total 131.

A separate actual in-app browser at `http://127.0.0.1:8870/` was operated through its UI. Home, real Try an example, focused incomplete result, exact payment phrase selection, display URL masking, and details close/reopen were inspected. Closing details left the incomplete warning visible. Native Listen changed to Stop reading and naturally returned to Listen; a separate Listen/Stop gesture returned it immediately. This establishes actual control behavior, not physical audible output. The existing Goal 09 browser/server at port 8869 was left intact.

Actual captured pixels were visually inspected for desktop home, 360px home, detailed bubble, shield and native 200% zoom. The saved [home screenshot](data/goal10-home.png) depicts the real running application. The script itself records pixel captures/geometry, not human visual inspection; this report records the separate inspection. Screenshots use fictional inputs only.

## Accessibility evidence and limits

Measured layouts cover home, input, simple/detailed result, manual privacy controls/help, screenshot OCR review and transparency at desktop, 360px, 320px and 200% root-text enlargement where relevant. Genuine native Chromium page zoom used a fresh isolated profile: 1,440 physical pixels became a 720px CSS viewport with device-pixel ratio 2 and unchanged 16px root/20px body typography. Seven captures include actual OCR review. No horizontal overflow was observed. The user's browser settings/profile were untouched.

Functional text is at least 16px, body 20px, ordinary targets at least 48px, home choices 76/80px and primary check 60px. Seventeen normal/control/focus contrast pairs pass their thresholds. Reduced-motion transition is 0s; forced-colors home/bubble captures retain labels, borders and focus. Tests check keyboard entry, result-heading focus, disclosure associations, highlight explanation controls, input/cancellation focus and live status semantics. Native elements retain text labels, so status does not depend on color alone.

These are automated/visual/semantic checks. Spoken screen-reader UX, physical mobile/touch usability, actual Safari, older-adult/child participant testing and a general WCAG conformance audit remain unperformed. No five-second comprehension study or human usability outcome is claimed.

## Speech verification scope

Controller/unit and browser lifecycle tests explicitly mock synthesis to verify payload and cleanup without relying on audio hardware. No original message, evidence quote, URL, code, phone number or private identifier reaches the utterance; only approved dictionary strings do. No autoplay occurs. Unsupported APIs hide the working Listen control and provide readable fallback.

The final native Chromium production and development-proxy observations each listed 180 voices, including 41 English voices marked local. Firefox and WebKit exposed synthesis APIs but listed zero initial voices in that run. An earlier Chromium observation also had an empty initial inventory; inventory availability is platform/timing dependent. Real in-app control dispatch/completion/stop was observed separately. No physical audible playback, voice quality, operating-system privacy guarantee or offline-speech claim was verified. Native synthesis errors are handled with fixed fallback copy.

## Privacy and model evidence

After automatic and manual display masking, source canaries are absent from result DOM text, attributes and textarea values. Original editing input is unmounted; evidence snippets receive the same masked text. Manual selection uses actual browser textarea selection ranges followed by the real Hide selected text button. The unmodified original remains transiently in application memory for analyzed-input identity and deliberate editing. This is display masking, not backend erasure or complete detection of personal information. Names, unusual formats and ambiguous details can remain. There is no screenshot preview image in either shield state; screenshot bytes stay in browser OCR and are never uploaded.

Neutral help preview/copy/share always consists of fixed labels/actions, independent of the mask. Actual clipboard read-back and privacy canaries pass; there is no automatic sharing or recipient selection. Message URLs remain inert escaped text, including HTML-like input. No message history, cookies, local/session storage or IndexedDB were introduced. The actual UI/release browser recorded zero external requests and page errors. Native speech services are a separately disclosed browser/device behavior.

Fresh release runtime: real-model startup to health 61.169s; offline warm restart 0.693s; failed-model startup 0.700s. Sampled peak RSS was 163.62/161.78/154.30 MiB respectively. One-thread local 100-request latency was p50 1.699ms, p95 1.908ms, max 2.288ms; 32 requests through eight clients all returned 200, p95 11.881ms. Admission overflow returned 503; incomplete body timeout returned 408. These are local measurements, not a deployment performance promise or container limit enforcement.

All three processes had empty application stdout/stderr and zero blocked outgoing socket/DNS attempts. Runtime assets stayed unchanged after analysis/restart. Real and disposable failed-model browser walks passed actual OCR, reviewed checks, exact rules, neutral copy, example, shield, pattern and transparency. Failed model never creates a reassuring verdict; any warning states its actual rules basis. No raw source appears in logs, errors, persistent storage or shared output.

Approved artifact SHA-256 remains `b6e56c3f1d3428c4cc9aee2fe2caa2beb10bd30cabcf35df8da915041e3eb4e1`; selection report `3721e1f04a448633e1fb503dd06c4db6f81ce2b10116726ae29acb7faef172cd`; frozen split `9fa155bd267fd5492523b297515b3b1a357832ce19e131357ba81198cf89b988`. Backend, all tracked ML/data/reviews/splits/reports, model card, final audit and Goal 09 reports have zero diff from the verified base. Policy `analysis-policy-2`, rules `observed-requests-2`, contract `1.1.0` and threshold 0.60 are unchanged. Every current result is incomplete; evaluated language list is empty. Synthetic Czech inputs remain challenge/regression data, not a representative benchmark.

## Failed attempts, corrections and unperformed checks

Initial helper tests found labeled-password and sentence/newline boundary defects; targeted fixes/regressions pass. Speech assertions were updated to approved simplified fixed copy. A newly introduced combining-character fixture was corrected for the migration policy without modifying historical Czech inputs. Retained browser selectors first failed on a decorative status marker, then duplicated bubble/evidence wording; scoping the intended components restored every retained assertion. New feature service-state selection was similarly corrected.

The first clean release attempt installed/built successfully but its browser walkthrough failed at returning Home after transparency reload. The assertion ran before React hydration. An explicit Home-control wait fixed it; a second completely fresh release passed both actual and failed-model walks. The initial failure is not counted as a pass. A temporary documentation migration failure came from references to drafts not yet written; drafts were created and later completed, and final migration passed. No policy/test guard was weakened.

Automatic approval review rejected changing the shared OCR verifier's default and removing prior Goal 09 behavior. The already passing scoped `--goal10` adapter was retained; no deliverable is blocked and the historical Goal 09 report is unchanged.

Docker/alternative runtime is unavailable, so container execution/health/resource/network enforcement remains untested. No confirmed public destination exists; public HTTPS, proxy/hosting logging and deployment privacy are unverified. No deployment or Devpost submission was attempted. Independent English/Czech model evaluation, validated completed low-finding policy and distribution licensing remain existing public-release gates. Physical audible speech and human accessibility/usability checks remain unverified.

Machine-readable evidence: [aggregate](data/goal10-verification.json), [cross engines](data/goal10-cross-browser.json), [UI/zoom/contrast](data/goal10-ui-verification.json), [OCR-disabled](data/goal10-ocr-disabled.json), [fresh packaged release](data/goal10-local-release.json). Source hashes and native capability observations are in the aggregate; no source message is saved in these reports.
