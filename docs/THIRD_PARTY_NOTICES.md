# ClearMessage third-party notices

## Inter font

Inter by Rasmus Andersson and upstream contributors. The owner-supplied approved
Style A package includes the unmodified variable WOFF2 and full SIL Open Font
License 1.1. Source: [Inter project](https://github.com/rsms/inter), revision
`353b61b9f4430d5f420d56605a6e7993e0941470`, acquisition date recorded by that
package: 10 October 2026. [Pinned font source](https://raw.githubusercontent.com/rsms/inter/353b61b9f4430d5f420d56605a6e7993e0941470/docs/font-files/InterVariable.woff2).

Local file: `frontend/src/assets/InterVariable.woff2`; verified SHA-256:
`693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`.
License retained verbatim at `frontend/src/assets/Inter-LICENSE.txt`.
The application serves the font from its own origin with `font-display: swap`,
never a runtime font CDN. The font license does not license application code.

## Data, model and dependencies

Mendeley V1 data, CC BY 4.0: [DATA_SOURCES](../DATA_SOURCES.md) records authors,
actual bytes/hashes, label meanings and provenance limits. Raw data is not in Git
or the Docker image. Our trained sparse model is restored explicitly from the
project's verified output, not downloaded during analysis.

Frozen MiniLM comparison encoder, Apache-2.0, exact revision/assets:
[MODEL_CARD](MODEL_CARD.md) and `ml/encoder-assets.json`. We trained only its
classification head; we did not pretrain or fine-tune the encoder. It is not used
by the current sparse application runtime.

Exact backend/ML/frontend versions and wheel/integrity hashes remain in existing
locks. Backend runtime licenses and tldextract BSD-3-Clause / bundled PSL
MPL-2.0 notices are recorded in `docs/runtime-licenses.json`. Migration changes
no dependency versions. A complete redistribution notice/legal review remains a
release task; package existence does not prove full upstream clearance.

## First-party design assets

`assets/brand/mark.svg` and `support-illustration.svg` come from the owner's
approved Style A package. They were drawn with Codex assistance from the supplied
design description, rather than extracted from an original mockup, and contain
no stock photos or remote content. They are passive local vector assets.
Source and hashes: [MIGRATION_REPORT](MIGRATION_REPORT.md).

The owner has not selected a project distribution license. No trademark/domain
clearance or public-release authorization is inferred. Preserve all upstream
notices and choose the project license deliberately before publication.
