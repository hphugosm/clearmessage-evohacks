# ClearMessage English UI copy

Version 5.0 · 11 October 2026. Generated from the shared English dictionary; 241 string entries. The continuation shortens the main flow, keeps one visible limitations paragraph, and shows verified rule highlights immediately. Recorded-demo wording is explicit. Model facts remain unchanged.

| Key | Exact current copy |
|---|---|
| experience.how | How it works |
| experience.welcome | Let's check it together. |
| experience.example | Try an example |
| experience.exampleLabel | Example message |
| experience.exampleText | Your delivery is waiting. Pay the invoice immediately to release your parcel. Visit https://example.invalid/delivery. |
| experience.back | Start again |
| experience.edit | Edit message |
| experience.recordedLabel | Recorded demo · no live analysis |
| experience.recordedNotice | Explore a real local model result. This demo cannot check your own messages. |
| experience.speechAbout | About reading aloud |
| experience.why | Why this result? |
| experience.next | What should I do? |
| experience.summary | Your next step |
| experience.safety | This check cannot confirm safety. It may miss warning signs. |
| experience.noFinding | No clear warning signs to explain. |
| experience.simpleReasons.request_for_secret | It asks for a password or verification code. |
| experience.simpleReasons.payment_pressure | It asks you to make a payment quickly. |
| experience.simpleReasons.secrecy_request | It asks you to keep something secret. |
| experience.simpleReasons.model_signal | Our model flagged a suspicious pattern. |
| experience.critical.model_not_ready | Model check unavailable. |
| experience.critical.inference_unavailable | The model could not finish. |
| experience.critical.rules_only | Only known requests were checked. |
| experience.critical.insufficient_text | Too little text for the model. |
| experience.critical.incomplete_coverage | The full text was not checked. |
| experience.critical.language_not_evaluated | Language accuracy is unverified. |
| experience.critical.language_unspecified | The message language was not specified. |
| experience.critical.human_review_incomplete | Training-label review is unfinished. |
| experience.critical.policy_not_validated | This version cannot complete a low-warning check. |
| experience.critical.not_a_safety_confirmation | This check cannot confirm safety. |
| experience.bubble.title | Your message |
| experience.bubble.hint | Select a highlight to see the rule that flagged it. |
| experience.speech.listen | Listen |
| experience.speech.stop | Stop reading |
| experience.speech.unsupported | Reading aloud is not available in this browser. |
| experience.speech.unavailable | Reading aloud could not start. You can read the guidance here. |
| experience.speech.notice | Only guidance is read, never your message. Device voices may use online services. |
| experience.privacy.hide | Hide personal details |
| experience.privacy.show | Show personal details |
| experience.privacy.title | Privacy controls |
| experience.privacy.notice | Masking can miss details. Select more text to hide. This changes the display only; processed text is not erased. |
| experience.privacy.instruction | Select any text in this box, then choose Hide selected text. You can use the keyboard or touch selection handles. |
| experience.privacy.select | Choose more text to hide |
| experience.privacy.selectionLabel | Select text to hide |
| experience.privacy.mask | Hide selected text |
| experience.privacy.noSelection | Select some text in the box first. |
| experience.privacy.applied | Selected text is hidden. |
| experience.privacy.distinction | Display masked. The check used the original text. |
| experience.patterns.label | Possible pattern |
| experience.patterns.caveat | This pattern does not verify the sender or prove fraud. |
| experience.patterns.delivery_payment.title | Delivery payment request |
| experience.patterns.delivery_payment.description | Some scams pretend to be delivery companies and ask for unexpected payments. |
| experience.patterns.account_secret.title | Account code request |
| experience.patterns.account_secret.description | Some scams ask for a password or code while pretending to help with an account. |
| experience.patterns.bank_payment.title | Bank payment request |
| experience.patterns.bank_payment.description | Some scams pretend to be a bank and pressure people to transfer money. |
| behindAI.title | How ClearMessage works |
| behindAI.intro | ClearMessage combines a machine-learning classifier with transparent detection rules to help identify warning signs in messages. |
| behindAI.pipelineTitle | From message to guidance |
| behindAI.pipeline.0 | Message |
| behindAI.pipeline.1 | Text processing |
| behindAI.pipeline.2 | ML classification |
| behindAI.pipeline.3 | Detection rules |
| behindAI.pipeline.4 | Safety guidance |
| behindAI.pipelineNotice | A separate safety policy combines model coverage, observed requests and service limitations. It keeps uncertain or unsuccessful checks incomplete. |
| behindAI.modelTitle | A classifier we trained |
| behindAI.modelDescription | The team trained a TF-IDF + logistic regression classifier. TF-IDF describes word and character patterns; logistic regression learns to distinguish three dataset labels. Those labels are not safety verdicts. |
| behindAI.classes.ham | Ordinary messages. |
| behindAI.classes.spam | Unsolicited promotional or unwanted messages. |
| behindAI.classes.smishing | Messages associated with SMS phishing attempts. |
| behindAI.training | Duplicates and related templates were grouped before the frozen training, validation and test split. Text preprocessing was fitted only on training data. Validation selected the model and warning threshold; the test set was not used to fit or tune them. |
| behindAI.comparison | We also compared a frozen pretrained multilingual MiniLM encoder with our own logistic regression heads. The TF-IDF model was selected. We did not pretrain that encoder or train a large language model. |
| behindAI.datasetTitle | The approved dataset |
| behindAI.datasetMessages | eligible messages after the approved review and quarantine. |
| behindAI.datasetLimit | The source originally contained 5,971 messages. The owner approved reversible quarantine of 98 conflicting records and two training-label corrections. A 45-row human audit does not independently validate every annotation; source languages and campaign history remain unverified. |
| behindAI.datasetCredit | Mishra & Soni · Mendeley dataset, version 1 |
| behindAI.datasetLicense |  · DOI 10.17632/f45bkkt8pr.1 · CC BY 4.0. Our review and changes are recorded separately. |
| behindAI.metricsTitle | Measured results, with limits |
| behindAI.metricsMeaning | These numbers measure agreement with dataset annotations, rather than proven fraud outcomes. Macro-F1 balances performance across all three labels. Recall describes how many annotated SMISHING examples the classifier found. |
| behindAI.macroF1 | Test macro-F1 |
| behindAI.smishingRecall | SMISHING recall |
| behindAI.correctOf | of |
| behindAI.smishingExamples | SMISHING annotations matched; |
| behindAI.missed | were missed. |
| behindAI.disclosure | These metrics were measured on a previously evaluated test set and are not an independent blind validation. |
| behindAI.languageLimit | Independently verified language-specific benchmarks are unavailable for English and Czech. The English interface and English OCR do not establish the classifier’s performance in English. |
| behindAI.detailedMetrics | View class results and confusion matrix |
| behindAI.testCount | Previously evaluated test messages: |
| behindAI.metricFormat | Scores are rounded to three decimals. FP means false positives; FN means false negatives, relative to source annotations. |
| behindAI.classMetrics | Classifier results by dataset label |
| behindAI.metricColumns.0 | Label |
| behindAI.metricColumns.1 | Precision |
| behindAI.metricColumns.2 | Recall |
| behindAI.metricColumns.3 | F1 |
| behindAI.metricColumns.4 | Count |
| behindAI.metricColumns.5 | FP |
| behindAI.metricColumns.6 | FN |
| behindAI.confusionExplanation | Rows are source annotations; columns are classifier predictions. These are classifier results, separate from the application’s incomplete-assessment policy. |
| behindAI.confusionTitle | Confusion matrix |
| behindAI.sourceClass | Source label |
| behindAI.limitsTitle | What a check cannot tell you |
| behindAI.limits | ClearMessage cannot verify a sender, inspect a website or device, or guarantee that a message is fraudulent. A lack of warnings does not establish safety. Narrow rules can miss subtle requests and misread context. Current language performance and the completed low-finding policy are unvalidated, so every assessment remains incomplete. |
| behindAI.releaseLimit | This is a research prototype verified locally. It is not a validated public fraud detector and does not automatically protect your inbox. Docker execution, public hosting, HTTPS and hosting-log privacy have not been verified. |
| behindAI.privacyTitle | Where your information goes |
| behindAI.privacy.0 | Screenshot recognition uses bundled English Tesseract resources in your browser. The image is not uploaded. You can edit the extracted text and must confirm it before choosing Check message. |
| behindAI.privacy.1 | Pasted or confirmed text is sent to our FastAPI backend and processed in memory. The application has no message history or database, records no message bodies in its logs, and does not use your messages for training. Public proxy and hosting logs would need separate verification before deployment. |
| behindAI.privacy.2 | The service does not visit suspicious links, call third-party analysis services, send messages or contact a bank. Help summaries contain fixed neutral wording; copying or native sharing requires your preview and a separate action. |
| behindAI.technologyTitle | Built with focused tools |
| behindAI.technology | React, TypeScript and Vite provide the interface. FastAPI and Pydantic validate requests. The selected classifier was trained with scikit-learn and runs from a hash-verified project JSON artifact. Browser screenshot text recognition uses Tesseract.js 6.0.1 with its pretrained English OCR data. |
| behindAI.credits | We acknowledge the external dataset, comparison encoder, Inter font and third-party libraries. Codex assisted implementation and testing. OCR source and licenses: |
| behindAI.back | Back to checking a message |
| evidenceTitles.request_for_secret | A request for a password or code |
| evidenceTitles.payment_pressure | Pressure to pay quickly |
| evidenceTitles.secrecy_request | A request to keep things secret |
| evidenceTitles.model_signal | An experimental model pattern |
| evidenceIntro | Expand a finding to see its basis. Text highlights come only from observed rules. |
| observedEvidenceLimit | Observed by a rule; it does not prove fraud. |
| modelEvidenceLimit | Flagged by our classifier. It cannot identify the words behind its prediction. |
| guide.title | What have you already done? |
| guide.choose | Choose the situation that fits |
| guide.next | Here’s what you can do now. |
| guide.notice | General advice. Use official contacts and never enter private details here. |
| guide.ephemeral | Your choices stay on this page and are not saved. Completing steps does not confirm safety. |
| guide.situations.none | I haven’t interacted with the message. |
| guide.situations.opened | I opened the link. |
| guide.situations.password | I entered my password. |
| guide.situations.payment | I shared payment information. |
| guide.situations.code | I shared a verification code. |
| guide.checklists.none.0 | Pause before replying, opening links or making a payment. |
| guide.checklists.none.1 | Verify the request using a familiar app or a contact you already know. Do not use the message’s links or contact details. |
| guide.checklists.none.2 | Ask someone you trust if you are unsure. |
| guide.checklists.opened.0 | Close the page. Do not enter information, download files or install anything it suggests. Clicking alone does not tell us what happened. |
| guide.checklists.opened.1 | If you also shared information, choose the matching situation above. |
| guide.checklists.opened.2 | If you downloaded or installed something, update your device’s security software and run a scan. Ask someone you trust for help. |
| guide.checklists.opened.3 | Verify the request through a familiar independent channel. |
| guide.checklists.password.0 | Open the official service through a familiar app or address, without using the message. |
| guide.checklists.password.1 | Change the affected password. Change it on other accounts where you reused it. |
| guide.checklists.password.2 | Turn on two-factor authentication if the service offers it. |
| guide.checklists.password.3 | Review account activity and contact official support if you cannot access the account or see unfamiliar changes. |
| guide.checklists.payment.0 | Contact your bank or payment provider promptly through its official app or the number on your card. |
| guide.checklists.payment.1 | Explain that your payment information may have been exposed and ask about securing the account or disputing a payment. Recovery is not guaranteed. |
| guide.checklists.payment.2 | Review recent transactions with the provider and follow its instructions. Do not share more information with the message’s sender. |
| guide.checklists.code.0 | Stop sharing codes and close the page. A code may allow account access or authorize a payment. |
| guide.checklists.code.1 | Contact the affected service through a familiar official channel. If a bank or payment was involved, contact the bank promptly. |
| guide.checklists.code.2 | Secure the affected account through its official app or address: change the password and review active sessions if available. |
| guide.checklists.code.3 | Check recent account activity with official support. Do not approve unexpected login or payment requests. |
| hero | Not sure about a message? |
| home | Home |
| behind | Behind the AI |
| inputMethod | Input method |
| paste | Paste a message |
| screenshot | Upload a screenshot |
| scan.title | Read a screenshot |
| scan.drop | Drop one screenshot here, or choose a file. |
| scan.formats | PNG or JPEG · up to 10 MB and 12 megapixels · English text |
| scan.choose | Choose screenshot |
| scan.replace | Choose another screenshot |
| scan.privacy | The image stays in your browser. Only confirmed text is sent. Remove passwords and codes. |
| scan.initializing | Preparing local text recognition… |
| scan.reading | Reading text in your browser… |
| scan.ready | Text extracted. Review it below before checking. |
| scan.cancel | Cancel text recognition |
| scan.fallback | Paste a message instead |
| scan.review | Review the extracted text |
| scan.instruction | Make sure the text is correct before checking the message. OCR can miss or misread words. |
| scan.confirm | I reviewed this text and removed sensitive details. |
| scan.confirmationError | Review and confirm the extracted text first. Analysis was not performed. |
| scan.errors.empty | This file is empty. Choose a PNG or JPEG screenshot, or paste the message. |
| scan.errors.format | Choose one actual PNG or JPEG image. Other formats are not supported. |
| scan.errors.bytes | This image exceeds 10 MB. Choose a smaller screenshot, or paste the message. |
| scan.errors.pixels | This image exceeds the supported dimensions. Use up to 12 megapixels and 16,384 pixels per side. |
| scan.errors.corrupt | We could not read this image. Choose another PNG or JPEG, or paste the message. |
| scan.errors.initialization | Local text recognition could not start. Try another image, or paste the message. |
| scan.errors.processing | Text recognition did not complete. Try a clearer screenshot, or paste the message. |
| scan.errors.unreadable | No readable text was found. Try a clearer screenshot, or paste the message. |
| scan.errors.cancelled | Text recognition was cancelled. No analysis was performed. |
| prototypeLabel | EVOHACKS 2026 prototype |
| languageHint | Choose the message’s language. Accuracy is unverified. |
| intro | Paste a message or upload a screenshot. We'll help you understand the warning signs and what you can do next. |
| stage | Development version · Performance is unverified for individual languages; checks remain limited. |
| textLabel | Message text |
| placeholder | Paste the message here… |
| privacy | Remove passwords and codes. Text is sent to our server, processed in memory, and not saved, logged or used for training. |
| limit | Up to 2,000 characters. No automatic shortening. |
| languageLabel | Message language |
| languages.auto | Not specified |
| languages.en | English |
| languages.cs | Czech |
| languages.other | Other language |
| submit | Check message |
| pending | Checking… |
| resultDetail | This output does not verify the sender or the claims and does not establish message safety. Check the claims through a familiar independent channel. |
| headlines.model_not_ready | The model is not ready yet. |
| headlines.review_required | We couldn't check this fully. |
| headlines.suspicious_signals | This message looks suspicious. |
| headlines.no_strong_signals | We found no strong warning signals. |
| statusLabels.suspicious | Suspicious message |
| statusLabels.review | Check this another way |
| statusLabels.no_strong_signals | No strong warning signs found |
| notPerformed | Analysis not performed |
| evidence.request_for_secret | Observed textual signal: a request to disclose a password or verification code. |
| evidence.payment_pressure | Observed textual signal: a request for an immediate payment or transfer. |
| evidence.secrecy_request | Observed textual signal: a request to conceal something from family or another trusted person. |
| evidence.model_signal | The experimental model found a concerning message pattern. This does not prove fraud or explain particular words. |
| reasons | What caught our attention? |
| noEvidence | We have no specific textual evidence of fraud. A low or uncertain finding does not establish safety. |
| incomplete | Limited check. |
| complete | Check complete. |
| help | Ask someone for help |
| helpPreview | Help request preview |
| helpNotice | No message text or personal details are included. You choose who receives this. |
| share | Share help request |
| shareUnavailable | Sharing could not be opened. You can copy the draft manually; nothing was sent automatically. |
| copyHelp | Copy help request |
| copying | Copying… |
| copied | Copied |
| copyUnavailable | Copying did not complete. Select the preview text and copy it manually. |
| sharing | Opening sharing… |
| shareCancelled | Sharing cancelled. You can still copy the preview manually. |
| helpTemplates.analysis_not_completed | The automated check was limited and does not establish message safety. |
| helpTemplates.help_verify_independently | I received a message I need to verify. Could you please help me check its claims through a familiar independent channel? I do not want to use the contact or link from the message. |
| steps | What you can do |
| limitationsLabel | Limits of this version |
| footer | Understand messages. Make safer decisions. |
| errors.empty | Please paste a message first. Analysis was not performed. |
| errors.too_long | The text exceeds 2,000 characters. Analysis was not performed. Paste one shorter message. |
| errors.invalid_input | The input could not be accepted. Analysis was not performed. Check the length and paste the text again. |
| errors.unavailable | The service did not respond correctly. Analysis was not performed. Try later or verify the message through another channel. |
| actions.verify_independently | Check using an official app or a contact you know. Avoid the message’s links. |
| actions.do_not_send_secrets | Do not share passwords or verification codes. |
| actions.pause_payment | Pause payment until you verify the request. |
| actions.ask_trusted_person | If you are unsure, ask someone you trust for help. |
| limitations.model_not_ready | The model is not ready; the model part of analysis was not performed. |
| limitations.human_review_incomplete | Training-label review is incomplete; the model uses original labels. |
| limitations.rules_only | Only a limited check of known textual rules was available. |
| limitations.insufficient_text | The text is too short for model assessment. |
| limitations.language_unspecified | Message language is not specified. Interface language does not determine it. |
| limitations.policy_not_validated | Thresholds for a completed low finding are unvalidated; this version cannot issue one. |
| limitations.language_not_evaluated | Performance has not been evaluated in Czech, English or any other language. |
| limitations.not_a_safety_confirmation | This check cannot confirm safety. |
| limitations.inference_unavailable | The model could not complete analysis. |
| limitations.incomplete_coverage | The full text was not assessed. |
