# ClearMessage brand bible

Version 1.0.0 · Style A — Modern & Friendly · 10 October 2026

This is the design and communication authority for ClearMessage. It turns the owner's supplied Style A description into concrete implementation requirements. The original image was not available in the recovered chat; this specification follows the detailed description supplied for this revision. The included illustration and mark are new implementation assets, not extracted copies of the original mockup. Read this file with LANGUAGE_POLICY, UI_COPY, design-tokens.json and the API contract.

## 1. Identity and purpose

**Product:** ClearMessage. **Project:** ClearMessage — EVOHACKS 2026. **Repository/directory:** `clearmessage-evohacks`. **Package/container identifier:** `clearmessage`. Preserve the capital C and M; do not split the product into two words, abbreviate it in the main header or translate it. EVOHACKS appears in project documentation/submission attribution, not as the product logo. No trademark, domain or organizational affiliation is claimed.

**Tagline and hero:** Understand messages. Make safer decisions.

**Purpose:** help people understand short messages, recognize warning signs and uncertainty, and choose a safer next step. The product supports decision-making; it does not verify identity, certify a link, guarantee protection or perform interventions automatically.

**Audience:** children, teenagers, adults and seniors, including people with low digital confidence. Use one inclusive interface. Do not ask for age or create patronizing age modes. The tone should be professional enough for adults and approachable enough for younger users.

**Personality:** calm, supportive, approachable, reliable and welcoming. Reassurance means explaining the situation and next step clearly, not claiming the input is safe. Communicate like a patient, knowledgeable friend.

**Positioning:** combine the polish of a modern digital health application, the warmth of an educational platform and the clarity of a public service. Do not imply medical approval, government affiliation or security certification. The guiding idea is technology that helps people understand without making them afraid.

## 2. Visual character

Use a light interface, generous whitespace, soft shapes, rounded white cards, restrained shadows and blue as the dominant color. Friendly vector illustration provides human context. Functional information remains more prominent than decoration.

Avoid dark cybersecurity aesthetics, neon effects, terminal imagery, padlock/shield guarantees, scary attack graphics, complicated dashboards, technical acronyms, risk meters, animated fake scans, countdowns, confetti, urgent blinking and marketing badges. Keep the interface contemporary without looking childish. Illustrations must not portray older users as helpless or younger users as rescuers.

## 3. Color system

The nine supplied palette colors preserve Style A. Derived colors provide accessible text and state surfaces. Use semantic tokens rather than adding ad hoc colors.

| Token | Purpose | HEX |
|---|---|---|
| `brand.primary` | Primary action, mark, focus | `#173DA5` |
| `surface.page` | Page background | `#F6F8FC` |
| `surface.card` | Inputs and cards | `#FFFFFF` |
| `text.primary` | Main text | `#172033` |
| `text.secondary` | Secondary text on white cards | `#64748B` |
| `text.secondary-page` | Secondary text on the pale page | `#5B6B82` |
| `state.positive.indicator` | No-strong-signals accent | `#16A34A` |
| `state.warning.indicator` | Review/suspicious accent | `#F59E0B` |
| `state.danger.indicator` | Stronger supported warning | `#DC2626` |
| `accent.decorative` | Illustration accent | `#6366F1` |
| `brand.hover` | Primary hover/active | `#12317F` |
| `border.subtle` | Nonessential card border | `#DCE3EF` |
| `border.control` | Input/control boundary | `#64748B` |
| `state.positive.surface` / `.text` | Soft green card and readable label | `#F0FDF4` / `#166534` |
| `state.warning.surface` / `.text` | Soft amber card and readable label | `#FFFBEB` / `#92400E` |
| `state.danger.surface` / `.text` | Soft red card and readable label | `#FEF2F2` / `#991B1B` |
| `surface.accent` | Decorative blue/purple surface | `#EEF2FF` |

Green, amber and red communicate result meaning only in the context of a text label, icon and explanation. Brand blue remains the primary action color in every state. Never recolor the submit button green to imply a safe check. Input validation errors may use danger text/borders with explicit wording.

Do not use bright green or amber as body text on white, or white text on those colors. Their source-palette role is an indicator/accent. Use the darker derived colors for labels. The supplied slate #64748B measures 4.48:1 on the pale page, so use the darker #5B6B82 there; retain the original slate on white cards. Decorative purple is not default small text. Subtle borders are decorative; essential input boundaries use `border.control`.

