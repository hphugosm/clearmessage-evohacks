# ClearMessage — EVOHACKS 2026

**Understand messages. Make safer decisions.**

ClearMessage helps people understand short messages and choose a safer next step.
React + TypeScript + Vite calls FastAPI/Pydantic, our genuinely trained Goal 02
TF-IDF + LogisticRegression model, and transparent textual rules. The interface,
documentation and project instructions are English; message language is separate.
The approved [Style A brand bible](docs/BRAND_BIBLE.md) governs the interface.

**The dataset review is approved and the model was retrained. Language performance
and completed low-finding policy remain unverified.** Current analysis returns `suspicious` with an actual basis or
`review`, always `analysis_complete=false`. It cannot return `no_strong_signals`.
No percentages or safety guarantees are shown. Missing or failed inference is
reported honestly, with rules-only limitations where relevant. See the
[policy](docs/POLICY.md) and [model card](docs/MODEL_CARD.md).

There are no accounts, database, history, analytics, external LLM or inbox access.
Text is sent to our backend and processed in RAM; analysis makes no outbound
requests. Help sharing uses fixed neutral sentences, a preview and a separate
user gesture. It never includes the source message. Czech evaluation formats,
regression inputs and provenance remain available and unchanged.

## Requirements and installation

Verified locally: Python **3.13.1**, macOS arm64; Node **25.8.2**, npm **11.11.1**.
Node 24 is the pinned Docker build environment; its container execution remains
untested. Exact package versions and wheel/integrity hashes are locked in
`backend/requirements*.txt` and `frontend/package-lock.json`. Do not install globally.
Internet is needed only for explicit dependency/browser setup and container
builds, never analysis. The selected sparse model needs no encoder download.

Run these commands from the repository root:

```sh
sh scripts/install.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" frontend/node_modules/.bin/playwright install chromium
```

Dependencies stay in `.venv`, `frontend/node_modules` and `.cache`. The `.in`
files are inputs for deliberate dependency updates, not ordinary installation.

## Development

Start the backend and frontend in separate terminals:

```sh
.venv/bin/python scripts/serve.py
```

```sh
npm --prefix frontend run dev
```

