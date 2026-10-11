# ClearMessage Goal 09 implementation

11 October 2026. Isolated branch `feature/clearmessage-product-experience`, based on approved release `a9a924d`. No merge, deployment, publication, purchase or submission occurred. The main checkout was preserved. [Progress](GOAL_09_PROGRESS.md), [test evidence](GOAL_09_TEST_REPORT.md) and [handoff/demo](GOAL_09_HANDOFF.md) accompany this report.

## Product experience

The approved Style A now uses native typography, restrained blue/white surfaces, a centered 736px interaction inside an 880px page, consistent 12/20px radii, 48px targets and a 52px primary action. The decorative hero is removed from the interface; its original asset remains preserved. Results retain one finding heading, visible incomplete-assessment limits, expandable observed reasons and concise next steps. The header has Home and Behind the AI. English copy is centralized in `frontend/src/copy.ts` and inventoried in [UI_COPY](UI_COPY.md). Colors and geometry are shared with [design tokens](design-tokens.json) and the updated [brand bible](BRAND_BIBLE.md).

## SafeScan: real browser screenshot recognition

`SafeScan.tsx` owns selection, drag/drop, cancellation and fixed error states. `ocr.ts` validates actual PNG/JPEG bytes and image headers before decoding; it independently checks decoded dimensions. Bounds are 10 × 1,024 × 1,024 bytes, 12,000,000 pixels and 16,384 pixels per side. Empty, unsupported, corrupt, oversized and unreadable images never produce an analysis result. One visible picker button controls a hidden native input; no camera permission is requested.

A bounded canvas rasterizes the decoded image onto white and passes PNG bytes to a native Tesseract worker. The implementation uses the inspected **Tesseract.js 6.0.1** worker protocol with **tesseract.js-core 6.0.0** and **@tesseract.js-data/eng 1.0.0** (`4.0.0_best_int`). A small broker owns the native worker from construction, including initialization, so failure/cancellation can terminate it. Load/language/initialization each have a 30-second limit, parameter setup 10 seconds, and recognition 60 seconds. Only real work is announced; there is no simulated scan or percentage.

`frontend/scripts/prepare-ocr.mjs` restores assets from integrity-locked npm packages during explicit build/dev setup and checks them against `frontend/ocr-assets.json`. Twenty worker/core/data/license files total **33,195,743 bytes (31.66 MiB)** before HTTP compression; all core variants permit supported browser feature selection without a CDN. Ordinary setup cannot silently refresh the recorded identity. Resources are served from `/assets/ocr/` under the app origin. The worker uses `cacheMethod: none`; actual tests find no IndexedDB, cookies or web storage. The package validator rejects missing, extra, altered or symlinked OCR resources.

Decoded bitmaps are closed, canvases cleared, owned byte buffers zeroed and workers terminated on successful/failing/cancelled jobs. JavaScript strings and browser-internal buffers ultimately depend on garbage collection; this is not a forensic erasure guarantee. Native decoding is bounded but recognition can still consume browser CPU/memory. English synthetic PNG/JPEG recognition is verified, not a representative OCR accuracy benchmark. No additional OCR language or file format is advertised.

OCR output is displayed in full, editable and focused. A checkbox confirms review/removal of sensitive details; editing revokes it. A separate **Check message** gesture sends only the reviewed text to the existing API. Text beyond 2,000 Unicode code points remains visible, produces a clear limitation and can be edited; it is never silently truncated. Failure offers normal paste input. `VITE_ENABLE_OCR=false` hides screenshot controls in a separately verified production build; the approved Goal 09 build enables them by default.

## Explanations and curated ActionGuide

`EvidenceSpan` adds an optional strict bounded `{start,end}` object to evidence. It exposes existing deterministic rule offsets, not snippets or scores. Decision rules, model thresholds, evidence priority and safety policy are unchanged. Contract 1.1.0 remains compatible with missing/null spans; generated OpenAPI/TypeScript and strict client parsing cover the extension. Existing API consumers must tolerate optional new fields as documented in [API](API.md).

