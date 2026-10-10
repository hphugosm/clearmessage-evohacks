import type { AnalyzeResponse, ClientErrorKey } from './api';

export type UiLanguage = 'cs' | 'en';
type Copy = {
  tagline: string; title: string; intro: string; stage: string;
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

export const copy: Record<UiLanguage, Copy> = {
  cs: {
    tagline: 'Pomoc s nejasnými zprávami',
    title: 'Přišla vám zpráva, kterou si nejste jistí?',
    intro: 'Vložte krátkou SMS, chat nebo e-mail. Pomůžeme vám zorientovat se v dalším kroku.',
    stage: 'Vývojová verze · Vlastní model má nedokončený audit. Výkon není ověřen pro jednotlivé jazyky; kontrola zůstává omezená.',
    textLabel: 'Text zprávy',
    placeholder: 'Sem vložte zprávu…',
    privacy: 'Nevkládejte hesla ani ověřovací kódy. Text odešleme našemu backendu, kde zůstane jen v paměti během požadavku. Aplikace jej neukládá, neloguje ani nepoužívá k trénování.',
    limit: 'Maximálně 2 000 znaků. Delší text se automaticky nezkracuje.',
    languageLabel: 'Jazyk zprávy',
    languages: { auto: 'Nezadáno', cs: 'Čeština', en: 'Angličtina', other: 'Jiný jazyk' },
    submit: 'Zkontrolovat zprávu', pending: 'Odesíláme…',
    resultDetail: 'Tento výstup neověřuje odesílatele ani pravdivost zprávy a nepotvrzuje její bezpečnost. Ověřte tvrzení jinou známou cestou.',
    headlines: { model_not_ready: 'Model zatím není připraven.', review_required: 'Zpráva potřebuje další ověření.', suspicious_signals: 'Ve zprávě jsou varovné signály.', no_strong_signals: 'Nenašli jsme silné varovné signály.' },
    evidence: {
      request_for_secret: 'Pozorovaný signál v textu: žádost o sdělení hesla nebo ověřovacího kódu.',
      payment_pressure: 'Pozorovaný signál v textu: požadavek na okamžitou platbu nebo převod.',
      secrecy_request: 'Pozorovaný signál v textu: požadavek něco zatajit před blízkými či jinou důvěryhodnou osobou.',
      model_signal: 'Provizorní klasifikátor označil text jako podobný tréninkové třídě smishing. Nedokáže tím prokázat podvod ani vysvětlit konkrétní slova.',
    },
    reasons: 'Na čem výstup stojí', noEvidence: 'Nemáme konkrétní textový důkaz podvodu. Nízký nebo nejistý nález nepotvrzuje bezpečnost.',
    incomplete: 'Omezená kontrola · analýza není úplná', complete: 'Analýza dokončena · bezpečnost nepotvrzena',
    help: 'Připravit prosbu o pomoc', helpPreview: 'Náhled prosby o pomoc',
    helpNotice: 'Návrh obsahuje jen neutrální pevné věty, bez původní zprávy a osobních údajů. Text můžete ručně zkopírovat. O příjemci a odeslání rozhodujete vy.',
    share: 'Vybrat příjemce a sdílet návrh', shareUnavailable: 'Sdílení se nepodařilo otevřít. Návrh můžete ručně zkopírovat; nic nebylo automaticky odesláno.',
    clicked: 'Už jsem klikl/a', clickedAdvice: [
      'Zastavte další kroky. Zavřete stránku, nic dalšího nevyplňujte ani nestahujte. Kliknutí samo neurčuje, co se stalo.',
      'Pokud jste zadali heslo, změňte je přes známou aplikaci nebo adresu. Pokud jste poslali peníze či bankovní údaje, kontaktujte banku známou cestou. Sem žádné údaje nevkládejte.',
      'Pokud jste něco stáhli nebo nainstalovali, požádejte důvěryhodnou osobu o pomoc s aktualizací a kontrolou zařízení. Tato aplikace zařízení nekontroluje.',
    ],
    steps: 'Jak můžete postupovat', limitationsLabel: 'Omezení této verze',
    footer: 'Klidná zpráva neověřuje odesílatele ani odkazy. O žádném textu nepotvrzuje, že je bezpečný.',
    errors: {
      empty: 'Nejdřív vložte text zprávy. Kontrola neproběhla.',
      too_long: 'Text má více než 2 000 znaků. Kontrola neproběhla. Vložte jednu kratší zprávu.',
      invalid_input: 'Vstup se nepodařilo přijmout. Kontrola neproběhla. Zkontrolujte délku a vložte text znovu.',
      unavailable: 'Služba neodpověděla správně. Kontrola neproběhla. Zkuste to později nebo zprávu ověřte jinou cestou.',
    },
    actions: {
      verify_independently: 'Ověřte tvrzení známou cestou. Použijte kontakt, který už znáte, místo kontaktu nebo odkazu ve zprávě.',
      do_not_send_secrets: 'Nesdělujte hesla ani ověřovací kódy.',
      pause_payment: 'Zastavte platbu nebo převod, dokud požadavek neověříte nezávislou známou cestou.',
      ask_trusted_person: 'Pokud si nejste jistí, požádejte o pomoc někoho, komu důvěřujete.',
    },
    limitations: {
      model_not_ready: 'Model není připraven; modelová část analýzy neproběhla.',
      human_review_incomplete: 'Audit tréninkových labelů není dokončen; model používá původní labely.',
      rules_only: 'Fungovala pouze omezená kontrola známých textových pravidel.',
      insufficient_text: 'Text je příliš krátký pro modelové posouzení.',
      language_unspecified: 'Jazyk zprávy není zadán. Jazyk rozhraní jej neurčuje.',
      policy_not_validated: 'Prahy pro dokončený nízký nález nejsou ověřeny; tato verze jej nemůže vydat.',
      language_not_evaluated: 'Výkon nebyl ověřen v češtině, angličtině ani dalších jazycích.',
      not_a_safety_confirmation: 'Tento výstup nepotvrzuje bezpečnost zprávy.',
      inference_unavailable: 'Model nemohl dokončit analýzu.',
      incomplete_coverage: 'Nebyl posouzen celý text.',
    },
  },
  en: {
    tagline: 'Help with uncertain messages',
    title: 'Received a message you are unsure about?',
    intro: 'Paste a short text message, chat or email. We will help you consider your next step.',
    stage: 'Development version · Our model has an incomplete audit. Performance is unverified for individual languages; checks remain limited.',
    textLabel: 'Message text', placeholder: 'Paste the message here…',
    privacy: 'Do not paste passwords or verification codes. Text is sent to our backend and stays in memory during the request. The application does not store it, log it or use it for training.',
    limit: 'Maximum 2,000 characters. Longer text is never automatically shortened.',
    languageLabel: 'Message language',
    languages: { auto: 'Not specified', cs: 'Czech', en: 'English', other: 'Other language' },
    submit: 'Check message', pending: 'Sending…',
    resultDetail: 'This output does not verify the sender or the claims and does not establish message safety. Check the claims through a familiar independent channel.',
    headlines: { model_not_ready: 'The model is not ready yet.', review_required: 'This message needs further verification.', suspicious_signals: 'There are warning signals in this message.', no_strong_signals: 'We found no strong warning signals.' },
    evidence: {
      request_for_secret: 'Observed textual signal: a request to disclose a password or verification code.',
      payment_pressure: 'Observed textual signal: a request for an immediate payment or transfer.',
      secrecy_request: 'Observed textual signal: a request to conceal something from family or another trusted person.',
      model_signal: 'The provisional classifier found similarity to its training class smishing. This does not prove fraud or explain particular words.',
    },
    reasons: 'What the result is based on', noEvidence: 'We have no specific textual evidence of fraud. A low or uncertain finding does not establish safety.',
    incomplete: 'Limited check · analysis is incomplete', complete: 'Analysis completed · safety not established',
    help: 'Prepare a request for help', helpPreview: 'Preview your request for help',
    helpNotice: 'The draft contains only fixed neutral sentences, without your source message or personal details. You can copy it manually. You choose the recipient and whether to send.',
    share: 'Choose a recipient and share the draft', shareUnavailable: 'Sharing could not be opened. You can copy the draft manually; nothing was sent automatically.',
    clicked: 'I already clicked', clickedAdvice: [
      'Stop further steps. Close the page; do not enter more information or download anything. Clicking alone does not tell us what happened.',
      'If you entered a password, change it through a familiar app or address. If you sent money or banking details, contact your bank through a familiar channel. Do not enter any of those details here.',
      'If you downloaded or installed something, ask a trusted person to help update and check your device. This application does not inspect devices.',
    ],
    steps: 'What you can do', limitationsLabel: 'Limits of this version',
    footer: 'Klidná zpráva does not verify senders or links. It never confirms that a message is safe.',
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
  },
};