Normal text must meet 4.5:1 contrast; qualifying large text may use 3:1. Essential control/icon boundaries meet 3:1 against adjacent colors. Focus uses a 3px primary-blue outline with a 3px offset and sufficient surrounding space. Measure final pairs, including hover/disabled and state surfaces. The QA report records palette calculations; these do not establish full WCAG conformance.

## 4. Typography

Primary font: Inter, self-hosted from the app origin with the upstream SIL Open Font License retained. Use `font-display: swap`. Fallback: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Never load a font CDN during use. A font-loading failure must leave readable controls and stable layout. Do not invent a logo font dependency.

| Role | Size | Weight | Line height |
|---|---|---|---|
| Desktop hero | 36px | 700 | 1.2 |
| Mobile hero | 32px; 28px only at very narrow widths | 700 | 1.25 |
| Section/result heading | 24px | 600 | 1.3 |
| Card subheading | 20px | 600 | 1.4 |
| Body and input | 20px | 400 | 1.6 |
| Button | 18px | 600 | 1.4 |
| Secondary/help/metadata | 16px | 400 | 1.5 |
| Wordmark | 24px | 700 | 1.25 |

Use rem units relative to the browser default rather than blocking text enlargement. At a default 16px root, body is 1.25rem and hero 2.25rem. Labels may use 600. No functional text below 16px. Avoid thin weights, excessive uppercase, long centered paragraphs, compressed line spacing or extensive italics. Limit reading width to about 60–70 characters. Use short paragraphs and lists for parallel actions. Do not crop text into fixed-height cards.

## 5. Spacing and layout

Use a 4px base grid: 4, 8, 12, 16, 24, 32, 48, 64 and 80px. Standard card padding is 24px desktop/20px mobile; major surfaces may use 32px. Related label/input/help elements use 8–12px gaps; separate components use 24px; sections use 48–64px.

Page width is at most 1120px with centered margins. Horizontal gutters are 32px desktop, 24px tablet and 20px mobile. At desktop widths of 900px and above, use a two-column hero: interaction about 60%, illustration about 40%, gap 48px. The input must retain at least about 480px width in the desktop composition. The header contains the mark/wordmark and a small textual **EVOHACKS 2026 prototype** label; never suggest certification.

Left order: hero headline, introductory text, honest prototype/model status where necessary, input card, privacy notice, message-language hint, primary action and result. Put the interaction before illustration in DOM order. Results appear below the form in the interaction column and remain readable without opening a detail drawer.

The hero headline breaks naturally across two lines: **Understand messages.** and **Make safer decisions.** Do not force breaks that overflow narrow screens. Use the exact introduction in UI_COPY. The message field is white, rounded and generously padded; the primary button is full width in the input card.

Below 900px, use one column. Reduce or hide the decorative illustration below 700px. Do not place it before the input on mobile. At 360px and 320 CSS px reflow there must be no horizontal page scrolling. Main actions and limitations cannot disappear behind overflow. On-screen keyboards must not cover essential controls. Avoid sticky UI unless its behavior is verified at zoom.

## 6. Shape, border and elevation

Use 12px input/control corners, 16px card corners and 20px larger decorative panels. Small icon badges may be circular. Shadows are subtle: `0 8px 28px rgba(23,32,51,0.06)`; add a thin subtle card border when needed. Do not stack several shadows or glass/blur effects.

Inputs have a visible 1px control border, white background and primary text. On error use a readable danger border and inline explanation. On focus use the visible outer outline; retain label and input boundary. Pressed buttons use the darker brand color; do not move layout. Disabled controls have explicit busy text where appropriate and remain understandable. Hover alone never carries essential meaning.

## 7. Mark and wordmark

Use the included outlined speech-bubble mark with two message lines beside the ClearMessage wordmark. It represents understanding, not a safety guarantee. No shield, seal or verification tick is part of the logo.

Keep clear space at least one quarter of the mark width around the lockup. Minimum mark size is 24px in controls and 32px in the header; use the standalone 32px mark for the favicon. The wordmark should remain at least 20px on mobile. Use primary blue/primary text on light surfaces; a white version on primary blue is permitted if required. Do not stretch, rotate, outline text, add gradients, change capitalization or recolor the mark by result severity. Use actual text for the header wordmark so it remains accessible and crisp.

## 8. Illustration and iconography

