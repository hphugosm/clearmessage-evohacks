# 06 — Optional browser screenshot text extraction

Paste the following block into Codex, or ask Codex to read this file. If /goal is unavailable, use the text after /goal as a normal task request.

```text
/goal This goal is optional. First verify from docs/STATUS.md and checks that text input, the genuine model, safe policy and reproducible release work. If not, skip OCR and explain why. Otherwise add only PNG/JPEG screenshot → editable text using Tesseract.js in the browser, behind a feature flag.

Read AGENTS.md, BRAND_BIBLE and UI_COPY. No camera access, PDF, external website screenshotting, cloud OCR or multimodal API. The user selects a file and the image stays in the browser. Verify English language-data availability/license and any additional language chosen for input support. Worker/WASM/language assets are acquired at setup and served from the app origin.

Bound file bytes and decoded pixel count; validate actual PNG/JPEG content. Display recognized text for editing and explicit Use this text/submission. Do not automatically analyze hidden OCR output. Blank/blurred/nonsensical results offer manual input and cannot reassure. English controls and errors must match real implemented limits.

Release object URLs, worker and memory; store no screenshots between visits. Text MVP works with the flag off. Avoid broad unrelated refactoring.

DONE: test fictional screenshots, blur, wrong format and bounds; verify images never leave the browser, text is submitted only after confirmation and manual fallback works. On trouble disable the bonus. Record actual OCR quality and remaining limits, update docs/STATUS.md and commit if permitted.
```
