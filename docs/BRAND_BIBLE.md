# ClearMessage brand bible

Version 2.0 · Style A — Modern & Friendly with Apple-inspired minimalism · 11 October 2026.
The owner authorized this refinement in Goal 09. It supersedes the decorative two-column hero and colored result surfaces of version 1.0. Historical assets remain preserved. No Apple logos, proprietary artwork or affiliation are used.

## Identity and voice

ClearMessage helps people understand short messages and choose a safer next step. Tagline: **Understand messages. Make safer decisions.** One inclusive English interface serves adults and children. No age collection, infantilized modes, alarmist language, guarantees, risk percentages or security badges. This remains a local research prototype with incomplete assessments and unverified language performance.

Hero: **Not sure about a message?** Supporting text explains paste/screenshot input, warning signs and next steps. The product interaction takes priority over marketing. Navigation stays small: Home and Behind the AI. Use the shared English dictionary in `frontend/src/copy.ts`; preserve source languages and identifiers as research data.

## Tokens and typography

`frontend/src/brand-tokens.css` and `docs/design-tokens.json` are the shared sources. Primary blue #173DA5, background #FAFAFC, white surfaces, main text #111827, subtle borders #E5E7EB and accent surface #EEF3FF. Secondary text #596579 is a darker accessible derivative of the suggested #667085. Essential input boundaries use #667085. Warning text/indicator #9A6700; error #B42318. Measure actual pairs on all rendered surfaces.

Prefer native `-apple-system, BlinkMacSystemFont, Segoe UI, Inter, system-ui, sans-serif`. The existing same-origin Inter font and SIL license remain available as fallback; no proprietary font is distributed. Desktop hero 44px, mobile 32px, section 26px, body/input 20px, buttons 18px, secondary text 16px; use rem units and readable line heights. No functional text below 16px.

Use the 4/8px spacing scale, 12px controls, 20px cards, subtle borders and minimal shadows. Page maximum 880px, main interaction maximum 736px. One centered column; generous controlled whitespace. At 360px and 320 CSS px, controls, warnings and long untrusted text must reflow. No fixed-height result cards or sticky controls. Header speech-bubble mark is decorative alongside the actual text wordmark; no shield or certification motif.

## Interaction and states

Controls have at least 48px targets (primary action 52px). Persistent labels, semantic headings, visible 3px blue focus with 3px offset, keyboard navigation, polite result announcement and focused result heading. Validate without truncation; text/language edits cancel stale requests and remove prior results. Busy labels reflect real work without fake percentages or delays. Respect reduced motion; only 150ms functional transitions.

Paste and screenshot options use native buttons with a pressed state. SafeScan is feature-flagged. PNG/JPEG validation precedes local English OCR. The image is never submitted; extracted text is editable and requires explicit confirmation before the separate Check message action. Cancelling announces that no analysis ran and returns focus to the screenshot picker. Errors offer ordinary text entry. The distinction between browser OCR and backend text analysis stays visible.

Results are white neutral surfaces with small labeled status indicators. One main result heading, up to three expandable observed reasons and up to three recommendations. All current responses remain incomplete. Missing/failed model produces Analysis not performed unless actual observed rules warn with their limited basis stated. No low-finding policy or stronger red warning is enabled. Limitations stay visible.

Highlight only a proven original-text rule span, inside the user's expanded explanation. Never attribute words to a model-only signal. Render all message text using escaped React text; do not create links from it. Sharing retains fixed neutral templates, preview and separate copy/share gestures. Neither excerpts nor situation selections enter the shared draft.

ActionGuide uses curated situation choices and local checkboxes, never secret fields, generated advice or automatic intervention. Checklist state is ephemeral and clearing/editing an analysis clears its prior result and checklist. Completion marks user steps, never security status.

## Transparency and verification

Behind the AI explains the actual pipeline, three source classes, verified dataset counts and reused-test annotation metrics with adjacent limitations. It credits the dataset, frozen comparison encoder and third-party tools, distinguishing the team's trained classifier from reused resources. Never claim independent language evaluation, public deployment or guaranteed protection.

Keep the language selector native and at least 48px high across browser engines. A same-origin decorative chevron and `appearance: none` prevent WebKit's compact platform rendering from shrinking the target. Labeled optional metrics regions support left/right arrows when focused, including WebKit; modified shortcuts are preserved.

Verify contrast, real frontend/backend flows, browser OCR, keyboard operation, reduced motion, desktop/mobile/reflow and 200% zoom. Automated accessibility evidence is not screen-reader speech testing or WCAG certification. Chromium, Playwright Firefox and Playwright WebKit engine checks are recorded in the test report. Actual Safari, physical mobile, screen-reader speech, hosting logs/HTTPS and independent usability testing remain unverified.