`evidence.ts` validates original-message Unicode code-point bounds against the submitted snapshot. `EvidenceDetails.tsx` expands up to three reasons and renders an escaped original slice only for observed rules with a valid span. Classifier-only, missing or invalid spans show general explanations without word attribution. HTML remains text, message URLs never become links, and the UI never visits them. Rule highlights are labeled observed textual signals rather than proof of fraud or explanations of the classifier.

`ActionGuide.tsx` provides five native radio situations and local checkboxes: no interaction, opened link, password, payment details or verification code. All steps are fixed reviewed wording in the copy dictionary, informed by [FTC phishing guidance](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams) and [recovery guidance](https://consumer.ftc.gov/articles/what-do-if-you-were-scammed). Choices collect no secrets and perform no account/device/bank action. Advice remains available during uncertain or failed analysis. Changing situation resets checks; new input resets the guide. Choices are neither sent nor saved and never enter sharing.

The existing `HelpRequest`/allowlisted template boundary is preserved. A visible neutral preview precedes separate copy/native-share gestures. Clipboard denial and share cancellation retain a manual fallback. No source text, evidence, URL, contact, account, secret or situation enters the draft. A resolved share dialog is not described as confirmed delivery.

## Behind the AI

The exact same-origin `/how-it-works` route serves the application shell; unknown paths remain 404. It explains message → preprocessing → classifier → rules → guidance, the independent safety-policy role, HAM/SPAM/SMISHING and the team's train-only TF-IDF + logistic regression work. The frozen MiniLM comparison encoder and pretrained English OCR are credited as reused components. Dataset authors/license, partial annotation review, quarantined records and absent independent language evaluations remain explicit.

`scripts/export_transparency.py` verifies the approved selection-report and split hashes before exporting only aggregate facts to `frontend/src/model-facts.json`. `--check` is part of the regression command. The page presents **5,873** eligible records (**4,844 HAM / 439 SPAM / 590 SMISHING**), test macro-F1 **0.864**, SMISHING recall **0.841**, and **74 of 88 annotations matched / 14 missed**, plus optional per-class metrics and confusion matrix. The previously evaluated-test disclosure sits beside the summary. Scores describe annotation agreement, not demonstrated fraud prevention. English/Czech independent metrics are unavailable; English UI/OCR does not establish classifier performance.

## Privacy, accessibility and preserved integrity

Images stay in the browser. Pasted or confirmed text reaches our FastAPI backend in RAM. No history, account, database, analytics, training retention or external analysis service is introduced. Application process logs, HTTP errors, requests, browser storage and outgoing socket/DNS attempts were verified locally. Public HTTPS, proxy/hosting logging and container execution remain unverified. Browser OCR fetches only bundled resources; backend analysis/startup/restart has no outbound requests. CSP adds only same-origin workers and WebAssembly compilation (`wasm-unsafe-eval`), with no general `unsafe-eval`, remote script source or blob allowance.

Persistent labels, associated errors, semantic headings/fieldsets, live statuses, result focus, visible focus outlines, keyboard-operable disclosure/radio/checkbox controls, scrollable labeled metrics regions and reduced-motion handling are implemented. Desktop/tablet/mobile, long text/URLs, 360/320px reflow and enlarged text are tested. Actual browser zoom and visual scope are recorded separately in the test report. Automated checks and accessibility-tree inspection do not establish WCAG certification or real screen-reader usability.

Frozen model hash: `b6e56c3f1d3428c4cc9aee2fe2caa2beb10bd30cabcf35df8da915041e3eb4e1`.
Selection-report hash: `3721e1f04a448633e1fb503dd06c4db6f81ce2b10116726ae29acb7faef172cd`.
Split hash: `9fa155bd267fd5492523b297515b3b1a357832ce19e131357ba81198cf89b988`.
No training, threshold, label, quarantine, split, encoder or canonical audit change was made. Policy `analysis-policy-2`, rules `observed-requests-2` and current incomplete-assessment semantics remain intact. No reassuring low-finding or stronger red warning is enabled. Czech evaluation material and provenance are preserved.

[Third-party notices](THIRD_PARTY_NOTICES.md) identify pinned OCR packages and preserved embedded/license texts. A complete upstream redistribution review and the owner's first-party license remain release gates. No public detector, sender verification, automatic intervention or independent real-world accuracy claim is made.