Open [the development app](http://127.0.0.1:5173). Vite proxies `/api` to port
8000. Use fictional text only; do not paste real passwords or verification codes.
Selecting **Czech** describes the input and keeps the interface English. It does
not establish Czech model support.

## Tests and build

```sh
sh scripts/test.sh
```

This checks migration consistency, dependency conflicts, OpenAPI/TypeScript drift,
Python tests, client tests, the production build and real browser/API flows.
Ports 8000 and 5173 must be free; tests do not reuse unrelated servers. Browser
traces, videos and automatic screenshots are disabled. Failure mocks are confined
to tests. Normal end-to-end tests use the actual trained model and inert fixtures.

Individual checks:

```sh
python3 scripts/audit_migration.py
.venv/bin/python -m pytest -q
npm --prefix frontend test
.venv/bin/python scripts/export_contract.py --check
npm --prefix frontend run contract:check
npm --prefix frontend run build
npm --prefix frontend run test:e2e
```

Serve the build and API from one process:

```sh
npm --prefix frontend run build
.venv/bin/python scripts/serve.py --port 7860
```

Open [the built app](http://127.0.0.1:7860). The launcher disables access logging
and bounds concurrency. Without a frontend build `/` returns 404; API remains
available. `FRONTEND_DIST` may specify another build directory.

```sh
curl --fail http://127.0.0.1:7860/api/health
curl --fail http://127.0.0.1:7860/api/analyze \
  -H 'Content-Type: application/json' \
  --data '{"text":"Fictional message: meeting at school tomorrow.","message_language":"en"}'
```

`model_ready=true` means the verified artifact loaded, not that detector quality
is approved. Every current result remains an incomplete check.
Runtime policy 2 also verifies the Goal 02 selection-report hash, chosen artifact
and validation-selected threshold at startup. Missing or inconsistent assets
disable the model; no runtime download or substitute is attempted.

## Data and model reproduction

[DATA_SOURCES](DATA_SOURCES.md) records actual import counts, hashes, labels,
license and remaining review blockers. [Data preparation](docs/DATA_PREPARATION.md)
describes the offline audit and immutable group split. A new checkout needs the
original archive; the earlier automatic download returned 403. No substitute corpus.

```sh
.venv/bin/python scripts/prepare_data.py audit \
  --input ml/data/raw/Dataset_5971.zip --output ml/data/mendeley-v1-audit-v2 \
  --expected-sha256 9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3
.venv/bin/python -m pytest tests/test_data_prep.py tests/test_czech_format.py -q
```

Actual raw counts: 5,971 rows, 4,844 ham / 489 spam / 638 smishing. The owner
explicitly approved all 45 staged review decisions/metadata and reversible quarantine
of 98 rows in 46 conflicting families. Two SPAM training labels became SMISHING;
29 incorrectly saved choices were restored. The frozen approved corpus has **5,873
rows: 4,844 ham / 439 spam / 590 smishing**, with empty group/hash intersections.
Existing train/validation/test assignments were preserved. The test set was already
evaluated and is **not fresh blind validation**. English/Czech benchmarks remain
unavailable; 45 English training confirmations do not establish evaluation language.

The selected approved artifact is Git-ignored. Restore this project's trusted
Goal 02 output with the configured hash or reproduce it via [MODEL_CARD](docs/MODEL_CARD.md).
No public artifact URL exists. A clean data setup needs only the original pinned
archive plus tracked approval/history files; exact commands and measured comparisons
are in the model card. Missing assets cause honest rules-only operation.

```sh
# If absent, restore the trusted project output; no public artifact URL is available.
.venv/bin/python scripts/prepare_model.py --artifact-file /path/to/trusted/tfidf_c2.0.json
# If already present, validate and stage it offline:
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/verify_analysis.py
.venv/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
```

`prepare_model.py` checks the artifact, report and selection threshold offline,
then writes ignored `build/model-approved-v1.json`. It neither trains nor downloads.
`verify_analysis.py` measures fictional development smoke cases without saving
message text; its results are not language accuracy or real-world validation.

## Clean release and Docker

[Release instructions and measured evidence](docs/DEPLOYMENT_REPORT.md) describe
clean-clone setup, trusted artifact restoration, fresh-process HTTP/browser tests,
resource bounds and the outstanding container/hosting checks.

```sh
npm --prefix frontend run build
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/package_runtime.py --output build/runtime
.venv/bin/python scripts/verify_release.py --clean-install
```

The verifier explicitly installs hash-locked dependencies in a fresh temporary
venv, performs clean `npm ci`/build and tests the isolated production runtime,
restart and corrupted-model failure. It uses the genuine existing model and
blocks outgoing socket/DNS calls in the application process. It is **not a Docker
test**. The runtime package refuses to replace a differing existing directory;
choose another empty output directory after source changes.

Docker CLI/daemon and alternative runtimes are unavailable here. **Container
build, run, healthcheck and resource/network enforcement remain untested**.
On a machine with Docker and the trusted model staged above:

```sh
docker info
docker compose config --quiet
docker compose build
docker compose up -d
curl --fail http://127.0.0.1:7860/api/health
docker compose exec -T app python scripts/healthcheck.py --require-model
docker compose logs --no-log-prefix
docker compose down
```

Three stages produce one nonprivileged CPU runtime serving frontend and API.
Compose proposes a read-only filesystem, loopback port, internal network,
512 MiB memory, one CPU and 64 processes. These are prepared settings, not verified
Docker enforcement. The selected JSON includes vocabulary/IDF/head; no encoder,
GPU, raw corpus, training CLI, tests or Node ships in the final runtime. Model and
selection-report hashes are checked at setup/build and every startup; startup only
loads assets. Default health checks liveness; `--require-model` checks readiness.

## Contracts, privacy and project state

[API](docs/API.md), `backend/contracts.py`, `docs/openapi.json` and generated
TypeScript describe the shared versioned contract. All backend responses use
`no-store`; message bodies stay out of errors, logs, browser URLs and sharing.
Processing happens on our backend, not entirely in the browser.

No deployment destination/account is confirmed. No credentials, purchase,
publication or deployment occurred. Fresh local release verification passed;
public HTTPS, proxy/hosting logging and container execution remain unverified.
See the release report for measured scope. Starlette's existing
httpx TestClient deprecation warning remains visible; it is not suppressed.

[STATUS](docs/STATUS.md) records executed checks and historical results.
[MIGRATION_REPORT](docs/MIGRATION_REPORT.md) records the ClearMessage migration.
[Project plan](docs/PROJECT_PLAN.md), [research](docs/RESEARCH.md),
[acceptance](docs/ACCEPTANCE.md), [planning notes](docs/PLANNING_NOTES.md) and
`AGENTS.md` are English. The local Git repository has no remote. Goal 04 completed
the simple Style A interface, neutral preview/copying and cancellation guards.
[UI verification](docs/UI_VERIFICATION.md) records browser and visual scope.
The existing workspace path is retained to preserve local environments;
use `clearmessage-evohacks` for new clone/delivery directories.
