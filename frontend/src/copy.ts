import type { AnalyzeResponse, ClientErrorKey } from './api';
import type { OcrErrorKey } from './ocr';

export type Situation = 'none' | 'opened' | 'password' | 'payment' | 'code';

type Copy = {
  behindAI: { title: string; intro: string; pipelineTitle: string; pipeline: string[]; pipelineNotice: string;
    modelTitle: string; modelDescription: string; classes: Record<'ham'|'spam'|'smishing',string>; training: string; comparison: string;
    datasetTitle: string; datasetMessages: string; datasetLimit: string; datasetCredit: string; datasetLicense: string;
    metricsTitle: string; metricsMeaning: string; macroF1: string; smishingRecall: string; correctOf: string; smishingExamples: string; missed: string;
    disclosure: string; languageLimit: string; detailedMetrics: string; testCount: string; metricFormat: string; classMetrics: string; metricColumns: string[];
    confusionExplanation: string; confusionTitle: string; sourceClass: string; limitsTitle: string; limits: string; releaseLimit: string;
    privacyTitle: string; privacy: string[]; technologyTitle: string; technology: string; credits: string; back: string };

  evidenceTitles: Record<AnalyzeResponse['evidence'][number]['key'], string>;
  evidenceIntro: string; observedEvidenceLimit: string; modelEvidenceLimit: string;
  guide: { title: string; notice: string; choose: string; next: string; ephemeral: string;
    situations: Record<Situation, string>; checklists: Record<Situation, string[]> };
  hero: string; home: string; behind: string; inputMethod: string; paste: string; screenshot: string;
  scan: { title: string; drop: string; formats: string; choose: string; replace: string; privacy: string;
    initializing: string; reading: string; ready: string; cancel: string; fallback: string;
    review: string; instruction: string; confirm: string; confirmationError: string;
    errors: Record<OcrErrorKey, string> };

  titleLines: readonly [string, string]; prototypeLabel: string; intro: string; stage: string; illustrationCaption: string; languageHint: string;
  textLabel: string; placeholder: string; privacy: string; limit: string;
  languageLabel: string; languages: Record<'auto' | 'cs' | 'en' | 'other', string>;
  submit: string; pending: string;
  resultDetail: string;
  headlines: Record<AnalyzeResponse['headline_key'], string>;
  statusLabels: Record<AnalyzeResponse['status'], string>; notPerformed: string;
  evidence: Record<AnalyzeResponse['evidence'][number]['key'], string>;
  reasons: string; noEvidence: string; incomplete: string; complete: string;
  help: string; helpPreview: string; helpNotice: string; share: string; shareUnavailable: string;
  copyHelp: string; copying: string; copied: string; copyUnavailable: string;
  sharing: string; shareCancelled: string;
  helpTemplates: Record<AnalyzeResponse['share_summary_keys'][number], string>;
  clicked: string; clickedAdvice: string[]; steps: string; limitationsLabel: string; footer: string;
  errors: Record<ClientErrorKey, string>;
  actions: Record<AnalyzeResponse['action_keys'][number], string>;
  limitations: Record<AnalyzeResponse['limitations'][number], string>;
};

