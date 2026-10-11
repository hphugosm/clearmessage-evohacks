# ClearMessage approved-model local release verification

11 October 2026. **Local release candidate passed; no public deployment occurred.**
There is no public URL. No publishing, subscription, account/credential collection,
external integration or Goal 08. Docker/alternative container tools are unavailable;
Docker build/run, Linux quotas/network enforcement, HTTPS, anonymous public access
and proxy/hosting no-body-logging are **not tested**. A prepared Dockerfile is not
container execution evidence. See [FINAL_AUDIT](FINAL_AUDIT.md) for GO/NO-GO scope.

## Approved artifacts and clean setup

The owner approved the staged Goal 01 decisions/metadata and exact 98-row reversible
quarantine after commit `c1a8c9f`. Corrected split preserves every candidate
assignment; final eligibility 5,873 (4,844 HAM / 439 SPAM / 590 SMISHING). New model
training/selection uses train/validation only. Test is previously evaluated, not
fresh blind validation. Languages and completed low-finding policy are unvalidated;
all API assessments remain incomplete. Dataset approval is not fraud certification.

| Required identity | SHA-256 |
|---|---|
| Approved split | `9fa155bd267fd5492523b297515b3b1a357832ce19e131357ba81198cf89b988` |
| Final review | `0c4748e7400ec54fe7e8dae343f33597a10339e5f68d5453a292b9d255c80b36` |
| Selected model | `b6e56c3f1d3428c4cc9aee2fe2caa2beb10bd30cabcf35df8da915041e3eb4e1` |
| Selection report | `3721e1f04a448633e1fb503dd06c4db6f81ce2b10116726ae29acb7faef172cd` |

No Git remote or public artifact URL exists. A new supplied checkout requires
Python 3.13, compatible Node per package engines, and trusted model restoration
from the owner's output/backup or explicit reproducible local training. The original
archive is needed for retraining, not inference. [MODEL_CARD](MODEL_CARD.md) records
hash-verified archive acquisition, clean metadata restoration and exact training
commands; no substitute corpus or untrusted pickle. Never retrain/download on startup.

```sh
sh scripts/install.sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" frontend/node_modules/.bin/playwright install chromium
# Restore only the recorded trusted project JSON if it is absent:
.venv/bin/python scripts/prepare_model.py --artifact-file /path/to/trusted/tfidf_c2.0.json
# Existing canonical asset: hash-check and stage without downloading/training:
.venv/bin/python scripts/prepare_model.py
npm --prefix frontend run build
sh scripts/test.sh
.venv/bin/python scripts/verify_release.py --clean-install --report docs/data/new-local-verification.json
.venv/bin/python scripts/package_runtime.py --output build/runtime-approved-v1
(cd build/runtime-approved-v1 && ../../.venv/bin/python scripts/serve.py --port 7860)
# Another terminal:
.venv/bin/python scripts/healthcheck.py --port 7860
.venv/bin/python scripts/healthcheck.py --port 7860 --require-model
```

`prepare_model.py` stages `build/model-approved-v1.json`; the older model/build
asset is preserved. Differing canonical/build files and existing runtime packages
are refused. Choose a new empty package/output path after changes. Whitelisted
package contains backend/build/assets, selected sparse model and selection report,
licenses/model card; excludes raw corpus, review files, tests, training CLI, encoder,
Node and GPU dependencies. Report/artifact/provenance/threshold are checked at load.
Already running owner processes are not silently restarted; launch a new process
or deliberately restart your own server to use the new on-disk configuration.

## Container configuration — prepared, unexecuted

Three pinned stages build the Vite frontend, install hash-locked binary Python
runtime dependencies, and run FastAPI/API/assets as UID 10001. Dockerfile and
.dockerignore now stage the approved JSON/report rather than the provisional one.
The selected runtime needs no encoder/tokenizer download. On an available Docker
host, after explicit trusted model staging:

```sh
docker info
docker compose config --quiet
docker compose build
docker compose up -d
curl --fail -D - http://127.0.0.1:7860/api/health
curl --fail -D - http://127.0.0.1:7860/api/analyze \
  -H 'Content-Type: application/json' \
  --data '{"text":"Please send me your login code.","message_language":"en"}'
docker compose exec -T app python scripts/healthcheck.py --require-model
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright" node frontend/scripts/verify-release.mjs 7860 real-model
docker compose logs --no-log-prefix
docker compose down
```

These commands were **not executed here**. Loopback Compose still proposes
read-only root, 16 MiB /tmp, no capabilities, no-new-privileges, 64 processes,
one CPU, 512 MiB RAM, internal network and 120-second health start grace. Resource/
network enforcement and platform image size must be measured on an actual host.
Application bounds: one Uvicorn process/numerical thread/inference slot, eight
admitted HTTP requests, 2,000 code points, 32 KiB body, five-second body receive
deadline; fixed 503/408 retain no-store. Upstream must bound idle/partial headers,
TCP/rates and TLS before public exposure. Liveness differs from model readiness;
model-ready differs from verified detector quality.

## Actual fresh local execution

[Measured JSON](data/approved-local-release-v1.json): fresh hash-locked runtime-only
venv, fresh npm ci/build, isolated whitelist, real HTTP/Chromium ordinary/warning/
unsupported cases and private canary; no fixture model. Offline restart uses unchanged
assets; failure corrupts only a disposable model copy. Application-process audit
hook blocks and records outgoing socket/DNS/UDP attempts through startup, requests,
restart and failure. Fonts/illustration remain same-origin. Logs, responses, storage,
share previews and no-store are checked. Client loopback health probes are allowed;
message URL visits are never made.

Host Apple M5 / macOS arm64, Python 3.13.1, Node 25.8.2, Chromium 156.0.8078.4.
This is neither Linux/Docker enforcement nor Internet/mobile latency.

| Measurement/check | Actual result |
|---|---|
| Cold startup / offline restart / failed model | 66.358 / 1.216 / 1.007 seconds |
| Sampled peak RSS, real / restart / failed | 156.81 / 162.39 / 154.61 MiB |
| 100 short/near-limit loopback requests, p50 / p95 / max | 2.180 / 3.416 / 4.161 ms |
| Eight-client, 32-request burst | 32 HTTP 200, 0 HTTP 503 |
| Asset identity after real inference/restart | All 29 file hashes unchanged |
| Admission overflow / slow bodies | Ninth request 503; eight held bodies 408 at five-second deadline, all no-store |
| Corrupt model | Service live, readiness fails, model_version null, no reassuring result |
| Egress / captured app logs | Zero outgoing attempts, empty stdout/stderr in all three processes |
| Browser | Genuine flows, local assets, zero external requests/storage/page errors |

The first fresh run failed because the browser harness still expected the old
provisional artifact hash. HTTP/new-model checks and zero-egress observations did
not make that run a pass. The expected identity was updated; the complete fresh
install/runtime/restart/corrupt-model rerun passed. No safety/assertion was weakened.

## Public hosting and release limits

No authorized destination or container runtime exists; no URL is invented. Public
HTTPS, anonymous access, application/proxy/hosting body-capture/analytics/secrets
controls and actual deployment artifact identity remain unverified. The earlier
Goal 05 hosting research is [historical](DEPLOYMENT_REPORT-goal05-20261011.md), not
a current account/plan verification or deployment authorization. Do not purchase
subscriptions or publish without an explicitly confirmed destination.

**GO for this tested local research prototype; NO-GO for a validated public detector.**
Independent language-confirmed evaluation, completed low-finding policy, platform/
hosting/privacy/resource testing and distribution licensing remain separate gates.
No Devpost submission, publication, deployment or optional OCR was performed.

Final-source verification also passed after tightening model loading to reuse the
verified bounded report bytes (no second unchecked read). The exact final package
ran offline with real HTTP/browser/limits/canaries using the project environment;
[final package manifest and checks](data/approved-final-package-v1.json) records
all 29 file hashes. This complements the fresh-install run and is explicitly not
a second fresh install or Docker test.