The desktop hero uses a warm vector scene of an older adult and a younger person looking at a smartphone together. Both participate in understanding the message. Use rounded shapes, muted skin/clothing tones, soft blue and purple accents and a pale abstract backdrop. Expressions are attentive and comfortable. Avoid exaggerated childlike proportions, caricatures of aging, stereotypes, panic or a screen showing private content.

The scene is decorative, not interactive. In an HTML image use `alt=""` and `aria-hidden="true"`. Do not give the illustration keyboard focus or load it remotely. Reserve dimensions to avoid layout shift. It must never imply the model succeeded. Use the included SVG as an adaptable source; it was drawn for this delivery from the owner's description.

Functional icons use a consistent 24px viewBox, 2px outlined strokes and rounded caps. Pair icons with visible text. Use a warning triangle for suspicious/review, an alert circle for stronger warning and a checkmark only alongside the no-strong-signals label and explicit limitation. Mark purely decorative icon instances hidden from assistive technology. Do not rely on emoji appearance as a result icon.

## 9. Core component specification

### Header and hero

Keep navigation minimal. There is no interface language toggle or complicated menu. The page has one h1. The paragraph explains the task in ordinary language. The decorative right-hand illustration supports the main interaction.

### Message input card

Use a persistent **Message text** label, not a placeholder-only label. Placeholder: **Paste the message here…**. Default textarea height is about 200px, resizable vertically. Body/input text is 20px. Show the 2,000-code-point limit and character count without truncating pasted text. Connect privacy, limit and error text with `aria-describedby`. Set `aria-invalid` for actual invalid input. Preserve the user's current input after a failure. Disable editing only while that request is pending; editing afterwards clears the old result.

### Message-language hint

Label **Message language**. Options: **Not specified**, **English**, **Czech**, **Other language**. All labels are English. This is a hint about input; it is not a UI locale, automatic detector or promise of model support. Keep the current contract unless a tested, versioned change is required.

### Primary button

Visible label **Check Message** with a small outlined right arrow hidden from assistive technology. Accessible name is **Check Message**. Minimum height 48px; preferred main action 52px. Primary blue/white, 12px radius, 18px/600. During a request use **Checking…**, disable duplicate submission and announce the state. Never simulate progress percentages. The current integration says checking while requesting the service and honestly marks every returned assessment as incomplete; a missing or failed model must be disclosed.

### Result card

Use one visible state label, a 24px heading, short explanation, **Why do we think this?** and **What should I do?** for completed analyses. Limit the initial reasons and steps to three each. Show service and coverage limitations directly, not only in a tooltip. A model-only signal must not fabricate a request, domain or phrase. If no supported reason exists, use the honest general template. Do not display raw private snippets in the default card.

### Help summary

The current integration provides a preview and user-initiated native sharing; selectable preview text is the manual-copy fallback. Dedicated copy feedback remains future Goal 04 work. **Ask someone for help** opens a preview of fixed neutral wording. **Copy help request** copies only that preview. **Share help request** invokes native sharing after a click, with copy fallback. **Copied** appears in a polite live region. On clipboard failure offer selectable preview text without claiming success. Cancelling native share is not an analysis failure. Never select a recipient or send automatically.

### Optional OCR

Hide when disabled. **Choose screenshot** accepts validated PNG/JPEG. Show editable recognized text and **Use this text** only after completion. Recognizing an image must not submit it for analysis. A blank/blurred/unsupported image offers manual text input. The screenshot stays in the browser; approved text travels to the backend on explicit submission.

## 10. Result semantics and all operational states

| Situation | Label and treatment | Requirement |
|---|---|---|
| Completed no strong signals | Green **No strong warning signs found**, checkmark | The safety limitation is adjacent and visible; verified scope/full coverage are prerequisites |
| Supported concern | Amber **Suspicious message**, warning triangle | Explain actual supported signals and an independent verification step |
| Stronger supported concern | Red **Potential scam**, alert circle | Still API `suspicious`; require a documented validated presentation rule, not invented certainty or simply counting vague features |
| Completed but uncertain | Amber **We couldn't assess this reliably** | API `review`; explain scope/uncertainty and what to do |
| Model missing/inference failed | Amber/neutral **Analysis not performed** | `analysis_complete=false`; state the check did not happen and offer independent verification |
| Empty/overlong input | Inline error | No API call for client-known invalid input, no result card implying analysis |
| Offline/timeout/invalid payload | Inline service error | Never synthesize a no-strong-signals result |
| Pending | **Checking…** and polite announcement | No fake countdown, spinner spectacle or repeated request |
| Changed input/language | Remove prior result | A previous response must not appear to describe the new input |
| Clear/new check | Clear result intentionally | No hidden persistence or history |

