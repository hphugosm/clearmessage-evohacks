# ClearMessage Goal 10 implementation

11 October 2026. The human-first experience is implemented on the isolated branch `feature/clearmessage-human-first`, based on the verified Goal 09 commit `c91cf63`. The managed worktree is under `/Users/hugo/.codex/worktrees/clearmessage-human-first`; `git rev-parse --show-toplevel` identifies its checkout directory. Main and the Goal 09 worktree are preserved. No merge, deployment, publication, purchase or submission is part of this goal. [Test report](GOAL_10_TEST_REPORT.md) and [handoff](GOAL_10_HANDOFF.md) record final verification and integration readiness.

## Entry, input and result flow

The home screen asks **Not sure about a message?** and says **Let's check it together.** Two large native buttons open screenshot recognition or pasted-text entry. **Try an example** provides the third, quieter action. The header contains the ClearMessage wordmark and **How it works**; the footer retains the prototype disclosure, safety boundary and **Behind the AI** link. Technical stages and metrics no longer occupy the main entry interaction.

The main interaction is centered at a maximum 680px inside a 760px page. Shared tokens retain primary blue `#173DA5`, main text `#111827`, white and `#FAFAFC` surfaces, and soft blue `#EEF3FF`. Secondary text is `#475467`; `#F4B46A` is a small decorative accent. Native typography uses a 20px body, 44px desktop/32px mobile home heading, 16px secondary copy, 16/20px control/card radii and a 60px primary action. Home choices are 80px high on desktop and 76px on narrow layouts. Other controls retain at least 48px targets. Original line icons are decorative; no proprietary Apple art or affiliation is introduced.

Pasted text uses the existing bounded input and message-language hint. Screenshot mode reuses Goal 09 SafeScan: actual PNG/JPEG validation, same-origin English OCR resources, cancellation, full editable extraction, explicit review confirmation and a separate Check message gesture. The 2,000 Unicode-code-point input limit remains. Privacy beside the input explains that submitted text reaches the FastAPI backend in memory. OCR images stay in the browser; this is not a claim that text analysis is local to the browser.

A successful response replaces the editor with one focused result heading, one plain-language reason and one immediate next step. Current checks remain incomplete. Model unavailability/failure, insufficient input, incomplete coverage, unverified languages and other critical limitations stay visible in short fixed wording; the explicit safety caveat is always visible. Why this result? controls a detailed section containing the message, evidence, recommendations and full limitations. What should I do? opens and focuses the existing ActionGuide disclosure. Edit message deliberately returns to the original input and clears the result, disclosure, help, speech and masks. Start again clears the message and returns focus to the home heading.

## Read aloud

`speech.ts` has a small controller and React hook. Its summary accepts the API result and resolves approved dictionary keys for the heading, incomplete status, critical service/coverage/language limitations, first reason, first action and safety caveat. It has no source-message parameter and does not read spans, links, model-version text or private identifiers. Only fixed guidance reaches `SpeechSynthesisUtterance`.

Listen starts on a user gesture; there is no autoplay. Stop reading cancels queued or active speech. New checks, result replacement, edits, explicit navigation, pagehide, popstate and unmount cancel it. Revision guards and detached callbacks prevent late native events from reviving old playback or stopping a newer result. Unsupported APIs and synthesis failures produce fixed readable guidance without exposing native error contents. Local English voices are preferred, then another available English voice; the utterance requests English if voices are not yet listed. The application does not download voices. Browser/device voice services can use online processing, so the interface does not promise offline speech. Mocked lifecycle/privacy checks are distinct from native browser capability and physical audible-output checks.

## Interactive message bubble

`bubble.ts` validates existing observed-rule spans against the analyzed snapshot through `evidenceExcerpt`. Python offsets and browser segmentation both use Unicode code points. Only the three existing observed keys can highlight text. Missing, invalid, model-only or mismatched display-length spans remain plain text; no keyword guessing or invented model attribution is added.

Verified spans are sorted. Overlaps form one contiguous highlighted range with all applicable observed explanations; adjacent ranges remain separate. Repeated phrases are highlighted only at supplied offsets. `MessageBubble.tsx` renders all text through escaped React strings and preserves line breaks and long-word wrapping. URLs never become anchors and source HTML cannot execute. Native highlight buttons keep keyboard focus, expose expanded/control associations and toggle the corresponding fixed explanation. Existing expandable EvidenceDetails remain available alongside the bubble.

## One-tap example

The visibly labeled Example message is a fictional delivery/payment request with `https://example.invalid/delivery`. Clicking Try an example sends it immediately to the existing `/api/analyze` path with the English message-language hint. The actual trained model, observed rules and unchanged safety policy determine the response. No demo verdict is hardcoded, no artificial delay is inserted and no link is visited. Starting another check clears the previous result before the request; a failed example shows the ordinary analysis-not-performed error and leaves no stale verdict.

## Simple and detailed views

Details begin closed for each result. The simple view exposes the actionable guidance and uncertainty needed for a decision. Expanding Why this result? retains focus on the disclosure button and adds the inert source bubble, supported evidence, possible pattern and full fixed lists. Closing it removes that detailed subtree. The source editor is unmounted throughout the result view. The separate transparency page still contains model architecture, source labels, verified aggregate dataset counts, reused-test annotation metrics and adjacent evaluation limitations. English interface/OCR support remains separate from model language performance.

