# ClearMessage migration report

10 October 2026, Europe/Prague. Migration of the active repository at commit
`5295124` to English and approved **Style A — Modern & Friendly**. Goal 04 has
not started. No training, split freeze, annotation changes, held-out/blind input
inspection, deployment, publishing, credentials or payment occurred.

## Approved reference and scope

The owner supplied `clearmessage-evohacks/` after the initial repository audit
found no brand bible. Its `docs/BRAND_BIBLE.md` was read before interface edits.
The original approved delivery ZIP has SHA-256
`2e06864b3c88faf8486e8a65a0dd495f37944bf626ddc61d50d6c5fe422db2cc`.
The uploaded folder remains untouched, ignored by Git and Docker, as reference
material rather than a duplicate active app. Its older foundation status is not
current model evidence. Only passive assets, tokens, the font/license and reviewed
English planning translations were incorporated; all integration code was retained.

| Area | Migration |
|---|---|
| UI | Single English dictionary, labels, errors, limitations, help/recovery wording, accessible names and announcements; no locale toggle |
| Brand | ClearMessage lockup, exact hero tagline, prototype label, Style A tokens, rounded cards, local decorative illustration and Inter |
| Metadata | English HTML lang/title/description/theme/favicon; npm and lock root name; FastAPI/OpenAPI title; documented container tags |
| Instructions | English AGENTS, canonical English goal prompts/index; brand/language authorities and reproducible migration audit |
| Documentation | English README, planning/research/acceptance/notes, data source/preparation, ML/Czech-format docs, API, status/history; actual model facts reconciled |
| Assets/build | Local shared brand assets included in Docker build context; Vite emits SVG files rather than CSP-blocked data URIs |
| Public fixtures | Fictional English `.invalid` examples only; not training, labels, benchmarks or hardcoded verdicts |
| Tests | English UI assertions; retained original Czech input regression cases; added actual asset-loading, identity and reflow checks |

Code existence alone is not a passed check. The final checks and visual scope are
recorded in STATUS. The language audit checks owned tracked/new files, naming,
English metadata, local documentation links, explicit input exceptions, passive
SVGs and the pinned font/license. It excludes ignored datasets, caches and the
reference folder; it never displays private content or follows links. Its regex
scan assists editorial inspection and does not prove semantic English or WCAG.

## Safety and ML preserved

Contract **1.1.0**, policy **analysis-policy-1**, rules **observed-requests-1** and
model threshold **0.60** unchanged. OpenAPI's title alone changed. All actual
model-backed checks remain `analysis_complete=false`; production low-finding
branch remains disabled. Rules still inspect Czech/English message wording and
handle negation. Neither spam nor URL syntax alone is fraud evidence. Processing
stays in our backend RAM, no runtime downloads or egress. No user bodies in logs,
storage, errors or fixed-template sharing. Preview and separate human gesture
remain required. No automatic contacting, clipboard access or integration added.

A before/after hash snapshot checked **74 protected files** covering ML logic,
artifacts, audit/review/manifests, backend analysis and regression tests. **73
are byte-identical**. `tests/test_czech_format.py` changed only the expected
language of separate public demo fixtures and an English comment; its non-English
string constants are identical to commit `5295124`. The original Czech inputs
in the browser test remain unchanged while their UI assertions became English.
The source archive and JSON artifact hashes remain exact. The reference package's
older code was never installed or executed.

| Protected artifact | SHA-256 |
|---|---|
| Original archive | `9bbf3188fdad81495d8e82825648b9b63b53fc86841a3d26c02629990b233cc3` |
| Selected sparse model | `7fe727cfb7868445f07ad32b0449131165268a8c5cbd8bafb71dd2b5178747fa` |
| Local human review | `7cf04370060bc86e58349a06dc04fc82de680b0404e17eb44b4babe34a30a70c` |
| Candidate split | `51e9fd09c8f2800d9d53a6a4f147b328eaf26c04ad6497e074c38fad1a1271f0` |
| Provisional authorization | `21b3089b3e0aa56d076efef258f16cf4a2b8e9a4a27494d0ecf902a02bf2f9f5` |

No language support is inferred from an English interface. The 41 pending
reviews, original labels, absent approved split and absent verified EN/Czech
benchmark remain blockers to an approved detector.

## Explicit language and operational exceptions

