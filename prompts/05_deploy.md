# 05 — Reproducible release and hosting

Paste the following block into Codex, or ask Codex to read this file. If /goal is unavailable, use the text after /goal as a normal task request.

```text
/goal Prepare and verify ClearMessage in one container using the implemented model/API/frontend. Do not add features. Read AGENTS.md and distinguish verified local execution from public deployment.

Complete the multi-stage build with FastAPI serving frontend and /api. Acquire pinned model/tokenizer assets during explicit setup/build with hashes, not analysis/restarts. Do not retrain on requests or require GPU. Measure startup, memory and latency; bound concurrency and requests. Health must distinguish service liveness from actual model readiness. Revise foundation resource limits from measured model needs.

Document a clean-clone setup. If artifacts are absent, provide a precise acquisition or local-training path with integrity checks. Never load untrusted pickles. README commands and English privacy/scope claims must match actual execution; a Dockerfile alone is not a passed container test.

Publish only to an existing destination authorized in this session. Verify HTTPS, anonymous access, no-store and no body logging in application/proxy/hosting. Verify no analysis egress. Do not buy subscriptions or publish repositories without authorization. Hugging Face compute Spaces may require a paid plan; recheck current conditions. If access is unresolved, prepare configuration and a verified local fallback, recording the actual blocker.

Run genuine ordinary/suspicious/review flows and a failed-model case in a clean environment. Ensure production has no fixture model or mock API. Diagnostics must not leak message text, secrets or internal paths. Serve fonts/illustrations locally and use ClearMessage names everywhere.

DONE: reproducible execution is actually tested. A deployment report includes a real URL only if deployed; otherwise state the blocker and local evidence. Update docs/STATUS.md and commit if permitted. Do not submit Devpost automatically.
```