## Privacy shield

`privacy.ts` supplies display-only ranges for recognizable emails, HTTP/WWW URLs, longer phone-like numbers, and explicitly labeled password/code/account/card values. These are conservative heuristics. Names, unknown formats and ambiguous details may remain, and the privacy copy explicitly tells users that automatic masking can miss details.

Hide personal details replaces each masked Unicode code point with a bullet; it does not merely blur or hide raw HTML with CSS. The result bubble, evidence quotes and read-only manual-selection field all receive the same masked display. The original editable input is absent from the result DOM. Native selection offsets are converted from UTF-16 into complete Unicode-code-point ranges, including surrogate pairs. Manual ranges are validated, merged and combined with automatic ranges. Hide selected text activates masking and restores focus to the selection field; an empty selection produces fixed feedback. A deliberate Show personal details gesture restores the display. Masks and feedback reset on edit, input change, new checks and Start again.

The original analyzed text remains in React memory for inference identity and deliberate editing. Masking does not alter the submitted request, retrain the model, erase previously processed backend text or promise forensic erasure. No screenshot preview was added; there is no rendered screenshot image for the shield to cover. JavaScript strings and browser internals depend on garbage collection. Help sharing remains fixed-template-only regardless of masking, so it never relies on free-text anonymization. Speech also never consumes the displayed source.

## Scam-recognition context

`patterns.ts` returns at most one of three fixed possible patterns: delivery payment request, account code request or bank payment request. A pattern needs an existing valid observed payment/secret span plus a narrow matching context near that request. Only the request sentence and immediately preceding sentence are considered, with bounded surrounding text. Negation, questions, warnings and hypothetical/educational wording suppress the contextual label. Classifier-only evidence, an institution name alone or an invalid span is insufficient.

These labels explain a supported textual request; they do not change API status, threshold, action selection or classification. The interface says Possible pattern and states that it is not confirmation of fraud or the sender's identity. No additional model, generated explanation, remote lookup or sender-verification service is introduced.

## Preserved boundaries and changed files

Product changes are in `frontend/src/App.tsx`, `copy.ts`, `styles.css`, `brand-tokens.css` and `docs/design-tokens.json`. New frontend modules are `speech.ts`, `privacy.ts`, `patterns.ts`, `bubble.ts` and `MessageBubble.tsx`, with corresponding focused unit tests. Existing app/guidance/OCR/transparency browser regressions are retained and adapted to explicit entry, editing and disclosure; `frontend/tests/human-first.spec.ts` covers the new journeys. Verification adapters include the human-first layout script and Goal 10 report destinations in OCR-disabled/release checks. This document, the copy inventory and the goal reports describe the actual scope.

Backend inference, API fields, safety policy, rule decisions, thresholds, trained assets, source labels, review/quarantine decisions, split manifests, evaluation metrics and canonical prior audits remain unchanged. No new dependency, account, history, database, inbox integration, analytics, external LLM or automatic intervention is added. The current model is still the project-trained TF-IDF + logistic regression classifier; the frozen MiniLM comparison and English OCR are reused resources. The model hash remains `b6e56c3f1d3428c4cc9aee2fe2caa2beb10bd30cabcf35df8da915041e3eb4e1`; policy `analysis-policy-2`, rules `observed-requests-2` and contract `1.1.0` are preserved.

Source messages and extracted text remain untrusted data. They are not instructions, HTML, executable content or destinations to visit. The existing no-store/neutral-error API, private RAM processing, no message-body logging, no runtime model downloads and no backend analysis egress remain required. Native sharing is still gesture-only after a neutral preview; copy failure remains selectable, and successful dialog resolution is not treated as confirmed delivery. ActionGuide choices and checks remain ephemeral and never enter analysis, speech or help payloads.

## Executed evidence and limits

The pre-change baseline passed 217 Python tests, 68 Vitest tests and 66 Chromium browser instances, plus the associated build/contract/integrity checks. After the retained regression adaptation, this exact command passed all 33 production browser scenarios in 20.7 seconds:

```sh
cd frontend
npm run test:e2e -- tests/app.spec.ts tests/guidance.spec.ts tests/ocr.spec.ts tests/transparency.spec.ts --project=production
```

Two earlier attempts failed on obsolete exact selectors: the decorative status character, then duplicate hidden bubble/visible evidence wording. They were corrected by scoping assertions to the intended status/evidence component; no regression scenario or privacy assertion was deleted. The final targeted speech run passed 12 tests and TypeScript validation. The full final suite, browser engines, layout/contrast/zoom, OCR-disabled build and packaged-release results must be read in [GOAL_10_TEST_REPORT](GOAL_10_TEST_REPORT.md), rather than inferred from source existence or these earlier targeted results.

This is a local research prototype. Independent English/Czech evaluation, validated completed low-finding policy, physical mobile/actual Safari/screen-reader usability, physical audible speech, Docker execution, public HTTPS/hosting-log privacy, distribution licensing and public release remain separate gates or unverified checks. Automated speech mocks cannot establish audible output or the behavior of an operating-system voice service. No public fraud-detection or protection guarantee is made.