| Exact path | Retained material / purpose |
|---|---|
| `backend/rules.py` | Czech/English pattern expressions used on message data; comments/docstrings English |
| `scripts/verify_analysis.py` | Original fictional Czech development smoke input, not public UI copy |
| `tests/test_analysis.py` | Original Czech regression input strings; policy/negation tests |
| `tests/test_czech_format.py` | Original Czech language/format data; independent-evaluation route |
| `tests/test_data_prep.py` | Original Unicode/Czech grouping input strings |
| `frontend/tests/app.spec.ts` | Four original Czech input strings, including secret-request canary case; English UI assertions |
| `ml/czech/record.schema.json`, `ml/czech_format.py` | Existing `cs`/`cz-` input metadata, with English schema/instructions |
| `ml/data/` (ignored) | Original public research data, audit/notes and explicit human review, not UI/demo content |
| `ml/manifests/`, `ml/reports/`, `docs/data/` | Immutable evidence/provenance, source-label and script/language identifiers, no translation of evidence |
| `frontend/src/assets/Inter-LICENSE.txt` | Verbatim upstream license, not rewritten for branding |
| `scripts/audit_migration.py` | Legacy/Czech search patterns and exact retained input strings for diagnostics only |
| `clearmessage-evohacks/` (ignored) | Owner-supplied reference snapshot, preserved rather than recursively migrated or shipped |
| Attached workspace path | Physical directory retained to preserve venv/shebangs and task attachment; use `clearmessage-evohacks` for new clones |

The additional-language evaluation format and data were neither deleted nor
translated. There is no actual blind challenge to remove; original research
messages were not used as public demos. Bibliographic titles and upstream names
retain attribution. No Czech prose remains in owned UI/docs/instructions.

## Design asset integrity

| Asset | SHA-256 |
|---|---|
| `assets/brand/mark.svg` | `f7f0c5b1824abdf82a7d245c95995b13f4cd255d4b2b9aad11c7ce5955138269` |
| `assets/brand/support-illustration.svg` | `2cc9e41063362e66416cfea9e8cebe572f0f666fd49128f9455ac013c663e3f0` |
| `frontend/src/assets/InterVariable.woff2` | `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3` |
| `frontend/src/assets/Inter-LICENSE.txt` | `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a` |

Inter revision/license/source are recorded in THIRD_PARTY_NOTICES; no global
installation or network font dependency. Mark and illustration came directly from
the approved package and were inspected as passive SVG data, not scripts.

## Verification and limits

Run `python3 scripts/audit_migration.py` and `sh scripts/test.sh` from the root.
Actual final outcomes, repaired initial failures and visual inspection are in
[STATUS](STATUS.md). Model preservation is evidence of unchanged functionality,
not an improvement in accuracy. Container build/run remain untested because
Docker is absent. Native page zoom/screen reader, Safari/Firefox, user studies,
public hosting and privacy of any future proxy remain separate checks. No
WCAG conformance, model approval or completed Goal 04 is claimed.

### Final measured evidence

`sh scripts/test.sh`: **exit 0**, 140 Python / 26 client / 16 browser tests,
OpenAPI/TypeScript drift, dependency check and TypeScript/Vite build all passed.
Both production serving and Vite proxy use the real sparse model. The migration
audit passed on 124 owned files. Offline model preparation and shell syntax passed.
Initial failures are separately documented in STATUS, not treated as successes.

The actual 1360px desktop form and 360px model-backed result were visually
inspected. Input card width 604.797px. Local Inter/mark/illustration render; no
page errors or external requests. At 320px there was no page overflow. At 640px
with root text enlarged to 200%, no overflow; this is text enlargement, **not
native browser page zoom**. Reduced-motion submit transition was 0s. Screenshots
of fictional input remain ignored under .cache, not a public demo or ML benchmark.

Measured sRGB contrast: main/page **15.301:1**, main/card **16.268:1**,
secondary/card and input boundary **4.759:1**, secondary/page **5.103:1**,
button **9.345:1**, hover **11.854:1**, warning label **6.837:1**, error label
**7.597:1**, focus/page **8.789:1**, focus/warning **9.011:1**. Palette/geometry
checks do not establish full accessibility conformance. Docker unavailable;
no successful container check claimed. Final diff check passed after removing
one trailing blank line. All protected artifact hashes still match.
