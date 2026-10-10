import type { AnalyzeResponse, ClientErrorKey } from './api';

type Copy = {
  titleLines: readonly [string, string]; prototypeLabel: string; intro: string; stage: string; illustrationCaption: string; languageHint: string;
  textLabel: string; placeholder: string; privacy: string; limit: string;
  languageLabel: string; languages: Record<'auto' | 'cs' | 'en' | 'other', string>;
  submit: string; pending: string;
  resultDetail: string;
  headlines: Record<AnalyzeResponse['headline_key'], string>;
  evidence: Record<AnalyzeResponse['evidence'][number]['key'], string>;
  reasons: string; noEvidence: string; incomplete: string; complete: string;
  help: string; helpPreview: string; helpNotice: string; share: string; shareUnavailable: string;
  clicked: string; clickedAdvice: string[]; steps: string; limitationsLabel: string; footer: string;
  errors: Record<ClientErrorKey, string>;
  actions: Record<AnalyzeResponse['action_keys'][number], string>;
  limitations: Record<AnalyzeResponse['limitations'][number], string>;
};

export const copy: Copy = {
  titleLines: ['Understand messages.', 'Make safer decisions.'],
  prototypeLabel: 'EVOHACKS 2026 prototype',
  illustrationCaption: 'Make sense of it, together.',
  languageHint: 'This describes your message. It does not change the interface or confirm language support.',
  intro: "Not sure whether a message is trustworthy? Paste it here, and we'll help you identify warning signs and understand what to do next.",
  stage: 'Development version · Our model has an incomplete audit. Performance is unverified for individual languages; checks remain limited.',
  textLabel: 'Message text', placeholder: 'Paste the message here…',
  privacy: 'Do not paste passwords or verification codes. Text is sent to our backend and stays in memory during the request. The application does not store it, log it or use it for training.',
  limit: 'Maximum 2,000 characters. Longer text is never automatically shortened.',
  languageLabel: 'Message language',
  languages: { auto: 'Not specified', en: 'English', cs: 'Czech', other: 'Other language' },
  submit: 'Check Message', pending: 'Checking…',
  resultDetail: 'This output does not verify the sender or the claims and does not establish message safety. Check the claims through a familiar independent channel.',
  headlines: { model_not_ready: 'The model is not ready yet.', review_required: 'This message needs further verification.', suspicious_signals: 'There are warning signals in this message.', no_strong_signals: 'We found no strong warning signals.' },
  evidence: {
    request_for_secret: 'Observed textual signal: a request to disclose a password or verification code.',
    payment_pressure: 'Observed textual signal: a request for an immediate payment or transfer.',
    secrecy_request: 'Observed textual signal: a request to conceal something from family or another trusted person.',
    model_signal: 'The experimental model found a concerning message pattern. This does not prove fraud or explain particular words.',
  },
  reasons: 'What the result is based on', noEvidence: 'We have no specific textual evidence of fraud. A low or uncertain finding does not establish safety.',
  incomplete: 'Limited check · analysis is incomplete', complete: 'Analysis completed · safety not established',
  help: 'Ask someone for help', helpPreview: 'Help request preview',
  helpNotice: 'The draft contains only fixed neutral sentences, without your source message or personal details. You can copy it manually. You choose the recipient and whether to send.',
  share: 'Share help request', shareUnavailable: 'Sharing could not be opened. You can copy the draft manually; nothing was sent automatically.',
  clicked: 'I already clicked or shared something', clickedAdvice: [
    'Stop further steps. Close the page; do not enter more information or download anything. Clicking alone does not tell us what happened.',
    'If you entered a password, change it through a familiar app or address. If you sent money or banking details, contact your bank through a familiar channel. Do not enter any of those details here.',
    'If you downloaded or installed something, ask a trusted person to help update and check your device. This application does not inspect devices.',
  ],
  steps: 'What you can do', limitationsLabel: 'Limits of this version',
  footer: 'ClearMessage does not verify senders or links. It never confirms that a message is safe.',
  errors: {
    empty: 'Please paste a message first. Analysis was not performed.',
    too_long: 'The text exceeds 2,000 characters. Analysis was not performed. Paste one shorter message.',
    invalid_input: 'The input could not be accepted. Analysis was not performed. Check the length and paste the text again.',
    unavailable: 'The service did not respond correctly. Analysis was not performed. Try later or verify the message through another channel.',
  },
  actions: {
    verify_independently: 'Verify the claim through a familiar channel. Use a contact you already know instead of a contact or link from the message.',
    do_not_send_secrets: 'Do not share passwords or verification codes.',
    pause_payment: 'Pause the payment or transfer until you verify the request through a familiar independent channel.',
    ask_trusted_person: 'If you are unsure, ask someone you trust for help.',
  },
  limitations: {
    model_not_ready: 'The model is not ready; the model part of analysis was not performed.',
    human_review_incomplete: 'Training-label review is incomplete; the model uses original labels.',
    rules_only: 'Only a limited check of known textual rules was available.',
    insufficient_text: 'The text is too short for model assessment.',
    language_unspecified: 'Message language is not specified. Interface language does not determine it.',
    policy_not_validated: 'Thresholds for a completed low finding are unvalidated; this version cannot issue one.',
    language_not_evaluated: 'Performance has not been evaluated in Czech, English or any other language.',
    not_a_safety_confirmation: 'This output does not establish message safety.',
    inference_unavailable: 'The model could not complete analysis.',
    incomplete_coverage: 'The full text was not assessed.',
  },
};
