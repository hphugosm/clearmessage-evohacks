# ClearMessage project plan through EVOHACKS submission

Planning version: 10 October 2026. All times use Europe/Prague. This is a development plan, not proof that planned features work. See STATUS for actual implementation and RESEARCH for sources.

## Product and intended users

Paste a short message, understand its warning signs and choose a safer next step. Optional help sharing prepares a neutral request for someone the user trusts. ClearMessage serves children, teenagers, adults and seniors without requiring age, accounts or technical knowledge. English is the project's sole authored language.

The initial scope is SMS, short chat messages and short emails. Attachments, long email threads, sender identity and website reputation are not evaluated. Automate interpretation, signal prioritization and preparation of advice; do not automate account access, contacting people or blocking messages.

## Product flow

1. A two-column desktop hero says **Understand messages. Make safer decisions.** The left side contains the input and primary action; a decorative intergenerational illustration sits on the right. Mobile uses one column with the interaction first.
2. Before submission, explain that text is sent to the application's server, processed in memory and not stored or used for training. Tell users not to paste passwords or codes. Hosting configuration must support these claims before release.
3. Validate input, run the trained classifier, observe supported textual signals and apply a versioned policy with coverage and service checks.
4. Show one headline, up to three supported reasons, up to three next steps and visible limitations. Use approved English copy.
5. **Ask someone for help** previews a neutral summary built only from approved fixed templates. Copying or native sharing requires a user action. Never include the original message, snippets, URL or private identifiers.
6. A small **I already clicked or shared something** section offers situation-specific general next steps without asking for secrets.

The current implementation includes real classification trained on the approved dataset, observed rule evidence and sanitized help sharing. All results remain incomplete. Goal 04 adds gesture-only copying, cancellation guards and verified Style A layout/accessibility checks; STATUS records the actual scope and remaining review/language blockers.

## Result policy and Style A

| API state | Meaning | Visual treatment |
|---|---|---|
| `no_strong_signals` | Completed, in-scope analysis with no strong warning signs. Always include the safety limitation. | Soft green accent, text label and checkmark; no safe badge |
| `suspicious` | Supported warning signs. Specific reasons must exist in the message; a classifier-only reason stays general. | Amber **Suspicious message**; red **Potential scam** only under a separately documented and validated stronger-warning policy |
| `review` | Insufficient evidence, unsupported scope or uncertainty. A service/model failure separately says analysis was not performed. | Amber/neutral **We couldn't assess this reliably** or **Analysis not performed**; never substitute a suspicious verdict |

The Style A red card is a presentation of `suspicious`, not a fourth API class or permission to invent confidence. Current provisional responses cannot show a completed low-finding card; the production branch remains disabled. ham/spam/smishing are training labels, not these UI states. Preserve that distinction.

Observe requests to reveal passwords/codes, immediate payment pressure and secrecy. Rules distinguish **Send me your code** from **Never share your code**. Advertising, grammar, HTTPS, a common top-level domain, a short link or a named institution alone do not establish fraud. A message without a link can still contain a concerning request.

## Scope

Required: pasted text, a genuinely trained classifier, uncertainty-aware policy, supported reasons, safer next steps, preview and manual copy of a neutral help summary, English UI, tests, reproducible setup, documentation and submission materials.

Optional after the core: PNG/JPEG screenshot → browser OCR → user-edited text → explicit submission. No camera access is needed.

Excluded: accounts, history, database, inbox integrations, extension, separate phone app, attachment/PDF analysis, crawling, automatic blocking, automatic reporting, a new large language model, a second URL model, voice assistant and paid remote inference.

## Schedule and gates

The source plan allocates work budgets rather than guaranteeing agent speed. Resume from the current trained integration rather than rebuilding Goal 00. Original data acquisition, owner-approved review/quarantine and corrected frozen split now exist. Preserve original data, candidate assignments and provisional evaluation history. Inspect DATA_PREPARATION and STATUS before continuing. If work starts late, cut OCR and additional-language experiments first. Preserve reproducible checkpoints.

Saturday 10 October: resolve scope, reuse permission and host availability; Goal 01 data audit/split (45–75 minutes); Goal 02 baseline and limited encoder comparison (60–90 minutes); Goal 03 real inference integration and guidance, aiming for a local full flow around 23:30. A previously prepared foundation is not evidence of a trained detector. Save the state before stopping.

| Sunday 11 October | Work |
|---|---|
| 09:00–10:30 | Goal 04: English Style A UI, accessibility and copy |
| 10:30–12:00 | Goal 05: deployment or a verified clean local container fallback |
| 12:00–13:00 | Goal 06 only if the text core passes; otherwise repair core issues |
| 13:00–14:30 | Goal 07: model/privacy/UX audit and any available human observations |
| 14:30–15:00 | Critical repairs; freeze features, model and policy |
| 15:00–17:00 | Goal 08: README, model card, licenses, submission draft and 2–3 minute video |
| 17:00–19:00 | Upload, check anonymous access and playback, submit by 19:00 |
| 19:00–20:59 | Submission-error buffer; no new features |
| 21:00–22:00 | Live judging readiness according to event instructions |

Rules list 11 October at 11:59 PDT, which is 20:59 Prague. The header lists 12:00 PDT/21:00. Use the earlier limit. The internal target is 19:00. Confirm current notices and reuse permission; no permission has been received in this package.

## Data and honest model development

