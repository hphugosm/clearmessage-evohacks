# Analysis policy 2 / observed requests 2

Goal03 connects the project-trained Goal02 word/character TF-IDF + balanced
LogisticRegression (C=2) selected on validation. `backend/model-config.json`
independently pins its SHA-256 and the selection-report hash. It accepts no
remote model identifier, arbitrary expected hash, pickle, runtime download or
alternative demo classifier. Read `MODEL_CARD.md` for data/license limits.
Startup verifies the bounded selection-report JSON hash, selected artifact
path/hash, warning-threshold agreement and recorded validation selection
(`test_used=false`). Failure disables inference instead of silently using a
different threshold or model. Threshold **0.60** is unchanged; no new training,
validation search or held-out selection was performed for policy 2.

## Decision order

1. Reject invalid/empty/overlong inputs before inference (2,000 code points,
   32 KiB body). Never truncate. Fewer than three alphabetic tokens cannot get
   a model assessment; explicit textual requests may still warn.
2. Parse URLs as syntax, mask their spans for request-rule matching. No network,
   URL expansion or reputation assertions. Cold PSL uses the bundled snapshot
   with fetching and disk caching disabled.
3. Find at most one actual match per rule key. Internal original offsets prove
   the request's occurrence; neither text snippets nor offsets enter sharing.
   CZ/EN patterns recognize disclosure of passwords/OTP, immediate payment
   pressure and concealment from trusted people. Case/diacritics normalization
   is deterministic; it learns nothing from inference inputs.
4. Run the real model once through a bounded offline interface. Validate finite
   normalized three-class scores and full-text coverage. Errors/overload become
   limited rules-only checks, with no raw exceptions or invented scores.
5. Observed rule matches warn even against a high ham score. For explicitly EN
   input only, complete model processing and smishing score >= **0.60** may add
   a **provisional classifier warning**. This threshold came from Goal02
   validation, not a new held-out search. It is similarity, not a fraud
   probability or causal explanation. Unknown/CZ/other language model scores do
   not issue model warnings. A user's language hint is not verified language.
6. Spam alone, uncertain classifier scores or any missing guard yield review.
   The real model cannot issue `no_strong_signals` or `analysis_complete=true`:
   audit incomplete, no verified language benchmark, low-finding policy disabled.
   A reserved future branch has conservative ham/other-class guards, explicitly
   **unvalidated and disabled in production**; test-only reviewed models exercise
   its safety invariants. Enabling it requires a separately validated policy.

`analysis-policy-2` and `observed-requests-2` are versioned in source and the
integration report. Scores, raw class outputs and evidence text never enter API
responses or help drafts. API/UI permit at most three reasons and three steps.
General text is used when no observed rule matched; it never fabricates an ML
attribution. Negative findings never establish safety.

## Negation and scope

Examples such as “Never send your password”, “Do not pay now”, “We will never
ask…” and common educational warnings do not trigger direct-request rules.
Separate sentences and contrast clauses (“but” / “ale”) permit a later actual
request to warn. “Do not tell anyone your password” is anti-disclosure advice,
not transaction concealment. Transfer of school notes is not money transfer.
Policy 2 also recognizes explicit login/security/authentication/two-factor code
requests. “No one should ask you to share your verification code” and “Do not
tell anyone about your password” are routine protective advice. An educational
phrase appended after a direct request does not erase that request's evidence.
These are finite observed-rule corrections, not new model predictions or a
general quotation/negation parser.

This is a small finite pattern set, not general language understanding. Complex
negation, quotations, hypotheticals, paraphrases, mixed languages and evasion can
cause misses or false positives. A legitimate immediate payment request can
match the **observed pressure wording**, which does not prove fraud. HTTPS,
TLD, typos, short URLs, ads and keyword mentions are not themselves rule evidence.
No synthetic test accuracy is presented as real-world validation.

## Guidance and help

Fixed English steps advise independent verification using a contact/address already
known to the user, not contact details from the message. The priority action is
not disclosing secrets or pausing payment, then asking someone trusted. If both
payment and disclosure requests match, secret protection is the displayed priority
beside independent verification and trusted help (the three-step cap).

Help drafts contain only allowlisted neutral sentences. Preview first, second
user gesture for the native share picker; manual copying available without a
clipboard API. No automatic recipient, reporting, bank contact or intervention.
“I already clicked” gives three manually checkable steps; it collects no extra
secrets and does not claim to inspect/clean the device. Advice was cross-checked
with [FTC phishing guidance](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams)
and [FTC steps after a scam](https://consumer.ftc.gov/articles/what-do-if-you-were-scammed).
Offline PSL configuration follows [tldextract's official documentation](https://github.com/john-kurkowski/tldextract).

## Presentation

Style A uses **Suspicious message** on amber for supported evidence; **We couldn't
assess this reliably** on a neutral card with an amber accent for review. Model
failure without observed evidence says **Analysis not performed**. Completion
is shown separately. Reserved green low findings require the unchanged full
completion guards and remain unreachable with this provisional artifact. Red
**Potential scam** has no validated stronger-warning policy and stays disabled.
The client mirrors evidence, scope and completion invariants before rendering;
its expanded states were checked after the backend contract/integration suite.

## Verification boundaries

`tests/test_analysis.py` uses real saved model integration plus explicitly
**test-only** models for thresholds, failures, overflow and future guards.
No-egress patches DNS/socket/requests, forces cold PSL and verifies zero attempts.
Canaries verify response/stdout/stderr/log/share boundaries. Browser tests use
actual API with the model; only native share/failure simulation is mocked in tests.
The machine-readable `ml/reports/goal03-integration.json` contains no input text;
its five project-written cases are synthetic development smoke checks, not
held-out, blind or language benchmarks. No dataset/challenge was reopened and
no training/selection/threshold tuning happened in Goal03.
