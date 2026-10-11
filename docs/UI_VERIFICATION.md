# ClearMessage Goal 04 interface verification

11 October 2026 · macOS arm64 · local locked dependencies. This records actual
checks, not a WCAG certification or language-performance evaluation.

The user story is Message text → same-origin POST → genuine Goal 02 sparse model,
observed rules and policy 2 → honest incomplete guidance → neutral help preview →
a separate copy/share gesture. Source text never enters the help component.
The existing artifact, thresholds, review, splits and Czech inputs are unchanged.

## Reproduce

Run from the repository root after the existing README installation:

```sh
sh scripts/test.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-ui.mjs
```

The second command starts its own loopback-only FastAPI server on port 8788,
uses the actual frontend build and model, captures only fictional development
inputs under ignored `.cache/goal04-ui/`, writes
[data/goal04-ui-verification.json](data/goal04-ui-verification.json), and stops
its server/browser. It does not reuse review servers. Build first if running the
visual command independently after source edits:

```sh
npm --prefix frontend run build
```

Native zoom is a separate manual check: open a dedicated testing browser on the
local build, use its browser zoom control to reach 200%, check submission, result,
limitations and keyboard navigation into the help preview and copy control.
Restore/close that dedicated browser when done. Root text enlargement in the
script is additional coverage, not a substitute for native browser zoom.

## Automated flow evidence

| Boundary/check | Executed outcome |
|---|---|
| UI and assets | English `lang=en`, accessible labels/metadata, self-hosted Inter and decorative SVG; font failure retains a working fallback |
| Client → API | Actual POST body, no source in URL; same-origin-only requests; production build and Vite proxy both tested |
| Model → response | `clearmessage-sparse-v1:7fe727cfb786`, `analysis-policy-2`, HTTP 200/no-store; three observed warnings on the fictional code/payment/secrecy request |
| Response → UI | Honest `review` or supported amber `suspicious`, incomplete label, maximum three reasons/actions, visible limitations; unavailable/network/malformed states do not reassure |
| Input edits | Editable text/language cancel pending requests; request IDs discard late success/error; old result/preview/copy feedback removed |
| Keyboard | Tab through textarea/language/button; Enter submits; result heading focuses; help opens focused read-only preview; Tab reaches copy; 3px focus outline |
| Copy/privacy | Actual isolated Chromium clipboard write equals fixed preview; test-only clipboard read verifies it; private canaries absent in preview, copy, share and browser console |
| Fallback/share | Denied/missing clipboard selects preview without success claim; native share cancellation/error simulated only in tests; no auto-copy/share/recipient; late copy feedback discarded |
| Motion/geometry | Reduced-motion transition 0s; default body 20px/buttons 18px; tested action/control heights ≥48px |
| Contrast | 14 final token pairs pass: text ≥4.5:1, control/focus ≥3:1; secondary card 4.759:1, secondary page 5.103:1, primary button 9.345:1 |

The future green contract is exercised only by an explicitly marked test fixture,
with its visible no-safety limitation. The actual provisional policy cannot emit
a completed no-strong-signals result. Red stronger-warning presentation stays
disabled. Failure/cancellation simulations are confined to tests.

## Separate visual inspections

All seven captured screenshots were opened and inspected, separately from the
programmatic width/contrast assertions. Chromium **156.0.8078.4**:

| Scope | Observed result |
|---|---|
| Desktop 1440 × 1000 CSS px, initial form | Two columns; left headline/form/action, right older/younger people with phone; blue/navy/white styling, readable local font and whitespace |
| Desktop real suspicious + help | Amber observed-warning card, three supported reasons and three actions; incomplete state and all limitations; fixed preview and visible copy action |
| Desktop real ordinary message | Separate neutral white review card with amber accent; no fabricated reason or reassurance |
| Mobile 360 × 800 CSS px, result/help | Single interaction-first column, illustration hidden; labels, actions, limits and copy remain reachable with vertical scrolling; no horizontal page overflow |
| Reflow 320 × 800 CSS px, result/help | Headline wraps; form/result/help fit the page; vertical scrolling only; no hidden actions or limitations |
| 200% text, 640 × 900 CSS px, result/help | Body 40px, enlarged wrapped controls/headline; no horizontal page overflow; results and copy remain reachable |
| Mobile 360 × 800 CSS px, empty error | Visible labeled input, focused textarea, explicit not-performed error, reachable Check Message action |

A separate headed **Google Chrome for Testing** window (1280 × 900 screen pixels)
on a dedicated port 8789 was controlled through native browser UI. Its zoom
control explicitly showed **200%**. A real three-signal check completed; native
screenshots confirmed the incomplete amber result, readable wrapping and neutral
help preview. Keyboard Tab reached the visibly outlined Copy help request control.
No native share was sent. This is a browser zoom check, not physical mobile testing.
Native browser chrome follows the machine's language; application content stayed
English and was not translated. Native evidence is recorded in
[data/goal04-native-zoom.json](data/goal04-native-zoom.json).

The preview is a resizable, read-only textarea. At narrow/enlarged sizes it has
its own vertical scrolling; the complete fixed value is selectable/copyable.
Result reasons/actions/limitations themselves are not hidden in a disclosure.

## Actual limits and check failures

The initial visual verification harness rejected equivalent uppercase/lowercase
HEX values, then misread CSS-minified three-digit HEX. Both were measurement
parser defects; normalizing case and expanding shorthand fixed them. The final
14 measurements and all layout assertions passed. A Chrome connector was
unavailable; the already installed isolated testing Chromium enabled native zoom.

No real screen reader, physical mobile on-screen keyboard, Safari/Firefox or human
participant testing occurred. Live region/labels/focus are automated assertions;
actual speech behavior remains unverified. Docker execution and deployment remain
untested/unperformed. The model is still provisional and every real result is
incomplete. No OCR, external integration, model retraining or data approval was
performed.
