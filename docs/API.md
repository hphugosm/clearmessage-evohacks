# ClearMessage API contract 1.1.0 — analysis-policy-2

The source is `backend/contracts.py`; `docs/openapi.json` and generated
`frontend/src/api.schema.ts` are checked for drift. Regenerate explicitly:

```sh
.venv/bin/python scripts/export_contract.py
npm --prefix frontend run contract:generate
```

## POST /api/analyze

```json
{"text":"Please send me your password.","message_language":"en"}
```

JSON contains 1–2,000 Unicode code points of nonblank text. Body limit: 32,768
bytes including JSON. No silent shortening. Invalid types, extra fields and query
strings are rejected. `message_language` accepts `auto/cs/en/other`; `auto` means
unspecified, not detected. The interface is English and does not set this hint
implicitly or establish performance in English/Czech.

Example from the real saved Goal 02 artifact, not a fixture verdict:

```json
{
  "status": "suspicious",
  "analysis_complete": false,
  "headline_key": "suspicious_signals",
  "evidence": [{"key":"request_for_secret","basis":"observed_text_signal"}],
  "action_keys": ["verify_independently","do_not_send_secrets","ask_trusted_person"],
  "limitations": ["language_not_evaluated","human_review_incomplete","policy_not_validated","not_a_safety_confirmation"],
  "message_language": "en",
  "model_version": "clearmessage-sparse-v1:7fe727cfb786",
  "policy_version": "analysis-policy-2",
  "contract_version": "1.1.0",
  "share_summary_keys": ["analysis_not_completed","help_verify_independently"]
}
```

Statuses are guidance states, distinct from training labels:

- `suspicious`: an observed textual request or limited genuine model warning.
- `review`: independent verification needed; also uncertainty, spam alone,
  missing/failed model, insufficient text, unevaluated language or partial coverage.
- `no_strong_signals`: reserved low finding, **disabled in this release**. It
  requires complete analysis, verified model/language/policy and no evidence.

`analysis_complete` is separate. The current artifact always returns `false`:
final reviewed-data approval pending, language performance unverified, low-finding
policy unvalidated. A rule can warn during model failure, with
`inference_unavailable/rules_only` disclosed. HTTP 200 does not mean complete
assessment. Missing/corrupt artifact yields `model_version=null`, `model_not_ready`.

Evidence contains at most three fixed keys, no snippets, URLs or scores.
`request_for_secret`, `payment_pressure`, `secrecy_request` use
`observed_text_signal`; `model_signal` uses `classifier` and general similarity
wording, never invented word attribution. Spam is not phishing. See [POLICY](POLICY.md).

At most three `action_keys` describe independent familiar-channel verification,
not sharing secrets or pausing payment when relevant, and help from someone
trusted. `limitations` always include `not_a_safety_confirmation`. English
presentation is fixed in `frontend/src/copy.ts`. The client checks the whole
contract, evidence basis and completion invariants; unknown/corrupt responses
produce an honest service error, never a reassuring fallback.
Policy 2 retains the validation-selected warning threshold. Startup verifies the
selection-report hash, selected artifact identity/hash and threshold agreement;
drift or a report missing from the installation disables the model. The client
rejects evidence/status contradictions, classifier evidence outside explicit
English scope, and completion/share-summary contradictions. Schema fields and
contract version are unchanged; older policy responses are rejected explicitly.

`share_summary_keys` select only two neutral fixed sentences. The user opens a
preview, manually copies text or makes another gesture to invoke native Web Share.
The payload contains **only `text` from allowlisted templates**: no source,
status, evidence, URL, recipient or personal details. Cancellation is not an
analysis error. A separate Copy help request click writes only that fixed preview
to the clipboard; clipboard content is never read. Failed/unavailable copying
selects the preview for manual copying and does not claim success. No automatic
sending or external integration.

## Errors and health

Fixed error bodies contain `analysis_complete=false`, `error_key`,
`contract_version`, never Pydantic input/loc/ctx, exception text or source content.

| HTTP | error_key | Situation |
|---|---|---|
| 400 | unexpected_query / invalid_input / request_rejected | Query string or malformed request |
| 408 | request_rejected | Analysis POST body not fully received within five seconds |
| 413 | body_too_large | Body over 32 KiB |
| 415 | json_required | Wrong Content-Type |
| 422 | invalid_input | Empty/long text, types, extra fields, JSON |
| 404 / 405 | not_found / method_not_allowed | Path/method |
| 500 | service_unavailable | Sanitized internal failure |
| 503 | service_unavailable | All eight HTTP admission slots occupied |

Inference failure/busy slot returns HTTP 200 with limited review or actual rule
warning. The client times out after 10 seconds, with no synthesized verdict.
Editing text or input-language hint clears the result and help preview.

`GET /api/health` returns `service_status=ok`. `model_ready` means a verified
artifact loaded, **not approved detector quality**. Currently
`human_review_complete=false`, `evaluated_message_languages=[]`. Health includes
versions/limits. `/api/openapi.json` needs no external CDN.

## Privacy and operation

Source text stays in RAM of our backend. No history, user cache, telemetry,
training from user messages, third-party APIs, cookies or browser storage.
The launcher disables access logs. Responses use no-store/nosniff/no-referrer/CSP.
The API rejects query strings. One process admits at most eight simultaneous HTTP requests (including asset/health
requests) and has one nonblocking inference slot, with no private-text inference queue.
POST body buffering is capped at 32 KiB with a five-second total receive deadline.
Keep-alive is five seconds; the listen backlog is 64, not an active connection cap.
Idle/partial-header connections require upstream connection/header-rate protection
before public deployment. Fixed 408/503 bodies retain no-store. Private server
diagnostics omit exception details, addresses and internal paths. Numerical libraries
use one thread; one Uvicorn worker is used. The health probe defaults to service
liveness and remains successful if the artifact fails to load; its explicit
`--require-model` option fails for a missing/corrupt artifact. Neither probe asserts
approved detector quality. See [release evidence](DEPLOYMENT_REPORT.md).

The sparse model handles full allowed text without a transformer token cap;
this does not imply it understands every word. `full_text_coverage=false`
prevents a model warning or completed low finding. URL syntax uses `urlsplit`
and `tldextract` with `suffix_list_urls=()`, `cache_dir=None`, bundled snapshot.
No refresh, DNS, HTTP, WHOIS or redirects. HTTPS/TLD/shorteners are not fraud
evidence. No downloads occur during analysis. Hosting logs/proxies/HTTPS require
verification before a separately authorized deployment; none occurred here.
