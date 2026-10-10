# ClearMessage acceptance criteria

These are release requirements, not a claim of completion. Executed foundation, model, integration and migration checks are recorded in STATUS and MIGRATION_REPORT. For each criterion record actual command/version/date/outcome/blocker. Code existence is not execution evidence.

## Functional behavior

- A clean setup follows README and starts UI/API. Health distinguishes service and actual model readiness.
- Normal input reaches genuine trained inference after integration; no matching a few demo strings.
- Every result includes usable next steps and visible limits. Reasons are supported by actual evidence.
- Demo inputs are visibly fictional with inert, nonclickable links.
- Empty, very short, long, unevaluated-language, partial-coverage and out-of-scope inputs cannot falsely reassure.
- Timeout, offline API, missing model, invalid payload and internal errors never produce a completed low-risk result.
- Negated code/password-sharing notices are distinguished from requests to reveal secrets. Advertising is not automatically fraud.
- A code-sharing request without URL can be concerning; no URL, HTTPS, common TLD or institution name is a safety guarantee.
- Editing text/language clears stale results; repeated submission and late responses cannot mislabel new input.

## Privacy and hostile input

- Canary tests capture stdout/stderr, access/error logs and validation failures; private values appear nowhere outside the submitted request memory.
- Check query strings, cookies, storage, databases, cache, page URL, analytics and third-party calls. Use no-store.
- Block egress after model loading and verify real analysis. Check runtime model loading and PSL refresh separately.
- localhost/private IP/IPv6, URL userinfo, IDNA, javascript schemes, HTML/event handlers and instruction-injection text must not execute or open.
- No clickable detected links, dangerous HTML or remote message images.
- Help payloads use approved fixed templates and contain no message, snippet, URL, phone, email, account, code or sender name.
- Preview/user gesture precede copying/sharing. No automatic contacting family, bank, platform or police. Cancellation is not analysis failure.
- No secrets/user data in public source, screenshots or package. Never execute remote dataset code.

## Model and evaluation

- Record provenance/hash/license, audited label mapping and actual post-cleaning counts.
- Empty ID/group/hash intersections across train/validation/test.
- Group translated/template/near-duplicate families and disclose campaign/time-identification limits.
- Fit vocabulary and learned transforms only on train. Compare candidates on identical frozen splits.
- Select candidate/thresholds from validation before test. Data used for tuning is development, not held-out.
- Report confusion matrices, per-class precision/recall/F1 and denominators, classifier/policy separately, false positives/negatives and abstention/coverage.
- Separate English and any additional languages; label synthetic/manual origins. English-only UI is not a language-performance claim.
- Test actual tokenizer overflow with a concerning request near the end. Never silently truncate and reassure.
- Reload hash-verified artifact in a fresh process and verify inference parity. No untrusted pickle or runtime downloads.
- No hardcoded metrics, fabricated attribution, fraud probabilities or protection guarantees.

## English Style A and accessibility

- Use ClearMessage names, lang=en, one English dictionary and English metadata/ARIA/errors/help text. No bilingual README, locale toggle or fallback.
- Follow BRAND_BIBLE and tokens: desktop left interaction/right decorative illustration; mobile interaction first; Inter/fallback; 20px body; rounded white cards; prescribed state accents.
- At 360px mobile and 320 CSS px reflow, no horizontal page overflow or hidden action/limitation. At 200% zoom no lost functionality.
- Keyboard-only completion with visible focus, labels, errors and meaningful status announcements. Check a real screen reader before claiming support.
- Measure text/control/icon/focus contrast. Color is accompanied by label/icon; bright amber/green is not small text on white.
- At least 48px action controls; privacy and key limitations are not tooltip-only. Reasons/actions initially at most three each.
- No safe badges, percentages, fake scans, alarmist language, blame or infantilization.
- Human observation, if done: unfamiliar user checks a fictional message, explains the result and chooses a next step. Record real participant count and observations. Child testing requires appropriate guardian involvement.

## Optional OCR

- Genuine PNG/JPEG only, bounded bytes/pixels; no SVG/PDF/archive handling.
- Image stays in browser. Show editable text before user-approved submission.
- Blank/blurred/failed OCR offers manual input; never reassuring output.
- Release workers/object URLs and memory; no cross-visit image storage.
- With local assets acquired, block external network and confirm extraction. No hidden cloud fallback.
- The text application works with OCR disabled.

## Release and submission

- Clean-clone setup or clean container actually works with declared artifacts; Dockerfile existence is not verification.
- Public repository and app, if published, are anonymously reachable. Hosting/proxy logs/HTTPS verified.
- Actual 2–3 minute uploaded video plays with readable UI/audio.
- Submission description agrees with real implementation and measured results; disclose Codex and reused resources.
- Real model card, data credits and third-party notices accompany trained release. Do not fill missing results with placeholders presented as facts.
- Owner saves and submits required fields by internal 19:00 target on 11 October 2026 Europe/Prague. Check current notices and earlier official deadline.