Primary candidate: Mishra/Soni, Mendeley DOI 10.17632/f45bkkt8pr.1. The source description reports 5,971 messages: 4,844 ham, 489 spam and 638 smishing, with LABEL, TEXT, URL, EMAIL and PHONE fields and CC BY 4.0. The real imported file now matches these published counts; DATA_SOURCES records actual hashes/audit and label-meaning limitations. Human approval remains incomplete. Provisional original-label training was separately authorized; it does not approve the dataset.

1. Import raw CSV as data. Record URL, author, date, revision, checksum, license and actual counts in docs/DATA_SOURCES.md.
2. Audit missing values, conflicts, languages and at least 15 sampled records per class. Quarantine unclear labels. Keep inappropriate raw content out of the public demo.
3. Group duplicates, near-duplicates, translations and recognizable templates. Preserve useful message characters in the model input. Report limitations of campaign/time separation.
4. Split groups approximately 70/15/15 into train/validation/test with fixed seed, reasonable class balance and frozen manifests. Group/ID/hash intersections must be empty.
5. Train a majority baseline and word/character TF-IDF plus logistic regression in a scikit-learn Pipeline. Fit all learned transforms only on train.
6. If permitted and feasible, compare frozen `paraphrase-multilingual-MiniLM-L12-v2` embeddings plus our logistic-regression head. Benchmark a small batch first. Pin revision, tokenizer and hashes; no full-transformer training or broad search.
7. Choose the candidate and policy thresholds from validation, latency and errors. Use a small declared candidate set and identical splits. Scores are internal measurements, not user-facing fraud probabilities.
8. Open the held-out test after selection. Report actual precision/recall/F1, confusion matrices, false positives/negatives, abstention and coverage. Separate model from policy results and record hardware/latency. If test data informs tuning, relabel it development and obtain a new independent test where possible.

English interface support is not evidence of English model performance. Optional Czech input support similarly needs separate evaluation. The original scope suggested about 30 Czech development examples and 60 independently reviewed challenge examples (20 per class). Preserve this only as a future language experiment, with English instructions and reports. Label synthetic/translated origins, group families together and keep the blind set hidden from development. Never imply representative real-world performance from a synthetic set.

## Architecture and contract

```text
English React / TypeScript / Vite UI
  -> POST /api/analyze {text, message_language}
  -> FastAPI / Pydantic validation
  -> local syntactic parsing + genuine classifier + versioned policy
  -> fixed English wording, supported evidence keys and neutral help summary

One container serves frontend and API. No database, external LLM or inbox access.
```

The canonical contract is backend/contracts.py. It includes status, analysis_complete, headline_key, evidence, action_keys, limitations, message_language, model_version, policy_version, contract_version and share_summary_keys. Current hard limits are 2,000 Unicode code points and a 32 KiB JSON body. Check real tokenizer coverage before inference. Never silently discard the end of a message and show a reassuring result. Chunking requires a separately tested extension. No detected URL becomes clickable.

## Accessibility, privacy and operation

Apply BRAND_BIBLE and UI_COPY: 20px body, controls at least 48px high, measured contrast, keyboard flow, focus, readable status, 360px mobile, 320 CSS px reflow and 200% zoom. No age-specific modes, patronizing wording, blame or countdowns.

No HTTP/DNS/WHOIS/reputation requests for message links. Disable tldextract network PSL refresh; never render HTML or remote message images. Assets may require Internet at explicit setup/build, not during analysis. Use no-store, redacted fixed errors, bounded requests/concurrency and no frontend secrets. Verify HTTPS and all proxy/hosting logging before public release.

Sharing uses neutral fixed templates rather than attempted free-text anonymization. Web Share requires a user gesture and supported secure context; copying is an equal fallback. Do not send to contacts automatically.

## Hosting and ownership

Deliver a genuinely tested local setup/container even if no public host is available. Use an existing authorized server/account behind HTTPS for the public app. Acquire and verify model assets at setup/build; no restart training. CPU-only operation is the target. Current Hugging Face documentation requires a paid plan to create Docker/Gradio compute Spaces, even when CPU Basic has no hourly fee. Do not promise universally free hosting or buy a plan. Confirm the destination before publishing.

Codex implements, tests, trains, measures and documents within the active goal. The owner reviews labels, tries the app, confirms public destinations, records/uploads video and submits Devpost. A script or draft is not a completed submission. After each phase show what works, missing work, actual evidence, how to try it and the next allowed goal.

## Fallbacks

| Problem | Response |
|---|---|
| Dataset unavailable | Record the failure; provide a local raw-file import. Substitute only a verified source with compatible labels/license |
| Encoder unavailable or too slow | Keep the trained TF-IDF baseline, disclose limits and abstain for unevaluated languages |
| False reassurance | Inspect leakage/integration, revise policy using validation, disclose failures and rerun affected checks |
| OCR unreliable | Disable the feature flag; retain working text input |
| UI time limited | Keep a clear form, result and next step; omit extra decoration |
| Hosting unavailable | Verify local instructions/container and show the real local app in the demo |
| Reuse disallowed | Remove the disallowed resource and document the revised feasible approach |

## Submission and a 2:30 demo

0:00–0:20 problem; 0:20–1:05 genuine suspicious example, reasons, steps and user-initiated neutral help summary; 1:05–1:30 ordinary/advertising example; 1:30–1:45 honest uncertainty or failure; 1:45–2:15 inference/training code and real metrics; 2:15–2:30 audience, automation, limitations and availability.

All examples are visibly fictional. Do not use live malicious links or sensitive data. If the model remains unavailable, demonstrate only the foundation and disclose that limitation. Submission materials include the repository, 2–3 minute video, accurate AI/automation description, live app or working local instructions, sources/licenses and Codex disclosure. Never invent user counts, time saved or prevented losses.
