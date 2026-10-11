# ClearMessage Goal 05 release verification

## Release state

No public deployment occurred. There is **no public application URL** and no
existing authorized destination/account or hosting configuration. Docker CLI,
daemon and alternative runtimes are unavailable on the verification host.
Container build/run, Linux image execution, Compose enforcement, public HTTPS,
proxy/hosting body logging and anonymous public access are **not tested**.
Prepared configuration is not evidence of deployment or container execution.

The fresh local verification **passed**. [Machine-readable measured evidence](data/goal05-local-release.json) was written only after every assertion passed. A failed
run prints a fixed failure code and cannot be treated as passed. Initial clean
runs failed the 30-second startup allowance; separate cold imports took about
35 seconds. The final harness allows 120 seconds and measures actual startup.
Docker healthcheck start-period is provisionally 120 seconds, not measured Linux
startup. Ordinary loopback HTTP remains distinct from public HTTPS.

## Clean checkout and trusted asset acquisition

Clone/copy this project into a new directory without reusing `.venv`,
`node_modules` or `build`. No Git remote or public artifact download exists in
this local repository. Use a supplied source checkout; do not invent a clone URL.
Python 3.13 and Node meeting `frontend/package.json`'s engines are required.
Packages are installed locally with recorded hashes/integrity, not globally:

```sh
sh scripts/install.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" frontend/node_modules/.bin/playwright install chromium
.venv/bin/python scripts/prepare_model.py --artifact-file /path/to/trusted/tfidf_c2.0.json
npm --prefix frontend run build
sh scripts/test.sh
.venv/bin/python scripts/verify_release.py --clean-install
```

Obtain **this project's original trusted Goal 02 output** from its owner/local
backup. The importer accepts JSON only, checks the artifact and tracked selection
report, refuses a differing existing canonical artifact, then stages
`build/model.json`. No arbitrary pickle, remote code or replacement model is
accepted. Missing/mismatched assets are a release blocker, not successful setup.

| Asset | Required SHA-256 |
|---|---|
| `ml/artifacts/goal02-provisional-v2/tfidf_c2.0.json` | `7fe727cfb7868445f07ad32b0449131165268a8c5cbd8bafb71dd2b5178747fa` |
| tracked `ml/reports/goal02-provisional-v2.json` | `b0d359771769be9f983370eec8599b7be13a6b55c4bc274259694a317eef3715` |

