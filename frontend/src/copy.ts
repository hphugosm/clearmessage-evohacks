import type { AnalyzeResponse, ClientErrorKey } from './api';

export type UiLanguage = 'cs' | 'en';
type Copy = {
  tagline: string; title: string; intro: string; stage: string;
  textLabel: string; placeholder: string; privacy: string; limit: string;
  languageLabel: string; languages: Record<'auto' | 'cs' | 'en' | 'other', string>;
  submit: string; pending: string; resultLabel: string; headline: string;
  resultDetail: string; steps: string; limitationsLabel: string; footer: string;
  errors: Record<ClientErrorKey, string>;
  actions: Record<AnalyzeResponse['action_keys'][number], string>;
  limitations: Record<AnalyzeResponse['limitations'][number], string>;
};

export const copy: Record<UiLanguage, Copy> = {
  cs: {
    tagline: 'Pomoc s nejasnými zprávami',
    title: 'Přišla vám zpráva, kterou si nejste jistí?',
    intro: 'Vložte krátkou SMS, chat nebo e-mail. Pomůžeme vám zorientovat se v dalším kroku.',
    stage: 'Vývojová verze · Model zatím není připraven. Kontrola zprávy se zatím neprovádí.',
    textLabel: 'Text zprávy',
    placeholder: 'Sem vložte zprávu…',
    privacy: 'Nevkládejte hesla ani ověřovací kódy. Text odešleme našemu backendu, kde zůstane jen v paměti během požadavku. Aplikace jej neukládá, neloguje ani nepoužívá k trénování.',
    limit: 'Maximálně 2 000 znaků. Delší text se automaticky nezkracuje.',
    languageLabel: 'Jazyk zprávy',
    languages: { auto: 'Nezadáno', cs: 'Čeština', en: 'Angličtina', other: 'Jiný jazyk' },
    submit: 'Zkontrolovat zprávu', pending: 'Odesíláme…',
    resultLabel: 'Kontrola neprovedena', headline: 'Model zatím není připraven.',
    resultDetail: 'Tuto zprávu jsme neposoudili. Výsledek nepotvrzuje její bezpečnost. Ověřte ji jinou cestou.',
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
      ask_trusted_person: 'Pokud si nejste jistí, požádejte o pomoc někoho, komu důvěřujete.',
    },
    limitations: {
      model_not_ready: 'Model není připraven; analýza textu neproběhla.',
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
    stage: 'Development version · The model is not ready. Message analysis is not performed yet.',
    textLabel: 'Message text', placeholder: 'Paste the message here…',
    privacy: 'Do not paste passwords or verification codes. Text is sent to our backend and stays in memory during the request. The application does not store it, log it or use it for training.',
    limit: 'Maximum 2,000 characters. Longer text is never automatically shortened.',
    languageLabel: 'Message language',
    languages: { auto: 'Not specified', cs: 'Czech', en: 'English', other: 'Other language' },
    submit: 'Check message', pending: 'Sending…',
    resultLabel: 'Analysis not performed', headline: 'The model is not ready yet.',
    resultDetail: 'We have not assessed this message. This result does not establish its safety. Verify it through another channel.',
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
      ask_trusted_person: 'If you are unsure, ask someone you trust for help.',
    },
    limitations: {
      model_not_ready: 'The model is not ready; text analysis was not performed.',
      language_not_evaluated: 'Performance has not been evaluated in Czech, English or any other language.',
      not_a_safety_confirmation: 'This output does not establish message safety.',
      inference_unavailable: 'The model could not complete analysis.',
      incomplete_coverage: 'The full text was not assessed.',
    },
  },
};