The source Style A names three visual cards; the product additionally requires an honest review state. Preserve all core API semantics. The current provisional model renders review or supported suspicious results, always analysis_complete=false. Missing-model states remain honest. Completed no-strong-signals and stronger red presentation are disabled; those illustrative states require verified scope and validated policy before use.

## 11. Voice and English copy

Write short, concrete sentences at a reading level suitable for nontechnical users. Prefer **message**, **warning signs**, **check**, **someone you trust** and **verify through a familiar channel**. Avoid **malicious payload**, **inference**, **confidence score**, **classifier** and **OTP** in the user flow. Developer documents may use precise technical terms.

| Avoid | Use |
|---|---|
| WARNING! MALICIOUS PHISHING ATTACK DETECTED! | This message looks suspicious. Let's look at what might be wrong. |
| Your message is completely safe. | We haven't identified strong warning signs. This doesn't guarantee the message is safe. |
| You fell for a scam. | These messages can be convincing. Here are steps you can take now. |
| AI certainty: 98%. | This message contains warning signs. Verify it through a familiar channel. |
| Error 500. | We couldn't complete the check. Try again later or verify the message another way. |
| Automatically sent to your family. | Review this help request, then choose whether to copy or share it. |

Do not claim the app is infallible or blame the user. No absolute assurance, panic, pressure or faux friendliness. Use UI_COPY as the exact wording source. The supplied **Check Message** capitalization is preserved as the primary-action exception to general sentence case.

## 12. Accessibility and motion

Use semantic form controls and headings, meaningful labels, visible focus and logical DOM order. The illustration is skipped by keyboard/screen readers. On validation failure focus the message field and announce the inline error. On returned analysis focus the result heading (`tabIndex=-1`) and use a polite status announcement without repeated verbose reads. Test announcements with a real screen reader before claiming conformance.

Support keyboard-only completion, 200% zoom, text enlargement and narrow reflow. Aim for at least 48 × 48px hit areas for action controls. Links have descriptive wording and are identifiable beyond color. No important text depends on a tooltip or icon. The header, input, privacy and result limitation remain visible at mobile widths. Validate contrast and focus geometry.

Transitions may last 120–180ms for color/border changes. No bouncing, parallax, scanning animation or delayed content reveal. Under `prefers-reduced-motion`, remove animation and transition effects. Never delay results for theatrical effect. Respect font loading failures and slow networks. Use same-origin assets and no trackers.

## 13. Brand applications and handoff

README, submission slides and demo titles use ClearMessage and the English tagline with the same blue/white/navy palette. Use screenshots from the actual current app. Label concept-only cards and mock data visibly. Never edit a screenshot to imply a trained model or completed feature. A subtitle may say **Short-message guidance prototype**. A prototype badge is an honest development label, not a trust seal.

Implementation assets: `assets/brand/mark.svg`, `assets/brand/support-illustration.svg`, `frontend/src/brand-tokens.css`, `docs/design-tokens.json`, and the self-hosted font/license under `frontend/src/assets/`. The app shares these sources; do not create conflicting copies of colors or illustration geometry. THIRD_PARTY_NOTICES and MIGRATION_REPORT record source and asset integrity. Asset names and metadata are English.

Before frontend work, read this bible and UI_COPY. Implement the token system first; reuse a small set of components. Future frontend work must cover completed result states, help copying and accessibility without changing the naming/language policy. A dark theme or substantially different visual direction requires an explicit scope decision; do not add it during the hackathon by default.

## 14. Brand acceptance checklist

- Correct product/repository/package names and English-only UI, errors and accessible text.
- Two-column desktop hero; input first on mobile; illustration decorative and appropriately hidden/reduced.
- Inter or declared fallback; prescribed scale; no functional text below 16px.
- Palette tokens, rounded corners, subtle borders/shadows and 48px minimum actions.
- Measured contrast, visible focus, keyboard flow, narrow reflow and 200% zoom.
- Text/icon/color result labels, visible uncertainty and visible no-safety-guarantee wording.
- Reasons reflect actual evidence; no percentages, fake scans, guarantee seals or unimplemented claims.
- Every error and absent-model state clearly says the analysis was not performed.
- Neutral preview and user gesture for help actions once implemented.
- No external asset requests, private-data storage or hidden message sharing.
- Automated and manual checks are reported separately; full accessibility certification is never inferred from the checklist.