[MODEL_CARD](MODEL_CARD.md#integrity-device-and-reproducibility) documents the
explicit local training/reproduction path with source audit, immutable provisional
manifest and `--allow-provisional-original-labels`. That command was **not run**
by this goal and does not approve the human review. A newly trained different
hash requires a separate reviewed model/selection/config update; do not bypass
integrity checks. Restoring the existing hash-pinned provisional project artifact is the current
release setup path. The underlying experiment remains provisional.

The selected TF-IDF JSON includes word/character vocabulary, learned IDF,
linear coefficients and preprocessing parameters. No separate tokenizer or
MiniLM encoder is required at runtime; the earlier comparison encoder assets
are excluded. Full allowed text is processed without transformer truncation.
This is reuse of our trained short-message classifier, not pretrained LLM work.

## One-process local fallback and one-container configuration

```sh
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/package_runtime.py --output build/runtime
(cd build/runtime && ../../.venv/bin/python scripts/serve.py --port 7860)
# In another terminal, from the repository root:
.venv/bin/python scripts/healthcheck.py --port 7860
.venv/bin/python scripts/healthcheck.py --port 7860 --require-model
```

`build/runtime` must be absent/empty or exactly match the generated package.
Choose a new output path if sources changed; differing files are preserved.
FastAPI serves `/`, same-origin assets and `/api` in one CPU process at the
loopback address. No account, cookie, browser cache/history or public proxy is
required. The packager emits SHA-256 for every runtime file and excludes raw
corpus, tests, training/acquisition CLI, encoder, GPU dependencies and Node.
Model/report verification occurs at build and startup; requests/restarts never
install, download or retrain. The normal package is unchanged by analysis.

On a Docker host, after explicit model staging:

```sh
docker info
docker compose config --quiet
docker compose build
docker compose up -d
curl --fail -D - http://127.0.0.1:7860/api/health
curl --fail -D - http://127.0.0.1:7860/api/analyze \
  -H 'Content-Type: application/json' \
  --data '{"text":"Fictional meeting tomorrow.","message_language":"en"}'
curl --fail -D - http://127.0.0.1:7860/api/analyze \
  -H 'Content-Type: application/json' \
  --data '{"text":"Please send me your login code.","message_language":"en"}'
docker compose exec -T app python scripts/healthcheck.py --require-model
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-release.mjs 7860 real-model
docker compose logs --no-log-prefix
docker compose down
```

The pinned Node build stage creates assets; the pinned Python build stage installs
binary hash-locked dependencies, verifies model/report and stages the whitelist.
The final Python stage contains the venv and runtime only and runs as UID 10001.
Compose binds loopback and proposes read-only root, 16 MiB `/tmp`, no capabilities,
no-new-privileges, 64 processes, one CPU and 512 MiB RAM. Its internal network is
an intended egress restriction; Linux/Docker enforcement and port accessibility
must be tested, not inferred from YAML. Install/build needs explicit Internet
access; runtime assets do not. No production fixture/model override exists.

## Runtime limits and health

One Uvicorn worker, one numerical thread, one nonblocking inference slot and
**eight admitted HTTP requests**, replacing the foundation's 32-connection
setting. Admission includes health/assets; overflow returns fixed 503/no-store.
An inference-slot conflict produces an incomplete response with actual rule
basis, not queued text or a fabricated model result. Analyze input is at most
2,000 Unicode code points and 32 KiB body, with a five-second total body deadline.
Timeout returns fixed 408/no-store. Keep-alive is five seconds and backlog 64;
backlog is not an active-connection cap. Before public exposure an approved
upstream must bound partial headers, connection/rate abuse and TLS.

`GET /api/health` separates live service (`service_status=ok`) from verified
artifact readiness (`model_ready`). The default Docker probe checks liveness;
`--require-model` fails when the model is missing/corrupt. Model-ready does not
mean reviewed/evaluated detector quality: current results always have
`analysis_complete=false`, ordinary/unsupported input remains `review`, observed
requests may warn, and failed inference exposes rules-only limitations.

## Actual local measurements — 11 October 2026

Host: **Apple M5, macOS arm64**, Python 3.13.1, Node v25.8.2,
Chromium 156.0.8078.4. Runtime versions are recorded in the JSON;
no Node 24/Linux container execution is inferred from this host.

| Measurement | Actual result |
|---|---|
| Fresh-install process to first HTTP health | 61.741 seconds |
| Same-package offline restart to HTTP health | 0.894 seconds |
| Failed-model process to live HTTP health | 0.702 seconds; model not ready |
| Sampled peak RSS, first process / restart / failed model | 163.88 / 161.77 / 154.28 MiB |
| 100 sequential short/near-limit requests p50 / p95 / max | 1.71 / 1.904 / 3.781 ms |
| 32 requests, eight clients, p50 / p95 / max | 8.799 / 10.982 / 11.227 ms; 32 HTTP 200 |
| Eight held incomplete bodies, ninth request | 503/no-store; all held bodies 408/no-store after five-second deadline |
| Startup, analysis, restart and failed-model outgoing attempts | Zero recorded socket/DNS/UDP attempts |
| Captured application stdout/stderr | Empty in all three processes; canary/path checks passed |
| Package integrity after genuine inference and restart | All 29 file hashes unchanged; no inference error in sequential flows |
| Real-model / failed-model Chromium checks | Three genuine flows each; same-origin assets, no storage or page errors |

**512 MiB** is a provisional release budget with roughly three times the observed
164 MiB process RSS, accommodating transient JSON parsing/libraries/request slots.
It replaces reliance on unmeasured foundation limits; keep a single CPU worker and
one numerical thread. This margin is not proof of Linux/Docker enforcement or
production-load capacity. Cold dependency imports account for most first-start
cost; the 120-second health start-period accommodates the measured 61.7-second
fresh startup, while warm restart loads existing assets in under a second.
No GPU, runtime download or retraining was involved.

## Verification method and public hosting blocker

The reproducible `verify_release.py --clean-install` harness uses a fresh venv
with only runtime requirements, clean npm installation/build, a whitelisted
runtime and real HTTP/Chromium. It tests ordinary, observed-warning, unsupported
scope, empty/oversized input and private canary flows. It measures startup,
100 alternating short/near-limit requests, a 32-request/eight-client burst, eight
slow-body admissions and the ninth request's 503. A second fresh process restarts
the unchanged package; a third loads only an intentionally corrupted temporary
model copy, proving live service with failed readiness and incomplete guidance.
No model mocks are used; test instrumentation remains outside the package.

An application-process audit hook blocks/records outgoing connects and DNS
lookups throughout startup/inference/restart/failure. Responses, captured
stdout/stderr and browser origin/storage/console are checked for private-data
leaks. Public fictional `.invalid` cases stay in the harness, not production
verdicts. RSS is sampled with `ps` every 50 ms including startup/load: it is not
a Linux cgroup peak, GPU measurement or image-size measurement. Client-side
HTTP timings include loopback transport; they are not mobile/Internet latency
or language accuracy. No public proxy/hosting was tested.

On **11 October 2026**, the official [Hugging Face Spaces overview](https://huggingface.co/docs/hub/spaces-overview)
requires a paid plan to create Docker/Gradio compute Spaces; CPU Basic having no
hourly charge does not remove that account requirement. Static Spaces cannot
serve this FastAPI runtime. No account/paid plan/destination was assumed, no
credentials collected and no subscription purchased.

For a future explicitly authorized existing destination, verify anonymously
accessible HTTPS, same-origin assets, no-store on success/error/overload, no
application/proxy/hosting body capture or analytics, redacted diagnostics,
request/connection bounds, offline runtime and all genuine flows including
failed readiness. If the host cannot demonstrate those privacy controls, keep
this loopback fallback. No Devpost submission, repository publishing or OCR
was performed.
