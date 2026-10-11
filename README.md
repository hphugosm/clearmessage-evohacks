# ClearMessage — EVOHACKS 2026

**Understand messages. Make safer decisions.**

ClearMessage helps people understand short messages and choose a safer next step.
React + TypeScript + Vite calls FastAPI/Pydantic, our genuinely trained Goal 02
TF-IDF + LogisticRegression model, and transparent textual rules. The interface,
documentation and project instructions are English; message language is separate.
The approved [Style A brand bible](docs/BRAND_BIBLE.md) governs the interface.

**The model is provisional. Human review is incomplete and language performance
is unverified.** Current analysis returns `suspicious` with an actual basis or
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
Internet is needed only for explicit dependency/browser/encoder setup, never analysis.

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

Actual raw counts: 5,971 rows, 4,844 ham / 489 spam / 638 smishing. Excluding
98 rows in 46 conflicting groups leaves 5,873 candidate rows. Cross-split group
intersections are empty. All 45 label decisions are now saved: 16 agreements and
29 requested corrections;
zero pending labels. Language/attribution, correction reconciliation and exclusion
approval remain incomplete.
The candidate has `data_split_ready=false`; no approved final freeze exists.
The user authorized a provisional experiment on original labels, described in
[MODEL_CARD](docs/MODEL_CARD.md) and [ML instructions](ml/README.md). This migration
does not retrain, inspect held-out/blind inputs or alter review decisions.

The chosen artifact is ignored by Git. A new checkout must restore the project's
trusted Goal 02 output with the recorded hash or reproduce it using the model
card's explicitly provisional workflow. Without it the application discloses
rules-only operation and model preparation fails; a checkout alone is not a detector.

```sh
.venv/bin/python scripts/prepare_model.py
.venv/bin/python scripts/verify_analysis.py
.venv/bin/python -m pytest tests/test_analysis.py tests/test_api.py -q
```

`prepare_model.py` checks the artifact, report and selection threshold offline,
then writes ignored `build/model.json`. It neither trains nor downloads.
`verify_analysis.py` measures fictional development smoke cases without saving
message text; its results are not language accuracy or real-world validation.

## Docker

Docker CLI/daemon are unavailable on this machine. **Build, run and healthcheck
are untested**, not passed. On a machine with Docker:

```sh
.venv/bin/python scripts/prepare_model.py
docker info
docker build --tag clearmessage:analysis .
docker run --rm --name clearmessage --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m --cap-drop ALL \
  --security-opt no-new-privileges --memory 512m --cpus 1 \
  -p 127.0.0.1:7860:7860 clearmessage:analysis
```

One final container serves build assets and API as nonprivileged user 10001.
Node exists only in the build stage. The final image includes the verified sparse
model and pinned selection report for offline startup verification, not raw data,
tests, encoder or Node. Base images are pinned by digest; registry availability
checks do not prove container execution. The healthcheck
measures service liveness.

## Contracts, privacy and project state

[API](docs/API.md), `backend/contracts.py`, `docs/openapi.json` and generated
TypeScript describe the shared versioned contract. All backend responses use
`no-store`; message bodies stay out of errors, logs, browser URLs and sharing.
Processing happens on our backend, not entirely in the browser.

No deployment destination/account is confirmed. No credentials, purchase,
publication or deployment is part of this migration. Hosting logs/proxies/HTTPS
need verification before a separately authorized release. Starlette's existing
httpx TestClient deprecation warning remains visible; it is not suppressed.

[STATUS](docs/STATUS.md) records executed checks and historical results.
[MIGRATION_REPORT](docs/MIGRATION_REPORT.md) records the ClearMessage migration.
[Project plan](docs/PROJECT_PLAN.md), [research](docs/RESEARCH.md),
[acceptance](docs/ACCEPTANCE.md), [planning notes](docs/PLANNING_NOTES.md) and
`AGENTS.md` are English. The local Git repository has no remote. Goal 04 completes
the simple Style A interface, neutral preview/copying and cancellation guards.
[UI verification](docs/UI_VERIFICATION.md) records browser and visual scope.
The existing workspace path is retained to preserve local environments;
use `clearmessage-evohacks` for new clone/delivery directories.
