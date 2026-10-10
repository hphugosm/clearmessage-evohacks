# 00 — Foundation and a real request

Paste the following block into Codex, or ask Codex to read this file. If /goal is unavailable, use the text after /goal as a normal task request.

```text
/goal Create or repair a verifiable ClearMessage foundation following AGENTS.md and docs/PROJECT_PLAN.md. Read docs/STATUS.md first: this delivery already includes Goal 00, so preserve and verify it rather than rebuilding blindly. The goal is a runnable app, a stable API and an honest unavailable-model response, not a completed detector.

Inspect the checkout and preserve unrelated changes. Use React/TypeScript/Vite and FastAPI/Pydantic. One Docker container will serve the frontend build and API. No database, login, analytics, external LLM or inbox access. Keep compatible dependencies pinned and isolated.

Maintain frontend/, backend/, ml/, tests/, docs/ and scripts/. Define POST /api/analyze, GET /api/health and generated schema/types from backend/contracts.py. The response distinguishes suspicious/review/no_strong_signals, analysis_complete, evidence, actions, limitations and model/policy/contract versions. Keep message-language hints separate from the English-only UI.

Read docs/BRAND_BIBLE.md, docs/UI_COPY.md and docs/LANGUAGE_POLICY.md before changing the form. Use a labeled message field, privacy note and Check Message button that really calls the backend. Until a model exists, return visible review/model_not_ready with analysis_complete=false and no fabricated evidence. Bound input and body sizes, use no-store and redact errors. Mocks belong in tests.

Document install/dev/test/build/container commands. Inspect existing host configuration read-only; do not publish, buy a plan or request credentials. Record unavailable Docker checks as untested.

DONE: real UI/API request, invalid/overlong/missing-model tests, available build/contract checks and English-only metadata/copy pass. Show exact commands/results, inspect changes, update docs/STATUS.md and create a local commit if the existing repository permits it. Stop after this goal.
```
