# Public demonstration and hosting

11 October 2026. The owner explicitly authorized a new public repository at
`hphugosm/clearmessage-evohacks` and a project page on the existing
`tymtrampolin.cz` GitHub Pages site (`hphugosm/tym-trampolin-web`).
The spelling is confirmed by the owner, the site's CNAME and Astro configuration.
The initially entered IDN would encode as `xn--teamtrampoln-2fb.cz`; it is not our destination.
No DNS or custom-domain ownership settings need to change.

## The public demo

GitHub Pages hosts HTML, CSS and JavaScript, not FastAPI or Python/scikit-learn
inference: [GitHub's hosting documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
The Pages build therefore uses a conspicuous **Recorded demo · no live analysis**
mode. It shows one fictional message and its actual captured local API-equivalent
model/policy result. It allows inspecting true rule highlights, guidance, masking
and neutral help sharing. It has no paste/screenshot input and sends no analysis
request. Read Aloud uses fixed guidance and device voices may use online services.
The Pages demo is not a functioning public detector and no arbitrary message
can be checked there. Hosting providers may log connection information.

`frontend/src/demo/recorded-example.json` retains the real response, date,
model SHA-256 and selection-report SHA-256. A local verification compares it
with fresh inference from the unchanged hash-verified approved classifier.
The live local application continues to call the real backend for all input;
it never substitutes the recording for a failed request.

Build the public artifact:

```sh
npm ci --prefix frontend
node frontend/scripts/build-pages.mjs
```

The output is `build/pages/`; its base is `/clearmessage-evohacks/`.
The recording build deliberately contains no OCR resources or model artifact.
React, React DOM and Inter licenses accompany the frontend. The project page
is also available under `/clearmessage-evohacks/project/` as a fallback.
The tracked workflow builds and deploys this exact mode on the public `main`.
Select **GitHub Actions** as the repository's Pages source before its first run.
How it works uses a query view, so direct loading/refresh does not require an SPA
rewrite. Application links and optional live OCR paths respect the build base.

## A future public live backend

The user has not provided a public backend destination. Do not invent a URL or
route visitors to a local computer. Deploy the existing same-origin container
on an explicitly approved Python/container host, using the trusted approved
model. Verify HTTPS, request limits, concurrency, hash checks, readiness,
no-store, absence of message-body logging at every proxy/host, error privacy and
actual anonymous inference before enabling public input. Never enable body
capture, analytics or an external inference service.

For a Pages frontend plus a separate backend, configure an explicit HTTPS origin
at build time as `VITE_API_BASE_URL=https://approved-api-host.example.invalid`.
The frontend rejects HTTP, credentials, paths, queries and fragments. The
unchanged backend currently has no cross-origin permission; a deployment must
add a narrowly scoped CORS policy permitting only the confirmed frontend origin
and `POST`/`Content-Type`, with no credentials. Verify preflight and actual
inference. Until this is implemented and tested, remain in recorded mode.
No thresholds, classifications or policy gates are changed by publishing.

## Repository and licenses

The owner authorized public source visibility, not an open-source license grant.
No first-party distribution license has been selected; the project is described
as **source available**, not open source. Upstream licenses, attribution and
provenance remain retained in THIRD_PARTY_NOTICES, DATA_SOURCES and the model card.
Raw datasets and ignored model artifacts are not pushed. The selected model
is available in the owner's existing local checkout; no public download exists.
Judge local full-inference setup therefore needs that trusted artifact. The
public recorded demo can be built from the repository without it.
Do not silently switch models, train a replacement or assert a clean-clone full
inference check until model distribution and setup are actually verified.

## Team site integration

`site/index.html` is the complete English project page. Copy it to
`tym-trampolin-astro/public/clearmessage/index.html` in the existing team web repo.
Astro copies this static file into `/clearmessage/` without importing the team's
analytics. Keep existing pages, CNAME and hosting settings. Add a discoverable
link in the projects section. Publish only those intended changes, preserving
all unrelated site content.

## Submission

Use `docs/submission/DEVPOST.md`, `VIDEO_SCRIPT.md` and `CHECKLIST.md`.
The video URL remains absent until a real 2–3 minute video is uploaded and its
anonymous playback is verified. No Devpost final submission is authorized yet.
