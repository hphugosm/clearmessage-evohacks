# ClearMessage brand bible

Version 3.0 · Style A — Modern & Friendly with Apple-inspired minimalism · 11 October 2026.
The owner authorized the Goal 09 refinement and the Goal 10 human-first experience. It supersedes the decorative two-column hero and colored result surfaces of version 1.0. Historical assets remain preserved. No Apple logos, proprietary artwork or affiliation are used.

## Identity and voice

ClearMessage helps people understand short messages and choose a safer next step. Tagline: **Understand messages. Make safer decisions.** One inclusive English interface serves adults and children. No age collection, infantilized modes, alarmist language, guarantees, risk percentages or security badges. This remains a local research prototype with incomplete assessments and unverified language performance.

Hero: **Not sure about a message?** Supporting text is **Let’s check it together.** Two large screenshot/paste options and a real **Try an example** action form the home screen. The product interaction takes priority over marketing. The header contains the wordmark and **How it works**; **Behind the AI** stays in the footer. Use the shared English dictionary in `frontend/src/copy.ts`; preserve source languages and identifiers as research data.

## Tokens and typography

`frontend/src/brand-tokens.css` and `docs/design-tokens.json` are the shared sources. Primary blue #173DA5, background #FAFAFC, white surfaces, main text #111827, subtle borders #E5E7EB and accent surface #EEF3FF. Secondary text #475467. Warm accent #F4B46A is decorative or a nonessential pattern border, never safety evidence. Essential input boundaries use #667085. Warning text/indicator #9A6700; error #B42318. Measure actual pairs on all rendered surfaces.

Prefer native `-apple-system, BlinkMacSystemFont, Segoe UI, Inter, system-ui, sans-serif`. The existing same-origin Inter font and SIL license remain available as fallback; no proprietary font is distributed. Desktop hero 44px, mobile 32px, section 26px, body/input 20px, buttons 18px, secondary text 16px; use rem units and readable line heights. No functional text below 16px.

Use the 4/8px spacing scale, 16px controls, 20px cards, subtle borders and minimal shadows. Page maximum 760px including gutters, main interaction maximum 680px. One centered column; generous controlled whitespace. At 360px and 320 CSS px, controls, warnings and long untrusted text must reflow. No fixed-height result cards or sticky controls. Header speech-bubble mark is decorative alongside the actual text wordmark; no shield or certification motif.

## Interaction and states

Controls have at least 48px targets (primary action 60px; home choices 76–80px). Persistent labels, semantic headings, visible 3px blue focus with 3px offset, keyboard navigation, polite result announcement and focused result heading. Validate without truncation; text/language edits cancel stale requests and remove prior results. Busy labels reflect real work without fake percentages or delays. Respect reduced motion; only 150ms functional transitions.

Home choices use native buttons; the input screen’s method switch uses native pressed buttons. SafeScan is feature-flagged. PNG/JPEG validation precedes local English OCR. The image is never submitted; extracted text is editable and requires explicit confirmation before the separate Check message action. Cancelling announces that no analysis ran and returns focus to the screenshot picker. Errors offer ordinary text entry. The distinction between browser OCR and backend text analysis stays visible.

Results are white neutral surfaces with small labeled status indicators. Simple results show one main heading, one short reason, one immediate recommendation, and visible critical limits. **What should I do?** opens curated guidance; **Why this result?** expands an escaped message bubble, exact rule interactions, optional possible-pattern context, full reasons/actions and limits. All current responses remain incomplete. Missing/failed model produces Analysis not performed unless actual observed rules warn with their limited basis stated. No low-finding policy or stronger red warning is enabled. Limitations stay visible.

Highlight only a proven original-text rule span, inside the user's expanded explanation. Interactive phrases expose fixed observed reasons through native buttons with expanded state and associated regions; overlap groups retain every supported reason. Unicode offsets count code points. Invalid or absent offsets and model-only findings never receive highlights. Never attribute words to a model-only signal. Render all message text using escaped React text; do not create links from it. Sharing retains fixed neutral templates, preview and separate copy/share gestures. Neither excerpts nor situation selections enter the shared draft.

ActionGuide uses curated situation choices and local checkboxes, never secret fields, generated advice or automatic intervention. Checklist state is ephemeral and clearing/editing an analysis clears its prior result and checklist. Completion marks user steps, never security status.

## Transparency and verification

Behind the AI explains the actual pipeline, three source classes, verified dataset counts and reused-test annotation metrics with adjacent limitations. It credits the dataset, frozen comparison encoder and third-party tools, distinguishing the team's trained classifier from reused resources. Never claim independent language evaluation, public deployment or guaranteed protection.

Keep the language selector native and at least 48px high across browser engines. A same-origin decorative chevron and `appearance: none` prevent WebKit's compact platform rendering from shrinking the target. Labeled optional metrics regions support left/right arrows when focused, including WebKit; modified shortcuts are preserved.

Verify contrast, real frontend/backend flows, browser OCR, keyboard operation, reduced motion, desktop/mobile/reflow and 200% zoom. Automated accessibility evidence is not screen-reader speech testing or WCAG certification. Chromium, Playwright Firefox and Playwright WebKit engine checks are recorded in the test report. Actual Safari, physical mobile, screen-reader speech, hosting logs/HTTPS and independent usability testing remain unverified.

## Human-first interactions and privacy

**Listen** is gesture-only browser speech synthesis of fixed result/reason/action wording. It never receives the original text, excerpts, URLs or identifiers. Prefer an available local English voice, cancel on Stop/new check/edit/navigation/unmount, and handle unavailable synthesis honestly. Browser/device voices may use online services; no offline guarantee or voice download is offered. Mocked playback tests and actual platform availability are distinct from audible-output verification.

**Hide personal details** masks supported explicit contacts, URLs and labelled credentials with replacement characters. The original editor is removed from the result DOM. Manual masking uses selections in a read-only display box; the box itself contains only the current masked display while the shield is active. Code-point count remains unchanged so evidence placement stays accurate. Names, obfuscated contacts and unlabelled credentials can be missed; manual selections and original text remain in page RAM. This display aid does not erase backend-processed text or alter the analysis. No screenshot preview is rendered in either state.

**Possible pattern** offers at most one small fixed contextual explanation, only for a nearby delivery/account/bank context plus a verified existing observed request. Negated, educational or insufficient context abstains. It does not verify senders, change predictions or carry independent accuracy metrics. No pattern is forced for an ordinary or classifier-only message.

The home provides warmth through one original small message icon, restrained warm dot, rounded choices and clear typography. It has no metrics or technical paragraphs. Privacy instructions stay near the actual input; incomplete/service/language/coverage warnings remain visible in simple results. All first-party strings, including accessible names, come from the shared English dictionary.

## Owner-authorized submission continuation — 11 October 2026

The shorter shared copy supersedes earlier long main-flow wording. One visible
paragraph states incomplete/language/service limits and inability to confirm
safety. Exact rule highlights now appear in the first result, while the longer
explanation remains optional. Classifier-only findings never receive highlights.
Speech details move into a disclosure. The Pages build prominently identifies
recorded mode and has no personal input; live local inference is unchanged.
