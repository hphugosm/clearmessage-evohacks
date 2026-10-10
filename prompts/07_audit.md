# 07 — Model privacy and usability audit

Paste the following block into Codex, or ask Codex to read this file. If /goal is unavailable, use the text after /goal as a normal task request.

```text
/goal Audit ClearMessage against docs/ACCEPTANCE.md and docs/PHASE_CHECKS.md. Read AGENTS.md. Test first, then repair demonstrated problems only. Do not weaken criteria or add features.

Verify clean install/build, real artifact/inference, token overflow, short/uncertain/out-of-scope inputs, service failure and diverse ham/spam/smishing cases. Use fictional content: code-sharing request without URL, Never share your code notice, family/school messages, advertising, Unicode and HTML/injection. Never visit harmful sites.

Run canary tests on logs, storage, error responses and help payloads. Block egress after model loading and confirm inference works. Check nonclickable URLs, no automatic sending, truthful failure states and no reassuring timeout/OCR failure.

Open the independently reviewed blind challenge only if the team supplied one. Record provenance, counts and methodology. Never fabricate independent results. Separate languages, classifier/policy and development/test with coverage/abstention and actual mistakes. If repaired from challenge failures, relabel that set development/regression; do not conceal false negatives.

Verify English-only UI, metadata and copy; Style A layout/tokens; keyboard/focus/live states; contrast; 360px mobile, 320 CSS px reflow, 200% zoom and manual/native-share fallback. Separate automated and actual manual evidence. Prepare a task for an unfamiliar user; do not invent a study. Child testing requires appropriate guardian involvement and fictional content.

DONE: docs/AUDIT.md includes severity, reproduction, repair/retest evidence, actual metrics and remaining limits. Fix critical privacy/integrity defects or disable affected features. Provide release/no-release advice grounded in evidence. Update docs/STATUS.md and commit if permitted.
```