export const copy: Copy = {
  behindAI: {
    title: 'How ClearMessage works', intro: 'ClearMessage combines a machine-learning classifier with transparent detection rules to help identify warning signs in messages.',
    pipelineTitle: 'From message to guidance', pipeline: ['Message', 'Text processing', 'ML classification', 'Detection rules', 'Safety guidance'],
    pipelineNotice: 'A separate safety policy combines model coverage, observed requests and service limitations. It keeps uncertain or unsuccessful checks incomplete.',
    modelTitle: 'A classifier we trained', modelDescription: 'The team trained a TF-IDF + logistic regression classifier. TF-IDF describes word and character patterns; logistic regression learns to distinguish three dataset labels. Those labels are not safety verdicts.',
    classes: { ham: 'Ordinary messages.', spam: 'Unsolicited promotional or unwanted messages.', smishing: 'Messages associated with SMS phishing attempts.' },
    training: 'Duplicates and related templates were grouped before the frozen training, validation and test split. Text preprocessing was fitted only on training data. Validation selected the model and warning threshold; the test set was not used to fit or tune them.',
    comparison: 'We also compared a frozen pretrained multilingual MiniLM encoder with our own logistic regression heads. The TF-IDF model was selected. We did not pretrain that encoder or train a large language model.',
    datasetTitle: 'The approved dataset', datasetMessages: 'eligible messages after the approved review and quarantine.',
    datasetLimit: 'The source originally contained 5,971 messages. The owner approved reversible quarantine of 98 conflicting records and two training-label corrections. A 45-row human audit does not independently validate every annotation; source languages and campaign history remain unverified.',
    datasetCredit: 'Mishra & Soni · Mendeley dataset, version 1', datasetLicense: ' · DOI 10.17632/f45bkkt8pr.1 · CC BY 4.0. Our review and changes are recorded separately.',
    metricsTitle: 'Measured results, with limits', metricsMeaning: 'These numbers measure agreement with dataset annotations, rather than proven fraud outcomes. Macro-F1 balances performance across all three labels. Recall describes how many annotated SMISHING examples the classifier found.',
    macroF1: 'Test macro-F1', smishingRecall: 'SMISHING recall', correctOf: 'of', smishingExamples: 'SMISHING annotations matched;', missed: 'were missed.',
    disclosure: 'These metrics were measured on a previously evaluated test set and are not an independent blind validation.',
    languageLimit: 'Independently verified language-specific benchmarks are unavailable for English and Czech. The English interface and English OCR do not establish the classifier’s performance in English.',
    detailedMetrics: 'View class results and confusion matrix', testCount: 'Previously evaluated test messages:', metricFormat: 'Scores are rounded to three decimals. FP means false positives; FN means false negatives, relative to source annotations.',
    classMetrics: 'Classifier results by dataset label', metricColumns: ['Label','Precision','Recall','F1','Count','FP','FN'],
    confusionExplanation: 'Rows are source annotations; columns are classifier predictions. These are classifier results, separate from the application’s incomplete-assessment policy.', confusionTitle: 'Confusion matrix', sourceClass: 'Source label',
    limitsTitle: 'What a check cannot tell you',
    limits: 'ClearMessage cannot verify a sender, inspect a website or device, or guarantee that a message is fraudulent. A lack of warnings does not establish safety. Narrow rules can miss subtle requests and misread context. Current language performance and the completed low-finding policy are unvalidated, so every assessment remains incomplete.',
    releaseLimit: 'This is a research prototype verified locally. It is not a validated public fraud detector and does not automatically protect your inbox. Docker execution, public hosting, HTTPS and hosting-log privacy have not been verified.',
    privacyTitle: 'Where your information goes',
    privacy: ['Screenshot recognition uses bundled English Tesseract resources in your browser. The image is not uploaded. You can edit the extracted text and must confirm it before choosing Check message.', 'Pasted or confirmed text is sent to our FastAPI backend and processed in memory. The application has no message history or database, records no message bodies in its logs, and does not use your messages for training. Public proxy and hosting logs would need separate verification before deployment.', 'The service does not visit suspicious links, call third-party analysis services, send messages or contact a bank. Help summaries contain fixed neutral wording; copying or native sharing requires your preview and a separate action.'],
    technologyTitle: 'Built with focused tools', technology: 'React, TypeScript and Vite provide the interface. FastAPI and Pydantic validate requests. The selected classifier was trained with scikit-learn and runs from a hash-verified project JSON artifact. Browser screenshot text recognition uses Tesseract.js 6.0.1 with its pretrained English OCR data.',
    credits: 'We acknowledge the external dataset, comparison encoder, Inter font and third-party libraries. Codex assisted implementation and testing. OCR source and licenses:', back: 'Back to checking a message',
  },
  evidenceTitles: { request_for_secret: 'A request for a password or code', payment_pressure: 'Pressure to pay quickly', secrecy_request: 'A request to keep things secret', model_signal: 'An experimental model pattern' },
  evidenceIntro: 'Expand a finding to see its basis. Text highlights come only from observed rules.',
  observedEvidenceLimit: 'This is an observed textual signal, not proof of fraud or an explanation of the model’s prediction.',
  modelEvidenceLimit: 'This finding comes from the experimental classifier. It cannot identify which words caused the prediction.',
  guide: {
    title: 'What have you already done?', choose: 'Choose the situation that fits', next: 'Here’s what you can do now.',
    notice: 'These steps are general advice, even when the analysis is uncertain or unavailable. ClearMessage does not inspect your device, secure accounts or contact anyone. Do not enter any of those details here.',
    ephemeral: 'Your choices and checklist stay in memory in this page. They are not sent or saved. Marking a step does not establish safety.',
    situations: { none: 'I haven’t interacted with the message.', opened: 'I opened the link.', password: 'I entered my password.', payment: 'I shared payment information.', code: 'I shared a verification code.' },
    checklists: {
      none: ['Pause before replying, opening links or making a payment.', 'Verify the request using a familiar app or a contact you already know. Do not use the message’s links or contact details.', 'Ask someone you trust if you are unsure.'],
      opened: ['Close the page. Do not enter information, download files or install anything it suggests. Clicking alone does not tell us what happened.', 'If you also shared information, choose the matching situation above.', 'If you downloaded or installed something, update your device’s security software and run a scan. Ask someone you trust for help.', 'Verify the request through a familiar independent channel.'],
      password: ['Open the official service through a familiar app or address, without using the message.', 'Change the affected password. Change it on other accounts where you reused it.', 'Turn on two-factor authentication if the service offers it.', 'Review account activity and contact official support if you cannot access the account or see unfamiliar changes.'],
      payment: ['Contact your bank or payment provider promptly through its official app or the number on your card.', 'Explain that your payment information may have been exposed and ask about securing the account or disputing a payment. Recovery is not guaranteed.', 'Review recent transactions with the provider and follow its instructions. Do not share more information with the message’s sender.'],
      code: ['Stop sharing codes and close the page. A code may allow account access or authorize a payment.', 'Contact the affected service through a familiar official channel. If a bank or payment was involved, contact the bank promptly.', 'Secure the affected account through its official app or address: change the password and review active sessions if available.', 'Check recent account activity with official support. Do not approve unexpected login or payment requests.'],
    },
  },
  hero: 'Not sure about a message?', home: 'Home', behind: 'Behind the AI',
  inputMethod: 'Input method', paste: 'Paste a message', screenshot: 'Upload a screenshot',
  scan: {
    title: 'Read a screenshot', drop: 'Drop one screenshot here, or choose a file.',
    formats: 'PNG or JPEG · up to 10 MB and 12 megapixels · English text',
    choose: 'Choose screenshot', replace: 'Choose another screenshot',
    privacy: 'Your screenshot stays in this browser. Only the text you review and submit reaches our backend. Remove passwords and verification codes before checking.',
    initializing: 'Preparing local text recognition…', reading: 'Reading text in your browser…',
    ready: 'Text extracted. Review it below before checking.', cancel: 'Cancel text recognition',
    fallback: 'Paste a message instead', review: 'Review the extracted text',
    instruction: 'Make sure the text is correct before checking the message. OCR can miss or misread words.',
    confirm: 'I reviewed this text and removed sensitive details.',
    confirmationError: 'Review and confirm the extracted text first. Analysis was not performed.',
    errors: {
      empty: 'This file is empty. Choose a PNG or JPEG screenshot, or paste the message.',
      format: 'Choose one actual PNG or JPEG image. Other formats are not supported.',
      bytes: 'This image exceeds 10 MB. Choose a smaller screenshot, or paste the message.',
      pixels: 'This image exceeds the supported dimensions. Use up to 12 megapixels and 16,384 pixels per side.',
      corrupt: 'We could not read this image. Choose another PNG or JPEG, or paste the message.',
      initialization: 'Local text recognition could not start. Try another image, or paste the message.',
      processing: 'Text recognition did not complete. Try a clearer screenshot, or paste the message.',
      unreadable: 'No readable text was found. Try a clearer screenshot, or paste the message.',
      cancelled: 'Text recognition was cancelled. No analysis was performed.',
    },
  },
  titleLines: ['Understand messages.', 'Make safer decisions.'],
  prototypeLabel: 'EVOHACKS 2026 prototype',
  illustrationCaption: 'Make sense of it, together.',
  languageHint: 'This describes your message. It does not change the interface or confirm language support.',
  intro: "Paste a message or upload a screenshot. We'll help you understand the warning signs and what you can do next.",
  stage: 'Development version · Performance is unverified for individual languages; checks remain limited.',
  textLabel: 'Message text', placeholder: 'Paste the message here…',
  privacy: 'Do not paste passwords or verification codes. Text is sent to our backend and stays in memory during the request. The application does not store it, log it or use it for training.',
  limit: 'Maximum 2,000 characters. Longer text is never automatically shortened.',
  languageLabel: 'Message language',
  languages: { auto: 'Not specified', en: 'English', cs: 'Czech', other: 'Other language' },
  submit: 'Check message', pending: 'Checking…',
  resultDetail: 'This output does not verify the sender or the claims and does not establish message safety. Check the claims through a familiar independent channel.',
  headlines: { model_not_ready: 'The model is not ready yet.', review_required: 'This message needs further verification.', suspicious_signals: 'There are warning signals in this message.', no_strong_signals: 'We found no strong warning signals.' },
  statusLabels: { suspicious: 'Suspicious message', review: "We couldn't assess this reliably", no_strong_signals: 'No strong warning signs found' },
  notPerformed: 'Analysis not performed',
  evidence: {
    request_for_secret: 'Observed textual signal: a request to disclose a password or verification code.',
    payment_pressure: 'Observed textual signal: a request for an immediate payment or transfer.',
    secrecy_request: 'Observed textual signal: a request to conceal something from family or another trusted person.',
    model_signal: 'The experimental model found a concerning message pattern. This does not prove fraud or explain particular words.',
  },
  reasons: 'What caught our attention?', noEvidence: 'We have no specific textual evidence of fraud. A low or uncertain finding does not establish safety.',
  incomplete: 'Limited check · analysis is incomplete', complete: 'Analysis completed · safety not established',
  help: 'Ask someone for help', helpPreview: 'Help request preview',
  helpNotice: 'The draft contains only fixed neutral sentences, without your source message or personal details. You can copy it manually. You choose the recipient and whether to send.',
  share: 'Share help request', shareUnavailable: 'Sharing could not be opened. You can copy the draft manually; nothing was sent automatically.',
  copyHelp: 'Copy help request', copying: 'Copying…', copied: 'Copied',
  copyUnavailable: 'Copying did not complete. Select the preview text and copy it manually.',
  sharing: 'Opening sharing…', shareCancelled: 'Sharing cancelled. You can still copy the preview manually.',
  helpTemplates: {
    analysis_not_completed: 'The automated check was limited and does not establish message safety.',
    help_verify_independently: 'I received a message I need to verify. Could you please help me check its claims through a familiar independent channel? I do not want to use the contact or link from the message.',
  },
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
