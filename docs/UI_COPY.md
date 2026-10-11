# ClearMessage English UI copy

Version 1.2.0 · 11 October 2026. Approved Style A wording is integrated with the
real provisional model. The exact current strings below match
`frontend/src/copy.ts`; update both together. All current results are incomplete.
English interface language does not establish evaluated model support.

## Header and input

| Key | Exact current copy |
|---|---|
| titleLines.0 | Understand messages. |
| titleLines.1 | Make safer decisions. |
| prototypeLabel | EVOHACKS 2026 prototype |
| illustrationCaption | Make sense of it, together. |
| intro | Not sure whether a message is trustworthy? Paste it here, and we'll help you identify warning signs and understand what to do next. |
| stage | Development version · Our model has an incomplete audit. Performance is unverified for individual languages; checks remain limited. |
| textLabel | Message text |
| placeholder | Paste the message here… |
| privacy | Do not paste passwords or verification codes. Text is sent to our backend and stays in memory during the request. The application does not store it, log it or use it for training. |
| limit | Maximum 2,000 characters. Longer text is never automatically shortened. |
| languageLabel | Message language |
| languageHint | This describes your message. It does not change the interface or confirm language support. |
| languages.auto | Not specified |
| languages.en | English |
| languages.cs | Czech |
| languages.other | Other language |
| submit | Check Message |
| pending | Checking… |
| footer | ClearMessage does not verify senders or links. It never confirms that a message is safe. |

## Results and evidence

| Key | Exact current copy |
|---|---|
| incomplete | Limited check · analysis is incomplete |
| complete | Analysis completed · safety not established |
| statusLabels.suspicious | Suspicious message |
| statusLabels.review | We couldn't assess this reliably |
| statusLabels.no_strong_signals | No strong warning signs found |
| notPerformed | Analysis not performed |
| headlines.model_not_ready | The model is not ready yet. |
| headlines.review_required | This message needs further verification. |
| headlines.suspicious_signals | There are warning signals in this message. |
| headlines.no_strong_signals | We found no strong warning signals. |
| resultDetail | This output does not verify the sender or the claims and does not establish message safety. Check the claims through a familiar independent channel. |
| reasons | What the result is based on |
| noEvidence | We have no specific textual evidence of fraud. A low or uncertain finding does not establish safety. |
| evidence.request_for_secret | Observed textual signal: a request to disclose a password or verification code. |
| evidence.payment_pressure | Observed textual signal: a request for an immediate payment or transfer. |
| evidence.secrecy_request | Observed textual signal: a request to conceal something from family or another trusted person. |
| evidence.model_signal | The experimental model found a concerning message pattern. This does not prove fraud or explain particular words. |
| steps | What you can do |
| actions.verify_independently | Verify the claim through a familiar channel. Use a contact you already know instead of a contact or link from the message. |
| actions.do_not_send_secrets | Do not share passwords or verification codes. |
| actions.pause_payment | Pause the payment or transfer until you verify the request through a familiar independent channel. |
| actions.ask_trusted_person | If you are unsure, ask someone you trust for help. |
| limitationsLabel | Limits of this version |
| limitations.model_not_ready | The model is not ready; the model part of analysis was not performed. |
| limitations.human_review_incomplete | Training-label review is incomplete; the model uses original labels. |
| limitations.rules_only | Only a limited check of known textual rules was available. |
| limitations.insufficient_text | The text is too short for model assessment. |
| limitations.language_unspecified | Message language is not specified. Interface language does not determine it. |
| limitations.policy_not_validated | Thresholds for a completed low finding are unvalidated; this version cannot issue one. |
| limitations.language_not_evaluated | Performance has not been evaluated in Czech, English or any other language. |
| limitations.not_a_safety_confirmation | This output does not establish message safety. |
| limitations.inference_unavailable | The model could not complete analysis. |
| limitations.incomplete_coverage | The full text was not assessed. |

## Help and recovery

| Key | Exact current copy |
|---|---|
| help | Ask someone for help |
| helpPreview | Help request preview |
| helpNotice | The draft contains only fixed neutral sentences, without your source message or personal details. You can copy it manually. You choose the recipient and whether to send. |
| share | Share help request |
| shareUnavailable | Sharing could not be opened. You can copy the draft manually; nothing was sent automatically. |
| clicked | I already clicked or shared something |
| clickedAdvice.0 | Stop further steps. Close the page; do not enter more information or download anything. Clicking alone does not tell us what happened. |
| clickedAdvice.1 | If you entered a password, change it through a familiar app or address. If you sent money or banking details, contact your bank through a familiar channel. Do not enter any of those details here. |
| clickedAdvice.2 | If you downloaded or installed something, ask a trusted person to help update and check your device. This application does not inspect devices. |

## Validation and service errors

| Key | Exact current copy |
|---|---|
| errors.empty | Please paste a message first. Analysis was not performed. |
| errors.too_long | The text exceeds 2,000 characters. Analysis was not performed. Paste one shorter message. |
| errors.invalid_input | The input could not be accepted. Analysis was not performed. Check the length and paste the text again. |
| errors.unavailable | The service did not respond correctly. Analysis was not performed. Try later or verify the message through another channel. |

## Fixed help payload

Only `analysis_not_completed` and `help_verify_independently` are accepted.
`frontend/src/help.ts` joins these neutral sentences; it accepts no source text:

> The automated check was limited and does not establish message safety.

> I received a message I need to verify. Could you please help me check its claims through a familiar independent channel? I do not want to use the contact or link from the message.

Preview precedes a separate native-share gesture; manual copying uses the
selectable preview. The application does not access the clipboard, select a
recipient or send automatically. Cancellation is not an analysis failure.

## Presentation and future scope

Concrete observed-signal templates require actual matching evidence. The general
experimental-model template never explains particular words or verifies identity.
At most three reasons and three actions; visible limitations are not collapsed.
`no_strong_signals` wording is reserved and unreachable for the current artifact.
No red stronger-warning presentation has a validated policy; it remains disabled.
Review has a neutral white card with an amber accent; supported suspicious results
use the amber surface. The status label and analysis-completion label are separate.
Missing/failed model with no observed warning displays **Analysis not performed**.
Observed warnings may still display **Suspicious message** during model failure,
with the incomplete/rules-only limitation visible. The green presentation is
reserved for a valid completed low-finding response and is unreachable in the
current production policy.

Dedicated copy feedback, additional UX work and optional OCR remain future goals,
not implemented by this migration. Fictional demos must use `.invalid` domains;
no source dataset row is public product copy. Recovery advice collects no secrets
and does not claim that a device or account was checked.

## Metadata and accessibility

Title: **ClearMessage — Message guidance**. Description:
**Understand short messages and choose a safer next step. Experimental model with
incomplete review and unverified language performance.** HTML uses `lang="en"`.
All labels, errors and live announcements are English. Decorative mark/hero images
have empty alt text and are hidden from assistive technology. The submit arrow is
hidden; no UI locale switcher or untranslated fallback exists.
