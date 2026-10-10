# ClearMessage sources and reuse decisions

English revision: 10 October 2026. The owner-supplied English planning package records prior checks of key event, primary-dataset, hosting and contrast references. This migration did not recheck external rules, pricing or availability. The entries below retain those dated research leads, not a fresh exhaustive audit; recheck changing event/hosting terms before release. This is a research inventory, not an implementation report. Actual local acquisition, hashes and provisional training results are recorded in DATA_SOURCES, MODEL_CARD and STATUS; they must not be confused with the older planning assumptions. Published licenses and counts must be checked against acquired files and upstream provenance before use. The entries summarize sources; they do not reproduce source text.

## Event

[R1 — Official rules](https://evohackathon2026.devpost.com/rules): 11 October 2026 at 11:59 PDT, or 20:59 Europe/Prague. The page header uses 12:00 PDT/21:00. Choose the earlier deadline and target 19:00 internally. Live judging is listed for 12:00–13:00 PDT/21:00–22:00 Prague. The four criteria are impact/utility, technical execution, creativity and presentation, each 25%. The rules require new code/assets during the official event; this package contains no organizer clarification permitting reused data/models/components.

[R2 — Event overview](https://evohackathon2026.devpost.com/): consult the required submission fields for the repository, description, demo video and project availability. The original plan specifies a 2–3 minute demo and a live app or local instructions. Confirm fields before submission.

## Data candidates

[D1 — Primary short-message dataset](https://data.mendeley.com/datasets/f45bkkt8pr/1): Sandhya Mishra and Devpriya Soni; published 20 June 2022; DOI 10.17632/f45bkkt8pr.1; version 1; CC BY 4.0. Its description reports 5,971 records (4,844 ham, 489 spam, 638 smishing) and LABEL/TEXT/URL/EMAIL/PHONE fields. These are source-reported numbers, not imported counts. Preserve the distinction between advertising and phishing. Audit label definitions, age, languages, origins and possible overlap with SMS Spam Collection.

[D2 — Email candidate](https://figshare.com/articles/dataset/11_Phising_Email_Datasets/25437178): the supplied research records CC BY 4.0 and restricted direct access. File contents and the complete scope of reuse are not verified here. Not an MVP dependency. Check spam/phishing distinctions and repeated upstream sources.

[D3 — Supplemental spam data](https://archive.ics.uci.edu/dataset/228/sms+spam+collection): the supplied research records CC BY 4.0. ham/spam is not benign/phishing ground truth. Check provenance and deduplicate before any combination with D1; more rows alone are not a reason to merge.

[D4 — Deferred URL project](https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset): source descriptions in the supplied research report CC BY 4.0, 235,795 URLs, 54 features and label 1 for legitimate, 0 for phishing. Some features require HTML, which our runtime does not fetch. Do not import an incompatible notebook or add this second model to the MVP.

[D5 — Audit before considering](https://huggingface.co/datasets/zefang-liu/phishing-email-dataset): the supplied card research reports LGPL-3.0 and examples mixing advertising/spam with phishing. Do not treat its target variable as verified fraud without an audit.

[D6 — Excluded combined source](https://huggingface.co/datasets/ealvaradob/phishing-dataset): the supplied research records an Apache-2.0 card and mixed URL/HTML/SMS/email sources. Audit each upstream license rather than assuming the aggregate card covers everything. The project does not execute remote dataset code or use `trust_remote_code=True`.

No suitable public Czech corpus for this exact task was verified in the original research. This does not establish that none exists. Any additional-language development and blind challenge inputs require independent review and separately labeled results. All authoring/reporting remains English; do not translate source examples to disguise language limits.

## Model and implementation candidates

[M1 — Frozen multilingual encoder](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2): the supplied model-card research records Apache-2.0, 50 languages and 384-dimensional vectors. Pin the actual revision, tokenizer, token limit and artifact hashes. The team trains the classification head, not the encoder. Multilingual pretraining does not establish phishing performance in any language.

[C1 — scikit-learn leakage guidance](https://scikit-learn.org/stable/common_pitfalls.html): split before fitting learned preprocessing and use a Pipeline. Report our own evaluation; library use is not proof of reliability.

[C2 — Optional small UI components](https://github.com/shadcn-ui/ui): the supplied research records MIT. Native HTML is adequate for this foundation. Using a component library does not certify the app's accessibility.

[C3 — Optional browser OCR](https://github.com/naptha/tesseract.js): the supplied research records Apache-2.0. Use self-hosted worker/WASM/language assets with recorded provenance. Images stay in the browser; editable recognized text is sent only after user confirmation. It is not a PDF parser.

[C4 — Domain syntax](https://github.com/john-kurkowski/tldextract): configure `TLDExtract(suffix_list_urls=())` to avoid network PSL refresh. This is syntax parsing, not reputation or ownership verification. Check the chosen version/license before adding it.

[C5 — Native user sharing](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share): availability varies and secure context/user activation matter. Keep copying as an equal fallback and share only fixed neutral wording.

[C6 — Inter font](https://rsms.me/inter/): the official project provides Inter under the SIL Open Font License. If bundled, retain the full upstream license, pin the acquired file and record its hash in THIRD_PARTY_NOTICES and the package manifest. Serve the font from the application's own origin; never introduce runtime font-CDN requests.

## Accessibility and advice

[A1 — W3C contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): normal text needs at least 4.5:1 and qualifying large text 3:1. Measure actual pairs; amber/green indicator colors are not suitable as small text on white.

[A2 — W3C enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): 44px is the enhanced criterion. Our at-least-48px controls are a product decision, not a claim that WCAG AA universally requires 48px.

[A3 — FTC phishing guidance](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams): verify through a known independent channel rather than a contact/link from the suspicious message. Advice should match the user's situation and remain general. Do not request their credentials or imply the app can recover an account.

## Hosting and project prompts

[H1 — Docker Spaces](https://huggingface.co/docs/hub/spaces-sdks-docker): a candidate destination for one frontend/API container, not the only hosting option.

[H2 — Current Spaces overview](https://huggingface.co/docs/hub/spaces-overview): creating Docker/Gradio compute Spaces requires a paid plan; CPU Basic having no hourly fee does not make account creation universally free. Use an already authorized host or a documented local fallback. No purchase is authorized by a build prompt.

The supplied Codex goal syntax is preserved as a project workflow. CODEX_GOALS also provides plain prompts if the current client does not expose that command. Repository instructions and active status remain authoritative for the implementation; a goal prompt does not expand publishing or billing authorization.

## What the team creates

Application code, data audit and split pipeline, trained classification head, decision policy, English explanations, neutral help workflow, evaluation, tests and presentation. Credit reused datasets, pretrained encoders, fonts and libraries accurately, and disclose Codex use. A trained classifier does not mean the team pretrained a large language model. No reuse approval or legal clearance is inferred from this inventory.
